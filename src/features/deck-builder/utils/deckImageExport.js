// Builds the printable card image list for a whole deck (expanding by
// quantity) and reuses the existing BatchCardGenerator to zip/download them.

import { getCreatureById } from '../../card-generator/data/CreatureDatabase';
import { getAttackById } from '../../card-generator/data/AttackDatabase';
import { getLocationById } from '../../card-generator/data/LocationDatabase';
import { getBattlegearById } from '../../card-generator/data/BattlegearDatabase';
import { getMugicById } from '../../card-generator/data/MugicDatabase';
import {
  convertCreatureToBatchEntry,
  convertAttackToBatchEntry,
  convertLocationToBatchEntry,
  convertBattlegearToBatchEntry,
  convertMugicToBatchEntry
} from '../../card-generator/utils/batchHelpers';
import { BatchCardGenerator } from '../../card-generator/components/BatchCardGenerator';

const LOOKUP_BY_TYPE = {
  creature: (uniqueId, locale) => getCreatureById(uniqueId, locale),
  attack: (uniqueId, locale) => getAttackById(uniqueId, locale),
  location: (uniqueId, locale) => getLocationById(uniqueId, locale),
  battlegear: (uniqueId) => getBattlegearById(uniqueId),
  mugic: (uniqueId) => getMugicById(uniqueId)
};

const CONVERTER_BY_TYPE = {
  creature: convertCreatureToBatchEntry,
  attack: convertAttackToBatchEntry,
  location: convertLocationToBatchEntry,
  battlegear: convertBattlegearToBatchEntry,
  mugic: convertMugicToBatchEntry
};

/** Builds the flattened (quantity-expanded) batch entry list for a deck. */
export function buildDeckBatchList(deck, locale = 'pt') {
  const list = [];

  deck.cards.forEach((card) => {
    const lookup = LOOKUP_BY_TYPE[card.type];
    const converter = CONVERTER_BY_TYPE[card.type];
    if (!lookup || !converter) return;

    const dbCard = lookup(card.uniqueId, locale);
    if (!dbCard) return;

    const entry = converter(dbCard);
    for (let i = 0; i < card.quantity; i++) {
      list.push(entry);
    }
  });

  return list;
}

/** Generates and downloads a zip with one image per card copy in the deck. */
export async function downloadDeckImages(deck, locale = 'pt', progressCallback = () => {}) {
  const list = buildDeckBatchList(deck, locale);
  const generator = new BatchCardGenerator(progressCallback);
  const safeName = (deck.name || 'deck').replace(/[/\\?%*:|"<>]/g, '-');
  return generator.generateAllCards(list, `${safeName}.zip`, locale);
}
