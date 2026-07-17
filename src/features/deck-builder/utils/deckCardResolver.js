// Resolves card names (or slugs from imported deck files) to actual database
// entries, and builds a slug index used both for import parsing and export
// serialization compatible with the external platform's deck file format.

import { getLocalizedLocationDatabase } from '../../card-generator/data/LocationDatabase';
import { battlegearDatabase } from '../../card-generator/data/BattlegearDatabase';
import { mugicDatabase } from '../../card-generator/data/MugicDatabase';
import CreatureDatabaseEnRaw from '../../card-generator/data/json/CreatureDatabaseEn.json';
import CreatureDatabasePtRaw from '../../card-generator/data/json/CreatureDatabasePt.json';
import AttackDatabasePtRaw from '../../card-generator/data/json/AttackDatabasePt.json';
import LocationDatabasePtRaw from '../../card-generator/data/json/LocationDatabasePt.json';

// Lowercase, accent-stripped, alphanumeric-only slug. This matches the style
// used by the external platform's deck export files (e.g. "theoverworldlibrary").
export function slugify(value) {
  return (value || '')
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

function withUniqueId(card, fallbackName, fallbackSet) {
  return card.uniqueId || `${fallbackName}__${fallbackSet || 'unknown'}`;
}

// Pre-built lookup: EN creature name → raw PT entry (has name_pt, subname_pt)
const _creaturePtByEnName = new Map();
(Array.isArray(CreatureDatabasePtRaw) ? CreatureDatabasePtRaw : []).forEach((c) => {
  if (c.name) _creaturePtByEnName.set(c.name, c);
});

// Pre-built lookup: EN location name → { name: PT name, subname: PT subname }
const _locationPtByEnName = new Map();
(Array.isArray(LocationDatabasePtRaw) ? LocationDatabasePtRaw : []).forEach((entry) => {
  if (entry.name) {
    _locationPtByEnName.set(entry.name, {
      name: entry.name_pt || '',
      subname: entry.subname_pt || '',
    });
  }
});

const TYPE_LOADERS = {
  // EN database is the superset (659 cards vs 532 in PT) — use it as the
  // canonical base. PT translations come from CreatureDatabasePtRaw which
  // stores both name (EN) and name_pt (PT) on each entry.
  creature: (locale) => {
    const enRaw = Array.isArray(CreatureDatabaseEnRaw) ? CreatureDatabaseEnRaw : [];
    return enRaw.map((c) => {
      const ptEntry = _creaturePtByEnName.get(c.name);
      return {
        type: 'creature',
        uniqueId: `${c.name}__${c.set || 'unknown'}`,
        name: locale === 'pt' ? (ptEntry?.name_pt || c.name) : c.name,
        subname: locale === 'pt'
          ? (ptEntry?.subname_pt || c.subname || '')
          : (c.subname || ''),
        set: c.set || '',
        slugSource: `${c.name || ''}${c.subname || ''}`,
        ptSlugSource: ptEntry
          ? `${ptEntry.name_pt || ''}${ptEntry.subname_pt || ''}`
          : null,
      };
    });
  },
  // PT JSON has both name (EN) and name_pt (PT) — same card set as EN.
  attack: (locale) => {
    const raw = Array.isArray(AttackDatabasePtRaw) ? AttackDatabasePtRaw : [];
    return raw.map((a) => ({
      type: 'attack',
      uniqueId: withUniqueId(a, a.name, a.set),
      name: locale === 'pt' ? (a.name_pt || a.name) : a.name,
      subname: a.subname || '',
      set: a.set || '',
      slugSource: `${a.name || ''}${a.subname || ''}`,
      ptSlugSource: `${a.name_pt || ''}${a.subname || ''}`,
    }));
  },
  // Load EN database as canonical slug source; PT names come from the
  // _locationPtByEnName lookup built from LocationPtBr.json.
  location: (locale) => {
    const enDb = getLocalizedLocationDatabase('en');
    return enDb.map((l) => {
      const ptInfo = _locationPtByEnName.get(l.name);
      return {
        type: 'location',
        uniqueId: withUniqueId(l, l.name, l.set),
        name: locale === 'pt' ? (ptInfo?.name || l.name) : l.name,
        subname: locale === 'pt'
          ? (ptInfo?.subname || l.subname || '')
          : (l.subname || ''),
        set: l.set || '',
        slugSource: `${l.name || ''}${l.subname || ''}`,
        ptSlugSource: ptInfo
          ? `${ptInfo.name || ''}${ptInfo.subname || ''}`
          : null,
      };
    });
  },
  battlegear: () => (Array.isArray(battlegearDatabase) ? battlegearDatabase : []).map((g) => ({
    type: 'battlegear',
    uniqueId: withUniqueId(g, g.name, g.set),
    name: g.name,
    subname: g.subname || '',
    set: g.set || '',
    slugSource: `${g.name || ''}${g.subname || ''}`,
  })),
  mugic: () => (Array.isArray(mugicDatabase) ? mugicDatabase : []).map((m) => ({
    type: 'mugic',
    uniqueId: withUniqueId(m, m.name, m.set),
    name: m.name,
    subname: m.subname || '',
    set: m.set || '',
    slugSource: `${m.name || ''}${m.subname || ''}`,
  }))
};

const indexCache = new Map();

function getIndex(type, locale) {
  const cacheKey = `${type}:${locale}`;
  if (indexCache.has(cacheKey)) return indexCache.get(cacheKey);

  const loader = TYPE_LOADERS[type];
  const entries = loader ? loader(locale) : [];
  const bySlug = new Map();
  const byUniqueId = new Map();

  // First occurrence wins on slug collisions (e.g. same card name in
  // multiple sets), per product decision.
  entries.forEach((entry) => {
    const slug = slugify(entry.slugSource);
    if (slug && !bySlug.has(slug)) {
      bySlug.set(slug, entry);
    }
    // Also register the PT slug so imports work regardless of the active locale
    // (covers Chaotic Recode export format, EN names, and PT names all at once).
    if (entry.ptSlugSource) {
      const ptSlug = slugify(entry.ptSlugSource);
      if (ptSlug && ptSlug !== slug && !bySlug.has(ptSlug)) {
        bySlug.set(ptSlug, entry);
      }
    }
    if (entry.uniqueId && !byUniqueId.has(entry.uniqueId)) {
      byUniqueId.set(entry.uniqueId, entry);
    }
  });

  const index = { bySlug, byUniqueId, entries };
  indexCache.set(cacheKey, index);
  return index;
}

/** Clears the cached per-type/locale indexes (mostly useful for tests). */
export function clearResolverCache() {
  indexCache.clear();
}

/** Returns the normalized {type, uniqueId, name, subname, set} list for a card type. */
export function listCardsForType(type, locale = 'pt') {
  return getIndex(type, locale).entries;
}

/**
 * Resolves a card by its readable name (or an already-slugified string) for
 * a given type. Returns null when no match is found.
 */
export function resolveCardByName(type, name, locale = 'pt') {
  const index = getIndex(type, locale);
  const slug = slugify(name);
  return index.bySlug.get(slug) || null;
}

/** Resolves a card by its uniqueId ("Name__set"). */
export function resolveCardByUniqueId(type, uniqueId, locale = 'pt') {
  const index = getIndex(type, locale);
  return index.byUniqueId.get(uniqueId) || null;
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
  });

  return { cards, unresolved };
}
