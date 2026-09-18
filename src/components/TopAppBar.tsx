import type { FC } from "react";

interface TopAppBarProps {
  isLiveSave?: boolean;
  saveName?: string;
  isAnalyzing?: boolean;
  onRefresh?: () => void;
  onOpenSaveFile?: () => void;
  onOpenSettings?: () => void;
}

export const TopAppBar: FC<TopAppBarProps> = ({
  isAnalyzing,
  onRefresh,
  onOpenSettings,
}) => {
  return (
    <header
      className="top-bar"
      style={{
        display: "grid",
        gridTemplateColumns: "1fr auto 1fr",
        alignItems: "center",
        width: "100%",
        padding: "0 1.25rem",
        height: "3.5rem",
        backgroundColor: "var(--surface-dim)",
        borderBottom: "1px solid var(--outline-variant)",
        zIndex: 20,
        flexShrink: 0,
      }}
    >
      {/* Left spacer for symmetrical centering */}
      <div />

      {/* Centered Brand Header */}
      <div
        className="brand-anchor"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          justifyContent: "center",
        }}
      >
        <div className="brand-icon-box">
          <img
            src="./remnant-icon.png"
            alt="Remnant"
            style={{ width: "16px", height: "16px", objectFit: "contain" }}
          />
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div className="brand-title-row" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span className="brand-title">REMNANT MANAGER</span>
            <span className="brand-version-badge">v1.0.0</span>
          </div>
          <span className="brand-subtitle" style={{ textAlign: "center" }}>
            WORLD ANALYZER &amp; CHECKLIST
          </span>
        </div>
      </div>

      {/* Right Side Utilities: Refresh & Settings */}
      <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "0.375rem" }}>
        {onRefresh && (
          <button
            className={`icon-btn ${isAnalyzing ? "spinning" : ""}`}
            title="Refresh Saves (re-read saves from disk)"
            onClick={onRefresh}
            disabled={isAnalyzing}
            style={{
              cursor: isAnalyzing ? "wait" : "pointer",
              background: "transparent",
              border: "1px solid transparent",
              borderRadius: "0.375rem",
              padding: "0.375rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--on-surface-variant)",
            }}
          >
            <span
              className="material-symbols-outlined"
              style={{
                fontSize: "20px",
                transform: isAnalyzing ? "rotate(180deg)" : "none",
                transition: "transform 0.4s ease",
              }}
            >
              refresh
            </span>
          </button>
        )}

        <button
          className="icon-btn"
          title="Settings"
          onClick={onOpenSettings}
          style={{
            cursor: "pointer",
            background: "transparent",
            border: "1px solid transparent",
            borderRadius: "0.375rem",
            padding: "0.375rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--on-surface-variant)",
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
            settings
          </span>
        </button>
      </div>
    </header>
  );
};
