import React, { useState } from 'react';
import { downloadDeckImages } from '../utils/deckImageExport';

const DeckImageDownloadButton = ({ deck, locale }) => {
  const [status, setStatus] = useState(null);
  const [isRunning, setIsRunning] = useState(false);

  const totalCards = deck.cards.reduce((sum, card) => sum + card.quantity, 0);

  const handleClick = async () => {
    if (isRunning || totalCards === 0) return;
    setIsRunning(true);
    setStatus(null);
    try {
      await downloadDeckImages(deck, locale, (progress) => {
        setStatus(progress.status);
      });
    } catch (error) {
      console.error('Failed to generate deck images:', error);
      setStatus(locale === 'pt' ? 'Erro ao gerar imagens.' : 'Failed to generate images.');
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={isRunning || totalCards === 0}
        className="px-3 py-1.5 rounded bg-[#9FE240] hover:bg-[#8ccf30] disabled:opacity-50 disabled:cursor-not-allowed text-black text-sm font-semibold"
      >
        {isRunning
          ? locale === 'pt' ? 'Gerando...' : 'Generating...'
          : locale === 'pt' ? 'Baixar imagens do deck' : 'Download deck images'}
      </button>
      {status && <p className="text-xs text-gray-400 mt-1">{status}</p>}
    </div>
  );
};

export default DeckImageDownloadButton;
