# EEE3096S – Embedded Systems II Course Website

A static course website for **EEE3096S (Embedded Systems II)** at the University of
Cape Town, published as part of the [UCT EE Open CourseWare](https://github.com/UCT-EE-OCW)
initiative. It hosts lecture slides, practicals, announcements, useful links, and an
archive of past exams and class tests.

The site is built on the [Arcana](https://html5up.net) template by HTML5 UP and is a
plain HTML/CSS/JavaScript site with no server-side code.


## Pages

| Page                | File                 | Purpose                                                            |
| ------------------- | -------------------- | ------------------------------------------------------------------ |
| Home                | `index.html`         | Landing page with a welcome panel and the three latest announcements. |
| Lectures            | `lectures.html`      | Lecture slides and resources, by module and week (see "Lectures page"). |
| Practicals          | `practicals.html`    | Practical/assignment briefs.                                       |
| Announcements       | `announcements.html` | Full, chronological list of all announcements.            |
| Resources           | `resources.html`     | External links, board documentation, and ARM assembly references. |
| Archive             | `archive.html`       | Formula sheet plus downloadable past exams and class tests.       |


## Project structure

```
.
├── *.html              # The six site pages (see table above)
├── announcements/      # Announcement content + manifest (see "Announcements")
│   ├── announcements.json
│   └── Announcement_00X.md
├── resources/          # Course handouts and PDFs
│   ├── lecture content/    # Lecture material: ModuleN - Name / W# / files (drives lectures.html)
│   ├── hardware documentation/ # STM32 / ARM datasheets and manuals (linked from resources.html)
│   └── past-papers/    # Past exams, class tests, and the formula sheet
├── images/             # Site imagery (banners, link thumbnails)
└── assets/
    ├── css/            # Compiled stylesheet (main.css) — do not edit by hand
    ├── sass/           # SASS source for main.css — edit here
    ├── js/             # jQuery + template scripts, marked.min.js (Markdown),
    │                   #   pdf.min.js + pdf.worker.min.js (slide thumbnails),
    │                   #   jszip.min.js + lectures.js (download-all)
    └── webfonts/       # Font Awesome icon fonts
```


## Running locally

Several features load files at runtime with `fetch()` / pdf.js (the announcement panels,
and the lecture thumbnails and download-all buttons), which browsers block over the
`file://` protocol. Opening the pages directly will therefore show empty announcements
and blank lecture thumbnails. Serve the folder over HTTP instead:

```sh
# from the project root
python3 -m http.server 8000
```

Then browse to <http://localhost:8000>. Any static file server works. The production
deploy (GitHub Pages) serves over HTTP, so these features work there too.


## Lectures page

`lectures.html` presents the lecture material in `resources/lecture content/`, which is
organised **module → week → files** (e.g. `Module1 - Embedded Systems/W1/…`). Each week
shows the lecture **slide decks** as cover-page thumbnails (click to download the PDF)
followed by a list of **additional resources** (exercises, pracs, datasheets, code).
Each week and module also has a **Download** button that bundles its files into a zip.

How it works (all client-side, no build step):

- **Thumbnails** are rendered from the first page of each slide PDF by
  [pdf.js](https://mozilla.github.io/pdf.js/) (`assets/js/pdf.min.js` +
  `pdf.worker.min.js`), lazily and via HTTP range requests.
- **Download-all** is built in the browser by [JSZip](https://stuk.github.io/jszip/)
  (`assets/js/jszip.min.js`); the logic lives in `assets/js/lectures.js`, which simply
  collects every link inside a week/module — no hard-coded file lists.

**To add or change lecture material:** drop the file into the correct
`Module/Week` folder, then edit `lectures.html` — add a slide card (an `<a class="slide">`
wrapping a `<canvas data-pdf="…">`) or a `<li>` under that week's resources. Percent-encode
spaces (`%20`), `&` (`%26`) and `+` (`%2B`) in the paths, matching the existing entries.
The download buttons and thumbnails pick up new entries automatically.


## License

The site design is adapted from the Arcana template by HTML5 UP, released under the
[Creative Commons Attribution 3.0](http://creativecommons.org/licenses/by/3.0/) license
(see `LICENSE.txt`). Unless otherwise noted, the course content on this site is licensed
under [Creative Commons Attribution-ShareAlike 4.0 International](http://creativecommons.org/licenses/by-sa/4.0/).