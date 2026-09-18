import { useState, useMemo, Fragment } from 'react';
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

  const inventorySet = useMemo(() => new Set(character.inventory), [character.inventory]);

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

  // Compute grouped items matching current search and missing filter
  const groupedSections = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return activeGroups.map((group) => {
      // 1. All items belonging to this category
      const groupAllItems = gameData.allItems.filter(group.filter);
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
  }, [activeGroups, inventorySet, onlyMissing, searchQuery]);

  const totalMatches = groupedSections.reduce((sum, g) => sum + g.items.length, 0);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div className="view-container">
        {/* Filter Controls */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '0.5rem', flex: 1, minWidth: '220px' }}>
            <input
              type="text"
              placeholder="Search gear by name, drop location, event or requirements..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="tactical-input"
            />
          </div>

          <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => handleCategoryClick(c.id)}
                style={{
                  fontFamily: 'var(--font-label)',
                  fontSize: '11px',
                  padding: '4px 10px',
                  background: currentCat === c.id ? 'var(--primary)' : 'var(--surface-container-low)',
                  color: currentCat === c.id ? '#ffffff' : 'var(--on-surface)',
                  border: '1px solid var(--outline-variant)',
                  borderRadius: '3px',
                  cursor: 'pointer',
                  fontWeight: currentCat === c.id ? 700 : 500,
                  transition: 'all 0.15s ease',
                }}
              >
                {c.label}
              </button>
            ))}
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '12px', fontFamily: 'var(--font-label)', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={onlyMissing}
              onChange={(e) => setOnlyMissing(e.target.checked)}
            />
            <span>ONLY MISSING GEAR</span>
          </label>
        </div>

        {/* Table */}
        <div style={{ background: 'var(--surface-container-lowest)', border: '1px solid var(--outline-variant)', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: 'var(--surface-container-low)', borderBottom: '1px solid var(--outline-variant)' }}>
                <th style={{ padding: '8px 12px', fontFamily: 'var(--font-label)', fontSize: '10px', color: 'var(--outline)', width: '90px' }}>
                  STATUS
                </th>
                <th style={{ padding: '8px 12px', fontFamily: 'var(--font-label)', fontSize: '10px', color: 'var(--outline)', width: '100px' }}>
                  TYPE
                </th>
                <th style={{ padding: '8px 12px', fontFamily: 'var(--font-label)', fontSize: '10px', color: 'var(--outline)' }}>
                  ITEM NAME
                </th>
                <th style={{ padding: '8px 12px', fontFamily: 'var(--font-label)', fontSize: '10px', color: 'var(--outline)' }}>
                  SOURCE EVENT
                </th>
                <th style={{ padding: '8px 12px', fontFamily: 'var(--font-label)', fontSize: '10px', color: 'var(--outline)', width: '110px' }}>
                  DLC / MODE
                </th>
                <th style={{ padding: '8px 12px', fontFamily: 'var(--font-label)', fontSize: '10px', color: 'var(--outline)' }}>
                  ACQUISITION CRITERIA
                </th>
              </tr>
            </thead>
            <tbody>
              {totalMatches === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--outline)', fontFamily: 'var(--font-label)' }}>
                    NO ITEMS MATCHING QUERY
                  </td>
                </tr>
              ) : (
                groupedSections.map(({ group, groupTotal, groupOwned, groupPercent, items }) => {
                  if (items.length === 0) return null;

                  return (
                    <Fragment key={`group-section-${group.id}`}>
                      {/* Group Header Banner */}
                      <tr
                        key={`group-banner-${group.id}`}
                        style={{
                          backgroundColor: 'var(--terra-100)',
                          borderTop: '2px solid var(--terra-300)',
                          borderBottom: '1px solid var(--terra-300)',
                        }}
                      >
                        <td colSpan={6} style={{ padding: '0.625rem 0.875rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                              <span
                                className="material-symbols-outlined"
                                style={{ fontSize: '18px', color: 'var(--moss-700)' }}
                              >
                                {group.icon}
                              </span>
                              <span
                                style={{
                                  fontFamily: 'var(--font-headline)',
                                  fontSize: '13px',
                                  fontWeight: 700,
                                  color: 'var(--terra-900)',
                                  letterSpacing: '0.03em',
                                  textTransform: 'uppercase',
                                }}
                              >
                                {group.name}
                              </span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                              <span
                                style={{
                                  fontFamily: 'var(--font-label)',
                                  fontSize: '11px',
                                  fontWeight: 600,
                                  color: 'var(--terra-700)',
                                  backgroundColor: 'rgba(255, 255, 255, 0.7)',
                                  padding: '0.15rem 0.5rem',
                                  borderRadius: '0.375rem',
                                  border: '1px solid var(--terra-200)',
                                }}
                              >
                                {groupOwned} / {groupTotal} Acquired ({groupPercent}%)
                              </span>
                            </div>
                          </div>
                        </td>
                      </tr>

                      {/* Items in this Group */}
                      {items.map((item, idx) => {
                        const isOwned = inventorySet.has(item.key);
                        return (
                          <tr
                            key={`${item.key}-${idx}`}
                            style={{
                              borderBottom: '1px solid var(--outline-variant)',
                              backgroundColor: isOwned ? '#ffffff' : 'rgba(255, 240, 240, 0.4)',
                            }}
                          >
                            <td style={{ padding: '8px 12px' }}>
                              <span
                                style={{
                                  fontFamily: 'var(--font-label)',
                                  fontSize: '10px',
                                  fontWeight: 700,
                                  padding: '2px 6px',
                                  background: isOwned ? 'rgba(0, 103, 99, 0.1)' : 'rgba(183, 20, 34, 0.1)',
                                  color: isOwned ? 'var(--tertiary)' : 'var(--primary)',
                                  border: `1px solid ${isOwned ? 'var(--tertiary)' : 'var(--primary)'}`,
                                }}
                              >
                                {isOwned ? 'OWNED' : 'MISSING'}
                              </span>
                            </td>
                            <td style={{ padding: '8px 12px', fontFamily: 'var(--font-label)', fontSize: '11px', color: 'var(--outline)' }}>
                              {item.type}
                            </td>
                            <td style={{ padding: '8px 12px', fontWeight: 600, color: isOwned ? 'inherit' : 'var(--primary)' }}>
                              {item.name}
                            </td>
                            <td style={{ padding: '8px 12px', color: 'var(--secondary)', fontFamily: 'var(--font-label)', fontSize: '11px' }}>
                              {item.eventName ? gameData.events[item.eventName] || item.eventName : 'Uncategorized'}
                            </td>
                            <td style={{ padding: '8px 12px', fontSize: '11px' }}>
                              {item.dlc ? (
                                <span style={{ color: 'var(--tertiary)', fontWeight: 600 }}>{item.dlc}</span>
                              ) : item.mode !== 'normal' ? (
                                <span style={{ color: 'var(--secondary)', fontWeight: 700 }}>{item.mode.toUpperCase()}</span>
                              ) : (
                                <span style={{ color: 'var(--outline)' }}>Base Game</span>
                              )}
                            </td>
                            <td style={{ padding: '8px 12px', fontSize: '11px', color: 'var(--outline)' }}>
                              {item.notes || '—'}
                            </td>
                          </tr>
                        );
                      })}
                    </Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

