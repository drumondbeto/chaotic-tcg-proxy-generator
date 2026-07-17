import React, { useRef } from 'react';
import { saveAs } from 'file-saver';
import { serializeDeckToText, parseDeckText } from '../utils/deckTextFormat';

// Export/import controls for the deck-list text file format compatible with
// the external platform (see deckTextFormat.js).
const DeckExportImportControls = ({ deck, locale, onImport }) => {
  const fileInputRef = useRef(null);

  const handleExport = () => {
    const text = serializeDeckToText(deck);
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const safeName = (deck.name || 'deck').replace(/[/\\?%*:|"<>]/g, '-');
    saveAs(blob, `${safeName}.txt`);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    const text = await file.text();
    const { cards, unresolved } = parseDeckText(text, locale);
    onImport({ name: file.name.replace(/\.[^.]+$/, ''), cards, unresolved });
  };

  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={handleExport}
        className="px-3 py-1.5 rounded bg-gray-800 hover:bg-gray-700 text-white text-sm"
      >
        {locale === 'pt' ? 'Exportar (.txt)' : 'Export (.txt)'}
      </button>
      <button
        type="button"
        onClick={handleImportClick}
        className="px-3 py-1.5 rounded bg-gray-800 hover:bg-gray-700 text-white text-sm"
      >
        {locale === 'pt' ? 'Importar (.txt)' : 'Import (.txt)'}
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".txt"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
};

export default DeckExportImportControls;
