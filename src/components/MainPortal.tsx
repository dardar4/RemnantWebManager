import type { FC } from "react";

interface MainPortalProps {
  onLaunchWorldAnalyzer: () => void;
  onExploreChecklist: () => void;
  overallPercent: number;
}

export const MainPortal: FC<MainPortalProps> = ({
  onLaunchWorldAnalyzer,
  onExploreChecklist,
  overallPercent,
}) => {
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        position: "relative",
      }}
    >
      {/* Main Portal State */}
      <div className="portal-centered-container">
        {/* Main Readiness Title */}
        <h1 className="portal-title">Select a Module to Begin</h1>

        {/* Explanatory Prompt */}
        <p className="portal-description">
          Select{" "}
          <span style={{ color: "var(--secondary)", fontWeight: 600 }}>
            'World Analyzer'
          </span>{" "}
          from the sidebar to inspect active world rolls, boss encounters, and
          guaranteed drops, or explore the{" "}
          <span style={{ color: "var(--primary)", fontWeight: 600 }}>
            'Checklist'
          </span>{" "}
          subcategories to manage your gear and trait progression.
        </p>

        {/* Quick-Action Bento Cards */}
        <div className="bento-grid">
          {/* Card 1: Launch World Analyzer */}
          <div
            className="bento-card card-world"
            onClick={onLaunchWorldAnalyzer}
            role="button"
            tabIndex={0}
          >
            {/* Left Accent Status Indicator Stripe */}
            <div className="bento-accent-stripe stripe-secondary" />

            <div className="bento-top-row">
              <div className="bento-icon-box">
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: "20px", color: "inherit" }}
                >
                  explore
                </span>
              </div>
              <span className="bento-badge badge-gold">PORTAL READY</span>
            </div>

            <div className="bento-body">
              <h3 className="bento-heading">Launch World Analyzer</h3>
              <p className="bento-text">
                Parse campaign &amp; adventure seeds across Earth, Rhom, Corsus,
                Yaesha, and Reisum. Real-time boss encounter maps &amp; loot
                tables.
              </p>
              <div className="bento-cta cta-gold">
                <span>INSPECT ACTIVE ROLL</span>
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: "14px" }}
                >
                  arrow_forward
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Explore Checklist */}
          <div
            className="bento-card card-checklist"
            onClick={onExploreChecklist}
            role="button"
            tabIndex={0}
          >
            {/* Left Accent Status Indicator Stripe */}
            <div className="bento-accent-stripe stripe-primary" />

            <div className="bento-top-row">
              <div className="bento-icon-box">
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: "20px", color: "inherit" }}
                >
                  inventory_2
                </span>
              </div>
              <span className="bento-badge badge-red">
                {overallPercent}% ACQUIRED
              </span>
            </div>

            <div className="bento-body">
              <h3 className="bento-heading">Explore Checklist</h3>
              <p className="bento-text">
                Track collection matrices for Weapons, Armor sets, Rings,
                Amulets, Weapon Mods, and Traits with drop conditions and
                criteria.
              </p>
              <div className="bento-cta cta-red">
                <span>OPEN GEAR MATRIX</span>
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: "14px" }}
                >
                  arrow_forward
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
