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

const MAX_FONT_BYTES = 1.5 * 1024 * 1024; // Maximum font file size: 1.5 MB.
const FONT_EXT = /\.(ttf|otf|woff2?)$/i;

// The theme has three parts:
// 1. Preset colors
// 2. An optional custom button color
// 3. An optional uploaded font
//
// This provider applies the selected theme to the whole page using CSS variables.
export function ThemeProvider({ children }: { children: ReactNode }) {
  // Load the saved theme when the app starts.
  const [theme, setTheme] = useState<ThemeState>(loadTheme);
  const [notice, setNotice] = useState<string | null>(null);
  const loadedFace = useRef<FontFace | null>(null);

  // Apply the selected preset colors and custom button color.
  useEffect(() => {
    const selectedPreset =
      PRESETS.find((preset) => preset.id === theme.presetId) ?? PRESETS[0];

    const accentColor =
      theme.customAccent ?? selectedPreset.colors.accent;

    const root = document.documentElement.style;
    const colors = selectedPreset.colors;

    root.setProperty("--bg", colors.bg);
    root.setProperty("--surface", colors.surface);
    root.setProperty("--text", colors.text);
    root.setProperty("--muted", colors.muted);
    root.setProperty("--border", colors.border);
    root.setProperty("--accent", accentColor);
    root.setProperty("--accent-text", readableOn(accentColor));

    // Set the browser's native controls to light or dark mode.
    root.setProperty(
      "color-scheme",
      readableOn(colors.bg) === "#ffffff" ? "light" : "dark",
    );
  }, [theme.presetId, theme.customAccent]);

  // Load the uploaded font, or use the default font when no font is selected.
  useEffect(() => {
    let cancelled = false;
    const root = document.documentElement.style;

    // Remove the previously loaded font before loading another one.
    if (loadedFace.current) {
      document.fonts.delete(loadedFace.current);
      loadedFace.current = null;
    }

    if (!theme.font) {
      root.setProperty("--font", DEFAULT_FONT_STACK);
      return;
    }

    const fontFace = new FontFace(
      "UserUploadedFont",
      `url(${theme.font.dataUrl})`,
    );

    fontFace
      .load()
      .then((loadedFont) => {
        if (cancelled) return;

        document.fonts.add(loadedFont);
        loadedFace.current = loadedFont;

        root.setProperty("--font", `'UserUploadedFont', ${DEFAULT_FONT_STACK}`);
      })
      .catch(() => {
        if (cancelled) return;

        // If the saved font cannot be loaded, fall back to the default font.
        root.setProperty("--font", DEFAULT_FONT_STACK);
        setNotice(
          "The saved font could not be loaded, so the default font is in use.",
        );
        setTheme((currentTheme) => ({ ...currentTheme, font: null }));
      });

    return () => {
      cancelled = true;
    };
  }, [theme.font]);

  // Save every theme change so the selection is still there after a page reload.
  useEffect(() => {
    const saved = saveTheme(theme);

    if (!saved) {
      const timeoutId = setTimeout(() => {
        setNotice(
          "Browser storage is full. Your theme will not survive a reload.",
        );
      }, 0);

      return () => clearTimeout(timeoutId);
    }
  }, [theme]);

  // Select one of the available theme presets.
  const setPreset = useCallback((presetId: string) => {
    setTheme((currentTheme) => ({ ...currentTheme, presetId }));
  }, []);

  // Set a custom button color, or clear it to use the preset color.
  const setCustomAccent = useCallback((customAccent: string | null) => {
    setTheme((currentTheme) => ({ ...currentTheme, customAccent }));
  }, []);

  // Remove the uploaded font.
  const clearFont = useCallback(() => {
    setNotice(null);
    setTheme((currentTheme) => ({ ...currentTheme, font: null }));
  }, []);

  // Restore all theme settings to their default values.
  const resetAll = useCallback(() => {
    setNotice(null);
    setTheme(DEFAULT_THEME);
  }, []);

  // Read and check an uploaded font file before saving it.
  const uploadFont = useCallback(async (file: File) => {
    setNotice(null);

    if (!FONT_EXT.test(file.name)) {
      return setNotice("Choose a .ttf, .otf, .woff or .woff2 file.");
    }

    if (file.size > MAX_FONT_BYTES) {
      return setNotice("Font is too large. Keep it under 1.5 MB.");
    }

    try {
      const dataUrl = await fileToDataUrl(file);

      // Check that the file is a valid font before replacing the current font.
      const testFont = new FontFace(
        "UserUploadedFontProbe",
        `url(${dataUrl})`,
      );
      await testFont.load();

      setTheme((currentTheme) => ({
        ...currentTheme,
        font: {
          name: file.name.replace(FONT_EXT, ""),
          dataUrl,
        },
      }));
    } catch {
      setNotice("That file is not a valid font.");
    }
  }, []);

  // Make the theme and its actions available to child components.
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
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}
