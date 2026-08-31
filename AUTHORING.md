# Slide authoring reference

Each Markdown post in `_posts/` becomes one horizontal slide in the main
presentation. `index.html` reads the posts, `_includes/slide.html` turns each
one into a `<section>`, and reveal.js adds presentation behavior in the
browser.

## Create a slide

Name the file with a Jekyll post date and a short description:

```text
_posts/2026-08-31-release-flow.md
```

Add front matter followed by the slide body:

```markdown
---
layout: slide
title: "Release flow"
slide-id: release-flow
---

Requests move from the edge to the application service.
```

The effective post date controls the deck order; the oldest post appears
first. A `date` value in front matter overrides the date in the filename.
Because `_config.yml` sets `future: false`, posts dated after the build time
are omitted.

## Front matter

| Field | Behavior |
| --- | --- |
| `layout` | Use `slide` for the repository's standalone post layout. The main deck includes every post regardless of this value. |
| `title` | Adds an `<h1>` before the body. Set `title: ""` to suppress the heading. |
| `slide-id` | Sets the section's HTML `id` and provides a stable reveal.js hash such as `#/release-flow`. Keep it unique. |
| `classes` | A YAML list of section classes. Supplying it replaces the default `slide` class, but the template always keeps `step`. |
| `data` | A mapping rendered as section-level `data-*` attributes for reveal.js. Write keys without the `data-` prefix. |

For example:

```yaml
---
layout: slide
title: "Release flow"
slide-id: release-flow
classes:
  - slide
  - release-flow
data:
  transition: fade
  background-color: "#1f2937"
---
```

The slide template renders those fields as:

```html
<section id="release-flow"
         class="step slide release-flow"
         data-transition="fade"
         data-background-color="#1f2937">
```

The template does not validate `classes`, `slide-id`, or `data` keys. Invalid
or misspelled reveal.js attributes can therefore reach the generated HTML
without producing a Jekyll build error.

## Per-slide reveal.js options

The `data` mapping exposes reveal.js 3.9.2 section attributes. Common keys
include:

| Key | Purpose |
| --- | --- |
| `transition` | Override the slide transition, for example `fade`, `slide`, or `zoom`. |
| `transition-speed` | Use `default`, `fast`, or `slow` for this slide. |
| `background-color` | Set a CSS color behind the slide. |
| `background-image` | Set an image URL, such as `images/architecture.png`, relative to the deck page. |
| `background-size` | Control image sizing with a CSS value such as `cover` or `contain`. |
| `background-position` | Control image placement with a CSS background-position value. |
| `background-repeat` | Control image tiling, for example `repeat` or `no-repeat`. |

See the vendored reveal.js reference for
[slide backgrounds](node_modules/reveal.js/README.md#slide-backgrounds) and
[transitions](node_modules/reveal.js/README.md#slide-transitions). Global
runtime options are set in `_includes/script.html`; the legacy `reveal` block
in `_config.yml` is not connected to `Reveal.initialize(...)`.

## Reveal content progressively

Jekyll's Kramdown renderer preserves inline HTML, so add reveal.js fragment
classes directly to content that should appear in steps:

```markdown
The rollout has three phases:

<span class="fragment fade-up" data-fragment-index="1">canary,</span>
<span class="fragment fade-up" data-fragment-index="2">regional,</span>
<span class="fragment fade-up" data-fragment-index="3">global.</span>
```

Every element with the `fragment` class becomes a presentation step.
`data-fragment-index` is optional; without it, reveal.js uses document order.
The available effects are documented in the vendored
[fragment reference](node_modules/reveal.js/README.md#fragments).

## Preview the complete deck

Run `./script/server`, then open `http://127.0.0.1:4000/`. Always review the
root deck when checking order, transitions, fragments, or backgrounds.

Jekyll also generates an individual URL for each post because `_config.yml`
sets `permalink: "/:title"`. Those standalone pages load the slide stylesheet
but not `_includes/script.html`, so they do not initialize reveal.js and are
not a substitute for presentation preview.
