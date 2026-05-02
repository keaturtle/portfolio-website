import { Sheet, Piece, Placement, CutLayout } from './types';

interface FreeRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Guillotine bin-packing algorithm.
 * Sorts pieces by area descending, places each in the first free rectangle
 * that fits (tries both orientations), then splits the remaining space.
 */
export function optimizeCuts(sheet: Sheet, pieces: Piece[]): CutLayout {
  // Expand pieces by quantity
  const expanded: Array<{ piece: Piece; rotated: boolean }> = [];
  for (const piece of pieces) {
    for (let i = 0; i < piece.quantity; i++) {
      expanded.push({ piece, rotated: false });
    }
  }

  // Validate individual pieces
  for (const { piece } of expanded) {
    const fitsNormal = piece.width <= sheet.width && piece.height <= sheet.height;
    const fitsRotated = piece.height <= sheet.width && piece.width <= sheet.height;
    if (!fitsNormal && !fitsRotated) {
      throw new Error(
        `Piece "${piece.label || `${piece.width}×${piece.height}`}" is larger than the sheet (${sheet.width}×${sheet.height}).`
      );
    }
  }

  // Check total area
  const totalPieceArea = expanded.reduce((sum, { piece }) => sum + piece.width * piece.height, 0);
  const sheetArea = sheet.width * sheet.height;
  if (totalPieceArea > sheetArea) {
    return {
      sheet,
      placements: [],
      wastePercent: 100,
      error: `Total piece area (${totalPieceArea.toFixed(1)}) exceeds sheet area (${sheetArea.toFixed(1)}).`,
    };
  }

  // Sort by area descending for better packing
  expanded.sort((a, b) => b.piece.width * b.piece.height - a.piece.width * a.piece.height);

  const freeRects: FreeRect[] = [{ x: 0, y: 0, width: sheet.width, height: sheet.height }];
  const placements: Placement[] = [];

  for (const item of expanded) {
    const { piece } = item;
    let placed = false;

    for (let i = 0; i < freeRects.length; i++) {
      const rect = freeRects[i];

      // Try normal orientation
      if (piece.width <= rect.width && piece.height <= rect.height) {
        placements.push({ piece, x: rect.x, y: rect.y, rotated: false });
        splitRect(freeRects, i, rect, piece.width, piece.height);
        placed = true;
        break;
      }

      // Try rotated orientation
      if (piece.height <= rect.width && piece.width <= rect.height) {
        placements.push({ piece, x: rect.x, y: rect.y, rotated: true });
        splitRect(freeRects, i, rect, piece.height, piece.width);
        placed = true;
        break;
      }
    }

    if (!placed) {
      return {
        sheet,
        placements,
        wastePercent: 100,
        error: `Could not fit all pieces. Try a larger sheet or fewer pieces.`,
      };
    }
  }

  const usedArea = placements.reduce((sum, p) => sum + p.piece.width * p.piece.height, 0);
  const wastePercent = Math.round(((sheetArea - usedArea) / sheetArea) * 100);

  return { sheet, placements, wastePercent };
}

function splitRect(
  freeRects: FreeRect[],
  index: number,
  rect: FreeRect,
  usedW: number,
  usedH: number
): void {
  freeRects.splice(index, 1);

  // Right rectangle
  if (rect.width - usedW > 0) {
    freeRects.push({
      x: rect.x + usedW,
      y: rect.y,
      width: rect.width - usedW,
      height: usedH,
    });
  }

  // Bottom rectangle
  if (rect.height - usedH > 0) {
    freeRects.push({
      x: rect.x,
      y: rect.y + usedH,
      width: rect.width,
      height: rect.height - usedH,
    });
  }
}
