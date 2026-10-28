import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { DEFAULT_FONT_STACK, PRESETS, readableOn } from "./themes";
import {
  DEFAULT_THEME,
  fileToDataUrl,
  loadTheme,
  saveTheme,
  type ThemeState,
} from "./themeStorage";
import { ThemeContext } from "./themeContextObject";

const MAX_FONT_BYTES = 1.5 * 1024 * 1024; // base64 grows ~33%; keeps us inside the localStorage quota
const FONT_EXT = /\.(ttf|otf|woff2?)$/i;

/**
 * Active theme = preset colors  <  custom accent override  <  uploaded font.
 * The three layers are independent pieces of state; `apply` composes them into CSS variables
 * on <html>, so every component styles itself with var(--...) and re-renders are not needed.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeState>(loadTheme);
  const [notice, setNotice] = useState<string | null>(null);
  const loadedFace = useRef<FontFace | null>(null);

  // Colors: preset, then optional accent override
  useEffect(() => {
    const preset = PRESETS.find((p) => p.id === theme.presetId) ?? PRESETS[0];
    const accent = theme.customAccent ?? preset.colors.accent;
    const root = document.documentElement.style;
    const c = preset.colors;
    root.setProperty("--bg", c.bg);
    root.setProperty("--surface", c.surface);
    root.setProperty("--text", c.text);
    root.setProperty("--muted", c.muted);
    root.setProperty("--border", c.border);
    root.setProperty("--accent", accent);
    root.setProperty("--accent-text", readableOn(accent));
    root.setProperty(
      "color-scheme",
      readableOn(c.bg) === "#ffffff" ? "light" : "dark",
    );
  }, [theme.presetId, theme.customAccent]);

  // Font: rehydrate a FontFace from the stored data URL (on first load and on every change)
  useEffect(() => {
    let cancelled = false;
    const root = document.documentElement.style;
    if (loadedFace.current) {
      document.fonts.delete(loadedFace.current);
      loadedFace.current = null;
    }
    if (!theme.font) {
      root.setProperty("--font", DEFAULT_FONT_STACK);
      return;
    }
    const face = new FontFace("UserUploadedFont", `url(${theme.font.dataUrl})`);
    face
      .load()
      .then((f) => {
        if (cancelled) return;
        document.fonts.add(f);
        loadedFace.current = f;
        root.setProperty("--font", `'UserUploadedFont', ${DEFAULT_FONT_STACK}`);
      })
      .catch(() => {
        if (cancelled) return;
        root.setProperty("--font", DEFAULT_FONT_STACK); // fallback if the stored font is corrupt
        setNotice(
          "The saved font could not be loaded, so the default font is in use.",
        );
        setTheme((t) => ({ ...t, font: null }));
      });
    return () => {
      cancelled = true;
    };
  }, [theme.font]);

  // Persist on every change (setNotice deferred so it doesn't cascade synchronously)
  useEffect(() => {
    if (!saveTheme(theme)) {
      const t = setTimeout(
        () => setNotice("Browser storage is full. Your theme will not survive a reload."),
        0,
      );
      return () => clearTimeout(t);
    }
  }, [theme]);

  const setPreset = useCallback(
    (presetId: string) => setTheme((t) => ({ ...t, presetId })),
    [],
  );
  const setCustomAccent = useCallback(
    (customAccent: string | null) => setTheme((t) => ({ ...t, customAccent })),
    [],
  );
  const clearFont = useCallback(() => {
    setNotice(null);
    setTheme((t) => ({ ...t, font: null }));
  }, []);
  const resetAll = useCallback(() => {
    setNotice(null);
    setTheme(DEFAULT_THEME);
  }, []);

  const uploadFont = useCallback(async (file: File) => {
    setNotice(null);
    if (!FONT_EXT.test(file.name))
      return setNotice("Choose a .ttf, .otf, .woff or .woff2 file.");
    if (file.size > MAX_FONT_BYTES)
      return setNotice("Font is too large. Keep it under 1.5 MB.");
    try {
      const dataUrl = await fileToDataUrl(file);
      // Validate before committing so a bad file never replaces a working font
      const probe = new FontFace("UserUploadedFontProbe", `url(${dataUrl})`);
      await probe.load();
      setTheme((t) => ({
        ...t,
        font: { name: file.name.replace(FONT_EXT, ""), dataUrl },
      }));
    } catch {
      setNotice("That file is not a valid font.");
    }
  }, []);

  const value = useMemo(
    () => ({
      theme,
      notice,
      setPreset,
      setCustomAccent,
      uploadFont,
      clearFont,
      resetAll,
    }),
    [
      theme,
      notice,
      setPreset,
      setCustomAccent,
      uploadFont,
      clearFont,
      resetAll,
    ],
  );
  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}
