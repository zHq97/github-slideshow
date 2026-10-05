# Template-level presentation options

Most slideshow behavior is configured in reveal.js at runtime, but three
optional Jekyll settings change the slide sections generated at build time:
`simple-slideshow`, `overview`, and `overview-data`. None is set in the current
`_config.yml`, so the normal build keeps per-slide `data-*` attributes and does
not append an overview section.

## Simplified section output

Set `simple-slideshow` to a YAML boolean when the generated deck should ignore
section-level reveal.js data:

```yaml
simple-slideshow: true
```

`_includes/slide.html` still renders every post with its title, content,
`slide-id`, and `classes`, but it omits all attributes from the post's `data`
mapping. For example, this front matter:

```yaml
data:
  transition: fade
  background-color: "#1f2937"
```

normally produces `data-transition` and `data-background-color`. Neither
attribute is emitted in simple mode.

Simple mode does not disable reveal.js or create a plain HTML list. The root
deck still uses `_layouts/presentation.html` and still runs
`Reveal.initialize(...)` from `_includes/script.html`. Global navigation,
keyboard controls, and runtime options therefore remain active.

## Optional final overview section

When simple mode is off, `index.html` can append an extra empty section after
all post slides:

```yaml
overview: true
overview-data:
  background-color: "#073642"
  transition: fade
```

The generated section is equivalent to:

```html
<section id="overview"
         class="step"
         data-background-color="#073642"
         data-transition="fade"></section>
```

Write `overview-data` keys without the `data-` prefix. The template adds that
prefix and does not validate the resulting reveal.js attributes.

This setting is separate from reveal.js overview mode. It adds a real,
navigable final slide; it does not control the grid opened with `Esc` or `O`.
That browser behavior comes from reveal.js runtime configuration.

## Precedence and constraints

- `simple-slideshow: true` suppresses both per-slide `data-*` attributes and
  the optional overview section, even when `overview: true`.
- `overview-data` has no effect unless `overview` is enabled and simple mode is
  off.
- Use unquoted YAML booleans. A quoted value such as `"false"` is a non-empty
  string and is truthy in Liquid conditionals.
- Keep `slide-id: overview` out of post front matter when the generated
  overview is enabled, or the page will contain duplicate HTML IDs.
- These are site-wide build settings. They cannot vary between slides; use a
  post's `data` mapping for per-slide backgrounds and transitions.

## Verify a change

Run the repository build check:

```sh
./script/cibuild
```

Then inspect `_site/index.html` and preview the root deck with
`./script/server`. Confirm that expected `data-*` attributes are present or
absent and, when enabled, that the final overview section appears exactly
once. `script/cibuild` verifies generated links but does not assert these
template-specific behaviors.
