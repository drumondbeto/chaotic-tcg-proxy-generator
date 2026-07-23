import LocationDatabasePt from './json/LocationDatabasePt.json';

console.log("Iniciando Localizações")

var locale = 'pt'; // Default locale

const setLocale = (newLocale) => {
  locale = newLocale;
  updateLocaleDatabase();
};

const updateLocaleDatabase = () => {
  if (locale === 'pt') {
    locationDatabase = LocationDatabasePt.map(location => usePtFields(location));
  } else {
    locationDatabase = LocationDatabasePt.map(location => useEnFields(location));
  }
};

const usePtFields = (location) => {
  if (!location) return location;

  return {
    ...location,

    displayName: location.displayName_pt || location.displayName,
    displayName_pt: location.displayName_pt,
    displayName_en: location.displayName,

    name: location.name_pt || location.name,
    name_pt: location.name_pt,
    name_en: location.name,

    subname: location.subname_pt || location.subname,
    subname_pt: location.subname_pt,
    subname_en: location.subname,

    ability: location.ability_pt || location.ability,
    ability_pt: location.ability_pt,
    ability_en: location.ability,

    flavorText: location.flavorText_pt || location.flavorText,
    flavorText_pt: location.flavorText_pt,
    flavorText_en: location.flavorText,

    initiative: location.initiative_pt || location.initiative,
    initiative_pt: location.initiative_pt,
    initiative_en: location.initiative,
    
    type: location.type_pt || location.type,
    type_pt: location.type_pt,
    type_en: location.type,
  }
}

const useEnFields = (location) => {
  if (!location) return location;

  return {
    ...location,
    displayName: location.displayName_en,
    name: location.name_en,
    subname: location.subname_en,
    ability: location.ability_en,
    flavorText: location.flavorText_en,
    initiative: location.initiative_en,
    type: location.type_en
  }
}


// Pre-populated location database
export var locationDatabase = LocationDatabasePt.map(location => usePtFields(location));


// Helper functions to work with the database
export const getLocationById = (idOrKey, locale = 'pt') => {
  setLocale(locale);
  // First try direct ID lookup for backward compatibility
  const directMatch = locationDatabase.find(location => location.id === idOrKey);
  if (directMatch) return directMatch;
  
  // Next try uniqueId match
  const uniqueMatch = locationDatabase.find(location => location.uniqueId === idOrKey);
  if (uniqueMatch) return uniqueMatch;
  
  // If not found, check if it's a composite key
  if (idOrKey.includes('__')) {
    const [name, set] = idOrKey.split('__');
    const found = locationDatabase.find(location => 
      location.name === name && location.set === set
    );
    return found;
  }
  
  return null;
};

export const getAllLocationNames = (locale = 'pt') => {
  setLocale(locale);
  return locationDatabase
          .sort((a, b) => a.name.localeCompare(b.name))
          .map(location => ({
      id: location.id, // Use the composite key here
      name: location.displayName || location.name,
      set: location.set || '',
      setDisplay: location.set ? location.set.toUpperCase() : '',
      type: location.type || '',
      unique: location.unique || false,
      initiative: location.initiative || '',
      // Keep the original ID for reference
      originalId: location.id
  }));
};

/**
 * Return the full location database, optionally localized.
 * Each entry will be passed through `mergeWithPtBr` when `locale === 'pt'`.
 */
export const getLocalizedLocationDatabase = (locale = 'pt') => {
  setLocale(locale);
  return locationDatabase
          .sort((a, b) => a.name.localeCompare(b.name))
          .slice();
};
