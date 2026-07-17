// localStorage-backed CRUD for saved decks.

const STORAGE_KEY = 'chaotic_decks_v1';

function readAll() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Failed to read decks from localStorage:', error);
    return [];
  }
}

function writeAll(decks) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(decks));
  } catch (error) {
    console.error('Failed to save decks to localStorage:', error);
  }
}

export function listDecks() {
  return readAll().sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
}

export function getDeckById(id) {
  return readAll().find(deck => deck.id === id) || null;
}

export function saveDeck(deck) {
  const decks = readAll();
  const index = decks.findIndex(d => d.id === deck.id);
  const toSave = { ...deck, updatedAt: new Date().toISOString() };

  if (index >= 0) {
    decks[index] = toSave;
  } else {
    decks.push(toSave);
  }

  writeAll(decks);
  return toSave;
}

export function deleteDeck(id) {
  const decks = readAll().filter(deck => deck.id !== id);
  writeAll(decks);
}
