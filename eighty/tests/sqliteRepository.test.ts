import { SqliteRepository } from '@/data/sqlite';
import { ChallengePreset, PresetItem } from '@/data/repository';
import { openDatabaseSync } from './expoSqliteMock';

const TODAY = '2026-07-27';

const PRESET: ChallengePreset = {
  name: 'Test 80',
  durationDays: 10,
  dailyThresholdPct: 80,
  challengeThresholdPct: 80,
  strictness: 'flexible',
  noRepeatMiss: true,
  travelExemption: true,
  categories: [
    { id: 'main', name: 'Main' },
    { id: 'extra', name: 'Extra' },
  ],
  items: [
    { id: 'a', categoryId: 'main', label: 'Item A', isBonus: false, timeOfDay: 'morning' },
    { id: 'b', categoryId: 'main', label: 'Item B', isBonus: false, timeOfDay: 'day' },
    { id: 'avoid', categoryId: 'main', label: 'No slips', isBonus: false, timeOfDay: 'day', isAvoidance: true },
    { id: 'bonus', categoryId: 'extra', label: 'Bonus', isBonus: true, timeOfDay: 'evening' },
  ],
};

let n = 0;
function fresh(): { repo: SqliteRepository; name: string } {
  const name = `test-${++n}.db`;
  return { repo: new SqliteRepository(name), name };
}

describe('startChallenge', () => {
  it('creates challenge, attempt, and an open day 0 labelled today', () => {
    const { repo } = fresh();
    const active = repo.startChallenge(PRESET, TODAY);
    expect(active.name).toBe('Test 80');
    expect(active.items).toHaveLength(4);
    expect(active.items.find((i) => i.id === 'avoid')?.isAvoidance).toBe(true);
    const logs = repo.getLogs(active.attemptId);
    expect(logs).toHaveLength(1);
    expect(logs[0]).toMatchObject({ dayIndex: 0, localDate: TODAY, closed: false });
  });

  it('seeds avoidance items as completed on the open day', () => {
    const { repo } = fresh();
    const active = repo.startChallenge(PRESET, TODAY);
    const logs = repo.getLogs(active.attemptId);
    expect(logs[0]!.completedItemIds).toEqual(['avoid']);
  });

  it('back-dated start pre-creates closed, empty days and an open day for today', () => {
    const { repo } = fresh();
    const active = repo.startChallenge(PRESET, TODAY, '2026-07-24');
    const logs = repo.getLogs(active.attemptId);
    expect(logs.map((l) => [l.dayIndex, l.localDate, l.closed])).toEqual([
      [0, '2026-07-24', true],
      [1, '2026-07-25', true],
      [2, '2026-07-26', true],
      [3, '2026-07-27', false],
    ]);
    // Back-dated days are empty (they count as missed until filled in); today gets avoidance seeds.
    expect(logs[0]!.completedItemIds).toEqual([]);
    expect(logs[3]!.completedItemIds).toEqual(['avoid']);
  });

  it('never pre-creates more days than the challenge duration', () => {
    const { repo } = fresh();
    const active = repo.startChallenge(PRESET, TODAY, '2026-06-01'); // 56 days ago > 10-day duration
    const logs = repo.getLogs(active.attemptId);
    expect(logs).toHaveLength(10);
    expect(logs.every((l) => l.closed)).toBe(true); // window fully elapsed
  });

  it('archives the previously active challenge (single-active invariant)', () => {
    const { repo } = fresh();
    const first = repo.startChallenge(PRESET, TODAY);
    const second = repo.startChallenge({ ...PRESET, name: 'Second' }, TODAY);
    expect(repo.getActive()?.challengeId).toBe(second.challengeId);
    const list = repo.listChallenges();
    expect(list.find((c) => c.challengeId === first.challengeId)?.status).toBe('archived');
    expect(list.find((c) => c.challengeId === second.challengeId)?.status).toBe('active');
  });
});

describe('editing days', () => {
  it('persists item toggles on the open day', () => {
    const { repo } = fresh();
    const active = repo.startChallenge(PRESET, TODAY);
    repo.setItemDone(active.attemptId, 0, 'a', true);
    expect(repo.getLogs(active.attemptId)[0]!.completedItemIds).toContain('a');
    repo.setItemDone(active.attemptId, 0, 'a', false);
    expect(repo.getLogs(active.attemptId)[0]!.completedItemIds).not.toContain('a');
  });

  it('persists item toggles and meta on CLOSED (past) days', () => {
    const { repo } = fresh();
    const active = repo.startChallenge(PRESET, TODAY, '2026-07-25');
    // Day 0 (2026-07-25) is closed. Edits must still stick.
    repo.setItemDone(active.attemptId, 0, 'a', true);
    repo.setItemDone(active.attemptId, 0, 'b', true);
    repo.setDayMeta(active.attemptId, 0, { satisfaction: 4, notes: 'backfilled' });
    const day0 = repo.getLogs(active.attemptId)[0]!;
    expect(day0.closed).toBe(true);
    expect(day0.completedItemIds.sort()).toEqual(['a', 'b']);
    expect(day0.satisfaction).toBe(4);
    expect(day0.notes).toBe('backfilled');
  });
});

describe('deleteChallenge', () => {
  function rowCount(name: string, table: string, where: string, id: number): number {
    const db = openDatabaseSync(name);
    return db.getAllSync<{ n: number }>(`SELECT COUNT(*) AS n FROM ${table} WHERE ${where} = ?`, [id])[0]!.n;
  }

  it('removes the challenge and every child row (no orphans, FKs on)', () => {
    const { repo, name } = fresh();
    const active = repo.startChallenge(PRESET, TODAY, '2026-07-24');
    repo.setItemDone(active.attemptId, 0, 'a', true);
    repo.closeDay(active.attemptId, 3, '2026-07-28');

    repo.deleteChallenge(active.challengeId);

    expect(repo.getActive()).toBeNull();
    expect(repo.listChallenges()).toHaveLength(0);
    expect(repo.getChallengeDetail(active.challengeId)).toBeNull();
    expect(rowCount(name, 'challenge', 'id', active.challengeId)).toBe(0);
    expect(rowCount(name, 'attempt', 'challenge_id', active.challengeId)).toBe(0);
    expect(rowCount(name, 'category', 'challenge_id', active.challengeId)).toBe(0);
    expect(rowCount(name, 'item', 'challenge_id', active.challengeId)).toBe(0);
    expect(rowCount(name, 'day', 'attempt_id', active.attemptId)).toBe(0);
    const db = openDatabaseSync(name);
    expect(db.getAllSync(`SELECT * FROM day_item`)).toHaveLength(0);
  });

  it('deletes an archived challenge without touching the active one', () => {
    const { repo } = fresh();
    const first = repo.startChallenge(PRESET, TODAY);
    repo.setItemDone(first.attemptId, 0, 'a', true);
    const second = repo.startChallenge({ ...PRESET, name: 'Second' }, TODAY);

    repo.deleteChallenge(first.challengeId);

    expect(repo.listChallenges().map((c) => c.challengeId)).toEqual([second.challengeId]);
    expect(repo.getActive()?.challengeId).toBe(second.challengeId);
    expect(repo.getLogs(second.attemptId)).toHaveLength(1);
  });

  it('foreign keys are actually enforced in this harness', () => {
    const { name } = fresh();
    new SqliteRepository(name); // runs migrate() incl. PRAGMA foreign_keys = ON
    const db = openDatabaseSync(name);
    expect(() =>
      db.runSync(`INSERT INTO day (attempt_id, day_index, local_date) VALUES (999, 0, '2026-01-01')`),
    ).toThrow();
  });
});

describe('closeDay', () => {
  it('closes the open day and opens the next one with avoidance seeded', () => {
    const { repo } = fresh();
    const active = repo.startChallenge(PRESET, TODAY);
    repo.closeDay(active.attemptId, 0, '2026-07-28');
    const logs = repo.getLogs(active.attemptId);
    expect(logs).toHaveLength(2);
    expect(logs[0]).toMatchObject({ dayIndex: 0, closed: true });
    expect(logs[1]).toMatchObject({ dayIndex: 1, localDate: '2026-07-28', closed: false });
    expect(logs[1]!.completedItemIds).toEqual(['avoid']);
  });

  it('does not open a day past the challenge duration', () => {
    const { repo } = fresh();
    const short = { ...PRESET, durationDays: 1 };
    const active = repo.startChallenge(short, TODAY);
    repo.closeDay(active.attemptId, 0, '2026-07-28');
    const logs = repo.getLogs(active.attemptId);
    expect(logs).toHaveLength(1);
    expect(logs[0]!.closed).toBe(true);
  });

  it('records skipped calendar days as closed, empty (missed) days', () => {
    const { repo } = fresh();
    const active = repo.startChallenge(PRESET, TODAY);
    // User disappears for two days: open day is 07-27, they come back on 07-30.
    repo.closeDay(active.attemptId, 0, '2026-07-30');
    const logs = repo.getLogs(active.attemptId);
    expect(logs.map((l) => [l.dayIndex, l.localDate, l.closed])).toEqual([
      [0, '2026-07-27', true],
      [1, '2026-07-28', true],
      [2, '2026-07-29', true],
      [3, '2026-07-30', false],
    ]);
    // Skipped days are fully empty — they count as missed, no avoidance credit.
    expect(logs[1]!.completedItemIds).toEqual([]);
    expect(logs[2]!.completedItemIds).toEqual([]);
    // The freshly opened day gets its avoidance seeds as usual.
    expect(logs[3]!.completedItemIds).toEqual(['avoid']);
  });

  it('caps gap fill at the challenge duration (long absence ends the challenge)', () => {
    const { repo } = fresh();
    const short = { ...PRESET, durationDays: 3 };
    const active = repo.startChallenge(short, TODAY);
    repo.closeDay(active.attemptId, 0, '2026-08-10'); // 14 days later, only 3-day window
    const logs = repo.getLogs(active.attemptId);
    expect(logs.map((l) => [l.dayIndex, l.localDate, l.closed])).toEqual([
      [0, '2026-07-27', true],
      [1, '2026-07-28', true],
      [2, '2026-07-29', true],
    ]);
  });

  it('is idempotent under a double tap (same close called twice)', () => {
    const { repo } = fresh();
    const active = repo.startChallenge(PRESET, TODAY);
    repo.setItemDone(active.attemptId, 0, 'a', true);
    repo.closeDay(active.attemptId, 0, '2026-07-30');
    const first = repo.getLogs(active.attemptId);
    repo.closeDay(active.attemptId, 0, '2026-07-30');
    const second = repo.getLogs(active.attemptId);
    expect(second).toEqual(first);
  });

  it('gap-created missed days can be back-filled like any other past day', () => {
    const { repo } = fresh();
    const active = repo.startChallenge(PRESET, TODAY);
    repo.closeDay(active.attemptId, 0, '2026-07-30'); // days 1–2 created as missed
    repo.setItemDone(active.attemptId, 1, 'a', true);
    repo.setItemDone(active.attemptId, 1, 'avoid', true);
    repo.setDayMeta(active.attemptId, 1, { notes: 'was actually on it' });
    const day1 = repo.getLogs(active.attemptId)[1]!;
    expect(day1.closed).toBe(true);
    expect(day1.completedItemIds.sort()).toEqual(['a', 'avoid']);
    expect(day1.notes).toBe('was actually on it');
  });
});

describe('config, activation, settings', () => {
  it('updateChallengeConfig updates only the provided fields', () => {
    const { repo } = fresh();
    const active = repo.startChallenge(PRESET, TODAY);
    repo.updateChallengeConfig(active.challengeId, { name: 'Renamed', dailyThresholdPct: 90, noRepeatMiss: false });
    const detail = repo.getChallengeDetail(active.challengeId)!;
    expect(detail.name).toBe('Renamed');
    expect(detail.config.dailyThresholdPct).toBe(90);
    expect(detail.config.noRepeatMiss).toBe(false);
    expect(detail.config.durationDays).toBe(10); // untouched
  });

  it('updateChallengeChecklist removes an item and its completions, keeps the rest', () => {
    const { repo, name } = fresh();
    const active = repo.startChallenge(PRESET, TODAY);
    repo.setItemDone(active.attemptId, 0, 'a', true);
    repo.setItemDone(active.attemptId, 0, 'b', true);

    const kept = PRESET.items.filter((it) => it.id !== 'b');
    repo.updateChallengeChecklist(active.challengeId, PRESET.categories, kept);

    const detail = repo.getChallengeDetail(active.challengeId)!;
    expect(detail.items.map((i) => i.id).sort()).toEqual(['a', 'avoid', 'bonus']);
    const day0 = repo.getLogs(active.attemptId)[0]!;
    expect(day0.completedItemIds).toContain('a'); // kept item's history survives
    expect(day0.completedItemIds).not.toContain('b'); // removed item's completion is gone
    // and physically gone from day_item
    const db = openDatabaseSync(name);
    expect(db.getAllSync(`SELECT * FROM day_item WHERE item_id = 'b'`)).toHaveLength(0);
  });

  it('updateChallengeChecklist adds an item and edits a label, preserving history by id', () => {
    const { repo } = fresh();
    const active = repo.startChallenge(PRESET, TODAY);
    repo.setItemDone(active.attemptId, 0, 'a', true);

    const items: PresetItem[] = [
      { id: 'a', categoryId: 'main', label: 'Item A (edited)', isBonus: false, timeOfDay: 'morning' },
      ...PRESET.items.filter((it) => it.id !== 'a'),
      { id: 'newone', categoryId: 'extra', label: 'Brand new', isBonus: false, timeOfDay: 'day' },
    ];
    repo.updateChallengeChecklist(active.challengeId, PRESET.categories, items);

    const detail = repo.getChallengeDetail(active.challengeId)!;
    expect(detail.items.find((i) => i.id === 'a')?.label).toBe('Item A (edited)');
    expect(detail.items.some((i) => i.id === 'newone')).toBe(true);
    expect(repo.getLogs(active.attemptId)[0]!.completedItemIds).toContain('a'); // history kept by id
  });

  it('activateChallenge swaps which challenge is active', () => {
    const { repo } = fresh();
    const first = repo.startChallenge(PRESET, TODAY);
    repo.startChallenge({ ...PRESET, name: 'Second' }, TODAY);
    repo.activateChallenge(first.challengeId);
    expect(repo.getActive()?.challengeId).toBe(first.challengeId);
    expect(repo.listChallenges().filter((c) => c.status === 'active')).toHaveLength(1);
  });

  it('settings round-trip and overwrite', () => {
    const { repo } = fresh();
    expect(repo.getSetting('k')).toBeNull();
    repo.setSetting('k', '1');
    repo.setSetting('k', '2');
    expect(repo.getSetting('k')).toBe('2');
  });
});

describe('backup round-trip', () => {
  it('export → import preserves challenges, days, completions, avoidance flags, settings', () => {
    const { repo } = fresh();
    const active = repo.startChallenge(PRESET, TODAY, '2026-07-25');
    repo.setItemDone(active.attemptId, 0, 'a', true);
    repo.setItemDone(active.attemptId, 2, 'bonus', true);
    repo.setDayMeta(active.attemptId, 2, { mood: 5, isTravel: true });
    repo.setSetting('onboarding_completed', '1');

    const backup = repo.exportAllData();
    const { repo: repo2 } = fresh();
    repo2.importAllData(backup);

    const restored = repo2.getActive()!;
    expect(restored.name).toBe('Test 80');
    expect(restored.items.find((i) => i.id === 'avoid')?.isAvoidance).toBe(true);
    const logs = repo2.getLogs(restored.attemptId);
    expect(logs).toHaveLength(3);
    expect(logs[0]!.completedItemIds).toContain('a');
    expect(logs[2]!.completedItemIds).toContain('bonus');
    expect(logs[2]!.mood).toBe(5);
    expect(logs[2]!.isTravel).toBe(true);
    expect(repo2.getSetting('onboarding_completed')).toBe('1');
  });
});

describe('migrations', () => {
  it('adds item.is_avoidance to a legacy database without losing data', () => {
    const name = `legacy-${Date.now()}.db`;
    const db = openDatabaseSync(name);
    // Minimal pre-avoidance schema, as shipped to the first beta builds.
    db.execSync(`
      CREATE TABLE challenge (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL,
        duration_days INTEGER NOT NULL, daily_threshold_pct REAL NOT NULL,
        challenge_threshold_pct REAL NOT NULL, strictness TEXT NOT NULL,
        no_repeat_miss INTEGER NOT NULL, travel_exempt INTEGER NOT NULL,
        status TEXT NOT NULL DEFAULT 'active', created_at_utc TEXT NOT NULL);
      CREATE TABLE item (challenge_id INTEGER NOT NULL REFERENCES challenge(id), id TEXT NOT NULL,
        category_id TEXT NOT NULL, label TEXT NOT NULL, is_bonus INTEGER NOT NULL,
        time_of_day TEXT NOT NULL, sort_order INTEGER NOT NULL, PRIMARY KEY (challenge_id, id));
    `);
    db.runSync(
      `INSERT INTO challenge (name, duration_days, daily_threshold_pct, challenge_threshold_pct,
        strictness, no_repeat_miss, travel_exempt, created_at_utc)
       VALUES ('Old', 80, 80, 80, 'flexible', 1, 1, '2026-01-01T00:00:00Z')`,
    );
    db.runSync(
      `INSERT INTO item (challenge_id, id, category_id, label, is_bonus, time_of_day, sort_order)
       VALUES (1, 'x', 'c', 'Legacy item', 0, 'day', 0)`,
    );

    new SqliteRepository(name); // migrate() must add the column, not wipe anything

    const cols = db.getAllSync<{ name: string }>(`PRAGMA table_info(item)`).map((c) => c.name);
    expect(cols).toContain('is_avoidance');
    const row = db.getFirstSync<{ label: string; is_avoidance: number }>(`SELECT * FROM item WHERE id = 'x'`);
    expect(row).toMatchObject({ label: 'Legacy item', is_avoidance: 0 });
  });
});
