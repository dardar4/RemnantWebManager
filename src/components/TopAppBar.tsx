import type { FC } from 'react';

interface TopAppBarProps {
  isLiveSave: boolean;
  saveName: string;
  onOpenSaveFile: () => void;
  onOpenSettings?: () => void;
}

export const TopAppBar: FC<TopAppBarProps> = ({
  isLiveSave,
  saveName,
  onOpenSaveFile,
  onOpenSettings,
}) => {
  return (
    <header className="top-bar">
      {/* Brand Anchor */}
      <div className="brand-anchor">
        <div className="brand-icon-box">
          <span className="material-symbols-outlined" style={{ color: 'var(--primary)', fontSize: '20px' }}>
            terminal
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="brand-title-row">
            <span className="brand-title">REMNANT MANAGER</span>
            <span className="brand-version-badge">v2.4.0-REL</span>
          </div>
          <span className="brand-subtitle">
            TACTICAL COMPANION // WORLD ANALYZER &amp; CHECKLIST
          </span>
        </div>
      </div>

      {/* Top Right Utilities / Save Status Pill */}
      <div className="top-utilities">
        <div
          className="sync-pill"
          onClick={onOpenSaveFile}
          title="Click to load Remnant save file (profile.sav / save_0.sav)"
        >
          <span className={`sync-dot ${isLiveSave ? 'live' : 'pulse'}`} />
          <span className="sync-text">
            {saveName} [{isLiveSave ? 'SYNCD' : 'DEMO'}]
          </span>
          <span style={{ color: 'var(--outline)', fontSize: '10px', marginLeft: '2px' }}>|</span>
          <span className="material-symbols-outlined" style={{ fontSize: '14px', color: 'var(--outline)' }}>
            folder_open
          </span>
        </div>

        {/* Utility / Config Action Buttons */}
        <div className="utility-actions">
          <button
            className="icon-btn"
            title="Load Save File"
            onClick={onOpenSaveFile}
          >
            <span className="material-symbols-outlined">file_upload</span>
          </button>
          <button
            className="icon-btn"
            title="Telemetry Tuning"
            onClick={onOpenSettings}
          >
            <span className="material-symbols-outlined">tune</span>
          </button>
          <button
            className="icon-btn"
            title="Settings & Info"
            onClick={onOpenSettings}
          >
            <span className="material-symbols-outlined">settings</span>
          </button>
        </div>
      </div>
    </header>
  );
};
