import React from 'react';
import starterDecks from '../data/starterDecks';

const StarterDecksPanel = ({ locale, onUseStarterDeck }) => {
  return (
    <ul className="divide-y divide-gray-800">
      {starterDecks.map((starterDeck) => (
        <li key={starterDeck.id} className="py-2 flex items-center justify-between gap-2">
          <span className="text-sm text-white truncate">{starterDeck.title}</span>
          <button
            type="button"
            onClick={() => onUseStarterDeck(starterDeck)}
            className="px-2 py-1 rounded bg-gray-800 hover:bg-gray-700 text-white text-xs shrink-0"
          >
            {locale === 'pt' ? 'Usar como novo deck' : 'Use as new deck'}
          </button>
        </li>
      ))}
    </ul>
  );
};

export default StarterDecksPanel;
