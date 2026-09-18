import { useState, useMemo } from 'react';
import type { FC } from 'react';
import type { RemnantCharacter } from '../types/remnant';
import { gameData } from '../utils/saveParser';

interface WorldAnalyzerViewProps {
  character: RemnantCharacter;
  onBackToHome: () => void;
}

export const WorldAnalyzerView: FC<WorldAnalyzerViewProps> = ({
  character,
  onBackToHome,
}) => {
  const [mode, setMode] = useState<'campaign' | 'adventure'>('campaign');
  const [selectedZone, setSelectedZone] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [onlyMissing, setOnlyMissing] = useState<boolean>(false);

  const events = mode === 'campaign' ? character.campaignEvents : character.adventureEvents;

  const filteredEvents = useMemo(() => {
    return events.filter((evt) => {
      if (selectedZone !== 'all') {
        if (!evt.location.toLowerCase().includes(selectedZone.toLowerCase())) return false;
      }
      if (onlyMissing && evt.missingItems.length === 0) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = evt.name.toLowerCase().includes(q);
        const matchLoc = evt.location.toLowerCase().includes(q);
        const matchLoot = evt.possibleItems.some((i) => i.name.toLowerCase().includes(q));
        if (!matchName && !matchLoc && !matchLoot) return false;
      }
      return true;
    });
  }, [events, selectedZone, onlyMissing, searchQuery]);

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
          <span className="breadcrumb-active">WORLD ANALYZER</span>
          <span>/</span>
          <span style={{ color: 'var(--secondary)', fontWeight: 600 }}>
            {mode === 'campaign' ? 'CAMPAIGN ROLL' : 'ADVENTURE ROLL'}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => setMode('campaign')}
            style={{
              fontFamily: 'var(--font-label)',
              fontSize: '11px',
              padding: '4px 10px',
              background: mode === 'campaign' ? 'var(--secondary)' : 'var(--surface-container)',
              color: mode === 'campaign' ? '#ffffff' : 'var(--on-surface)',
              border: '1px solid var(--outline-variant)',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            CAMPAIGN SEED ({character.campaignEvents.length})
          </button>
          <button
            onClick={() => setMode('adventure')}
            disabled={!character.hasAdventureData && character.adventureEvents.length === 0}
            style={{
              fontFamily: 'var(--font-label)',
              fontSize: '11px',
              padding: '4px 10px',
              background: mode === 'adventure' ? 'var(--secondary)' : 'var(--surface-container)',
              color: mode === 'adventure' ? '#ffffff' : 'var(--on-surface)',
              border: '1px solid var(--outline-variant)',
              cursor: 'pointer',
              opacity: !character.hasAdventureData && character.adventureEvents.length === 0 ? 0.5 : 1,
              fontWeight: 600,
            }}
          >
            ADVENTURE SEED ({character.adventureEvents.length})
          </button>
        </div>
      </div>

      {/* Controls Strip */}
      <div className="view-container">
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '0.5rem', flex: 1, minWidth: '240px' }}>
            <input
              type="text"
              placeholder="Search rolled events, bosses, locations, loot drops..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="tactical-input"
            />
          </div>

          <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => setSelectedZone('all')}
              style={{
                fontFamily: 'var(--font-label)',
                fontSize: '11px',
                padding: '3px 8px',
                background: selectedZone === 'all' ? 'var(--primary)' : 'var(--surface-container-low)',
                color: selectedZone === 'all' ? '#ffffff' : 'var(--on-surface)',
                border: '1px solid var(--outline-variant)',
                cursor: 'pointer',
              }}
            >
              All Zones
            </button>
            {Object.keys(gameData.zones).map((z) => (
              <button
                key={z}
                onClick={() => setSelectedZone(z)}
                style={{
                  fontFamily: 'var(--font-label)',
                  fontSize: '11px',
                  padding: '3px 8px',
                  background: selectedZone === z ? 'var(--primary)' : 'var(--surface-container-low)',
                  color: selectedZone === z ? '#ffffff' : 'var(--on-surface)',
                  border: '1px solid var(--outline-variant)',
                  cursor: 'pointer',
                }}
              >
                {z}
              </button>
            ))}
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '12px', fontFamily: 'var(--font-label)', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={onlyMissing}
              onChange={(e) => setOnlyMissing(e.target.checked)}
            />
            <span>ONLY MISSING LOOT</span>
          </label>
        </div>

        {/* Events Grid */}
        {filteredEvents.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', background: 'var(--surface-container-low)', border: '1px dashed var(--outline-variant)' }}>
            <div style={{ fontFamily: 'var(--font-headline)', fontSize: '16px', color: 'var(--outline)', marginBottom: '0.5rem' }}>
              NO ENCOUNTERS MATCHING CRITERIA
            </div>
            <p style={{ fontSize: '12px', color: 'var(--outline)' }}>
              Check your search query or select "All Zones".
            </p>
          </div>
        ) : (
          <div className="tactical-event-grid">
            {filteredEvents.map((evt, idx) => {
              const hasMissing = evt.missingItems.length > 0;
              return (
                <div
                  key={`${evt.key}-${idx}`}
                  className={`tactical-event-card ${hasMissing ? 'missing-border' : ''}`}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h4 style={{ fontFamily: 'var(--font-headline)', fontSize: '15px', fontWeight: 700, color: 'var(--on-surface)' }}>
                        {evt.name}
                      </h4>
                      <span style={{ fontSize: '11px', color: 'var(--tertiary)', fontFamily: 'var(--font-label)' }}>
                        📍 {evt.location}
                      </span>
                    </div>
                    <span style={{ fontFamily: 'var(--font-label)', fontSize: '10px', padding: '2px 6px', background: 'var(--surface-container-high)', border: '1px solid var(--outline-variant)', fontWeight: 600 }}>
                      {evt.type}
                    </span>
                  </div>

                  {/* Loot */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginTop: '0.25rem' }}>
                    <span style={{ fontFamily: 'var(--font-label)', fontSize: '10px', color: 'var(--outline)', textTransform: 'uppercase' }}>
                      POTENTIAL DROPS ({evt.possibleItems.length}):
                    </span>
                    {evt.possibleItems.map((item, itemIdx) => {
                      const isOwned = character.inventory.includes(item.key);
                      return (
                        <div key={`${item.key}-${itemIdx}`} className={`tactical-loot-item ${!isOwned ? 'missing' : ''}`}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <span style={{ fontFamily: 'var(--font-label)', fontSize: '11px', color: 'var(--outline)' }}>
                              [{item.type.slice(0, 3).toUpperCase()}]
                            </span>
                            <span style={{ fontWeight: isOwned ? 400 : 700, color: isOwned ? 'inherit' : 'var(--primary)' }}>
                              {item.name}
                            </span>
                          </div>
                          <span style={{
                            fontFamily: 'var(--font-label)',
                            fontSize: '9px',
                            fontWeight: 700,
                            color: isOwned ? 'var(--tertiary)' : 'var(--primary)',
                          }}>
                            {isOwned ? 'OWNED' : 'MISSING'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
