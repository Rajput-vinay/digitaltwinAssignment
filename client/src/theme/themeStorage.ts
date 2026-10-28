// All localStorage access for theming lives here (nowhere else in the app).
export interface StoredFont {
  name: string; // display name (file name without extension)
  dataUrl: string; // base64 data URL, rehydrated into a FontFace on load
}

export interface ThemeState {
  presetId: string;
  customAccent: string | null; // overrides the preset accent when set
  font: StoredFont | null;
}

const KEY = "ud-theme-v1";
export const DEFAULT_THEME: ThemeState = {
  presetId: "blue",
  customAccent: null,
  font: null,
};

export function loadTheme(): ThemeState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT_THEME;
    return { ...DEFAULT_THEME, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_THEME;
  }
}

/** Returns false if storage is full/unavailable so the UI can warn instead of failing silently. */
export function saveTheme(theme: ThemeState): boolean {
  try {
    localStorage.setItem(KEY, JSON.stringify(theme));
    return true;
  } catch {
    return false;
  }
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(new Error("Could not read the font file"));
    r.readAsDataURL(file);
  });
}
