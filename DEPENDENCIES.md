# Dependency maintenance

This repository has two independent dependency paths. Ruby gems build and
check the Jekyll site; reveal.js supplies the browser-side presentation. Keep
changes to these paths separate so that lock-file updates stay reviewable.

| Path | Declaration | Locked source |
| --- | --- | --- |
| Jekyll and build tools | `Gemfile` | `Gemfile.lock` |
| Presentation runtime | vendored `node_modules/reveal.js/` | `package-lock.json` and the tracked files |

## Ruby and Jekyll

`Gemfile.lock` currently resolves `github-pages` 207, which pins Jekyll 3.9.0
and its supported plugin versions. It also resolves `html-proofer` 3.14.1 for
the check in `script/cibuild`. The `>=` constraints in `Gemfile` do not replace
these exact locked versions during a normal `bundle install`.

The lock file was generated with Bundler 1.17.3. There is no `.ruby-version`,
so `script/setup` does not install Ruby or Bundler in the current repository;
both must already be available. Use a Ruby environment that can install the
locked native gems before changing dependencies.

### Update a direct dependency

1. Change only the intended constraint in `Gemfile`.
2. Update that dependency and its required transitive dependencies:

   ```bash
   bundle update github-pages
   # or, for the checker:
   bundle update html-proofer
   ```

3. Review both files together:

   ```bash
   git diff -- Gemfile Gemfile.lock
   ```

   A `github-pages` update can move many gems because it is a meta-package
   that pins the complete Pages build stack. Unrelated direct dependencies
   and the `BUNDLED WITH` version should not change accidentally.

4. Build and check the generated presentation:

   ```bash
   ./script/cibuild
   ```

   This builds with `--baseurl "."` and checks `_site/index.html`. It does not
   validate every separately generated post URL, so also preview and navigate
   the deck when a renderer, Markdown, theme, or reveal.js integration changes:

   ```bash
   ./script/server
   ```

There is no repository GitHub Actions workflow. Run these checks before
pushing instead of assuming that pull-request CI will exercise the site.

## Vendored reveal.js

The repository has no root `package.json`. reveal.js 3.9.2 is committed under
`node_modules/reveal.js/`, so `npm install` and `npm ci` are not supported setup
or update commands.

Treat a reveal.js upgrade as a vendored-runtime migration:

- update the tracked reveal.js distribution and `package-lock.json` together;
- verify stylesheet and font paths in `_includes/head.html`;
- verify core and plugin paths plus `Reveal.initialize(...)` in
  `_includes/script.html`;
- test navigation, URL hashes, syntax highlighting, and speaker notes in the
  browser.

Do not delete `node_modules/reveal.js/` as generated output. It is the
presentation's runtime source and is required by the deployed site.

## Common failures

| Symptom | Action |
| --- | --- |
| `ruby` or `bundle` is missing | Install a compatible Ruby and the Bundler version recorded at the end of `Gemfile.lock`; `script/setup` cannot do this without `.ruby-version`. |
| A locked native gem fails to compile | Reproduce with a Ruby compatible with the legacy lock first. Treat a Ruby/Bundler modernization as its own tested migration rather than changing transitive versions during unrelated work. |
| A small `Gemfile` edit produces a large lock diff | Check whether the changed gem is `github-pages`; review the diff as a coordinated Pages stack update and revert unrelated resolution changes. |
| `npm ci` reports a missing `package.json` | This is expected. Use the tracked reveal.js assets; do not regenerate them during Ruby dependency work. |
| The build passes but a post URL is broken | `script/cibuild` checks only `_site/index.html`; inspect the affected generated page or extend the validation scope. |
