import { useRef } from "react";
import { useTheme } from "../theme/useTheme";
import { PRESETS } from "../theme/themes";

export default function ThemePanel({ onClose }: { onClose: () => void }) {
  const {
    theme,
    notice,
    setPreset,
    setCustomAccent,
    uploadFont,
    clearFont,
    resetAll,
  } = useTheme();
  const fileRef = useRef<HTMLInputElement>(null);
  const activePreset =
    PRESETS.find((p) => p.id === theme.presetId) ?? PRESETS[0];
  const accent = theme.customAccent ?? activePreset.colors.accent;

  return (
    <div className="overlay side" onClick={onClose}>
      <aside
        className="panel"
        role="dialog"
        aria-label="Theme settings"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="row between">
          <h2>Theme</h2>
          <button className="btn ghost" onClick={onClose}>
            Close
          </button>
        </div>

        <section>
          <h3>Preset</h3>
          <div className="presets">
            {PRESETS.map((p) => (
              <button
                key={p.id}
                className={`preset ${p.id === theme.presetId ? "on" : ""}`}
                onClick={() => setPreset(p.id)}
                aria-pressed={p.id === theme.presetId}
              >
                <span
                  className="swatch"
                  style={{
                    background: p.colors.bg,
                    borderColor: p.colors.border,
                  }}
                >
                  <i style={{ background: p.colors.surface }} />
                  <i style={{ background: p.colors.accent }} />
                </span>
                {p.name}
              </button>
            ))}
          </div>
        </section>

        <section>
          <h3>Button color</h3>
          <div className="row">
            <input
              type="color"
              value={accent}
              onChange={(e) => setCustomAccent(e.target.value)}
              aria-label="Button color"
            />
            <code>{accent}</code>
            {theme.customAccent && (
              <button
                className="btn ghost"
                onClick={() => setCustomAccent(null)}
              >
                Use preset color
              </button>
            )}
          </div>
        </section>

        <section>
          <h3>Font</h3>
          <p className="muted small">
            {theme.font
              ? `Using ${theme.font.name}`
              : "Using the default system font"}
          </p>
          <input
            ref={fileRef}
            type="file"
            accept=".ttf,.otf,.woff,.woff2"
            hidden
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (f) await uploadFont(f);
              e.target.value = "";
            }}
          />
          <div className="row">
            <button className="btn" onClick={() => fileRef.current?.click()}>
              Upload font
            </button>
            {theme.font && (
              <button className="btn ghost" onClick={clearFont}>
                Remove font
              </button>
            )}
          </div>
          <p className="muted small">
            .ttf, .otf, .woff or .woff2, up to 1.5 MB.
          </p>
        </section>

        {notice && (
          <p className="alert" role="alert">
            {notice}
          </p>
        )}
        <button className="btn ghost" onClick={resetAll}>
          Reset theme
        </button>
      </aside>
    </div>
  );
}
