import CreatureDatabasePt from './json/CreatureDatabasePt.json';
import CreatureDatabaseEn from './json/CreatureDatabaseEn.json';
import CreatureAltArtDatabase from './json/CreatureAltArtDatabase.json';

console.log("Iniciando Craturas")

var locale = 'pt'; // Default locale

const usePtFields = (creature) => {
  if (!creature) return creature;

  return {
    ...creature,

    displayName: creature.displayName_pt || creature.displayName,
    displayName_pt: creature.displayName_pt,
    displayName_en: creature.displayName,

    name: creature.name_pt || creature.name,
    name_pt: creature.name_pt,
    name_en: creature.name,

    subname: creature.subname_pt || creature.subname,
    subname_pt: creature.subname_pt,
    subname_en: creature.subname,

    subtype: creature.subtype_pt || creature.subtype,
    subtype_pt: creature.subtype_pt,
    subtype_en: creature.subtype,

    ability: creature.ability_pt || creature.ability,
    ability_pt: creature.ability_pt,
    ability_en: creature.ability,

    flavorText: creature.flavorText_pt || creature.flavorText,
    flavorText_pt: creature.flavorText_pt,
    flavorText_en: creature.flavorText,

    brainwashedText: creature.brainwashedText_pt || creature.brainwashedText,
    brainwashedText_pt: creature.brainwashedText_pt,
    brainwashedText_en: creature.brainwashedText,

    isPast: false,
    artList: creatureAltArtDatabase.filter(alt => alt.id === creature.id) || []
  }
}

const useEnFields = (creature) => {
  if (!creature) return creature;

  return {
    ...creature,

    displayName: creature.displayName,
    displayName_pt: creature.displayName_pt,
    displayName_en: creature.displayName,

    name: creature.name,
    name_pt: creature.name_pt,
    name_en: creature.name,

    subname: creature.subname,
    subname_pt: creature.subname_pt,
    subname_en: creature.subname,

    subtype: creature.subtype,
    subtype_pt: creature.subtype_pt,
    subtype_en: creature.subtype,

    ability: creature.ability,
    ability_pt: creature.ability_pt,
    ability_en: creature.ability,

    flavorText: creature.flavorText,
    flavorText_pt: creature.flavorText_pt,
    flavorText_en: creature.flavorText,

    brainwashedText: creature.brainwashedText,
    brainwashedText_pt: creature.brainwashedText_pt,
    brainwashedText_en: creature.brainwashedText,
    
    isPast: false,
    artList: creatureAltArtDatabase.filter(alt => alt.id === creature.id) || []
  }
}

export const creatureAltArtDatabase = Array.isArray(CreatureAltArtDatabase) ? CreatureAltArtDatabase : [];
export const creatureDatabasePt = Array.isArray(CreatureDatabasePt) ? CreatureDatabasePt.map(creature => { return usePtFields(creature) }) : [];
export const creatureDatabaseEn = Array.isArray(CreatureDatabaseEn) ? CreatureDatabaseEn.map(creature => { return useEnFields(creature) }) : [];

export var creatureDatabase = locale === 'pt' ? creatureDatabasePt : creatureDatabaseEn;

export const getAllCreatureNames = (locale = 'pt') => {
  setLocale(locale);
  return creatureDatabase.map(creature => {
    return {
    id: creature.id,
    displayName: creature.displayName,
    tribe: creature.tribe,
    isPast: creature.isPast,
    set: creature.set || '',
    setDisplay: creature.set ? creature.set.toUpperCase() : '',
    artList: creatureAltArtDatabase.filter(alt => alt.id === creature.id) || []
  }});
};


export const getCreatureById = (idOrKey, locale = 'pt') => {
  setLocale(locale);
  // First try direct ID lookup for backward compatibility
  const directMatch = creatureDatabase.find(creature => creature.id === idOrKey);
  if (directMatch) return directMatch;
  
  // Next try uniqueId match
  const uniqueMatch = creatureDatabase.find(creature => creature.uniqueId === idOrKey);
  if (uniqueMatch) return uniqueMatch;
  
  // If not found, check if it's a composite key
  if (idOrKey.includes('__')) {
    const [name, set] = idOrKey.split('__');
    const found = creatureDatabase.find(creature => 
      creature.name === name && creature.set === set
    );
    return found;
  }
  
  return null;
};

export const getLocalizedCreatureDatabase = (locale = 'pt') => {
  setLocale(locale);
  return creatureDatabase.slice();
  // if (!Array.isArray(creatureDatabase)) return [];
  // if (locale === 'pt') {
  //   return creatureDatabase.map(cre => mergeWithPtBr(cre));
  // }
  // return creatureDatabase.slice();
};

export const setLocale = (newLocale) => {
  locale = newLocale;
  updateCreatureDatabase();
};

const updateCreatureDatabase = () => {
  if (locale === 'pt') {
    creatureDatabase = creatureDatabasePt;
  } else {
    creatureDatabase = creatureDatabaseEn;
  }
}