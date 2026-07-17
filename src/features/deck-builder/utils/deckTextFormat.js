// Parser/serializer for the deck-list text format used by the external
// platform (see the "OverWorld Starter.txt" reference file): lowercase
// section headers with no title line, one card slug per line, quantity
// represented by repeating the same line.
//
// Import is intentionally tolerant (any section order/case, and a "Nome xN"
// suffix is also accepted as a fallback notation), but export always
// reproduces the exact reference style so files can be re-imported on the
// other platform.

import { slugify, resolveCardByName } from './deckCardResolver';

const SECTION_TYPE_BY_HEADER = {
  creatures: 'creature',
  creature: 'creature',
  attacks: 'attack',
  attack: 'attack',
  locations: 'location',
  location: 'location',
  battlegear: 'battlegear',
  mugic: 'mugic'
};

const SECTION_ORDER = [
  { type: 'creature', header: 'creatures' },
  { type: 'battlegear', header: 'battlegear' },
  { type: 'mugic', header: 'mugic' },
  { type: 'location', header: 'locations' },
  { type: 'attack', header: 'attacks' }
];

const QUANTITY_SUFFIX = /^(.*?)\s*[xX](\d+)$/;

/**
 * Parses deck list text into resolved cards + a list of lines that could not
 * be matched to any card in the database (so the UI can warn the user).
 *
 * Returns: { cards: [{type, uniqueId, name, subname, set, quantity}], unresolved: [{type, raw}] }
 */
export function parseDeckText(text, locale = 'pt') {
  const lines = (text || '').split(/\r?\n/).map((line) => line.trim());
  const cards = [];
  const unresolved = [];
  let currentType = null;

  for (const rawLine of lines) {
    if (!rawLine) continue;

    const headerType = SECTION_TYPE_BY_HEADER[rawLine.toLowerCase()];
    if (headerType) {
      currentType = headerType;
      continue;
    }

    if (!currentType) continue; // ignore stray lines before the first section

    const type = currentType; // snapshot so closures below don't capture the mutable binding
    let cardText = rawLine;
    let quantity = 1;
    const suffixMatch = rawLine.match(QUANTITY_SUFFIX);
    if (suffixMatch && suffixMatch[1].trim()) {
      cardText = suffixMatch[1].trim();
      quantity = parseInt(suffixMatch[2], 10) || 1;
    }

    const match = resolveCardByName(type, cardText, locale);
    if (!match) {
      unresolved.push({ type, raw: cardText });
      continue;
    }

    const existing = cards.find((c) => c.type === type && c.uniqueId === match.uniqueId);
    if (existing) {
      existing.quantity += quantity;
    } else {
      cards.push({
        type,
        uniqueId: match.uniqueId,
        name: match.name,
        subname: match.subname || '',
        set: match.set || '',
        quantity
      });
    }
  }

  return { cards, unresolved };
}

/** Serializes a deck to the reference slug-based text format. */
export function serializeDeckToText(deck) {
  const lines = [];

  SECTION_ORDER.forEach(({ type, header }) => {
    const cardsOfType = deck.cards.filter((card) => card.type === type);
    if (cardsOfType.length === 0) return;

    lines.push(header);
    cardsOfType.forEach((card) => {
      const slug = slugify(`${card.name || ''}${card.subname || ''}`);
      for (let i = 0; i < card.quantity; i++) {
        lines.push(slug);
      }
    });
  });

  return `${lines.join('\n')}\n`;
}
