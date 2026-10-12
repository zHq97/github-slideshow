# Testing the slideshow

The repository has a small build check, but it does not exercise reveal.js in
a browser. Use the automated check for every change, then choose the manual
checks that cover the files you changed.

## Run the automated check

With Ruby and Bundler available, install the locked dependencies and run the
check from the repository root:

```bash
./script/setup
./script/cibuild
```

`script/cibuild` stops at the first failure and performs two steps:

1. `bundle exec jekyll build --baseurl "."` renders the site into `_site/`.
2. `htmlproofer _site/index.html --empty-alt-ignore` checks links, images, and
   HTML in the generated deck page.

The command-line base URL overrides the value in `_config.yml` for this build.
Using `"."` makes generated asset references usable from `_site/index.html`,
but it does not simulate a deployed project-site path.

The Jekyll step renders the posts, layouts, and includes, so malformed Liquid
or front matter can fail the build. The HTML check is narrower: it receives
only `_site/index.html`, and `--empty-alt-ignore` deliberately permits empty
image `alt` attributes.

## Know what is not covered

There is no GitHub Actions workflow in this repository. Unless another
repository service has been configured, `script/cibuild` runs only when a
developer invokes it.

The script does not:

- execute reveal.js or its plugins;
- test keyboard, touch, hash, fragment, or speaker-notes behavior;
- inspect browser console or network errors;
- check standalone post pages with html-proofer;
- validate the production `baseurl`; or
- test print and PDF output.

A successful command therefore proves that Jekyll can build the source and
that the generated deck passes the limited HTML check. It does not prove that
the presentation works interactively.

## Choose manual checks

Start the local server with the same base path the deployment uses:

```bash
./script/server --baseurl "/github-slideshow"
```

For that example, open
`http://127.0.0.1:4000/github-slideshow/`. Use a trailing slash because plugin
paths in `_includes/script.html` are document-relative.

| Changed files | Minimum browser checks |
| --- | --- |
| `_posts/*.md` | Confirm slide order and content; exercise fragments, links, backgrounds, and notes used by the changed slide. |
| `_includes/slide.html` or `index.html` | Inspect the generated slide markup and navigate through the complete deck. |
| `_includes/head.html` or stylesheets | Check the deck at desktop and narrow viewport sizes, then verify paper or PDF output if print styles changed. |
| `_includes/script.html` or vendored reveal.js files | Navigate with the keyboard, load a direct slide hash, use browser back/forward, and check the console and network panel. |
| `_config.yml` or deployment settings | Preview the production base path and verify that reveal.js core, theme, and plugin requests return successfully. |
| `_layouts/slide.html` | Open a generated standalone post URL as well as the root deck. Standalone pages do not initialize reveal.js. |

If the change affects a public deployment, repeat the relevant checks against
the published URL after deployment; a local `"."` base URL cannot catch a
wrong production mount path.

## Troubleshoot failures

| Symptom | Likely cause or next check |
| --- | --- |
| `bundle` or a locked gem cannot run | The lockfile was produced with Bundler 1.17.3 and an older Ruby-era dependency set. Use a compatible Ruby/Bundler environment before changing the lockfile. |
| Jekyll omits a new slide | Confirm the file is in `_posts/`, its front matter is valid, and its effective date is not in the future; `_config.yml` sets `future: false`. |
| `htmlproofer` reports a path that works on the deployed site | Remember that `script/cibuild` overrides `baseurl` with `"."`; compare the generated URL with a build using the production base path. |
| The deck builds but navigation does not work | Check the browser console and requests for reveal.js core and plugins. The build does not execute JavaScript. |
| The root deck works but a post URL differs | Test the post separately. `_layouts/slide.html` does not include the reveal.js initialization script. |
