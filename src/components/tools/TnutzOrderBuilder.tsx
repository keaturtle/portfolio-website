'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Download, Copy, Package, AlertTriangle } from 'lucide-react';
import {
  loadOrderList,
  addExtrusion,
  addHardware,
  removeItem,
  clearOrderList,
  exportToJson,
} from '@/lib/tnutzStorage';
import { TnutzOrderList, ExtrusionOrder, HardwareOrder, EndMachining, FractionValue } from '@/lib/types';

const FRACTION_OPTIONS: FractionValue[] = [
  '', '1/16', '1/8', '3/16', '1/4', '5/16', '3/8', '7/16',
  '1/2', '9/16', '5/8', '11/16', '3/4', '13/16', '7/8', '15/16',
];

const END_OPTIONS: EndMachining[] = [
  'No machining',
  '1/4-20 x 1" deep tap',
  'Access Hole - Style "C", thru "R"',
  'Access Hole - Style "C", thru "S"',
  'Access Holes - Style "C", thru "R" & "S"',
  'Access Hole - Style "C", thru "T"',
];

const SKU_OPTIONS = ['ex-1010', 'ex-1020'] as const;

interface ExtrusionForm {
  sku: 'ex-1010' | 'ex-1020';
  length: string;
  fraction: FractionValue;
  qty: string;
  end1: EndMachining;
  end2: EndMachining;
}

interface HardwareForm {
  sku: string;
  qty: string;
  label: string;
  needs_review: string;
}

interface FormErrors {
  length?: string;
  qty?: string;
  hwQty?: string;
  hwLabel?: string;
}

const defaultExtrusion: ExtrusionForm = {
  sku: 'ex-1010',
  length: '',
  fraction: '',
  qty: '1',
  end1: 'No machining',
  end2: 'No machining',
};

const defaultHardware: HardwareForm = {
  sku: '',
  qty: '1',
  label: '',
  needs_review: '',
};

export default function TnutzOrderBuilder() {
  const [orders, setOrders] = useState<TnutzOrderList>({ extrusions: [], hardware: [] });
  const [storageAvailable, setStorageAvailable] = useState(true);
  const [extForm, setExtForm] = useState<ExtrusionForm>(defaultExtrusion);
  const [hwForm, setHwForm] = useState<HardwareForm>(defaultHardware);
  const [extErrors, setExtErrors] = useState<FormErrors>({});
  const [hwErrors, setHwErrors] = useState<FormErrors>({});
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'extrusions' | 'hardware'>('extrusions');

  useEffect(() => {
    try {
      const list = loadOrderList();
      setOrders(list);
    } catch {
      setStorageAvailable(false);
    }
  }, []);

  const validateExtrusion = (): boolean => {
    const errors: FormErrors = {};
    const len = parseInt(extForm.length);
    const qty = parseInt(extForm.qty);
    if (!extForm.length || isNaN(len) || len <= 0) errors.length = 'Enter a positive whole-inch length.';
    if (!extForm.qty || isNaN(qty) || qty <= 0) errors.qty = 'Enter a positive quantity.';
    setExtErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateHardware = (): boolean => {
    const errors: FormErrors = {};
    const qty = parseInt(hwForm.qty);
    if (!hwForm.label.trim()) errors.hwLabel = 'Label is required.';
    if (!hwForm.qty || isNaN(qty) || qty <= 0) errors.hwQty = 'Enter a positive quantity.';
    setHwErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddExtrusion = () => {
    if (!validateExtrusion()) return;
    const item: ExtrusionOrder = {
      sku: extForm.sku,
      length: extForm.length,
      fraction: extForm.fraction,
      qty: parseInt(extForm.qty),
      end1: extForm.end1,
      end2: extForm.end2,
    };
    const updated = addExtrusion(item);
    setOrders(updated);
    setExtForm(defaultExtrusion);
    setExtErrors({});
  };

  const handleAddHardware = () => {
    if (!validateHardware()) return;
    const item: HardwareOrder = {
      sku: hwForm.sku || null,
      qty: parseInt(hwForm.qty),
      label: hwForm.label,
      needs_review: hwForm.needs_review || undefined,
    };
    const updated = addHardware(item);
    setOrders(updated);
    setHwForm(defaultHardware);
    setHwErrors({});
  };

  const handleRemove = (type: 'extrusion' | 'hardware', index: number) => {
    const updated = removeItem(type, index);
    setOrders(updated);
  };

  const handleExport = () => {
    const json = exportToJson(orders);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tnutz_order_data.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = async () => {
    const json = exportToJson(orders);
    await navigator.clipboard.writeText(json);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    if (confirm('Clear all orders? This cannot be undone.')) {
      const updated = clearOrderList();
      setOrders(updated);
    }
  };

  const totalItems = orders.extrusions.length + orders.hardware.length;

  return (
    <div className="space-y-6">
      {!storageAvailable && (
        <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-700">
          <AlertTriangle size={18} />
          <span className="text-[14px]">Orders cannot be saved in this browser mode (private/incognito).</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex rounded-xl border border-[#bbcabf] overflow-hidden">
        {(['extrusions', 'hardware'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 text-[14px] font-semibold capitalize transition-colors ${
              activeTab === tab
                ? 'bg-[#10b981] text-white'
                : 'bg-white text-[#3c4a42] hover:bg-[#f2f3ff]'
            }`}
            style={{ fontFamily: 'var(--font-space-grotesk)' }}
          >
            {tab} ({tab === 'extrusions' ? orders.extrusions.length : orders.hardware.length})
          </button>
        ))}
      </div>

      {/* Extrusion form */}
      {activeTab === 'extrusions' && (
        <div className="bg-white border border-[#bbcabf] rounded-xl p-6 space-y-4">
          <h3 className="text-[16px] font-semibold text-[#131b2e]" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
            Add Extrusion
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-[12px] font-semibold text-[#6c7a71] mb-1">SKU</label>
              <select
                value={extForm.sku}
                onChange={(e) => setExtForm((p) => ({ ...p, sku: e.target.value as 'ex-1010' | 'ex-1020' }))}
                className="w-full px-3 py-2 rounded-lg border border-[#bbcabf] text-[#131b2e] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#10b981]"
              >
                {SKU_OPTIONS.map((s) => <option key={s} value={s}>{s.toUpperCase()}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-[#6c7a71] mb-1">Length (whole in.)</label>
              <input
                type="number"
                min="1"
                value={extForm.length}
                onChange={(e) => { setExtForm((p) => ({ ...p, length: e.target.value })); setExtErrors((p) => ({ ...p, length: undefined })); }}
                placeholder="e.g. 35"
                className={`w-full px-3 py-2 rounded-lg border text-[#131b2e] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#10b981] ${extErrors.length ? 'border-red-400' : 'border-[#bbcabf]'}`}
              />
              {extErrors.length && <p className="mt-1 text-[11px] text-red-600">{extErrors.length}</p>}
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-[#6c7a71] mb-1">Fraction</label>
              <select
                value={extForm.fraction}
                onChange={(e) => setExtForm((p) => ({ ...p, fraction: e.target.value as FractionValue }))}
                className="w-full px-3 py-2 rounded-lg border border-[#bbcabf] text-[#131b2e] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#10b981]"
              >
                {FRACTION_OPTIONS.map((f) => <option key={f} value={f}>{f === '' ? 'None' : f + '"'}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-[#6c7a71] mb-1">Qty</label>
              <input
                type="number"
                min="1"
                value={extForm.qty}
                onChange={(e) => { setExtForm((p) => ({ ...p, qty: e.target.value })); setExtErrors((p) => ({ ...p, qty: undefined })); }}
                className={`w-full px-3 py-2 rounded-lg border text-[#131b2e] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#10b981] ${extErrors.qty ? 'border-red-400' : 'border-[#bbcabf]'}`}
              />
              {extErrors.qty && <p className="mt-1 text-[11px] text-red-600">{extErrors.qty}</p>}
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-[#6c7a71] mb-1">End 1</label>
              <select
                value={extForm.end1}
                onChange={(e) => setExtForm((p) => ({ ...p, end1: e.target.value as EndMachining }))}
                className="w-full px-3 py-2 rounded-lg border border-[#bbcabf] text-[#131b2e] text-[13px] focus:outline-none focus:ring-2 focus:ring-[#10b981]"
              >
                {END_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-[#6c7a71] mb-1">End 2</label>
              <select
                value={extForm.end2}
                onChange={(e) => setExtForm((p) => ({ ...p, end2: e.target.value as EndMachining }))}
                className="w-full px-3 py-2 rounded-lg border border-[#bbcabf] text-[#131b2e] text-[13px] focus:outline-none focus:ring-2 focus:ring-[#10b981]"
              >
                {END_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          </div>
          <button
            onClick={handleAddExtrusion}
            className="flex items-center gap-2 bg-[#10b981] text-white px-5 py-2.5 rounded-lg font-semibold text-[14px] hover:bg-[#006c49] transition-all"
            style={{ fontFamily: 'var(--font-space-grotesk)' }}
          >
            <Plus size={16} />
            Add Extrusion
          </button>

          {/* Extrusion table */}
          {orders.extrusions.length > 0 && (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-[#bbcabf]">
                    {['SKU', 'Length', 'Fraction', 'Qty', 'End 1', 'End 2', ''].map((h) => (
                      <th key={h} className="text-left py-2 px-2 text-[#6c7a71] font-semibold uppercase tracking-wider text-[11px]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {orders.extrusions.map((ext, i) => (
                    <tr key={i} className="border-b border-[#f2f3ff] hover:bg-[#f2f3ff] transition-colors">
                      <td className="py-2 px-2 font-mono text-[#006c49]">{ext.sku.toUpperCase()}</td>
                      <td className="py-2 px-2">{ext.length}&quot;</td>
                      <td className="py-2 px-2">{ext.fraction || '—'}</td>
                      <td className="py-2 px-2 font-semibold">{ext.qty}</td>
                      <td className="py-2 px-2 text-[#3c4a42] max-w-[120px] truncate">{ext.end1}</td>
                      <td className="py-2 px-2 text-[#3c4a42] max-w-[120px] truncate">{ext.end2}</td>
                      <td className="py-2 px-2">
                        <button onClick={() => handleRemove('extrusion', i)} className="text-[#6c7a71] hover:text-red-500 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Hardware form */}
      {activeTab === 'hardware' && (
        <div className="bg-white border border-[#bbcabf] rounded-xl p-6 space-y-4">
          <h3 className="text-[16px] font-semibold text-[#131b2e]" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
            Add Hardware
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div className="col-span-2 md:col-span-1">
              <label className="block text-[12px] font-semibold text-[#6c7a71] mb-1">Label *</label>
              <input
                type="text"
                value={hwForm.label}
                onChange={(e) => { setHwForm((p) => ({ ...p, label: e.target.value })); setHwErrors((p) => ({ ...p, hwLabel: undefined })); }}
                placeholder="e.g. End Fastener 1/4-20"
                className={`w-full px-3 py-2 rounded-lg border text-[#131b2e] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#10b981] ${hwErrors.hwLabel ? 'border-red-400' : 'border-[#bbcabf]'}`}
              />
              {hwErrors.hwLabel && <p className="mt-1 text-[11px] text-red-600">{hwErrors.hwLabel}</p>}
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-[#6c7a71] mb-1">SKU (optional)</label>
              <input
                type="text"
                value={hwForm.sku}
                onChange={(e) => setHwForm((p) => ({ ...p, sku: e.target.value }))}
                placeholder="e.g. ef-010-1-4-20"
                className="w-full px-3 py-2 rounded-lg border border-[#bbcabf] text-[#131b2e] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#10b981]"
              />
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-[#6c7a71] mb-1">Qty *</label>
              <input
                type="number"
                min="1"
                value={hwForm.qty}
                onChange={(e) => { setHwForm((p) => ({ ...p, qty: e.target.value })); setHwErrors((p) => ({ ...p, hwQty: undefined })); }}
                className={`w-full px-3 py-2 rounded-lg border text-[#131b2e] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#10b981] ${hwErrors.hwQty ? 'border-red-400' : 'border-[#bbcabf]'}`}
              />
              {hwErrors.hwQty && <p className="mt-1 text-[11px] text-red-600">{hwErrors.hwQty}</p>}
            </div>
            <div className="col-span-2 md:col-span-3">
              <label className="block text-[12px] font-semibold text-[#6c7a71] mb-1">Needs Review Note (optional)</label>
              <input
                type="text"
                value={hwForm.needs_review}
                onChange={(e) => setHwForm((p) => ({ ...p, needs_review: e.target.value }))}
                placeholder="e.g. Could not find on TNUTZ — add manually"
                className="w-full px-3 py-2 rounded-lg border border-[#bbcabf] text-[#131b2e] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#10b981]"
              />
            </div>
          </div>
          <button
            onClick={handleAddHardware}
            className="flex items-center gap-2 bg-[#10b981] text-white px-5 py-2.5 rounded-lg font-semibold text-[14px] hover:bg-[#006c49] transition-all"
            style={{ fontFamily: 'var(--font-space-grotesk)' }}
          >
            <Plus size={16} />
            Add Hardware
          </button>

          {/* Hardware table */}
          {orders.hardware.length > 0 && (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-[#bbcabf]">
                    {['Label', 'SKU', 'Qty', 'Note', ''].map((h) => (
                      <th key={h} className="text-left py-2 px-2 text-[#6c7a71] font-semibold uppercase tracking-wider text-[11px]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {orders.hardware.map((hw, i) => (
                    <tr key={i} className="border-b border-[#f2f3ff] hover:bg-[#f2f3ff] transition-colors">
                      <td className="py-2 px-2 font-semibold text-[#131b2e]">{hw.label}</td>
                      <td className="py-2 px-2 font-mono text-[#006c49]">{hw.sku ?? '—'}</td>
                      <td className="py-2 px-2 font-semibold">{hw.qty}</td>
                      <td className="py-2 px-2 text-[#6c7a71] max-w-[160px] truncate">{hw.needs_review ?? '—'}</td>
                      <td className="py-2 px-2">
                        <button onClick={() => handleRemove('hardware', i)} className="text-[#6c7a71] hover:text-red-500 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Export actions */}
      {totalItems > 0 && (
        <div className="bg-[#f2f3ff] border border-[#bbcabf] rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-[16px] font-semibold text-[#131b2e]" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                Export Order
              </h3>
              <p className="text-[13px] text-[#3c4a42] mt-1">
                {orders.extrusions.length} extrusion{orders.extrusions.length !== 1 ? 's' : ''} · {orders.hardware.length} hardware item{orders.hardware.length !== 1 ? 's' : ''}
              </p>
            </div>
            <Package size={24} className="text-[#10b981]" />
          </div>
          <p className="text-[13px] text-[#3c4a42] mb-4">
            Download the JSON file and replace the contents of <code className="bg-white px-1 py-0.5 rounded text-[#006c49] font-mono">order_data.py</code> with it, then run <code className="bg-white px-1 py-0.5 rounded text-[#006c49] font-mono">tnutz_order.py</code> to auto-fill your cart.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleExport}
              className="flex items-center gap-2 bg-[#10b981] text-white px-5 py-2.5 rounded-lg font-semibold text-[14px] hover:bg-[#006c49] transition-all"
              style={{ fontFamily: 'var(--font-space-grotesk)' }}
            >
              <Download size={16} />
              Download JSON
            </button>
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 border border-[#bbcabf] bg-white text-[#131b2e] px-5 py-2.5 rounded-lg font-semibold text-[14px] hover:bg-[#eaedff] transition-all"
              style={{ fontFamily: 'var(--font-space-grotesk)' }}
            >
              <Copy size={16} />
              {copied ? 'Copied!' : 'Copy JSON'}
            </button>
            <button
              onClick={handleClear}
              className="flex items-center gap-2 border border-red-200 bg-white text-red-600 px-5 py-2.5 rounded-lg font-semibold text-[14px] hover:bg-red-50 transition-all ml-auto"
              style={{ fontFamily: 'var(--font-space-grotesk)' }}
            >
              <Trash2 size={16} />
              Clear All
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
