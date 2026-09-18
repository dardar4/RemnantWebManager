import gameDataRaw from '../data/gameData.json';
import type { GameData, RemnantCharacter, RemnantItem, RemnantWorldEvent } from '../types/remnant';

export const gameData = gameDataRaw as GameData;

function getZone(textLine: string): string | null {
  if (textLine.includes('World_City') || textLine.includes('Quest_Church') || textLine.includes('World_Rural')) {
    return 'Earth';
  }
  if (textLine.includes('World_Wasteland')) {
    return 'Rhom';
  }
  if (textLine.includes('World_Jungle')) {
    return 'Yaesha';
  }
  if (textLine.includes('World_Swamp')) {
    return 'Corsus';
  }
  if (textLine.includes('World_Snow') || textLine.includes('Campaign_Clementine')) {
    return 'Reisum';
  }
  return null;
}

function getEventType(textLine: string): string | null {
  if (textLine.includes('SmallD')) {
    return 'Side Dungeon';
  }
  if (textLine.includes('Quest_Boss')) {
    return 'World Boss';
  }
  if (textLine.includes('Siege') || textLine.includes('Quest_Church')) {
    return 'Siege';
  }
  if (textLine.includes('Mini')) {
    return 'Miniboss';
  }
  if (textLine.includes('Quest_Event')) {
    if (textLine.includes('Nexus')) return 'Siege';
    if (textLine.includes('Sketterling')) return 'Loot Beetle';
    return 'Item Drop';
  }
  if (textLine.includes('OverworldPOI') || textLine.includes('OverWorldPOI') || textLine.includes('OverworlPOI')) {
    return 'Point of Interest';
  }
  return null;
}

function getPossibleItemsForEvent(eventKey: string): RemnantItem[] {
  return gameData.eventItems[eventKey] ? [...gameData.eventItems[eventKey]] : [];
}

function createUnknownItem(key: string): RemnantItem {
  return {
    key,
    name: 'Unknown Potential Loot',
    type: 'Uncategorized',
    mode: 'normal',
    notes: 'Event not recognized or unmapped loot',
  };
}

export function processEvents(
  savetext: string,
  mode: 'Campaign' | 'Adventure' | 'Subject2923',
  inventorySet: Set<string>
): RemnantWorldEvent[] {
  const zones: Record<string, Record<string, string>> = {};
  const zoneEvents: Record<string, RemnantWorldEvent[]> = {};
  const churchEvents: RemnantWorldEvent[] = [];

  for (const z of Object.keys(gameData.zones)) {
    zones[z] = {};
    zoneEvents[z] = [];
  }

  let currentMainLocation: string | null = 'Fairview';
  let currentSublocation: string | null = null;
  let eventName: string | null = null;
  let lastEventName: string | null = null;

  const eventRegex = /(?:\/[a-zA-Z0-9_]+){3}\/(([a-zA-Z0-9]+_[a-zA-Z0-9]+_[a-zA-Z0-9_]+)|Quest_Church)/g;
  let match: RegExpExecArray | null;

  while ((match = eventRegex.exec(savetext)) !== null) {
    const textLine = match[0];
    lastEventName = eventName;
    eventName = null;
    let eventType: string | null = null;

    try {
      if (currentSublocation) {
        if (currentSublocation === "TheRavager'sHaunt" || currentSublocation === 'TheTempestCourt') {
          currentSublocation = null;
        }
      }

      const zone = getZone(textLine);
      eventType = getEventType(textLine);

      if (textLine.includes('Overworld_Zone') || textLine.includes('_Overworld_')) {
        const parts = textLine.split('/')[4]?.split('_') || [];
        if (parts.length >= 4) {
          const locKey = `${parts[1]} ${parts[2]} ${parts[3]}`;
          currentMainLocation = gameData.mainLocations[locKey] || null;
        } else {
          currentMainLocation = null;
        }
        continue;
      } else if (textLine.includes('Quest_Church')) {
        currentMainLocation = 'Chapel Station';
        eventName = 'RootMother';
        currentSublocation = 'Church of the Harbinger';
      } else if (eventType) {
        const segments = textLine.split('/');
        if (segments.length > 4) {
          const subparts = segments[4].split('_');
          eventName = subparts[2] || null;
        }

        if (textLine.includes('OverworldPOI')) {
          currentSublocation = null;
        } else if (!textLine.includes('Quest_Event')) {
          if (eventName && gameData.subLocations[eventName]) {
            currentSublocation = gameData.subLocations[eventName];
          } else {
            currentSublocation = null;
          }
        }

        if (currentMainLocation === 'Chapel Station') {
          if (textLine.includes('Quest_Boss')) {
            currentMainLocation = 'Westcourt';
          } else {
            currentSublocation = null;
          }
        }
      }

      if (mode === 'Adventure') {
        currentMainLocation = null;
      }

      if (eventName && eventName !== lastEventName) {
        let displayName = gameData.events[eventName] || eventName;
        displayName = displayName.replace(/([a-z])([A-Z])/g, '$1 $2');

        if (zone && eventType && zoneEvents[zone]) {
          if (!zones[zone][eventType]) {
            zones[zone][eventType] = '';
          }

          if (!zones[zone][eventType].includes(eventName)) {
            zones[zone][eventType] += `, ${eventName}`;

            const locationList: string[] = [];
            locationList.push(gameData.zones[zone] || zone);
            if (currentMainLocation) {
              locationList.push(currentMainLocation.replace(/([a-z])([A-Z])/g, '$1 $2'));
            }
            if (currentSublocation) {
              locationList.push(currentSublocation.replace(/([a-z])([A-Z])/g, '$1 $2'));
            }

            const possibleItems = getPossibleItemsForEvent(eventName);
            const missingItems = possibleItems.filter(item => !inventorySet.has(item.key));

            if (
              possibleItems.length === 0 &&
              !gameData.events[eventName] &&
              eventName !== 'TraitBook' &&
              eventName !== 'Simulacrum'
            ) {
              missingItems.push(createUnknownItem('/UnknownPotentialLoot'));
            }

            const worldEvt: RemnantWorldEvent = {
              key: eventName,
              name: displayName,
              type: eventType,
              location: locationList.join(': '),
              possibleItems,
              missingItems,
            };

            if (currentMainLocation !== 'Chapel Station') {
              zoneEvents[zone].push(worldEvt);
            } else {
              churchEvents.unshift(worldEvt);
            }

            // Cryptolith on Rhom drops Soul Link
            if (eventName === 'Cryptolith' && zone === 'Rhom') {
              const ringDropItems = getPossibleItemsForEvent('SoulLink');
              zoneEvents[zone].push({
                key: 'SoulLink',
                name: 'Soul Link',
                type: 'Item Drop',
                location: zone,
                possibleItems: ringDropItems,
                missingItems: ringDropItems.filter(i => !inventorySet.has(i.key)),
              });
            } else if (eventName === 'BrainBug') {
              const beetleItems = getPossibleItemsForEvent('Sketterling');
              zoneEvents[zone].push({
                key: 'Sketterling',
                name: 'Sketterling',
                type: 'Loot Beetle',
                location: worldEvt.location,
                possibleItems: beetleItems,
                missingItems: beetleItems.filter(i => !inventorySet.has(i.key)),
              });
            } else if (eventName === 'BarnSiege' || eventName === 'Homestead') {
              const wardPrimeItems = getPossibleItemsForEvent('WardPrime');
              zoneEvents[zone].push({
                key: 'WardPrime',
                name: 'Ward Prime',
                type: 'Quest Event',
                location: 'Earth: Ward Prime',
                possibleItems: wardPrimeItems,
                missingItems: wardPrimeItems.filter(i => !inventorySet.has(i.key)),
              });
            }
          }
        }
      }
    } catch {
      // ignore parse chunk failure
    }
  }

  const orderedEvents: RemnantWorldEvent[] = [];
  let churchAdded = false;
  let queenAdded = false;
  let navunAdded = false;

  const makeFixedEvent = (key: string, name: string, location: string, type: string): RemnantWorldEvent => {
    const possibleItems = getPossibleItemsForEvent(key);
    return {
      key,
      name,
      location,
      type,
      possibleItems,
      missingItems: possibleItems.filter(i => !inventorySet.has(i.key)),
    };
  };

  const ward13 = makeFixedEvent('Ward13', 'Ward 13', 'Earth: Ward 13', 'Home');
  const hideout = makeFixedEvent('FoundersHideout', "Founder's Hideout", 'Earth: Fairview', 'Point of Interest');
  const undying = makeFixedEvent('UndyingKing', 'Undying King', 'Rhom: Undying Throne', 'World Boss');
  const queen = makeFixedEvent('IskalQueen', 'Iskal Queen', 'Corsus: The Mist Fen', 'Point of Interest');
  const navun = makeFixedEvent('SlaveRevolt', 'Fight With The Rebels', 'Yaesha: Shrine of the Immortals', 'Siege');
  const ward17 = makeFixedEvent('Ward17', 'The Dreamer', 'Earth: Ward 17', 'World Boss');

  if (mode === 'Campaign') {
    if (ward13.missingItems.length > 0) orderedEvents.push(ward13);
    if (hideout.missingItems.length > 0) orderedEvents.push(hideout);
  }

  if (zoneEvents['Earth']) {
    for (const evt of zoneEvents['Earth']) {
      if (mode === 'Campaign' && !churchAdded && evt.location.includes('Westcourt')) {
        for (const cEvt of churchEvents) {
          orderedEvents.push(cEvt);
        }
        churchAdded = true;
      }
      orderedEvents.push(evt);
    }
  }

  if (zoneEvents['Rhom']) {
    for (const evt of zoneEvents['Rhom']) {
      orderedEvents.push(evt);
    }
    if (mode === 'Campaign' && undying.missingItems.length > 0) {
      orderedEvents.push(undying);
    }
  }

  if (zoneEvents['Corsus']) {
    for (const evt of zoneEvents['Corsus']) {
      if (mode === 'Campaign' && !queenAdded && evt.location.includes('The Mist Fen')) {
        if (queen.missingItems.length > 0) orderedEvents.push(queen);
        queenAdded = true;
      }
      orderedEvents.push(evt);
    }
  }

  if (zoneEvents['Yaesha']) {
    for (const evt of zoneEvents['Yaesha']) {
      if (mode === 'Campaign' && !navunAdded && evt.location.includes('The Scalding Glade')) {
        if (navun.missingItems.length > 0) orderedEvents.push(navun);
        navunAdded = true;
      }
      orderedEvents.push(evt);
    }
  }

  if (zoneEvents['Reisum']) {
    for (const evt of zoneEvents['Reisum']) {
      orderedEvents.push(evt);
    }
  }

  if (mode === 'Campaign') {
    if (ward17.missingItems.length > 0) orderedEvents.push(ward17);
  } else if (mode === 'Subject2923') {
    const harsgaard = makeFixedEvent('Ward17Root', 'Harsgaard', 'Earth: Ward 17 (Root Dimension)', 'World Boss');
    orderedEvents.push(harsgaard);
  }

  return orderedEvents;
}

export function parseProfileSav(profileText: string): RemnantCharacter[] {
  const characters: RemnantCharacter[] = [];
  const charMarker = '/Game/Characters/Player/Base/Character_Master_Player.Character_Master_Player_C';
  const charBlocks = profileText.split(charMarker);

  for (let i = 1; i < charBlocks.length; i++) {
    let archetype = gameData.archetypes['Undefined'] || 'Undefined';
    const prevBlock = charBlocks[i - 1];
    const archMatch = prevBlock.match(/\/Game\/_Core\/Archetypes\/([a-zA-Z_]+)/);

    if (archMatch) {
      const archKey = archMatch[1].split('_')[1] || archMatch[1];
      archetype = gameData.archetypes[archKey] || archKey;
    }

    const currentBlock = charBlocks[i];
    const charEndIdx = currentBlock.indexOf('Character_Master_Player_C');
    const inventoryText = charEndIdx !== -1 ? currentBlock.substring(0, charEndIdx) : currentBlock;

    const inventoryItems = new Set<string>();
    const patterns = [
      /\/Items\/Weapons(?:\/[a-zA-Z0-9_]+)+\/[a-zA-Z0-9_]+/g,
      /\/Items\/Armor\/(?:[a-zA-Z0-9_]+\/)?[a-zA-Z0-9_]+/g,
      /\/Items\/Trinkets\/(?:BandsOfCastorAndPollux\/)?[a-zA-Z0-9_]+/g,
      /\/Items\/Mods\/[a-zA-Z0-9_]+/g,
      /\/Items\/Traits\/[a-zA-Z0-9_]+/g,
      /\/Items\/QuestItems(?:\/[a-zA-Z0-9_]+)+\/[a-zA-Z0-9_]+/g,
      /\/Quests\/[a-zA-Z0-9_]+\/[a-zA-Z0-9_]+/g,
      /\/Player\/Emotes\/Emote_[a-zA-Z0-9]+/g,
    ];

    for (const pat of patterns) {
      let m: RegExpExecArray | null;
      while ((m = pat.exec(inventoryText)) !== null) {
        inventoryItems.add(m[0]);
      }
    }

    const missingItems = gameData.allItems.filter(item => !inventoryItems.has(item.key));

    characters.push({
      id: i - 1,
      archetype,
      inventory: Array.from(inventoryItems),
      campaignEvents: [],
      adventureEvents: [],
      missingItems,
      hasAdventureData: false,
    });
  }

  return characters;
}

export function parseWorldSave(savetext: string, character: RemnantCharacter): {
  campaignEvents: RemnantWorldEvent[];
  adventureEvents: RemnantWorldEvent[];
  hasAdventureData: boolean;
  adventureZone: string | null;
  campaignDifficulty: string | null;
  adventureDifficulty: string | null;
} {
  const inventorySet = new Set(character.inventory);
  let campaignEvents: RemnantWorldEvent[] = [];
  let adventureEvents: RemnantWorldEvent[] = [];
  let hasAdventureData = false;
  let adventureZoneName: string | null = null;
  let campaignDifficulty: string | null = null;
  let adventureDifficulty: string | null = null;

  // Detect Difficulty from save header
  const bpIdx = savetext.indexOf('BP_RemnantSaveGame');
  if (bpIdx !== -1) {
    const headerBlock = savetext.substring(bpIdx, bpIdx + 1000);
    const diffMatch = headerBlock.match(/\x00(Normal|Hard|Nightmare|Apocalypse)\x00/);
    if (diffMatch) {
      if (headerBlock.includes('Quest_AdventureMode') || headerBlock.includes('Adventure')) {
        adventureDifficulty = diffMatch[1];
      } else {
        campaignDifficulty = diffMatch[1];
      }
    }
  }

  // 1. Campaign Main
  const strCampaignEnd = '/Game/Campaign_Main/Quest_Campaign_Main.Quest_Campaign_Main_C';
  const strCampaignStart = '/Game/Campaign_Main/Quest_Campaign_City.Quest_Campaign_City';
  let cEnd = savetext.indexOf(strCampaignEnd);
  let cStart = savetext.indexOf(strCampaignStart);

  if (cStart !== -1 && cEnd !== -1) {
    let campaignText = savetext.substring(0, cEnd);
    cStart = campaignText.lastIndexOf(strCampaignStart);
    campaignText = campaignText.substring(cStart);
    campaignEvents = processEvents(campaignText, 'Campaign', inventorySet);
  } else {
    // 2. Subject 2923 Campaign
    const strClemEnd = '/Game/Campaign_Clementine/Quest_Campaign_Clementine.Quest_Campaign_Clementine_C';
    const strClemStart = '/Game/World_Rural/Templates/Template_Rural_Overworld_0';
    cEnd = savetext.indexOf(strClemEnd);
    cStart = savetext.indexOf(strClemStart);
    if (cStart !== -1 && cEnd !== -1) {
      let campaignText = savetext.substring(0, cEnd);
      cStart = campaignText.lastIndexOf(strClemStart);
      campaignText = campaignText.substring(cStart);
      campaignEvents = processEvents(campaignText, 'Subject2923', inventorySet);
    }
  }

  // If campaign events were parsed and difficulty wasn't explicitly set, default to Normal
  if (campaignEvents.length > 0 && !campaignDifficulty) {
    campaignDifficulty = 'Normal';
  }

  // 3. Adventure mode
  if (savetext.includes('Quest_AdventureMode_')) {
    let advZone: string | null = null;
    if (savetext.includes('Quest_AdventureMode_City_C')) advZone = 'City';
    else if (savetext.includes('Quest_AdventureMode_Wasteland_C')) advZone = 'Wasteland';
    else if (savetext.includes('Quest_AdventureMode_Swamp_C')) advZone = 'Swamp';
    else if (savetext.includes('Quest_AdventureMode_Jungle_C')) advZone = 'Jungle';
    else if (savetext.includes('Quest_AdventureMode_Snow_C')) advZone = 'Snow';

    if (advZone) {
      hasAdventureData = true;
      adventureZoneName = advZone;
      const strAdvEnd = `/Game/World_${advZone}/Quests/Quest_AdventureMode/Quest_AdventureMode_${advZone}.Quest_AdventureMode_${advZone}_C`;
      const advEndIdx = savetext.indexOf(strAdvEnd);
      const advEnd = advEndIdx !== -1 ? advEndIdx + strAdvEnd.length : savetext.length;
      let advtext = savetext.substring(0, advEnd);
      const strAdvStart = `/Game/World_${advZone}/Quests/Quest_AdventureMode/Quest_AdventureMode_${advZone}_0`;
      const advStart = advtext.lastIndexOf(strAdvStart) + strAdvStart.length;
      advtext = advtext.substring(advStart);
      adventureEvents = processEvents(advtext, 'Adventure', inventorySet);

      // Check if difficulty is in the adventure quest block
      if (!adventureDifficulty && advEndIdx !== -1) {
        const advContext = savetext.substring(Math.max(0, advEndIdx - 2000), Math.min(savetext.length, advEndIdx + 2000));
        const advMatch = advContext.match(/\x00(Normal|Hard|Nightmare|Apocalypse)\x00/);
        if (advMatch) {
          adventureDifficulty = advMatch[1];
        }
      }

      // If adventure events were parsed and difficulty wasn't explicitly set, default to Normal
      if (adventureEvents.length > 0 && !adventureDifficulty) {
        adventureDifficulty = 'Normal';
      }
    }
  }

  return {
    campaignEvents,
    adventureEvents,
    hasAdventureData,
    adventureZone: adventureZoneName,
    campaignDifficulty,
    adventureDifficulty,
  };
}
