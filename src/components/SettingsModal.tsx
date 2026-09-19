import { useState, useEffect } from "react";
import type { FC } from "react";
import {
  isLocalServerAvailable,
  copyToClipboard,
} from "../utils/saveFolderStorage";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  saveDirectoryPath?: string;
  linkedFolderName?: string | null;
  onSaveDirectoryChange?: (newPath: string) => Promise<boolean>;
  onPickFiles?: () => void;
  onResetAllData: () => Promise<void>;
}

export const SettingsModal: FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  saveDirectoryPath,
  linkedFolderName,
  onSaveDirectoryChange,
  onPickFiles,
  onResetAllData,
}) => {
  const defaultPath = "%LOCALAPPDATA%\\Remnant\\Saved\\SaveGames";
  const isLocal = isLocalServerAvailable();
  const [customPathInput, setCustomPathInput] = useState<string>(
    saveDirectoryPath || defaultPath
  );
  const [copied, setCopied] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);
  const [isResetting, setIsResetting] = useState<boolean>(false);

  useEffect(() => {
    if (saveDirectoryPath) {
      setCustomPathInput(saveDirectoryPath);
    }
  }, [saveDirectoryPath]);

  if (!isOpen) return null;

  const handleApplyPath = async () => {
    if (!onSaveDirectoryChange) return;
    setIsSaving(true);
    setSaveStatus(null);
    try {
      const success = await onSaveDirectoryChange(customPathInput);
      if (success) {
        setSaveStatus("Directory path saved and save files reloaded successfully!");
      } else {
        setSaveStatus(
          "Directory path saved to LocalStorage. (Note: No .sav files found in this folder)"
        );
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyPath = async () => {
    const pathToCopy = customPathInput?.trim() || defaultPath;
    const ok = await copyToClipboard(pathToCopy);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
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
          maxWidth: "520px",
          width: "90%",
          backgroundColor: "#ffffff",
          borderRadius: "1rem",
          boxShadow:
            "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
          border: "1px solid var(--terra-200)",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "1rem 1.25rem",
            borderBottom: "1px solid var(--terra-200)",
            backgroundColor: "var(--terra-50)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span
              className="material-symbols-outlined"
              style={{ fontSize: "18px", color: "var(--terra-700)" }}
            >
              settings
            </span>
            <span
              style={{
                fontFamily: "var(--font-headline)",
                fontSize: "14px",
                fontWeight: 700,
                color: "var(--terra-900)",
                letterSpacing: "0.02em",
              }}
            >
              Save Directory &amp; Telemetry Settings
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--terra-500)",
              fontSize: "18px",
              display: "flex",
              alignItems: "center",
            }}
          >
            ✕
          </button>
        </div>

        {/* Body Content */}
        <div
          style={{
            padding: "1.25rem",
            display: "flex",
            flexDirection: "column",
            gap: "1.25rem",
          }}
        >
          {/* Section 1: Save Directory Configuration */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.625rem",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <label
                style={{
                  fontFamily: "var(--font-headline)",
                  fontSize: "11px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  color: "var(--terra-700)",
                }}
              >
                Save Directory Path:
              </label>
              {copied && (
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 600,
                    color: "var(--moss-700)",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.25rem",
                  }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: "14px" }}
                  >
                    check
                  </span>
                  Copied to clipboard!
                </span>
              )}
            </div>

            {/* Path Input Box with Copy (Icon Only) & Save Path buttons */}
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
              <input
                type="text"
                value={customPathInput}
                onChange={(e) => {
                  setCustomPathInput(e.target.value);
                  setSaveStatus(null);
                }}
                placeholder={defaultPath}
                style={{
                  flex: 1,
                  padding: "0.5rem 0.75rem",
                  fontFamily: "var(--font-label)",
                  fontSize: "12px",
                  color: "var(--terra-900)",
                  backgroundColor: "var(--terra-50)",
                  border: "1px solid var(--terra-300)",
                  borderRadius: "0.5rem",
                  outline: "none",
                }}
              />
              <button
                type="button"
                onClick={handleCopyPath}
                title={copied ? "Copied to clipboard!" : "Copy save directory path"}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "0.5rem 0.65rem",
                  color: copied ? "#15803d" : "var(--terra-700)",
                  backgroundColor: copied ? "#eef8f1" : "#ffffff",
                  border: `1px solid ${copied ? "#c8e6d0" : "var(--terra-300)"}`,
                  borderRadius: "0.375rem",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  flexShrink: 0,
                }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: "16px" }}
                >
                  {copied ? "check" : "content_copy"}
                </span>
              </button>
              {onSaveDirectoryChange && (
                <button
                  type="button"
                  onClick={handleApplyPath}
                  disabled={isSaving}
                  title={
                    isLocal
                      ? "Save path to LocalStorage and reload saves"
                      : "Save path to LocalStorage"
                  }
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.3rem",
                    padding: "0.5rem 0.85rem",
                    fontSize: "11px",
                    fontWeight: 600,
                    color: "#ffffff",
                    backgroundColor: "var(--moss-600)",
                    border: "1px solid var(--moss-700)",
                    borderRadius: "0.375rem",
                    cursor: isSaving ? "wait" : "pointer",
                    whiteSpace: "nowrap",
                    transition: "background-color 0.15s ease",
                    flexShrink: 0,
                  }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: "15px" }}
                  >
                    save
                  </span>
                  <span>{isSaving ? "Saving..." : "Save Path"}</span>
                </button>
              )}
            </div>

            {/* Status Feedback Notice */}
            {saveStatus && (
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: 500,
                  padding: "0.375rem 0.625rem",
                  borderRadius: "0.375rem",
                  backgroundColor: saveStatus.includes("successfully")
                    ? "#eef8f1"
                    : "#fef9c3",
                  color: saveStatus.includes("successfully")
                    ? "#15803d"
                    : "#854d0e",
                  border: `1px solid ${
                    saveStatus.includes("successfully") ? "#c8e6d0" : "#fde047"
                  }`,
                }}
              >
                {saveStatus}
              </div>
            )}

            {/* Action button: Upload Save Files */}
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              {onPickFiles && (
                <button
                  type="button"
                  onClick={() => {
                    onPickFiles();
                    onClose();
                  }}
                  style={{
                    flex: 1,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                    padding: "0.625rem 1rem",
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "#ffffff",
                    backgroundColor: "var(--moss-600)",
                    border: "1px solid var(--moss-700)",
                    borderRadius: "0.5rem",
                    cursor: "pointer",
                    transition: "background-color 0.15s ease",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
                  }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: "18px" }}
                  >
                    upload_file
                  </span>
                  <span>Upload Save Files</span>
                </button>
              )}
            </div>

            {/* Active Loaded Files Indicator */}
            {linkedFolderName && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.375rem",
                  fontSize: "11px",
                  color: "var(--moss-700)",
                  backgroundColor: "rgba(74, 114, 87, 0.08)",
                  padding: "0.4rem 0.65rem",
                  borderRadius: "0.375rem",
                  border: "1px solid rgba(74, 114, 87, 0.2)",
                  fontWeight: 600,
                }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: "16px" }}
                >
                  check_circle
                </span>
                <span>
                  Active Saves: <strong>{linkedFolderName}</strong>
                </span>
              </div>
            )}

            {/* Helper text */}
            <div
              style={{
                fontSize: "11px",
                color: "var(--terra-600)",
                backgroundColor: "rgba(250, 248, 245, 0.9)",
                padding: "0.75rem",
                borderRadius: "0.5rem",
                border: "1px dashed var(--terra-300)",
                lineHeight: 1.6,
              }}
            >
              <div
                style={{
                  fontWeight: 600,
                  color: "var(--terra-900)",
                  marginBottom: "0.25rem",
                }}
              >
                How to Load &amp; Refresh Your Save Files:
              </div>
              <div>
                1. Click the <strong>copy icon</strong> (📋) next to the save path above to copy your save directory (<code>%LOCALAPPDATA%\Remnant\Saved\SaveGames</code>).
              </div>
              <div>
                2. Click <strong>Upload Save Files</strong>, paste the path into Windows Explorer's address bar, and select your <code>profile.sav</code> and <code>save_0.sav</code> files (or press <kbd>Ctrl+A</kbd>).
              </div>
              <div>
                3. Whenever you progress or reroll in-game, click the <strong>Refresh (🔄)</strong> button in the top bar to select your updated save files. The save path is automatically copied to your clipboard on refresh for quick navigation!
              </div>
              <div
                style={{
                  marginTop: "0.35rem",
                  color: "var(--terra-500)",
                  fontStyle: "italic",
                }}
              >
                Tip: You can also drag &amp; drop save files directly onto this page anytime.
              </div>
            </div>
          </div>

          {/* Section 2: Reset Data Block */}
          <div
            style={{
              paddingTop: "1rem",
              borderTop: "1px solid var(--terra-200)",
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
            }}
          >
            {!showResetConfirm ? (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <div
                    style={{
                      fontFamily: "var(--font-headline)",
                      fontSize: "12px",
                      fontWeight: 700,
                      color: "var(--terra-900)",
                    }}
                  >
                    Reset Application Data
                  </div>
                  <div style={{ fontSize: "11px", color: "var(--terra-500)" }}>
                    Clear all cached save files, world telemetry, and custom
                    directory configuration.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(true)}
                  style={{
                    padding: "0.4rem 0.75rem",
                    fontSize: "11px",
                    fontWeight: 600,
                    color: "#b91c1c",
                    backgroundColor: "#fef2f2",
                    border: "1px solid #fecaca",
                    borderRadius: "0.5rem",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  Reset Data
                </button>
              </div>
            ) : (
              <div
                style={{
                  backgroundColor: "#fff5f5",
                  border: "1px solid #fecaca",
                  borderRadius: "0.625rem",
                  padding: "0.875rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.625rem",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    color: "#991b1b",
                    fontWeight: 700,
                    fontSize: "12px",
                  }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: "16px" }}
                  >
                    warning
                  </span>
                  <span>Confirm Data Reset</span>
                </div>
                <div
                  style={{
                    fontSize: "11px",
                    color: "#7f1d1d",
                    lineHeight: 1.5,
                  }}
                >
                  This will permanently clear and reset the following data:
                  <ul
                    style={{
                      margin: "0.375rem 0 0.375rem 1.25rem",
                      padding: 0,
                    }}
                  >
                    <li>
                      <strong>Saved Characters:</strong> All parsed archetypes,
                      levels, and character slots
                    </li>
                    <li>
                      <strong>Inventory Telemetry:</strong> All tracked
                      equipment, traits, and missing items
                    </li>
                    <li>
                      <strong>World Roll Telemetry:</strong> All campaign and
                      adventure boss/event records
                    </li>
                    <li>
                      <strong>Directory Configuration:</strong> Custom save
                      paths reset to default
                    </li>
                    <li>
                      <strong>Browser Storage:</strong> IndexedDB directory
                      handles and LocalStorage cache
                    </li>
                  </ul>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: "0.5rem",
                    marginTop: "0.25rem",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setShowResetConfirm(false)}
                    style={{
                      padding: "0.375rem 0.75rem",
                      fontSize: "11px",
                      fontWeight: 600,
                      color: "var(--terra-700)",
                      backgroundColor: "#ffffff",
                      border: "1px solid var(--terra-300)",
                      borderRadius: "0.375rem",
                      cursor: "pointer",
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmReset}
                    disabled={isResetting}
                    style={{
                      padding: "0.375rem 0.75rem",
                      fontSize: "11px",
                      fontWeight: 600,
                      color: "#ffffff",
                      backgroundColor: "#dc2626",
                      border: "1px solid #b91c1c",
                      borderRadius: "0.375rem",
                      cursor: isResetting ? "wait" : "pointer",
                    }}
                  >
                    {isResetting ? "Clearing..." : "Yes, Delete Everything"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            padding: "0.75rem 1.25rem",
            borderTop: "1px solid var(--terra-200)",
            backgroundColor: "var(--terra-50)",
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: "0.4rem 1rem",
              fontSize: "12px",
              fontWeight: 600,
              color: "var(--terra-700)",
              backgroundColor: "#ffffff",
              border: "1px solid var(--terra-300)",
              borderRadius: "0.5rem",
              cursor: "pointer",
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
