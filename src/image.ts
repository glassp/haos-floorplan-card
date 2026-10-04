import type { FloorConfig, HomeAssistant } from "./types";

export type ImageRef = string | { media_content_id?: string };

/** The actual URL behind an image ref, whatever shape the config used. */
export const resolveImage = (ref?: ImageRef): string | undefined => {
  if (!ref) return undefined;
  if (typeof ref === "string") return ref;
  return ref.media_content_id;
};

/** Whether a floor image string is a Jinja template (contains `{{`). */
export const isImageTemplate = (ref?: ImageRef): boolean => {
  const src = resolveImage(ref);
  return !!src && src.includes("{{");
};

/**
 * Upload an image to Home Assistant's own image store and return the served
 * URL. The frontend is authenticated, so no extra setup is needed. Every
 * upload produces a brand-new `/api/image/serve/<id>/…` URL, and HA serves
 * those with proper HTTP cache headers — that alone is the whole cache
 * story: upload a replacement, and the card shows the new image on the next
 * render, never a stale browser-cached one.
 *
 * Falls back to an object URL when run without a backend (the standalone
 * demo), so the editor works offline for scaffolded configs.
 */
export const uploadImage = async (
  hass: HomeAssistant,
  file: File,
): Promise<string> => {
  if (hass.auth?.access_token) {
    const response = await fetch("/api/image/upload/v1", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${hass.auth.access_token}`,
        "Content-Type": file.type || "image/png",
      },
      body: file,
    });
    if (!response.ok) {
      throw new Error(`Image upload failed (HTTP ${response.status})`);
    }
    const data: { id?: string; url?: string } = await response.json();
    if (!data.url) throw new Error("Image upload returned no URL");
    return data.url;
  }
  return URL.createObjectURL(file);
};

export interface StageSize {
  width: number;
  height: number;
}

/** The coordinate space a floor's entities are measured against. */
export const stageSizeOf = (
  floor: FloorConfig,
  natural: StageSize | undefined,
): StageSize => ({
  width: floor.width ?? natural?.width ?? 545,
  height: floor.height ?? natural?.height ?? 725,
});