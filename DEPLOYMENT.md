# Deployment

This site is a Jekyll source repository. GitHub Pages can build it directly,
or another publisher can upload the generated `_site/` directory. The
repository does not contain a GitHub Actions workflow, so the active Pages
source, custom domain, and deployment history must be checked in the
repository settings.

## Choose the base URL

The templates prepend `site.baseurl` to the reveal.js stylesheets and core
script. Set it to the path below the host where the deck will be served:

| Published URL | `baseurl` |
| --- | --- |
| `https://OWNER.github.io/github-slideshow/` | `"/github-slideshow"` |
| `https://OWNER.github.io/` | unset or `""` |
| `https://slides.example.com/` | unset or `""` |
| `https://example.com/talk/` | `"/talk"` |

Use a leading slash and no trailing slash. Do not infer the value only from
the repository name: a custom domain can serve a project repository at `/`.

For a persistent Pages deployment, set the value in `_config.yml`:

```yaml
baseurl: "/github-slideshow"
```

For a one-off build, override it on the command line instead:

```bash
bundle exec jekyll build --baseurl "/github-slideshow"
```

Changing `baseurl` does not move the generated files into a subdirectory.
It changes the URLs emitted into the HTML; the publishing service is
responsible for mounting `_site/` at that path.

## Validate the deployment shape

Install the locked Ruby dependencies with `./script/setup`, then preview the
same path that production will use:

```bash
./script/server --baseurl "/github-slideshow"
```

Open `http://127.0.0.1:4000/github-slideshow/`, including the trailing slash.
Before publishing, check that:

- the `moon.css` theme loads;
- arrow-key navigation changes slides when the deck contains more than one;
- the browser network panel shows HTTP 200 for reveal.js core and plugin
  files under `/github-slideshow/node_modules/reveal.js/`;
- direct slide links and browser back/forward navigation work.

Run the repository's automated build check as well:

```bash
./script/cibuild
```

That script uses `--baseurl "."` and checks only `_site/index.html`. It catches
Jekyll and basic link failures, but it does not prove that a production
subpath is correct. Keep the path-specific preview in the release checklist.

## Publish with GitHub Pages

When Pages is configured to deploy from a branch:

1. Select the intended branch and `/(root)` as the source in **Settings →
   Pages**. The Jekyll inputs (`_config.yml`, `_posts/`, layouts, and includes)
   are all at the repository root.
2. Commit the production `baseurl` when the site is served below a path.
3. Push the source commit and wait for the Pages build to finish.
4. Run the post-deployment checks below against the public URL.

Do not commit `_site/` for this model; it is ignored by `.gitignore` and Pages
builds it from the source files.

If an external deployment system publishes prebuilt output, generate `_site/`
with the production `baseurl` and configure that system to upload the
directory. There is no supported GitHub.com publishing script in this
repository, so document the external system separately.

## Post-deployment checks

Use the canonical URL with its trailing slash and verify:

1. The first slide says “Welcome to our slide deck!”. If more slides have
   been added, the right arrow advances to the next one.
2. `node_modules/reveal.js/js/reveal.js` and
   `node_modules/reveal.js/css/theme/moon.css` load below the same site path.
3. A hard refresh on a copied slide URL restores the expected slide.
4. The browser console has no missing reveal.js plugin errors.

If the page renders as unstyled text or navigation is unavailable, inspect
the failed asset URL first. A request to `/node_modules/...` from a project
site usually means the build used an empty `baseurl`; a duplicated repository
segment usually means the configured value was applied twice.

## Roll back

For branch-based Pages deployments, revert the source commit that introduced
the regression and push the revert normally. If repository Pages settings or
the custom domain changed during the release, restore those settings to their
previous values as a separate step.

Do not use `script/stage` to deploy or roll back GitHub.com Pages. It builds an
internal staging variant, creates a temporary repository inside `_site/`, and
force-pushes to `ghe.io`. Its defaults and destination are unrelated to this
repository's public Pages configuration.
