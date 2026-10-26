# Runtime plugins

The slideshow uses the legacy reveal.js 3.9.2 dependency API. Jekyll renders
the deck first, then `_includes/script.html` loads reveal.js and its browser
plugins. Use this integration point for behavior that must run inside the
presentation; standalone post pages do not include it.

## Current runtime

`_includes/script.html` loads the reveal.js core with `site.baseurl`, calls
`Reveal.initialize(...)`, and declares these dependencies in order:

| Script | Loading | Purpose |
| --- | --- | --- |
| `plugin/markdown/marked.js` | before startup | Supplies the parser used by the Markdown plugin. |
| `plugin/markdown/markdown.js` | before startup | Converts elements carrying `data-markdown`. |
| `plugin/highlight/highlight.js` | before startup | Highlights code under `.reveal pre code`. |
| `plugin/notes/notes.js` | asynchronous | Enables the speaker-notes window. |

All four scripts are currently requested on every deck load because none has a
`condition`. Normal slide Markdown does not depend on the browser Markdown
plugin: Jekyll and kramdown have already converted `_posts/*.md` to HTML before
the page reaches the browser. The plugin matters only for explicit
`data-markdown` markup.

Dependencies without `async: true` load before reveal.js becomes ready.
Registered plugin `init()` methods also complete before the `ready` event when
they are loaded this way. An asynchronous dependency does not delay startup,
so code that must be available at `ready` time must not be marked `async`.

This repository predates the reveal.js 4 `plugins: [...]` option. Keep using
the 3.9.2 `dependencies` array and `Reveal.registerPlugin(...)` unless the
vendored runtime is upgraded as a separate migration.

## Add a plugin

1. Add the plugin source to the repository. For a local extension, a path such
   as `assets/js/timer.js` keeps it separate from the vendored reveal.js
   distribution.
2. Register the plugin with the API available in reveal.js 3.9.2:

   ```javascript
   (function() {
     Reveal.registerPlugin('timer', {
       init: function() {
         // Bind presentation behavior here.
       }
     });
   }());
   ```

3. Add it to the `dependencies` array in `_includes/script.html`. Prefix new
   local paths with `site.baseurl` so they work at both a domain root and a
   GitHub Pages project path:

   ```javascript
   dependencies: [
     // Existing dependencies...
     {
       src: '{{ site.baseurl }}/assets/js/timer.js',
       condition: function() {
         return !!document.querySelector('[data-timer]');
       }
     }
   ]
   ```

   Omit `condition` when every presentation needs the plugin. Add
   `async: true` only when the plugin is optional after startup and no `ready`
   handler depends on it. A dependency may also define `callback`, which runs
   after its script loads.

4. If the plugin needs configuration, put it beside `hash` in
   `Reveal.initialize(...)`. Values under `_config.yml`'s legacy `reveal`
   block are not copied into the runtime configuration.

Do not run `npm install` to add a browser plugin. There is no root
`package.json`; `node_modules/reveal.js/` is tracked runtime source rather than
generated installation output.

## Path and page constraints

- The reveal.js core path is base-URL-aware.
- Existing plugin paths are document-relative. They rely on opening the deck
  at its directory URL with a trailing slash, such as
  `/github-slideshow/`, not `/github-slideshow`.
- A new base-URL-prefixed path, as shown above, does not have that trailing
  slash dependency.
- `_layouts/slide.html` renders standalone post pages without
  `_includes/script.html`. Reveal.js and its plugins are available only in the
  root deck unless that layout is deliberately changed.
- A remote plugin or one that fetches remote resources adds a network
  dependency to the presentation. Vendor required assets when the deck must
  work offline.

## Verify a plugin change

Build the rendered site first:

```bash
./script/cibuild
```

This catches Liquid errors and broken static HTML, but it does not execute
JavaScript or inspect dependency URLs embedded in `Reveal.initialize(...)`.
Run a browser check at the deployment base path as well:

```bash
./script/server --baseurl "/github-slideshow"
```

Open `http://127.0.0.1:4000/github-slideshow/`, then confirm:

1. the plugin request succeeds in the browser network panel;
2. the console has no load or initialization error;
3. `Reveal.hasPlugin('timer')` returns `true` for a registered plugin;
4. the feature works after a direct slide-hash load and during navigation; and
5. the deck still works when the plugin's `condition` returns false, if used.

If the plugin is asynchronous, test the feature only after its request
finishes and do not treat the reveal.js `ready` event as proof that it loaded.

## Common failures

| Symptom | Likely cause or next check |
| --- | --- |
| Plugin request returns 404 only under GitHub Pages | The path omitted `site.baseurl`, or the deployed deck URL is missing its trailing slash. |
| `Reveal.hasPlugin(...)` stays false | The script failed to load, registered a different ID, or does not call `Reveal.registerPlugin(...)`. |
| A `ready` handler cannot find the plugin | The dependency is asynchronous; load it before startup or wait for its dependency `callback`. |
| Markdown slides are unaffected after removing the browser parser | Repository posts are rendered by Jekyll/kramdown; check for explicit `data-markdown` markup before assuming the browser plugin is required. |
| Root deck works but a standalone post does not | Standalone pages do not initialize reveal.js or load runtime plugins. |
