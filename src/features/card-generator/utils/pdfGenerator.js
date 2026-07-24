// 1. Importe explicitamente o PDFDocument da biblioteca no topo do pdfGenerator.js
import { PDFDocument } from 'pdf-lib';

// Configuração (mm / DPI)
const NO_SPACING = true; 
const CARD_W_MM = 63.0;
const CARD_H_MM = 88.0;
const MARGIN_MM = 4.0;
const SPACING_MM = NO_SPACING ? 0.0 : 5.0;
const DPI = 300;
const CENTER_VERTICAL = true;

// Conversões
const MM_TO_PT = 72.0 / 25.4;
const MM_TO_PX = DPI / 25.4;

const CARD_W_PT = CARD_W_MM * MM_TO_PT;
const CARD_H_PT = CARD_H_MM * MM_TO_PT;
const MARGIN_PT = MARGIN_MM * MM_TO_PT;
const SPACING_PT = SPACING_MM * MM_TO_PT;

const CARD_W_PX = Math.round(CARD_W_MM * MM_TO_PX);
const CARD_H_PX = Math.round(CARD_H_MM * MM_TO_PX);

const PAGE_W_PT = 595.27; 
const PAGE_H_PT = 841.89; 
const PAGE_W_MM = 210.0;
const PAGE_H_MM = 297.0;

function sanitizeFilename(name) {
    if (!name || typeof name !== 'string') {
        return 'documento.pdf';
    }
    let baseName = name.replace(/\.pdf$/i, '');
    baseName = baseName.replace(/[/\\?%*:|"<>\s]/g, '_');
    return `${baseName.substring(0, 120)}.pdf`;
}

function loadImage(blob) {
    return new Promise((resolve, reject) => {
        const url = URL.createObjectURL(blob);
        const img = new Image();
        img.onload = () => {
            URL.revokeObjectURL(url);
            resolve(img);
        };
        img.onerror = (err) => {
            URL.revokeObjectURL(url);
            reject(err);
        };
        img.src = url;
    });
}

async function prepareImage(blob, targetW, targetH) {
    const img = await loadImage(blob);

    const canvas = document.createElement('canvas');
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, targetW, targetH);

    let w = img.width;
    let h = img.height;

    if (w > targetW || h > targetH) {
        const ratio = Math.min(targetW / w, targetH / h);
        w = w * ratio;
        h = h * ratio;
    }

    const x = (targetW - w) / 2;
    const y = (targetH - h) / 2;

    ctx.drawImage(img, x, y, w, h);

    return new Promise((resolve) => {
        canvas.toBlob((resultBlob) => {
            resultBlob.arrayBuffer().then(resolve);
        }, 'image/png');
    });
}

function computeGrid() {
    const usableW_mm = PAGE_W_MM - 2 * MARGIN_MM;
    const usableH_mm = PAGE_H_MM - 2 * MARGIN_MM;
    
    let cols = Math.floor((usableW_mm + SPACING_MM) / (CARD_W_MM + SPACING_MM));
    let rows = Math.floor((usableH_mm + SPACING_MM) / (CARD_H_MM + SPACING_MM));
    
    return {
        cols: Math.max(1, cols),
        rows: Math.max(1, rows)
    };
}

// 2. Função principal exportada usando o PDFDocument importado diretamente
export async function generatePdfForDownload(imageBlobs, rawFileName) {
    if (!imageBlobs || imageBlobs.length === 0) {
        console.warn("Nenhuma imagem para processar.");
        return;
    }

    const safeName = sanitizeFilename(rawFileName);
    const { cols, rows } = computeGrid();
    const perPage = cols * rows;

    // Instancia o documento usando a classe importada diretamente
    const pdfDoc = await PDFDocument.create();
    let page = pdfDoc.addPage([PAGE_W_PT, PAGE_H_PT]);

    const usableWidthPt = PAGE_W_PT - 2 * MARGIN_PT;
    const gridWidth = cols * CARD_W_PT + (cols - 1) * SPACING_PT;
    const startX = MARGIN_PT + (usableWidthPt - gridWidth) / 2;

    let startY;
    if (CENTER_VERTICAL) {
        const gridHeight = rows * CARD_H_PT + (rows - 1) * SPACING_PT;
        startY = (PAGE_H_PT + gridHeight) / 2 - CARD_H_PT;
    } else {
        startY = PAGE_H_PT - MARGIN_PT * 2 - CARD_H_PT;
    }

    let idx = 0;
    for (const blob of imageBlobs) {
        const posInPage = idx % perPage;
        const col = posInPage % cols;
        const row = Math.floor(posInPage / cols);

        const x = startX + col * (CARD_W_PT + SPACING_PT);
        const y = startY - row * (CARD_H_PT + SPACING_PT);

        try {
            const imgBuffer = await prepareImage(blob, CARD_W_PX, CARD_H_PX);
            const embeddedImg = await pdfDoc.embedPng(imgBuffer);

            page.drawImage(embeddedImg, {
                x: x,
                y: y,
                width: CARD_W_PT,
                height: CARD_H_PT
            });

            idx++;
            if (idx % perPage === 0 && idx < imageBlobs.length) {
                page = pdfDoc.addPage([PAGE_W_PT, PAGE_H_PT]);
            }
        } catch (error) {
            console.error(`Erro ao processar imagem no índice ${idx}:`, error);
        }
    }

    const pdfBytes = await pdfDoc.save();
    const downloadBlob = new Blob([pdfBytes], { type: 'application/pdf' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(downloadBlob);
    link.download = safeName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
}