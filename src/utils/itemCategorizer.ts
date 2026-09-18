import type { RemnantItem } from '../types/remnant';
import { gameData } from './saveParser';

export interface CategoryProgress {
  id: string;
  name: string;
  icon: string;
  owned: number;
  total: number;
  percent: number;
}

export function isRing(item: RemnantItem): boolean {
  if (item.type !== 'Trinket') return false;
  const n = item.name.toLowerCase();
  const k = item.key.toLowerCase();
  return (
    n.includes('ring') ||
    n.includes('band') ||
    n.includes('loop') ||
    n.includes('signet') ||
    n.includes('coil') ||
    n.includes('cord') ||
    k.includes('ring') ||
    k.includes('band') ||
    k.includes('loop')
  );
}

export function isAmulet(item: RemnantItem): boolean {
  if (item.type !== 'Trinket') return false;
  return !isRing(item);
}

export function getChecklistCategories(inventory: string[]): CategoryProgress[] {
  const inventorySet = new Set(inventory);
  const allItems = gameData.allItems;

  const categories = [
    {
      id: 'weapons',
      name: 'Weapons',
      icon: 'crisis_alert',
      filter: (i: RemnantItem) => i.type === 'Weapon',
    },
    {
      id: 'armor',
      name: 'Armor',
      icon: 'shield',
      filter: (i: RemnantItem) => i.type === 'Armor',
    },
    {
      id: 'rings',
      name: 'Rings',
      icon: 'radio_button_checked',
      filter: (i: RemnantItem) => isRing(i),
    },
    {
      id: 'amulets',
      name: 'Amulets',
      icon: 'token',
      filter: (i: RemnantItem) => isAmulet(i),
    },
    {
      id: 'mods',
      name: 'Mods',
      icon: 'auto_fix_high',
      filter: (i: RemnantItem) => i.type === 'Mod',
    },
    {
      id: 'traits',
      name: 'Traits',
      icon: 'psychology',
      filter: (i: RemnantItem) => i.type === 'Trait',
    },
  ];

  return categories.map(cat => {
    const itemsInCat = allItems.filter(cat.filter);
    const total = itemsInCat.length;
    const owned = itemsInCat.filter(i => inventorySet.has(i.key)).length;
    const percent = total > 0 ? Math.round((owned / total) * 100) : 0;

    return {
      id: cat.id,
      name: cat.name,
      icon: cat.icon,
      owned,
      total,
      percent,
    };
  });
}
