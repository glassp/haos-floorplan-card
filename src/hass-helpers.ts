import type { ActionConfig, HassEntity, HomeAssistant } from "./types";

export const UNAVAILABLE = ["unavailable", "unknown", "none"];

/** Domains where the state itself is the interesting value, not an on/off. */
const VALUE_DOMAINS = new Set([
  "sensor",
  "number",
  "input_number",
  "input_text",
  "input_select",
  "select",
  "text",
  "counter",
  "climate",
  "weather",
  "person",
  "device_tracker",
  "sun",
]);

const OFF_STATES = new Set([
  "off",
  "closed",
  "locked",
  "not_home",
  "idle",
  "docked",
  "standby",
  "disarmed",
  "false",
]);

export const domainOf = (entityId: string): string => entityId.split(".")[0];

export const isValueDomain = (entityId: string): boolean =>
  VALUE_DOMAINS.has(domainOf(entityId));

export const isUnavailable = (stateObj?: HassEntity): boolean =>
  !stateObj || UNAVAILABLE.includes(stateObj.state);

/** Whether an entity counts as "active" — drives icon tinting and `active` colour rules. */
export const isActive = (stateObj?: HassEntity): boolean => {
  if (isUnavailable(stateObj)) return false;
  const state = stateObj!.state;
  if (OFF_STATES.has(state)) return false;
  if (isValueDomain(stateObj!.entity_id)) {
    const num = Number(state);
    return Number.isNaN(num) ? true : num !== 0;
  }
  return true;
};

export const formatState = (
  hass: HomeAssistant,
  stateObj: HassEntity,
  attribute?: string,
): string => {
  try {
    return attribute
      ? hass.formatEntityAttributeValue(stateObj, attribute)
      : hass.formatEntityState(stateObj);
  } catch {
    return attribute
      ? String(stateObj.attributes[attribute] ?? "")
      : stateObj.state;
  }
};

/** The states Home Assistant itself counts as "off" when deciding a toggle. */
const STATES_OFF = ["closed", "locked", "off"];

export const toggleEntity = (
  hass: HomeAssistant,
  entityId: string,
): void => {
  const stateObj = hass.states[entityId];
  if (!stateObj) return;

  const domain = domainOf(entityId);
  const turnOn = STATES_OFF.includes(stateObj.state);
  const serviceDomain = domain === "group" ? "homeassistant" : domain;

  let service: string;
  switch (domain) {
    case "lock":
      service = turnOn ? "unlock" : "lock";
      break;
    case "cover":
      service = turnOn ? "open_cover" : "close_cover";
      break;
    case "valve":
      service = turnOn ? "open_valve" : "close_valve";
      break;
    case "button":
    case "input_button":
      service = "press";
      break;
    case "scene":
      service = "turn_on";
      break;
    default:
      service = turnOn ? "turn_on" : "turn_off";
  }

  hass.callService(serviceDomain, service, { entity_id: entityId });
};

export const fireEvent = (
  node: HTMLElement | Window,
  type: string,
  detail?: unknown,
): void => {
  node.dispatchEvent(
    new CustomEvent(type, {
      detail,
      bubbles: true,
      composed: true,
      cancelable: false,
    }),
  );
};

export const handleAction = (
  node: HTMLElement,
  hass: HomeAssistant,
  config: ActionConfig | undefined,
  entityId?: string,
): void => {
  const action: ActionConfig =
    config ??
    (entityId ? { action: "more-info", entity: entityId } : { action: "none" });

  switch (action.action) {
    case "none":
      break;
    case "more-info": {
      const target = action.entity ?? entityId;
      if (target) fireEvent(node, "hass-more-info", { entityId: target });
      break;
    }
    case "toggle":
      if (entityId) toggleEntity(hass, entityId);
      break;
    case "navigate":
      history.pushState(null, "", action.navigation_path);
      fireEvent(window, "location-changed", { replace: false });
      break;
    case "url":
      window.open(action.url_path);
      break;
    case "perform-action": {
      const [domain, service] = action.perform_action.split(".", 2);
      if (!domain || !service) break;
      hass.callService(
        domain,
        service,
        action.data ?? {},
        action.target ??
          (entityId ? { entity_id: entityId } : undefined),
      );
      break;
    }
  }
};