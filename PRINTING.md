# Printing and PDF export

The generated deck has two browser print paths. `_includes/head.html` selects
a print stylesheet from the URL query, while reveal.js prepares the slides for
the PDF-specific path.

| URL | Intended output | Current status |
| --- | --- | --- |
| `/` | Readable paper handout | Available |
| `/?print-pdf` | One presentation slide per PDF page | Blocked by an asset-path mismatch |

## Print a paper handout

1. Start the site with `./script/server`.
2. Open `http://127.0.0.1:4000/` without `print-pdf` in the query string.
3. Open the browser print dialog.

The page loads `node_modules/reveal.js/css/print/paper.css`. That stylesheet
prints every slide in document order, puts a page break after each slide, and
makes all fragments visible. Speaker notes remain hidden by `reveal.css`.

Print the root deck rather than an individual post URL. The root page contains
all slide sections and initializes reveal.js; standalone post pages do not.
`_layouts/print.html` is not selected by any current page and is not an export
entry point.

## PDF export status

Reveal.js 3.9.2 expects `/?print-pdf` to load its PDF stylesheet and enter PDF
layout mode. The repository tracks that stylesheet at:

```text
node_modules/reveal.js/css/print/pdf.css
```

However, `_includes/head.html` currently requests `css/print/pdf.css`, which
does not exist in this repository. The JavaScript still detects
`print-pdf`, but the missing stylesheet means the resulting pagination and
layout are not a supported export. Confirm the failed stylesheet request in
the browser network panel before investigating slide content or print
settings.

When the template path is repaired, keep it prefixed with `site.baseurl`, as
the core reveal.js stylesheet and script references are. This is required for
project sites served below a repository path.

## Verify a PDF-path change

Use Chrome or Chromium, as required by the vendored reveal.js 3.9.2 export
workflow:

1. Start `./script/server` and open
   `http://127.0.0.1:4000/?print-pdf`.
2. Confirm that `node_modules/reveal.js/css/print/pdf.css` returns HTTP 200.
3. Open the print dialog and select **Save as PDF**, **Landscape**, no margins,
   and background graphics.
4. Check long slides, backgrounds, code blocks, and fragments in the preview.

Fragments produce incremental PDF pages by default because reveal.js sets
`pdfSeparateFragments: true`. To print all fragments on one page, set that
runtime option to `false` in `_includes/script.html`.

PDF dimensions also come from the active `Reveal.initialize(...)` options.
The `width` and `height` values under the legacy `reveal` block in
`_config.yml` are not loaded; the current runtime therefore uses the reveal.js
3.9.2 defaults of 960 by 700 pixels.

Append `&showNotes=true` to include speaker notes after the PDF stylesheet
path works:

```text
http://127.0.0.1:4000/?print-pdf&showNotes=true
```

The implementation details and browser constraints are also recorded in the
vendored [reveal.js PDF export reference](node_modules/reveal.js/README.md#pdf-export).
