'use client';

import { useState } from 'react';
import { Plus, Trash2, Scissors } from 'lucide-react';
import { optimizeCuts } from '@/lib/plywoodOptimizer';
import { Sheet, Piece, CutLayout } from '@/lib/types';

interface PieceInput {
  width: string;
  height: string;
  quantity: string;
  label: string;
}

interface FormErrors {
  sheetWidth?: string;
  sheetHeight?: string;
  pieces?: Record<number, { width?: string; height?: string; quantity?: string }>;
  global?: string;
}

const COLORS = [
  '#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6',
  '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#14b8a6',
];

export default function PlywoodOptimizer() {
  const [unit, setUnit] = useState<'in' | 'mm'>('in');
  const [sheetWidth, setSheetWidth] = useState('');
  const [sheetHeight, setSheetHeight] = useState('');
  const [pieces, setPieces] = useState<PieceInput[]>([
    { width: '', height: '', quantity: '1', label: '' },
  ]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [result, setResult] = useState<CutLayout | null>(null);

  const addPiece = () => {
    setPieces((prev) => [...prev, { width: '', height: '', quantity: '1', label: '' }]);
  };

  const removePiece = (index: number) => {
    setPieces((prev) => prev.filter((_, i) => i !== index));
    setErrors((prev) => {
      const pieceErrors = { ...prev.pieces };
      delete pieceErrors[index];
      return { ...prev, pieces: pieceErrors };
    });
  };

  const updatePiece = (index: number, field: keyof PieceInput, value: string) => {
    setPieces((prev) => prev.map((p, i) => (i === index ? { ...p, [field]: value } : p)));
    setErrors((prev) => {
      const pieceErrors = { ...(prev.pieces ?? {}) };
      if (pieceErrors[index]) {
        const { [field]: _, ...rest } = pieceErrors[index] as Record<string, string>;
        pieceErrors[index] = rest;
      }
      return { ...prev, pieces: pieceErrors };
    });
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = { pieces: {} };
    let valid = true;

    const sw = parseFloat(sheetWidth);
    const sh = parseFloat(sheetHeight);
    if (!sheetWidth || isNaN(sw) || sw <= 0) {
      newErrors.sheetWidth = 'Enter a positive sheet width.';
      valid = false;
    }
    if (!sheetHeight || isNaN(sh) || sh <= 0) {
      newErrors.sheetHeight = 'Enter a positive sheet height.';
      valid = false;
    }

    pieces.forEach((p, i) => {
      const pw = parseFloat(p.width);
      const ph = parseFloat(p.height);
      const pq = parseInt(p.quantity);
      const pieceErr: Record<string, string> = {};
      if (!p.width || isNaN(pw) || pw <= 0) { pieceErr.width = 'Required'; valid = false; }
      if (!p.height || isNaN(ph) || ph <= 0) { pieceErr.height = 'Required'; valid = false; }
      if (!p.quantity || isNaN(pq) || pq <= 0) { pieceErr.quantity = 'Required'; valid = false; }
      if (Object.keys(pieceErr).length > 0) newErrors.pieces![i] = pieceErr;
    });

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const sheet: Sheet = {
      width: parseFloat(sheetWidth),
      height: parseFloat(sheetHeight),
      unit,
    };

    const pieceList: Piece[] = pieces.map((p, i) => ({
      width: parseFloat(p.width),
      height: parseFloat(p.height),
      quantity: parseInt(p.quantity),
      label: p.label || `Piece ${i + 1}`,
    }));

    try {
      const layout = optimizeCuts(sheet, pieceList);
      setResult(layout);
      setErrors({});
    } catch (err: unknown) {
      setErrors({ global: err instanceof Error ? err.message : 'An error occurred.' });
      setResult(null);
    }
  };

  // SVG scale factor
  const SVG_MAX = 480;
  const svgScale = result
    ? Math.min(SVG_MAX / result.sheet.width, SVG_MAX / result.sheet.height)
    : 1;

  // Unique pieces for color mapping
  const uniqueLabels = result
    ? Array.from(new Set(result.placements.map((p) => p.piece.label)))
    : [];

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        {/* Sheet dimensions */}
        <div className="bg-white border border-[#bbcabf] rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[18px] font-semibold text-[#131b2e]" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              Sheet Dimensions
            </h3>
            <div className="flex rounded-lg border border-[#bbcabf] overflow-hidden">
              {(['in', 'mm'] as const).map((u) => (
                <button
                  key={u}
                  type="button"
                  onClick={() => setUnit(u)}
                  className={`px-4 py-1.5 text-[13px] font-semibold transition-colors ${
                    unit === u
                      ? 'bg-[#10b981] text-white'
                      : 'bg-white text-[#3c4a42] hover:bg-[#f2f3ff]'
                  }`}
                >
                  {u}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-semibold text-[#131b2e] mb-1">Width ({unit})</label>
              <input
                type="number"
                value={sheetWidth}
                onChange={(e) => { setSheetWidth(e.target.value); setErrors((p) => ({ ...p, sheetWidth: undefined })); }}
                placeholder={unit === 'in' ? '96' : '2440'}
                className={`w-full px-3 py-2 rounded-lg border text-[#131b2e] focus:outline-none focus:ring-2 focus:ring-[#10b981] ${errors.sheetWidth ? 'border-red-400' : 'border-[#bbcabf]'}`}
              />
              {errors.sheetWidth && <p className="mt-1 text-[12px] text-red-600">{errors.sheetWidth}</p>}
            </div>
            <div>
              <label className="block text-[13px] font-semibold text-[#131b2e] mb-1">Height ({unit})</label>
              <input
                type="number"
                value={sheetHeight}
                onChange={(e) => { setSheetHeight(e.target.value); setErrors((p) => ({ ...p, sheetHeight: undefined })); }}
                placeholder={unit === 'in' ? '48' : '1220'}
                className={`w-full px-3 py-2 rounded-lg border text-[#131b2e] focus:outline-none focus:ring-2 focus:ring-[#10b981] ${errors.sheetHeight ? 'border-red-400' : 'border-[#bbcabf]'}`}
              />
              {errors.sheetHeight && <p className="mt-1 text-[12px] text-red-600">{errors.sheetHeight}</p>}
            </div>
          </div>
        </div>

        {/* Pieces */}
        <div className="bg-white border border-[#bbcabf] rounded-xl p-6">
          <h3 className="text-[18px] font-semibold text-[#131b2e] mb-4" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
            Required Pieces
          </h3>
          <div className="space-y-3">
            {pieces.map((piece, i) => {
              const pieceErr = errors.pieces?.[i] ?? {};
              return (
                <div key={i} className="grid grid-cols-12 gap-2 items-start">
                  <div className="col-span-4">
                    {i === 0 && <label className="block text-[12px] font-semibold text-[#6c7a71] mb-1">W × H ({unit})</label>}
                    <div className="flex gap-1 items-center">
                      <input
                        type="number"
                        value={piece.width}
                        onChange={(e) => updatePiece(i, 'width', e.target.value)}
                        placeholder="W"
                        className={`w-full px-2 py-2 rounded-lg border text-[#131b2e] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#10b981] ${pieceErr.width ? 'border-red-400' : 'border-[#bbcabf]'}`}
                      />
                      <span className="text-[#6c7a71] text-[12px]">×</span>
                      <input
                        type="number"
                        value={piece.height}
                        onChange={(e) => updatePiece(i, 'height', e.target.value)}
                        placeholder="H"
                        className={`w-full px-2 py-2 rounded-lg border text-[#131b2e] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#10b981] ${pieceErr.height ? 'border-red-400' : 'border-[#bbcabf]'}`}
                      />
                    </div>
                  </div>
                  <div className="col-span-2">
                    {i === 0 && <label className="block text-[12px] font-semibold text-[#6c7a71] mb-1">Qty</label>}
                    <input
                      type="number"
                      min="1"
                      value={piece.quantity}
                      onChange={(e) => updatePiece(i, 'quantity', e.target.value)}
                      className={`w-full px-2 py-2 rounded-lg border text-[#131b2e] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#10b981] ${pieceErr.quantity ? 'border-red-400' : 'border-[#bbcabf]'}`}
                    />
                  </div>
                  <div className="col-span-5">
                    {i === 0 && <label className="block text-[12px] font-semibold text-[#6c7a71] mb-1">Label (optional)</label>}
                    <input
                      type="text"
                      value={piece.label}
                      onChange={(e) => updatePiece(i, 'label', e.target.value)}
                      placeholder={`Piece ${i + 1}`}
                      className="w-full px-2 py-2 rounded-lg border border-[#bbcabf] text-[#131b2e] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#10b981]"
                    />
                  </div>
                  <div className="col-span-1 flex items-end pb-0.5">
                    {i === 0 && <div className="h-[21px]" />}
                    <button
                      type="button"
                      onClick={() => removePiece(i)}
                      disabled={pieces.length === 1}
                      className="p-2 text-[#6c7a71] hover:text-red-500 transition-colors disabled:opacity-30"
                      aria-label="Remove piece"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          <button
            type="button"
            onClick={addPiece}
            className="mt-4 flex items-center gap-2 text-[#10b981] font-semibold text-[14px] hover:text-[#006c49] transition-colors"
          >
            <Plus size={16} />
            Add piece
          </button>
        </div>

        {errors.global && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-[14px]">
            {errors.global}
          </div>
        )}

        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2 bg-[#10b981] text-white px-8 py-4 rounded-lg font-semibold hover:bg-[#006c49] transition-all shadow-[0_4px_20px_rgba(16,185,129,0.2)]"
          style={{ fontFamily: 'var(--font-space-grotesk)' }}
        >
          <Scissors size={18} />
          Optimize Cut Layout
        </button>
      </form>

      {/* Result */}
      {result && !result.error && (
        <div className="bg-white border border-[#bbcabf] rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[18px] font-semibold text-[#131b2e]" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              Cut Layout
            </h3>
            <div className="flex gap-4 text-[14px]">
              <span className="text-[#3c4a42]">
                <span className="font-semibold text-[#10b981]">{result.wastePercent}%</span> waste
              </span>
              <span className="text-[#3c4a42]">
                <span className="font-semibold text-[#006c49]">{result.placements.length}</span> pieces placed
              </span>
            </div>
          </div>

          {/* SVG diagram */}
          <div className="overflow-auto">
            <svg
              width={result.sheet.width * svgScale}
              height={result.sheet.height * svgScale}
              className="border border-[#bbcabf] rounded-lg bg-[#f2f3ff]"
            >
              {result.placements.map((placement, i) => {
                const colorIndex = uniqueLabels.indexOf(placement.piece.label) % COLORS.length;
                const color = COLORS[colorIndex];
                const w = (placement.rotated ? placement.piece.height : placement.piece.width) * svgScale;
                const h = (placement.rotated ? placement.piece.width : placement.piece.height) * svgScale;
                const x = placement.x * svgScale;
                const y = placement.y * svgScale;
                return (
                  <g key={i}>
                    <rect
                      x={x + 1}
                      y={y + 1}
                      width={w - 2}
                      height={h - 2}
                      fill={color}
                      fillOpacity={0.25}
                      stroke={color}
                      strokeWidth={1.5}
                      rx={2}
                    />
                    {w > 30 && h > 16 && (
                      <text
                        x={x + w / 2}
                        y={y + h / 2}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fontSize={Math.min(11, w / 5)}
                        fill={color}
                        fontWeight="600"
                        fontFamily="monospace"
                      >
                        {placement.piece.label}
                        {placement.rotated ? ' ↺' : ''}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Legend */}
          <div className="mt-4 flex flex-wrap gap-3">
            {uniqueLabels.map((label, i) => (
              <div key={label} className="flex items-center gap-2 text-[13px] text-[#3c4a42]">
                <div
                  className="w-3 h-3 rounded-sm"
                  style={{ backgroundColor: COLORS[i % COLORS.length], opacity: 0.7 }}
                />
                {label}
              </div>
            ))}
          </div>
        </div>
      )}

      {result?.error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-[14px]">
          {result.error}
        </div>
      )}
    </div>
  );
}
