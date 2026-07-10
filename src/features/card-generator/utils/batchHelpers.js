// Helper adapters for batch generation
import { locationDatabase, getLocalizedLocationDatabase } from '../data/LocationDatabase';
import { creatureDatabase, getLocalizedCreatureDatabase } from '../data/CreatureDatabase';

/**
 * Convert a location database entry into the minimal shape
 * expected by BatchCardGenerator.generateCardFromData
 */
export function convertLocationToBatchEntry(loc) {
  return {
    name: loc.name || '',
    subname: loc.subname || '',
    tribe: '',
    type: 'location',
    subtype: loc.subtype || '',
    imageUrl: loc.imageUrl || '',
    initiative: loc.initiative || loc.initiative_PtBr || '',
    set: loc.set || '',
    rarity: loc.rarity || '',
    ability: loc.ability || '',
    flavorText: loc.flavorText || '',
    unique: !!loc.unique,
    artist: loc.artist || '',
    serialNumber: loc.id || loc.uniqueId || '',
    uniqueId: loc.uniqueId || createUniqueCardKey(loc),
    isFromDatabase: true,
    // Keep other fields tolerant for CardCreator
    showArtist: true
  };
}

function createUniqueCardKey(card) {
  if (card.uniqueId) return card.uniqueId;
  if (card.id && card.id.includes('-')) return card.id;
  return `${card.name}__${card.set || 'unknown'}`;
}

export function getAllLocations(locale = 'pt') {
  if (!Array.isArray(locationDatabase)) return [];

  if (locale === 'pt') {
    return getLocalizedLocationDatabase(locale);
  }
  return locationDatabase;
}

export function getAllCreatures(locale = 'pt') {
  if (!Array.isArray(creatureDatabase)) return [];

  if (locale === 'pt') {
    return getLocalizedCreatureDatabase(locale);
  }
  return creatureDatabase;
}

export function filterCreaturesByTribe(creatures, tribeFilter = 'all') {
  if (!Array.isArray(creatures)) return [];
  if (!tribeFilter || tribeFilter === 'all') return creatures;

  return creatures.filter((card) => {
    const tribe = (card.tribe || '').toLowerCase();
    return tribe === tribeFilter.toLowerCase();
  });
}