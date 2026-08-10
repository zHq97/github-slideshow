# Presenting the slideshow

Jekyll renders each file in `_posts/` to HTML before reveal.js starts in the
browser. Reveal.js then provides navigation, URL hashes, fullscreen mode, and
the speaker view.

## Presenter controls

Open the slideshow from a web server, such as the one started by
`./script/server`, and use:

| Key | Action |
| --- | --- |
| Arrow keys, `Space`, or `N` | Move through slides |
| `P` | Return to the previous slide |
| `Esc` or `O` | Open or close the slide overview |
| `F` | Enter fullscreen mode |
| `B` or `.` | Pause on a black screen |
| `S` | Open the speaker view |
| `?` | Show all enabled keyboard shortcuts |

The speaker view opens in a separate window and shows the current slide, the
next slide, a timer, and any notes. Allow pop-ups for the slideshow origin if
the window does not open.

## Add speaker notes

Add an HTML `aside` to the body of a slide post:

```markdown
---
layout: slide
title: "Release architecture"
---

Explain the request path shown in the diagram.

<aside class="notes">
Mention that the fallback is used only after the primary service times out.
</aside>
```

The slide content is rendered by Jekyll's Kramdown processor and inserted into
the reveal.js `<section>` by `_includes/slide.html`. The notes plugin loaded by
`_includes/script.html` looks for `aside.notes` in that generated section.

Do not use reveal.js's `Note:` Markdown delimiter in a post. That syntax is
handled by reveal.js's browser-side Markdown plugin, while this site renders
post Markdown in Jekyll before reveal.js runs.

## Link to a slide

`_includes/script.html` enables reveal.js hash navigation. Moving between
slides updates the URL fragment (for example, `#/2`), so copy the current
browser URL to link to that position.

By default these links are positional. Adding, removing, or reordering an
earlier post can therefore change which slide an existing link opens. For a
stable named link, set `slide-id` in the post front matter:

```yaml
---
layout: slide
title: "Release architecture"
slide-id: release-architecture
---
```

Reveal.js then uses `#/release-architecture` for that slide. Keep every
`slide-id` unique because the browser resolves named links through the
generated section's HTML `id`.
