import CreatureDatabasePt from './json/CreatureDatabasePt.json';
import CreatureDatabaseEn from './json/CreatureDatabaseEn.json';

console.log("Iniciando Craturas")

var locale = 'pt'; // Default locale

const usePtFields = (creature) => {
  if (!creature) return creature;

  return {
    ...creature,
    displayName: creature.displayName_pt || creature.displayName,
    name: creature.name_pt || creature.name,
    subname: creature.subname_pt || creature.subname,
    subtype: creature.subtype_pt || creature.subtype,
    ability: creature.ability_pt || creature.ability,
    flavorText: creature.flavorText_pt || creature.flavorText,
    brainwashedText: creature.brainwashedText_pt || creature.brainwashedText,
    isPast: false
  }
}

export const creatureDatabaseEn = Array.isArray(CreatureDatabaseEn) ? CreatureDatabaseEn : [];

export const creatureDatabasePt = Array.isArray(CreatureDatabasePt) ? CreatureDatabasePt.map(creature => { return usePtFields(creature) }) : [];
// export const creatureDatabase = creatureDatabasePt.map(creature => { return usePtFields(creature) });

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
    setDisplay: creature.set ? creature.set.toUpperCase() : ''
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