# Build output and publication boundary

Jekyll turns this repository into the files under `_site/`. GitHub Pages can
build those files from the source branch, while an external publisher may
upload `_site/` directly. In both cases, treat the generated directory as the
public artifact and review its contents before changing build exclusions.

## How source files become output

`script/cibuild` runs `bundle exec jekyll build --baseurl "."`. Jekyll 3.9.0,
the version locked by `github-pages` 207, uses `_site/` as its default
destination.

| Source | Generated behavior |
| --- | --- |
| `index.html` | Renders the complete reveal.js deck through the presentation layout. |
| `_posts/*.md` | Renders into the deck and into individual pages using `permalink: "/:title"`. |
| `_layouts/` and `_includes/` | Supply templates; their source files are not copied as public files. |
| Ordinary files and directories | Copy as static files unless Jekyll ignores or excludes them. |
| `node_modules/reveal.js/` | Supplies the browser runtime, themes, fonts, and plugins required by the deck. |

Directories beginning with `_` or `.`, backup files, and configured
exclusions are not ordinary static content. Do not rely on `_site/` being
ignored by Git: `.gitignore` only prevents accidental commits and does not
control what Jekyll places inside the directory.

## Current vendored-runtime footprint

`_config.yml` defines a custom `exclude` list. With this Jekyll version, that
list replaces the default array, so the repository must explicitly preserve
every exclusion it needs.

Several entries still refer to the old `reveal.js/...` location. The current
runtime lives at `node_modules/reveal.js/`, so those entries do not remove its
tests, demos, documentation, or package metadata from the generated site.
All non-hidden files in the tracked reveal.js tree are therefore currently
part of the publication footprint.

Do not exclude `node_modules/` wholesale: the deployed presentation loads CSS,
JavaScript, fonts, and plugins from `node_modules/reveal.js/`. To reduce the
output, exclude only verified development-only paths using their current
`node_modules/reveal.js/...` names, then confirm that all runtime requests
still succeed.

## Audit a release build

Build with the production base path, then inspect the complete artifact:

```bash
bundle exec jekyll build --baseurl "/github-slideshow"
find _site -type f | sort
du -sh _site
```

Use the actual deployment path instead of `/github-slideshow` when it differs.
Check that:

1. `_site/index.html` and the expected standalone post pages exist.
2. reveal.js core, the selected theme, fonts, and configured plugins are
   present below `_site/node_modules/reveal.js/`.
3. development-only demos, tests, temporary exports, and local reports are
   absent unless intentionally published.
4. the browser network panel has no failed runtime requests when `_site/` is
   served at the production base path.

`script/cibuild` checks only `_site/index.html` with html-proofer. It does not
inventory the rest of `_site/`, classify files as public or private, or
execute reveal.js in a browser, so a successful check does not replace this
audit.

## Troubleshooting

| Symptom | Check |
| --- | --- |
| The deck is unstyled after tightening `exclude` | Restore the required reveal.js CSS and font paths; do not exclude the complete vendored tree. |
| Navigation or notes stop working | Confirm that reveal.js core and every dependency in `_includes/script.html` were generated and served. |
| Development files still appear in `_site/` | Use the current `node_modules/reveal.js/...` path in `_config.yml`; the legacy `reveal.js/...` exclusions do not match. |
| `_site/` differs between local and Pages builds | Use the locked `github-pages` dependency and compare the effective configuration, including command-line `baseurl` overrides. |
