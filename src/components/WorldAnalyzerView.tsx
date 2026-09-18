import { useState, useRef } from 'react';
import type { FC } from 'react';
import type { RemnantCharacter } from '../types/remnant';

interface WorldAnalyzerViewProps {
  character: RemnantCharacter;
  characters: RemnantCharacter[];
  activeCharIndex: number;
  onSelectChar: (index: number) => void;
  onUploadFiles: (files: FileList | File[]) => Promise<void>;
  onOpenFolder?: () => Promise<void>;
  onBackToHome: () => void;
}

export const WorldAnalyzerView: FC<WorldAnalyzerViewProps> = ({
  character,
  characters,
  activeCharIndex,
  onSelectChar,
  onUploadFiles,
}) => {
  const [mode, setMode] = useState<'campaign' | 'adventure'>('adventure');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const savePathString = '%LOCALAPPDATA%\\Remnant\\Saved\\SaveGames';
  const displayPathString = 'C:/Users/YOUR_USER_NAME/AppData/Local/Remnant/Saved/SaveGames';

  const handleCopyPath = () => {
    navigator.clipboard.writeText(savePathString);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await onUploadFiles(e.dataTransfer.files);
    }
  };

  const currentEvents = mode === 'campaign' ? (character.campaignEvents || []) : (character.adventureEvents || []);

  const filteredEvents = currentEvents.filter((evt) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      evt.name.toLowerCase().includes(q) ||
      evt.location.toLowerCase().includes(q) ||
      evt.type.toLowerCase().includes(q) ||
      evt.missingItems.some((item) => item.name.toLowerCase().includes(q)) ||
      evt.possibleItems.some((item) => item.name.toLowerCase().includes(q))
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

  const getBiomeDisplay = () => {
    if (mode === 'adventure') {
      if (character.adventureZone) {
        const zoneMap: Record<string, string> = {
          City: 'Earth',
          Wasteland: 'Rhom',
          Swamp: 'Corsus',
          Jungle: 'Yaesha',
          Snow: 'Reisum',
        };
        const zoneName = zoneMap[character.adventureZone] || character.adventureZone;
        return `Current Biome: ${zoneName} (Adventure Mode)`;
      }
      return 'Current Biome: Adventure Mode';
    }
    if (character.campaignEvents && character.campaignEvents.length > 0) {
      return 'Current Biome: Campaign Overworld (Earth / Rhom / Corsus / Yaesha / Reisum)';
    }
    return `Current Biome: Earth (${mode === 'campaign' ? 'Campaign' : 'Adventure'} Mode)`;
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: 'var(--terra-50)', minHeight: '100%', overflowY: 'auto' }}>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".sav"
        style={{ display: 'none' }}
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            onUploadFiles(e.target.files);
          }
        }}
      />

      <div style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
        {/* Top Header Bar */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-headline)', fontSize: '20px', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--terra-900)' }}>
              World Analyzer Telemetry
            </h2>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              onClick={() => fileInputRef.current?.click()}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 0.875rem',
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--terra-700)',
                backgroundColor: 'var(--terra-100)',
                border: '1px solid var(--terra-200)',
                borderRadius: '0.75rem',
                cursor: 'pointer',
                boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
              }}
              title="Refresh and re-read save files"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--terra-600)' }}>
                refresh
              </span>
              <span>Analyze saves</span>
            </button>
          </div>
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
                    How to use & Known Issues
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
                  Save file paths, format requirements, and local parsing details
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
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
                </div>
                <p style={{ fontSize: '12px', color: 'var(--terra-700)', lineHeight: 1.6, marginBottom: '0.75rem' }}>
                  Your save files are located in your Windows AppData directory. Upload files named{' '}
                  <code style={{ padding: '0.125rem 0.375rem', borderRadius: '0.25rem', backgroundColor: 'var(--terra-100)', color: 'var(--moss-700)', fontFamily: 'var(--font-label)', fontSize: '11px', fontWeight: 600 }}>
                    save_&#123;character number&#125;.sav
                  </code>{' '}
                  to inspect what events you rolled for this specific character.
                </p>

                {/* Path Helper Strip */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', backgroundColor: 'rgba(250, 248, 245, 0.7)', padding: '0.625rem', borderRadius: '0.75rem', border: '1px solid rgba(226, 218, 207, 0.5)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflow: 'hidden', color: 'var(--terra-600)' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--terra-500)', flexShrink: 0 }}>
                      folder
                    </span>
                    <span style={{ fontFamily: 'var(--font-label)', fontSize: '11px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--terra-800)', fontWeight: 500 }}>
                      {displayPathString}
                    </span>
                  </div>
                  <button
                    onClick={handleCopyPath}
                    style={{
                      flexShrink: 0,
                      padding: '0.25rem 0.625rem',
                      fontSize: '11px',
                      fontWeight: 500,
                      fontFamily: 'var(--font-label)',
                      color: 'var(--moss-700)',
                      backgroundColor: '#ffffff',
                      border: '1px solid var(--terra-300)',
                      borderRadius: '0.5rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>
                      content_copy
                    </span>
                    <span>{isCopied ? 'Copied!' : 'Copy Path'}</span>
                  </button>
                </div>
              </div>

              {/* Sub-section 2: Known Issues */}
              <div style={{ borderTop: '1px solid var(--terra-100)', paddingTop: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.625rem' }}>
                  <span style={{ width: '1.25rem', height: '1.25rem', borderRadius: '0.375rem', backgroundColor: 'var(--amber-stone-100)', color: 'var(--amber-stone-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '11px' }}>
                    !
                  </span>
                  <h4 style={{ fontFamily: 'var(--font-headline)', fontSize: '12px', fontWeight: 700, color: 'var(--terra-900)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Known Issues:
                  </h4>
                </div>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.625rem', fontSize: '12px', color: 'var(--terra-700)' }}>
                  <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '9999px', backgroundColor: '#d97706', marginTop: '6px', flexShrink: 0 }} />
                    <span>
                      <strong>Ad blockers</strong> or strict web filters can interfere with client-side file reading hooks.
                    </span>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '9999px', backgroundColor: 'var(--rust-stone-700)', marginTop: '6px', flexShrink: 0 }} />
                    <span>
                      <strong>Red Crystal Requirement:</strong> You must interact with the red World Stone in-game to trigger save flush before telemetry can parse new rolls.
                    </span>
                  </li>
                </ul>

                <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--terra-100)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '11px', color: 'var(--terra-500)', fontWeight: 500 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '14px', color: 'var(--moss-600)' }}>
                    check_circle
                  </span>
                  <span>Local file parsing only — zero telemetry data sent over external networks.</span>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* File Dropzone Card */}
        <section
          className={`wa-dropzone ${isDragOver ? 'drag-active' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div style={{ maxWidth: '28rem', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div className="wa-dropzone-icon">
              <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>
                cloud_upload
              </span>
            </div>
            <h3 style={{ fontFamily: 'var(--font-headline)', fontSize: '15px', fontWeight: 700, color: 'var(--terra-900)', marginBottom: '0.25rem' }}>
              Choose or drop save files
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--terra-500)', marginBottom: '0.875rem', fontWeight: 500 }}>
              Supports <code style={{ fontFamily: 'var(--font-label)', color: 'var(--terra-700)', backgroundColor: 'rgba(226, 218, 207, 0.5)', padding: '0.125rem 0.375rem', borderRadius: '0.25rem' }}>save_0.sav</code>,{' '}
              <code style={{ fontFamily: 'var(--font-label)', color: 'var(--terra-700)', backgroundColor: 'rgba(226, 218, 207, 0.5)', padding: '0.125rem 0.375rem', borderRadius: '0.25rem' }}>save_1.sav</code>, or{' '}
              <code style={{ fontFamily: 'var(--font-label)', color: 'var(--terra-700)', backgroundColor: 'rgba(226, 218, 207, 0.5)', padding: '0.125rem 0.375rem', borderRadius: '0.25rem' }}>save_2.sav</code>
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <button
                onClick={() => fileInputRef.current?.click()}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1.25rem',
                  fontSize: '12px',
                  fontWeight: 600,
                  borderRadius: '0.625rem',
                  color: '#ffffff',
                  backgroundColor: 'var(--moss-600)',
                  border: '1px solid var(--moss-700)',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
                  cursor: 'pointer',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                  upload_file
                </span>
                <span>Upload File</span>
              </button>
            </div>
          </div>
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
                onChange={(e) => onSelectChar(Number(e.target.value))}
                style={{
                  width: '100%',
                  appearance: 'none',
                  borderRadius: '0.75rem',
                  backgroundColor: '#ffffff',
                  border: '1px solid var(--terra-300)',
                  padding: '0.625rem 2.25rem 0.625rem 1rem',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: 'var(--terra-900)',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                  cursor: 'pointer',
                  outline: 'none',
                }}
              >
                {characters.map((c, i) => (
                  <option key={c.id} value={i}>
                    Character {i + 1} ({c.archetype} // {c.inventory.length} items)
                  </option>
                ))}
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
            <div style={{ position: 'relative', width: '20rem', maxWidth: '100%' }}>
              <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, paddingLeft: '0.75rem', display: 'flex', alignItems: 'center', pointerEvents: 'none', color: 'var(--terra-400)' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                  search
                </span>
              </div>
              <input
                type="text"
                placeholder="Search location, event, item..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  paddingLeft: '2.25rem',
                  paddingRight: '1rem',
                  paddingTop: '0.5rem',
                  paddingBottom: '0.5rem',
                  fontSize: '12px',
                  backgroundColor: '#ffffff',
                  border: '1px solid var(--terra-300)',
                  borderRadius: '0.75rem',
                  color: 'var(--terra-900)',
                  outline: 'none',
                  fontWeight: 500,
                  boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                }}
              />
            </div>
          </div>
        </section>

        {/* World Roll Table Section: Empty Table (as requested for now) */}
        <section className="wa-table-container">
          {/* Subheader status indicator */}
          <div style={{ padding: '0.75rem 1.5rem', backgroundColor: '#FAF8F5', borderBottom: '1px solid rgba(226, 218, 207, 0.8)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontWeight: 700, color: 'var(--terra-900)' }}>
                {getBiomeDisplay()} // {character.archetype}
              </span>
              <span style={{ color: 'var(--terra-400)' }}>•</span>
              <span style={{ color: 'var(--terra-600)', fontFamily: 'var(--font-label)' }}>
                {filteredEvents.length} Nodes Identified
              </span>
            </div>
            <div style={{ color: 'var(--terra-500)', fontFamily: 'var(--font-label)', fontSize: '11px' }}>
              {searchQuery ? `Filter: "${searchQuery}"` : 'Filter: Showing All Events'}
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
              <thead>
                <tr className="wa-table-header">
                  <th style={{ width: '25%' }} scope="col">Location</th>
                  <th style={{ width: '18%' }} scope="col">Event Type</th>
                  <th style={{ width: '22%' }} scope="col">Event Name</th>
                  <th style={{ width: '35%' }} scope="col">Missing Items</th>
                </tr>
              </thead>
              <tbody style={{ fontSize: '12px', color: 'var(--terra-800)' }}>
                {currentEvents.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: '2.5rem 1.25rem', color: 'var(--terra-500)', fontFamily: 'var(--font-label)' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '28px', color: 'var(--terra-400)' }}>
                          {mode === 'adventure' ? 'explore_off' : 'table_rows'}
                        </span>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--terra-800)' }}>
                          {mode === 'adventure'
                            ? 'No Adventure Mode roll detected in this save'
                            : 'No world data loaded yet'}
                        </span>
                        <span style={{ fontSize: '12px', color: 'var(--terra-500)', maxWidth: '28rem', lineHeight: 1.5 }}>
                          {mode === 'adventure'
                            ? 'Roll an Adventure at the World Stone in-game to parse Adventure telemetry, or switch to Campaign mode above.'
                            : 'Upload your save_0.sav using the dropzone above to populate this telemetry matrix.'}
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : filteredEvents.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: '2.5rem 1.25rem', color: 'var(--terra-500)', fontFamily: 'var(--font-label)' }}>
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
                    const zoneTag = locParts[0];
                    const subLoc = locParts.slice(1).join(': ');

                    return (
                      <tr
                        key={`${evt.key}-${idx}`}
                        style={{
                          borderBottom: '1px solid rgba(226, 218, 207, 0.6)',
                          backgroundColor: idx % 2 === 0 ? '#ffffff' : 'rgba(250, 248, 245, 0.5)',
                          transition: 'background-color 0.1s ease',
                        }}
                      >
                        {/* Location */}
                        <td style={{ padding: '0.75rem 1rem', verticalAlign: 'middle' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span
                              style={{
                                fontSize: '10px',
                                fontFamily: 'var(--font-label)',
                                fontWeight: 700,
                                padding: '0.125rem 0.4rem',
                                borderRadius: '0.25rem',
                                backgroundColor: 'var(--terra-200)',
                                color: 'var(--terra-800)',
                                flexShrink: 0,
                              }}
                            >
                              {zoneTag}
                            </span>
                            <span style={{ fontWeight: 600, color: 'var(--terra-800)', fontSize: '12px' }}>
                              {subLoc || zoneTag}
                            </span>
                          </div>
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
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                              {evt.missingItems.map((item, itemIdx) => (
                                <span
                                  key={itemIdx}
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    padding: '0.15rem 0.5rem',
                                    borderRadius: '0.375rem',
                                    fontSize: '11px',
                                    fontWeight: 600,
                                    fontFamily: 'var(--font-label)',
                                    backgroundColor: 'var(--terra-100)',
                                    color: 'var(--terra-800)',
                                    border: '1px solid var(--terra-200)',
                                  }}
                                >
                                  {item.name}
                                </span>
                              ))}
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
