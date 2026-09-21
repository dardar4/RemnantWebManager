import { useState } from 'react';
import type { FC } from 'react';
import type { RemnantCharacter, RemnantItem } from '../types/remnant';
import { gameData } from '../utils/saveParser';

interface WorldAnalyzerViewProps {
  character: RemnantCharacter;
  characters?: RemnantCharacter[];
  activeCharIndex?: number;
  onSelectChar?: (index: number) => void;
  onBackToHome: () => void;
  onOpenSettings?: () => void;
}

export const WorldAnalyzerView: FC<WorldAnalyzerViewProps> = ({
  character,
  characters = [],
  onOpenSettings,
}) => {
  const [mode, setMode] = useState<'campaign' | 'adventure'>('adventure');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const getItemType = (item: RemnantItem): string | null => {
    if (item.type && item.type !== 'Uncategorized') return item.type;
    const found = gameData.allItems.find((i) => i.key === item.key || i.name === item.name);
    if (found && found.type && found.type !== 'Uncategorized') return found.type;
    return null;
  };

  const currentEvents = mode === 'campaign' ? (character.campaignEvents || []) : (character.adventureEvents || []);
  const currentDifficulty = mode === 'campaign'
    ? (character.campaignDifficulty || (character.campaignEvents && character.campaignEvents.length > 0 ? 'Normal' : null))
    : (character.adventureDifficulty || (character.adventureEvents && character.adventureEvents.length > 0 ? 'Normal' : null));

  const getDifficultyColor = (diff?: string | null): string => {
    if (!diff) return 'var(--terra-900)';
    switch (diff.toLowerCase()) {
      case 'normal':
        return '#15803d'; // Green
      case 'hard':
        return '#b45309'; // Golden Amber
      case 'nightmare':
        return '#ea580c'; // Vibrant Flame Orange
      case 'apocalypse':
        return '#dc2626'; // Strong Crimson Red
      default:
        return 'var(--terra-900)';
    }
  };

  const filteredEvents = currentEvents.filter((evt) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      evt.name.toLowerCase().includes(q) ||
      evt.location.toLowerCase().includes(q) ||
      evt.type.toLowerCase().includes(q) ||
      evt.missingItems.some((item) => {
        const t = getItemType(item);
        return item.name.toLowerCase().includes(q) || (t && t.toLowerCase().includes(q));
      }) ||
      evt.possibleItems.some((item) => {
        const t = getItemType(item);
        return item.name.toLowerCase().includes(q) || (t && t.toLowerCase().includes(q));
      })
    );
  });

  const getBadgeStyles = (type: string) => {
    switch (type) {
      case 'World Boss':
        return { bg: 'rgba(185, 28, 28, 0.08)', color: '#b91c1c', border: 'rgba(185, 28, 28, 0.25)' };
      case 'Miniboss':
        return { bg: 'rgba(217, 119, 6, 0.08)', color: '#d97706', border: 'rgba(217, 119, 6, 0.25)' };
      case 'Dungeon':
        return { bg: 'rgba(37, 99, 235, 0.08)', color: '#2563eb', border: 'rgba(37, 99, 235, 0.25)' };
      case 'Point of Interest':
        return { bg: 'rgba(124, 58, 237, 0.08)', color: '#7c3aed', border: 'rgba(124, 58, 237, 0.25)' };
      case 'Siege':
        return { bg: 'rgba(194, 65, 12, 0.08)', color: '#c2410c', border: 'rgba(194, 65, 12, 0.25)' };
      case 'Item Drop':
        return { bg: 'rgba(5, 150, 105, 0.08)', color: '#059669', border: 'rgba(5, 150, 105, 0.25)' };
      default:
        return { bg: 'rgba(74, 114, 87, 0.1)', color: 'var(--moss-800)', border: 'rgba(74, 114, 87, 0.25)' };
    }
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: 'var(--terra-50)', minHeight: '100%' }}>
      <div style={{ padding: '1.5rem 2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '1600px', margin: '0 auto', width: '100%' }}>
        {/* Top Header Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontFamily: 'var(--font-headline)', fontSize: '24px', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--terra-900)' }}>
            World Analyzer Telemetry
          </h2>
        </div>

        {/* Mode Segmented Controls & Search Row */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingTop: '0.25rem' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
            {/* Segmented Tab Navigation */}
            <div style={{ display: 'inline-flex', padding: '0.25rem', borderRadius: '0.75rem', backgroundColor: 'var(--bg-card-subtle)', border: '1px solid var(--border-color)' }}>
              <button
                type="button"
                onClick={() => setMode('campaign')}
                style={{
                  padding: '0.5rem 1.5rem',
                  fontSize: '14px',
                  fontWeight: mode === 'campaign' ? 700 : 600,
                  borderRadius: '0.5rem',
                  color: mode === 'campaign' ? '#ffffff' : 'var(--text-secondary)',
                  backgroundColor: mode === 'campaign' ? 'var(--accent-emerald)' : 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: mode === 'campaign' ? '0 1px 3px rgba(0,0,0,0.15)' : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                Campaign
              </button>
              <button
                type="button"
                onClick={() => setMode('adventure')}
                style={{
                  padding: '0.5rem 1.5rem',
                  fontSize: '14px',
                  fontWeight: mode === 'adventure' ? 700 : 600,
                  borderRadius: '0.5rem',
                  color: mode === 'adventure' ? '#ffffff' : 'var(--text-secondary)',
                  backgroundColor: mode === 'adventure' ? 'var(--accent-emerald)' : 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: mode === 'adventure' ? '0 1px 3px rgba(0,0,0,0.15)' : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                Adventure
              </button>
            </div>

            {/* Search Input */}
            <div style={{ position: 'relative', width: '100%', maxWidth: '32rem' }}>
              <span
                className="material-symbols-outlined"
                style={{
                  position: 'absolute',
                  left: '0.875rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: '20px',
                  color: 'var(--terra-400)',
                  pointerEvents: 'none',
                }}
              >
                search
              </span>
              <input
                type="text"
                placeholder="Filter bosses, dungeons, drops..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  paddingLeft: '2.5rem',
                  paddingRight: '1rem',
                  paddingTop: '0.625rem',
                  paddingBottom: '0.625rem',
                  borderRadius: '0.75rem',
                  backgroundColor: 'var(--bg-card-subtle)',
                  border: '1px solid var(--border-color)',
                  fontSize: '14px',
                  fontFamily: 'var(--font-label)',
                  color: 'var(--terra-900)',
                  outline: 'none',
                  fontWeight: 500,
                  boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                }}
              />
            </div>
          </div>
        </section>

        {/* Profile Warning Banner when profile.sav has not been uploaded */}
        {(!character.inventory || character.inventory.length === 0) && currentEvents.length > 0 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.75rem',
              padding: '0.75rem 1rem',
              backgroundColor: '#FEF3C7',
              border: '1px solid #FCD34D',
              borderRadius: '0.75rem',
              fontSize: '12px',
              color: '#92400E',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#D97706', flexShrink: 0 }}>
                info
              </span>
              <span>
                <strong>Profile inventory not loaded:</strong> Showing all potential item rewards. Upload your{' '}
                <code style={{ backgroundColor: 'rgba(217, 119, 6, 0.15)', color: '#78350F', padding: '1px 5px', borderRadius: '4px', fontWeight: 600 }}>profile.sav</code>{' '}
                to filter out weapons, traits, and armor your character already owns (like in the C# tool)!
              </span>
            </div>
            {onOpenSettings && (
              <button
                onClick={onOpenSettings}
                style={{
                  flexShrink: 0,
                  padding: '0.35rem 0.75rem',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#78350F',
                  backgroundColor: '#FDE68A',
                  border: '1px solid #F59E0B',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                }}
              >
                Configure in Settings
              </button>
            )}
          </div>
        )}

        {/* World Roll Table Section */}
        <section className="wa-table-container">
          <div style={{ overflowX: 'auto', borderTopLeftRadius: '1rem', borderTopRightRadius: '1rem' }}>
            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
              <thead>
                <tr className="wa-table-header">
                  <th style={{ width: '11%' }} scope="col">Area</th>
                  <th style={{ width: '21%' }} scope="col">Location</th>
                  <th style={{ width: '14%' }} scope="col">Event Type</th>
                  <th style={{ width: '18%' }} scope="col">Event Name</th>
                  <th style={{ width: '21%' }} scope="col">Missing Items</th>
                  <th style={{ width: '15%' }} scope="col">Where to Find</th>
                </tr>
              </thead>
              <tbody style={{ fontSize: '14px', color: 'var(--terra-800)' }}>
                {currentEvents.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '2.5rem 1.25rem', color: 'var(--terra-500)', fontFamily: 'var(--font-label)' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '28px', color: 'var(--terra-400)' }}>
                          {mode === 'adventure' ? 'explore_off' : 'table_rows'}
                        </span>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--terra-800)' }}>
                          {characters.length === 0
                            ? 'No world data loaded yet'
                            : mode === 'adventure'
                            ? 'No Adventure Mode roll detected in this save'
                            : 'No world data loaded yet'}
                        </span>
                        <span style={{ fontSize: '12px', color: 'var(--terra-500)', maxWidth: '28rem', lineHeight: 1.5 }}>
                          {characters.length === 0
                            ? 'Configure your save directory in Settings or click the Refresh button (🔄) in the top header to load your world telemetry.'
                            : mode === 'adventure'
                            ? 'Roll an Adventure at the World Stone in-game to parse Adventure telemetry, or switch to Campaign mode above.'
                            : 'Touch the red World Stone in-game to flush your save, then click the Refresh button (🔄) in the top header.'}
                        </span>
                        {characters.length === 0 && onOpenSettings && (
                          <button
                            type="button"
                            onClick={onOpenSettings}
                            style={{
                              marginTop: '0.5rem',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.375rem',
                              padding: '0.4rem 0.875rem',
                              fontSize: '11px',
                              fontWeight: 600,
                              color: '#ffffff',
                              backgroundColor: 'var(--moss-600)',
                              border: '1px solid var(--moss-700)',
                              borderRadius: '0.5rem',
                              cursor: 'pointer',
                              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                            }}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>
                              settings
                            </span>
                            <span>Configure in Settings</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : filteredEvents.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '2.5rem 1.25rem', color: 'var(--terra-500)', fontFamily: 'var(--font-label)' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '28px', color: 'var(--terra-400)' }}>
                          search_off
                        </span>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--terra-800)' }}>
                          No events match "{searchQuery}"
                        </span>
                        <span style={{ fontSize: '12px', color: 'var(--terra-500)' }}>
                          Try clearing or adjusting your search query.
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredEvents.map((evt, idx) => {
                    const badge = getBadgeStyles(evt.type);
                    const locParts = evt.location.split(': ');
                    const area = locParts[0] || '—';
                    const locationName = locParts.length > 1 ? locParts.slice(1).join(': ') : '—';

                    return (
                      <tr
                        key={`${evt.key}-${idx}`}
                        style={{
                          borderBottom: '1px solid var(--border-color)',
                          backgroundColor: idx % 2 === 0 ? 'var(--bg-card)' : 'var(--bg-card-subtle)',
                          transition: 'background-color 0.1s ease',
                        }}
                      >
                        {/* Area */}
                        <td style={{ padding: '0.9rem 1.25rem', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                          <span style={{ fontWeight: 700, color: 'var(--terra-800)', fontSize: '14px' }}>
                            {area}
                          </span>
                        </td>

                        {/* Location */}
                        <td style={{ padding: '0.9rem 1.25rem', verticalAlign: 'middle' }}>
                          <span style={{ fontWeight: 500, color: 'var(--terra-900)', fontSize: '14px' }}>
                            {locationName}
                          </span>
                        </td>

                        {/* Event Type */}
                        <td style={{ padding: '0.9rem 1.25rem', verticalAlign: 'middle' }}>
                          <span
                            style={{
                              display: 'inline-block',
                              padding: '0.25rem 0.65rem',
                              borderRadius: '9999px',
                              fontSize: '11px',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              letterSpacing: '0.04em',
                              backgroundColor: badge.bg,
                              color: badge.color,
                              border: `1px solid ${badge.border}`,
                            }}
                          >
                            {evt.type}
                          </span>
                        </td>

                        {/* Event Name */}
                        <td style={{ padding: '0.9rem 1.25rem', verticalAlign: 'middle' }}>
                          <span style={{ fontWeight: 700, color: 'var(--terra-900)', fontSize: '15px' }}>
                            {evt.name}
                          </span>
                        </td>

                        {/* Missing Items */}
                        <td style={{ padding: '0.9rem 1.25rem', verticalAlign: 'middle' }}>
                          {evt.missingItems && evt.missingItems.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                              {evt.missingItems.map((item, itemIdx) => {
                                const itemType = getItemType(item);
                                return (
                                  <div
                                    key={itemIdx}
                                    style={{
                                      display: 'flex',
                                      alignItems: 'baseline',
                                      gap: '0.4rem',
                                      fontSize: '14px',
                                      lineHeight: 1.45,
                                    }}
                                  >
                                    <span style={{ fontWeight: 600, color: 'var(--terra-900)' }}>
                                      {item.name}
                                    </span>
                                    {itemType && (
                                      <span style={{ color: 'var(--terra-500)', fontSize: '12px', fontWeight: 500 }}>
                                        ({itemType})
                                      </span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          ) : character.inventory && character.inventory.length > 0 && evt.possibleItems && evt.possibleItems.length > 0 ? (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'var(--moss-700)', fontSize: '13px', fontWeight: 600 }}>
                              <span className="material-symbols-outlined" style={{ fontSize: '17px' }}>
                                check_circle
                              </span>
                              All Acquired
                            </span>
                          ) : (
                            <span style={{ color: 'var(--terra-400)', fontSize: '14px', fontStyle: 'italic' }}>
                              —
                            </span>
                          )}
                        </td>

                        {/* Where to Find */}
                        <td style={{ padding: '0.9rem 1.25rem', verticalAlign: 'middle' }}>
                          {evt.missingItems && evt.missingItems.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                              {evt.missingItems.map((item, itemIdx) => {
                                const searchQuery = `in remnant from the ashes where can i find the ${item.name.toLowerCase()}`;
                                const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`;
                                return (
                                  <a
                                    key={itemIdx}
                                    href={googleUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '0.35rem',
                                      fontSize: '13px',
                                      fontWeight: 600,
                                      color: 'var(--accent-emerald)',
                                      textDecoration: 'none',
                                      lineHeight: 1.45,
                                    }}
                                    onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
                                    onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
                                    title={`Search Google: "${searchQuery}"`}
                                  >
                                    <span>Find {item.name}</span>
                                    <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>
                                      open_in_new
                                    </span>
                                  </a>
                                );
                              })}
                            </div>
                          ) : (
                            <span style={{ color: 'var(--terra-400)', fontSize: '14px', fontStyle: 'italic' }}>
                              —
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer Status (Sticky at bottom) */}
          <div
            style={{
              position: 'sticky',
              bottom: 0,
              zIndex: 10,
              padding: '0.875rem 1.5rem',
              backgroundColor: 'var(--bg-card-subtle)',
              borderTop: '1px solid var(--border-color)',
              borderBottomLeftRadius: '1rem',
              borderBottomRightRadius: '1rem',
              boxShadow: '0 -4px 12px rgba(0, 0, 0, 0.08)',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '13px',
              color: 'var(--terra-600)',
              gap: '0.75rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontFamily: 'var(--font-label)', fontSize: '12px' }}>
              <span>
                Mode: <strong style={{ color: 'var(--terra-900)' }}>{mode === 'campaign' ? 'Campaign' : 'Adventure'}</strong>
              </span>
              {currentDifficulty && (
                <>
                  <span style={{ color: 'var(--terra-300)' }}>|</span>
                  <span>
                    Difficulty: <strong style={{ color: getDifficultyColor(currentDifficulty), fontWeight: 700 }}>{currentDifficulty}</strong>
                  </span>
                </>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '9999px',
                  backgroundColor: currentEvents.length > 0 ? 'var(--moss-600)' : 'var(--terra-400)',
                }}
              />
              <span style={{ fontWeight: 500 }}>
                Analysis synced to local save state: {filteredEvents.length} of {currentEvents.length} world entries rendered.
              </span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
