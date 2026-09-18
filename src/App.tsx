import { useState, useEffect, useRef } from 'react';
import type { RemnantCharacter } from './types/remnant';
import { parseProfileSav, parseWorldSave, gameData } from './utils/saveParser';
import { getSampleCharacter } from './utils/demoData';
import {
  getStoredDirectoryHandle,
  saveDirectoryHandle,
  verifyHandlePermission,
  readSavFilesFromHandle,
  isDirectoryPickerSupported,
} from './utils/saveFolderStorage';
import { TopAppBar } from './components/TopAppBar';
import { LeftSidebar } from './components/LeftSidebar';
import { MainPortal } from './components/MainPortal';
import { WorldAnalyzerView } from './components/WorldAnalyzerView';
import { ChecklistView } from './components/ChecklistView';
import { SettingsModal } from './components/SettingsModal';
import { Toast } from './components/Toast';

const LOCAL_STORAGE_KEY = 'remnant_web_characters_v2';
const LOCAL_STORAGE_ACTIVE_KEY = 'remnant_web_active_char_v2';
const LOCAL_STORAGE_LIVE_KEY = 'remnant_web_is_live_v2';

export function App() {
  const [characters, setCharacters] = useState<RemnantCharacter[]>([]);
  const [activeCharIndex, setActiveCharIndex] = useState<number>(0);
  const [currentView, setCurrentView] = useState<'home' | 'world-analyzer' | 'checklist'>('home');
  const [selectedChecklistCat, setSelectedChecklistCat] = useState<string | null>(null);
  const [isLiveSave, setIsLiveSave] = useState<boolean>(false);
  const [saveName, setSaveName] = useState<string>('SaveSlot_0.sav');
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [linkedFolderName, setLinkedFolderName] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Restore state from LocalStorage on mount
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
          setSaveName(savedIsLive === 'true' ? 'SaveSlot_0.sav' : 'Sample_Slot.sav');
          return;
        }
      }
    } catch {
      // ignore
    }

    // Default to sample demo character
    setCharacters([getSampleCharacter()]);
    setActiveCharIndex(0);
    setIsLiveSave(false);
    setSaveName('SaveSlot_0.sav');
  }, []);

  // Restore stored directory handle if available
  useEffect(() => {
    getStoredDirectoryHandle().then((handle) => {
      if (handle) {
        setLinkedFolderName(handle.name);
      }
    });
  }, []);

  // Save state to LocalStorage
  useEffect(() => {
    if (characters.length > 0) {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(characters));
        localStorage.setItem(LOCAL_STORAGE_ACTIVE_KEY, activeCharIndex.toString());
        localStorage.setItem(LOCAL_STORAGE_LIVE_KEY, isLiveSave.toString());
      } catch (err) {
        console.warn('LocalStorage save error:', err);
      }
    }
  }, [characters, activeCharIndex, isLiveSave]);

  const activeCharacter = characters[activeCharIndex] || characters[0] || getSampleCharacter();

  const handleResetDemo = () => {
    const demo = [getSampleCharacter()];
    setCharacters(demo);
    setActiveCharIndex(0);
    setIsLiveSave(false);
    setSaveName('SaveSlot_0.sav');
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    localStorage.removeItem(LOCAL_STORAGE_ACTIVE_KEY);
    localStorage.removeItem(LOCAL_STORAGE_LIVE_KEY);
  };

  const processFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const profileFile = fileArray.find((f) => f.name.toLowerCase() === 'profile.sav');
    const worldFiles = fileArray.filter(
      (f) => f.name.toLowerCase().startsWith('save_') && f.name.toLowerCase().endsWith('.sav')
    );

    worldFiles.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));

    if (!profileFile && worldFiles.length === 0) {
      alert('Please provide "profile.sav" or "save_0.sav" from your Remnant save folder.');
      return;
    }

    const readFileText = (file: File): Promise<string> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string) || '');
        reader.onerror = () => reject(reader.error);
        reader.readAsText(file, 'ISO-8859-1');
      });
    };

    try {
      let currentChars = isLiveSave ? [...characters] : [];

      if (profileFile) {
        const profileText = await readFileText(profileFile);
        const parsedProfileChars = parseProfileSav(profileText);
        if (parsedProfileChars.length > 0) {
          currentChars = parsedProfileChars.map((pChar, idx) => {
            const existing = currentChars[idx];
            const invSet = new Set(pChar.inventory);

            const updatedCampaign = (existing?.campaignEvents || []).map((evt) => ({
              ...evt,
              missingItems: (evt.possibleItems || []).filter((i) => !invSet.has(i.key)),
            }));

            const updatedAdventure = (existing?.adventureEvents || []).map((evt) => ({
              ...evt,
              missingItems: (evt.possibleItems || []).filter((i) => !invSet.has(i.key)),
            }));

            return {
              ...pChar,
              campaignEvents: updatedCampaign,
              adventureEvents: updatedAdventure,
              hasAdventureData: existing?.hasAdventureData || false,
              adventureZone: existing?.adventureZone || null,
            };
          });
        }
      }

      let targetActiveIndex: number | null = null;

      for (const worldFile of worldFiles) {
        const match = worldFile.name.match(/save_(\d+)\.sav/i);
        const slot = match ? parseInt(match[1], 10) : 0;

        while (currentChars.length <= slot) {
          const newSlot = currentChars.length;
          currentChars.push({
            id: newSlot,
            archetype: `Character ${newSlot + 1}`,
            inventory: [],
            campaignEvents: [],
            adventureEvents: [],
            missingItems: [],
            hasAdventureData: false,
            adventureZone: null,
          });
        }

        const worldText = await readFileText(worldFile);
        const worldResult = parseWorldSave(worldText, currentChars[slot]);
        currentChars[slot].campaignEvents = worldResult.campaignEvents;
        currentChars[slot].adventureEvents = worldResult.adventureEvents;
        currentChars[slot].hasAdventureData = worldResult.hasAdventureData;
        currentChars[slot].adventureZone = worldResult.adventureZone;

        if (targetActiveIndex === null) {
          targetActiveIndex = slot;
        }
      }

      if (currentChars.length === 0) {
        currentChars = [getSampleCharacter()];
      }

      setCharacters(currentChars);
      if (targetActiveIndex !== null) {
        setActiveCharIndex(targetActiveIndex);
      }
      setIsLiveSave(true);
      setSaveName(worldFiles[0]?.name || profileFile?.name || 'SaveSlot_0.sav');
      setToastMessage('file upload succefully');
      setTimeout(() => {
        setToastMessage(null);
      }, 4000);
    } catch (err) {
      console.error('Error parsing Remnant save file:', err);
      alert('Error parsing save files. Please ensure you selected valid Remnant: From the Ashes files.');
    }
  };

  const handleAnalyzeSaves = async (forcePickNewFolder = false) => {
    if (!isDirectoryPickerSupported()) {
      fileInputRef.current?.click();
      return;
    }

    setIsAnalyzing(true);
    try {
      let dirHandle: FileSystemDirectoryHandle | null = null;

      if (!forcePickNewFolder) {
        dirHandle = await getStoredDirectoryHandle();
        if (dirHandle) {
          const hasPermission = await verifyHandlePermission(dirHandle);
          if (!hasPermission) {
            // Permission expired or denied, prompt picker
            dirHandle = null;
          }
        }
      }

      if (!dirHandle) {
        // @ts-expect-error - showDirectoryPicker
        dirHandle = await window.showDirectoryPicker();
        if (dirHandle) {
          await saveDirectoryHandle(dirHandle);
          setLinkedFolderName(dirHandle.name);
        }
      }

      if (dirHandle) {
        setLinkedFolderName(dirHandle.name);
        const files = await readSavFilesFromHandle(dirHandle);
        if (files.length > 0) {
          await processFiles(files);
        } else {
          alert(`No Remnant save files (profile.sav or save_*.sav) found in "${dirHandle.name}".`);
        }
      }
    } catch (err: unknown) {
      if ((err as Error).name !== 'AbortError') {
        console.error('Error analyzing saves from folder:', err);
        fileInputRef.current?.click();
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSelectView = (view: string, category?: string | null) => {
    setCurrentView(view as 'home' | 'world-analyzer' | 'checklist');
    setSelectedChecklistCat(category || null);
  };

  const totalGameItems = gameData.allItems.length;
  const ownedCount = activeCharacter.inventory.length;
  const overallPercent = totalGameItems > 0 ? Math.round((ownedCount / totalGameItems) * 100) : 0;

  return (
    <div
      className="app-shell"
      onDragOver={(e) => e.preventDefault()}
      onDrop={async (e) => {
        e.preventDefault();
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
          await processFiles(e.dataTransfer.files);
        }
      }}
    >
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

      {/* TOP APP BAR */}
      <TopAppBar
        isLiveSave={isLiveSave}
        saveName={saveName}
        onOpenSaveFile={() => setIsSettingsOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* BODY CONTENT AREA (SIDEBAR + MAIN CANVAS) */}
      <div className="body-layout">
        {/* LEFT SIDEBAR NAVIGATION */}
        <LeftSidebar
          currentView={currentView}
          selectedCategory={selectedChecklistCat}
          activeCharacter={activeCharacter}
          characters={characters}
          activeCharIndex={activeCharIndex}
          onSelectChar={(idx) => setActiveCharIndex(idx)}
          onSelectView={handleSelectView}
          onResetDemo={handleResetDemo}
        />

        {/* MAIN VIEWPORT */}
        <main className="main-viewport">
          {currentView === 'home' && (
            <MainPortal
              overallPercent={overallPercent}
              onLaunchWorldAnalyzer={() => setCurrentView('world-analyzer')}
              onExploreChecklist={() => {
                setSelectedChecklistCat(null);
                setCurrentView('checklist');
              }}
            />
          )}

          {currentView === 'world-analyzer' && (
            <WorldAnalyzerView
              character={activeCharacter}
              characters={characters}
              activeCharIndex={activeCharIndex}
              onSelectChar={(idx) => setActiveCharIndex(idx)}
              onUploadFiles={processFiles}
              onAnalyzeSaves={handleAnalyzeSaves}
              linkedFolderName={linkedFolderName}
              isAnalyzing={isAnalyzing}
              onBackToHome={() => setCurrentView('home')}
            />
          )}

          {currentView === 'checklist' && (
            <ChecklistView
              character={activeCharacter}
              initialCategory={selectedChecklistCat}
              onBackToHome={() => setCurrentView('home')}
            />
          )}
        </main>
      </div>

      {/* Toast Bar Notification */}
      <Toast message={toastMessage} onClose={() => setToastMessage(null)} />

      {/* Settings / Upload Dialog */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onPickFiles={() => fileInputRef.current?.click()}
        onPickFolder={() => handleAnalyzeSaves(true)}
        onResetDemo={handleResetDemo}
        isLiveSave={isLiveSave}
        saveName={saveName}
      />
    </div>
  );
}

export default App;
