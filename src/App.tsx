import React, { useState, useEffect, useMemo, useRef } from 'react';
import type { RemnantCharacter, ItemType } from './types/remnant';
import { parseProfileSav, parseWorldSave, gameData } from './utils/saveParser';
import { getSampleCharacter } from './utils/demoData';

const LOCAL_STORAGE_KEY = 'remnant_web_characters_v1';
const LOCAL_STORAGE_ACTIVE_KEY = 'remnant_web_active_char_v1';
const LOCAL_STORAGE_LIVE_KEY = 'remnant_web_is_live_v1';

export function App() {
  const [characters, setCharacters] = useState<RemnantCharacter[]>([]);
  const [activeCharIndex, setActiveCharIndex] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'campaign' | 'adventure' | 'missing' | 'all-items'>('campaign');
  const [selectedZone, setSelectedZone] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [onlyMissing, setOnlyMissing] = useState<boolean>(false);
  const [itemTypeFilter, setItemTypeFilter] = useState<string>('all');
  const [isLiveSave, setIsLiveSave] = useState<boolean>(false);
  const [saveSourceText, setSaveSourceText] = useState<string>('Demo Hunter Save');
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize from LocalStorage or Load Demo Data
  useEffect(() => {
    try {
      const savedChars = localStorage.getItem(LOCAL_STORAGE_KEY);
      const savedActive = localStorage.getItem(LOCAL_STORAGE_ACTIVE_KEY);
      const savedIsLive = localStorage.getItem(LOCAL_STORAGE_LIVE_KEY);

      if (savedChars) {
        const parsed = JSON.parse(savedChars) as RemnantCharacter[];
        if (parsed.length > 0) {
          setCharacters(parsed);
          setActiveCharIndex(savedActive ? Math.min(Number(savedActive), parsed.length - 1) : 0);
          setIsLiveSave(savedIsLive === 'true');
          setSaveSourceText(savedIsLive === 'true' ? 'Loaded from Local Storage' : 'Demo Hunter Save');
          return;
        }
      }
    } catch {
      // ignore parsing error, fallback to demo
    }

    // Default to demo character
    const demo = [getSampleCharacter()];
    setCharacters(demo);
    setActiveCharIndex(0);
    setIsLiveSave(false);
  }, []);

  // Save to LocalStorage whenever characters or activeCharIndex changes
  useEffect(() => {
    if (characters.length > 0) {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(characters));
        localStorage.setItem(LOCAL_STORAGE_ACTIVE_KEY, activeCharIndex.toString());
        localStorage.setItem(LOCAL_STORAGE_LIVE_KEY, isLiveSave.toString());
      } catch (err) {
        console.warn('Could not save state to localStorage:', err);
      }
    }
  }, [characters, activeCharIndex, isLiveSave]);

  const activeCharacter = characters[activeCharIndex] || characters[0];

  const handleResetToDemo = () => {
    const demo = [getSampleCharacter()];
    setCharacters(demo);
    setActiveCharIndex(0);
    setIsLiveSave(false);
    setSaveSourceText('Demo Hunter Save');
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    localStorage.removeItem(LOCAL_STORAGE_ACTIVE_KEY);
    localStorage.removeItem(LOCAL_STORAGE_LIVE_KEY);
  };

  // Process files (profile.sav and save_*.sav)
  const processFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    let profileFile = fileArray.find(f => f.name.toLowerCase() === 'profile.sav');
    const worldFiles = fileArray.filter(f => f.name.toLowerCase().startsWith('save_') && f.name.toLowerCase().endsWith('.sav'));

    // Sort world files so save_0 is first, save_1 is second, etc.
    worldFiles.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));

    if (!profileFile && worldFiles.length === 0) {
      alert('Please select or drop "profile.sav" and/or "save_0.sav" from your Remnant save folder.');
      return;
    }

    const readFileText = (file: File): Promise<string> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string) || '');
        reader.onerror = () => reject(reader.error);
        // Using ISO-8859-1 (latin1) to preserve all binary bytes as 1:1 characters for regex matching
        reader.readAsText(file, 'ISO-8859-1');
      });
    };

    try {
      let currentChars = [...characters];

      if (profileFile) {
        const profileText = await readFileText(profileFile);
        currentChars = parseProfileSav(profileText);
      }

      if (currentChars.length === 0) {
        currentChars = [getSampleCharacter()];
      }

      // Process world saves for each character
      for (let i = 0; i < worldFiles.length && i < currentChars.length; i++) {
        const worldText = await readFileText(worldFiles[i]);
        const worldResult = parseWorldSave(worldText, currentChars[i]);
        currentChars[i].campaignEvents = worldResult.campaignEvents;
        currentChars[i].adventureEvents = worldResult.adventureEvents;
        currentChars[i].hasAdventureData = worldResult.hasAdventureData;
      }

      setCharacters(currentChars);
      setActiveCharIndex(0);
      setIsLiveSave(true);
      setSaveSourceText(`Loaded ${fileArray.length} file(s) (${fileArray.map(f => f.name).join(', ')})`);
    } catch (err) {
      console.error('Error parsing Remnant save file:', err);
      alert('Error reading save files. Ensure you selected valid Remnant: From the Ashes .sav files.');
    }
  };

  // Open directory picker (File System Access API)
  const handleOpenFolder = async () => {
    try {
      // @ts-expect-error - showDirectoryPicker is supported in Chromium browsers
      if (window.showDirectoryPicker) {
        // @ts-expect-error - showDirectoryPicker
        const dirHandle = await window.showDirectoryPicker();
        const files: File[] = [];

        for await (const entry of (dirHandle as any).values()) {
          if (entry.kind === 'file') {
            const name = entry.name.toLowerCase();
            if (name === 'profile.sav' || (name.startsWith('save_') && name.endsWith('.sav'))) {
              const file = await entry.getFile();
              files.push(file);
            }
          }
        }

        if (files.length > 0) {
          await processFiles(files);
        } else {
          alert('No Remnant save files (profile.sav or save_*.sav) found in the selected folder.');
        }
      } else {
        fileInputRef.current?.click();
      }
    } catch (err: unknown) {
      if ((err as Error).name !== 'AbortError') {
        console.warn('Directory picker fallback to file input:', err);
        fileInputRef.current?.click();
      }
    }
  };

  // Drag and Drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await processFiles(e.dataTransfer.files);
    }
  };

  // Filtered Events
  const currentEvents = useMemo(() => {
    if (!activeCharacter) return [];
    const sourceList = activeTab === 'adventure' ? activeCharacter.adventureEvents : activeCharacter.campaignEvents;

    return sourceList.filter(evt => {
      // Zone filter
      if (selectedZone !== 'all') {
        if (!evt.location.toLowerCase().includes(selectedZone.toLowerCase())) {
          return false;
        }
      }

      // Missing loot only filter
      if (onlyMissing && evt.missingItems.length === 0) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = evt.name.toLowerCase().includes(q);
        const matchLoc = evt.location.toLowerCase().includes(q);
        const matchType = evt.type.toLowerCase().includes(q);
        const matchLoot = evt.possibleItems.some(i => i.name.toLowerCase().includes(q));
        if (!matchName && !matchLoc && !matchType && !matchLoot) return false;
      }

      return true;
    });
  }, [activeCharacter, activeTab, selectedZone, onlyMissing, searchQuery]);

  // Filtered Missing Items Checklist
  const filteredMissingItems = useMemo(() => {
    if (!activeCharacter) return [];
    return activeCharacter.missingItems.filter(item => {
      if (itemTypeFilter !== 'all' && item.type !== itemTypeFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = item.name.toLowerCase().includes(q);
        const matchNotes = (item.notes || '').toLowerCase().includes(q);
        const matchEvent = (item.eventName || '').toLowerCase().includes(q);
        if (!matchName && !matchNotes && !matchEvent) return false;
      }
      return true;
    });
  }, [activeCharacter, itemTypeFilter, searchQuery]);

  // All Items in Game
  const filteredAllGameItems = useMemo(() => {
    const inventorySet = new Set(activeCharacter?.inventory || []);
    return gameData.allItems.filter(item => {
      if (itemTypeFilter !== 'all' && item.type !== itemTypeFilter) {
        return false;
      }
      if (onlyMissing && inventorySet.has(item.key)) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = item.name.toLowerCase().includes(q);
        const matchNotes = (item.notes || '').toLowerCase().includes(q);
        const matchEvent = (item.eventName || '').toLowerCase().includes(q);
        if (!matchName && !matchNotes && !matchEvent) return false;
      }
      return true;
    });
  }, [activeCharacter, itemTypeFilter, onlyMissing, searchQuery]);

  const totalGameItems = gameData.allItems.length;

  const getTypeBadgeClass = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes('world boss')) return 'event-type-badge type-boss';
    if (t.includes('miniboss')) return 'event-type-badge type-miniboss';
    if (t.includes('dungeon')) return 'event-type-badge type-dungeon';
    if (t.includes('drop') || t.includes('beetle')) return 'event-type-badge type-drop';
    return 'event-type-badge type-poi';
  };

  const getItemTypeIcon = (type: ItemType) => {
    switch (type) {
      case 'Weapon': return '⚔️';
      case 'Armor': return '🛡️';
      case 'Trinket': return '💍';
      case 'Mod': return '⚡';
      case 'Trait': return '🧬';
      case 'Emote': return '🎭';
      default: return '📦';
    }
  };

  return (
    <div className="app-container">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".sav"
        style={{ display: 'none' }}
        onChange={(e) => {
          if (e.target.files) processFiles(e.target.files);
        }}
      />

      {/* Top Header */}
      <header className="app-header">
        <div className="brand-section">
          <div className="brand-icon">🔥</div>
          <div className="brand-text">
            <h1>
              REMNANT
              <span style={{ fontSize: '1rem', color: 'var(--ember-primary)', fontWeight: 400 }}>
                World & Save Manager
              </span>
              <span className="version-tag">DATA v{gameData.version}</span>
            </h1>
            <p>Procedural World Roll Analyzer & Inventory Checklist</p>
          </div>
        </div>

        <div className="header-actions">
          <button className="btn btn-primary" onClick={handleOpenFolder} title="Select Remnant save folder or files">
            📂 Open Save Folder
          </button>
          <button className="btn btn-secondary" onClick={() => fileInputRef.current?.click()} title="Pick profile.sav / save_0.sav">
            📄 Upload .sav Files
          </button>
          {isLiveSave ? (
            <button className="btn btn-secondary" onClick={handleResetToDemo} title="Switch back to demo data">
              🔄 Switch to Demo
            </button>
          ) : (
            <button className="btn btn-cyan" onClick={handleResetToDemo} title="Load sample character">
              ✨ Reload Demo Data
            </button>
          )}
        </div>
      </header>

      {/* Save Source & Drag-and-Drop Zone */}
      <div
        className={`save-strip ${isDragging ? 'drag-over' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="save-info">
          <span className={`save-status-pill ${isLiveSave ? 'status-live' : 'status-demo'}`}>
            {isLiveSave ? '● LIVE SAVE' : '○ DEMO MODE'}
          </span>
          <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{saveSourceText}</span>
          <span className="save-path-hint">
            (Default Path: %LOCALAPPDATA%\Remnant\Saved\SaveGames)
          </span>
        </div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          Tip: Drag & drop <code>profile.sav</code> & <code>save_0.sav</code> anywhere to analyze!
        </div>
      </div>

      {/* Character Selector Strip */}
      <div className="characters-section">
        {characters.map((char, index) => {
          const charOwned = char.inventory.length;
          const charPercent = Math.min(100, Math.round((charOwned / totalGameItems) * 100));
          const isActive = index === activeCharIndex;

          return (
            <div
              key={char.id}
              className={`character-card ${isActive ? 'active' : ''}`}
              onClick={() => setActiveCharIndex(index)}
            >
              <div className="character-header">
                <span className="character-archetype">{char.archetype}</span>
                <span className="char-badge">Character #{index + 1}</span>
              </div>
              <div className="progress-text">
                <span>Progression</span>
                <span>{charOwned} / {totalGameItems} ({charPercent}%)</span>
              </div>
              <div className="progress-bar-container">
                <div className="progress-bar-fill" style={{ width: `${charPercent}%` }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Navigation Tabs */}
      <nav className="nav-tabs">
        <button
          className={`tab-btn ${activeTab === 'campaign' ? 'active' : ''}`}
          onClick={() => setActiveTab('campaign')}
        >
          🗺️ Campaign World ({activeCharacter?.campaignEvents.length || 0} Events)
        </button>
        <button
          className={`tab-btn ${activeTab === 'adventure' ? 'active' : ''}`}
          onClick={() => setActiveTab('adventure')}
          disabled={!activeCharacter?.hasAdventureData && (activeCharacter?.adventureEvents.length || 0) === 0}
        >
          ⚔️ Adventure Mode ({activeCharacter?.adventureEvents.length || 0} Events)
          {!activeCharacter?.hasAdventureData && (activeCharacter?.adventureEvents.length || 0) === 0 && ' (None)'}
        </button>
        <button
          className={`tab-btn ${activeTab === 'missing' ? 'active' : ''}`}
          onClick={() => setActiveTab('missing')}
        >
          📋 Missing Items Checklist ({activeCharacter?.missingItems.length || 0})
        </button>
        <button
          className={`tab-btn ${activeTab === 'all-items' ? 'active' : ''}`}
          onClick={() => setActiveTab('all-items')}
        >
          📖 Full Game Database ({gameData.allItems.length} Items)
        </button>
      </nav>

      {/* Filter and Search Bar */}
      <div className="filter-bar">
        <div className="search-input-group">
          <span>🔍</span>
          <input
            type="text"
            placeholder={
              activeTab === 'campaign' || activeTab === 'adventure'
                ? 'Search rolled events, bosses, loot, locations...'
                : 'Search items, traits, weapons, sources...'
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              onClick={() => setSearchQuery('')}
            >
              ✕
            </button>
          )}
        </div>

        {/* Zone chips for Campaign / Adventure */}
        {(activeTab === 'campaign' || activeTab === 'adventure') && (
          <div className="zone-chips">
            <button
              className={`chip ${selectedZone === 'all' ? 'active' : ''}`}
              onClick={() => setSelectedZone('all')}
            >
              All Zones
            </button>
            {Object.keys(gameData.zones).map((zoneKey) => (
              <button
                key={zoneKey}
                className={`chip ${selectedZone === zoneKey ? 'active' : ''}`}
                onClick={() => setSelectedZone(zoneKey)}
              >
                {zoneKey}
              </button>
            ))}
          </div>
        )}

        {/* Item Type filter for Checklist & Database */}
        {(activeTab === 'missing' || activeTab === 'all-items') && (
          <div className="zone-chips">
            {['all', 'Weapon', 'Armor', 'Trinket', 'Mod', 'Trait', 'Emote'].map((type) => (
              <button
                key={type}
                className={`chip ${itemTypeFilter === type ? 'active' : ''}`}
                onClick={() => setItemTypeFilter(type)}
              >
                {type === 'all' ? 'All Types' : type}
              </button>
            ))}
          </div>
        )}

        {/* Only Missing Toggle */}
        <label className="toggle-label">
          <input
            type="checkbox"
            checked={onlyMissing}
            onChange={(e) => setOnlyMissing(e.target.checked)}
          />
          Only with Missing Items
        </label>
      </div>

      {/* Main Content Area */}
      <main>
        {/* VIEW 1 & 2: WORLD EVENTS (Campaign or Adventure) */}
        {(activeTab === 'campaign' || activeTab === 'adventure') && (
          <div>
            {currentEvents.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🧭</div>
                <h3 className="empty-title">
                  {activeTab === 'adventure' && (!activeCharacter?.hasAdventureData || activeCharacter.adventureEvents.length === 0)
                    ? 'No Adventure Mode Rolled'
                    : 'No Events Match Current Filters'}
                </h3>
                <p className="empty-desc">
                  {activeTab === 'adventure' && (!activeCharacter?.hasAdventureData || activeCharacter.adventureEvents.length === 0)
                    ? 'You have not rolled an Adventure mode on this character yet, or no save_*.sav file was found.'
                    : 'Try clearing your search query or selecting "All Zones".'}
                </p>
              </div>
            ) : (
              <div className="events-grid">
                {currentEvents.map((evt, idx) => {
                  const hasMissingLoot = evt.missingItems.length > 0;
                  return (
                    <div key={`${evt.key}-${idx}`} className={`event-card ${hasMissingLoot ? 'has-missing' : ''}`}>
                      <div className="event-card-header">
                        <div>
                          <h3 className="event-title">{evt.name}</h3>
                          <div className="event-location">
                            <span>📍</span>
                            <span>{evt.location}</span>
                          </div>
                        </div>
                        <span className={getTypeBadgeClass(evt.type)}>{evt.type}</span>
                      </div>

                      {/* Loot section */}
                      <div className="loot-section">
                        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                          POTENTIAL LOOT ({evt.possibleItems.length}):
                        </div>

                        {evt.possibleItems.length === 0 ? (
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            No specific item drops logged.
                          </div>
                        ) : (
                          evt.possibleItems.map((item, itemIdx) => {
                            const isOwned = activeCharacter.inventory.includes(item.key);
                            return (
                              <div key={`${item.key}-${itemIdx}`} className={`loot-item ${isOwned ? 'owned' : 'missing'}`}>
                                <div className="loot-name-group">
                                  <span className="loot-type-icon">{getItemTypeIcon(item.type)}</span>
                                  <span style={{ fontWeight: isOwned ? 400 : 600 }}>{item.name}</span>
                                  {item.dlc && (
                                    <span style={{ fontSize: '0.65rem', background: 'rgba(168, 85, 247, 0.2)', color: '#c084fc', padding: '1px 5px', borderRadius: '4px' }}>
                                      {item.dlc}
                                    </span>
                                  )}
                                </div>
                                <div>
                                  {isOwned ? (
                                    <span className="loot-badge-owned">✓ OWNED</span>
                                  ) : (
                                    <span className="loot-badge-missing">★ MISSING</span>
                                  )}
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* VIEW 3: MISSING ITEMS CHECKLIST */}
        {activeTab === 'missing' && (
          <div className="table-card">
            <table className="items-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Item Name</th>
                  <th>Source / Rolled Event</th>
                  <th>DLC</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {filteredMissingItems.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                      🎉 No missing items found matching the selected filter!
                    </td>
                  </tr>
                ) : (
                  filteredMissingItems.map((item, idx) => (
                    <tr key={`${item.key}-${idx}`}>
                      <td style={{ width: '120px' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                          {getItemTypeIcon(item.type)} {item.type}
                        </span>
                      </td>
                      <td style={{ fontWeight: 600, color: '#ffffff' }}>
                        {item.name}
                      </td>
                      <td style={{ color: 'var(--crystal-cyan)' }}>
                        {item.eventName ? gameData.events[item.eventName] || item.eventName : 'Uncategorized / World Drop'}
                      </td>
                      <td>
                        {item.dlc ? (
                          <span style={{ fontSize: '0.75rem', background: 'rgba(168, 85, 247, 0.2)', color: '#c084fc', padding: '2px 6px', borderRadius: '4px' }}>
                            {item.dlc}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Base Game</span>
                        )}
                      </td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                        {item.notes || '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* VIEW 4: FULL GAME DATABASE */}
        {activeTab === 'all-items' && (
          <div className="table-card">
            <table className="items-table">
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Type</th>
                  <th>Item Name</th>
                  <th>Source Event</th>
                  <th>DLC / Mode</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {filteredAllGameItems.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                      No items matched your query.
                    </td>
                  </tr>
                ) : (
                  filteredAllGameItems.map((item, idx) => {
                    const isOwned = activeCharacter.inventory.includes(item.key);
                    return (
                      <tr key={`${item.key}-${idx}`}>
                        <td style={{ width: '110px' }}>
                          {isOwned ? (
                            <span className="loot-badge-owned">✓ OWNED</span>
                          ) : (
                            <span className="loot-badge-missing">★ MISSING</span>
                          )}
                        </td>
                        <td style={{ width: '120px' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                            {getItemTypeIcon(item.type)} {item.type}
                          </span>
                        </td>
                        <td style={{ fontWeight: 600, color: '#ffffff' }}>
                          {item.name}
                        </td>
                        <td style={{ color: 'var(--crystal-cyan)' }}>
                          {item.eventName ? gameData.events[item.eventName] || item.eventName : 'Uncategorized'}
                        </td>
                        <td>
                          {item.dlc ? (
                            <span style={{ fontSize: '0.75rem', background: 'rgba(168, 85, 247, 0.2)', color: '#c084fc', padding: '2px 6px', borderRadius: '4px' }}>
                              {item.dlc}
                            </span>
                          ) : item.mode !== 'normal' ? (
                            <span style={{ fontSize: '0.75rem', background: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24', padding: '2px 6px', borderRadius: '4px' }}>
                              {item.mode.toUpperCase()}
                            </span>
                          ) : (
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Base Game</span>
                          )}
                        </td>
                        <td style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                          {item.notes || '—'}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
