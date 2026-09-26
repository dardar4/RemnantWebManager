import { useState, useMemo } from 'react';
import type { FC } from 'react';
import type { RemnantCharacter, RemnantItem } from '../types/remnant';
import { gameData } from '../utils/saveParser';
import { CHECKLIST_GROUPS } from '../utils/itemCategorizer';

interface ChecklistViewProps {
  character: RemnantCharacter;
  selectedCategory?: string | null;
  onSelectCategory?: (category: string) => void;
  onBackToHome: () => void;
}

export const ChecklistView: FC<ChecklistViewProps> = ({
  character,
  selectedCategory,
  onSelectCategory,
}) => {
  const currentCat = selectedCategory || 'all';
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [onlyMissing, setOnlyMissing] = useState<boolean>(false);
  const [dlcFilter, setDlcFilter] = useState<string>('all');

  const inventorySet = useMemo(
    () => new Set(character?.inventory || []),
    [character?.inventory]
  );

  const handleCategoryClick = (catId: string) => {
    if (onSelectCategory) {
      onSelectCategory(catId);
    }
  };

  const categories = [
    { id: 'all', label: 'All Gear' },
    ...CHECKLIST_GROUPS.map((g) => ({ id: g.id, label: g.name })),
  ];

  // Which groups to display based on active category filter
  const activeGroups = useMemo(() => {
    if (currentCat === 'all') {
      return CHECKLIST_GROUPS;
    }
    return CHECKLIST_GROUPS.filter((g) => g.id === currentCat);
  }, [currentCat]);

  // Compute grouped items matching current search, DLC filter, and missing filter
  const groupedSections = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return activeGroups.map((group) => {
      // 1. All items belonging to this category (filtered by DLC / Mode if specified)
      const groupAllItems = gameData.allItems.filter(group.filter).filter((item: RemnantItem) => {
        if (dlcFilter === 'all') return true;
        if (dlcFilter === 'base') return (!item.dlc || item.dlc.trim() === '') && item.mode !== 'survival';
        if (dlcFilter === 'survival') return item.mode === 'survival';
        if (dlcFilter === 'hardcore') return item.mode === 'hardcore';
        return item.dlc === dlcFilter;
      });

      const groupTotal = groupAllItems.length;
      const groupOwned = groupAllItems.filter((i) => inventorySet.has(i.key)).length;
      const groupPercent = groupTotal > 0 ? Math.round((groupOwned / groupTotal) * 100) : 0;

      // 2. Filtered items for display
      const displayItems = groupAllItems.filter((item: RemnantItem) => {
        if (onlyMissing && inventorySet.has(item.key)) return false;
        if (q) {
          const matchName = item.name.toLowerCase().includes(q);
          const matchAlt = item.altname?.toLowerCase().includes(q);
          const matchLoc = item.notes?.toLowerCase().includes(q);
          const matchEvent = item.eventName?.toLowerCase().includes(q);
          const matchType = item.type?.toLowerCase().includes(q);
          if (!matchName && !matchAlt && !matchLoc && !matchEvent && !matchType) return false;
        }
        return true;
      });

      return {
        group,
        groupTotal,
        groupOwned,
        groupPercent,
        items: displayItems,
      };
    });
  }, [activeGroups, inventorySet, onlyMissing, searchQuery, dlcFilter]);

  const totalMatches = groupedSections.reduce((sum, g) => sum + g.items.length, 0);

  return (
    <div className="checklist-container">
      {/* Search & Category Filters Bar */}
      <section className="checklist-toolbar">
        {/* Top Row: Search Input & Category Filter Buttons */}
        <div className="checklist-toolbar-top">
          <div className="checklist-search-box">
            <input
              type="text"
              placeholder="Search gear by name, drop location, event or requirements..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="checklist-search-input"
            />
          </div>

          <div className="checklist-pills-bar">
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => handleCategoryClick(c.id)}
                className={`checklist-pill-btn ${currentCat === c.id ? 'active' : ''}`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Sub Row: Missing Gear Checkbox, DLC Filter Dropdown & Counter */}
        <div className="checklist-toolbar-sub">
          <div className="checklist-toolbar-sub-left">
            {/* Only Missing Gear Checkbox */}
            <label className="checklist-missing-toggle">
              <input
                type="checkbox"
                checked={onlyMissing}
                onChange={(e) => setOnlyMissing(e.target.checked)}
                className="checklist-missing-checkbox"
              />
              <span className="checklist-missing-label">ONLY MISSING GEAR</span>
            </label>

            {/* DLC / Mode Dropdown */}
            <div className="checklist-dlc-group">
              <span className="checklist-dlc-label">DLC / MODE:</span>
              <select
                value={dlcFilter}
                onChange={(e) => setDlcFilter(e.target.value)}
                className="checklist-dlc-select"
              >
                <option value="all">All Content</option>
                <option value="base">Base Game</option>
                <option value="Swamps of Corsus">Swamps of Corsus</option>
                <option value="Subject 2923">Subject 2923</option>
                <option value="survival">Survival</option>
                <option value="hardcore">Hardcore</option>
              </select>
            </div>
          </div>

          {/* Total Matches Count */}
          <div className="checklist-counter-badge">
            Showing <span className="checklist-counter-count">{totalMatches}</span> item{totalMatches === 1 ? '' : 's'}
          </div>
        </div>
      </section>

      {/* Checklist Table Scroll Area */}
      <div className="checklist-scroll-area">
        {totalMatches === 0 ? (
          <div className="checklist-empty-state">
            NO ITEMS MATCHING QUERY
          </div>
        ) : (
          groupedSections.map(({ group, groupTotal, groupOwned, groupPercent, items }) => {
            if (items.length === 0) return null;

            return (
              <div key={`group-card-${group.id}`} className="checklist-category-card">
                {/* Category Header Bar */}
                <div className="checklist-category-header">
                  <div className="checklist-category-header-left">
                    <span className="material-symbols-outlined checklist-category-icon">
                      {group.icon}
                    </span>
                    <h2 className="checklist-category-title">{group.name}</h2>
                  </div>
                  <div className="checklist-category-stat">
                    <span className="checklist-category-stat-count">
                      {groupOwned} / {groupTotal}
                    </span>{' '}
                    Acquired (<span className="checklist-category-stat-pct">{groupPercent}%</span>)
                  </div>
                </div>

                {/* Items Table */}
                <div className="checklist-table-wrapper">
                  <table className="checklist-table">
                    <thead>
                      <tr>
                        <th style={{ width: '112px' }}>STATUS</th>
                        <th style={{ width: '112px' }}>TYPE</th>
                        <th style={{ width: '224px' }}>ITEM NAME</th>
                        <th style={{ width: '192px' }}>SOURCE EVENT</th>
                        <th style={{ width: '176px' }}>DLC / MODE</th>
                        <th>ACQUISITION CRITERIA</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item, idx) => {
                        const isOwned = inventorySet.has(item.key);
                        const rawEvent = item.eventName
                          ? gameData.events[item.eventName] || item.eventName
                          : 'Uncategorized';

                        return (
                          <tr
                            key={`${item.key}-${idx}`}
                            className={isOwned ? 'checklist-row-owned' : 'checklist-row-missing'}
                          >
                            <td>
                              <span className={isOwned ? 'checklist-badge-owned' : 'checklist-badge-missing'}>
                                {isOwned ? 'OWNED' : 'MISSING'}
                              </span>
                            </td>
                            <td className={isOwned ? 'checklist-cell-owned-type' : 'checklist-cell-missing-type'}>
                              {item.type}
                            </td>
                            <td className={isOwned ? 'checklist-cell-owned-name' : 'checklist-cell-missing-name'}>
                              {item.name}
                            </td>
                            <td className={isOwned ? 'checklist-cell-owned-event' : 'checklist-cell-missing-event'}>
                              {rawEvent}
                            </td>
                            <td>
                              {item.dlc ? (
                                <span className={isOwned ? 'checklist-cell-owned-dlc' : 'checklist-cell-missing-dlc'}>
                                  {item.dlc}
                                </span>
                              ) : item.mode && item.mode !== 'normal' ? (
                                <span className={isOwned ? 'checklist-cell-owned-dlc' : 'checklist-cell-missing-dlc'}>
                                  {item.mode.toUpperCase()}
                                </span>
                              ) : (
                                <span className={isOwned ? 'checklist-cell-owned-base' : 'checklist-cell-missing-base'}>
                                  Base Game
                                </span>
                              )}
                            </td>
                            <td className={isOwned ? 'checklist-cell-owned-notes' : 'checklist-cell-missing-notes'}>
                              {item.notes || '—'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
