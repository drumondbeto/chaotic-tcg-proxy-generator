// This file was automatically generated from Excel data
// src/components/BattlegearDatabase.js


// import BattlegearDatabasePt from './json/BattlegearDatabasePt.json';
import BattlegearDatabaseEn from './json/BattlegearDatabaseEn.json';
import BattlegearDatabasePt from './json/BattlegearDatabasePt.json';

var locale = 'pt'; // Default locale

const setLocale = (newLocale) => {
  locale = newLocale;
  updateBattlegearDatabase();
};

const updateBattlegearDatabase = () => {
  if (locale === 'pt') {
    battlegearDatabase = BattlegearDatabasePt.map(battlegear => { return usePtFields(battlegear) });
  } else {
    battlegearDatabase = BattlegearDatabaseEn.map(battlegear => { return useEnFields(battlegear) });
  }
};

const usePtFields = (battlegear) => {
  if (!battlegear) return battlegear;

  return {
    ...battlegear,

    displayName: battlegear.displayName_pt || battlegear.displayName,
    displayName_pt: battlegear.displayName_pt,
    displayName_en: battlegear.displayName,

    name: battlegear.name_pt || battlegear.name,
    name_pt: battlegear.name_pt,
    name_en: battlegear.name,

    subname: battlegear.subname_pt || battlegear.subname,
    subname_pt: battlegear.subname_pt,
    subname_en: battlegear.subname,

    subtype: battlegear.subtype_pt || battlegear.subtype,
    subtype_pt: battlegear.subtype_pt,
    subtype_en: battlegear.subtype,
    
    ability: battlegear.ability_pt || battlegear.ability,
    ability_pt: battlegear.ability_pt,
    ability_en: battlegear.ability,

    flavorText: battlegear.flavorText_pt || battlegear.flavorText,
    flavorText_pt: battlegear.flavorText_pt,
    flavorText_en: battlegear.flavorText,

    loyalRestriction: battlegear.loyalRestriction_pt || battlegear.loyalRestriction,
    loyalRestriction_pt: battlegear.loyalRestriction_pt,
    loyalRestriction_en: battlegear.loyalRestriction,
  }
}

const useEnFields = (battlegear) => {
  if (!battlegear) return battlegear;

  return {
    ...battlegear,
    displayName: battlegear.displayName_en,
    name: battlegear.name_en,
    subname: battlegear.subname_en,
    ability: battlegear.ability_en,
    flavorText: battlegear.flavorText_en,
    loyalRestriction: battlegear.loyalRestriction_en
  }
}

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

// Pre-populated battlegear database
export var battlegearDatabase = BattlegearDatabasePt.map(battlegear => { return usePtFields(battlegear) });

// Helper functions to work with the database
export const getBattlegearById = (idOrKey, locale = 'pt') => {
  setLocale(locale);
  // First try direct ID lookup for backward compatibility
  const directMatch = battlegearDatabase.find(battlegear => battlegear.id === idOrKey);
  if (directMatch) return directMatch;
  
  // Next try uniqueId match
  const uniqueMatch = battlegearDatabase.find(battlegear => battlegear.uniqueId === idOrKey);
  if (uniqueMatch) return uniqueMatch;
  
  // If not found, check if it's a composite key
  if (idOrKey.includes('__')) {
    const [name, set] = idOrKey.split('__');
    return battlegearDatabase.find(battlegear => 
      battlegear.name === name && battlegear.set === set
    );
  }
  
  return null;
};

export const getAllBattlegearNames = (locale = 'pt') => {
  setLocale(locale);
  return battlegearDatabase.map(battlegear => ({
    id: battlegear.uniqueId || createUniqueCardKey(battlegear), // Use the composite key here
    displayName: battlegear.displayName || battlegear.name || '',
    name: battlegear.displayName || battlegear.name || '',
    subname: battlegear.subname || '',
    set: battlegear.set || '',
    setDisplay: battlegear.set ? battlegear.set.toUpperCase() : '',
    unique: battlegear.unique || false,
    legendary: battlegear.legendary || false,
    loyal: battlegear.loyal || false,
    // Keep the original ID for reference
    originalId: battlegear.id
  }));
};
