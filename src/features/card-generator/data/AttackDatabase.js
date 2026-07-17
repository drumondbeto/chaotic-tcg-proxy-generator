// This file was automatically generated from Excel data
// src/components/AttackDatabase.js
import AttackDatabasePt from './json/AttackDatabasePt.json';
// import AttackDatabaseEn from './json/AttackDatabaseEn.json';

var locale = 'pt'; // Default locale

const setLocale = (newLocale) => {
  locale = newLocale;
  updateAttackDatabase();
};

const updateAttackDatabase = () => {
  if (locale === 'pt') {
    attackDatabase = attackDatabase.map(attack => { return usePtFields(attack) });
  } else {
    attackDatabase = attackDatabase.map(attack => { return useEnFields(attack) });
  }
}
const usePtFields = (attack) => {
  if (!attack) return attack;

  return {
    ...attack,

    displayName: attack.displayName_pt || attack.displayName,
    displayName_pt: attack.displayName_pt,
    displayName_en: attack.displayName,

    name: attack.name_pt || attack.name,
    name_pt: attack.name_pt,
    name_en: attack.name,

    subname: attack.subname_pt || attack.subname,
    subname_pt: attack.subname_pt,
    subname_en: attack.subname,

    ability: attack.ability_pt || attack.ability,
    ability_pt: attack.ability_pt,
    ability_en: attack.ability,

    flavorText: attack.flavorText_pt || attack.flavorText,
    flavorText_pt: attack.flavorText_pt,
    flavorText_en: attack.flavorText,
  }
};

const useEnFields = (attack) => {
  if (!attack) return attack;
  
  return {
    ...attack,
    displayName: attack.displayName_en,
    name: attack.name_en,
    subname: attack.subname_en,
    ability: attack.ability_en,
    flavorText: attack.flavorText_en,
  }
};

// const attackDatabasePt = Array.isArray(AttackDatabasePt) ? AttackDatabasePt.map(attack => { return usePtFields(attack) }) : [];
// const attackDatabaseEn = Array.isArray(AttackDatabaseEn) ? AttackDatabaseEn.map(attack => { return useEnFields(attack) }) : [];

// Helper function for creating unique card keys
function createUniqueCardKey(card) {
  // Combine name and set for a unique identifier
  // For backward compatibility, return the ID if it's already globally unique
  if (card.id && card.id.includes('-')) {
    return card.id;
  }
  
  // If already has a uniqueId, use it
  if (card.uniqueId) {
    return card.uniqueId;
  }
  
  // Otherwise create a composite key using name and set
  return `${card.name}__${card.set || 'unknown'}`;
}

// Pre-populated attack database
export var attackDatabase = AttackDatabasePt.map(attack => { return usePtFields(attack) });

// Helper functions to work with the database
export const getAttackById = (idOrKey, locale = 'pt') => {
  setLocale(locale);
  // First try direct ID lookup for backward compatibility
  const directMatch = attackDatabase.find(attack => attack.id === idOrKey);
  if (directMatch) return directMatch;
  
  // Next try uniqueId match
  const uniqueMatch = attackDatabase.find(attack => attack.uniqueId === idOrKey);
  if (uniqueMatch) return uniqueMatch;
  
  // If not found, check if it's a composite key
  if (idOrKey.includes('__')) {
    const [name, set] = idOrKey.split('__');
    return attackDatabase.find(attack => 
      attack.name === name && attack.set === set
    );
  }
  
  return null;
};

export const getAllAttackNames = (locale = 'pt') => {
  setLocale(locale);
  return attackDatabase.map(attack => ({
    id: attack.uniqueId || createUniqueCardKey(attack), // Use the composite key here
    name: attack.displayName || attack.name || '',
    set: attack.set || '',
    setDisplay: attack.set ? attack.set.toUpperCase() : '',
    fire: attack.fire !== undefined ? attack.fire : null,
    air: attack.air !== undefined ? attack.air : null,
    earth: attack.earth !== undefined ? attack.earth : null,
    water: attack.water !== undefined ? attack.water : null,
    bp: attack.bp || 0,
    // Keep the original ID for reference
    originalId: attack.id
  }));
};
