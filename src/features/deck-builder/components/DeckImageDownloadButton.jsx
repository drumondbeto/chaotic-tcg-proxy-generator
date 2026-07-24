import React, { useState } from 'react';
import { downloadDeckImages, downloadDeckPdf } from '../utils/deckImageExport';

const DeckImageDownloadButton = ({ deck, locale }) => {
  const [status, setStatus] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isRunningImgs, setIsRunningImgs] = useState(false);
  const [isRunningPdf, setIsRunningPdf] = useState(false);

  const totalCards = deck.cards.reduce((sum, card) => sum + card.quantity, 0);

  const handleDownloadCardImagesClick = async () => {
    if (isRunning || totalCards === 0) return;
    setIsRunning(true);
    setIsRunningImgs(true);
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
      setIsRunningImgs(false);
    }
  };

  const handleDownloadPdfClick = async () => {
    if (isRunning || totalCards === 0) return;
    setIsRunning(true);
    setIsRunningPdf(true);
    setStatus(null);
    try {
      await downloadDeckPdf(deck, locale, (progress) => {
        setStatus(progress.status);
      });
    } catch (error) {
      console.error('Failed to generate deck PDF:', error);
      setStatus(locale === 'pt' ? 'Erro ao gerar PDF.' : 'Failed to generate PDF.');
    } finally {
      setIsRunning(false);
      setIsRunningPdf(false);
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={handleDownloadCardImagesClick}
        disabled={isRunning || totalCards === 0}
        className="px-3 py-1.5 rounded bg-[#9FE240] hover:bg-[#8ccf30] disabled:opacity-50 disabled:cursor-not-allowed text-black text-sm font-semibold"
      >
        {isRunningImgs
          ? locale === 'pt' ? 'Gerando...' : 'Generating...'
          : locale === 'pt' ? 'Baixar cartas do deck' : 'Download deck images'}
      </button>
      <br></br>
      <button
        type="button"
        onClick={handleDownloadPdfClick}
        disabled={isRunning || totalCards === 0}
        className="px-3 py-1.5 rounded bg-[#9FE240] hover:bg-[#8ccf30] disabled:opacity-50 disabled:cursor-not-allowed text-black text-sm font-semibold"
      >
        {isRunningPdf
          ? locale === 'pt' ? 'Gerando...' : 'Generating...'
          : locale === 'pt' ? 'Baixar PDF' : 'Download PDF'}
      </button>
      {status && <p className="text-xs text-gray-400 mt-1">{status}</p>}
    </div>
  );
};

export default DeckImageDownloadButton;
