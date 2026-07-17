import React, { useState, useCallback } from 'react';
import { useLocale } from '../../../app/LocaleContext';
import {
  CARD_TYPES,
  createEmptyDeck,
  cloneDeckAsNew,
  addCardToDeck,
  setCardQuantity,
  removeCardFromDeck,
  getCardsByType,
  getTotalCardCount
} from '../utils/deckModel';
import { listDecks, saveDeck, deleteDeck, getDeckById } from '../utils/deckStorage';
import { resolveNamedCards } from '../utils/deckCardResolver';
import DeckCategorySection from './DeckCategorySection';
import SavedDecksPanel from './SavedDecksPanel';
import StarterDecksPanel from './StarterDecksPanel';
import DeckExportImportControls from './DeckExportImportControls';
import DeckImageDownloadButton from './DeckImageDownloadButton';

const DeckBuilderScreen = () => {
  const { locale } = useLocale();
  const [deck, setDeck] = useState(() => createEmptyDeck(locale === 'pt' ? 'Novo Deck' : 'New Deck'));
  const [savedDecks, setSavedDecks] = useState(() => listDecks());
  const [unresolved, setUnresolved] = useState([]);

  const refreshSavedDecks = useCallback(() => {
    setSavedDecks(listDecks());
  }, []);

  const handleAddCard = useCallback((type) => (card, quantity) => {
    setDeck((current) => addCardToDeck(current, { ...card, type }, quantity));
  }, []);

  const handleChangeQuantity = useCallback((type, uniqueId, quantity) => {
    setDeck((current) => setCardQuantity(current, type, uniqueId, quantity));
  }, []);

  const handleRemoveCard = useCallback((type, uniqueId) => {
    setDeck((current) => removeCardFromDeck(current, type, uniqueId));
  }, []);

  const handleNameChange = (event) => {
    const name = event.target.value;
    setDeck((current) => ({ ...current, name }));
  };

  const handleSave = () => {
    const saved = saveDeck(deck);
    setDeck(saved);
    refreshSavedDecks();
  };

  const handleNewDeck = () => {
    setDeck(createEmptyDeck(locale === 'pt' ? 'Novo Deck' : 'New Deck'));
    setUnresolved([]);
  };

  const handleLoadDeck = (id) => {
    const found = getDeckById(id);
    if (found) {
      setDeck(found);
      setUnresolved([]);
    }
  };

  const handleDeleteDeck = (id) => {
    deleteDeck(id);
    refreshSavedDecks();
    if (deck.id === id) {
      handleNewDeck();
    }
  };

  const handleDuplicateDeck = (id) => {
    const found = getDeckById(id);
    if (!found) return;
    const copy = cloneDeckAsNew(found);
    const saved = saveDeck(copy);
    refreshSavedDecks();
    setDeck(saved);
  };

  const handleUseStarterDeck = (starterDeck) => {
    const { cards, unresolved: unresolvedCards } = resolveNamedCards(starterDeck.cards, locale);
    setDeck({ ...createEmptyDeck(starterDeck.title), cards });
    setUnresolved(unresolvedCards);
  };

  const handleImport = ({ name, cards, unresolved: unresolvedCards }) => {
    setDeck({ ...createEmptyDeck(name), cards });
    setUnresolved(unresolvedCards);
  };

  const totalCards = getTotalCardCount(deck);

  return (
    <div className="mx-auto flex flex-col lg:flex-row gap-4 p-2 lg:p-4 max-w-6xl text-white">
      <div className="w-full lg:w-2/3 flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          <input
            type="text"
            value={deck.name}
            onChange={handleNameChange}
            className="flex-1 p-2 border border-gray-700 rounded bg-black text-white focus:border-[#9FE240] focus:outline-none text-lg font-semibold"
            placeholder={locale === 'pt' ? 'Nome do deck' : 'Deck name'}
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSave}
              className="px-3 py-2 rounded bg-[#9FE240] hover:bg-[#8ccf30] text-black text-sm font-semibold"
            >
              {locale === 'pt' ? 'Salvar' : 'Save'}
            </button>
            <button
              type="button"
              onClick={handleNewDeck}
              className="px-3 py-2 rounded bg-gray-800 hover:bg-gray-700 text-white text-sm"
            >
              {locale === 'pt' ? 'Novo Deck' : 'New Deck'}
            </button>
          </div>
        </div>

        <p className="text-xs text-gray-400">
          {totalCards} {locale === 'pt' ? 'carta(s) no total' : 'card(s) total'}
        </p>

        {unresolved.length > 0 && (
          <div className="border border-yellow-700 bg-yellow-950/40 rounded p-2 text-xs text-yellow-300">
            <p className="font-semibold mb-1">
              {locale === 'pt'
                ? 'Algumas cartas não foram encontradas e não foram adicionadas:'
                : 'Some cards could not be found and were not added:'}
            </p>
            <ul className="list-disc list-inside">
              {unresolved.map((item, index) => (
                <li key={`${item.type}-${item.raw}-${index}`}>{item.type}: {item.raw}</li>
              ))}
            </ul>
          </div>
        )}

        {CARD_TYPES.map((type) => (
          <DeckCategorySection
            key={type}
            type={type}
            locale={locale}
            cards={getCardsByType(deck, type)}
            onAddCard={handleAddCard(type)}
            onChangeQuantity={handleChangeQuantity}
            onRemoveCard={handleRemoveCard}
          />
        ))}
      </div>

      <div className="w-full lg:w-1/3 flex flex-col gap-4">
        <div className="border border-gray-700 rounded-lg p-3 bg-black">
          <h3 className="text-white font-semibold mb-2">
            {locale === 'pt' ? 'Importar / Exportar' : 'Import / Export'}
          </h3>
          <DeckExportImportControls deck={deck} locale={locale} onImport={handleImport} />
        </div>

        <div className="border border-gray-700 rounded-lg p-3 bg-black">
          <h3 className="text-white font-semibold mb-2">
            {locale === 'pt' ? 'Imagens do deck' : 'Deck images'}
          </h3>
          <DeckImageDownloadButton deck={deck} locale={locale} />
        </div>

        <div className="border border-gray-700 rounded-lg p-3 bg-black">
          <h3 className="text-white font-semibold mb-2">
            {locale === 'pt' ? 'Decks salvos' : 'Saved decks'}
          </h3>
          <SavedDecksPanel
            locale={locale}
            decks={savedDecks}
            currentDeckId={deck.id}
            onLoad={handleLoadDeck}
            onDelete={handleDeleteDeck}
            onDuplicate={handleDuplicateDeck}
          />
        </div>

        <div className="border border-gray-700 rounded-lg p-3 bg-black">
          <h3 className="text-white font-semibold mb-2">
            {locale === 'pt' ? 'Decks iniciantes' : 'Starter decks'}
          </h3>
          <StarterDecksPanel locale={locale} onUseStarterDeck={handleUseStarterDeck} />
        </div>
      </div>
    </div>
  );
};

export default DeckBuilderScreen;
