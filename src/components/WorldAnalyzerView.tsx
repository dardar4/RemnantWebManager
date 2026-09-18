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

      <div style={{ padding: '1.75rem 2rem', display: 'flex', flexDirection: 'column', gap: '1.75rem', maxWidth: '1280px', margin: '0 auto', width: '100%' }}>
        {/* Top Header Bar */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-headline)', fontSize: '24px', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--terra-900)' }}>
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

        {/* Top Instruction Containers: Stacked vertically with How to use first */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Box 1: How to use */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '1rem', padding: '1.25rem', border: '1px solid rgba(226, 218, 207, 0.9)', boxShadow: '0 4px 12px -2px rgba(45, 38, 30, 0.05)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.625rem' }}>
                <h3 style={{ fontFamily: 'var(--font-headline)', fontSize: '13px', fontWeight: 700, color: 'var(--terra-900)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  How to use:
                </h3>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--terra-700)', lineHeight: 1.6, marginBottom: '0.75rem' }}>
                Your save files are located in your Windows AppData directory. Upload files named{' '}
                <code style={{ padding: '0.125rem 0.375rem', borderRadius: '0.25rem', backgroundColor: 'var(--terra-100)', color: 'var(--moss-700)', fontFamily: 'var(--font-label)', fontSize: '11px', fontWeight: 600 }}>
                  save_&#123;character number&#125;.sav
                </code>{' '}
                to inspect what events you rolled for this specific character. Additionally you can upload your{' '}
                <code style={{ padding: '0.125rem 0.375rem', borderRadius: '0.25rem', backgroundColor: 'var(--terra-100)', color: 'var(--moss-700)', fontFamily: 'var(--font-label)', fontSize: '11px', fontWeight: 600 }}>
                  profile.sav
                </code>{' '}
                to detect which items you are missing and if your rolled events can reward them. You can drop multiple save files; tables update automatically.
              </p>
            </div>

            {/* Path Helper Strip */}
            <div style={{ marginTop: '0.5rem', paddingTop: '0.75rem', borderTop: '1px solid var(--terra-100)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', backgroundColor: 'rgba(250, 248, 245, 0.7)', padding: '0.625rem', borderRadius: '0.75rem', border: '1px solid rgba(226, 218, 207, 0.5)' }}>
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

          {/* Box 2: Known issues */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '1rem', padding: '1.25rem', border: '1px solid rgba(226, 218, 207, 0.9)', boxShadow: '0 4px 12px -2px rgba(45, 38, 30, 0.05)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.625rem' }}>
                <span style={{ width: '1.5rem', height: '1.5rem', borderRadius: '0.5rem', backgroundColor: 'var(--amber-stone-100)', color: 'var(--amber-stone-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '12px' }}>
                  !
                </span>
                <h3 style={{ fontFamily: 'var(--font-headline)', fontSize: '13px', fontWeight: 700, color: 'var(--terra-900)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Known Issues:
                </h3>
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
            </div>

            <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--terra-100)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '11px', color: 'var(--terra-500)', fontWeight: 500 }}>
              <span className="material-symbols-outlined" style={{ fontSize: '14px', color: 'var(--moss-600)' }}>
                check_circle
              </span>
              <span>Local file parsing only — zero telemetry data sent over external networks.</span>
            </div>
          </div>
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
              <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>
                cloud_upload
              </span>
            </div>
            <h3 style={{ fontFamily: 'var(--font-headline)', fontSize: '16px', fontWeight: 700, color: 'var(--terra-900)', marginBottom: '0.25rem' }}>
              Choose or drop profile or save files
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--terra-500)', marginBottom: '1.25rem', fontWeight: 500 }}>
              Supports <code style={{ fontFamily: 'var(--font-label)', color: 'var(--terra-700)', backgroundColor: 'rgba(226, 218, 207, 0.5)', padding: '0.125rem 0.375rem', borderRadius: '0.25rem' }}>save_0.sav</code>,{' '}
              <code style={{ fontFamily: 'var(--font-label)', color: 'var(--terra-700)', backgroundColor: 'rgba(226, 218, 207, 0.5)', padding: '0.125rem 0.375rem', borderRadius: '0.25rem' }}>save_1.sav</code>,{' '}
              <code style={{ fontFamily: 'var(--font-label)', color: 'var(--terra-700)', backgroundColor: 'rgba(226, 218, 207, 0.5)', padding: '0.125rem 0.375rem', borderRadius: '0.25rem' }}>save_2.sav</code>, and{' '}
              <code style={{ fontFamily: 'var(--font-label)', color: 'var(--terra-700)', backgroundColor: 'rgba(226, 218, 207, 0.5)', padding: '0.125rem 0.375rem', borderRadius: '0.25rem' }}>profile.sav</code>
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <button
                onClick={() => fileInputRef.current?.click()}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.625rem 1.5rem',
                  fontSize: '13px',
                  fontWeight: 600,
                  borderRadius: '0.75rem',
                  color: '#ffffff',
                  backgroundColor: 'var(--moss-600)',
                  border: '1px solid var(--moss-700)',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
                  cursor: 'pointer',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
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
                Current Biome: Earth ({mode === 'campaign' ? 'Campaign' : 'Adventure'} Mode) // {character.archetype}
              </span>
              <span style={{ color: 'var(--terra-400)' }}>•</span>
              <span style={{ color: 'var(--terra-600)', fontFamily: 'var(--font-label)' }}>
                0 Nodes Identified
              </span>
            </div>
            <div style={{ color: 'var(--terra-500)', fontFamily: 'var(--font-label)', fontSize: '11px' }}>
              Filter: Showing All Events
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
                {/* EMPTY TABLE as requested: "for now only do the UI part. the tabel should be empty" */}
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '4.5rem 1.5rem', color: 'var(--terra-500)', fontFamily: 'var(--font-label)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.625rem' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '36px', color: 'var(--terra-400)' }}>
                        table_rows
                      </span>
                      <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--terra-800)' }}>
                        No world data loaded yet
                      </span>
                      <span style={{ fontSize: '12px', color: 'var(--terra-500)', maxWidth: '28rem', lineHeight: 1.5 }}>
                        Upload your <code style={{ backgroundColor: 'var(--terra-100)', color: 'var(--moss-700)', padding: '1px 4px', borderRadius: '3px' }}>save_0.sav</code> or <code style={{ backgroundColor: 'var(--terra-100)', color: 'var(--moss-700)', padding: '1px 4px', borderRadius: '3px' }}>profile.sav</code> using the dropzone above to populate this telemetry matrix.
                      </span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Table Footer Status */}
          <div style={{ padding: '0.75rem 1.5rem', backgroundColor: 'var(--terra-50)', borderTop: '1px solid rgba(226, 218, 207, 0.8)', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', color: 'var(--terra-600)', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '9999px', backgroundColor: 'var(--terra-400)' }} />
              <span style={{ fontWeight: 500 }}>
                Analysis synced to local save state: 0 of 0 world entries rendered.
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontFamily: 'var(--font-label)', fontSize: '11px' }}>
              <span>Save Timestamp: —</span>
              <span style={{ color: 'var(--terra-300)' }}>|</span>
              <span style={{ color: 'var(--moss-700)', fontWeight: 600 }}>Download Raw JSON</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
