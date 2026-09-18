import { useState, useMemo } from 'react';
import type { FC } from 'react';
import type { RemnantCharacter, RemnantItem } from '../types/remnant';
import { gameData } from '../utils/saveParser';
import { isRing, isAmulet } from '../utils/itemCategorizer';

interface ChecklistViewProps {
  character: RemnantCharacter;
  initialCategory?: string | null;
  onBackToHome: () => void;
}

export const ChecklistView: FC<ChecklistViewProps> = ({
  character,
  initialCategory,
  onBackToHome,
}) => {
  const [selectedCat, setSelectedCat] = useState<string>(initialCategory || 'all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [onlyMissing, setOnlyMissing] = useState<boolean>(false);

  const inventorySet = useMemo(() => new Set(character.inventory), [character.inventory]);

  const filteredItems = useMemo(() => {
    return gameData.allItems.filter((item: RemnantItem) => {
      // Category filter
      if (selectedCat === 'weapons' && item.type !== 'Weapon') return false;
      if (selectedCat === 'armor' && item.type !== 'Armor') return false;
      if (selectedCat === 'rings' && !isRing(item)) return false;
      if (selectedCat === 'amulets' && !isAmulet(item)) return false;
      if (selectedCat === 'mods' && item.type !== 'Mod') return false;
      if (selectedCat === 'traits' && item.type !== 'Trait') return false;

      // Missing filter
      if (onlyMissing && inventorySet.has(item.key)) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = item.name.toLowerCase().includes(q);
        const matchNotes = (item.notes || '').toLowerCase().includes(q);
        const matchEvent = (item.eventName || '').toLowerCase().includes(q);
        if (!matchName && !matchNotes && !matchEvent) return false;
      }

      return true;
    });
  }, [selectedCat, onlyMissing, searchQuery, inventorySet]);

  const categories = [
    { id: 'all', label: 'All Items' },
    { id: 'weapons', label: 'Weapons' },
    { id: 'armor', label: 'Armor' },
    { id: 'rings', label: 'Rings' },
    { id: 'amulets', label: 'Amulets' },
    { id: 'mods', label: 'Mods' },
    { id: 'traits', label: 'Traits' },
  ];

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      {/* Sub-Header */}
      <div className="sub-header-bar">
        <div className="breadcrumbs">
          <span
            style={{ cursor: 'pointer', color: 'var(--on-surface-variant)' }}
            onClick={onBackToHome}
          >
            REMNANT PORTAL
          </span>
          <span>/</span>
          <span className="breadcrumb-active">GEAR MATRIX</span>
          <span>/</span>
          <span style={{ color: 'var(--primary)', fontWeight: 600, textTransform: 'uppercase' }}>
            {categories.find((c) => c.id === selectedCat)?.label || 'ITEMS'}
          </span>
        </div>
      </div>

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
                onClick={() => setSelectedCat(c.id)}
                style={{
                  fontFamily: 'var(--font-label)',
                  fontSize: '11px',
                  padding: '3px 8px',
                  background: selectedCat === c.id ? 'var(--primary)' : 'var(--surface-container-low)',
                  color: selectedCat === c.id ? '#ffffff' : 'var(--on-surface)',
                  border: '1px solid var(--outline-variant)',
                  cursor: 'pointer',
                  fontWeight: selectedCat === c.id ? 700 : 500,
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
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--outline)', fontFamily: 'var(--font-label)' }}>
                    NO ITEMS MATCHING QUERY
                  </td>
                </tr>
              ) : (
                filteredItems.map((item, idx) => {
                  const isOwned = inventorySet.has(item.key);
                  return (
                    <tr
                      key={`${item.key}-${idx}`}
                      style={{
                        borderBottom: '1px solid var(--outline-variant)',
                        backgroundColor: isOwned ? 'transparent' : 'rgba(255, 240, 240, 0.4)',
                      }}
                    >
                      <td style={{ padding: '8px 12px' }}>
                        <span style={{
                          fontFamily: 'var(--font-label)',
                          fontSize: '10px',
                          fontWeight: 700,
                          padding: '2px 6px',
                          background: isOwned ? 'rgba(0, 103, 99, 0.1)' : 'rgba(183, 20, 34, 0.1)',
                          color: isOwned ? 'var(--tertiary)' : 'var(--primary)',
                          border: `1px solid ${isOwned ? 'var(--tertiary)' : 'var(--primary)'}`,
                        }}>
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
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
