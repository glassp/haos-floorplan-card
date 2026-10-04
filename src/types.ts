export interface HassEntity {
  entity_id: string;
  state: string;
  attributes: Record<string, any>;
  last_changed: string;
}

export interface HomeAssistant {
  states: Record<string, HassEntity>;
  areas: Record<string, any>;
  devices: Record<string, any>;
  entities: Record<string, any>;
  user?: { id: string; name: string };
  themes: unknown;
  language: string;
  locale: unknown;
  auth?: { access_token?: string };
  connection?: {
    subscribeMessage(
      callback: (message: { result: string }) => void,
      message: Record<string, any>
    ): Promise<() => void>;
  };
  callService(
    domain: string,
    service: string,
    data?: Record<string, any>,
    target?: Record<string, any>
  ): Promise<unknown>;
  formatEntityState(stateObj: HassEntity, state?: string): string;
  formatEntityAttributeValue(stateObj: HassEntity, attribute: string): string;
}

/** Home Assistant style conditions. A list is AND-ed together. */
export type Condition =
  | { condition: "state"; entity: string; state?: string | string[]; state_not?: string | string[]; attribute?: string }
  | { condition: "numeric_state"; entity: string; above?: number; below?: number; attribute?: string }
  | { condition: "and"; conditions: Condition[] }
  | { condition: "or"; conditions: Condition[] }
  | { condition: "not"; conditions: Condition[] }
  | { condition: "user"; users: string[] }
  | { condition: "exists"; entity: string };

export type ActionConfig =
  | { action: "none" }
  | { action: "toggle" }
  | { action: "more-info"; entity?: string }
  | { action: "navigate"; navigation_path: string }
  | { action: "url"; url_path: string }
  | { action: "perform-action"; perform_action: string; target?: Record<string, any>; data?: Record<string, any> };

/**
 * One conditional colour. Rules are evaluated in order and the first match
 * wins; a rule with no conditions is the fallback.
 */
export interface ColorRule {
  when?: Condition[];
  /** Additionally require the entity to be on/open/non-zero. */
  active?: boolean;
  /** An HA colour name (`red`, `amber`, …) or any CSS colour. */
  color: string;
}

/** What a placed entity draws on top of the floor image. */
export type EntityType = "icon" | "text" | "custom" | "composite";

/**
 * One section of a `composite` chip, e.g. the red temperature half next to
 * the blue humidity half. Entries share the chip's position and lay out in a
 * row, each taking `weight` share of the width.
 */
export interface CompositeEntry {
  /** Entity whose state is shown. */
  entity?: string;
  /** Optional icon before the text. */
  icon?: string;
  /** Show an attribute value instead of the state. */
  attribute?: string;
  /** Override the text: a Jinja template string, or a raw->label map. */
  state?: string | Record<string, string>;
  /** Fixed colour, or {@link ColorRule}s like on the parent. */
  color?: string | ColorRule[];
  /** Background tint of this cell (e.g. `#8c1f1f`). */
  background?: string;
  /** Flex weight — how wide this cell is vs its siblings. Default 1. */
  weight?: number;
  /** Minimum width in px so short cells don't get squeezed. */
  min_width?: number;
  /** Action when this cell is tapped (default: more-info on the cell entity). */
  tap_action?: ActionConfig;
  /** Action when this cell is long-pressed. */
  hold_action?: ActionConfig;
}

/**
 * One entity placed on a floor. `x`/`y` are pixel coordinates in the floor's
 * image space (the floor's `width`/`height`, or its natural image size), or
 * percentages when the card's `coords` is `percent`.
 */
export interface FloorEntityConfig {
  entity?: string;
  x?: number;
  y?: number;
  type?: EntityType;
  /** Icon size / text font size in px. Default 32 for icon, 14 for text. */
  size?: number;
  /** Explicit mdi icon. Only meaningful for `type: icon`. */
  icon?: string;
  /** Caption shown with the content. `false` hides the entity's friendly name. */
  name?: string | boolean;
  /** Show the entity's state as text under/next to the content. */
  show_state?: boolean;
  /** Tint the icon while the entity is "active". Default true. */
  state_color?: boolean;
  /** Icon colour while the entity is active ("on"). Default yellow. */
  on_color?: string;
  /** Icon colour while the entity is inactive ("off"). Default white. */
  off_color?: string;
  /**
   * Overrides the displayed state text, the way cards override names: a map
   * from raw state to text, or a Jinja template string rendered by HA.
   */
  state?: string | Record<string, string>;
  /** Show an attribute value instead of the state. */
  attribute?: string;
  /** Raw HTML/SVG, only for `type: custom`. Rendered verbatim. */
  content?: string;
  /**
   * Composite chip sections (type `composite`): several infos in one pill,
   * e.g. `[{ entity: sensor.temprature_garage, background: "#8c1f1f" },
   * { entity: sensor.humidity_garage, background: "#35619f" }]`.
   * When present, `type` can be omitted (it infers `composite`).
   */
  entries?: CompositeEntry[];
  /** Background colour for icon/text/custom chips, e.g. `#212121cc`.
   *  `false` renders the icon without a chip. */
  background?: string | boolean;
  /** Text colour. A fixed string, or rules that pick one per state. */
  color?: string | ColorRule[];
  /** Content opacity, 0–1. Default 1. */
  opacity?: number;
  /** Stack the caption/state column (default) or in a row. */
  layout?: "column" | "row";
  visibility?: Condition[];
  tap_action?: ActionConfig;
  hold_action?: ActionConfig;
}

export interface FloorConfig {
  /** Stable id used for `default_floor` and the persisted choice. */
  id?: string;
  name?: string;
  /**
   * Background image. Any URL, or HA's own image ref. Uploading through the
   * visual editor stores it as an HA-hosted `/api/image/serve/...` URL, and
   * uploading again yields a fresh URL — that is the cache invalidation:
   * a swapped image is never a stale one.
   */
  image?: string | { media_content_id?: string };
  /** Image space width/height. Falls back to the loaded image's natural size. */
  width?: number;
  height?: number;
  /**
   * How the image is scaled into the floor's width×height box (SVG
   * `preserveAspectRatio`). `xMidYMax slice` (default) zoom-crops the image
   * to fill, anchored bottom-centre — the classic floorplan look. Use
   * `xMinYMin slice` / `xMidYMid slice` to anchor elsewhere, `none` to
   * stretch, or `xMidYMid meet` to letterbox.
   */
  preserve_aspect_ratio?: string;
  entities?: FloorEntityConfig[];
}

export interface FloorplanCardConfig {
  type: string;
  title?: string;
  floors?: FloorConfig[];
  /** Floor id to start on. Defaults to the first floor. */
  default_floor?: string;
  /** Persist the last viewed floor in localStorage. Default true. */
  remember_floor?: boolean;
  /**
   * Coordinate space for `x`/`y`. `pixels` (default) are stable when the
   * background image is swapped; `percent` rescale with the image.
   */
  coords?: "percent" | "pixels";
  /** Target stage height in px (width follows the image ratio). */
  height?: number;
  /** Hide the floor pills. Automatic once more than one floor is configured. */
  show_floor_selector?: boolean;
  theme?: string;
}