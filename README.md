# Floorplan Card

A native Home Assistant Lovelace card that shows a floor plan image with
interactive entities placed on top, plus a built-in **visual editor** to build
the whole thing without touching YAML.

It is a modern replacement for the classic `floorplan` integration approach
(static `/local/floorplan` images + `style.css` cache busting + `dataset_set`
services), rebuild as a self-contained card:

- multiple floors with a pill selector by default
- native image upload through HA's image store → **swapped images are never
  stale** (each upload produces a fresh URL, no cache busting hacks)
- entities positioned with the *picture-elements* model (icon/text/custom)
- tap & hold actions, condition-based visibility and colours
- visual editor with a full-size drag-and-drop layout modal

## Quick start

> **Naming note:** this card registers as `floorplan-card-next`, *not*
> `floorplan-card`. The original `floorplan-card` element name is already
> owned by the classic floorplan integration (it renders a
> `<floorplan-element>`), and re-registering it would throw
> `"floorplan-card has already been used"`. Registering under
> `floorplan-card-next` lets both cards run side by side.

1. Copy `dist/floorplan-card.js` into `config/www/` (or install via HACS).
2. Reference it in your config:

```yaml
resources:
  - url: /local/floorplan-card.js
    type: module
```

3. Add a card with a floor:

```yaml
type: custom:floorplan-card-next
title: Home
floors:
  - id: eg
    name: Ground floor
    image: /local/floorplan/eg.png
    width: 545
    height: 725
    entities:
      - entity: light.kitchen
        x: 273
        y: 363
      - entity: sensor.temperature_kitchen
        x: 160
        y: 363
        type: text
        show_state: true
```

Or skip the YAML and use **Edit → choose your card → visual editor**:
add entities, drag them into place in the layout modal, upload/swap the floor
image, and the card's YAML is generated live.

## Features

- **Multiple floors** — every config is multi-floor capable. Pills appear
  automatically once a second floor exists; the last viewed floor is
  remembered in `localStorage` (`floorplan-card.floor.last`) unless disabled.
- **Image swapping with native cache invalidation** — upload the image via the
  editor: it posts to `/api/image/upload/v1` and renders HA's
  `/api/image/serve/…` URL. Uploading again yields a new URL, so browsers can
  never show the previous image. The card also guards a swapped image that
  fails to load: it shows a placeholder instead of the stale one.
- **Picture-elements positioning** — entities are absolutely positioned layers
  over the image. `coords: percent` (default `pixels`) keeps them stable when
  you swap the image, `percent` rescales them with it.
- **Entity types** — `icon` (with state-dependent colour and default icons),
  `text` (formatted state pill), or `custom` (raw SVG/HTML content).
- **Actions** — every entity has `tap_action` / `hold_action`;
  `toggle`, `more-info`, `navigate`, `url`, `perform-action`.
- **Conditions** — `visibility` (HA `condition` syntax) and conditional
  `color` rules.
- **Live state** — state text can be overridden by a state-label map
  (`on` → `AN`, `off` → `AUS`), by an attribute, or by a Jinja template that
  HA renders live (`{{ states('sensor.x') }}`).

## Install

### HACS

1. In HACS open **⋮ → Custom repositories**.
2. Add `https://github.com/glassp/haos-floorplan-card` with category
   **Dashboard**.
3. Install **Floorplan Card** and reload the browser. HACS registers the
   resource automatically.

### Manual

```bash
npm install
npm run build        # -> dist/floorplan-card.js
cp dist/floorplan-card.js /config/www/
```

Then reference the file in your `configuration.yaml` resources as shown in
[Quick start](#quick-start).

## Configuration reference

### Card

| option          | type            | default    | description |
|-----------------|-----------------|------------|-------------|
| `type`          | `string`        | required   | `custom:floorplan-card-next` |
| `title`         | `string`        | —          | Card title |
| `floors`        | `list`          | `[]`       | Floors, see below |
| `default_floor` | `string`        | first floor| Floor `id` to start on |
| `remember_floor`| `boolean`       | `true`     | Persist last viewed floor |
| `coords`        | `"pixels"` \| `"percent"` | `"pixels"` | Coordinate space for entity `x`/`y` |
| `height`        | `number`        | —          | Stage width follows image ratio; sets target height |
| `show_floor_selector` | `boolean` | `auto`     | Show pills; automatic when >1 floor |
| `theme`         | `string`        | —          | HA theme to apply |

### Floor

| option    | type                              | description |
|-----------|-----------------------------------|-------------|
| `id`      | `string`                          | Stable id (`default_floor`, persistence) |
| `name`    | `string`                          | Pill label |
| `image`   | `string` \| `{media_content_id}`  | Background image: any URL, an HA `/api/image/serve/…` url, `media_content_id`, or a **Jinja template** (see below) |
| `width`   | `number`                          | Image space width. Falls back to the natural image size |
| `height`  | `number`                          | Image space height (same fallback) |
| `preserve_aspect_ratio` | `string`                 | `xMidYMax slice` | How the image fills the floor's width×height box (SVG `preserveAspectRatio`): `xMidYMax slice` zoom-crops to fill anchored bottom-centre (the classic floorplan look), `xMidYMid slice`/`xMinYMin slice` anchor elsewhere, `none` stretches, `xMidYMid meet` letterboxes |
| `entities`| `list`                            | Placed entities |

**Templated images** — a `image` string containing `{{…}}` is treated as a
Jinja template and rendered live by HA (the same `render_template`
subscription the entity state override uses). This makes season / day-night
image switching trivial:

```yaml
floors:
  - id: eg
    name: Ground floor
    image: /local/floorplan/{{ states('sensor.season') }}/{{ states('sensor.day_night_mode') }}-eg.png
    width: 545
    height: 725
```

The template re-renders and the image swap fires automatically whenever the
referenced entities change. `states('sensor.season')` is HA's template syntax
for the value of an entity (a bare `sensor.season` resolves to
`sensor.unknown` in HA).

### Entity

| option        | type                                  | default    | description |
|---------------|---------------------------------------|------------|-------------|
| `entity`      | `string`                              | —          | Entity id (optional for `type: custom`) |
| `x`, `y`      | `number`                              | —          | Coordinates in the floor's image space |
| `type`        | `icon` \| `text` \| `custom` \| `composite` | auto     | Value domains (sensor, climate…) default to `text` |
| `size`        | `number`                              | 32 / 14    | Icon size, or text font size |
| `icon`        | `string`                              | auto       | Explicit mdi icon |
| `name`        | `string` \| `boolean`                 | true       | Caption; `false` hides the friendly name |
| `show_state`  | `boolean`                             | `false`    | Show the state next to the content |
| `state_color` | `boolean`                             | `true`     | Tint the icon by state (off/on) |
| `on_color`    | `string`                              | `#fdd835`  | Icon colour while "on"/active (yellow) |
| `off_color`   | `string`                              | `#fff`     | Icon colour while "off"/inactive (white) |
| `state`       | `string` \| `map<string,string>`      | —          | Override state text (label map or Jinja template) |
| `attribute`   | `string`                              | —          | Show an attribute instead of the state |
| `content`     | `string`                              | —          | Raw HTML/SVG for `type: custom` |
| `entries`     | `list`                                | —          | Composite chip cells (see below); implies `type: composite` |
| `background`  | `string` \| `false`            | `rgba(0,0,0,0.55)`| Icon chip / text-pill / custom background; `false` draws the icon bare |
| `color`       | `string` \| `list`                    | —          | Text/icon colour, or rules, see below |
| `opacity`     | `number` (0–1)                        | 1          | Content opacity |
| `layout`      | `column` \| `row`                     | `column`   | Caption/state arrangement |
| `visibility`  | `list`                                | —          | HA conditions; hidden when they fail |
| `tap_action`, `hold_action` | `action`         | —          | Action when tapped / held |

### Actions

`toggle`, `more-info`, `navigate`, `url`, `perform-action`, `none` — the
standard HA action schema.

### Composite chips

`type: composite` (or just `entries:`) renders several infos as one
left/right-split pill — e.g. one red temperature half beside one blue humidity
half, replacing the old two-pill setup. Each `entries` cell is an object:

| option       | type                         | default | description |
|--------------|------------------------------|---------|-------------|
| `entity`     | `string`                     | —       | Entity whose state is shown |
| `icon`       | `string`                     | —       | Optional mdi icon in the cell |
| `attribute`  | `string`                     | —       | Show an attribute instead of the state |
| `state`      | `string` \| `map<string,string>` | —    | Override text (label map or Jinja template) |
| `color`      | `string` \| `list`           | —       | Text colour or colour rules (see above) |
| `background` | `string`                     | —       | Cell background (e.g. `#8c1f1f`) |
| `weight`     | `number`                     | 1       | Cell flex weight (relative width) |
| `min_width`  | `number`                     | —       | Minimum cell width in px |
| `tap_action` | `action`                     | more-info | Action when the cell is tapped (default: show the cell's entity) |

```yaml
- x: 273
  y: 363
  entries:
    - entity: sensor.temprature_kitchen
      background: "#8c1f1f"
    - entity: sensor.humidity_kitchen
      background: "#35619f"
```

### Colour rules

A list of rules, evaluated top-down; the first match wins. A rule without
`when` is the fallback.

```yaml
color:
  - when:
      - condition: state
        entity: light.kitchen
        state: "on"
    active: true
    color: amber
  - when:
      - condition: state
        entity: light.kitchen
        state: "off"
    color: "#9e9e9e"
  - color: red          # fallback
```

### Example: multi-floor with Jinja state and labels

```yaml
type: custom:floorplan-card-next
title: Home
default_floor: og
floors:
  - id: eg
    name: Ground floor
    image:
      media_content_id: media-source://community/floor/eg.svg
    width: 545
    height: 725
    entities:
      - entity: light.kitchen
        x: 273
        y: 363
        tap_action:
          action: toggle
      - entity: light.dining
        x: 400
        y: 363
        icon: mdi:lightbulb-on
        state: { "on": "AN", "off": "AUS" }
        show_state: true
      - entity: sensor.temperature_kitchen
        x: 170
        y: 363
        type: text
        state: "{{ states('sensor.temperature_kitchen') | round(1) }}°"
        layout: row
        visibility:
          - condition: state
            entity: input_boolean.development_mode
            state: "on"
  - id: og
    name: Obergeschoss
    image: /local/floorplan/og.png
    width: 545
    height: 725
    entities:
      - entity: light.bedroom
        x: 273
        y: 363
```

## Visual editor

On any card, use the pen icon / *Edit → floorplan-card* to open the editor.

- **Floor tabs** — add/remove floors, rename them, pick the `default_floor`.
- **Image** — upload a new image (`/api/image/upload/v1`, browser cache-safe),
  or paste a URL; uploading again swaps it while keeping entity coordinates
  (`pixels` mode).
- **Place entities** — add one with *+ Entity*, then open **Edit layout** for a
  full-size drag-and-drop plan. The position is written to the YAML when you
  drop the entity.
- **Entity panel** — type/layout/state controls, action pickers, YAML editors
  for colour rules, visibility conditions and the state map.
- **Reorder / delete** — move placed entities up/down, or remove them.
- Everything emits `config-changed` immediately, so the card's YAML is always
  in sync.

## Migration from the classic *floorplan* card

| Old approach | New card |
|--------------|----------|
| Static images under `/local/floorplan` + `style.css?v14` to bust cache | One `image` per floor; uploads go through HA's image store with fresh URLs each time |
| `floorplan.class_set` / `dataset_set` services, rules and pages | Native `entities` list per floor, `visibility` conditions, `color` rules |
| Nested `<image class="day\|night">` layers with season variants | Multiple floors (e.g. one per season or per day/night) instead of JS swapping |
| JS template with `floorplan-click` element | `tap_action` / `hold_action` per entity |
| Master page + page switching | Pill selector + `default_floor` + `remember_floor` |

The image space in your old `floorplan.yaml` (`width`/`height`) maps directly
to each floor's `width`/`height`; the old entity `x`/`y` and `show_state` map
1:1.

## Development

```bash
npm install
npm run build    # esbuild -> dist/floorplan-card.js
npx tsc --noEmit # typecheck
```

Run the demos:

```bash
python3 -m http.server 8765
# open http://localhost:8765/demo/index.html  (card demo, offline HA mock)
# open http://localhost:8765/demo/editor.html  (visual editor demo)
```

`demo/mock-ha.js` provides an offline Home Assistant mock (states, toggles,
`render_template`) plus generated floor plans, so the card is fully
exercisable without a real HA. `demo/_smoke.html` is a headless assertion
harness (`--dump-dom` + `--virtual-time-budget`).

## License

MIT