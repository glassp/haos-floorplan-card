import { LitElement, css, html, nothing, type TemplateResult } from "lit";
import "./entity";
import { isImageTemplate, resolveImage, stageSizeOf, type StageSize } from "./image";
import type {
  FloorConfig,
  FloorEntityConfig,
  FloorplanCardConfig,
  HomeAssistant,
} from "./types";

const STORAGE_PREFIX = "floorplan-card.floor.";

export class FloorplanCard extends LitElement {
  static properties = {
    hass: { attribute: false },
    _config: { state: true },
    _activeFloor: { state: true },
    _measured: { state: true },
    _broken: { state: true },
  };

  hass!: HomeAssistant;
  private _config!: FloorplanCardConfig;
  private _activeFloor?: string;
  /** Natural size of each image URL we have loaded, so floors without an explicit size just work. */
  private _measured = new Map<string, StageSize>();
  /** Image URLs that failed — a swapped-out upload shows a placeholder, not a stale image. */
  private _broken = new Set<string>();

  /** Last resolved URL per template string. */
  private _imageResult = new Map<string, string>();
  /** Unsubscribe handles per template string. */
  private _imageUnsubs = new Map<string, Promise<() => void>>();
  /** Templates we already subscribed to. */
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
    return src && isImageTemplate(src)
      ? this._imageResult.get(src)
      : src;
  }

  static async getConfigElement(): Promise<HTMLElement> {
    await import("./editor");
    return document.createElement("floorplan-card-editor");
  }

  static getStubConfig(): FloorplanCardConfig {
    return {
      type: "custom:floorplan-card-next",
      floors: [
        {
          id: "eg",
          name: "Ground floor",
          width: 545,
          height: 725,
          entities: [],
        },
      ],
    };
  }

  setConfig(config: FloorplanCardConfig): void {
    if (!config) throw new Error("Invalid configuration");
    const floors = config.floors ?? [];
    if (!Array.isArray(floors)) throw new Error("`floors` must be a list");
    for (const floor of floors) {
      if (!Array.isArray(floor.entities ?? [])) {
        throw new Error(`Floor "${floor.name ?? floor.id}" needs an \`entities\` list`);
      }
    }
    this._config = config;
    if (
      !this._activeFloor ||
      !floors.some((floor) => floor.id === this._activeFloor)
    ) {
      this._activeFloor = this._storedFloor();
    }
  }

  private get _floors(): FloorConfig[] {
    return this._config?.floors ?? [];
  }

  private get _forceNewFloor(): boolean {
    const active = this._activeFloor;
    return !active || !this._floors.some((f) => f.id === active);
  }

  private _floor(): FloorConfig | undefined {
    if (this._forceNewFloor) return this._floors[0];
    return this._floors.find((f) => f.id === this._activeFloor) ?? this._floors[0];
  }

  private _storedFloor(): string | undefined {
    if (this._config?.remember_floor === false) return undefined;
    const stored = localStorage.getItem(STORAGE_PREFIX + "last");
    if (stored && this._floors.some((f) => f.id === stored)) return stored;
    return this._config?.default_floor ??
      this._floors[0]?.id;
  }

  private _switchFloor(id: string): void {
    this._activeFloor = id;
    if (this._config.remember_floor !== false) {
      try {
        localStorage.setItem(STORAGE_PREFIX + "last", id);
      } catch {
        /* private mode */
      }
    }
  }

  private _percent(value: number | undefined, span: number): number {
    if (this._config.coords === "percent") return value ?? 0;
    return ((value ?? 0) / (span || 1)) * 100;
  }

  private _measure = (src: string) => (e: Event): void => {
    const img = e.currentTarget as HTMLImageElement;
    if (!img.naturalWidth) return;
    const next = new Map(this._measured).set(src, {
      width: img.naturalWidth,
      height: img.naturalHeight,
    });
    this._measured = next;
  };

  private _onError = (src: string) => (): void => {
    if (this._broken.has(src)) return;
    this._broken = new Set(this._broken).add(src);
  };

  render(): TemplateResult | typeof nothing {
    if (!this.hass || !this._config) return nothing;
    const floor = this._floor();
    if (!floor) return nothing;

    const src = this._srcOf(floor);
    const measured = src ? this._measured.get(src) : undefined;
    const size = stageSizeOf(floor, measured);
    const { width, height } = size;
    const aspect = width && height ? `${width} / ${height}` : "4 / 3";
    const stageStyle = [
      `aspect-ratio:${aspect}`,
      this._config.height ? `height:${this._config.height}px;width:auto;margin:0 auto;` : "width:100%",
    ].join(";");
    const stageStyleProp = stageStyle;

    return html`
      <ha-card>
        ${this._renderHeader(this._floors, floor)}
        <div
          class="stage"
          style=${stageStyleProp}
        >
          ${this._renderBackground(floor, src, width, height)}
          <div class="layer">
            ${(floor.entities ?? []).map((entity) =>
              this._renderEntity(entity, width, height),
            )}
          </div>
        </div>
      </ha-card>
    `;
  }

  private _renderHeader(
    floors: FloorConfig[],
    floor: FloorConfig,
  ): TemplateResult | typeof nothing {
    const pills =
      floors.length > 1 && this._config.show_floor_selector !== false;
    if (!this._config.title && !pills) return nothing;
    return html`
      <div class="header">
        ${this._config.title
          ? html`<div class="title">${this._config.title}</div>`
          : nothing}
        ${pills
          ? html`<div class="pills">
              ${floors.map(
                (f) => html`
                  <button
                    class="pill ${f.id === floor.id ? "active" : ""}"
                    @click=${() => this._switchFloor(f.id!)}
                  >
                    ${f.name ?? f.id}
                  </button>
                `,
              )}
            </div>`
          : nothing}
      </div>
    `;
  }

  private _renderBackground(
    floor: FloorConfig,
    src: string | undefined,
    width: number,
    height: number,
  ): TemplateResult | typeof nothing {
    if (src && this._broken.has(src)) return nothing;
    if (!src) {
      return html`<div class="placeholder">
        <ha-icon icon="mdi:image-off-outline"></ha-icon>
        <span>${floor.name ?? floor.id ?? "Floor"}</span>
      </div>`;
    }
    const par = floor.preserve_aspect_ratio ?? "xMidYMax slice";
    return html`
      <svg
        class="bg"
        viewBox="0 0 ${width} ${height}"
        preserveAspectRatio="none"
      >
        <image
          href=${src}
          width=${width}
          height=${height}
          preserveAspectRatio=${par}
          @load=${this._measure(src)}
          @error=${this._onError(src)}
        ></image>
      </svg>
    `;
  }

  private _renderEntity(
    entity: FloorEntityConfig,
    width: number,
    height: number,
  ): TemplateResult {
    const left = this._percent(entity.x, width);
    const top = this._percent(entity.y, height);
    return html`
      <div
        class="entity"
        style=${`left:${left}%;top:${top}%`}
      >
        <floorplan-entity
          class="view"
          .hass=${this.hass}
          .config=${entity}
          mode="view"
          ?data-composite=${Boolean(entity.entries?.length)}
        ></floorplan-entity>
      </div>
    `;
  }

  getCardSize(): number {
    return 1 + (this._config?.floors?.length ? 1 : 0);
  }

  getGridOptions() {
    return { rows: "auto", columns: "full", min_columns: 4 };
  }

  static styles = css`
    ha-card {
      overflow: hidden;
    }
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      padding: 10px 12px 4px;
    }
    .title {
      font-size: 1rem;
      font-weight: 500;
      color: var(--primary-text-color);
    }
    .pills {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-left: auto;
    }
    .pill {
      font: inherit;
      font-size: 0.82rem;
      font-weight: 500;
      padding: 5px 12px;
      border: 1px solid var(--divider-color);
      border-radius: 999px;
      background: var(--card-background-color);
      color: var(--secondary-text-color);
      cursor: pointer;
    }
    .pill.active {
      border-color: var(--primary-color);
      color: var(--primary-color);
      background: color-mix(
        in srgb,
        var(--primary-color) 14%,
        transparent
      );
    }
    .stage {
      position: relative;
      margin: 0 auto;
    }
    .bg {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      border-radius: 4px;
      overflow: hidden;
    }
    .bg image {
      width: 100%;
      height: 100%;
    }
    .layer {
      position: absolute;
      inset: 0;
      overflow: visible;
    }
    .entity {
      position: absolute;
      display: inline-block;
      transform: translate(-50%, -50%);
    }
    .placeholder {
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 8px;
      border: 1px dashed var(--divider-color);
      border-radius: 8px;
      color: var(--secondary-text-color);
      font-size: 0.85rem;
    }
  `;
}

if (!customElements.get("floorplan-card-next")) {
  customElements.define("floorplan-card-next", FloorplanCard);
}