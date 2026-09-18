import type { RemnantCharacter, RemnantWorldEvent } from '../types/remnant';
import { gameData } from './saveParser';

export function getSampleCharacter(): RemnantCharacter {
  const sampleInventory = [
    '/Items/Weapons/Basic/LongGuns/HuntingRifle/Weapon_HuntingRifle',
    '/Items/Weapons/Basic/HandGuns/SubMachineGun/Weapon_Submachinegun',
    '/Items/Weapons/Human/Melee/Sword/Weapon_Sword',
    '/Items/Armor/Hunter/Armor_Head_Hunter',
    '/Items/Armor/Hunter/Armor_Body_Hunter',
    '/Items/Armor/Hunter/Armor_Legs_Hunter',
    '/Items/Mods/MantleOfThorns',
    '/Items/Mods/HotShot',
    '/Items/Traits/Trait_ElderKnowledge',
    '/Items/Traits/Trait_Vigor',
    '/Items/Traits/Trait_Endurance',
    '/Items/Trinkets/RingOfTheAdmiral',
    '/Items/Trinkets/Trinket_GunslingersRing',
  ];

  const inventorySet = new Set(sampleInventory);

  const campaignEvents: RemnantWorldEvent[] = [
    {
      key: 'RootDragon',
      name: 'Singe',
      type: 'World Boss',
      location: 'Earth: The Ash Yard',
      possibleItems: gameData.eventItems['RootDragon'] || [],
      missingItems: (gameData.eventItems['RootDragon'] || []).filter(i => !inventorySet.has(i.key)),
    },
    {
      key: 'RootBrute',
      name: 'Gorefist',
      type: 'Miniboss',
      location: 'Earth: Sunken Passage',
      possibleItems: gameData.eventItems['RootBrute'] || [],
      missingItems: (gameData.eventItems['RootBrute'] || []).filter(i => !inventorySet.has(i.key)),
    },
    {
      key: 'RootMother',
      name: 'Root Mother',
      type: 'Siege',
      location: 'Earth: Chapel Station: Church of the Harbinger',
      possibleItems: gameData.eventItems['RootMother'] || [],
      missingItems: (gameData.eventItems['RootMother'] || []).filter(i => !inventorySet.has(i.key)),
    },
    {
      key: 'WastelandGuardian',
      name: 'Claviger',
      type: 'World Boss',
      location: 'Rhom: Loom of the Black Sun',
      possibleItems: gameData.eventItems['WastelandGuardian'] || [],
      missingItems: (gameData.eventItems['WastelandGuardian'] || []).filter(i => !inventorySet.has(i.key)),
    },
    {
      key: 'OldManAndConstruct',
      name: 'Wud & Ancient Construct',
      type: 'Point of Interest',
      location: 'Rhom: The Eastern Wind',
      possibleItems: gameData.eventItems['OldManAndConstruct'] || [],
      missingItems: (gameData.eventItems['OldManAndConstruct'] || []).filter(i => !inventorySet.has(i.key)),
    },
    {
      key: 'Fatty',
      name: 'The Unclean One',
      type: 'World Boss',
      location: 'Corsus: The Fetid Glade',
      possibleItems: gameData.eventItems['Fatty'] || [],
      missingItems: (gameData.eventItems['Fatty'] || []).filter(i => !inventorySet.has(i.key)),
    },
    {
      key: 'Wolf',
      name: 'The Ravager',
      type: 'World Boss',
      location: "Yaesha: The Ravager's Haunt",
      possibleItems: gameData.eventItems['Wolf'] || [],
      missingItems: (gameData.eventItems['Wolf'] || []).filter(i => !inventorySet.has(i.key)),
    },
  ];

  const adventureEvents: RemnantWorldEvent[] = [
    {
      key: 'Splitter',
      name: 'Riphide',
      type: 'Miniboss',
      location: 'Earth: Research Station Alpha',
      possibleItems: gameData.eventItems['Splitter'] || [],
      missingItems: (gameData.eventItems['Splitter'] || []).filter(i => !inventorySet.has(i.key)),
    },
    {
      key: 'LizAndLiz',
      name: "Tale of Two Liz's",
      type: 'Siege',
      location: 'Earth: The Warren',
      possibleItems: gameData.eventItems['LizAndLiz'] || [],
      missingItems: (gameData.eventItems['LizAndLiz'] || []).filter(i => !inventorySet.has(i.key)),
    },
    {
      key: 'RootEnt',
      name: 'The Ent',
      type: 'World Boss',
      location: 'Earth: The Choking Hollow',
      possibleItems: gameData.eventItems['RootEnt'] || [],
      missingItems: (gameData.eventItems['RootEnt'] || []).filter(i => !inventorySet.has(i.key)),
    },
  ];

  const missingItems = gameData.allItems.filter(i => !inventorySet.has(i.key));

  return {
    id: 0,
    archetype: 'Hunter',
    inventory: sampleInventory,
    campaignEvents,
    adventureEvents,
    missingItems,
    hasAdventureData: true,
  };
}
