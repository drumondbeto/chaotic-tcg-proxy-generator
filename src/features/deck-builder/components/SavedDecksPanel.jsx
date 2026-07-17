import React from 'react';

const SavedDecksPanel = ({ locale, decks, currentDeckId, onLoad, onDelete, onDuplicate }) => {
  if (decks.length === 0) {
    return (
      <p className="text-sm text-gray-500">
        {locale === 'pt' ? 'Nenhum deck salvo ainda.' : 'No saved decks yet.'}
      </p>
    );
  }

  return (
    <ul className="divide-y divide-gray-800">
      {decks.map((deck) => (
        <li key={deck.id} className="py-2 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => onLoad(deck.id)}
            className={`text-left flex-1 truncate text-sm ${
              deck.id === currentDeckId ? 'text-[#9FE240] font-semibold' : 'text-white'
            } hover:underline`}
          >
            {deck.name}
          </button>
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => onDuplicate(deck.id)}
              className="px-2 py-0.5 rounded bg-gray-800 hover:bg-gray-700 text-white text-xs"
            >
              {locale === 'pt' ? 'Duplicar' : 'Duplicate'}
            </button>
            <button
              type="button"
              onClick={() => onDelete(deck.id)}
              className="px-2 py-0.5 rounded bg-red-900 hover:bg-red-800 text-white text-xs"
            >
              {locale === 'pt' ? 'Excluir' : 'Delete'}
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default SavedDecksPanel;
