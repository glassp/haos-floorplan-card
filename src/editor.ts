import { LitElement, css, html, nothing, type TemplateResult } from "lit";
import { fireEvent } from "./hass-helpers";
import { isValueDomain } from "./hass-helpers";
import "./entity";
import {
  isImageTemplate,
  resolveImage,
  stageSizeOf,
  uploadImage,
  type StageSize,
} from "./image";
import type {
  ColorRule,
  EntityType,
  FloorConfig,
  FloorEntityConfig,
  FloorplanCardConfig,
  HomeAssistant,
} from "./types";

type Schema = readonly Record<string, any>[];

/** Drops keys whose value is undefined or "" so the YAML stays clean. */
const prune = <T extends Record<string, any>>(obj: T): T => {
  const out = {} as Record<string, any>;
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined || value === "") continue;
    out[key] = value;
  }
  return out as T;
};

const move = <T>(list: T[], from: number, to: number): T[] => {
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
};

const nextId = (prefix: string, existing: string[]): string => {
  let i = existing.length + 1;
  while (existing.includes(`${prefix}-${i}`)) i++;
  return `${prefix}-${i}`;
};

const CARD_SCHEMA: Schema = [
  { name: "title", selector: { text: {} } },
  {
    name: "",
    type: "grid",
    schema: [
      { name: "height", selector: { number: { min: 0, mode: "box" } } },
      { name: "remember_floor", selector: { boolean: {} } },
    ],
  },
  {
    name: "",
    type: "grid",
    schema: [
      {
        name: "coords",
        label: "Coordinates",
        selector: { select: { options: ["pixels", "percent"], custom_value: false } },
      },
      { name: "show_floor_selector", selector: { boolean: {} } },
    ],
  },
];

const FLOOR_SCHEMA: Schema = [
  { name: "name", label: "Floor name", selector: { text: {} } },
  {
    name: "",
    type: "grid",
    schema: [
      { name: "width", selector: { number: { min: 0, mode: "box" } } },
      { name: "height", selector: { number: { min: 0, mode: "box" } } },
    ],
  },
  {
    name: "preserve_aspect_ratio",
    selector: {
      select: {
        mode: "dropdown",
        options: [
          { value: "xMidYMax slice", label: "Zoom, bottom-anchored (classic floorplan)" },
          { value: "xMidYMid slice", label: "Zoom, centered" },
          { value: "xMinYMin slice", label: "Zoom, top-left anchored" },
          { value: "none", label: "Stretch to fill" },
          { value: "xMidYMid meet", label: "Fit (letterbox)" },
        ],
      },
    },
  },
];

const ENTITY_SCHEMA: Schema = [
  { name: "entity", selector: { entity: {} } },
  {
    name: "",
    type: "grid",
    schema: [
      { name: "icon", selector: { icon: {} } },
      { name: "size", selector: { number: { min: 8, max: 160, mode: "box" } } },
    ],
  },
  {
    name: "",
    type: "grid",
    schema: [
      { name: "x", selector: { number: { min: 0, max: 10000, mode: "box" } } },
      { name: "y", selector: { number: { min: 0, max: 10000, mode: "box" } } },
    ],
  },
  {
    name: "",
    type: "grid",
    schema: [
      { name: "name", selector: { text: {} } },
      { name: "attribute", selector: { text: {} } },
    ],
  },
  {
    name: "",
    type: "grid",
    schema: [
      { name: "show_state", selector: { boolean: {} } },
      { name: "state_color", selector: { boolean: {} } },
    ],
  },
  {
    name: "",
    type: "grid",
    schema: [
      {
        name: "opacity",
        selector: { number: { min: 0, max: 1, mode: "box", step: 0.05 } },
      },
      { name: "background", selector: { text: {} } },
      { name: "on_color", selector: { text: {} } },
      { name: "off_color", selector: { text: {} } },
    ],
  },
];

const ACTION_SCHEMA: Schema = [
  {
    name: "tap_action",
    selector: { ui_action: { default_action: "more-info" } },
  },
  { name: "hold_action", selector: { ui_action: { default_action: "none" } } },
];

/** Friendly labels for every field shared across the panels' ha-forms. */
const LABELS: Record<string, string> = {
  title: "Title",
  height: "Height (px)",
  remember_floor: "Remember last floor",
  coords: "Coordinate space",
  show_floor_selector: "Show floor selector",
  width: "Width (px)",
  preserve_aspect_ratio: "Image fit",
  entity: "Entity",
  icon: "Icon",
  size: "Icon / text size (px)",
  x: "X position",
  y: "Y position",
  name: "Name override",
  attribute: "Attribute instead of state",
  show_state: "Show state",
  state_color: "Tint icon by state",
  opacity: "Opacity",
  background: "Pill background",
  on_color: "On color (active)",
  off_color: "Off color (inactive)",
  tap_action: "Tap action",
  hold_action: "Hold action (press and hold)",
};

const TYPE_MODES = ["icon", "text", "composite", "custom"];
const LAYOUT_MODES = ["column", "row"];
const STATE_MODES = ["none", "map", "template"];

type StateMode = "none" | "map" | "template";
const stateModeOf = (entity: FloorEntityConfig): StateMode =>
  entity.state === undefined
    ? "none"
    : typeof entity.state === "string"
      ? "template"
      : "map";

type ColorMode = "none" | "fixed" | "rules";

/** A single rule carrying nothing but a colour and an optional `active` reads as one fixed colour. */
const simpleColorRule = (color: FloorEntityConfig["color"]): ColorRule | undefined => {
  if (!Array.isArray(color) || color.length !== 1) return undefined;
  const [rule] = color;
  const keys = Object.keys(rule);
  return keys.every((key) => key === "color" || key === "active") ? rule : undefined;
};

const colorModeOf = (entity: FloorEntityConfig): ColorMode => {
  if (entity.color === undefined) return "none";
  if (typeof entity.color === "string" || simpleColorRule(entity.color)) return "fixed";
  return "rules";
};

/** The colour string behind either fixed shape. */
const fixedColorOf = (entity: FloorEntityConfig): string =>
  typeof entity.color === "string" ? entity.color : simpleColorRule(entity.color)?.color ?? "";

/** Per-entity mode choices the panel remembers until the user picks a different one. */
interface EntityModes {
  state?: StateMode;
  color?: ColorMode;
}

export class FloorplanEditor extends LitElement {
  static properties = {
    hass: { attribute: false },
    _config: { state: true },
    _activeFloor: { state: true },
    _selected: { state: true },
    _measured: { state: true },
    _broken: { state: true },
    _uploading: { state: true },
    _layoutOpen: { state: true },
    _modes: { state: true },
  };

  hass!: HomeAssistant;
  private _config!: FloorplanCardConfig;
  private _activeFloor?: string;
  private _selected = -1;
  /** Fingerprint of the last config the editor emitted or accepted. */
  private _lastSig?: string;
  private _measured = new Map<string, StageSize>();
  private _broken = new Set<string>();
  private _uploading = false;
  /** Whether the full-size drag-and-drop layout modal is open. */
  private _layoutOpen = false;
  /** Segmented-control choices per entity index; cleared whenever indices shift. */
  private _modes: { [index: number]: EntityModes } = {};

  private _drag: { idx: number; pointerId: number } | null = null;

  private _imageResult = new Map<string, string>();
  private _imageUnsubs = new Map<string, Promise<() => void>>();
  private _subscribedImages = new Set<string>();

  connectedCallback(): void {
    super.connectedCallback();
    this._manageImageTemplate();
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    for (const unsub of this._imageUnsubs.values()) {
      unsub.then((fn) => fn()).catch(() => {});
    }
    this._imageUnsubs.clear();
    this._subscribedImages.clear();
  }

  updated(): void {
    this._manageImageTemplate();
  }

  /** Keeps a Jinja `image` template subscription in step with the active floor. */
  private _manageImageTemplate(): void {
    const floor = this._floor();
    const image = floor?.image;
    const template =
      typeof image === "string" && image.includes("{{") ? image : undefined;
    if (!template || this._subscribedImages.has(template)) return;
    if (!this.isConnected || !this.hass?.connection) return;

    this._subscribedImages.add(template);
    this._imageUnsubs.set(
      template,
      this.hass.connection
        .subscribeMessage(
          (message) => {
            const url = String(message.result ?? "").trim();
            if (url) this._imageResult.set(template, url);
            else this._imageResult.delete(template);
            this.requestUpdate();
          },
          { type: "render_template", template, report_errors: false },
        )
        .catch(() => {
          this._subscribedImages.delete(template);
          this._imageUnsubs.delete(template);
          return () => {};
        }),
    );
  }

  /** The URL to actually render, resolving Jinja `image` templates. */
  private _srcOf(floor: FloorConfig): string | undefined {
    const src = resolveImage(floor.image);
    return src && isImageTemplate(src) ? this._imageResult.get(src) : src;
  }

  setConfig(config: FloorplanCardConfig): void {
    const floors = (config.floors ?? []).map((floor) => this._normalize(floor));
    const sig = JSON.stringify(floors);
    // HA echoes the config back through setConfig after every config-changed.
    // Keep the open/selected block (and modes) when it's the same config so
    // editing a field doesn't collapse the panel; reset only on a real switch.
    const sameConfig = sig === this._lastSig;
    this._lastSig = sig;
    this._config = { ...config, floors };
    if (!floors.some((f) => f.id === this._activeFloor)) {
      this._activeFloor =
        (config.default_floor &&
        floors.some((f) => f.id === config.default_floor)
          ? config.default_floor
          : undefined) ?? floors[0]?.id;
    }
    if (!sameConfig) this._selected = -1;
  }

  private _normalize(floor: FloorConfig): FloorConfig {
    const existing = this._floors?.map((f) => f.id!).filter(Boolean) ?? [];
    const id = floor.id ?? nextId("floor", existing);
    return { ...floor, id, name: floor.name, entities: floor.entities ?? [] };
  }

  private _label = (entry: { name: string; label?: string }): string =>
    entry.label ?? LABELS[entry.name] ?? entry.name.replace(/_/g, " ");

  /* -------------------------------------------------------------- helpers */

  private get _floors(): FloorConfig[] {
    return this._config?.floors ?? [];
  }

  private _floor(): FloorConfig {
    return (
      this._floors.find((f) => f.id === this._activeFloor) ?? this._floors[0]
    );
  }

  private _size(): StageSize {
    const floor = this._floor();
    const src = resolveImage(floor.image);
    return stageSizeOf(floor, src ? this._measured.get(src) : undefined);
  }

  private _emit(config: FloorplanCardConfig): void {
    if (!config.floors!.some((f) => f.id === this._activeFloor)) {
      this._activeFloor = config.floors![0]?.id;
    }
    this._selected = Math.min(
      this._selected,
      (this._floor()?.entities ?? []).length - 1,
    );
    this._config = config;
    this._lastSig = JSON.stringify(config.floors ?? []);
    fireEvent(this, "config-changed", { config });
  }

  private _updateFloor(patch: Partial<FloorConfig>): void {
    this._emit({
      ...this._config,
      floors: this._floors.map((f) =>
        f.id === this._activeFloor ? { ...f, ...prune(patch) as FloorConfig } : f,
      ),
    });
  }

  private _updateEntity(index: number, patch: Partial<FloorEntityConfig>): void {
    const floor = this._floor();
    const entities = (floor.entities ?? []).map((e, i) =>
      i === index ? { ...e, ...prune(patch) } : e,
    );
    this._emit({
      ...this._config,
      floors: this._floors.map((f) =>
        f.id === this._activeFloor ? { ...f, entities } : f,
      ),
    });
  }

  private _setModifier<K extends keyof FloorEntityConfig>(
    index: number,
    key: K,
    value: FloorEntityConfig[K] | undefined,
  ): void {
    const floor = this._floor();
    const entities = (floor.entities ?? []).map((e, i) =>
      i === index ? { ...e, [key]: value } : e,
    );
    this._emit({
      ...this._config,
      floors: this._floors.map((f) =>
        f.id === this._activeFloor ? { ...f, entities } : f,
      ),
    });
  }

  /* ------------------------------------------------------------- floors */

  private _addFloor(): void {
    const floors = [
      ...this._floors,
      {
        id: nextId("floor", this._floors.map((f) => f.id!)),
        name: "New floor",
        width: 545,
        height: 725,
        entities: [],
      },
    ];
    const id = floors[floors.length - 1].id;
    this._activeFloor = id;
    this._selected = -1;
    this._modes = {};
    this._emit({ ...this._config, floors });
  }

  private _switchFloor(id: string): void {
    this._activeFloor = id;
    this._selected = -1;
    this._modes = {};
    this._config = { ...this._config };
  }

  private _removeFloor(index: number, ev?: Event): void {
    ev?.stopPropagation();
    const floors = this._floors;
    if (floors.length <= 1) return;
    const next = floors.filter((_, i) => i !== index);
    this._activeFloor = undefined;
    this._selected = -1;
    this._modes = {};
    this._emit({ ...this._config, floors: next });
  }

  private _duplicateFloor(index: number, ev?: Event): void {
    ev?.stopPropagation();
    const floors = this._floors;
    const source = floors[index];
    const copy: FloorConfig = {
      ...source,
      id: nextId("floor", floors.map((f) => f.id!)),
      entities: (source.entities ?? []).map((e) => ({ ...e })),
    };
    const next = [...floors];
    next.splice(index + 1, 0, copy);
    this._activeFloor = copy.id;
    this._selected = -1;
    this._modes = {};
    this._emit({ ...this._config, floors: next });
  }

  /* ------------------------------------------------------------ entities */

  private _addEntity(x: number, y: number): void {
    const floor = this._floor();
    const entities = [...(floor.entities ?? [])];
    const entity: FloorEntityConfig = {
      entity: "",
      type: "icon",
      x: Math.round(x),
      y: Math.round(y),
      size: 32,
    };
    entities.push(entity);
    this._selected = entities.length - 1;
    this._emit({
      ...this._config,
      floors: this._floors.map((f) =>
        f.id === this._activeFloor ? { ...f, entities } : f,
      ),
    });
  }

  private _removeEntity(index: number, ev?: Event): void {
    ev?.stopPropagation();
    const floor = this._floor();
    const entities = (floor.entities ?? []).filter((_, i) => i !== index);
    if (this._selected === index) this._selected = -1;
    else if (this._selected > index) this._selected--;
    this._modes = {};
    this._emit({
      ...this._config,
      floors: this._floors.map((f) =>
        f.id === this._activeFloor ? { ...f, entities } : f,
      ),
    });
  }

  private _duplicateEntity(index: number, ev?: Event): void {
    ev?.stopPropagation();
    const floor = this._floor();
    const entities = [...(floor.entities ?? [])];
    const copy = { ...entities[index] };
    entities.splice(index + 1, 0, copy);
    this._selected = index + 1;
    this._modes = {};
    this._emit({
      ...this._config,
      floors: this._floors.map((f) =>
        f.id === this._activeFloor ? { ...f, entities } : f,
      ),
    });
  }

  /* --------------------------------------------------------- image upload */

  private _onPickFile = (e: Event): void => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    void this._upload(file);
  };

  private async _upload(file: File): Promise<void> {
    this._uploading = true;
    try {
      const url = await uploadImage(this.hass, file);
      this._broken = new Set(this._broken);
      this._broken.delete(url);
      this._updateFloor({ image: url });
    } catch (err) {
      alert(`Could not upload image:\n${String(err)}`);
    } finally {
      this._uploading = false;
    }
  }

  private _measure = (src: string) => (e: Event): void => {
    const img = e.currentTarget as HTMLImageElement;
    if (!img.naturalWidth) return;
    this._measured = new Map(this._measured).set(src, {
      width: img.naturalWidth,
      height: img.naturalHeight,
    });
  };

  private _onError = (src: string) => (): void => {
    if (this._broken.has(src)) return;
    this._broken = new Set(this._broken).add(src);
  };

  /* ------------------------------------------------------------- pointer */

  private _toImageCoords(e: PointerEvent): { x: number; y: number } | undefined {
    const stage = this.shadowRoot?.querySelector(".stage") as HTMLElement;
    if (!stage) return undefined;
    const rect = stage.getBoundingClientRect();
    if (!rect.width || !rect.height) return undefined;
    const { width, height } = this._size();
    const px = ((e.clientX - rect.left) / rect.width) * width;
    const py = ((e.clientY - rect.top) / rect.height) * height;
    if (this._config.coords === "percent") {
      return { x: (px / width) * 100, y: (py / height) * 100 };
    }
    return {
      x: Math.max(0, Math.min(width, Math.round(px))),
      y: Math.max(0, Math.min(height, Math.round(py))),
    };
  }

  private _onStageDown = (e: PointerEvent): void => {
    if (e.button !== 0) return;
    const wrap = (e.target as HTMLElement).closest(".fp-wrap[data-idx]");
    if (wrap) {
      const idx = Number(wrap.getAttribute("data-idx"));
      this._selected = idx;
      this._drag = { idx, pointerId: e.pointerId };
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      this._config = { ...this._config };
      e.preventDefault();
      return;
    }
    this._selected = -1;
    this._config = { ...this._config };
  };

  /** Updates the dragged entity's position locally; nothing is emitted until drop. */
  private _onStageMove = (e: PointerEvent): void => {
    const drag = this._drag;
    if (!drag) return;
    const pos = this._toImageCoords(e);
    if (!pos) return;
    const floor = this._floor();
    const entity = (floor.entities ?? [])[drag.idx];
    if (!entity) return;
    entity.x = pos.x;
    entity.y = pos.y;
    this._config = { ...this._config };
  };

  /** Commits the drag's final position in a single config-changed event. */
  private _onStageUp = (): void => {
    if (this._drag) this._emit(this._config);
    this._drag = null;
  };

  /* ------------------------------------------------------------ render */

  render(): TemplateResult | typeof nothing {
    if (!this.hass || !this._config) return nothing;
    const floor = this._floor();
    if (!floor) return nothing;

    return html`
      <div class="editor">
        ${this._renderTabs()}
        ${this._renderCardPanel()}
        ${this._renderFloorPanel(floor)}
        ${this._renderEntityPanel(floor)}
      </div>
      ${this._layoutOpen ? this._renderLayoutModal(floor) : nothing}
    `;
  }

  private _renderTabs(): TemplateResult {
    const floors = this._floors;
    return html`
      <div class="tabs">
        ${floors.map(
          (f, i) => html`
            <button
              class="tab ${f.id === this._activeFloor ? "active" : ""}"
              @click=${() => this._switchFloor(f.id!)}
            >
              <span class="tab-name">${f.name ?? f.id}</span>
              <ha-icon
                class="tab-x ${floors.length <= 1 ? "disabled" : ""}"
                icon="mdi:close"
                @click=${(e: Event) => this._removeFloor(i, e)}
              ></ha-icon>
            </button>
          `,
        )}
        <button class="tab add" @click=${this._addFloor}>+ Floor</button>
      </div>
    `;
  }

  /**
   * Full-size drag-and-drop placement surface. Positioning on the small
   * inline stage was fiddly to hit precisely, so it lives behind this
   * dedicated modal instead; entity properties are still edited in the list
   * below. Only ever one `.stage` is in the DOM at a time (this replaces the
   * old inline canvas entirely), so `_toImageCoords` always measures the
   * right element.
   */
  private _renderLayoutModal(floor: FloorConfig): TemplateResult {
    const { width, height } = this._size();
    const aspect = width && height ? `${width} / ${height}` : "4 / 3";
    return html`
      <div class="modal-backdrop" @click=${() => { this._layoutOpen = false; }}>
        <div class="modal" @click=${(e: Event) => e.stopPropagation()}>
          <div class="modal-header">
            <div class="modal-tabs">
              ${this._floors.map(
                (f) => html`
                  <button
                    class="tab ${f.id === this._activeFloor ? "active" : ""}"
                    @click=${() => this._switchFloor(f.id!)}
                  >
                    ${f.name ?? f.id}
                  </button>
                `,
              )}
            </div>
            <div class="modal-actions">
              <button
                @click=${() => {
                  const { width, height } = this._size();
                  this._addEntity(width / 2, height / 2);
                }}
              >
                + Entity
              </button>
              <button class="close" title="Close" @click=${() => { this._layoutOpen = false; }}>
                <ha-icon icon="mdi:close"></ha-icon>
              </button>
            </div>
          </div>
          <div
            class="stage"
            style=${`aspect-ratio:${aspect};width:100%`}
            @pointerdown=${this._onStageDown}
            @pointermove=${this._onStageMove}
            @pointerup=${this._onStageUp}
            @pointercancel=${this._onStageUp}
          >
            ${this._renderStage(floor, width, height)}
          </div>
          <div class="hint">Drag an entity to reposition it — the change saves when you drop it.</div>
        </div>
      </div>
    `;
  }

  private _renderStage(
    floor: FloorConfig,
    width: number,
    height: number,
  ): TemplateResult {
    const src = this._srcOf(floor);
    const entities = floor.entities ?? [];

    const background = src
      ? html`<svg
          class="bg"
          viewBox="0 0 ${width} ${height}"
          preserveAspectRatio="none"
        >
          <image
            href=${src}
            width=${width}
            height=${height}
            preserveAspectRatio=${floor.preserve_aspect_ratio ?? "xMidYMax slice"}
            @load=${this._measure(src)}
            @error=${this._onError(src)}
          ></image>
        </svg>`
      : html`<div class="placeholder">
          <ha-icon icon="mdi:image-plus-outline"></ha-icon>
          <span>${floor.name ?? "Floor"} — no image</span>
        </div>`;

    const overlays = entities.map((entity, i) =>
      this._renderHandle(entity, i, width, height),
    );

    return html`
      ${background}
      <div class="layer">
        ${overlays}
        ${!src
          ? nothing
          : html`<div class="size-chip">${width} ${String.fromCharCode(0x00d7)} ${height}</div>`}
      </div>
    `;
  }

  private _renderHandle(
    entity: FloorEntityConfig,
    index: number,
    width: number,
    height: number,
  ): TemplateResult {
    const left = this._percent(entity.x, width);
    const top = this._percent(entity.y, height);
    const selected = index === this._selected;
    return html`
      <div
        class="fp-wrap ${selected ? "selected" : ""}"
        data-idx=${index}
        style=${`left:${left}%;top:${top}%`}
      >
        <floorplan-entity
          .hass=${this.hass}
          .config=${entity}
          mode="edit"
          ?data-composite=${Boolean(entity.entries?.length)}
        ></floorplan-entity>
        ${selected
          ? html`
              <button
                class="del"
                title="Remove"
                @pointerdown=${(e: Event) => e.stopPropagation()}
                @click=${(e: Event) => this._removeEntity(index, e)}
              >
                <ha-icon icon="mdi:close"></ha-icon>
              </button>
              <div class="coords">
                ${this._config.coords === "percent"
                  ? `${entity.x?.toFixed(1)}%, ${entity.y?.toFixed(1)}%`
                  : `${entity.x ?? 0}, ${entity.y ?? 0}`}
              </div>
            `
          : nothing}
      </div>
    `;
  }

  private _percent(value: number | undefined, span: number): number {
    if (this._config.coords === "percent") return value ?? 0;
    return ((value ?? 0) / (span || 1)) * 100;
  }

  /* ------------------------------------------------------- panel: card */

  private _renderCardPanel(): TemplateResult {
    return html`
      <h3>Card</h3>
      <ha-form
        .hass=${this.hass}
        .data=${this._config}
        .schema=${CARD_SCHEMA}
        .computeLabel=${this._label}
        @value-changed=${(ev: CustomEvent) => {
          ev.stopPropagation();
          this._emit({ ...this._config, ...prune(ev.detail.value) });
        }}
      ></ha-form>
    `;
  }

  /* ----------------------------------------------------- panel: floor */

  private _renderFloorPanel(floor: FloorConfig): TemplateResult {
    const src = this._srcOf(floor);
    const idx = this._floors.indexOf(floor);
    return html`
      <h3>Floor · ${floor.name ?? floor.id}</h3>
      <div class="image-row">
        ${src
          ? html`<img class="thumb" src=${src} @error=${this._onError(src)} />`
          : html`<div class="thumb empty">
              <ha-icon icon="mdi:image-off-outline"></ha-icon>
            </div>`}
        <div class="image-actions">
          <input
            type="file"
            class="file"
            accept="image/*"
            @change=${this._onPickFile}
          />
          <button @click=${this._clickFile}>${this._uploading ? "Uploading…" : "Upload image"}</button>
          ${src
            ? html`<button class="danger" @click=${() => this._updateFloor({ image: undefined })}>Remove image</button>`
            : nothing}
        </div>
      </div>
      <input
        class="text"
        .value=${typeof src === "string" ? src : src ?? ""}
        placeholder="…or image URL (/local/floorplan/eg.png)"
        @change=${(ev: Event) =>
          this._updateFloor({
            image: (ev.target as HTMLInputElement).value || undefined,
          })}
      />
      <ha-form
        .hass=${this.hass}
        .data=${{
          name: floor.name,
          width: floor.width,
          height: floor.height,
          preserve_aspect_ratio: floor.preserve_aspect_ratio,
        }}
        .schema=${FLOOR_SCHEMA}
        .computeLabel=${this._label}
        @value-changed=${(ev: CustomEvent) => {
          ev.stopPropagation();
          this._updateFloor(prune(ev.detail.value));
        }}
      ></ha-form>
      ${this._rowButtons(
        idx,
        this._floors.length,
        (to) =>
          this._emit({
            ...this._config,
            floors: move(this._floors, idx, to),
          }),
        (ev) => this._duplicateFloor(idx, ev),
        () => this._removeFloor(idx),
      )}
    `;
  }

  private _fileInput?: HTMLInputElement;

  private _clickFile = (): void => {
    this._fileInput?.click();
  };

  private _renderEntityRows(floor: FloorConfig): TemplateResult {
    const entities = floor.entities ?? [];
    return html`
      ${entities.map((entity, i) => {
        const open = i === this._selected;
        return html`
          <div class="block ${open ? "open" : ""}">
            <div
              class="block-header"
              @click=${() => {
                this._selected = open ? -1 : i;
                this._config = { ...this._config };
              }}
            >
              <span class="block-title"
                >${entity.entity ||
                (entity.type === "custom"
                  ? "Custom"
                  : entity.type === "composite" || entity.entries?.length
                    ? "Composite"
                    : entity.type === "text"
                      ? "Text"
                      : "Icon")}</span
              >
              <span class="count"
                >${entity.x ?? 0}, ${entity.y ?? 0}</span
              >
              ${this._rowButtons(
                i,
                entities.length,
                (to) => {
                  this._modes = {};
                  this._emit({
                    ...this._config,
                    floors: this._floors.map((f) =>
                      f.id === this._activeFloor
                        ? { ...f, entities: move(entities, i, to) }
                        : f,
                    ),
                  });
                },
                (ev) => this._duplicateEntity(i, ev),
                (ev) => this._removeEntity(i, ev),
              )}
            </div>
            ${open ? this._renderEntityForm(entity, i) : nothing}
          </div>
        `;
      })}
    `;
  }

  /* -------------------------------------------------- panel: entity */

  private _renderEntityPanel(floor: FloorConfig): TemplateResult {
    return html`
      <div class="panel-head">
        <h3>Entities · ${(floor.entities ?? []).length}</h3>
        <button class="mode" @click=${() => { this._layoutOpen = true; }}>
          <ha-icon icon="mdi:arrow-expand-all"></ha-icon> Edit layout
        </button>
      </div>
      ${this._renderEntityRows(floor)}
      <button class="add" @click=${() => {
        const { width, height } = this._size();
        this._addEntity(width / 2, height / 2);
      }}>
        + Entity
      </button>
    `;
  }

  private _renderEntityForm(
    entity: FloorEntityConfig,
    index: number,
  ): TemplateResult {
    const type = entity.type ?? (entity.entries?.length ? "composite" : entity.entity && isValueDomain(entity.entity) ? "text" : "icon");
    const stateMode = this._modes[index]?.state ?? stateModeOf(entity);

    return html`
      <div class="block-body">
        <ha-form
          .hass=${this.hass}
          .data=${{
            entity: entity.entity,
            icon: entity.icon,
            size: entity.size,
            x: entity.x,
            y: entity.y,
            name: entity.name,
            attribute: entity.attribute,
            show_state: entity.show_state,
            state_color: entity.state_color,
            opacity: entity.opacity,
            background: typeof entity.background === "string" ? entity.background : undefined,
            on_color: entity.on_color,
            off_color: entity.off_color,
          }}
          .schema=${ENTITY_SCHEMA}
          .computeLabel=${this._label}
          @value-changed=${(ev: CustomEvent) => {
            ev.stopPropagation();
            this._updateEntity(index, prune(ev.detail.value));
          }}
        ></ha-form>

        ${this._segments(
          "Type",
          TYPE_MODES,
          type,
          (t) => {
            this._setModifier(index, "type", t as EntityType);
            if (t !== "composite")
              this._setModifier(index, "entries", undefined);
          },
        )}
        ${type === "composite"
          ? html`<div class="field">
              <label>Cells (composite) — left/right pill half</label>
              <ha-yaml-editor
                .label=${'- entity: sensor.temprature_kitchen\n  background: "#8c1f1f"\n- entity: sensor.humidity_kitchen\n  background: "#35619f"'}
                .defaultValue=${entity.entries}
                @value-changed=${(ev: CustomEvent) => {
                  ev.stopPropagation();
                  if (!ev.detail.isValid) return;
                  this._setModifier(index, "entries", ev.detail.value);
                }}
              ></ha-yaml-editor>
            </div>`
          : nothing}
        ${this._segments(
          "Layout",
          LAYOUT_MODES,
          entity.layout ?? "column",
          (l) =>
            this._setModifier(
              index,
              "layout",
              l === "column" ? undefined : (l as "column" | "row"),
            ),
        )}

        <div class="field">
          <label>State override — replaces the displayed state text</label>
          ${this._segments(
            "",
            STATE_MODES,
            stateMode,
            (next) => {
              const state =
                next === "none"
                  ? undefined
                  : next === "map"
                    ? typeof entity.state === "object"
                      ? entity.state
                      : { on: "On", off: "Off" }
                    : typeof entity.state === "string"
                      ? entity.state
                      : "{{ states(entity) }}";
              this._modes = { ...this._modes, [index]: { ...this._modes[index], state: next as StateMode } };
              this._setModifier(index, "state", state);
            },
          )}
          ${stateMode === "map"
            ? html`<ha-yaml-editor
                .label=${'Raw state → text. Quote "on" and "off", or YAML turns them into booleans.'}
                .defaultValue=${entity.state}
                @value-changed=${(ev: CustomEvent) => {
                  ev.stopPropagation();
                  if (!ev.detail.isValid) return;
                  this._setModifier(index, "state", ev.detail.value);
                }}
              ></ha-yaml-editor>`
            : stateMode === "template"
              ? html`<input
                  class="text"
                  .value=${(entity.state as string) ?? ""}
                  placeholder="{{ 'On' if is_state(entity, 'on') else 'Off' }}"
                  @change=${(ev: Event) =>
                    this._setModifier(
                      index,
                      "state",
                      (ev.target as HTMLInputElement).value || undefined,
                    )}
                />`
              : nothing}
        </div>

        ${this._renderColor(entity, index)}

        <div class="field">
          <label>Visibility conditions</label>
          <ha-yaml-editor
            .label=${"Empty = always visible"}
            .defaultValue=${entity.visibility}
            @value-changed=${(ev: CustomEvent) => {
              ev.stopPropagation();
              if (!ev.detail.isValid) return;
              this._setModifier(index, "visibility", ev.detail.value);
            }}
          ></ha-yaml-editor>
        </div>

        <ha-form
          .hass=${this.hass}
          .data=${{ tap_action: entity.tap_action, hold_action: entity.hold_action }}
          .schema=${ACTION_SCHEMA}
          .computeLabel=${this._label}
          @value-changed=${(ev: CustomEvent) => {
            ev.stopPropagation();
            this._setModifier(index, "tap_action", ev.detail.value.tap_action);
            this._setModifier(index, "hold_action", ev.detail.value.hold_action);
          }}
        ></ha-form>
      </div>
    `;
  }

  /* -------------------------------------------------------------- color */

  private _renderColor(entity: FloorEntityConfig, index: number): TemplateResult {
    const mode = this._modes[index]?.color ?? colorModeOf(entity);
    const fixed = fixedColorOf(entity);
    const onlyActive = !!simpleColorRule(entity.color)?.active;

    /** A plain string unless it has to be a rule to carry `active`. */
    const writeFixed = (color: string, active: boolean) =>
      this._setModifier(index, "color", active ? [{ color, active: true }] : color);

    return html`
      <div class="field">
        <label>Color</label>
        ${this._segments("", ["none", "fixed", "rules"], mode, (next) => {
          const color =
            next === "none"
              ? undefined
              : next === "fixed"
                ? fixed || "red"
                : Array.isArray(entity.color)
                  ? entity.color
                  : [{ color: fixed || "red" } as ColorRule];
          this._modes = { ...this._modes, [index]: { ...this._modes[index], color: next as ColorMode } };
          this._setModifier(index, "color", color);
        })}
        ${mode === "fixed"
          ? html`
              <input
                class="text"
                .value=${fixed}
                placeholder="red, amber, #ff0000 …"
                @change=${(ev: Event) => writeFixed((ev.target as HTMLInputElement).value, onlyActive)}
              />
              <label class="check">
                <input
                  type="checkbox"
                  .checked=${onlyActive}
                  @change=${(ev: Event) => writeFixed(fixed, (ev.target as HTMLInputElement).checked)}
                />
                Only while the entity is active — otherwise the colour applies in every state
              </label>
            `
          : nothing}
        ${mode === "rules"
          ? html`<ha-yaml-editor
              .label=${"Color rules — first match wins"}
              .defaultValue=${entity.color}
              @value-changed=${(ev: CustomEvent) => {
                ev.stopPropagation();
                if (!ev.detail.isValid) return;
                this._setModifier(index, "color", ev.detail.value as ColorRule[] | undefined);
              }}
            ></ha-yaml-editor>`
          : nothing}
      </div>
    `;
  }

  /* ------------------------------------------------------------ helpers */

  private _segments(
    label: string,
    modes: string[],
    current: string,
    onChange: (mode: string) => void,
  ): TemplateResult {
    return html`
      <div class="seg-row">
        ${label ? html`<span class="seg-label">${label}</span>` : nothing}
        <div class="modes">
          ${modes.map(
            (mode) => html`
              <button
                class="mode ${mode === current ? "selected" : ""}"
                @click=${() => mode !== current && onChange(mode)}
              >
                ${mode}
              </button>
            `,
          )}
        </div>
      </div>
    `;
  }

  private _rowButtons(
    index: number,
    length: number,
    onMove: (to: number) => void,
    onDuplicate: (ev?: Event) => void,
    onDelete: (ev?: Event) => void,
  ): TemplateResult {
    const stop = (ev: Event, fn: () => void) => {
      ev.stopPropagation();
      fn();
    };
    return html`
      <span class="row-buttons">
        <button
          ?disabled=${index === 0}
          @click=${(e: Event) => stop(e, () => onMove(index - 1))}
          title="Move up"
        >
          <ha-icon icon="mdi:arrow-up"></ha-icon>
        </button>
        <button
          ?disabled=${index === length - 1}
          @click=${(e: Event) => stop(e, () => onMove(index + 1))}
          title="Move down"
        >
          <ha-icon icon="mdi:arrow-down"></ha-icon>
        </button>
        <button
          @click=${(e: Event) => stop(e, () => onDuplicate(e))}
          title="Duplicate"
        >
          <ha-icon icon="mdi:content-copy"></ha-icon>
        </button>
        <button
          class="danger"
          @click=${(e: Event) => stop(e, () => onDelete(e))}
          title="Delete"
        >
          <ha-icon icon="mdi:delete"></ha-icon>
        </button>
      </span>
    `;
  }

  static styles = css`
    .editor {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    h3 {
      margin: 10px 0 2px;
      font-size: 0.86rem;
      font-weight: 500;
      color: var(--primary-text-color);
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    h3:first-child {
      margin-top: 0;
    }
    /* ---- tabs ---- */
    .tabs {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 4px;
    }
    .tab {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font: inherit;
      font-size: 0.82rem;
      padding: 5px 10px;
      border: 1px solid var(--divider-color);
      border-radius: 999px;
      background: transparent;
      color: var(--secondary-text-color);
      cursor: pointer;
    }
    .tab.active {
      border-color: var(--primary-color);
      color: var(--primary-color);
    }
    .tab.add {
      border-style: dashed;
    }
    .tab-x {
      --mdc-icon-size: 14px;
      color: var(--secondary-text-color);
    }
    .tab-x.disabled {
      opacity: 0.3;
    }
    .panel-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }
    .panel-head h3 {
      margin: 0;
    }
    .panel-head .mode ha-icon {
      --mdc-icon-size: 14px;
      vertical-align: -2px;
      margin-right: 2px;
    }
    .mode {
      font: inherit;
      font-size: 0.78rem;
      padding: 4px 9px;
      border: 1px solid var(--divider-color);
      border-radius: 999px;
      background: transparent;
      color: var(--secondary-text-color);
      cursor: pointer;
    }
    .mode.selected {
      border-color: var(--primary-color);
      color: var(--primary-color);
    }
    /* ---- layout modal ---- */
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      z-index: 1000;
    }
    .modal {
      display: flex;
      flex-direction: column;
      gap: 10px;
      width: min(92vw, 1100px);
      max-height: 90vh;
      overflow: auto;
      padding: 14px;
      border-radius: 12px;
      background: var(--card-background-color);
      box-shadow: 0 8px 40px rgba(0, 0, 0, 0.4);
    }
    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 8px;
    }
    .modal-tabs {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
    }
    .modal-actions {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .modal-actions .close {
      width: 28px;
      height: 28px;
      padding: 2px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-color: transparent;
    }
    .modal-actions .close ha-icon {
      --mdc-icon-size: 18px;
    }
    .stage {
      position: relative;
      border: 1px solid var(--divider-color);
      border-radius: 10px;
      overflow: hidden;
      touch-action: none;
      background: var(--card-background-color);
    }
    .bg {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
    }
    .layer {
      position: absolute;
      inset: 0;
    }
    .fp-wrap {
      position: absolute;
      display: inline-block;
      transform: translate(-50%, -50%);
      line-height: 0;
    }
    .fp-wrap.selected {
      outline: 2px dashed var(--primary-color);
      outline-offset: 4px;
      border-radius: 6px;
    }
    .fp-wrap .del {
      position: absolute;
      top: -14px;
      right: -14px;
      width: 22px;
      height: 22px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border: none;
      border-radius: 999px;
      background: var(--error-color, #e5534b);
      color: #fff;
      cursor: pointer;
      padding: 0;
    }
    .fp-wrap .del ha-icon {
      --mdc-icon-size: 14px;
    }
    .fp-wrap .coords {
      position: absolute;
      bottom: -20px;
      left: 50%;
      transform: translateX(-50%);
      font-size: 11px;
      color: var(--primary-color);
      background: var(--card-background-color);
      border: 1px solid var(--divider-color);
      padding: 0 5px;
      border-radius: 4px;
      white-space: nowrap;
    }
    .size-chip {
      position: absolute;
      bottom: 6px;
      right: 6px;
      font-size: 11px;
      color: var(--secondary-text-color);
      background: color-mix(in srgb, var(--card-background-color) 80%, transparent);
      padding: 2px 6px;
      border-radius: 4px;
    }
    .placeholder {
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 8px;
      color: var(--secondary-text-color);
      font-size: 0.85rem;
    }
    .hint {
      font-size: 0.74rem;
      color: var(--secondary-text-color);
    }
    /* ---- floor image row ---- */
    .image-row {
      display: flex;
      gap: 8px;
      align-items: center;
    }
    .thumb {
      width: 64px;
      height: 64px;
      object-fit: cover;
      border-radius: 6px;
      background: var(--secondary-background-color, rgba(127, 127, 127, 0.08));
    }
    .thumb.empty {
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .image-actions {
      display: flex;
      flex-direction: column;
      gap: 4px;
      align-items: flex-start;
    }
    .file {
      display: none;
    }
    button {
      font: inherit;
      font-size: 0.8rem;
      padding: 5px 10px;
      border: 1px solid var(--divider-color);
      border-radius: 999px;
      background: transparent;
      color: var(--primary-text-color);
      cursor: pointer;
    }
    button:disabled {
      opacity: 0.35;
      cursor: default;
    }
    button.danger:hover {
      border-color: var(--error-color, #e5534b);
      color: var(--error-color, #e5534b);
    }
    .add {
      align-self: flex-start;
    }
    .text {
      font: inherit;
      font-size: 0.85rem;
      padding: 6px 8px;
      border: 1px solid var(--divider-color);
      border-radius: 6px;
      background: var(--card-background-color);
      color: var(--primary-text-color);
    }
    /* ---- entity blocks ---- */
    .block {
      border: 1px solid var(--divider-color);
      border-radius: 8px;
      overflow: hidden;
    }
    .block-header {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 7px 8px;
      cursor: pointer;
      background: var(--secondary-background-color, rgba(127, 127, 127, 0.08));
    }
    .block-title {
      flex: 1;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-size: 0.86rem;
      color: var(--primary-text-color);
    }
    .block.open {
      border-color: var(--primary-color);
    }
    .count {
      flex: none;
      font-size: 0.7rem;
      color: var(--secondary-text-color);
    }
    .block-body {
      display: flex;
      flex-direction: column;
      gap: 10px;
      padding: 10px;
      background: var(--card-background-color);
    }
    .row-buttons {
      display: flex;
      gap: 2px;
    }
    .row-buttons button {
      padding: 2px;
      width: 24px;
      height: 24px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-color: transparent;
      color: var(--secondary-text-color);
    }
    .row-buttons button:hover:not(:disabled) {
      border-color: var(--divider-color);
      color: var(--primary-text-color);
    }
    .row-buttons ha-icon {
      --mdc-icon-size: 16px;
    }
    .field {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }
    .field > label,
    .seg-label {
      font-size: 0.74rem;
      color: var(--secondary-text-color);
    }
    .seg-row {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .modes {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
    }
    .check {
      display: flex;
      align-items: center;
      gap: 6px;
      cursor: pointer;
      font-size: 0.74rem;
      color: var(--secondary-text-color);
    }
    .check input {
      flex: none;
      margin: 0;
    }
  `;
}

if (!customElements.get("floorplan-card-editor")) {
  customElements.define("floorplan-card-editor", FloorplanEditor);
}
