# Slide content rendering

Slide bodies are built by Jekyll, not by reveal.js. This distinction matters
when choosing Markdown syntax, using Liquid variables, and troubleshooting
content that looks different from its source.

## Rendering pipeline

For each file in `_posts/`, the current toolchain:

1. evaluates Liquid expressions in the post body;
2. converts GitHub-flavored Kramdown to HTML and uses Rouge for syntax
   highlighting;
3. exposes the rendered `post.content` to `index.html`, where
   `_includes/slide.html` wraps it in a reveal.js `<section>`.

After the page is assembled, the `jemoji` plugin replaces emoji shortcodes in
the generated HTML. Reveal.js then adds navigation and presentation behavior
in the browser.
Although `_includes/script.html` loads reveal.js's Markdown and highlight
plugins, ordinary post bodies have already become HTML by that point. Do not
rely on the browser Markdown plugin to interpret slide source.

The locked versions for this path are Jekyll 3.9.0, Kramdown 2.3.0,
`kramdown-parser-gfm` 1.1.0, Rouge 3.19.0, and `jemoji` 0.11.1.

## Write Markdown content

The post `title` is rendered as the slide's `<h1>`. Start body sections at
level two so the generated heading hierarchy stays meaningful:

````markdown
---
layout: slide
title: "Deploy safely"
---

## Release steps

1. Build the candidate.
2. Run the smoke checks.
3. Promote the verified artifact.

```sh
./script/cibuild
```
````

Add a language after the opening fence to let the build-time Rouge
highlighter emit language-specific markup. The Monokai stylesheet loaded by
`_includes/head.html` supplies the colors.

Kramdown preserves inline HTML, which is useful for reveal.js-only features:

```markdown
<p class="fragment">This appears after the first advance.</p>
```

HTML is not sanitized by this repository. Only add markup and embedded
content from trusted sources, and check the generated page rather than
assuming malformed HTML will fail the build.

The configured smart-quote mapping converts ordinary prose quotes and
apostrophes. Use code spans or fenced code blocks when punctuation must remain
literal.

## Use Liquid in a slide body

Liquid runs before Markdown conversion, so body content can use site and page
values. Prefix local URLs with the configured base path:

```markdown
![Request flow]({{ site.baseurl }}/images/request-flow.png)

[Open the deck]({{ site.baseurl }}/)
```

This works when the site is hosted at `/` and when it is hosted below a
project path such as `/github-slideshow`.

To show Liquid syntax as text, protect it with `raw`:

```liquid
{% raw %}
The template prints {{ site.title }}.
{% endraw %}
```

Liquid in the Markdown body is evaluated. A Liquid expression stored inside
a front matter string is only data and is not evaluated a second time when
`_includes/slide.html` writes that value into an attribute.

## Emoji behavior

Both Unicode emoji and shortcodes are accepted:

```markdown
Deployment complete ✅ :rocket:
```

The `:rocket:` form is converted during the Jekyll build by `jemoji`. Its
default image source is `https://github.githubassets.com/images/icons/`, so
shortcode images may not load in offline or restricted-network
presentations. Prefer Unicode emoji when the deck must be self-contained.

## Verify and troubleshoot

Run `./script/server`, then check both:

- the root deck, where `index.html` assembles every post and reveal.js runs;
- the post's standalone `/:title` page, where the same rendered body is shown
  without reveal.js initialization.

Use `./script/cibuild` for a clean build plus the existing HTML check. It
checks only `_site/index.html`, so it does not replace reviewing standalone
pages or browser behavior.

If content is not rendered as expected:

- confirm the file is under `_posts/`, has valid front matter, and is not
  future-dated;
- add a blank line around lists, fenced code, and block HTML;
- wrap literal Liquid examples in `raw`;
- add a code-fence language when highlighting is missing;
- check the browser network panel when a shortcode emoji is missing; and
- inspect the generated HTML before changing reveal.js plugins, because
  Markdown and Liquid failures occur during the Jekyll build.
