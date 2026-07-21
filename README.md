# Your GitHub Learning Lab Repository for Introducing GitHub

Welcome to **your** repository for your GitHub Learning Lab course. This repository will be used during the different activities that I will be guiding you through. See a word you don't understand? We've included an emoji 📖 next to some key terms. Click on it to see its definition.

Oh! I haven't introduced myself...

I'm the GitHub Learning Lab bot and I'm here to help guide you in your journey to learn and master the various topics covered in this course. I will be using Issue and Pull Request comments to communicate with you. In fact, I already added an issue for you to check out.

![issue tab](https://lab.github.com/public/images/issue_tab.png)

I'll meet you over there, can't wait to get started!

This course is using the :sparkles: open source project [reveal.js](https://github.com/hakimel/reveal.js/). In some cases we’ve made changes to the history so it would behave during class, so head to the original project repo to learn more about the cool people behind this project.

## How the slideshow works

Jekyll turns every Markdown file in `_posts/` into a slide. The root
`index.html` reads those posts in ascending date order, `_includes/slide.html`
renders each post as a `<section>`, and `_layouts/presentation.html` wraps the
sections in a reveal.js presentation.

The reveal.js 3.9.2 assets are committed under `node_modules/reveal.js/`. They
are not a Git submodule, and a normal clone does not require `npm install`.

## Add a slide

Create `_posts/YYYY-MM-DD-short-name.md` with Jekyll front matter:

```markdown
---
layout: slide
title: "A useful title"
---

Write the slide body in Markdown.
```

Slides appear by the date in their file name, oldest first. `_config.yml` sets
`future: false`, so a slide dated later than the build date is omitted.

The slide template also accepts these optional front matter fields:

- `slide-id`: sets the section's HTML `id`.
- `classes`: adds CSS classes. When supplied, it replaces the default `slide`
  class, so include `slide` explicitly if custom CSS depends on it.
- `data`: maps entries to `data-*` attributes, such as
  `data: { transition: fade }`.

## Develop locally

This site uses the Ruby dependencies in `Gemfile.lock` (including
`github-pages` 207 and Jekyll 3.9.0).

```bash
# Install Ruby dependencies.
bundle install

# Preview at http://127.0.0.1:4000.
./script/server

# Build the site and check the generated home page.
./script/cibuild
```

`script/setup` is a convenience wrapper around dependency installation. Its
final submodule command is retained from an older layout and currently has
nothing to initialize because `.gitmodules` is empty.

The dependency lock was created with Bundler 1.17.3. If installation fails on
a recent Ruby or Bundler release, use an environment compatible with the
locked toolchain; do not regenerate the lock file as part of an unrelated
slide change.

`script/cibuild` builds with `--baseurl "."` and runs html-proofer against
`_site/index.html`. It does not check every generated post page.

## Customize and deploy

- Runtime reveal.js options and plugins are defined in
  `_includes/script.html`.
- The reveal.js theme and syntax-highlighting stylesheets are selected in
  `_includes/head.html`; the current theme is `moon.css`.
- The legacy `reveal` and `slideNumber` blocks in `_config.yml` are not read by
  the current templates. Editing them does not change the presentation.
- Templates prefix static assets with `site.baseurl`. Leave `baseurl` unset
  for a root site; for a project site served below a repository path, set it
  to `"/repository-name"`.

There is no GitHub Actions workflow in this repository. Configure GitHub Pages
to build from the intended branch and directory. `script/stage` is a legacy
GitHub-internal staging workflow for `ghe.io`; it force-pushes generated files
and is not the deployment command for GitHub.com.

## Troubleshooting

| Symptom | Check |
| --- | --- |
| A new slide is missing | Confirm the file is under `_posts/`, has valid front matter, and is not dated in the future. |
| Slides are in the wrong order | Jekyll post dates control the order, not file creation time. |
| CSS, JavaScript, or fonts return 404 | Make sure `_config.yml`'s `baseurl` matches the path where Pages serves the site. |
| Changes to `reveal` in `_config.yml` do nothing | Change `Reveal.initialize(...)` in `_includes/script.html`; the legacy config block is not connected. |
| `npm install` or `npm ci` fails | The repository has no root `package.json`; reveal.js is vendored and tracked in Git. |
