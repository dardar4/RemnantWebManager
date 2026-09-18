import { useState } from 'react';
import type { FC } from 'react';
import type { RemnantCharacter, RemnantItem } from '../types/remnant';
import { gameData } from '../utils/saveParser';

interface WorldAnalyzerViewProps {
  character: RemnantCharacter;
  characters: RemnantCharacter[];
  activeCharIndex: number;
  onSelectChar: (index: number) => void;
  onBackToHome: () => void;
  onOpenSettings?: () => void;
}

export const WorldAnalyzerView: FC<WorldAnalyzerViewProps> = ({
  character,
  characters,
  activeCharIndex,
  onSelectChar,
  onOpenSettings,
}) => {
  const [mode, setMode] = useState<'campaign' | 'adventure'>('adventure');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);

  const getItemType = (item: RemnantItem): string | null => {
    if (item.type && item.type !== 'Uncategorized') return item.type;
    const found = gameData.allItems.find((i) => i.key === item.key || i.name === item.name);
    if (found && found.type && found.type !== 'Uncategorized') return found.type;
    return null;
  };

  const currentEvents = mode === 'campaign' ? (character.campaignEvents || []) : (character.adventureEvents || []);

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

  const handleDownloadJson = () => {
    if (currentEvents.length === 0) return;
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(currentEvents, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `remnant_${mode}_roll_slot${activeCharIndex}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const getBadgeStyles = (type: string) => {
    switch (type) {
      case 'World Boss':
        return { bg: 'rgba(185, 28, 28, 0.08)', color: '#b91c1c', border: 'rgba(185, 28, 28, 0.25)' };
      case 'Miniboss':
        return { bg: 'rgba(217, 119, 6, 0.08)', color: '#d97706', border: 'rgba(217, 119, 6, 0.25)' };
      case 'Side Dungeon':
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
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: 'var(--terra-50)', minHeight: '100%', overflowY: 'auto' }}>
      <div style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
        {/* Top Header Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontFamily: 'var(--font-headline)', fontSize: '20px', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--terra-900)' }}>
            World Analyzer Telemetry
          </h2>
        </div>

        {/* Combined Expandable Instructions & Known Issues Card */}
        <section
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '1rem',
            border: '1px solid rgba(226, 218, 207, 0.9)',
            boxShadow: '0 2px 8px -1px rgba(45, 38, 30, 0.04)',
            overflow: 'hidden',
          }}
        >
          {/* Clickable Header / Accordion trigger */}
          <button
            type="button"
            onClick={() => setIsGuideOpen(!isGuideOpen)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.875rem 1.25rem',
              backgroundColor: isGuideOpen ? 'rgba(250, 248, 245, 0.85)' : '#ffffff',
              border: 'none',
              borderBottom: isGuideOpen ? '1px solid var(--terra-100)' : 'none',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'background-color 0.15s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span
                className="material-symbols-outlined"
                style={{
                  fontSize: '20px',
                  color: isGuideOpen ? 'var(--moss-700)' : 'var(--terra-500)',
                }}
              >
                help_outline
              </span>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                  <span
                    style={{
                      fontFamily: 'var(--font-headline)',
                      fontSize: '13px',
                      fontWeight: 700,
                      color: 'var(--terra-900)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    How to use &amp; Reroll Guide
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--font-label)',
                      fontSize: '10px',
                      fontWeight: 600,
                      padding: '0.125rem 0.5rem',
                      borderRadius: '9999px',
                      backgroundColor: 'var(--terra-100)',
                      color: 'var(--terra-600)',
                    }}
                  >
                    {isGuideOpen ? 'Hide' : 'Show Guide'}
                  </span>
                </div>
                <p
                  style={{
                    fontSize: '11px',
                    color: 'var(--terra-500)',
                    marginTop: '0.125rem',
                  }}
                >
                  Quick setup instructions, rerolling at the World Stone, and analyzing rolls
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', color: 'var(--terra-500)' }}>
              <span
                className="material-symbols-outlined"
                style={{
                  fontSize: '22px',
                  transform: isGuideOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s ease',
                }}
              >
                expand_more
              </span>
            </div>
          </button>

          {/* Expandable Content Area */}
          {isGuideOpen && (
            <div
              style={{
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.25rem',
              }}
            >
              {/* Sub-section 1: How to Use */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.625rem' }}>
                  <h4
                    style={{
                      fontFamily: 'var(--font-headline)',
                      fontSize: '12px',
                      fontWeight: 700,
                      color: 'var(--terra-900)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    How to use:
                  </h4>
                  {onOpenSettings && (
                    <button
                      type="button"
                      onClick={onOpenSettings}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.375rem',
                        padding: '0.3rem 0.65rem',
                        fontSize: '11px',
                        fontWeight: 600,
                        color: 'var(--terra-800)',
                        backgroundColor: 'var(--terra-100)',
                        border: '1px solid var(--terra-300)',
                        borderRadius: '0.5rem',
                        cursor: 'pointer',
                        transition: 'background-color 0.15s ease',
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '14px', color: 'var(--terra-700)' }}>
                        settings
                      </span>
                      <span>Open Settings</span>
                    </button>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', fontSize: '12px', color: 'var(--terra-700)', lineHeight: 1.6 }}>
                  <p>
                    <strong>1. Load Your Save Files:</strong> Click the <strong>Open Settings</strong> button above (or the ⚙️ gear icon in the header) and click <strong>Copy</strong> next to the save directory path. Then click <strong>Upload Save Files</strong>, paste the path into Windows Explorer, and select both <code style={{ padding: '0.125rem 0.375rem', borderRadius: '0.25rem', backgroundColor: 'var(--terra-100)', color: 'var(--moss-700)', fontFamily: 'var(--font-label)', fontSize: '11px', fontWeight: 600 }}>profile.sav</code> and <code style={{ padding: '0.125rem 0.375rem', borderRadius: '0.25rem', backgroundColor: 'var(--terra-100)', color: 'var(--moss-700)', fontFamily: 'var(--font-label)', fontSize: '11px', fontWeight: 600 }}>save_0.sav</code>. <em>(Tip: You can also drag and drop both files directly anywhere onto this page!)</em>
                  </p>
                  <p>
                    <strong>2. Reroll In-Game at the World Stone:</strong> In Remnant: From the Ashes, whenever you re-roll your Campaign or Adventure mode at Ward 13, interact with the red World Stone to save your new world roll to disk.
                  </p>
                  <p>
                    <strong>3. Refresh &amp; Analyze World:</strong> Re-upload your save files or click the global <strong>Refresh button (🔄)</strong> in the top header to instantly parse and view all newly spawned world bosses, dungeons, random events, and missing items.
                  </p>
                </div>

                {/* Local file parsing disclaimer */}
                <div style={{ marginTop: '0.875rem', paddingTop: '0.875rem', borderTop: '1px solid var(--terra-100)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '11px', color: 'var(--terra-500)', fontWeight: 500 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '14px', color: 'var(--moss-600)' }}>
                    check_circle
                  </span>
                  <span>Local file parsing only — zero telemetry data sent over external networks.</span>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Character Selection & Mode Bar */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingTop: '0.25rem' }}>
          {/* Character selection centered row */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-headline)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--terra-700)' }}>
              Character selection:
            </span>
            <div style={{ position: 'relative', width: '18rem' }}>
              <select
                value={activeCharIndex}
                disabled={characters.length === 0}
                onChange={(e) => onSelectChar(Number(e.target.value))}
                style={{
                  width: '100%',
                  appearance: 'none',
                  borderRadius: '0.75rem',
                  backgroundColor: characters.length === 0 ? 'var(--terra-50)' : '#ffffff',
                  border: '1px solid var(--terra-300)',
                  padding: '0.625rem 2.25rem 0.625rem 1rem',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: characters.length === 0 ? 'var(--terra-500)' : 'var(--terra-900)',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                  cursor: characters.length === 0 ? 'default' : 'pointer',
                  outline: 'none',
                }}
              >
                {characters.length === 0 ? (
                  <option value="">No characters loaded</option>
                ) : (
                  characters.map((c, i) => (
                    <option key={c.id} value={i}>
                      Character {i + 1} ({c.archetype} // {c.inventory.length} items)
                    </option>
                  ))
                )}
              </select>
              <div style={{ pointerEvents: 'none', position: 'absolute', top: 0, bottom: 0, right: 0, display: 'flex', alignItems: 'center', padding: '0 0.75rem', color: 'var(--terra-600)' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                  expand_more
                </span>
              </div>
            </div>
          </div>

          {/* Mode Segmented Controls & Search Row */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', paddingTop: '0.5rem' }}>
            {/* Segmented Tab Navigation */}
            <div style={{ display: 'inline-flex', padding: '0.25rem', borderRadius: '0.75rem', backgroundColor: '#EDE7DD', border: '1px solid rgba(207, 195, 179, 0.8)' }}>
              <button
                type="button"
                onClick={() => setMode('campaign')}
                style={{
                  padding: '0.4rem 1.25rem',
                  fontSize: '12px',
                  fontWeight: mode === 'campaign' ? 700 : 600,
                  borderRadius: '0.5rem',
                  color: mode === 'campaign' ? '#ffffff' : 'var(--terra-700)',
                  backgroundColor: mode === 'campaign' ? 'var(--moss-600)' : 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: mode === 'campaign' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                Campaign
              </button>
              <button
                type="button"
                onClick={() => setMode('adventure')}
                style={{
                  padding: '0.4rem 1.25rem',
                  fontSize: '12px',
                  fontWeight: mode === 'adventure' ? 700 : 600,
                  borderRadius: '0.5rem',
                  color: mode === 'adventure' ? '#ffffff' : 'var(--terra-700)',
                  backgroundColor: mode === 'adventure' ? 'var(--moss-600)' : 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: mode === 'adventure' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                Adventure
              </button>
            </div>

            {/* Search Input */}
            <div style={{ position: 'relative', width: '100%', maxWidth: '28rem' }}>
              <span
                className="material-symbols-outlined"
                style={{
                  position: 'absolute',
                  left: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: '18px',
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
                  paddingLeft: '2.25rem',
                  paddingRight: '0.875rem',
                  paddingTop: '0.5rem',
                  paddingBottom: '0.5rem',
                  borderRadius: '0.75rem',
                  backgroundColor: '#ffffff',
                  border: '1px solid var(--terra-300)',
                  fontSize: '12px',
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
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
              <thead>
                <tr className="wa-table-header">
                  <th style={{ width: '12%' }} scope="col">Area</th>
                  <th style={{ width: '24%' }} scope="col">Location</th>
                  <th style={{ width: '16%' }} scope="col">Event Type</th>
                  <th style={{ width: '20%' }} scope="col">Event Name</th>
                  <th style={{ width: '28%' }} scope="col">Missing Items</th>
                </tr>
              </thead>
              <tbody style={{ fontSize: '12px', color: 'var(--terra-800)' }}>
                {currentEvents.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '2.5rem 1.25rem', color: 'var(--terra-500)', fontFamily: 'var(--font-label)' }}>
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
                          borderBottom: '1px solid rgba(226, 218, 207, 0.6)',
                          backgroundColor: idx % 2 === 0 ? '#ffffff' : 'rgba(250, 248, 245, 0.5)',
                          transition: 'background-color 0.1s ease',
                        }}
                      >
                        {/* Area */}
                        <td style={{ padding: '0.75rem 1rem', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                          <span style={{ fontWeight: 700, color: 'var(--terra-800)', fontSize: '12px' }}>
                            {area}
                          </span>
                        </td>

                        {/* Location */}
                        <td style={{ padding: '0.75rem 1rem', verticalAlign: 'middle' }}>
                          <span style={{ fontWeight: 500, color: 'var(--terra-900)', fontSize: '12px' }}>
                            {locationName}
                          </span>
                        </td>

                        {/* Event Type */}
                        <td style={{ padding: '0.75rem 1rem', verticalAlign: 'middle' }}>
                          <span
                            style={{
                              display: 'inline-block',
                              padding: '0.2rem 0.55rem',
                              borderRadius: '9999px',
                              fontSize: '10px',
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
                        <td style={{ padding: '0.75rem 1rem', verticalAlign: 'middle' }}>
                          <span style={{ fontWeight: 700, color: 'var(--terra-900)', fontSize: '13px' }}>
                            {evt.name}
                          </span>
                        </td>

                        {/* Missing Items */}
                        <td style={{ padding: '0.75rem 1rem', verticalAlign: 'middle' }}>
                          {evt.missingItems && evt.missingItems.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                              {evt.missingItems.map((item, itemIdx) => {
                                const itemType = getItemType(item);
                                return (
                                  <div
                                    key={itemIdx}
                                    style={{
                                      display: 'flex',
                                      alignItems: 'baseline',
                                      gap: '0.35rem',
                                      fontSize: '12px',
                                      lineHeight: 1.4,
                                    }}
                                  >
                                    <span style={{ fontWeight: 600, color: 'var(--terra-900)' }}>
                                      {item.name}
                                    </span>
                                    {itemType && (
                                      <span style={{ color: 'var(--terra-500)', fontSize: '11px', fontWeight: 500 }}>
                                        ({itemType})
                                      </span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          ) : character.inventory && character.inventory.length > 0 && evt.possibleItems && evt.possibleItems.length > 0 ? (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: 'var(--moss-700)', fontSize: '11px', fontWeight: 600 }}>
                              <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>
                                check_circle
                              </span>
                              All Acquired
                            </span>
                          ) : (
                            <span style={{ color: 'var(--terra-400)', fontSize: '12px', fontStyle: 'italic' }}>
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

          {/* Table Footer Status */}
          <div style={{ padding: '0.75rem 1.5rem', backgroundColor: 'var(--terra-50)', borderTop: '1px solid rgba(226, 218, 207, 0.8)', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', color: 'var(--terra-600)', gap: '0.75rem' }}>
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontFamily: 'var(--font-label)', fontSize: '11px' }}>
              <span>Mode: {mode === 'campaign' ? 'Campaign' : 'Adventure'}</span>
              <span style={{ color: 'var(--terra-300)' }}>|</span>
              <span
                onClick={handleDownloadJson}
                style={{
                  color: currentEvents.length > 0 ? 'var(--moss-700)' : 'var(--terra-400)',
                  fontWeight: 600,
                  cursor: currentEvents.length > 0 ? 'pointer' : 'default',
                }}
              >
                Download Raw JSON
              </span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
