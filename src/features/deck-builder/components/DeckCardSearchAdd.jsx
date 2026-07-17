import React, { useState, useEffect, useRef, useMemo } from 'react';
import { listCardsForType } from '../utils/deckCardResolver';

// Generic searchable "add card" control for a single card type. Adapted from
// the card-generator Selector components, but supports a quantity input
// since a deck can hold multiple copies of the same card.
const DeckCardSearchAdd = ({ type, locale, onAdd }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const containerRef = useRef(null);

  const allCards = useMemo(() => {
    return listCardsForType(type, locale)
      .slice()
      .sort((a, b) => `${a.name}${a.subname}`.localeCompare(`${b.name}${b.subname}`));
  }, [type, locale]);

  const filteredCards = useMemo(() => {
    if (!searchTerm.trim()) return allCards;
    const term = searchTerm.toLowerCase();
    return allCards.filter((card) =>
      `${card.name} ${card.subname}`.toLowerCase().includes(term)
    );
  }, [allCards, searchTerm]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (card) => {
    onAdd(card, quantity);
    setSearchTerm('');
    setIsOpen(false);
    setQuantity(1);
  };

  return (
    <div ref={containerRef} className="relative flex gap-2 items-start">
      <div className="relative flex-1">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={locale === 'pt' ? 'Buscar carta...' : 'Search card...'}
          className="w-full p-2 border border-gray-700 rounded bg-black text-white focus:border-[#9FE240] focus:outline-none"
        />
        {isOpen && filteredCards.length > 0 && (
          <ul className="absolute z-10 left-0 right-0 mt-1 max-h-56 overflow-y-auto bg-black border border-gray-700 rounded shadow-lg">
            {filteredCards.slice(0, 50).map((card) => (
              <li key={card.uniqueId}>
                <button
                  type="button"
                  onClick={() => handleSelect(card)}
                  className="w-full text-left px-3 py-1.5 text-sm text-white hover:bg-gray-800 transition-colors"
                >
                  {card.name}
                  {card.subname ? `, ${card.subname}` : ''}
                  {card.set ? <span className="text-gray-500"> ({card.set.toUpperCase()})</span> : null}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <input
        type="number"
        min={1}
        value={quantity}
        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
        className="w-16 p-2 border border-gray-700 rounded bg-black text-white focus:border-[#9FE240] focus:outline-none"
      />
    </div>
  );
};

export default DeckCardSearchAdd;
