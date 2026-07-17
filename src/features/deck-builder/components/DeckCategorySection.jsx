import React from 'react';
import DeckCardSearchAdd from './DeckCardSearchAdd';

const TYPE_LABELS = {
  creature: { pt: 'Criaturas', en: 'Creatures' },
  attack: { pt: 'Ataques', en: 'Attacks' },
  location: { pt: 'Locais', en: 'Locations' },
  battlegear: { pt: 'Equipamentos', en: 'Battlegear' },
  mugic: { pt: 'Mugic', en: 'Mugic' }
};

// Renders one deck category: the "add card" search control plus the list of
// cards of that type already in the deck, with quantity steppers and removal.
const DeckCategorySection = ({ type, locale, cards, onAddCard, onChangeQuantity, onRemoveCard }) => {
  const label = TYPE_LABELS[type]?.[locale] || type;
  const total = cards.reduce((sum, card) => sum + card.quantity, 0);

  return (
    <div className="border border-gray-700 rounded-lg p-3 bg-black">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-white font-semibold">{label}</h3>
        <span className="text-xs text-gray-400">{total} {locale === 'pt' ? 'carta(s)' : 'card(s)'}</span>
      </div>

      <DeckCardSearchAdd type={type} locale={locale} onAdd={onAddCard} />

      {cards.length > 0 && (
        <ul className="mt-3 divide-y divide-gray-800">
          {cards.map((card) => (
            <li key={card.uniqueId} className="flex items-center justify-between py-2 gap-2">
              <span className="text-sm text-white truncate">
                {card.name}
                {card.subname ? `, ${card.subname}` : ''}
                {card.set ? <span className="text-gray-500"> ({card.set.toUpperCase()})</span> : null}
              </span>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => onChangeQuantity(type, card.uniqueId, card.quantity - 1)}
                  className="px-2 py-0.5 rounded bg-gray-800 hover:bg-gray-700 text-white"
                  aria-label={locale === 'pt' ? 'Diminuir quantidade' : 'Decrease quantity'}
                >
                  -
                </button>
                <span className="text-white w-6 text-center">{card.quantity}</span>
                <button
                  type="button"
                  onClick={() => onChangeQuantity(type, card.uniqueId, card.quantity + 1)}
                  className="px-2 py-0.5 rounded bg-gray-800 hover:bg-gray-700 text-white"
                  aria-label={locale === 'pt' ? 'Aumentar quantidade' : 'Increase quantity'}
                >
                  +
                </button>
                <button
                  type="button"
                  onClick={() => onRemoveCard(type, card.uniqueId)}
                  className="px-2 py-0.5 rounded bg-red-900 hover:bg-red-800 text-white"
                  aria-label={locale === 'pt' ? 'Remover carta' : 'Remove card'}
                >
                  ×
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default DeckCategorySection;
