// Helper adapters for batch generation
import { locationDatabase, getLocalizedLocationDatabase } from '../data/LocationDatabase';
import { creatureDatabase, getLocalizedCreatureDatabase } from '../data/CreatureDatabase';
import { attackDatabase } from '../data/AttackDatabase';  
import { battlegearDatabase } from '../data/BattlegearDatabase';
import { mugicDatabase } from '../data/MugicDatabase';

function createUniqueCardKey(card) {
  if (card.uniqueId) return card.uniqueId;
  if (card.id && String(card.id).includes('-')) return String(card.id);
  return `${card.name || 'unknown'}__${card.set || 'unknown'}`;
}

function toAttackElements(card) {
  if (card.elements) {
    return {
      fire: card.elements.fire !== undefined ? card.elements.fire : null,
      air: card.elements.air !== undefined ? card.elements.air : null,
      earth: card.elements.earth !== undefined ? card.elements.earth : null,
      water: card.elements.water !== undefined ? card.elements.water : null
    };
  }

  return {
    fire: card.fire !== undefined ? card.fire : null,
    air: card.air !== undefined ? card.air : null,
    earth: card.earth !== undefined ? card.earth : null,
    water: card.water !== undefined ? card.water : null
  };
}

export function convertCreatureToBatchEntry(creature) {
  return {
    name: creature.name || '',
    subname: creature.subname || '',
    type: 'creature',
    tribe: creature.tribe || '',
    subtype: creature.subtype || '',
    imageUrl: creature.imageUrl || '',
    set: creature.set || '',
    rarity: creature.rarity || '',
    ability: creature.ability || '',
    flavorText: creature.flavorText || '',
    unique: !!creature.unique,
    legendary: !!creature.legendary,
    artist: creature.artist || '',
    loyal: !!creature.loyal,
    loyalRestriction: creature.loyalRestriction || '',
    initiative: creature.initiative || '',
    stats: creature.stats || null,
    elements: creature.elements || {
      fire: 0,
      air: 0,
      earth: 0,
      water: 0
    },
    brainwashed: !!creature.brainwashed,
    brainwashedText: creature.brainwashedText || '',
    isPast: !!creature.isPast,
    serialNumber: creature.serialNumber || creature.id || '',
    id: creature.id || '',
    uniqueId: creature.uniqueId || createUniqueCardKey(creature),
    isFromDatabase: true,
    showArtist: true
  };
}

export function convertAttackToBatchEntry(attack) {
  return {
    name: attack.name || '',
    subname: attack.subname || '',
    type: 'attack',
    tribe: '',
    imageUrl: attack.imageUrl || '',
    set: attack.set || '',
    rarity: attack.rarity || '',
    ability: attack.ability || '',
    flavorText: attack.flavorText || '',
    unique: !!attack.unique,
    artist: attack.artist || '',
    elements: toAttackElements(attack),
    buildPoints: attack.buildPoints ?? attack.bp ?? 0,
    base: attack.base ?? 0,
    serialNumber: attack.serialNumber || attack.id || '',
    id: attack.id || '',
    uniqueId: attack.uniqueId || createUniqueCardKey(attack),
    isFromDatabase: true,
    showArtist: true
  };
}

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
    subtype: loc.type || '',
    imageUrl: loc.imageUrl || '',
    initiative: loc.initiative || loc.initiative_PtBr || '',
    set: loc.set || '',
    rarity: loc.rarity || '',
    ability: loc.ability || '',
    flavorText: loc.flavorText || '',
    unique: !!loc.unique,
    artist: loc.artist || '',
    serialNumber: loc.id || loc.uniqueId || '',
    id: loc.id || '',
    uniqueId: loc.uniqueId || createUniqueCardKey(loc),
    isFromDatabase: true,
    // Keep other fields tolerant for CardCreator
    showArtist: true
  };
}

export function convertBattlegearToBatchEntry(gear) {
  return {
    name: gear.name || '',
    subname: gear.subname || '',
    type: 'battlegear',
    subtype: gear.subtype || '',
    tribe: '',
    imageUrl: gear.imageUrl || '',
    set: gear.set || '',
    rarity: gear.rarity || '',
    ability: gear.ability || '',
    flavorText: gear.flavorText || '',
    unique: !!gear.unique,
    legendary: !!gear.legendary,
    loyal: !!gear.loyal,
    loyalRestriction: gear.loyalRestriction || '',
    artist: gear.artist || '',
    serialNumber: gear.serialNumber || gear.id || '',
    id: gear.id || '',
    uniqueId: gear.uniqueId || createUniqueCardKey(gear),
    isFromDatabase: true,
    showArtist: true
  };
}

export function convertMugicToBatchEntry(mugic) {
  return {
    name: mugic.name || '',
    subname: mugic.subname || '',
    type: 'mugic',
    tribe: mugic.tribe || 'generic',
    imageUrl: mugic.imageUrl || '',
    set: mugic.set || '',
    rarity: mugic.rarity || '',
    ability: mugic.ability || '',
    flavorText: mugic.flavorText || '',
    unique: !!mugic.unique,
    artist: mugic.artist || '',
    mugicCost: mugic.mugicCost ?? 0,
    mugicNotes: Array.isArray(mugic.mugicNotes) ? mugic.mugicNotes : [],
    serialNumber: mugic.serialNumber || mugic.id || '',
    id: mugic.id || '',
    uniqueId: mugic.uniqueId || createUniqueCardKey(mugic),
    isFromDatabase: true,
    showArtist: true
  };
}

export function getAllLocations(locale = 'pt') {
  if (!Array.isArray(locationDatabase)) return [];

  if (locale === 'pt') {
    return getLocalizedLocationDatabase(locale).map(convertLocationToBatchEntry);
  }
  return locationDatabase.map(convertLocationToBatchEntry);
}

export function getAllCreatures(locale = 'pt') {
  if (!Array.isArray(creatureDatabase)) return [];

  if (locale === 'pt') {
    return getLocalizedCreatureDatabase(locale).map(convertCreatureToBatchEntry);
  }
  return creatureDatabase.map(convertCreatureToBatchEntry);
}

export function getAllAttacks(locale = 'pt') {
  return Array.isArray(attackDatabase) ? attackDatabase.map(convertAttackToBatchEntry) : [];
}

export function getAllBattlegear(locale = 'pt') {
  return Array.isArray(battlegearDatabase) ? battlegearDatabase.map(convertBattlegearToBatchEntry) : [];
}

export function getAllMugic(locale = 'pt') {
  return Array.isArray(mugicDatabase) ? mugicDatabase.map(convertMugicToBatchEntry) : [];
}

export function filterCreaturesByTribe(creatures, tribeFilter = 'all') {
  if (!Array.isArray(creatures)) return [];
  if (!tribeFilter || tribeFilter === 'all') return creatures;

  return creatures.filter((card) => {
    const tribe = (card.tribe || '').toLowerCase();
    return tribe === tribeFilter.toLowerCase();
  });
}