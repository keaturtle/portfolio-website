import { ExtrusionOrder, HardwareOrder, TnutzOrderList } from './types';

const STORAGE_KEY = 'tnutz-order-list';

const EMPTY_LIST: TnutzOrderList = { extrusions: [], hardware: [] };

function isLocalStorageAvailable(): boolean {
  try {
    const test = '__tnutz_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

export function loadOrderList(): TnutzOrderList {
  if (!isLocalStorageAvailable()) return { ...EMPTY_LIST };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...EMPTY_LIST };
    const parsed = JSON.parse(raw) as TnutzOrderList;
    if (!parsed.extrusions || !parsed.hardware) throw new Error('Invalid structure');
    return parsed;
  } catch {
    console.warn('[TnutzStorage] Corrupted data — resetting to empty list.');
    return { ...EMPTY_LIST };
  }
}

export function saveOrderList(list: TnutzOrderList): void {
  if (!isLocalStorageAvailable()) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export function addExtrusion(item: ExtrusionOrder): TnutzOrderList {
  const list = loadOrderList();
  const updated = { ...list, extrusions: [...list.extrusions, item] };
  saveOrderList(updated);
  return updated;
}

export function addHardware(item: HardwareOrder): TnutzOrderList {
  const list = loadOrderList();
  const updated = { ...list, hardware: [...list.hardware, item] };
  saveOrderList(updated);
  return updated;
}

export function removeItem(type: 'extrusion' | 'hardware', index: number): TnutzOrderList {
  const list = loadOrderList();
  if (type === 'extrusion') {
    const extrusions = list.extrusions.filter((_, i) => i !== index);
    const updated = { ...list, extrusions };
    saveOrderList(updated);
    return updated;
  } else {
    const hardware = list.hardware.filter((_, i) => i !== index);
    const updated = { ...list, hardware };
    saveOrderList(updated);
    return updated;
  }
}

export function clearOrderList(): TnutzOrderList {
  saveOrderList({ ...EMPTY_LIST });
  return { ...EMPTY_LIST };
}

/**
 * Exports the order list as a Python-compatible JSON string
 * matching the order_data.py schema used by tnutz_order.py.
 */
export function exportToJson(list: TnutzOrderList): string {
  return JSON.stringify(
    {
      EXTRUSION_ORDERS: list.extrusions,
      HARDWARE_ORDERS: list.hardware,
    },
    null,
    2
  );
}
