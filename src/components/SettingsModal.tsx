import type { FC } from 'react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPickFiles: () => void;
  onPickFolder: () => void;
  onResetDemo: () => void;
  isLiveSave: boolean;
  saveName: string;
}

export const SettingsModal: FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onPickFiles,
  onPickFolder,
  onResetDemo,
  isLiveSave,
  saveName,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-window" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--outline-variant)', paddingBottom: '0.5rem' }}>
          <div style={{ fontFamily: 'var(--font-headline)', fontSize: '15px', fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.04em' }}>
            TELEMETRY &amp; SAVE CONFIGURATION
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--outline)', fontSize: '16px' }}
          >
            ✕
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '13px' }}>
          <div style={{ padding: '0.75rem', background: 'var(--surface-container-low)', border: '1px solid var(--outline-variant)' }}>
            <div style={{ fontFamily: 'var(--font-label)', fontSize: '11px', color: 'var(--outline)', marginBottom: '0.25rem' }}>
              ACTIVE DATA STREAM
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className={`sync-dot ${isLiveSave ? 'live' : 'pulse'}`} />
              <span style={{ fontWeight: 600 }}>{saveName}</span>
              <span style={{ fontFamily: 'var(--font-label)', fontSize: '10px', color: isLiveSave ? 'var(--tertiary)' : 'var(--secondary)' }}>
                [{isLiveSave ? 'LIVE PERSISTENT SAVE' : 'DEMO SAMPLE DATA'}]
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <span style={{ fontFamily: 'var(--font-label)', fontSize: '11px', color: 'var(--outline)' }}>
              LOAD SAVE FILE:
            </span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => {
                  onClose();
                  onPickFolder();
                }}
                style={{
                  flex: 1,
                  padding: '8px',
                  fontFamily: 'var(--font-label)',
                  fontSize: '11px',
                  fontWeight: 600,
                  background: 'var(--surface-container-high)',
                  border: '1px solid var(--outline-variant)',
                  color: 'var(--on-surface)',
                  cursor: 'pointer',
                }}
              >
                📁 SELECT SAVE DIRECTORY
              </button>
              <button
                onClick={() => {
                  onClose();
                  onPickFiles();
                }}
                style={{
                  flex: 1,
                  padding: '8px',
                  fontFamily: 'var(--font-label)',
                  fontSize: '11px',
                  fontWeight: 600,
                  background: 'var(--primary)',
                  border: '1px solid var(--primary-container)',
                  color: '#ffffff',
                  cursor: 'pointer',
                }}
              >
                📄 PICK .SAV FILES
              </button>
            </div>
          </div>

          <div style={{ fontFamily: 'var(--font-label)', fontSize: '10px', color: 'var(--outline)', padding: '0.5rem', background: 'var(--surface-container-low)', border: '1px dashed var(--outline-variant)' }}>
            <div>DEFAULT SAVE PATH:</div>
            <code style={{ color: 'var(--secondary)', wordBreak: 'break-all' }}>
              %LOCALAPPDATA%\Remnant\Saved\SaveGames
            </code>
            <div style={{ marginTop: '4px' }}>
              Select <strong>profile.sav</strong> for character progression, and <strong>save_0.sav</strong> for world rolls.
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
            <button
              onClick={() => {
                onResetDemo();
                onClose();
              }}
              style={{
                padding: '6px 12px',
                fontFamily: 'var(--font-label)',
                fontSize: '11px',
                background: 'transparent',
                border: '1px solid var(--outline-variant)',
                color: 'var(--outline)',
                cursor: 'pointer',
              }}
            >
              Reset to Demo Data
            </button>
            <button
              onClick={onClose}
              style={{
                padding: '6px 12px',
                fontFamily: 'var(--font-label)',
                fontSize: '11px',
                background: 'var(--surface-container-highest)',
                border: '1px solid var(--outline-variant)',
                color: 'var(--on-surface)',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
