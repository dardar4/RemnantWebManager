import { useState } from "react";
import type { FC } from "react";

interface MainPortalProps {
  onOpenSettings?: () => void;
  onLaunchWorldAnalyzer?: () => void;
  onExploreChecklist?: () => void;
  overallPercent?: number;
}

export const MainPortal: FC<MainPortalProps> = ({
  onOpenSettings,
  onLaunchWorldAnalyzer,
  onExploreChecklist,
  overallPercent,
}) => {
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(true);

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        backgroundColor: "var(--terra-50)",
        minHeight: "100%",
      }}
    >
      <div
        style={{
          padding: "1.5rem 2rem",
          display: "flex",
          flexDirection: "column",
          gap: "1.5rem",
          maxWidth: "1600px",
          margin: "0 auto",
          width: "100%",
        }}
      >
        {/* Top Header Bar & Welcoming Sub-header */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
          <h1
            style={{
              fontFamily: "var(--font-headline)",
              fontSize: "26px",
              fontWeight: 800,
              letterSpacing: "-0.02em",
              color: "var(--terra-900)",
              margin: 0,
            }}
          >
            Remnant Manager
          </h1>
          <p
            style={{
              fontSize: "13.5px",
              color: "var(--terra-600)",
              margin: 0,
              lineHeight: 1.6,
              maxWidth: "960px",
            }}
          >
            Welcome to Remnant: From the Ashes Manager. Here you can analyze your current world rolls,
            track your item and trait inventory, and discover missing gear across Campaign and Adventure modes.
          </p>
        </div>

        {/* Feature Cards Grid: World Analyzer & Checklist links */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "1.25rem",
          }}
        >
          {/* Card 1: World Analyzer Link */}
          <div
            onClick={onLaunchWorldAnalyzer}
            role="button"
            tabIndex={0}
            style={{
              backgroundColor: "var(--bg-card)",
              borderRadius: "1rem",
              border: "1px solid var(--border-color)",
              boxShadow: "0 2px 8px -1px rgba(0, 0, 0, 0.06)",
              padding: "1.5rem",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              gap: "1.25rem",
              cursor: onLaunchWorldAnalyzer ? "pointer" : "default",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 8px 20px -3px rgba(0, 0, 0, 0.15)";
              e.currentTarget.style.borderColor = "var(--secondary)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 2px 8px -1px rgba(0, 0, 0, 0.06)";
              e.currentTarget.style.borderColor = "var(--border-color)";
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div
                  style={{
                    width: "2.75rem",
                    height: "2.75rem",
                    borderRadius: "0.75rem",
                    backgroundColor: "rgba(158, 116, 50, 0.12)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--secondary)",
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: "24px" }}>
                    explore
                  </span>
                </div>
                <span
                  style={{
                    fontFamily: "var(--font-label)",
                    fontSize: "10.5px",
                    fontWeight: 700,
                    padding: "0.2rem 0.6rem",
                    borderRadius: "9999px",
                    backgroundColor: "rgba(158, 116, 50, 0.12)",
                    color: "var(--secondary)",
                    letterSpacing: "0.05em",
                  }}
                >
                  WORLD ANALYZER
                </span>
              </div>
              <div>
                <h2
                  style={{
                    fontFamily: "var(--font-headline)",
                    fontSize: "18px",
                    fontWeight: 700,
                    color: "var(--terra-900)",
                    margin: "0 0 0.4rem",
                  }}
                >
                  Launch World Analyzer
                </h2>
                <p
                  style={{
                    fontSize: "12.5px",
                    color: "var(--terra-600)",
                    margin: 0,
                    lineHeight: 1.55,
                  }}
                >
                  Parse active campaign and adventure seeds across Earth, Rhom, Corsus, Yaesha, and Reisum.
                  Inspect bosses, dungeons, and item drop tables in real time.
                </p>
              </div>
            </div>

            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
                color: "var(--secondary)",
                fontFamily: "var(--font-label)",
                fontSize: "12px",
                fontWeight: 700,
                letterSpacing: "0.04em",
              }}
            >
              <span>INSPECT ACTIVE ROLL</span>
              <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>
                arrow_forward
              </span>
            </div>
          </div>

          {/* Card 2: Checklist Link */}
          <div
            onClick={onExploreChecklist}
            role="button"
            tabIndex={0}
            style={{
              backgroundColor: "var(--bg-card)",
              borderRadius: "1rem",
              border: "1px solid var(--border-color)",
              boxShadow: "0 2px 8px -1px rgba(0, 0, 0, 0.06)",
              padding: "1.5rem",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              gap: "1.25rem",
              cursor: onExploreChecklist ? "pointer" : "default",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 8px 20px -3px rgba(0, 0, 0, 0.15)";
              e.currentTarget.style.borderColor = "var(--primary)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 2px 8px -1px rgba(0, 0, 0, 0.06)";
              e.currentTarget.style.borderColor = "var(--border-color)";
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div
                  style={{
                    width: "2.75rem",
                    height: "2.75rem",
                    borderRadius: "0.75rem",
                    backgroundColor: "rgba(156, 51, 37, 0.12)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--primary)",
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: "24px" }}>
                    inventory_2
                  </span>
                </div>
                <span
                  style={{
                    fontFamily: "var(--font-label)",
                    fontSize: "10.5px",
                    fontWeight: 700,
                    padding: "0.2rem 0.6rem",
                    borderRadius: "9999px",
                    backgroundColor: "rgba(156, 51, 37, 0.12)",
                    color: "var(--primary)",
                    letterSpacing: "0.05em",
                  }}
                >
                  {overallPercent !== undefined ? `${overallPercent}% ACQUIRED` : "CHECKLIST MATRIX"}
                </span>
              </div>
              <div>
                <h2
                  style={{
                    fontFamily: "var(--font-headline)",
                    fontSize: "18px",
                    fontWeight: 700,
                    color: "var(--terra-900)",
                    margin: "0 0 0.4rem",
                  }}
                >
                  Item &amp; Trait Checklist
                </h2>
                <p
                  style={{
                    fontSize: "12.5px",
                    color: "var(--terra-600)",
                    margin: 0,
                    lineHeight: 1.55,
                  }}
                >
                  Track collected and missing Weapons, Armor sets, Rings, Amulets, Weapon Mods, and Traits
                  with detailed drop conditions and criteria.
                </p>
              </div>
            </div>

            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
                color: "var(--primary)",
                fontFamily: "var(--font-label)",
                fontSize: "12px",
                fontWeight: 700,
                letterSpacing: "0.04em",
              }}
            >
              <span>OPEN GEAR MATRIX</span>
              <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>
                arrow_forward
              </span>
            </div>
          </div>
        </div>

        {/* Box/Card 3: How to Guide (Copied from World Analyzer) */}
        <section
          style={{
            backgroundColor: "var(--bg-card)",
            borderRadius: "1rem",
            border: "1px solid var(--border-color)",
            boxShadow: "0 2px 8px -1px rgba(0, 0, 0, 0.06)",
            overflow: "hidden",
          }}
        >
          {/* Clickable Header / Accordion trigger */}
          <button
            type="button"
            onClick={() => setIsGuideOpen(!isGuideOpen)}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0.875rem 1.25rem",
              backgroundColor: isGuideOpen
                ? "var(--bg-card-subtle)"
                : "var(--bg-card)",
              border: "none",
              borderBottom: isGuideOpen ? "1px solid var(--border-color)" : "none",
              cursor: "pointer",
              textAlign: "left",
              transition: "background-color 0.15s ease",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{
                  fontSize: "20px",
                  color: isGuideOpen ? "var(--moss-700)" : "var(--terra-500)",
                }}
              >
                help_outline
              </span>
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.625rem",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-headline)",
                      fontSize: "14px",
                      fontWeight: 700,
                      color: "var(--terra-900)",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    How to use &amp; Reroll Guide
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-label)",
                      fontSize: "10px",
                      fontWeight: 600,
                      padding: "0.125rem 0.5rem",
                      borderRadius: "9999px",
                      backgroundColor: "rgba(74, 114, 87, 0.12)",
                      color: "var(--moss-800)",
                    }}
                  >
                    Tips &amp; Info
                  </span>
                </div>
                <p
                  style={{
                    fontSize: "12px",
                    color: "var(--terra-600)",
                    margin: "0.2rem 0 0",
                  }}
                >
                  Learn how save sync works, troubleshooting missing items, and
                  known game nuances
                </p>
              </div>
            </div>
            <span
              className="material-symbols-outlined"
              style={{
                fontSize: "20px",
                color: "var(--terra-500)",
                transform: isGuideOpen ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.2s ease",
              }}
            >
              expand_more
            </span>
          </button>

          {/* Accordion Content */}
          {isGuideOpen && (
            <div
              style={{
                padding: "1.25rem 1.5rem",
                borderTop: "1px solid var(--border-color)",
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                gap: "1.5rem",
                fontSize: "13px",
                color: "var(--terra-700)",
                lineHeight: 1.6,
                backgroundColor: "var(--bg-card)",
              }}
            >
              {/* Step 1: Save File Directory Setup */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.625rem",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "0.5rem",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      color: "var(--terra-900)",
                      fontWeight: 700,
                    }}
                  >
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: "18px", color: "var(--moss-700)" }}
                    >
                      folder_open
                    </span>
                    <span>1. Set Up Save Files</span>
                  </div>
                  {onOpenSettings && (
                    <button
                      type="button"
                      onClick={onOpenSettings}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.35rem",
                        padding: "0.25rem 0.6rem",
                        fontSize: "11px",
                        fontWeight: 600,
                        color: "var(--terra-800)",
                        backgroundColor: "var(--terra-100)",
                        border: "1px solid var(--terra-300)",
                        borderRadius: "0.5rem",
                        cursor: "pointer",
                        transition: "background-color 0.15s ease",
                      }}
                    >
                      <span
                        className="material-symbols-outlined"
                        style={{ fontSize: "13px", color: "var(--terra-700)" }}
                      >
                        settings
                      </span>
                      <span>Open Settings</span>
                    </button>
                  )}
                </div>
                <ul
                  style={{
                    margin: 0,
                    paddingLeft: "1.25rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.35rem",
                  }}
                >
                  <li>
                    Click <strong>Open Settings</strong> (or the ⚙️ gear icon) to
                    verify your save directory path:{" "}
                    <code
                      style={{
                        padding: "0.1rem 0.35rem",
                        borderRadius: "4px",
                        backgroundColor: "var(--terra-100)",
                        color: "var(--moss-800)",
                        fontFamily: "var(--font-label)",
                        fontSize: "11px",
                        fontWeight: 600,
                      }}
                    >
                      %LOCALAPPDATA%\Remnant\Saved\SaveGames
                    </code>
                    . Click the <strong>copy icon</strong> to copy it to your
                    clipboard.
                  </li>
                  <li>
                    Click <strong>Upload Save Files</strong> (or the top-bar{" "}
                    <strong>Refresh (🔄)</strong> button), paste the path into
                    Windows Explorer, and select your{" "}
                    <code
                      style={{
                        padding: "0.1rem 0.35rem",
                        borderRadius: "4px",
                        backgroundColor: "var(--terra-100)",
                        color: "var(--moss-800)",
                        fontFamily: "var(--font-label)",
                        fontSize: "11px",
                        fontWeight: 600,
                      }}
                    >
                      .sav
                    </code>{" "}
                    files (
                    <code
                      style={{
                        padding: "0.1rem 0.35rem",
                        borderRadius: "4px",
                        backgroundColor: "var(--terra-100)",
                        color: "var(--moss-800)",
                        fontFamily: "var(--font-label)",
                        fontSize: "11px",
                        fontWeight: 600,
                      }}
                    >
                      profile.sav
                    </code>
                    ,{" "}
                    <code
                      style={{
                        padding: "0.1rem 0.35rem",
                        borderRadius: "4px",
                        backgroundColor: "var(--terra-100)",
                        color: "var(--moss-800)",
                        fontFamily: "var(--font-label)",
                        fontSize: "11px",
                        fontWeight: 600,
                      }}
                    >
                      save_0.sav
                    </code>
                    , etc.).
                  </li>
                  <li>
                    Whenever you reroll or save in-game, click the{" "}
                    <strong>Refresh (🔄)</strong> button to quickly re-select your
                    updated save files. The save path is automatically copied to
                    your clipboard on refresh! You can also drag &amp; drop save
                    files directly onto this window anytime.
                  </li>
                </ul>
              </div>

              {/* Step 2: Reroll In-Game */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.625rem",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    color: "var(--terra-900)",
                    fontWeight: 700,
                  }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: "18px", color: "var(--moss-700)" }}
                  >
                    casino
                  </span>
                  <span>2. Reroll &amp; Save Worlds</span>
                </div>
                <ul
                  style={{
                    margin: 0,
                    paddingLeft: "1.25rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.35rem",
                  }}
                >
                  <li>
                    In Ward 13, access the red World Stone &gt;{" "}
                    <em>World Settings</em> &gt; <em>Reroll Adventure Mode</em>{" "}
                    (or Campaign).
                  </li>
                  <li>
                    Touch a <strong>World Stone checkpoint</strong> in-game after
                    traveling to ensure your local save file flushes and records
                    the new world generation seeds.
                  </li>
                  <li>
                    Rerolling Adventure Mode does not reset your Campaign story
                    progress.
                  </li>
                </ul>
              </div>

              {/* Step 3: Refresh & Analyze */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.625rem",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    color: "var(--terra-900)",
                    fontWeight: 700,
                  }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: "18px", color: "var(--moss-700)" }}
                  >
                    sync
                  </span>
                  <span>3. Refresh Telemetry</span>
                </div>
                <ul
                  style={{
                    margin: 0,
                    paddingLeft: "1.25rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.35rem",
                  }}
                >
                  <li>
                    Click the <strong>Refresh Telemetry (🔄)</strong> button in the
                    top bar or press{" "}
                    <kbd
                      style={{
                        padding: "0.1rem 0.35rem",
                        backgroundColor: "var(--terra-100)",
                        borderRadius: "4px",
                        fontSize: "11px",
                      }}
                    >
                      F5
                    </kbd>{" "}
                    to instantly reload save rolls.
                  </li>
                  <li>
                    Toggle between <strong>Campaign</strong> and{" "}
                    <strong>Adventure</strong> tabs, and filter missing items
                    using the search bar below.
                  </li>
                  <li>
                    The difficulty indicator (Normal, Hard, Nightmare,
                    Apocalypse) automatically updates for each world mode.
                  </li>
                </ul>
              </div>

              {/* Security & Local Processing Note */}
              <div
                style={{
                  gridColumn: "1 / -1",
                  padding: "0.65rem 1rem",
                  backgroundColor: "rgba(74, 114, 87, 0.08)",
                  borderRadius: "0.5rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  fontSize: "12px",
                  color: "var(--moss-900)",
                }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: "16px", color: "var(--moss-700)" }}
                >
                  security
                </span>
                <span>
                  <strong>100% Client-Side:</strong> Save analysis executes
                  strictly inside your browser. No save game or telemetry data is
                  ever uploaded or transmitted externally.
                </span>
              </div>
            </div>
          )}
        </section>

        {/* Box/Card 4: Credits & Acknowledgments Card (Placeholder) */}
        <section
          style={{
            backgroundColor: "var(--bg-card)",
            borderRadius: "1rem",
            border: "1px solid var(--border-color)",
            boxShadow: "0 2px 8px -1px rgba(0, 0, 0, 0.06)",
            padding: "1.25rem 1.5rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "0.5rem",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
              <span
                className="material-symbols-outlined"
                style={{ fontSize: "20px", color: "var(--moss-700)" }}
              >
                military_tech
              </span>
              <h2
                style={{
                  fontFamily: "var(--font-headline)",
                  fontSize: "14px",
                  fontWeight: 700,
                  color: "var(--terra-900)",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  margin: 0,
                }}
              >
                Credits &amp; Acknowledgments
              </h2>
            </div>
            <span
              style={{
                fontFamily: "var(--font-label)",
                fontSize: "10px",
                fontWeight: 600,
                padding: "0.125rem 0.5rem",
                borderRadius: "9999px",
                backgroundColor: "rgba(74, 114, 87, 0.12)",
                color: "var(--moss-800)",
              }}
            >
              Attributions
            </span>
          </div>

          <div
            style={{
              fontSize: "13px",
              color: "var(--terra-700)",
              lineHeight: 1.6,
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem",
            }}
          >
            <p style={{ margin: 0 }}>
              Special credit to <strong>Razzmatazzz</strong> for{" "}
              <a
                href="https://github.com/Razzmatazzz/RemnantSaveGuardian"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "var(--accent-emerald)", fontWeight: 600, textDecoration: "none" }}
                onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
                onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
              >
                RemnantSaveGuardian
              </a>
              , where the core save file parsing logic was developed.
            </p>
            <p style={{ margin: 0 }}>
              Credit to <strong>hzla</strong> for the{" "}
              <a
                href="https://github.com/hzla/Remnant-World-Analyzer"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "var(--accent-emerald)", fontWeight: 600, textDecoration: "none" }}
                onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
                onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
              >
                Remnant-World-Analyzer
              </a>{" "}
              (
              <a
                href="https://hzla.github.io/Remnant-World-Analyzer/"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "var(--accent-emerald)", fontWeight: 600, textDecoration: "none" }}
                onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
                onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
              >
                online tool
              </a>
              ), used during gameplay for world event analysis.
            </p>
            <p style={{ margin: 0 }}>
              Also credit to the folks on the official Remnant discord for chasing down items and community drop tables.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};
