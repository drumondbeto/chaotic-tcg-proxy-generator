// Deck data model and small pure helpers to manipulate a deck in memory.
// A deck looks like:
// {
//   id, name, description, createdAt, updatedAt,
//   cards: [ { type, uniqueId, name, subname, set, quantity } ]
// }

export const CARD_TYPES = ['creature', 'attack', 'location', 'battlegear', 'mugic'];

function generateId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `deck-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function createEmptyDeck(name = 'Novo Deck') {
  const now = new Date().toISOString();
  return {
    id: generateId(),
    name,
    description: '',
    createdAt: now,
    updatedAt: now,
    cards: []
  };
}

export function cloneDeckAsNew(deck, name) {
  const now = new Date().toISOString();
  return {
    ...deck,
    id: generateId(),
    name: name || `${deck.name} (cópia)`,
    createdAt: now,
    updatedAt: now,
    cards: deck.cards.map(card => ({ ...card }))
  };
}

function findCardIndex(deck, type, uniqueId) {
  return deck.cards.findIndex(card => card.type === type && card.uniqueId === uniqueId);
}

export function addCardToDeck(deck, card, quantity = 1) {
  const cards = deck.cards.slice();
  const index = findCardIndex(deck, card.type, card.uniqueId);

  if (index >= 0) {
    cards[index] = { ...cards[index], quantity: cards[index].quantity + quantity };
  } else {
    cards.push({
      type: card.type,
      uniqueId: card.uniqueId,
      name: card.name,
      subname: card.subname || '',
      set: card.set || '',
      quantity
    });
  }

  return { ...deck, cards, updatedAt: new Date().toISOString() };
}

export function setCardQuantity(deck, type, uniqueId, quantity) {
  if (quantity <= 0) {
    return removeCardFromDeck(deck, type, uniqueId);
  }
  const cards = deck.cards.map(card =>
    card.type === type && card.uniqueId === uniqueId ? { ...card, quantity } : card
  );
  return { ...deck, cards, updatedAt: new Date().toISOString() };
}

export function removeCardFromDeck(deck, type, uniqueId) {
  const cards = deck.cards.filter(card => !(card.type === type && card.uniqueId === uniqueId));
  return { ...deck, cards, updatedAt: new Date().toISOString() };
}

export function getCardsByType(deck, type) {
  return deck.cards.filter(card => card.type === type);
}

export function getTotalCardCount(deck) {
  return deck.cards.reduce((total, card) => total + card.quantity, 0);
}
