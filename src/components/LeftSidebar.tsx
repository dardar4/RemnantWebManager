import { useState, useEffect } from "react";
import type { FC } from "react";
import type { RemnantCharacter } from "../types/remnant";
import { getChecklistCategories } from "../utils/itemCategorizer";

interface LeftSidebarProps {
  currentView: string;
  selectedCategory: string | null;
  activeCharacter: RemnantCharacter;
  characters?: RemnantCharacter[];
  activeCharIndex?: number;
  onSelectChar?: (index: number) => void;
  onSelectView: (view: string, category?: string | null) => void;
}

export const LeftSidebar: FC<LeftSidebarProps> = ({
  currentView,
  selectedCategory,
  activeCharacter,
  onSelectView,
}) => {
  const [checklistExpanded, setChecklistExpanded] = useState<boolean>(false);

  useEffect(() => {
    if (currentView === "checklist") {
      setChecklistExpanded(true);
    }
  }, [currentView]);

  const categories = getChecklistCategories(activeCharacter.inventory);
  const totalOwned = categories.reduce((sum, c) => sum + c.owned, 0);
  const totalAll = categories.reduce((sum, c) => sum + c.total, 0);

  return (
    <aside className="sidebar">
      {/* Top Rail: Navigation & Categories */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          overflowY: "auto",
        }}
        className="custom-scrollbar"
      >
        {/* Navigation Tree */}
        <div className="sidebar-nav">
          {/* Home Link */}
          <div style={{ padding: "0 0.75rem" }}>
            <button
              className={`nav-item-btn ${currentView === "home" ? "active" : ""}`}
              onClick={() => onSelectView("home")}
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
                  style={{ fontSize: "20px" }}
                >
                  home
                </span>
                <span>Home</span>
              </div>
            </button>
          </div>

          {/* Primary Module: World Analyzer */}
          <div style={{ padding: "0 0.75rem" }}>
            <button
              className={`nav-item-btn ${currentView === "world-analyzer" ? "active" : ""}`}
              onClick={() => onSelectView("world-analyzer")}
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
                  style={{ fontSize: "20px" }}
                >
                  public
                </span>
                <span>World Analyzer</span>
              </div>
              <span
                className="material-symbols-outlined"
                style={{ fontSize: "16px", color: "var(--outline)" }}
              >
                chevron_right
              </span>
            </button>
          </div>

          {/* Secondary Module: Checklist (Accordion) */}
          <div style={{ padding: "0.25rem 0.75rem 0 0.75rem" }}>
            <div
              className={`checklist-accordion-header ${
                currentView === "checklist" && (!selectedCategory || selectedCategory === "all") ? "active" : ""
              }`}
              onClick={() => {
                onSelectView("checklist", null);
                setChecklistExpanded(true);
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
                  style={{ color: "var(--primary)", fontSize: "20px" }}
                >
                  fact_check
                </span>
                <span className="checklist-title">Checklist</span>
              </div>
              <div
                style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
              >
                <span className="checklist-counter">
                  {totalOwned}/{totalAll}
                </span>
                <span
                  className={`material-symbols-outlined chevron-icon ${checklistExpanded ? "rotated" : ""}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setChecklistExpanded((prev) => !prev);
                  }}
                  title={checklistExpanded ? "Collapse checklist" : "Expand checklist"}
                >
                  expand_more
                </span>
              </div>
            </div>

            {/* Submenu Items */}
            {checklistExpanded && (
              <div className="subcategories-list">
                {categories.map((cat) => {
                  const isCatActive =
                    currentView === "checklist" && selectedCategory === cat.id;
                  return (
                    <div
                      key={cat.id}
                      className={`subcategory-link ${isCatActive ? "active" : ""}`}
                      onClick={() => onSelectView("checklist", cat.id)}
                    >
                      <div className="subcat-left">
                        <span className="material-symbols-outlined">
                          {cat.icon}
                        </span>
                        <span>{cat.name}</span>
                      </div>
                      <div className="subcat-right">
                        <span className="subcat-counts">
                          {cat.owned}/{cat.total}
                        </span>
                        <div className="subcat-mini-bar">
                          <div
                            className="subcat-mini-fill"
                            style={{ width: `${cat.percent}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Rail: Version Information */}
      <div className="sidebar-bottom-rail">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-label)",
              fontSize: "10px",
              color: "var(--outline)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              fontWeight: 700,
            }}
          >
            VERSION
          </span>
          <span className="brand-version-badge">v1.0.0</span>
        </div>
      </div>
    </aside>
  );
};
