/**
 * Minimal stand-ins for the Home Assistant frontend elements and `hass` object
 * that floorplan-card uses, so the card and its visual editor can be developed
 * without a running Home Assistant.
 *
 * Exposes window.MockHA = { hass, onUpdate, toggle, setState, startJitter,
 * notify, floorImages }.
 */
(() => {
  const ICONS = window.MDI_ICONS ?? {};

  /* ------------------------------------------------------- fake elements */

  customElements.define(
    "ha-card",
    class extends HTMLElement {
      connectedCallback() {
        this.style.cssText =
          "display:block;background:var(--card-background-color);border-radius:var(--ha-card-border-radius,12px);" +
          "box-shadow:0 2px 8px rgba(0,0,0,.4);";
      }
    }
  );

  class MockIcon extends HTMLElement {
    set icon(v) {
      this._icon = v;
      this._render();
    }
    get icon() {
      return this._icon ?? this.getAttribute("icon");
    }
    connectedCallback() {
      this._render();
    }
    _render() {
      if (!this.isConnected) return;
      const size =
        getComputedStyle(this).getPropertyValue("--mdc-icon-size").trim() || "24px";
      this.style.cssText = `display:inline-block;width:${size};height:${size};line-height:0;flex:none;color:inherit`;
      const path = ICONS[this.icon];
      this.innerHTML = path
        ? `<svg viewBox="0 0 24 24" fill="currentColor" style="display:block;width:${size};height:${size}"><path d="${path}"/></svg>`
        : this.icon
          ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="display:block;width:${size};height:${size}"><circle cx="12" cy="12" r="9"/></svg>`
          : "";
    }
  }
  customElements.define("ha-icon", MockIcon);

  /** Domain/device_class defaults, like the real ha-state-icon. */
  const defaultIcon = (stateObj) => {
    if (!stateObj) return "mdi:help-circle-outline";
    const [domain] = stateObj.entity_id.split(".");
    const dc = stateObj.attributes.device_class;
    const on = stateObj.state === "on";
    if (domain === "sensor") {
      return {
        temperature: "mdi:thermometer",
        humidity: "mdi:water-percent",
        battery: stateObj.state !== "" && Number(stateObj.state) < 20 ? "mdi:battery-low" : "mdi:battery",
      }[dc] ?? "mdi:eye";
    }
    if (domain === "binary_sensor") {
      return {
        window: on ? "mdi:window-open-variant" : "mdi:window-closed-variant",
        door: on ? "mdi:door-open" : "mdi:door-closed",
        motion: "mdi:motion-sensor",
        moisture: on ? "mdi:water-alert" : "mdi:leak",
        occupancy: "mdi:run",
      }[dc] ?? (on ? "mdi:alert" : "mdi:shield-home");
    }
    if (domain === "light") return on ? "mdi:lightbulb-on" : "mdi:lightbulb-outline";
    if (domain === "switch") return on ? "mdi:power-plug" : "mdi:power-plug-off";
    if (domain === "camera") return "mdi:camera-iris";
    return "mdi:help-circle-outline";
  };

  /** The mock colours active icons amber, like ha-state-icon does for real. */
  const isActiveState = (stateObj) =>
    stateObj && !["off", "closed", "closed", "locked", "not_home", "unknown", "unavailable"].includes(stateObj.state);

  customElements.define(
    "ha-state-icon",
    class extends MockIcon {
      set hass(v) {
        this._hass = v;
      }
      set stateObj(v) {
        this._stateObj = v;
        this._render();
      }
      get icon() {
        return this._icon ?? this._stateObj?.attributes.icon ?? defaultIcon(this._stateObj);
      }
      set icon(v) {
        this._icon = v;
        this._render();
      }
      _render() {
        super._render();
        if (!this.isConnected) return;
        this.style.color = isActiveState(this._stateObj)
          ? "var(--state-icon-active-color, #fdd835)"
          : "var(--state-icon-color, #9b9b9b)";
      }
    }
  );

  /**
   * Stand-in for ha-form: one labelled control per schema entry, firing
   * value-changed with the full merged object. Supports the selectors the
   * editor uses, plus `type: "grid"` groups and `select` options.
   */
  customElements.define(
    "ha-form",
    class extends HTMLElement {
      set schema(v) {
        this._schema = v;
        this._render();
      }
      set data(v) {
        this._data = v;
        this._render();
      }
      set hass(v) {
        this._hass = v;
      }
      set computeLabel(fn) {
        this._computeLabel = fn;
        this._render();
      }

      _emit(name, value) {
        this._data = { ...this._data, [name]: value };
        this.dispatchEvent(
          new CustomEvent("value-changed", { detail: { value: this._data }, bubbles: true, composed: true })
        );
      }

      _uiAction(entry, selector) {
        const value = this._data[entry.name] ?? {};
        const wrap = document.createElement("label");
        wrap.style.cssText =
          "display:flex;flex-direction:column;gap:3px;font-size:11px;color:var(--secondary-text-color);min-width:0";
        wrap.append(document.createTextNode(this._computeLabel?.(entry) ?? entry.name));

        const box = document.createElement("div");
        box.style.cssText =
          "display:flex;flex-direction:column;gap:4px;padding:6px;border:1px solid var(--divider-color);border-radius:6px";

        const select = document.createElement("select");
        const fallback = selector.default_action ? `Default (${selector.default_action})` : "Default";
        select.append(new Option(fallback, ""));
        for (const action of ["more-info", "toggle", "navigate", "url", "perform-action", "none"]) {
          select.append(new Option(action, action));
        }
        select.value = value.action ?? "";
        select.style.cssText =
          "padding:5px 7px;border:1px solid var(--divider-color);border-radius:6px;" +
          "background:var(--card-background-color);color:var(--primary-text-color);font:inherit;font-size:13px;";
        select.onchange = () =>
          this._emit(entry.name, select.value ? { action: select.value } : undefined);
        box.append(select);

        const EXTRA = {
          navigate: ["navigation_path", "/lovelace/0"],
          url: ["url_path", "https://…"],
          "perform-action": ["perform_action", "light.turn_on"],
        }[value.action];
        if (EXTRA) {
          const [key, placeholder] = EXTRA;
          const extra = document.createElement("input");
          extra.type = "text";
          extra.placeholder = placeholder;
          extra.value = value[key] ?? "";
          extra.style.cssText = select.style.cssText;
          extra.onchange = () => this._emit(entry.name, { ...value, [key]: extra.value });
          box.append(extra);
        }
        wrap.append(box);
        return wrap;
      }

      _control(entry) {
        const selector = entry.selector ?? {};
        const value = this._data[entry.name];
        let input;

        if (selector.ui_action) return this._uiAction(entry, selector.ui_action);
        if (selector.area || selector.entity) {
          input = document.createElement("select");
          const options = selector.area
            ? Object.values(this._hass?.areas ?? {}).map((a) => [a.area_id, a.name])
            : Object.keys(this._hass?.states ?? {}).map((id) => [id, id]);
          input.append(new Option("—", ""));
          for (const [val, label] of options) input.append(new Option(label, val));
          input.value = value ?? "";
          input.onchange = () => this._emit(entry.name, input.value || undefined);
        } else if (selector.boolean) {
          input = document.createElement("input");
          input.type = "checkbox";
          input.checked = !!value;
          input.onchange = () => this._emit(entry.name, input.checked);
        } else if (selector.select?.options) {
          input = document.createElement("select");
          const opts = selector.select.options.map((opt) =>
            typeof opt === "string" ? { value: opt, label: opt } : opt
          );
          for (const opt of opts) input.append(new Option(opt.label, opt.value));
          input.value = value ?? opts[0]?.value;
          input.onchange = () => {
            const raw = input.value;
            if (raw === opts[0]?.value) this._emit(entry.name, selector.select.default_value ?? raw);
            else this._emit(entry.name, raw);
          };
        } else if (selector.icon) {
          input = document.createElement("input");
          input.type = "text";
          input.placeholder = "mdi:…";
          input.value = value ?? "";
          input.onchange = () => this._emit(entry.name, input.value || undefined);
        } else {
          input = document.createElement("input");
          input.type = selector.number ? "number" : "text";
          if (selector.number) {
            if (selector.number.min !== undefined) input.min = selector.number.min;
            if (selector.number.max !== undefined) input.max = selector.number.max;
          }
          input.value = value ?? "";
          input.onchange = () => {
            const raw = input.value;
            if (raw === "") return this._emit(entry.name, undefined);
            this._emit(entry.name, selector.number ? Number(raw) : raw);
          };
        }

        input.dataset.name = entry.name;
        input.style.cssText =
          "padding:5px 7px;border:1px solid var(--divider-color);border-radius:6px;" +
          "background:var(--card-background-color);color:var(--primary-text-color);font:inherit;font-size:13px;";
        if (selector.boolean) input.style.cssText = "width:18px;height:18px;";

        const wrap = document.createElement("label");
        wrap.style.cssText =
          "display:flex;flex-direction:column;gap:3px;font-size:11px;color:var(--secondary-text-color);min-width:0";
        wrap.append(document.createTextNode(this._computeLabel?.(entry) ?? entry.name), input);
        return wrap;
      }

      _render() {
        if (!this._schema || !this._data) return;
        this.innerHTML = "";
        this.style.cssText = "display:flex;flex-direction:column;gap:8px;";
        for (const entry of this._schema) {
          if (entry.type === "grid") {
            const grid = document.createElement("div");
            grid.style.cssText = "display:grid;grid-template-columns:1fr 1fr;gap:8px;";
            for (const child of entry.schema) grid.append(this._control(child));
            this.append(grid);
          } else {
            this.append(this._control(entry));
          }
        }
      }
    }
  );

  /** Stand-in for ha-yaml-editor: a textarea parsed with js-yaml. */
  customElements.define(
    "ha-yaml-editor",
    class extends HTMLElement {
      set label(v) {
        this._label = v;
        this._render();
      }
      set defaultValue(v) {
        if (this._seeded) return;
        this._seeded = true;
        this._value = v;
        this._render();
      }
      _render() {
        if (this._rendered) {
          if (this._labelEl) this._labelEl.textContent = this._label ?? "";
          return;
        }
        this._rendered = true;
        this.style.cssText = "display:flex;flex-direction:column;gap:3px;";
        this._labelEl = document.createElement("span");
        this._labelEl.textContent = this._label ?? "";
        this._labelEl.style.cssText = "font-size:11px;color:var(--secondary-text-color)";
        const area = document.createElement("textarea");
        const empty = this._value === undefined || (Array.isArray(this._value) && !this._value.length);
        area.value = empty ? "" : window.jsyaml.dump(this._value).trim();
        area.rows = Math.min(10, Math.max(2, area.value.split("\n").length + 1));
        area.style.cssText =
          "font-family:ui-monospace,monospace;font-size:12px;padding:6px 8px;border-radius:6px;" +
          "border:1px solid var(--divider-color);background:var(--card-background-color);" +
          "color:var(--primary-text-color);resize:vertical;";
        area.oninput = () => {
          let value;
          let isValid = true;
          try {
            value = area.value.trim() === "" ? undefined : window.jsyaml.load(area.value);
          } catch {
            isValid = false;
          }
          area.style.borderColor = isValid ? "var(--divider-color)" : "var(--error-color, #e5534b)";
          this.dispatchEvent(
            new CustomEvent("value-changed", { detail: { value, isValid }, bubbles: true, composed: true })
          );
        };
        this.append(this._labelEl, area);
      }
    }
  );

  /* ------------------------------------------------------ demo floor images */

  const roomsSvg = (width, height, rooms, bg = "#2b3440") => {
    const fill = (r) => `<rect x="${r[0]}" y="${r[1]}" width="${r[2]}" height="${r[3]}" rx="6" fill="${r[4]}"/>
      <text x="${r[0] + 8}" y="${r[1] + 18}" font-family="sans-serif" font-size="15" fill="#dfe6ee">${r[5]}</text>`;
    return encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
        <rect width="${width}" height="${height}" fill="${bg}"/>
        ${rooms.map(fill).join("")}
        <rect x="6" y="6" width="${width - 12}" height="${height - 12}" rx="10" fill="none" stroke="#576371" stroke-width="3"/>
      </svg>`
    );
  };

  const floorImages = {
    // x, y, w, h, colour, label
    eg:
      "data:image/svg+xml;utf8," +
      roomsSvg(545, 725, [
        [16, 16, 240, 168, "#3d4c5f", "Küche"],
        [270, 16, 258, 168, "#4a5d72", "Esszimmer"],
        [16, 200, 180, 230, "#3d4c5f", "Wohnzimmer"],
        [212, 200, 318, 230, "#44576b", "Kaminzimmer"],
        [16, 446, 300, 120, "#38434f", "Flur"],
        [330, 446, 200, 120, "#414f5e", "WC"],
        [16, 582, 290, 126, "#4a5d72", "Garage"],
        [320, 582, 210, 126, "#38434f", "Abstellraum"],
      ]),
    og:
      "data:image/svg+xml;utf8," +
      roomsSvg(545, 725, [
        [16, 16, 240, 300, "#3d4c5f", "Schlafzimmer"],
        [270, 16, 258, 200, "#4a5d72", "Bad"],
        [270, 232, 258, 210, "#44576b", "Büro"],
        [16, 332, 238, 200, "#414f5e", "Studio"],
        [16, 548, 300, 160, "#38434f", "Abstellraum"],
        [330, 458, 200, 250, "#4a5d72", "Balkon"],
      ]),
  };

  /* ------------------------------------------------------------- fixture */

  /** [entity_id, state, attributes, floor] */
  const ENTITIES = [
    ["light.kitchen", "off", { friendly_name: "Küchenlicht" }, "eg"],
    ["light.dining", "on", { friendly_name: "Esszimmerlampe" }, "eg"],
    ["light.livingroom", "off", { friendly_name: "Wohnzimmerlampe" }, "eg"],
    ["switch.plug_media", "on", { friendly_name: "Mediensteckdose" }, "eg"],
    ["binary_sensor.door_garage", "closed", { device_class: "door", friendly_name: "Garagentor" }, "eg"],
    ["binary_sensor.window_kitchen", "closed", { device_class: "window", friendly_name: "Fenster Küche" }, "eg"],
    ["binary_sensor.window_livingroom", "on", { device_class: "window", friendly_name: "Fenster Wohnzimmer" }, "eg"],
    ["sensor.temprature_kitchen", "21.5", { device_class: "temperature", unit_of_measurement: "°C", friendly_name: "Temperatur Küche" }, "eg"],
    ["sensor.humidity_kitchen", "46", { device_class: "humidity", unit_of_measurement: "%", friendly_name: "Luftfeuchte Küche" }, "eg"],
    ["sensor.temprature_livingroom", "21.8", { device_class: "temperature", unit_of_measurement: "°C", friendly_name: "Temperatur Wohnzimmer" }, "eg"],
    ["sensor.humidity_livingroom", "48", { device_class: "humidity", unit_of_measurement: "%", friendly_name: "Luftfeuchte Wohnzimmer" }, "eg"],
    ["sensor.temprature_garage", "12.4", { device_class: "temperature", unit_of_measurement: "°C", friendly_name: "Temperatur Garage" }, "eg"],
    ["sensor.humidity_garage", "61", { device_class: "humidity", unit_of_measurement: "%", friendly_name: "Luftfeuchte Garage" }, "eg"],
    ["camera.katzenblick", "streaming", { friendly_name: "Kamera Katzenblick" }, "eg"],

    ["light.bedroom", "off", { friendly_name: "Schlafzimmerlampe" }, "og"],
    ["light.bathroom", "off", { friendly_name: "Badezimmerlampe" }, "og"],
    ["light.office", "on", { friendly_name: "Bürolampe" }, "og"],
    ["binary_sensor.window_bedroom", "closed", { device_class: "window", friendly_name: "Fenster Schlafzimmer" }, "og"],
    ["binary_sensor.window_bathroom", "on", { device_class: "window", friendly_name: "Fenster Bad" }, "og"],
    ["sensor.temprature_bedroom", "19.2", { device_class: "temperature", unit_of_measurement: "°C", friendly_name: "Temperatur Schlafzimmer" }, "og"],
    ["sensor.humidity_bedroom", "44", { device_class: "humidity", unit_of_measurement: "%", friendly_name: "Luftfeuchte Schlafzimmer" }, "og"],
    ["sensor.temprature_office", "24.1", { device_class: "temperature", unit_of_measurement: "°C", friendly_name: "Temperatur Büro" }, "og"],
  ];

  const states = {};
  for (const [entity_id, state, attributes] of ENTITIES) {
    states[entity_id] = { entity_id, state, attributes, last_changed: new Date().toISOString() };
  }

  const log = [];
  const listeners = new Set();
  const templateSubscribers = new Set();

  const BINARY_LABELS = {
    window: ["Geschlossen", "Offen"],
    door: ["Geschlossen", "Offen"],
    motion: ["Ruhig", "Bewegung"],
    default: ["Aus", "An"],
  };

  const renderTemplate = (template, variables = {}) =>
    String(template).replace(/\{\{([\s\S]*?)\}\}/g, (_, inner) => {
      let js = inner.trim();
      js = js.replace(/^(.+?)\s+if\s+(.+?)\s+else\s+(.+)$/, "($2) ? ($1) : ($3)");
      js = js
        .replace(/is_state\(\s*([^,]+?)\s*,\s*('[^']*'|"[^"]*")\s*\)/g, (_m, ent, want) => {
          const id = /^['"]/.test(ent.trim()) ? ent.trim().slice(1, -1) : variables[ent.trim()];
          return `${JSON.stringify(hass.states[id]?.state)} === ${want}`;
        })
        .replace(/states\(\s*('[^']*'|"[^"]*")\s*\)/g, (_m, id) =>
          JSON.stringify(hass.states[id.slice(1, -1)]?.state ?? "unknown")
        )
        .replace(/\|\s*float\(\d*\)|\|\s*float|\|\s*int|\|\s*round\(\d+\)/g, "");
      try {
        return String(eval(js));
      } catch {
        return "TemplateError";
      }
    });

  const hass = {
    states,
    areas: {},
    connection: {
      subscribeMessage(callback, message) {
        const entry = { callback, message };
        templateSubscribers.add(entry);
        setTimeout(() => callback({ result: renderTemplate(message.template, message.variables) }), 20);
        return Promise.resolve(() => templateSubscribers.delete(entry));
      },
    },
    devices: {},
    entities: {},
    user: { id: "demo-user", name: "Demo" },
    themes: {},
    language: "de",
    locale: { language: "de" },
    callService(domain, service, data, target) {
      log.push({ type: "call-service", service: `${domain}.${service}`, data, target });
      const ids = [].concat(target?.entity_id ?? data?.entity_id ?? []);
      const RESULT = { turn_on: "on", turn_off: "off", open_cover: "open", close_cover: "closed" };
      for (const id of ids) {
        if (service === "toggle") api.toggle(id);
        else if (RESULT[service]) api.setState(id, RESULT[service]);
      }
      notify(`${domain}.${service} → ${ids.join(", ") || "(no target)"}`);
      return Promise.resolve();
    },
    formatEntityState(stateObj, state) {
      const value = state ?? stateObj.state;
      const [domain] = stateObj.entity_id.split(".");
      if (domain === "binary_sensor") {
        const labels = BINARY_LABELS[stateObj.attributes.device_class] ?? BINARY_LABELS.default;
        return value === "on" ? labels[1] : labels[0];
      }
      const unit = stateObj.attributes.unit_of_measurement;
      return unit ? `${value} ${unit}` : value;
    },
    formatEntityAttributeValue(stateObj, attribute) {
      const value = stateObj.attributes[attribute];
      return attribute.includes("position") ? `${value} %` : String(value);
    },
  };

  const publish = () => {
    const next = { ...hass, states: { ...hass.states } };
    listeners.forEach((fn) => fn(next));
    for (const { callback, message } of templateSubscribers) {
      callback({ result: renderTemplate(message.template, message.variables) });
    }
  };

  const api = {
    hass,
    log,
    floorImages,
    onUpdate(fn) {
      listeners.add(fn);
      fn(hass);
    },
    setState(entityId, state, attributes) {
      const prev = hass.states[entityId];
      if (!prev) return;
      hass.states[entityId] = {
        ...prev,
        state: String(state),
        attributes: { ...prev.attributes, ...attributes },
        last_changed: new Date().toISOString(),
      };
      publish();
    },
    toggle(entityId) {
      const prev = hass.states[entityId];
      if (!prev) return;
      const next = { on: "off", off: "on", open: "closed", closed: "open" }[prev.state] ?? "on";
      api.setState(entityId, next);
    },
    startJitter(ms = 3000) {
      return setInterval(() => {
        for (const [id, s] of Object.entries(hass.states)) {
          if (!id.startsWith("sensor.") || Number.isNaN(Number(s.state))) continue;
          const delta = (Math.random() - 0.5) * (s.attributes.device_class === "temperature" ? 0.6 : 2);
          hass.states[id] = { ...s, state: (Number(s.state) + delta).toFixed(1) };
        }
        publish();
      }, ms);
    },
  };

  const notify = (text) => {
    log.push({ type: "note", text });
    document.dispatchEvent(new CustomEvent("mock-log", { detail: text }));
  };
  api.notify = notify;

  document.addEventListener("hass-more-info", (e) => notify(`more-info → ${e.detail.entityId}`));
  window.addEventListener("location-changed", () => notify(`navigate → ${location.pathname}`));

  window.MockHA = api;
})();