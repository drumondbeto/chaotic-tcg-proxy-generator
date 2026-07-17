// Starter Deck - Secrets of the Lost City - Danain
// Card names are readable text; they are resolved against the card
// databases at runtime via deckCardResolver (slug-based matching), so exact
// punctuation/casing does not need to match the database perfectly.

const cards = [
  { type: 'creature', name: 'Nom, Servant of Earth', quantity: 1 },
  { type: 'creature', name: 'Mhein', quantity: 1 },
  { type: 'creature', name: 'Odu-Bathax, Reservoir Reclaimer', quantity: 1 },

  { type: 'attack', name: 'Deluge of Doom', quantity: 1 },
  { type: 'attack', name: 'Clean Slide', quantity: 1 },
  { type: 'attack', name: 'Sunder Ground', quantity: 1 },
  { type: 'attack', name: 'Sleet Slide', quantity: 1 },
  { type: 'attack', name: 'Mindvoid', quantity: 1 },
  { type: 'attack', name: 'Enlightened Tenacity', quantity: 1 },
  { type: 'attack', name: 'Essential Evaporation', quantity: 1 },
  { type: 'attack', name: 'Flood Force', quantity: 1 },
  { type: 'attack', name: 'Earth Pulse', quantity: 2 },

  { type: 'location', name: "Vidav's Refectorium", quantity: 1 },
  { type: 'location', name: 'Riverlands, Abandoned Wastes', quantity: 1 },
  { type: 'location', name: 'Elmantir', quantity: 1 },
  { type: 'location', name: 'The Swartbron', quantity: 1 },
  { type: 'location', name: 'The Hive Gallery', quantity: 1 },

  { type: 'battlegear', name: 'Quranium Pendant', quantity: 1 },
  { type: 'battlegear', name: 'Double Edge', quantity: 1 },
  { type: 'battlegear', name: 'Citadel Lodestone', quantity: 1 },

  { type: 'mugic', name: 'Elemental Counterpoint', quantity: 1 },
  { type: 'mugic', name: 'Unbalancing Battlesong', quantity: 1 },
  { type: 'mugic', name: 'Anthem of Stone', quantity: 1 }
];

const secretsOfTheLostCityDanain = {
  id: 'starter-secrets-of-the-lost-city-danain',
  title: 'Secrets of the Lost City - Danain',
  cards
};

export default secretsOfTheLostCityDanain;
