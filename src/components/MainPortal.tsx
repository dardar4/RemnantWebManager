import { useState } from "react";
import type { FC } from "react";

interface MainPortalProps {
  onOpenSettings?: () => void;
  onLaunchWorldAnalyzer?: () => void;
  onExploreChecklist?: () => void;
  overallPercent?: number;
}

export const MainPortal: FC<MainPortalProps> = ({ onOpenSettings }) => {
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
          gap: "1.25rem",
          maxWidth: "1600px",
          margin: "0 auto",
          width: "100%",
        }}
      >
        {/* Top Header Bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <h1
            style={{
              fontFamily: "var(--font-headline)",
              fontSize: "24px",
              fontWeight: 700,
              letterSpacing: "-0.02em",
              color: "var(--terra-900)",
              margin: 0,
            }}
          >
            Remnant Manager
          </h1>
        </div>

        {/* Combined Expandable Instructions & Known Issues Card (Copied from World Analyzer) */}
        <section
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "1rem",
            border: "1px solid rgba(226, 218, 207, 0.9)",
            boxShadow: "0 2px 8px -1px rgba(45, 38, 30, 0.04)",
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
                ? "rgba(250, 248, 245, 0.85)"
                : "#ffffff",
              border: "none",
              borderBottom: isGuideOpen ? "1px solid var(--terra-100)" : "none",
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
                borderTop: "1px solid var(--terra-100)",
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                gap: "1.5rem",
                fontSize: "13px",
                color: "var(--terra-700)",
                lineHeight: 1.6,
                backgroundColor: "#ffffff",
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
      </div>
    </div>
  );
};
