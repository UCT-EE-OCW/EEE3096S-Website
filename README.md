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
| Lectures            | `lectures.html`      | Lecture slides and notes.                                          |
| Practicals          | `practicals.html`    | Practical/assignment briefs.                                       |
| Announcements       | `announcements.html` | Full, chronological list of all announcements.            |
| Links               | `links.html`         | External resources (eeWiki, OCW, etc.).                           |
| Archive             | `archive.html`       | Formula sheet plus downloadable past exams and class tests.       |


## Project structure

```
.
├── *.html              # The six site pages (see table above)
├── announcements/      # Announcement content + manifest (see "Announcements")
│   ├── announcements.json
│   └── Announcement_00X.md
├── resources/          # Lecture slides, course handouts, and PDFs
│   └── past-papers/    # Past exams, class tests, and the formula sheet
├── images/             # Site imagery (banners, link thumbnails)
└── assets/
    ├── css/            # Compiled stylesheet (main.css) — do not edit by hand
    ├── sass/           # SASS source for main.css — edit here
    ├── js/             # jQuery + template scripts, plus marked.min.js for Markdown
    └── webfonts/       # Font Awesome icon fonts
```


## Running locally

The announcement panels load Markdown files at runtime with `fetch()`, which browsers
block over the `file://` protocol. Opening `index.html` directly will therefore show
empty announcements. Serve the folder over HTTP instead:

```sh
# from the project root
python3 -m http.server 8000
```

Then browse to <http://localhost:8000>. Any static file server works.




## License

The site design is adapted from the Arcana template by HTML5 UP, released under the
[Creative Commons Attribution 3.0](http://creativecommons.org/licenses/by/3.0/) license
(see `LICENSE.txt`). Unless otherwise noted, the course content on this site is licensed
under [Creative Commons Attribution-ShareAlike 4.0 International](http://creativecommons.org/licenses/by-sa/4.0/).