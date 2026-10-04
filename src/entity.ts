import { LitElement, css, html, nothing, type TemplateResult } from "lit";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import { checkConditions } from "./conditions";
import {
  formatState,
  handleAction,
  isActive,
  isUnavailable,
  isValueDomain,
} from "./hass-helpers";
import type {
  ColorRule,
  CompositeEntry,
  FloorEntityConfig,
  HassEntity,
  HomeAssistant,
} from "./types";

/** Is this entity allowed to render right now? */
export const entityVisible = (
  hass: HomeAssistant,
  config: FloorEntityConfig | undefined,
): boolean => {
  if (!config) return true;
  if (!checkConditions(hass, config.entity, config.visibility)) return false;
  if (config.entity && !hass.states[config.entity]) return false;
  return true;
};

/** Raw state -> label, with `on`/`off` aliasing to `true`/`false`. */
const labelOf = (
  map: Record<string, string>,
  raw: string,
): string | undefined =>
  map[raw] ??
  (raw === "on"
    ? map["true"]
    : raw === "off"
      ? map["false"]
      : undefined);

/**
 * The most urgent colour in the rules, or a fixed colour, or undefined for
 * "let Home Assistant decide".
 */
export const resolveEntityColor = (
  hass: HomeAssistant,
  config: FloorEntityConfig | undefined,
): string | undefined => {
  const color = config?.color;
  if (!color) return undefined;
  if (typeof color === "string") return color;
  const stateObj = config?.entity ? hass.states[config.entity] : undefined;
  for (const rule of color) {
    if (rule.when && !checkConditions(hass, config?.entity, rule.when))
      continue;
    if (rule.active && !isActive(stateObj)) continue;
    return (rule as ColorRule).color;
  }
  return undefined;
};

export class FloorplanEntity extends LitElement {
  static properties = {
    hass: { attribute: false },
    config: { attribute: false },
    /** "view" runs interactions; "edit" renders inert for the editor's drag layer. */
    mode: { attribute: "mode" },
  };

  hass!: HomeAssistant;
  config!: FloorEntityConfig;
  mode: "view" | "edit" = "view";

  private _holdTimer?: number;
  private _held = false;
  /** Template string -> last rendered result. */
  private _templateResults = new Map<string, string>();
  /** Template string -> unsubscribe handle. */
  private _templateSubs = new Map<string, Promise<() => void>>();

  connectedCallback(): void {
    super.connectedCallback();
    this._manageTemplates();
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    for (const unsub of this._templateSubs.values()) {
      unsub.then((fn) => fn()).catch(() => {});
    }
    this._templateSubs.clear();
    this._templateResults.clear();
  }

  updated(): void {
    this._manageTemplates();
  }

  /** All Jinja templates in play: the `state` override + every entry's `state`. */
  private _desiredTemplates(): string[] {
    const list: string[] = [];
    const state = this.config?.state;
    if (typeof state === "string") list.push(state);
    for (const entry of this.config?.entries ?? []) {
      if (typeof entry.state === "string") list.push(entry.state);
    }
    return list;
  }

  /** Keeps the Jinja `state`/entries subscriptions in step with the config. */
  private _manageTemplates(): void {
    if (!this.isConnected || !this.hass?.connection) return;
    const desired = new Set(this._desiredTemplates());

    for (const [template, unsub] of this._templateSubs) {
      if (desired.has(template)) continue;
      unsub.then((fn) => fn()).catch(() => {});
      this._templateSubs.delete(template);
      this._templateResults.delete(template);
    }

    for (const template of desired) {
      if (this._templateSubs.has(template)) continue;
      const handle = this.hass.connection
        .subscribeMessage(
          (message) => {
            this._templateResults.set(template, message.result);
            this.requestUpdate();
          },
          {
            type: "render_template",
            template,
            variables: { entity: this.config?.entity },
            report_errors: false,
          },
        )
        .catch(() => {
          this._templateSubs.delete(template);
          this._templateResults.delete(template);
          return () => {};
        });
      this._templateSubs.set(template, handle);
    }
  }

  private get _type(): NonNullable<FloorEntityConfig["type"]> {
    if (this.config?.entries?.length) return "composite";
    const type = this.config?.type;
    if (type) return type;
    if (this.config?.entity && isValueDomain(this.config.entity)) return "text";
    return "icon";
  }

  private get _size(): number {
    const size = this.config?.size;
    if (size && size > 0) return size;
    return this._type === "icon" ? 32 : 14;
  }

  /** The state text: a rendered template, a mapped label, or HA's own formatting. */
  private _stateText(stateObj?: HassEntity): string {
    const override = this.config?.state;
    if (typeof override === "string") return this._templateResults.get(override) ?? "";
    if (!stateObj) return "";

    if (override && typeof override === "object") {
      const raw = this.config.attribute
        ? String(stateObj.attributes[this.config.attribute])
        : stateObj.state;
      const mapped = labelOf(override, raw);
      if (mapped !== undefined) return mapped;
    }
    return formatState(this.hass, stateObj, this.config?.attribute);
  }

  /** Per-entry state text, honouring the entry's own override/attribute. */
  private _entryText(entry: CompositeEntry, stateObj?: HassEntity): string {
    const override = entry.state;
    if (typeof override === "string") return this._templateResults.get(override) ?? "";
    if (!stateObj) return "";

    if (override && typeof override === "object") {
      const raw = entry.attribute
        ? String(stateObj.attributes[entry.attribute])
        : stateObj.state;
      const mapped = labelOf(override, raw);
      if (mapped !== undefined) return mapped;
    }
    return formatState(this.hass, stateObj, entry.attribute);
  }

  /** Resolve an entry's colour rules / fixed colour. */
  private _entryColor(entry: CompositeEntry): string | undefined {
    return resolveEntityColor(this.hass, {
      entity: entry.entity,
      color: entry.color,
    } as FloorEntityConfig);
  }

  /* ---------------------------------------------------------- interaction */

  private _onPointerDown = (): void => {
    if (!this.config?.hold_action || this.mode !== "view") return;
    if (this.config.entries?.length) return;
    this._held = false;
    this._holdTimer = window.setTimeout(() => {
      this._held = true;
      handleAction(this, this.hass, this.config.hold_action, this.config.entity);
    }, 500);
  };

  private _cancelHold = (): void => {
    if (this._holdTimer) clearTimeout(this._holdTimer);
    this._holdTimer = undefined;
  };

  private _onClick = (ev: Event): void => {
    if (this.mode !== "view") return;
    ev.stopPropagation();
    this._cancelHold();
    if (this._held) {
      this._held = false;
      return;
    }
    if (this.config?.entries?.length) return;
    handleAction(
      this,
      this.hass,
      this.config?.tap_action,
      this.config?.entity,
    );
  };

  /** A composite cell opens the cell's own entity (its `tap_action` or more-info). */
  private _onEntryClick = (ev: Event, entry: CompositeEntry): void => {
    if (this.mode !== "view") return;
    ev.stopPropagation();
    this._cancelHold();
    if (this._held) {
      this._held = false;
      return;
    }
    handleAction(this, this.hass, entry.tap_action, entry.entity);
  };

  /* ------------------------------------------------------------ rendering */

  render(): TemplateResult | typeof nothing {
    const config = this.config ?? {};
    if (!this.hass || !entityVisible(this.hass, config)) return nothing;

    const stateObj = config.entity ? this.hass.states[config.entity] : undefined;
    const unavailable = !!config.entity && isUnavailable(stateObj);
    const type = this._type;
    const size = this._size;

    const color = resolveEntityColor(this.hass, config);
    // On/off tinting: off = white, on = yellow (overridable per entity).
    const onColor = config.on_color ?? "var(--state-icon-active-color, #fdd835)";
    const offColor = config.off_color ?? "#fff";
    const useTint =
      config.state_color !== false &&
      type === "icon" &&
      !!config.entity &&
      !isValueDomain(config.entity);
    const iconColor =
      color ?? (useTint ? (isActive(stateObj) ? onColor : offColor) : undefined);

    const nameShown =
      type !== "custom" &&
      config.name !== undefined &&
      config.name !== false &&
      !unavailable;
    const caption =
      nameShown && typeof config.name === "string"
        ? config.name
        : nameShown
          ? stateObj?.attributes.friendly_name ?? ""
          : "";
    const stateText = this._stateText(stateObj);
    const showState =
      type === "text" ||
      ((config.show_state ?? false) && !!stateText && !unavailable);

    const layout = config.layout === "row" ? "row" : "column";
    const textColor = color ?? "var(--primary-text-color)";

    const iconInner = html`<span
        class="icon-wrap"
        style=${iconColor ? `color:${iconColor}` : ""}
      >
        <ha-state-icon
          class="icon"
          .hass=${this.hass}
          .stateObj=${stateObj}
          .icon=${config.icon}
        ></ha-state-icon>
      </span>`;
    const iconElement =
      type === "icon"
        ? config.background === false
          ? iconInner
          : html`<span
              class="icon-chip"
              style=${`background:${typeof config.background === "string"
                ? config.background
                : "rgba(0,0,0,0.55)"}`}
              >${iconInner}</span
            >`
        : nothing;

    const captionEl = caption
      ? html`<span class="caption">${caption}</span>`
      : nothing;

    const stateTextEl =
      type === "text"
        ? html`<span
            class="text-pill"
            style=${[
              `--fp-size:${size}px`,
              textColor ? `color:${textColor}` : "",
              config.background ? `background:${config.background}` : "",
            ]
              .filter(Boolean)
              .join(";")}
            >${stateText}</span
          >`
        : showState
          ? html`<span class="state-text">${stateText}</span>`
          : nothing;

    const customEl =
      type === "custom"
        ? html`<div
            class="custom"
            style=${`font-size:${size}px;color:${textColor};${config.background ? `background:${config.background}` : ""}`}
            >${unsafeHTML(config.content ?? "")}</div
          >`
        : nothing;

    const compositeEl =
      type === "composite"
        ? html`<div class="composite">
            ${(config.entries ?? []).map((entry) => {
              const eState = entry.entity
                ? this.hass.states[entry.entity]
                : undefined;
              const eColor = this._entryColor(entry);
              const style = [
                `flex:${entry.weight ?? 1}`,
                entry.min_width ? `min-width:${entry.min_width}px` : "",
                eColor ? `color:${eColor}` : "",
                entry.background ? `background:${entry.background}` : "",
              ]
                .filter(Boolean)
                .join(";");
              return html`<div
                class="entry"
                style=${style}
                role="button"
                tabindex=${this.mode === "view" ? 0 : -1}
                @click=${(ev: Event) => this._onEntryClick(ev, entry)}
                @keydown=${(ev: KeyboardEvent) => {
                  if (this.mode === "view" && ev.key === "Enter") {
                    ev.stopPropagation();
                    this._onEntryClick(ev, entry);
                  }
                }}
              >
                ${entry.icon
                  ? html`<ha-state-icon
                      class="entry-icon"
                      .hass=${this.hass}
                      .stateObj=${eState}
                      .icon=${entry.icon}
                    ></ha-state-icon>`
                  : nothing}
                <span class="entry-text"
                  >${this._entryText(entry, eState)}</span
                >
              </div>`;
            })}
          </div>`
        : nothing;

    const content =
      type === "custom"
        ? customEl
        : type === "composite"
          ? compositeEl
          : html`${iconElement}${captionEl}${stateTextEl}`;

    return html`
      <div
        class="content ${layout} ${unavailable ? "unavailable" : ""}"
        style=${`--fp-size:${size}px;opacity:${config.opacity ?? 1}`}
        role="button"
        tabindex=${this.mode === "view" ? 0 : -1}
        @click=${this._onClick}
        @pointerdown=${this._onPointerDown}
        @pointerup=${this._cancelHold}
        @pointercancel=${this._cancelHold}
        @pointerleave=${this._cancelHold}
      >
        ${content}
      </div>
    `;
  }

  static styles = css`
    :host {
      display: block;
      --fp-size: 32px;
    }
    /* The editor places and drags these itself; keep the element inert. */
    :host([mode="edit"]) {
      pointer-events: none;
    }
    .content {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 2px;
      text-align: center;
      line-height: 1.15;
    }
    .content.row {
      flex-direction: row;
      gap: 6px;
    }
    :host([mode="view"]) .content {
      cursor: pointer;
    }
    .content:focus-visible {
      outline: 2px solid var(--primary-color);
      outline-offset: 2px;
    }
    .icon-wrap {
      display: flex;
      color: var(--state-icon-color, #fff);
      filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.6));
    }
    .icon-chip {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 999px;
      padding: calc(var(--fp-size) * 0.12);
      line-height: 0;
    }
    .icon-wrap ha-state-icon {
      --mdc-icon-size: var(--fp-size);
      color: inherit;
      display: block;
    }
    .caption {
      max-width: 8rem;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-size: calc(var(--fp-size) / 2.4);
      font-weight: 500;
      color: #fff;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.7);
    }
    .state-text {
      font-size: calc(var(--fp-size) / 1.9);
      font-weight: 600;
      color: #fff;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.7);
      white-space: nowrap;
    }
    .text-pill {
      display: inline-block;
      font-size: var(--fp-size);
      font-weight: 500;
      line-height: 1.2;
      padding: 4px 8px;
      border-radius: 8px;
      background: rgba(0, 0, 0, 0.55);
      white-space: nowrap;
    }
    .custom {
      font-size: var(--fp-size);
      color: var(--primary-text-color);
    }
    .composite {
      display: flex;
      align-items: stretch;
      font-size: var(--fp-size);
      line-height: 1.2;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
    }
    .entry {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 3px;
      padding: 4px 8px;
      white-space: nowrap;
      min-width: 0;
      color: #fff;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
    }
    :host([mode="view"]) .entry {
      cursor: pointer;
    }
    .entry:focus-visible {
      outline: 2px solid var(--primary-color);
      outline-offset: -2px;
    }
    .entry-icon ha-state-icon {
      --mdc-icon-size: calc(var(--fp-size) * 1.15);
      color: inherit;
      display: block;
    }
    .entry-text {
      font-weight: 500;
    }
    .unavailable {
      opacity: 0.5;
    }
  `;
}

if (!customElements.get("floorplan-entity")) {
  customElements.define("floorplan-entity", FloorplanEntity);
}