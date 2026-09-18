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
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);

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
                      fontSize: '14px',
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
                      backgroundColor: 'rgba(74, 114, 87, 0.12)',
                      color: 'var(--moss-800)',
                    }}
                  >
                    Tips &amp; Info
                  </span>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--terra-600)', margin: '0.2rem 0 0' }}>
                  Learn how save sync works, troubleshooting missing items, and known game nuances
                </p>
              </div>
            </div>
            <span
              className="material-symbols-outlined"
              style={{
                fontSize: '20px',
                color: 'var(--terra-500)',
                transform: isGuideOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s ease',
              }}
            >
              expand_more
            </span>
          </button>

          {/* Accordion Content */}
          {isGuideOpen && (
            <div
              style={{
                padding: '1.25rem 1.5rem',
                borderTop: '1px solid var(--terra-100)',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '1.5rem',
                fontSize: '13px',
                color: 'var(--terra-700)',
                lineHeight: 1.6,
                backgroundColor: '#ffffff',
              }}
            >
              {/* Step 1: Save File Directory Setup */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--terra-900)', fontWeight: 700 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--moss-700)' }}>
                      folder_open
                    </span>
                    <span>1. Set Up Save Files</span>
                  </div>
                  {onOpenSettings && (
                    <button
                      type="button"
                      onClick={onOpenSettings}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        padding: '0.25rem 0.6rem',
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
                      <span className="material-symbols-outlined" style={{ fontSize: '13px', color: 'var(--terra-700)' }}>
                        settings
                      </span>
                      <span>Open Settings</span>
                    </button>
                  )}
                </div>
                <ul style={{ margin: 0, paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <li>
                    Click <strong>Open Settings</strong> (or the ⚙️ gear icon) and copy your save directory path: <code style={{ padding: '0.1rem 0.35rem', borderRadius: '4px', backgroundColor: 'var(--terra-100)', color: 'var(--moss-800)', fontFamily: 'var(--font-label)', fontSize: '11px', fontWeight: 600 }}>%LOCALAPPDATA%\Remnant\Saved\SaveGames</code>.
                  </li>
                  <li>
                    In Settings, click <strong>Link Save Folder</strong> (or <strong>Save Path</strong> if running locally) — this connects your save folder and is required for the <strong>Refresh (🔄)</strong> button to work!
                  </li>
                  <li>
                    Alternatively, click <strong>Upload Save Files</strong> (or drag &amp; drop files directly onto this page) and select all your <code style={{ padding: '0.1rem 0.35rem', borderRadius: '4px', backgroundColor: 'var(--terra-100)', color: 'var(--moss-800)', fontFamily: 'var(--font-label)', fontSize: '11px', fontWeight: 600 }}>.sav</code> files (<code style={{ padding: '0.1rem 0.35rem', borderRadius: '4px', backgroundColor: 'var(--terra-100)', color: 'var(--moss-800)', fontFamily: 'var(--font-label)', fontSize: '11px', fontWeight: 600 }}>profile.sav</code>, <code style={{ padding: '0.1rem 0.35rem', borderRadius: '4px', backgroundColor: 'var(--terra-100)', color: 'var(--moss-800)', fontFamily: 'var(--font-label)', fontSize: '11px', fontWeight: 600 }}>save_0.sav</code>, etc.).
                  </li>
                </ul>
              </div>

              {/* Step 2: Reroll In-Game */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--terra-900)', fontWeight: 700 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--moss-700)' }}>
                    casino
                  </span>
                  <span>2. Reroll &amp; Save Worlds</span>
                </div>
                <ul style={{ margin: 0, paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <li>
                    In Ward 13, access the red World Stone &gt; <em>World Settings</em> &gt; <em>Reroll Adventure Mode</em> (or Campaign).
                  </li>
                  <li>
                    Touch a <strong>World Stone checkpoint</strong> in-game after traveling to ensure your local save file flushes and records the new world generation seeds.
                  </li>
                  <li>
                    Rerolling Adventure Mode does not reset your Campaign story progress.
                  </li>
                </ul>
              </div>

              {/* Step 3: Refresh & Analyze */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--terra-900)', fontWeight: 700 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--moss-700)' }}>
                    sync
                  </span>
                  <span>3. Refresh Telemetry</span>
                </div>
                <ul style={{ margin: 0, paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <li>
                    Click the <strong>Refresh Telemetry (🔄)</strong> button in the top bar or press <kbd style={{ padding: '0.1rem 0.35rem', backgroundColor: 'var(--terra-100)', borderRadius: '4px', fontSize: '11px' }}>F5</kbd> to instantly reload save rolls.
                  </li>
                  <li>
                    Toggle between <strong>Campaign</strong> and <strong>Adventure</strong> tabs, and filter missing items using the search bar below.
                  </li>
                  <li>
                    The difficulty indicator (Normal, Hard, Nightmare, Apocalypse) automatically updates for each world mode.
                  </li>
                </ul>
              </div>

              {/* Security & Local Processing Note */}
              <div
                style={{
                  gridColumn: '1 / -1',
                  padding: '0.65rem 1rem',
                  backgroundColor: 'rgba(74, 114, 87, 0.08)',
                  borderRadius: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '12px',
                  color: 'var(--moss-900)',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--moss-700)' }}>
                  security
                </span>
                <span>
                  <strong>100% Client-Side:</strong> Save analysis executes strictly inside your browser. No save game or telemetry data is ever uploaded or transmitted externally.
                </span>
              </div>
            </div>
          )}
        </section>

        {/* Mode Segmented Controls & Search Row */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingTop: '0.25rem' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
            {/* Segmented Tab Navigation */}
            <div style={{ display: 'inline-flex', padding: '0.25rem', borderRadius: '0.75rem', backgroundColor: '#EDE7DD', border: '1px solid rgba(207, 195, 179, 0.8)' }}>
              <button
                type="button"
                onClick={() => setMode('campaign')}
                style={{
                  padding: '0.5rem 1.5rem',
                  fontSize: '14px',
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
                  padding: '0.5rem 1.5rem',
                  fontSize: '14px',
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
                  backgroundColor: '#ffffff',
                  border: '1px solid var(--terra-300)',
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
                  <th style={{ width: '12%' }} scope="col">Area</th>
                  <th style={{ width: '24%' }} scope="col">Location</th>
                  <th style={{ width: '16%' }} scope="col">Event Type</th>
                  <th style={{ width: '20%' }} scope="col">Event Name</th>
                  <th style={{ width: '28%' }} scope="col">Missing Items</th>
                </tr>
              </thead>
              <tbody style={{ fontSize: '14px', color: 'var(--terra-800)' }}>
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
              backgroundColor: '#FAF8F5',
              borderTop: '1px solid rgba(226, 218, 207, 0.9)',
              borderBottomLeftRadius: '1rem',
              borderBottomRightRadius: '1rem',
              boxShadow: '0 -4px 12px rgba(45, 38, 30, 0.08)',
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
