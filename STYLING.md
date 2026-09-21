# Styling the slideshow

The slideshow uses reveal.js 3.9.2 styles that are committed under
`node_modules/reveal.js/`. Jekyll does not select or compile a presentation
theme from `_config.yml`; the active stylesheets are linked directly from
`_includes/head.html`.

## Active style pipeline

Every layout includes `_includes/head.html`, so the same stylesheet stack is
used by the root deck, individual post pages, and the otherwise-unused print
layout:

1. `css/reset.css` and `css/reveal.css` provide reveal.js structure.
2. `css/theme/moon.css` provides the presentation colors and typography.
3. `lib/css/monokai.css` colors code highlighted by the reveal.js highlight
   plugin loaded in `_includes/script.html`.
4. The print script appends either `css/print/paper.css` or a PDF stylesheet
   after the links above.

`reveal.css` is currently linked twice. Keep any custom stylesheet after the
theme link so equal-specificity rules override the bundled theme predictably.

### Settings that do not select the theme

- `solarized.theme` in `_config.yml` only becomes a class on the root `<html>`
  element of `_layouts/presentation.html`. The bundled styles do not contain
  `html.dark` or `html.light` selectors, and the setting is not read by the
  other layouts.
- `highlighter: rouge` controls Jekyll's Markdown rendering. It does not choose
  the browser-side code color scheme; that is the Monokai link in
  `_includes/head.html`.
- The `reveal` block in `_config.yml` is not passed to `Reveal.initialize`.

## Change the bundled theme

Reveal.js includes these ready-to-use theme files:

```text
beige  black  blood  league  moon  night  serif  simple
sky    solarized  white
```

Change the theme filename in `_includes/head.html`:

```html
<link rel="stylesheet" href="{{site.baseurl}}/node_modules/reveal.js/css/theme/white.css">
```

Do not change only `solarized.theme`; it does not alter the linked stylesheet.
Keep the `site.baseurl` prefix so assets work when GitHub Pages publishes the
site below a repository path.

## Add project-specific styles

Prefer a separate stylesheet over editing vendored reveal.js files. For
example, create `assets/slideshow.css` and link it last in
`_includes/head.html`, after Monokai:

```html
<link rel="stylesheet" href="{{site.baseurl}}/assets/slideshow.css">
```

Scope rules below `.reveal` to avoid affecting the document outside the deck:

```css
.reveal .slides section.callout {
  border-left: 0.25rem solid #2aa198;
  padding-left: 1rem;
  text-align: left;
}

.reveal .slides section.callout h1 {
  text-transform: none;
}
```

Apply the class through slide front matter:

```yaml
---
layout: slide
title: "Operational warning"
classes:
  - callout
---
```

`_includes/slide.html` copies each `classes` item to the generated `<section>`.
When the list is non-empty, it replaces the default `slide` class rather than
adding to it. Include `slide` explicitly if custom CSS depends on that class:

```yaml
classes:
  - slide
  - callout
```

## Verification

After changing styles:

1. Run `script/server` and open the root deck.
2. Check a standalone post URL such as `/welcome-to-our-slide-deck`; standalone
   pages use `_layouts/slide.html` and do not initialize reveal.js plugins.
3. Check narrow and wide viewports, long headings, links, lists, images, and
   fenced code.
4. Open the browser's print preview. Print CSS loads after the theme and may
   override screen-only rules.
5. Preview with the production base path when publishing as a project site:

   ```sh
   bundle exec jekyll serve --baseurl "/github-slideshow"
   ```

If a rule has no effect, inspect stylesheet order and selector specificity
before adding `!important`. If the stylesheet is missing, verify both the
`site.baseurl` prefix and the generated path under `_site/`.
