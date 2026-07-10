// Batch card generator for the card generator feature
import { CardCreator } from '../utils/cardCreator';
import { creatureDatabase } from '../data/CreatureDatabase';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

export class BatchCardGenerator {
  constructor(progressCallback = () => {}, useEmptyStats = false, useUnofficials = false) {
    this.progressCallback = progressCallback;
    this.useEmptyStats = useEmptyStats;
    this.useUnofficials = useUnofficials;
  }

  /**
   * Generate a single card image from creature data
   * @param {Object} creatureData - The creature data from the database
   * @returns {Promise<HTMLCanvasElement>} - The rendered canvas
   */
  async generateCardFromData(creatureData, locale = 'pt') {
    // Convert image URL to File object if it exists
    let artFile = null;
    if (creatureData.imageUrl) {
      try {
        const response = await fetch(creatureData.imageUrl);
        const blob = await response.blob();
        artFile = new File([blob], 'art.png', { type: blob.type });
      } catch (error) {
        console.error(`Failed to load image for ${creatureData.name}:`, error);
      }
    }

    const stats = this.useEmptyStats
      ? {
          energy: "",
          courage: "",
          power: "",
          wisdom: "",
          speed: "",
          mugic: creatureData.stats?.mugic || 0
        }
      : creatureData.stats || {
          energy: 0,
          courage: 0,
          power: 0,
          wisdom: 0,
          speed: 0,
          mugic: 0
        };

    // Prepare card data in the format expected by CardCreator
    const cardData = {
      type: creatureData.type || 'creature',
      name: creatureData.name || '',
      subname: creatureData.subname || '',
      tribe: creatureData.tribe || '',
      art: artFile,
      set: creatureData.set || '',
      rarity: creatureData.rarity || '',
      subtype: creatureData.subtype || '',
      initiative: creatureData.initiative || "",
      ability: creatureData.ability || '',
      brainwashed: creatureData.brainwashed || false,
      brainwashedText: creatureData.brainwashedText || '',
      flavorText: creatureData.flavorText || '',
      unique: creatureData.unique || false,
      legendary: creatureData.legendary || false,
      artist: creatureData.artist || '',
      loyal: creatureData.loyal || false,
      loyalRestriction: creatureData.loyalRestriction || '',
      past: creatureData.isPast || false,
      stats,
      elements: creatureData.elements || {
        fire: 0,
        air: 0,
        earth: 0,
        water: 0
      },
      serialNumber: creatureData.serialNumber || '',
      showCopyright: true,
      showArtist: true
    };

    // Create the card canvas
    try {
      const canvas = await CardCreator.createCard(cardData, locale);
      return canvas;
    } catch (error) {
      console.error(`Error generating card for ${creatureData.name}:`, error);
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
   * @param {Array} creatureList - List of creature data to process (defaults to all creatures)
   * @param {string} zipFilename - Name of the zip file to download
   * @param {string} locale - Locale for card text (defaults to 'pt')
   */
  async generateAllCards(creatureList = creatureDatabase, zipFilename = 'chaotic-cards.zip', locale = 'pt') {
    creatureList = this.filterUnofficials(creatureList);
    const zip = new JSZip();
    const total = creatureList.length;
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

    // Process creatures in batches to avoid memory issues
    const BATCH_SIZE = 10;
    for (let i = 0; i < creatureList.length; i += BATCH_SIZE) {
      const batch = creatureList.slice(i, i + BATCH_SIZE);
      
      // Process each creature in the batch sequentially to avoid concurrent
      // rendering on the shared global canvas (which causes drawing overlap).
      for (const creature of batch) {
        try {
          // Update progress
          this.progressCallback({
            status: `Processing: ${creature.name}${creature.subname ? ` ${creature.subname}` : ''}`,
            progress: completed + errors,
            total
          });

          // Generate card (sequential to avoid canvas reuse race)
          const canvas = await this.generateCardFromData(creature);
          const blob = await this.canvasToBlob(canvas);

          // Create a safe filename and ensure uniqueness (no duplicate names)
          let filename = this.createSafeFilename(creature);
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

          // Add file to zip root
          zip.file(uniqueName, blob, { binary: true });

          completed++;
        } catch (error) {
          console.error(`Failed to process ${creature.name}:`, error);
          errors++;
          const id = creature.uniqueId || creature.serialNumber || creature.name || 'unknown';
          errorsList.push(`${id} - ${creature.name} : ${error && error.message ? error.message : String(error)}`);
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

    // Generate and download the zip
    const content = await zip.generateAsync({ 
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 }
    });
    // If there were errors, include an errors.txt at root
    if (errorsList.length > 0) {
      zip.file('errors.txt', errorsList.join('\n'));
      // regenerate content including errors.txt
      const contentWithErrors = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } });
      saveAs(contentWithErrors, zipFilename);
    } else {
      saveAs(content, zipFilename);
    }
    
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
  createSafeFilename(creature) {
    // Start with set and serial number if available
    let sufix = '';
    if (creature.set && creature.serialNumber) {
      sufix = `_${creature.set.toUpperCase()}-${creature.serialNumber}`;
    }
    else if (creature.set && creature.id) {
      sufix = `_${creature.set.toUpperCase()}-${creature.id}`;
    }
    
    // Add name, and handle subname if it exists
    let name = creature.name;
    if (creature.subname) {
      name += `_${creature.subname}`;
    }
    
    // Clean up invalid filename characters
    const safeName = name.replace(/[/\\?%*:|"<>]/g, '-');
    var filename = `${name}${sufix}`;
    const safeFilename = filename.replace(/[/\\?%*:|"<>]/g, '-');
    console.log(`Generated filename: ${safeFilename}`);
    return safeFilename;
  }
  
  /**
   * Generate cards for a specific tribe
   */
  async generateCardsByTribe(tribe, zipFilename) {
    const tribeCreatures = creatureDatabase.filter(c => 
      c.tribe && c.tribe.toLowerCase() === tribe.toLowerCase()
    );
    
    if (tribeCreatures.length === 0) {
      throw new Error(`No creatures found for tribe: ${tribe}`);
    }
    
    return this.generateAllCards(tribeCreatures, `${this.formatTribe(tribe)}-cards.zip`);
  }

  filterUnofficials(creatureList) {
    if (!this.useUnofficials) {
      return creatureList.filter(c => c.set !== "" && c.serialNumber !== "");
    }
    return creatureList;
  }
}