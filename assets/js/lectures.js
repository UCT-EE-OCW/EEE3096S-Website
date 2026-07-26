/*
 * lectures.js — Lectures page behaviour (loaded only on lectures.html)
 *
 *  1. Cover thumbnails: renders page 1 of each slide-deck PDF into its
 *     <canvas data-pdf="..."> using pdf.js, lazily (only when scrolled near
 *     view) and with range requests so only a slice of each PDF is fetched.
 *     If a deck fails to render, a generic file icon is shown instead.
 *
 *  2. Download-all: each ".download-all" button bundles every file in its
 *     enclosing week/module (slide PDFs + additional resources) into a single
 *     zip with JSZip and triggers a download — no hard-coded file lists.
 *
 * Requires (loaded before this file): pdf.min.js, jszip.min.js.
 * The page must be served over HTTP (fetch/pdf.js do not work from file://).
 */
(function () {
	"use strict";

	/* ---------------------------------------------------------------- *
	 * 1. Cover-page thumbnails (pdf.js)
	 * ---------------------------------------------------------------- */
	var hasPdfJs = typeof window.pdfjsLib !== "undefined";
	if (hasPdfJs) {
		pdfjsLib.GlobalWorkerOptions.workerSrc = "assets/js/pdf.worker.min.js";
	}

	function showFallback(canvas) {
		var holder = document.createElement("div");
		holder.className = "slide-fallback";
		holder.setAttribute("aria-hidden", "true");
		holder.innerHTML =
			'<svg viewBox="0 0 48 48" width="40" height="40" role="img" aria-label="PDF">' +
			'<path fill="currentColor" d="M12 2h16l10 10v30a2 2 0 0 1-2 2H12a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z"/>' +
			'<path fill="rgba(0,0,0,0.18)" d="M28 2l10 10H30a2 2 0 0 1-2-2V2z"/>' +
			'<text x="24" y="34" text-anchor="middle" font-family="sans-serif" font-size="9" font-weight="700" fill="#fff">PDF</text>' +
			"</svg>";
		if (canvas.parentNode) {
			canvas.parentNode.replaceChild(holder, canvas);
		}
	}

	function renderThumb(canvas) {
		var url = canvas.getAttribute("data-pdf");
		if (!hasPdfJs || !url) {
			showFallback(canvas);
			return;
		}
		var task = pdfjsLib.getDocument({
			url: url,
			disableAutoFetch: true, // don't pre-download the whole file...
			disableStream: true     // ...just range-fetch what page 1 needs
		});
		task.promise
			.then(function (pdf) {
				return pdf.getPage(1);
			})
			.then(function (page) {
				var dpr = Math.min(window.devicePixelRatio || 1, 2);
				var targetW = (canvas.parentElement.clientWidth || 240) * dpr;
				var base = page.getViewport({ scale: 1 });
				var scale = targetW / base.width;
				var viewport = page.getViewport({ scale: scale });
				canvas.width = Math.floor(viewport.width);
				canvas.height = Math.floor(viewport.height);
				return page.render({
					canvasContext: canvas.getContext("2d"),
					viewport: viewport
				}).promise;
			})
			.then(function () {
				canvas.classList.add("rendered");
			})
			.catch(function () {
				showFallback(canvas);
			});
	}

	function initThumbnails() {
		var canvases = Array.prototype.slice.call(
			document.querySelectorAll("canvas[data-pdf]")
		);
		if (!canvases.length) return;

		if (!hasPdfJs || !("IntersectionObserver" in window)) {
			// No lazy support / no pdf.js: render everything (or fall back).
			canvases.forEach(renderThumb);
			return;
		}

		var observer = new IntersectionObserver(
			function (entries, obs) {
				entries.forEach(function (entry) {
					if (entry.isIntersecting) {
						obs.unobserve(entry.target);
						renderThumb(entry.target);
					}
				});
			},
			{ rootMargin: "300px 0px" }
		);
		canvases.forEach(function (c) {
			observer.observe(c);
		});
	}

	/* ---------------------------------------------------------------- *
	 * 2. Download-all (JSZip)
	 * ---------------------------------------------------------------- */
	var CONTENT_MARKER = "/lecture%20content/";

	// Return the path of a file within a zip, given the scope being zipped.
	//  - week scope   -> just the filename
	//  - module scope -> "<Week>/<filename>" (avoids collisions, adds structure)
	function zipEntryName(url, scopeIsModule) {
		var rel;
		var i = url.indexOf(CONTENT_MARKER);
		if (i >= 0) {
			rel = url.slice(i + CONTENT_MARKER.length); // Module/Week/file
			var parts = rel.split("/");
			if (scopeIsModule) {
				parts.shift(); // drop the module segment -> Week/file
			} else {
				parts = parts.slice(-1); // just the filename
			}
			rel = parts.join("/");
		} else {
			rel = url.split("/").pop();
		}
		return decodeURIComponent(rel);
	}

	function triggerDownload(blob, filename) {
		var a = document.createElement("a");
		var objectUrl = URL.createObjectURL(blob);
		a.href = objectUrl;
		a.download = filename;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		setTimeout(function () {
			URL.revokeObjectURL(objectUrl);
		}, 1000);
	}

	function collectLinks(scope) {
		return Array.prototype.slice.call(
			scope.querySelectorAll(".slides a[href], .resources a[href]")
		);
	}

	function downloadAll(button) {
		if (typeof window.JSZip === "undefined") {
			window.alert("Zip library failed to load — please try again.");
			return;
		}
		var moduleScope = button.closest(".lecture-module");
		var weekScope = button.closest(".lecture-week");
		var scopeIsModule = !weekScope || button.getAttribute("data-scope") === "module";
		var scope = scopeIsModule ? moduleScope : weekScope;
		if (!scope) return;

		var links = collectLinks(scope);
		if (!links.length) return;

		var zipName = (button.getAttribute("data-zipname") || "lecture-content") + ".zip";
		var original = button.innerHTML;
		button.disabled = true;
		button.classList.add("is-busy");
		button.innerHTML = "Preparing…";

		var zip = new JSZip();
		var used = {};

		var chain = Promise.resolve();
		links.forEach(function (a) {
			chain = chain.then(function () {
				return fetch(a.href).then(function (resp) {
					if (!resp.ok) throw new Error("Failed to fetch " + a.href);
					return resp.blob();
				}).then(function (blob) {
					var name = zipEntryName(a.href, scopeIsModule);
					if (used[name]) {
						// De-duplicate identical names within a zip.
						var dot = name.lastIndexOf(".");
						var stem = dot > 0 ? name.slice(0, dot) : name;
						var ext = dot > 0 ? name.slice(dot) : "";
						name = stem + " (" + (++used[stem]) + ")" + ext;
					} else {
						used[name] = 1;
						used[name.replace(/\.[^.]+$/, "")] = 1;
					}
					zip.file(name, blob);
				});
			});
		});

		chain
			.then(function () {
				return zip.generateAsync({ type: "blob" }, function (meta) {
					button.innerHTML = "Zipping " + Math.round(meta.percent) + "%";
				});
			})
			.then(function (blob) {
				triggerDownload(blob, zipName);
				button.disabled = false;
				button.classList.remove("is-busy");
				button.innerHTML = original;
			})
			.catch(function (err) {
				button.disabled = false;
				button.classList.remove("is-busy");
				button.innerHTML = original;
				window.alert("Sorry, the download could not be prepared.\n" + err.message);
			});
	}

	function initDownloads() {
		document.querySelectorAll(".download-all").forEach(function (button) {
			button.addEventListener("click", function () {
				downloadAll(button);
			});
		});
	}

	/* ---------------------------------------------------------------- */
	function init() {
		initThumbnails();
		initDownloads();
	}
	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", init);
	} else {
		init();
	}
})();
