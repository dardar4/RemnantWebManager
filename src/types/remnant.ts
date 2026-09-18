export type ItemMode = 'normal' | 'hardcore' | 'survival';
export type ItemType = 'Weapon' | 'Armor' | 'Trinket' | 'Mod' | 'Trait' | 'Emote' | 'Uncategorized';

export interface RemnantItem {
  key: string;
  name: string;
  type: ItemType;
  mode: ItemMode;
  notes?: string;
  altname?: string;
  dlc?: string;
  eventName?: string;
}

export interface RemnantWorldEvent {
  key: string;
  name: string;
  type: string;
  location: string;
  possibleItems: RemnantItem[];
  missingItems: RemnantItem[];
}

export interface RemnantCharacter {
  id: number;
  archetype: string;
  inventory: string[];
  campaignEvents: RemnantWorldEvent[];
  adventureEvents: RemnantWorldEvent[];
  missingItems: RemnantItem[];
  hasAdventureData: boolean;
  adventureZone?: string | null;
  campaignDifficulty?: string | null;
  adventureDifficulty?: string | null;
}

export interface GameData {
  version: string;
  archetypes: Record<string, string>;
  zones: Record<string, string>;
  subLocations: Record<string, string>;
  mainLocations: Record<string, string>;
  events: Record<string, string>;
  eventItems: Record<string, RemnantItem[]>;
  allItems: RemnantItem[];
}
