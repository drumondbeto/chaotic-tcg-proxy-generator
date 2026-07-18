// This file was automatically generated from Excel data
// src/components/MugicDatabase.js

// import MugicDatabaseEn from './json/MugicDatabaseEn.json';
import MugicDatabasePt from './json/MugicDatabasePt.json';

var locale = 'pt'; // Default locale

const setLocale = (newLocale) => {
  locale = newLocale;
  updateMugicDatabase();
};

const updateMugicDatabase = () => {
  if (locale === 'pt') {
    mugicDatabase = MugicDatabasePt.map(mugic => { return usePtFields(mugic) });
  } else {
    mugicDatabase = MugicDatabasePt.map(mugic => { return useEnFields(mugic) });
  }
}

const usePtFields = (mugic) => {
  if (!mugic) return mugic;

  return {
    ...mugic,

    displayName: mugic.displayName_pt || mugic.displayName,
    displayName_pt: mugic.displayName_pt,
    displayName_en: mugic.displayName,

    name: mugic.name_pt || mugic.name,
    name_pt: mugic.name_pt,
    name_en: mugic.name,

    subname: mugic.subname_pt || mugic.subname,
    subname_pt: mugic.subname_pt,
    subname_en: mugic.subname,

    tribe: mugic.tribe_pt || mugic.tribe,
    tribe_pt: mugic.tribe_pt,
    tribe_en: mugic.tribe,

    ability: mugic.ability_pt || mugic.ability,
    ability_pt: mugic.ability_pt,
    ability_en: mugic.ability,

    flavorText: mugic.flavorText_pt || mugic.flavorText,
    flavorText_pt: mugic.flavorText_pt,
    flavorText_en: mugic.flavorText
  }
}

const useEnFields = (mugic) => {
  if (!mugic) return mugic;

  return {
    ...mugic,

    displayName: mugic.displayName_en,

    name: mugic.name_en,

    subname: mugic.subname_en,

    tribe: mugic.tribe_en,

    ability: mugic.ability_en,

    flavorText: mugic.flavorText_en
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

// Pre-populated mugic database
export var mugicDatabase = MugicDatabasePt.map(mugic => { return usePtFields(mugic) });

// Helper functions to work with the database
export const getMugicById = (idOrKey, locale = 'pt') => {
  setLocale(locale);
  // First try direct ID lookup for backward compatibility
  const directMatch = mugicDatabase.find(mugic => mugic.id === idOrKey);
  if (directMatch) return directMatch;
  
  // Next try uniqueId match
  const uniqueMatch = mugicDatabase.find(mugic => mugic.uniqueId === idOrKey);
  if (uniqueMatch) return uniqueMatch;
  
  // If not found, check if it's a composite key
  if (idOrKey.includes('__')) {
    const [name, set] = idOrKey.split('__');
    return mugicDatabase.find(mugic => 
      mugic.name === name && mugic.set === set
    );
  }
  
  return null;
};

export const getAllMugicNames = (locale = 'pt') => {
  setLocale(locale);
  return mugicDatabase.map(mugic => ({
    id: mugic.uniqueId || createUniqueCardKey(mugic), // Use the composite key here
    name: mugic.displayName || mugic.name,
    set: mugic.set || '',
    setDisplay: mugic.set ? mugic.set.toUpperCase() : '',
    tribe: mugic.tribe || 'generic',
    unique: mugic.unique || false,
    mugicCost: mugic.mugicCost || 0,
    // Keep the original ID for reference
    originalId: mugic.id
  }));
};
