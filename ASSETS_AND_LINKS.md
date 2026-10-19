# Assets and links

The slideshow can be published at a domain root or below a repository path.
Asset and link URLs must therefore preserve Jekyll's `baseurl`; a URL that
works at `localhost:4000` can otherwise fail on a project site.

## Add a local asset

Store project-owned files in a top-level directory such as `images/` or
`media/`. Jekyll copies directories that are not listed in `_config.yml`'s
`exclude` setting into the generated site.

Reference an asset from Markdown with `site.baseurl`:

```markdown
![Request flow]({{ site.baseurl }}/images/request-flow.png)
```

The same pattern works in inline HTML:

```html
<video controls src="{{ site.baseurl }}/media/demo.mp4">
  Download the <a href="{{ site.baseurl }}/media/demo.mp4">demo video</a>.
</video>
```

When `baseurl` is unset, these URLs start at the domain root. If it is
`"/github-slideshow"`, they start at `/github-slideshow/`.

Do not use `/images/request-flow.png` for a project site. A leading slash
without `site.baseurl` points to the domain root and skips the repository
path.

## Set a slide background

The `data` front matter map becomes reveal.js `data-*` attributes on the main
deck's `<section>`. Use a page-relative URL for a background image:

```yaml
---
layout: slide
title: "Request flow"
data:
  background-image: "images/request-flow.png"
  background-size: contain
  background-repeat: no-repeat
---
```

The deck is expected to be served from a URL ending in `/`, so that relative
path resolves below the deck's current base path. This is also how the
document-relative plugin paths in `_includes/script.html` work.

Do not put `{{ site.baseurl }}` inside a front matter value. Jekyll reads that
value as data, and `_includes/slide.html` prints it without a second Liquid
rendering pass.

Background attributes are emitted only by `_includes/slide.html` when
`index.html` assembles the main deck. The standalone post layout does not
render those attributes, so always review backgrounds in the complete deck.

## Link to a slide

Give the destination a stable `slide-id`:

```yaml
slide-id: deployment
```

Then link to its reveal.js hash:

```markdown
[Jump to deployment]({{ site.baseurl }}/#/deployment)
```

`_includes/script.html` enables reveal.js hash navigation. An explicit
`slide-id` remains stable when other slides are inserted; a positional hash
does not. Keep IDs unique because the templates do not check for duplicates.

For an ordinary file or page, use the same base-aware form:

```markdown
[Download the worksheet]({{ site.baseurl }}/media/worksheet.pdf)
```

Fully qualified external URLs such as `https://example.com/reference` do not
need `site.baseurl`. Prefer HTTPS so an HTTPS Pages site does not block mixed
content.

## Verify URL changes

Run the repository check:

```bash
./script/cibuild
```

It builds with `--baseurl "."` and checks only the generated
`_site/index.html`. It does not execute reveal.js or prove that slide
backgrounds and embedded media load.

Also preview the path used in production:

```bash
./script/server --baseurl "/github-slideshow"
```

Open `http://127.0.0.1:4000/github-slideshow/`, then:

1. Check the browser network panel for failed image, media, and document
   requests.
2. Follow direct `#/slide-id` links and reload the page at that hash.
3. Open a generated standalone post URL if its body contains assets or links.
4. Check external resources from the deployed site when network policy or
   cross-origin behavior matters.
