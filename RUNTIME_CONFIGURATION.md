# Reveal.js runtime configuration

The root slideshow is configured in `_includes/script.html`. That include loads
the vendored reveal.js 3.9.2 runtime and passes the active options to
`Reveal.initialize(...)`.

The `reveal` and `slideNumber` blocks in `_config.yml` are legacy data. No
current template reads them, so changing those values does not affect the
presentation.

## Configuration flow

The root deck uses this path:

1. `index.html` assembles the posts.
2. `_layouts/presentation.html` wraps them in reveal.js markup.
3. `_includes/script.html` loads reveal.js and calls `Reveal.initialize(...)`.
4. Reveal.js combines the supplied options with its defaults from
   `node_modules/reveal.js/js/reveal.js`.

Only the root deck uses the presentation layout. Standalone post pages use
`_layouts/slide.html`, which does not include the reveal.js script; runtime
options do not apply there.

## Current effective options

The initializer currently supplies only `hash: true` plus the plugin
dependencies. Every other option below comes from the vendored JavaScript
defaults, not from `_config.yml`.

| Behavior | Effective value | Legacy `_config.yml` value |
| --- | --- | --- |
| URL hash updates | `hash: true` | `history: true` |
| Browser-history entry per slide | `history: false` | `history: true` |
| Navigation controls | `controls: true` | `controls: false` |
| Progress bar | `progress: true` | `progress: true` |
| Slide number | `slideNumber: false` | `slideNumber.format: "c/t"` |
| Slide transition | `transition: "slide"` | `transition: linear` |
| Background transition | `backgroundTransition: "fade"` | `backgroundTransition: slide` |
| Authored canvas | `960 × 700` | `1000 × 920` |
| Layout margin | `0.04` | `0.1` |
| Scale bounds | `0.2` to `2.0` | `0.2` to `1.5` |

With `hash: true`, navigating changes the URL so a reload or shared link can
return to the slide. Because `history` remains `false`, reveal.js replaces the
current browser-history entry instead of adding one for every slide. Set
`history: true` only when the browser Back and Forward buttons should traverse
slide navigation.

The vendored `node_modules/reveal.js/README.md` is useful as an API guide, but
the executable defaults in `js/reveal.js` and the result of
`Reveal.getConfig()` are authoritative for this repository.

## Change a global option

Add the option directly to the object in `_includes/script.html`, keeping the
existing dependency list. For example:

```javascript
Reveal.initialize({
  hash: true,
  controls: false,
  progress: true,
  slideNumber: 'c/t',
  transition: 'fade',
  width: 1280,
  height: 720,
  dependencies: [
    // Keep the existing plugin definitions here.
  ]
});
```

Options in this object affect every slide in the root deck. Before changing a
global value, check whether a slide-level `data-*` attribute is more
appropriate. For example, a post can set a one-off transition through its
front matter instead of changing the transition for the entire presentation.

Use reveal.js 3.9.2 option names and values. Documentation for reveal.js 4 may
show incompatible initialization and plugin APIs because this repository has
not migrated to that major version.

## Runtime-only experiments

The browser API can temporarily change many options after initialization:

```javascript
Reveal.configure({ controls: false, transition: 'fade' });
```

This is useful for testing, but it does not persist after a reload. Put an
accepted change in `_includes/script.html`.

To inspect the merged configuration in the browser console, run:

```javascript
Reveal.getConfig()
```

Do not copy the returned object wholesale into the template. Keeping only
intentional overrides makes upstream defaults and future migrations easier to
review.

## Verify a configuration change

Build and check the generated page:

```bash
./script/cibuild
```

Then preview with the same base path used by a project-site deployment:

```bash
./script/server --baseurl "/github-slideshow"
```

Open `http://127.0.0.1:4000/github-slideshow/` and verify:

1. the browser console has no initialization error;
2. `Reveal.getConfig()` reports the intended value;
3. controls, progress, slide numbers, sizing, or transitions behave as
   expected;
4. direct slide hashes still open the intended slide; and
5. navigation works with the keyboard and browser history as intended.

`script/cibuild` validates generated HTML but does not execute reveal.js, so a
browser check is required for runtime behavior.

## Common failures

| Symptom | Likely cause or next check |
| --- | --- |
| Editing `_config.yml` has no effect | Move the option into `Reveal.initialize(...)` in `_includes/script.html`. |
| The root deck changes but a standalone post does not | Standalone post pages do not load reveal.js. |
| Back exits the deck instead of opening the previous slide | `hash` is enabled but `history` is not; decide whether browser-history entries are desired. |
| Slides are clipped after changing dimensions | Review `width`, `height`, `margin`, and scale bounds together at the target viewport sizes. |
| An option from current reveal.js documentation fails | Confirm that the option exists in the vendored 3.9.2 source. |
| `Reveal.configure(...)` works only until reload | Persist the tested option in `_includes/script.html`. |
