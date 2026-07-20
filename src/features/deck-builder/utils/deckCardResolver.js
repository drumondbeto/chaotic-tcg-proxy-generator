// Resolves card names (or sanitized text from imported deck files) to actual database
// entries, and builds a sanitized index used both for import parsing and export
// serialization compatible with the external platform's deck file format.

import AttackDatabasePt from '../../card-generator/data/json/AttackDatabasePt.json';
import BattlegearDatabasePt from '../../card-generator/data/json/BattlegearDatabasePt.json';
import CreatureDatabasePt from '../../card-generator/data/json/CreatureDatabasePt.json';
import LocationDatabasePt from '../../card-generator/data/json/LocationDatabasePt.json';
import MugicDatabasePt from '../../card-generator/data/json/MugicDatabasePt.json';

export function sanitizeText(text) {
  if (!text) return '';
  return text
    .toLowerCase()                             // 1. Convert to lowercase
    .normalize("NFD")                          // 2. Separate accents from letters
    .replace(/[\u0300-\u036f]/g, "")           // 3. Remove accents
    .replace(/[\s,\-]/g, "")                   // 4. Remove spaces (\s), commas (,) and hyphens (-)
    .replace(/[']/g, "");                      // 5. Remove apostrophes (')
}

function withId(card, fallbackName, fallbackSet) {
  return card.id || `${fallbackName}__${fallbackSet || 'unknown'}`;
}

// Pre-built lookup: EN creature name → raw PT entry (has name_pt, subname_pt)
// const _creaturePtByEnName = new Map();
// CreatureDatabasePt.forEach((c) => {
//   if (c.name) _creaturePtByEnName.set(c.name, c);
// });

// Pre-built lookup: EN location name → { name: PT name, subname: PT subname }
// const _locationPtByEnName = new Map();
// LocationDatabasePt.forEach((entry) => {
//   if (entry.name) {
//     _locationPtByEnName.set(entry.name, {
//       name: entry.name_pt || '',
//       subname: entry.subname_pt || '',
//     });
//   }
// });

const TYPE_LOADERS = {
  // EN database is the superset (659 cards vs 532 in PT) — use it as the
  // canonical base. PT translations come from creatureDatabase which
  // stores both name (EN) and name_pt (PT) on each entry.
  creature: (locale) => CreatureDatabasePt.map((c) => ({
    ...c,
    sanitizedSource: sanitizeText(c.importName),
  })),
  // PT JSON has both name (EN) and name_pt (PT) — same card set as EN.
  attack: (locale) => AttackDatabasePt.map((a) => ({
    ...a,
    sanitizedSource: sanitizeText(a.importName),
  })),
  location: (locale) => LocationDatabasePt.map((l) => ({
    ...l,
    sanitizedSource: sanitizeText(l.importName),
  })),
  battlegear: (locale) => BattlegearDatabasePt.map((g) => ({
    ...g,
    sanitizedSource: sanitizeText(g.importName),
  })),
  mugic: (locale) => MugicDatabasePt.map((m) => ({
    ...m,
    sanitizedSource: sanitizeText(m.importName),
  }))
};

const indexCache = new Map();

function getIndex(type, locale) {
  const cacheKey = `${type}:${locale}`;
  if (indexCache.has(cacheKey)) return indexCache.get(cacheKey);

  const loader = TYPE_LOADERS[type];
  const entries = loader ? loader(locale) : [];
  var bySanitized = new Map();
  const byId = new Map();

  // First occurrence wins on sanitized text collisions (e.g. same card name in
  // multiple sets), per product decision.
  entries.forEach((entry) => {
    if (entry.sanitizedSource) {
      const sanitized = sanitizeText(entry.sanitizedSource);
      if (sanitized && !bySanitized.has(sanitized)) {
        bySanitized.set(sanitized, entry);
      }
    }
    if (entry.id && !byId.has(entry.id)) {
      byId.set(entry.id, entry);
    }
  });

  bySanitized = new Map([...bySanitized.entries()].sort());

  const index = { bySanitized, byId, entries };
  indexCache.set(cacheKey, index);
  return index;
}

/** Clears the cached per-type/locale indexes (mostly useful for tests). */
export function clearResolverCache() {
  indexCache.clear();
}

/** Returns the normalized {type, id, name, subname, set} list for a card type. */
export function listCardsForType(type, locale = 'pt') {
  return getIndex(type, locale).entries;
}

/**
 * Resolves a card by its readable name (or an already-sanitized string) for
 * a given type. Returns null when no match is found.
 */
export function resolveCardByName(type, name, locale = 'pt') {
  const index = getIndex(type, locale);
  const sanitized = sanitizeText(name);
  const found = index.bySanitized.get(sanitized) || null;
  return found;
}

/** Resolves a card by its id ("Name__set"). */
export function resolveCardById(type, id, locale = 'pt') {
  const index = getIndex(type, locale);
  return index.byId.get(id) || null;
}

/**
 * Resolves a list of readable {type, name, quantity} entries (e.g. a starter
 * deck definition) into deck card entries, same shape produced by
 * parseDeckText. Returns { cards, unresolved }.
 */
export function resolveNamedCards(entries, locale = 'pt') {
  const cards = [];
  const unresolved = [];

  (entries || []).forEach(({ type, name, quantity = 1 }) => {
    const match = resolveCardByName(type, name, locale);
    if (!match) {
      unresolved.push({ type, raw: name });
      return;
    }

    const existing = cards.find((c) => c.type === type && c.id === match.id);
    if (existing) {
      existing.quantity += quantity;
    } else {
      cards.push({
        type,
        id: match.id,
        name: match.name,
        subname: match.subname || '',
        set: match.set || '',
        quantity
      });
    }
  });

  return { cards, unresolved };
}
