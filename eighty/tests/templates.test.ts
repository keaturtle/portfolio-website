import { ChallengePreset } from '@/data/repository';
import { parseTemplateJson, presetToConfig, serializeTemplate } from '@/data/templates';

const PRESET: ChallengePreset = {
  name: 'Share me',
  durationDays: 30,
  dailyThresholdPct: 80,
  challengeThresholdPct: 80,
  strictness: 'flexible',
  noRepeatMiss: true,
  travelExemption: false,
  categories: [{ id: 'c', name: 'C' }],
  items: [
    { id: 'do', categoryId: 'c', label: 'Do a thing', isBonus: false, timeOfDay: 'day' },
    { id: 'avoid', categoryId: 'c', label: 'Skip a thing', isBonus: false, timeOfDay: 'day', isAvoidance: true },
    { id: 'extra', categoryId: 'c', label: 'Extra', isBonus: true, timeOfDay: 'evening' },
  ],
};

describe('template share round-trip', () => {
  it('serialize → parse preserves every field, including isAvoidance', () => {
    const parsed = parseTemplateJson(JSON.stringify(serializeTemplate(PRESET)));
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(parsed.preset.name).toBe('Share me');
    expect(parsed.preset.items.find((i) => i.id === 'avoid')?.isAvoidance).toBe(true);
    expect(parsed.preset.items.find((i) => i.id === 'do')?.isAvoidance).toBe(false);
    expect(parsed.preset.items.find((i) => i.id === 'extra')?.isBonus).toBe(true);
  });

  it('files exported before the avoidance feature parse with isAvoidance false', () => {
    const file = serializeTemplate(PRESET);
    const legacy = JSON.parse(JSON.stringify(file)) as ReturnType<typeof serializeTemplate>;
    for (const item of legacy.preset.items) delete (item as unknown as Record<string, unknown>).isAvoidance;
    const parsed = parseTemplateJson(JSON.stringify(legacy));
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(parsed.preset.items.every((i) => i.isAvoidance === false)).toBe(true);
  });

  it('rejects malformed input with a readable error', () => {
    expect(parseTemplateJson('not json')).toMatchObject({ ok: false, error: 'Not valid JSON.' });
    expect(parseTemplateJson('{}')).toMatchObject({ ok: false });
    expect(parseTemplateJson(JSON.stringify({ schemaVersion: 99, preset: {} }))).toMatchObject({
      ok: false,
      error: 'Unsupported or missing schemaVersion.',
    });
  });

  it('presetToConfig hands the engine only what it scores with', () => {
    const cfg = presetToConfig(PRESET);
    expect(cfg.items).toHaveLength(3);
    expect(cfg.items.every((i) => !('isAvoidance' in i))).toBe(true);
  });
});
