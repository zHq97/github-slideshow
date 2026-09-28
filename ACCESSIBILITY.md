# Accessibility guide

The slideshow is a visual presentation, but its source should still provide a
useful reading order and equivalent text for people using a keyboard or
assistive technology. This guide covers the root deck assembled from `_posts/`
and the standalone page generated for each post.

## What the platform provides

The root deck loads the vendored reveal.js 3.9.2 runtime. Its defaults provide
keyboard and touch navigation, labelled arrow controls, and an ARIA live region
that announces the current slide. reveal.js also marks inactive slides with
`aria-hidden`.

Those features do not make slide content accessible by themselves. In
particular:

- `_includes/slide.html` supplies an `<h1>` only when a post has a non-empty
  `title`.
- A `data-background-image` is rendered as a CSS background, so it has no
  alternative-text interface.
- `script/cibuild` checks only `_site/index.html` and passes
  `--empty-alt-ignore`; an empty image `alt` therefore does not fail the build.
- `_includes/head.html` currently sets `user-scalable=no`, which prevents
  pinch-to-zoom in browsers that honor that viewport setting.

Treat the last two items as known validation and platform limitations, not as
permission to omit useful alternatives.

## Author accessible slides

### Preserve structure and reading order

Use a short, unique front matter title. The deck template renders it as the
slide's `<h1>`, so start headings inside the body at level two:

```markdown
---
layout: slide
title: "Release readiness"
slide-id: release-readiness
---

## Required checks

1. Build the site.
2. Review the generated deck.
3. Test keyboard navigation.
```

Keep the Markdown source in the order in which it should be read. Columns,
absolute positioning, and other visual CSS must not be the only indication of
sequence or relationships. If `title: ""` is intentional, add a descriptive
heading in the slide body instead.

### Give images an equivalent

Use normal Markdown images for meaningful content and describe the information
the image contributes:

```markdown
![Build requests pass through Jekyll before GitHub Pages publishes the generated site](images/build-flow.svg)
```

Use `alt=""` only for decoration. Because the current HTML check explicitly
allows empty alternatives, reviewers must verify this distinction manually.

Slide backgrounds are always presentational. If front matter sets
`data-background-image`, repeat any essential labels, values, or conclusions in
the slide's visible text. Do not place the only copy of a diagram or instruction
in a background image.

### Do not rely on visual state alone

- Pair color, position, and emphasis with text labels.
- Use descriptive link text rather than “click here” or a bare URL.
- Keep essential instructions in slide content, not only in speaker notes.
- Write fragments in logical source order. Content with `class="fragment"` is
  initially hidden visually, so the reveal sequence must not be the only way to
  understand the content.
- Avoid rapid animation and autoplaying media. If audio or video is essential,
  provide captions and a nearby transcript or equivalent explanation.

## Verify a change

Run the repository build check:

```sh
script/cibuild
```

Then serve and inspect the generated site in a browser. Automated HTML checking
is only a baseline; complete these manual checks for changed slides:

1. Open the root deck and navigate it with arrow keys and Space.
2. Use Tab and Shift+Tab to reach every link and control without a keyboard
   trap. Confirm that focus remains visible.
3. At 200% browser zoom and a narrow viewport, confirm that text is readable
   and important content is not clipped. Also record any impact from the known
   mobile pinch-zoom restriction.
4. With a screen reader, confirm that the deck title, each slide heading, image
   alternatives, links, and slide changes are understandable.
5. Open the changed post's standalone permalink. It uses
   `_layouts/slide.html` and does not initialize reveal.js, so verify its
   heading structure, reading order, links, and images separately.

When changing platform behavior, edit the active source rather than the legacy
`reveal` settings in `_config.yml`:

| Concern | Active source |
| --- | --- |
| Viewport and stylesheets | `_includes/head.html` |
| Generated slide heading and attributes | `_includes/slide.html` |
| reveal.js initialization | `_includes/script.html` |
| Build-time HTML check | `script/cibuild` |
| Runtime ARIA and keyboard behavior | `node_modules/reveal.js/js/reveal.js` |

Re-run the manual checks after changing any of these files. The vendored
reveal.js file is deployment source in this repository, so an upgrade can alter
keyboard, focus, or announcement behavior even when the Jekyll templates do not
change.
