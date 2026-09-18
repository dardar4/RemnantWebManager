import { useState, useEffect, useRef } from 'react';
import type { RemnantCharacter } from './types/remnant';
import { parseProfileSav, parseWorldSave, gameData } from './utils/saveParser';
import { getSampleCharacter } from './utils/demoData';
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
      let currentChars = [...characters];

      if (profileFile) {
        const profileText = await readFileText(profileFile);
        currentChars = parseProfileSav(profileText);
      }

      if (currentChars.length === 0) {
        currentChars = [getSampleCharacter()];
      }

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

  const handleOpenFolder = async () => {
    try {
      // @ts-expect-error - showDirectoryPicker
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
          alert('No Remnant save files (profile.sav or save_*.sav) found in that directory.');
        }
      } else {
        fileInputRef.current?.click();
      }
    } catch (err: unknown) {
      if ((err as Error).name !== 'AbortError') {
        fileInputRef.current?.click();
      }
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
              onOpenFolder={handleOpenFolder}
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
        onPickFolder={handleOpenFolder}
        onResetDemo={handleResetDemo}
        isLiveSave={isLiveSave}
        saveName={saveName}
      />
    </div>
  );
}

export default App;
