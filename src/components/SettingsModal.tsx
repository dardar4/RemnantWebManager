import { useState, useEffect } from 'react';
import type { FC } from 'react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  saveDirectoryPath: string;
  linkedFolderName?: string | null;
  onSaveDirectoryChange: (newPath: string) => Promise<boolean>;
  onPickFolder: () => Promise<void>;
  onPickFiles?: () => void;
  onResetAllData: () => Promise<void>;
}

export const SettingsModal: FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  saveDirectoryPath,
  linkedFolderName,
  onSaveDirectoryChange,
  onPickFolder,
  onPickFiles,
  onResetAllData,
}) => {
  const [inputPath, setInputPath] = useState<string>(saveDirectoryPath);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);
  const [isResetting, setIsResetting] = useState<boolean>(false);

  const defaultPath = '%LOCALAPPDATA%\\Remnant\\Saved\\SaveGames';

  useEffect(() => {
    setInputPath(saveDirectoryPath);
  }, [saveDirectoryPath]);

  if (!isOpen) return null;

  const handleApplyPath = async () => {
    setIsSaving(true);
    setSaveStatus(null);
    try {
      const success = await onSaveDirectoryChange(inputPath);
      if (success) {
        setSaveStatus('Path validated and save files loaded successfully!');
      } else {
        setSaveStatus('Path saved. (Note: verify save files exist in this folder)');
      }
      setTimeout(() => setSaveStatus(null), 4000);
    } catch {
      setSaveStatus('Error applying save path.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSetDefault = () => {
    setInputPath(defaultPath);
  };

  const handleConfirmReset = async () => {
    setIsResetting(true);
    try {
      await onResetAllData();
      setShowResetConfirm(false);
      onClose();
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-window"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '520px',
          width: '90%',
          backgroundColor: '#ffffff',
          borderRadius: '1rem',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          border: '1px solid var(--terra-200)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1rem 1.25rem',
            borderBottom: '1px solid var(--terra-200)',
            backgroundColor: 'var(--terra-50)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--terra-700)' }}>
              settings
            </span>
            <span style={{ fontFamily: 'var(--font-headline)', fontSize: '14px', fontWeight: 700, color: 'var(--terra-900)', letterSpacing: '0.02em' }}>
              Save Directory &amp; Telemetry Settings
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--terra-500)',
              fontSize: '18px',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            ✕
          </button>
        </div>

        {/* Body Content */}
        <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Section 1: Save Directory Configuration */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label
                style={{
                  fontFamily: 'var(--font-headline)',
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: 'var(--terra-700)',
                }}
              >
                Save Directory Path:
              </label>
              <button
                type="button"
                onClick={handleSetDefault}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '11px',
                  color: 'var(--moss-700)',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  padding: 0,
                  fontWeight: 500,
                }}
              >
                Reset to default path
              </button>
            </div>

            {/* Path Input Box */}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                value={inputPath}
                onChange={(e) => setInputPath(e.target.value)}
                placeholder="%LOCALAPPDATA%\Remnant\Saved\SaveGames"
                style={{
                  flex: 1,
                  padding: '0.5rem 0.75rem',
                  fontFamily: 'var(--font-label)',
                  fontSize: '12px',
                  color: 'var(--terra-900)',
                  backgroundColor: 'var(--terra-50)',
                  border: '1px solid var(--terra-300)',
                  borderRadius: '0.5rem',
                  outline: 'none',
                }}
              />
              <button
                type="button"
                onClick={handleApplyPath}
                disabled={isSaving}
                style={{
                  padding: '0.5rem 0.875rem',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#ffffff',
                  backgroundColor: 'var(--moss-600)',
                  border: '1px solid var(--moss-700)',
                  borderRadius: '0.5rem',
                  cursor: isSaving ? 'wait' : 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                {isSaving ? 'Saving...' : 'Apply Path'}
              </button>
            </div>

            {/* Action buttons row */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => {
                  onPickFolder();
                }}
                style={{
                  flex: '1 1 180px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  padding: '0.55rem 0.75rem',
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
                <span className="material-symbols-outlined" style={{ fontSize: '15px', color: 'var(--moss-700)' }}>
                  folder_open
                </span>
                <span>Browse Save Directory</span>
              </button>

              {onPickFiles && (
                <button
                  type="button"
                  onClick={() => {
                    onPickFiles();
                  }}
                  style={{
                    flex: '1 1 180px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    padding: '0.55rem 0.75rem',
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
                  <span className="material-symbols-outlined" style={{ fontSize: '15px', color: 'var(--rust-stone-700)' }}>
                    upload_file
                  </span>
                  <span>Upload Save Files</span>
                </button>
              )}
            </div>

            {/* Active Linked Folder Indicator */}
            {linkedFolderName && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  fontSize: '11px',
                  color: 'var(--moss-700)',
                  backgroundColor: 'rgba(74, 114, 87, 0.08)',
                  padding: '0.35rem 0.625rem',
                  borderRadius: '0.375rem',
                  border: '1px solid rgba(74, 114, 87, 0.2)',
                  fontWeight: 500,
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>
                  check_circle
                </span>
                <span>
                  Active Link: <strong>{linkedFolderName}</strong>
                </span>
              </div>
            )}

            {/* Status Feedback Notice */}
            {saveStatus && (
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 500,
                  padding: '0.375rem 0.625rem',
                  borderRadius: '0.375rem',
                  backgroundColor: '#eef8f1',
                  color: '#15803d',
                  border: '1px solid #c8e6d0',
                }}
              >
                {saveStatus}
              </div>
            )}

            {/* Helper text */}
            <div
              style={{
                fontSize: '11px',
                color: 'var(--terra-500)',
                backgroundColor: 'rgba(250, 248, 245, 0.7)',
                padding: '0.625rem',
                borderRadius: '0.5rem',
                border: '1px dashed var(--terra-200)',
                lineHeight: 1.5,
              }}
            >
              <div>
                <strong>Default save directory:</strong>{' '}
                <code style={{ fontFamily: 'var(--font-label)', color: 'var(--terra-700)' }}>
                  %LOCALAPPDATA%\Remnant\Saved\SaveGames
                </code>
              </div>
              <div style={{ marginTop: '0.25rem' }}>
                All <code style={{ fontFamily: 'var(--font-label)' }}>save_*.sav</code> and{' '}
                <code style={{ fontFamily: 'var(--font-label)' }}>profile.sav</code> files found in this folder will be analyzed automatically.
              </div>
            </div>
          </div>

          {/* Section 2: Reset Data Block */}
          <div
            style={{
              paddingTop: '1rem',
              borderTop: '1px solid var(--terra-200)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
            }}
          >
            {!showResetConfirm ? (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontFamily: 'var(--font-headline)', fontSize: '12px', fontWeight: 700, color: 'var(--terra-900)' }}>
                    Reset Application Data
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--terra-500)' }}>
                    Clear all cached save files, world telemetry, and custom directory configuration.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(true)}
                  style={{
                    padding: '0.4rem 0.75rem',
                    fontSize: '11px',
                    fontWeight: 600,
                    color: '#b91c1c',
                    backgroundColor: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Reset Data
                </button>
              </div>
            ) : (
              <div
                style={{
                  backgroundColor: '#fff5f5',
                  border: '1px solid #fecaca',
                  borderRadius: '0.625rem',
                  padding: '0.875rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.625rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#991b1b', fontWeight: 700, fontSize: '12px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                    warning
                  </span>
                  <span>Confirm Data Reset</span>
                </div>
                <div style={{ fontSize: '11px', color: '#7f1d1d', lineHeight: 1.5 }}>
                  This will permanently clear and reset the following data:
                  <ul style={{ margin: '0.375rem 0 0.375rem 1.25rem', padding: 0 }}>
                    <li><strong>Saved Characters:</strong> All parsed archetypes, levels, and character slots</li>
                    <li><strong>Inventory Telemetry:</strong> All tracked equipment, traits, and missing items</li>
                    <li><strong>World Roll Telemetry:</strong> All campaign and adventure boss/event records</li>
                    <li><strong>Directory Configuration:</strong> Custom save paths reset to default</li>
                    <li><strong>Browser Storage:</strong> IndexedDB directory handles and LocalStorage cache</li>
                  </ul>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.25rem' }}>
                  <button
                    type="button"
                    onClick={() => setShowResetConfirm(false)}
                    style={{
                      padding: '0.375rem 0.75rem',
                      fontSize: '11px',
                      fontWeight: 600,
                      color: 'var(--terra-700)',
                      backgroundColor: '#ffffff',
                      border: '1px solid var(--terra-300)',
                      borderRadius: '0.375rem',
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmReset}
                    disabled={isResetting}
                    style={{
                      padding: '0.375rem 0.75rem',
                      fontSize: '11px',
                      fontWeight: 600,
                      color: '#ffffff',
                      backgroundColor: '#dc2626',
                      border: '1px solid #b91c1c',
                      borderRadius: '0.375rem',
                      cursor: isResetting ? 'wait' : 'pointer',
                    }}
                  >
                    {isResetting ? 'Clearing...' : 'Yes, Delete Everything'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            padding: '0.75rem 1.25rem',
            borderTop: '1px solid var(--terra-200)',
            backgroundColor: 'var(--terra-50)',
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '0.4rem 1rem',
              fontSize: '12px',
              fontWeight: 600,
              color: 'var(--terra-700)',
              backgroundColor: '#ffffff',
              border: '1px solid var(--terra-300)',
              borderRadius: '0.5rem',
              cursor: 'pointer',
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
