import type { Condition, HomeAssistant } from "./types";

const asArray = <T>(v: T | T[] | undefined): T[] =>
  v === undefined ? [] : Array.isArray(v) ? v : [v];

const valueOf = (
  hass: HomeAssistant,
  entity: string,
  attribute?: string,
): unknown => {
  const stateObj = hass.states[entity];
  if (!stateObj) return undefined;
  return attribute ? stateObj.attributes[attribute] : stateObj.state;
};

const checkOne = (
  hass: HomeAssistant,
  entity: string,
  condition: Condition,
): boolean => {
  switch (condition.condition) {
    case "state": {
      const value = valueOf(
        hass,
        condition.entity || entity,
        condition.attribute,
      );
      if (value === undefined) return false;
      const str = String(value);
      if (condition.state !== undefined) {
        return asArray(condition.state).some((s) => String(s) === str);
      }
      if (condition.state_not !== undefined) {
        return !asArray(condition.state_not).some((s) => String(s) === str);
      }
      return true;
    }
    case "numeric_state": {
      const num = Number(
        valueOf(hass, condition.entity || entity, condition.attribute),
      );
      if (Number.isNaN(num)) return false;
      if (condition.above !== undefined && num <= condition.above) return false;
      if (condition.below !== undefined && num >= condition.below) return false;
      return true;
    }
    case "and":
      return condition.conditions.every((c) => checkOne(hass, entity, c));
    case "or":
      return condition.conditions.some((c) => checkOne(hass, entity, c));
    case "not":
      return !condition.conditions.every((c) => checkOne(hass, entity, c));
    case "user":
      return !!hass.user && condition.users.includes(hass.user.id);
    case "exists": {
      const stateObj = hass.states[condition.entity || entity];
      return (
        !!stateObj &&
        stateObj.state !== "unavailable" &&
        stateObj.state !== "unknown"
      );
    }
    default:
      return true;
  }
};

/** A condition list is AND-ed. An empty or missing list always passes. */
export const checkConditions = (
  hass: HomeAssistant,
  entity?: string,
  conditions?: Condition[],
): boolean =>
  !conditions ||
  conditions.length === 0 ||
  conditions.every((c) => checkOne(hass, entity ?? "", c));