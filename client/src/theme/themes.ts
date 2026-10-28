export interface Preset {
  id: string;
  name: string;
  colors: {
    bg: string;
    surface: string;
    text: string;
    muted: string;
    border: string;
    accent: string;
  };
}

export const PRESETS: Preset[] = [
  {
    id: "blue",
    name: "Blue",
    colors: {
      bg: "#eef3fb",
      surface: "#ffffff",
      text: "#14233c",
      muted: "#5d6b82",
      border: "#d5deee",
      accent: "#2563eb",
    },
  },
  {
    id: "violet",
    name: "Violet",
    colors: {
      bg: "#f4f0fb",
      surface: "#ffffff",
      text: "#241a3d",
      muted: "#6b5f85",
      border: "#ded5f0",
      accent: "#7c3aed",
    },
  },
  {
    id: "darcula",
    name: "Darcula",
    colors: {
      bg: "#2b2b2b",
      surface: "#3c3f41",
      text: "#d4d4d4",
      muted: "#9a9fa3",
      border: "#515658",
      accent: "#cc7832",
    },
  },
  {
    id: "forest",
    name: "Forest",
    colors: {
      bg: "#0f1f1a",
      surface: "#17302a",
      text: "#e2f1ea",
      muted: "#8fb0a3",
      border: "#24473d",
      accent: "#34d399",
    },
  },
];

export const DEFAULT_FONT_STACK = `system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif`;

/** Picks black or white text for readable contrast on a given hex background. */
export function readableOn(hex: string): string {
  const h = hex.replace("#", "");
  const full =
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h;
  const [r, g, b] = [0, 2, 4].map(
    (i) => parseInt(full.slice(i, i + 2), 16) / 255,
  );
  const lin = (c: number) =>
    c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  const lum = 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  return lum > 0.4 ? "#111111" : "#ffffff";
}
