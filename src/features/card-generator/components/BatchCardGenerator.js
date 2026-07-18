// Batch card generator for the card generator feature
import { CardCreator } from '../utils/cardCreator';
import { getAllCreatures, filterCreaturesByTribe } from '../utils/batchHelpers';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

// Module-level cache for art blob fetches — avoids re-downloading the same
// imageUrl for every copy of a card that appears in a batch run.
const _artBlobCache = new Map();

export class BatchCardGenerator {
  constructor(progressCallback = () => {}, useEmptyStats = false, useUnofficials = false) {
    this.progressCallback = progressCallback;
    this.useEmptyStats = useEmptyStats;
    this.useUnofficials = useUnofficials;
  }

  /**
   * Generate a single card image from normalized batch entry
   * @param {Object} cardEntry - The card data from batch helpers
   * @returns {Promise<HTMLCanvasElement>} - The rendered canvas
   */
  async generateCardFromData(cardEntry, locale = 'pt') {
    const cardType = cardEntry.type || 'creature';

    // Convert image URL to File object if it exists — cache blobs to avoid
    // re-fetching the same URL for every card copy in a batch.
    let artFile = null;
    if (cardEntry.imageUrl) {
      try {
        let blob = _artBlobCache.get(cardEntry.imageUrl);
        if (!blob) {
          const response = await fetch(cardEntry.imageUrl);
          blob = await response.blob();
          _artBlobCache.set(cardEntry.imageUrl, blob);
        }
        artFile = new File([blob], 'art.png', { type: blob.type });
      } catch (error) {
        console.error(`Failed to load image for ${cardEntry.name}:`, error);
      }
    }

    const stats = cardType === 'creature'
      ? this.useEmptyStats
        ? {
            energy: '',
            courage: '',
            power: '',
            wisdom: '',
            speed: '',
            mugic: cardEntry.stats?.mugic || 0
          }
        : cardEntry.stats || {
            energy: 0,
            courage: 0,
            power: 0,
            wisdom: 0,
            speed: 0,
            mugic: 0
          }
      : undefined;

    // Prepare card data in the format expected by CardCreator
    const cardData = {
      type: cardType,
      name: cardEntry.name || '',
      subname: cardEntry.subname || '',
      tribe: cardEntry.tribe || '',
      art: artFile,
      set: cardEntry.set || '',
      rarity: cardEntry.rarity || '',
      subtype: cardEntry.subtype || '',
      initiative: cardEntry.initiative || '',
      ability: cardEntry.ability || '',
      brainwashed: cardEntry.brainwashed || false,
      brainwashedText: cardEntry.brainwashedText || '',
      flavorText: cardEntry.flavorText || '',
      unique: cardEntry.unique || false,
      legendary: cardEntry.legendary || false,
      artist: cardEntry.artist || '',
      loyal: cardEntry.loyal || false,
      loyalRestriction: cardEntry.loyalRestriction || '',
      past: cardEntry.isPast || false,
      stats,
      elements: cardEntry.elements || {
        fire: 0,
        air: 0,
        earth: 0,
        water: 0
      },
      buildPoints: cardEntry.buildPoints,
      base: cardEntry.base,
      mugicCost: cardEntry.mugicCost,
      mugicNotes: (cardEntry.mugicNotes || []).filter(note => note?.letter !== ""),
      serialNumber: cardEntry.serialNumber || cardEntry.id || '',
      showCopyright: true,
      showArtist: true
    };

    // Create the card canvas
    try {
      const canvas = await CardCreator.createCard(cardData, locale);
      return canvas;
    } catch (error) {
      console.error(`Error generating card for ${cardEntry.name}:`, error);
      throw error;
    }
  }

  /**
   * Convert canvas to blob
   * @param {HTMLCanvasElement} canvas - The rendered canvas 
   * @returns {Promise<Blob>} - PNG blob
   */
  canvasToBlob(canvas) {
    return new Promise((resolve, reject) => {
      canvas.toBlob(blob => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Canvas to Blob conversion failed'));
        }
      }, 'image/png');
    });
  }

  /**
   * Generate all cards and download as a zip file
   * @param {Array} cardList - List of normalized batch entries to process
   * @param {string} zipFilename - Name of the zip file to download
   * @param {string} locale - Locale for card text (defaults to 'pt')
   */
  async generateAllCards(cardList = [], zipFilename = 'chaotic-cards.zip', locale = 'pt') {
    cardList = this.filterUnofficials(cardList);
    const zip = new JSZip();
    const total = cardList.length;
    let completed = 0;
    let errors = 0;
    const errorsList = [];
    const usedFilenames = new Set();

    // All files will be placed in the zip root (no subfolders)
    
    this.progressCallback({
      status: 'Starting batch generation',
      progress: 0,
      total
    });

    // Smaller batches keep peak memory lower; the main pressure is the
    // blob accumulation inside JSZip, so fewer concurrent allocations help.
    const BATCH_SIZE = 5;
    for (let i = 0; i < cardList.length; i += BATCH_SIZE) {
      const batch = cardList.slice(i, i + BATCH_SIZE);
      
      // Process each card sequentially to avoid concurrent
      // rendering on the shared global canvas (which causes drawing overlap).
      for (const card of batch) {
        try {
          // Update progress
          this.progressCallback({
            status: `Processing: ${card.name}${card.subname ? ` ${card.subname}` : ''}`,
            progress: completed + errors,
            total
          });

          // Generate card (sequential to avoid canvas reuse race)
          const canvas = await this.generateCardFromData(card, locale);
          const blob = await this.canvasToBlob(canvas);
          // Release the canvas pixel buffer immediately after conversion
          canvas.width = 0;

          // Create a safe filename and ensure uniqueness (no duplicate names)
          let filename = this.createSafeFilename(card);
          // Add extension if missing
          if (!filename.toLowerCase().endsWith('.png')) filename = `${filename}.png`;
          const baseName = filename.replace(/\.png$/i, '');
          let uniqueName = filename;
          let counter = 1;
          while (usedFilenames.has(uniqueName)) {
            uniqueName = `${baseName}-${counter}.png`;
            counter++;
          }
          usedFilenames.add(uniqueName);

          // Add file to zip root — STORE avoids re-compressing already-compressed PNGs
          zip.file(uniqueName, blob, { binary: true, compression: 'STORE' });

          completed++;
        } catch (error) {
          console.error(`Failed to process ${card.name}:`, error);
          errors++;
          const id = card.uniqueId || card.serialNumber || card.id || card.name || 'unknown';
          errorsList.push(`${id} - ${card.name} : ${error && error.message ? error.message : String(error)}`);
        }
      }
      
      // Force garbage collection between batches (kind of)
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    this.progressCallback({
      status: 'Creating zip file...',
      progress: total,
      total
    });

    // Append error log before generating the final archive
    if (errorsList.length > 0) {
      zip.file('errors.txt', errorsList.join('\n'));
    }

    // STORE skips re-compressing already-compressed PNGs, cutting both peak
    // RAM usage and CPU time during generateAsync().
    const content = await zip.generateAsync({ type: 'blob', compression: 'STORE' });
    saveAs(content, zipFilename);
    
    this.progressCallback({
      status: `Complete! Generated ${completed} cards with ${errors} errors.`,
      progress: total,
      total,
      completed,
      errors
    });
    
    return { completed, errors };
  }

  /**
   * Format tribe name for folder structure
   */
  formatTribe(tribe) {
    const tribeMap = {
      'overworld': 'OverWorld',
      'underworld': 'UnderWorld',
      'mipedian': 'Mipedian',
      'danian': 'Danian',
      "m'arrillian": "M'arrillian",
      'tribeless': 'Tribeless'
    };
    
    return tribeMap[tribe.toLowerCase()] || tribe;
  }
  
  /**
   * Create a safe filename from creature data
   */
  createSafeFilename(card) {
    // Start with set and serial number if available
    let suffix = '';
    if (card.set && card.serialNumber) {
      suffix = `_${card.set.toUpperCase()}-${card.serialNumber}`;
    }
    else if (card.set && card.id) {
      suffix = `_${card.set.toUpperCase()}-${card.id}`;
    }
    
    // Add name, and handle subname if it exists
    let name = card.name || 'card';
    if (card.subname) {
      name += `_${card.subname}`;
    }
    
    // Clean up invalid filename characters
    const filename = `${name}${suffix}`;
    const safeFilename = filename.replace(/[/\\?%*:|"<>]/g, '-');
    // console.log(`Generated filename: ${safeFilename}`);
    return safeFilename;
  }
  
  /**
   * Generate cards for a specific tribe
   */
  async generateCardsByTribe(tribe, zipFilename) {
    const allCreatures = getAllCreatures();
    const tribeCreatures = filterCreaturesByTribe(allCreatures, tribe);
    
    if (tribeCreatures.length === 0) {
      throw new Error(`No creatures found for tribe: ${tribe}`);
    }
    
    return this.generateAllCards(tribeCreatures, `${this.formatTribe(tribe)}-cards.zip`);
  }

  filterUnofficials(creatureList) {
    if (!this.useUnofficials) {
      return creatureList.filter(c => {
        const cardType = (c.type || '').toLowerCase();
        if (cardType === 'creature' || cardType === 'attack') {
          return this.hasOfficialIdentifiers(c);
        }
        return true;
      });
    }
    return creatureList;
  }

  hasOfficialIdentifiers(card) {
    const hasSet = !!(card.set && String(card.set).trim() !== '');
    const idLike = card.serialNumber || card.id;
    const hasIdLike = !!(idLike && String(idLike).trim() !== '');
    return hasSet && hasIdLike;
  }
}