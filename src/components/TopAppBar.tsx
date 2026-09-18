import type { FC } from "react";
import type { RemnantCharacter } from "../types/remnant";

interface TopAppBarProps {
  isLiveSave?: boolean;
  saveName?: string;
  isAnalyzing?: boolean;
  characters?: RemnantCharacter[];
  activeCharacter?: RemnantCharacter;
  activeCharIndex?: number;
  onSelectChar?: (index: number) => void;
  onRefresh?: () => void;
  onOpenSaveFile?: () => void;
  onOpenSettings?: () => void;
}

export const TopAppBar: FC<TopAppBarProps> = ({
  isAnalyzing,
  characters,
  activeCharIndex = 0,
  onSelectChar,
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
        padding: "0 1.5rem",
        height: "4.5rem",
        backgroundColor: "var(--surface-dim)",
        borderBottom: "1px solid var(--outline-variant)",
        zIndex: 20,
        flexShrink: 0,
      }}
    >
      {/* Left: Brand Header */}
      <div
        className="brand-anchor"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.875rem",
          justifyContent: "flex-start",
        }}
      >
        <div className="brand-icon-box" style={{ width: "2.75rem", height: "2.75rem" }}>
          <img
            src="./remnant-icon.png"
            alt="Remnant"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              padding: "3px",
            }}
          />
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "2px" }}>
          <span className="brand-title" style={{ fontSize: "1.2rem", fontWeight: 700 }}>REMNANT MANAGER</span>
          <span className="brand-subtitle" style={{ fontSize: "11.5px" }}>
            WORLD ANALYZER &amp; CHECKLIST
          </span>
        </div>
      </div>

      {/* Middle: Active Profile Selector */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
          justifyContent: "center",
          gap: "0.3rem",
          minWidth: "260px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "11.5px",
            fontFamily: "var(--font-label)",
          }}
        >
          <span
            style={{
              color: "var(--outline)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              fontWeight: 700,
            }}
          >
            ACTIVE PROFILE
          </span>
        </div>

        {characters && characters.length > 0 ? (
          <select
            value={activeCharIndex}
            onChange={(e) => onSelectChar && onSelectChar(Number(e.target.value))}
            style={{
              fontFamily: "var(--font-label)",
              fontSize: "13px",
              fontWeight: 600,
              padding: "0.35rem 0.75rem",
              background: "var(--surface-container-lowest)",
              border: "1px solid var(--outline-variant)",
              borderRadius: "5px",
              color: "var(--on-surface)",
              outline: "none",
              cursor: characters.length > 1 ? "pointer" : "default",
              width: "100%",
            }}
          >
            {characters.map((c, i) => (
              <option key={c.id} value={i}>
                Slot #{i + 1}: {c.archetype} ({c.inventory.length} items)
              </option>
            ))}
          </select>
        ) : (
          <div
            style={{
              fontFamily: "var(--font-label)",
              fontSize: "13px",
              color: "var(--outline)",
              fontStyle: "italic",
              textAlign: "center",
              padding: "0.35rem 0.75rem",
              background: "var(--surface-container-lowest)",
              border: "1px solid var(--outline-variant)",
              borderRadius: "5px",
            }}
          >
            No profile loaded
          </div>
        )}
      </div>

      {/* Right Side Utilities: Refresh & Settings */}
      <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "0.625rem" }}>
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
              borderRadius: "0.5rem",
              padding: "0.5rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--on-surface-variant)",
            }}
          >
            <span
              className="material-symbols-outlined"
              style={{
                fontSize: "24px",
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
            borderRadius: "0.5rem",
            padding: "0.5rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--on-surface-variant)",
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: "24px" }}>
            settings
          </span>
        </button>
      </div>
    </header>
  );
};
