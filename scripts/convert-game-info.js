import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const xmlPath = path.resolve(__dirname, '../../RemnantWorldManager/GameInfo.xml');
const outDir = path.resolve(__dirname, '../src/data');
const outJson = path.join(outDir, 'gameData.json');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const xmlContent = fs.readFileSync(xmlPath, 'utf-8');

function formatItemName(rawKey, type, altName) {
  if (altName && altName.trim()) {
    return altName.trim();
  }
  let itemName = rawKey.substring(rawKey.lastIndexOf('/') + 1);

  if (type === 'Armor') {
    if (rawKey.includes('TwistedMask')) {
      return 'Twisted Mask (Head)';
    }
    const parts = itemName.split('_');
    if (parts.length >= 3) {
      return `${parts[2]} (${parts[1]})`;
    }
    return itemName;
  }

  itemName = itemName
    .replace('Weapon_', '')
    .replace('Root_', '')
    .replace('Wasteland_', '')
    .replace('Swamp_', '')
    .replace('Pan_', '')
    .replace('Atoll_', '')
    .replace('Mod_', '')
    .replace('Trinket_', '')
    .replace('Trait_', '')
    .replace('Quest_', '')
    .replace('Emote_', '')
    .replace('Rural_', '')
    .replace('Snow_', '');

  return itemName.replace(/([a-z])([A-Z])/g, '$1 $2').trim();
}

function getItemType(key) {
  if (key.includes('/Weapons/')) return 'Weapon';
  if (key.includes('/Armor/') || key.includes('TwistedMask')) return 'Armor';
  if (key.includes('/Trinkets/') || key.includes('BrabusPocketWatch')) return 'Trinket';
  if (key.includes('/Mods/')) return 'Mod';
  if (key.includes('/Traits/')) return 'Trait';
  if (key.includes('/Emotes/')) return 'Emote';
  return 'Uncategorized';
}

// Extract version
const versionMatch = xmlContent.match(/<GameInfo[^>]*version="([^"]+)"/);
const version = versionMatch ? versionMatch[1] : '40';

// Extract Archetypes
const archetypes = {};
const archetypeRegex = /<Archetype\s+key="([^"]+)"\s+name="([^"]+)"\s*\/>/g;
let match;
while ((match = archetypeRegex.exec(xmlContent)) !== null) {
  archetypes[match[1]] = match[2];
}

// Extract Zones
const zones = {};
const zoneRegex = /<Zone\s+key="([^"]+)"\s+name="([^"]+)"\s*\/>/g;
while ((match = zoneRegex.exec(xmlContent)) !== null) {
  zones[match[1]] = match[2];
}

// Extract SubLocations
const subLocations = {};
const subLocationRegex = /<SubLocation\s+eventName="([^"]+)"\s+location="([^"]+)"\s*\/>/g;
while ((match = subLocationRegex.exec(xmlContent)) !== null) {
  subLocations[match[1]] = match[2];
}

// Extract MainLocations
const mainLocations = {};
const mainLocationRegex = /<MainLocation\s+key="([^"]+)"\s+name="([^"]+)"\s*\/>/g;
while ((match = mainLocationRegex.exec(xmlContent)) !== null) {
  mainLocations[match[1]] = match[2];
}

// Extract EventItems
const events = {};
const eventItems = {};
const allItems = new Map();

// Match each <Event ...> ... </Event> block
const eventBlockRegex = /<Event\s+name="([^"]+)"(?:\s+altname="([^"]*)")?\s*>([\s\S]*?)<\/Event>/g;
while ((match = eventBlockRegex.exec(xmlContent)) !== null) {
  const eventName = match[1];
  const altNameRaw = match[2];
  const altName = (altNameRaw && altNameRaw.trim()) ? altNameRaw.trim() : eventName;
  const body = match[3];

  events[eventName] = altName;
  eventItems[eventName] = [];

  const itemRegex = /<Item(?:\s+([^>]*))?>([^<]+)<\/Item>/g;
  let itemMatch;
  while ((itemMatch = itemRegex.exec(body)) !== null) {
    const rawAttrs = itemMatch[1] || '';
    const itemKey = itemMatch[2].trim();

    const modeMatch = rawAttrs.match(/mode="([^"]+)"/);
    const notesMatch = rawAttrs.match(/notes="([^"]+)"/);
    const dlcMatch = rawAttrs.match(/dlc="([^"]+)"/);
    const altItemNameMatch = rawAttrs.match(/altname="([^"]+)"/);

    const mode = modeMatch ? modeMatch[1].toLowerCase() : 'normal';
    const notes = notesMatch ? notesMatch[1] : '';
    const dlc = dlcMatch ? dlcMatch[1] : '';
    const itemAltName = altItemNameMatch ? altItemNameMatch[1] : '';

    const type = getItemType(itemKey);
    const formattedName = formatItemName(itemKey, type, itemAltName);

    const itemObj = {
      key: itemKey,
      name: formattedName,
      type,
      mode,
      notes,
      dlc,
      eventName,
    };

    eventItems[eventName].push(itemObj);

    if (!allItems.has(itemKey)) {
      allItems.set(itemKey, itemObj);
    }
  }
}

const result = {
  version,
  archetypes,
  zones,
  subLocations,
  mainLocations,
  events,
  eventItems,
  allItems: Array.from(allItems.values()),
};

fs.writeFileSync(outJson, JSON.stringify(result, null, 2), 'utf-8');
console.log(`Successfully converted GameInfo.xml to ${outJson}`);
console.log(`Extracted:
- Archetypes: ${Object.keys(archetypes).length}
- Zones: ${Object.keys(zones).length}
- SubLocations: ${Object.keys(subLocations).length}
- MainLocations: ${Object.keys(mainLocations).length}
- Events: ${Object.keys(events).length}
- Unique Items: ${allItems.size}`);
