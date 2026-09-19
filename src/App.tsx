import { useState, useEffect, useRef } from 'react';
import type { RemnantCharacter } from './types/remnant';
import { parseProfileSav, parseWorldSave, gameData } from './utils/saveParser';
import { getBlankCharacter } from './utils/demoData';
import {
  fetchLocalSaves,
  isLocalServerAvailable,
  DEFAULT_SAVE_PATH,
  copyToClipboard,
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
const LOCAL_STORAGE_PATH_KEY = 'remnant_save_directory_path';

export function App() {
  const [characters, setCharacters] = useState<RemnantCharacter[]>([]);
  const [activeCharIndex, setActiveCharIndex] = useState<number>(0);
  const [currentView, setCurrentView] = useState<'home' | 'world-analyzer' | 'checklist'>('home');
  const [selectedChecklistCat, setSelectedChecklistCat] = useState<string | null>(null);
  const [isLiveSave, setIsLiveSave] = useState<boolean>(false);
  const [saveName, setSaveName] = useState<string>('No save loaded');
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [linkedFolderName, setLinkedFolderName] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [saveDirectoryPath, setSaveDirectoryPath] = useState<string>(() => {
    return localStorage.getItem(LOCAL_STORAGE_PATH_KEY) || DEFAULT_SAVE_PATH;
  });

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
          const updated = parsed.map((c) => ({
            ...c,
            campaignDifficulty: c.campaignDifficulty || (c.campaignEvents && c.campaignEvents.length > 0 ? 'Normal' : null),
            adventureDifficulty: c.adventureDifficulty || (c.adventureEvents && c.adventureEvents.length > 0 ? 'Normal' : null),
          }));
          setCharacters(updated);
          setActiveCharIndex(savedActive ? Math.min(Number(savedActive), updated.length - 1) : 0);
          setIsLiveSave(savedIsLive === 'true');
          setSaveName(savedIsLive === 'true' ? 'SaveSlot_0.sav' : 'No save loaded');
          return;
        }
      }
    } catch {
      // ignore
    }

    // Default to clean empty state (no fake dummy characters)
    setCharacters([]);
    setActiveCharIndex(0);
    setIsLiveSave(false);
    setSaveName('No save loaded');
  }, []);

  // Check local server endpoint with configured path (when running locally)
  useEffect(() => {
    if (isLocalServerAvailable()) {
      fetchLocalSaves(saveDirectoryPath).then((localData) => {
        if (localData && localData.files.length > 0) {
          setLinkedFolderName('SaveGames (Auto-detected)');
        }
      });
    }
  }, [saveDirectoryPath]);

  // Auto-refresh save telemetry whenever the browser window regains focus (when running locally)
  useEffect(() => {
    if (!isLocalServerAvailable()) return;
    let lastFocusTime = 0;
    const handleWindowFocus = async () => {
      const now = Date.now();
      // Throttle checks so rapid alt-tabs don't spam disk reads (minimum 3s cooldown)
      if (now - lastFocusTime < 3000) return;
      lastFocusTime = now;

      try {
        const localData = await fetchLocalSaves(saveDirectoryPath);
        if (localData && localData.files.length > 0) {
          await processFiles(localData.files, true);
        }
      } catch (err) {
        console.warn('Auto-refresh on focus check:', err);
      }
    };

    window.addEventListener('focus', handleWindowFocus);
    return () => {
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, [saveDirectoryPath, characters, isLiveSave]);

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

  const activeCharacter = characters[activeCharIndex] || characters[0] || getBlankCharacter();

  const handleSaveDirectoryChange = async (newPath: string): Promise<boolean> => {
    const cleanPath =
      newPath.trim().replace(/^["']|["']$/g, "") || DEFAULT_SAVE_PATH;
    localStorage.setItem(LOCAL_STORAGE_PATH_KEY, cleanPath);
    setSaveDirectoryPath(cleanPath);

    if (isLocalServerAvailable()) {
      const localData = await fetchLocalSaves(cleanPath);
      if (localData && localData.files.length > 0) {
        setLinkedFolderName("SaveGames (Auto-detected)");
        await processFiles(localData.files);
        setToastMessage("Save directory updated and save files reloaded!");
        return true;
      } else {
        setToastMessage(
          "Directory path saved to LocalStorage. (Note: No .sav files found in this folder)"
        );
        return false;
      }
    } else {
      setToastMessage("Save directory path saved to LocalStorage.");
      return true;
    }
  };

  const handleResetAllData = async () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    localStorage.removeItem(LOCAL_STORAGE_ACTIVE_KEY);
    localStorage.removeItem(LOCAL_STORAGE_LIVE_KEY);
    localStorage.removeItem(LOCAL_STORAGE_PATH_KEY);

    setCharacters([]);
    setActiveCharIndex(0);
    setIsLiveSave(false);
    setSaveName("No save loaded");
    setLinkedFolderName(null);
    setSaveDirectoryPath(DEFAULT_SAVE_PATH);
    setToastMessage("All configuration, save files, and world telemetry cleared.");
  };

  const processFiles = async (files: FileList | File[], isSilent = false) => {
    const fileArray = Array.from(files);
    const profileFile = fileArray.find((f) => f.name.toLowerCase() === 'profile.sav');
    const worldFiles = fileArray.filter(
      (f) => f.name.toLowerCase().startsWith('save_') && f.name.toLowerCase().endsWith('.sav')
    );

    worldFiles.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));

    if (!profileFile && worldFiles.length === 0) {
      if (!isSilent) {
        alert('Please provide "profile.sav" or "save_0.sav" from your Remnant save folder.');
      }
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
        currentChars[slot].campaignDifficulty = worldResult.campaignDifficulty;
        currentChars[slot].adventureDifficulty = worldResult.adventureDifficulty;

        if (targetActiveIndex === null) {
          targetActiveIndex = slot;
        }
      }

      if (currentChars.length === 0) {
        currentChars = [];
      }

      setCharacters(currentChars);
      if (targetActiveIndex !== null) {
        setActiveCharIndex(targetActiveIndex);
      }
      const loadedFileNames = fileArray
        .map((f) => f.name)
        .filter((n) => n.toLowerCase().endsWith('.sav'))
        .join(', ');
      if (loadedFileNames) {
        setLinkedFolderName(loadedFileNames);
      }
      setIsLiveSave(true);
      setSaveName(worldFiles[0]?.name || profileFile?.name || 'SaveSlot_0.sav');
      if (!isSilent) {
        setToastMessage('Save files analyzed successfully');
      }
    } catch (err) {
      console.error('Error parsing Remnant save file:', err);
      if (!isSilent) {
        alert('Error parsing save files. Please ensure you selected valid Remnant: From the Ashes files.');
      }
    }
  };

  const promptSelectSaveFiles = async () => {
    // 1. Copy save path from local storage to clipboard for easy navigation
    const pathToCopy = saveDirectoryPath || DEFAULT_SAVE_PATH;
    await copyToClipboard(pathToCopy);
    setToastMessage("Save path copied! Select your .sav files in Windows Explorer.");

    // 2. Clear input value so selecting the same files again triggers onChange
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  };

  const handleAnalyzeSaves = async (forcePrompt = false) => {
    // 1. If running on localhost and not forcing manual file prompt, load directly from dev server
    if (!forcePrompt && isLocalServerAvailable()) {
      setIsAnalyzing(true);
      try {
        let localData = await fetchLocalSaves(saveDirectoryPath);
        if (
          (!localData || localData.files.length === 0) &&
          saveDirectoryPath !== DEFAULT_SAVE_PATH
        ) {
          localData = await fetchLocalSaves(DEFAULT_SAVE_PATH);
        }
        if (localData && localData.files.length > 0) {
          setLinkedFolderName("SaveGames (Auto-detected)");
          await processFiles(localData.files);
          return;
        }
      } catch (err) {
        console.error("Error analyzing saves from server:", err);
      } finally {
        setIsAnalyzing(false);
      }
    }

    // 2. On Web / GitHub Pages (or when user clicks refresh / upload):
    // Show the file selector and automatically copy the save path to clipboard
    await promptSelectSaveFiles();
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
        isAnalyzing={isAnalyzing}
        characters={characters}
        activeCharacter={activeCharacter}
        activeCharIndex={activeCharIndex}
        onSelectChar={(idx) => setActiveCharIndex(idx)}
        onRefresh={() => handleAnalyzeSaves(false)}
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
              onBackToHome={() => setCurrentView('home')}
              onOpenSettings={() => setIsSettingsOpen(true)}
            />
          )}

          {currentView === 'checklist' && (
            <ChecklistView
              character={activeCharacter}
              selectedCategory={selectedChecklistCat}
              onSelectCategory={(cat) => setSelectedChecklistCat(cat === 'all' ? null : cat)}
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
        saveDirectoryPath={saveDirectoryPath}
        linkedFolderName={linkedFolderName}
        onSaveDirectoryChange={handleSaveDirectoryChange}
        onPickFiles={() => promptSelectSaveFiles()}
        onResetAllData={handleResetAllData}
      />
    </div>
  );
}

export default App;
