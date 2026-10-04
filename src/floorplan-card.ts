import "./card";

const VERSION = "0.1.0";

(window as any).customCards = (window as any).customCards ?? [];
(window as any).customCards.push({
  type: "floorplan-card-next",
  name: "Floorplan Card (Next)",
  description:
    "Multi-floor floorplan card with a drag-and-drop visual editor: upload a background image, place entities on it, wire actions — natives entity tracking, image caching and easy image swap-out built in.",
  preview: false,
  documentationURL: "https://github.com/glassp/haos-floorplan-card",
});

// eslint-disable-next-line no-console
console.info(
  `%c FLOORPLAN-CARD %c ${VERSION} `,
  "color:#fff;background:#4caf50",
  "color:#4caf50;background:#fff",
);