import { ChallengeConfig, Strictness, TimeOfDay } from '@engine';
import { ChallengePreset, PresetCategory, PresetItem } from './repository';

export interface TemplateFile {
  schemaVersion: 1;
  name: string;
  source: string;
  preset: ChallengePreset;
}

const STRICTNESS: Strictness[] = ['flexible', 'strict', 'hardcore'];
const TIME_OF_DAY: TimeOfDay[] = ['morning', 'day', 'evening', 'bed'];

export function serializeTemplate(preset: ChallengePreset): TemplateFile {
  return { schemaVersion: 1, name: preset.name, source: 'eighty-export', preset };
}

export type ParseResult = { ok: true; preset: ChallengePreset } | { ok: false; error: string };

/** Parse + structurally validate an imported template file's JSON text. */
export function parseTemplateJson(text: string): ParseResult {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return { ok: false, error: 'Not valid JSON.' };
  }
  if (typeof raw !== 'object' || raw === null) return { ok: false, error: 'Expected a JSON object.' };
  const obj = raw as Record<string, unknown>;
  if (obj.schemaVersion !== 1) return { ok: false, error: 'Unsupported or missing schemaVersion.' };
  const preset = obj.preset;
  if (typeof preset !== 'object' || preset === null) return { ok: false, error: 'Missing "preset" object.' };
  const p = preset as Record<string, unknown>;

  if (typeof p.name !== 'string' || p.name.trim() === '') return { ok: false, error: 'Preset needs a name.' };
  if (typeof p.durationDays !== 'number') return { ok: false, error: 'Preset needs a numeric durationDays.' };
  if (typeof p.dailyThresholdPct !== 'number') return { ok: false, error: 'Preset needs a numeric dailyThresholdPct.' };
  if (typeof p.challengeThresholdPct !== 'number') {
    return { ok: false, error: 'Preset needs a numeric challengeThresholdPct.' };
  }
  if (typeof p.strictness !== 'string' || !STRICTNESS.includes(p.strictness as Strictness)) {
    return { ok: false, error: 'Preset strictness must be flexible, strict, or hardcore.' };
  }
  if (typeof p.noRepeatMiss !== 'boolean') return { ok: false, error: 'Preset needs a boolean noRepeatMiss.' };
  if (typeof p.travelExemption !== 'boolean') return { ok: false, error: 'Preset needs a boolean travelExemption.' };
  if (!Array.isArray(p.categories)) return { ok: false, error: 'Preset needs a categories array.' };
  if (!Array.isArray(p.items)) return { ok: false, error: 'Preset needs an items array.' };

  const categories: PresetCategory[] = [];
  for (const c of p.categories) {
    if (typeof c !== 'object' || c === null) return { ok: false, error: 'Each category must be an object.' };
    const rec = c as Record<string, unknown>;
    if (typeof rec.id !== 'string' || typeof rec.name !== 'string') {
      return { ok: false, error: 'Each category needs an id and a name.' };
    }
    categories.push({ id: rec.id, name: rec.name });
  }

  const items: PresetItem[] = [];
  for (const it of p.items) {
    if (typeof it !== 'object' || it === null) return { ok: false, error: 'Each item must be an object.' };
    const rec = it as Record<string, unknown>;
    if (typeof rec.id !== 'string' || typeof rec.categoryId !== 'string' || typeof rec.label !== 'string') {
      return { ok: false, error: 'Each item needs an id, categoryId, and label.' };
    }
    if (typeof rec.isBonus !== 'boolean') return { ok: false, error: 'Each item needs a boolean isBonus.' };
    if (typeof rec.timeOfDay !== 'string' || !TIME_OF_DAY.includes(rec.timeOfDay as TimeOfDay)) {
      return { ok: false, error: 'Each item needs a valid timeOfDay.' };
    }
    items.push({
      id: rec.id,
      categoryId: rec.categoryId,
      label: rec.label,
      isBonus: rec.isBonus,
      timeOfDay: rec.timeOfDay as TimeOfDay,
    });
  }

  return {
    ok: true,
    preset: {
      name: p.name,
      durationDays: p.durationDays,
      dailyThresholdPct: p.dailyThresholdPct,
      challengeThresholdPct: p.challengeThresholdPct,
      strictness: p.strictness as Strictness,
      noRepeatMiss: p.noRepeatMiss,
      travelExemption: p.travelExemption,
      categories,
      items,
    },
  };
}

export function presetToConfig(preset: ChallengePreset): ChallengeConfig {
  return {
    durationDays: preset.durationDays,
    dailyThresholdPct: preset.dailyThresholdPct,
    challengeThresholdPct: preset.challengeThresholdPct,
    strictness: preset.strictness,
    noRepeatMiss: preset.noRepeatMiss,
    travelExemption: preset.travelExemption,
    items: preset.items.map(({ id, categoryId, label, isBonus, timeOfDay }) => ({
      id,
      categoryId,
      label,
      isBonus,
      timeOfDay,
    })),
  };
}
