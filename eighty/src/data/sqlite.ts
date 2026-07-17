import * as SQLite from 'expo-sqlite';
import { DayLog, Rating } from '@engine';
import {
  ActiveChallenge,
  ChallengePreset,
  ChallengeRepository,
  DayMeta,
  PresetCategory,
  PresetItem,
} from './repository';

interface ChallengeRow {
  id: number;
  name: string;
  duration_days: number;
  daily_threshold_pct: number;
  challenge_threshold_pct: number;
  strictness: string;
  no_repeat_miss: number;
  travel_exempt: number;
}

interface DayRow {
  id: number;
  day_index: number;
  local_date: string;
  is_travel: number;
  satisfaction: number | null;
  mood: number | null;
  notes: string | null;
  closed_at_utc: string | null;
}

export class SqliteRepository implements ChallengeRepository {
  private db: SQLite.SQLiteDatabase;

  constructor(dbName = 'eighty.db') {
    this.db = SQLite.openDatabaseSync(dbName);
    this.migrate();
  }

  private migrate(): void {
    this.db.execSync(`
      PRAGMA journal_mode = WAL;
      PRAGMA foreign_keys = ON;
      CREATE TABLE IF NOT EXISTS challenge (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        duration_days INTEGER NOT NULL,
        daily_threshold_pct REAL NOT NULL,
        challenge_threshold_pct REAL NOT NULL,
        strictness TEXT NOT NULL,
        no_repeat_miss INTEGER NOT NULL,
        travel_exempt INTEGER NOT NULL,
        status TEXT NOT NULL DEFAULT 'active',
        created_at_utc TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS attempt (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        challenge_id INTEGER NOT NULL REFERENCES challenge(id),
        attempt_no INTEGER NOT NULL,
        started_local_date TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'active',
        ended_reason TEXT
      );
      CREATE TABLE IF NOT EXISTS category (
        challenge_id INTEGER NOT NULL REFERENCES challenge(id),
        id TEXT NOT NULL,
        name TEXT NOT NULL,
        sort_order INTEGER NOT NULL,
        PRIMARY KEY (challenge_id, id)
      );
      CREATE TABLE IF NOT EXISTS item (
        challenge_id INTEGER NOT NULL REFERENCES challenge(id),
        id TEXT NOT NULL,
        category_id TEXT NOT NULL,
        label TEXT NOT NULL,
        is_bonus INTEGER NOT NULL,
        time_of_day TEXT NOT NULL,
        sort_order INTEGER NOT NULL,
        PRIMARY KEY (challenge_id, id)
      );
      CREATE TABLE IF NOT EXISTS day (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        attempt_id INTEGER NOT NULL REFERENCES attempt(id),
        day_index INTEGER NOT NULL,
        local_date TEXT NOT NULL,
        is_travel INTEGER NOT NULL DEFAULT 0,
        satisfaction INTEGER,
        mood INTEGER,
        notes TEXT,
        closed_at_utc TEXT,
        UNIQUE (attempt_id, day_index)
      );
      CREATE TABLE IF NOT EXISTS day_item (
        day_id INTEGER NOT NULL REFERENCES day(id),
        item_id TEXT NOT NULL,
        completed_at_utc TEXT NOT NULL,
        PRIMARY KEY (day_id, item_id)
      );
      CREATE TABLE IF NOT EXISTS setting (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );
    `);
  }

  getSetting(key: string): string | null {
    const row = this.db.getFirstSync<{ value: string }>(`SELECT value FROM setting WHERE key = ?`, [key]);
    return row ? row.value : null;
  }

  setSetting(key: string, value: string): void {
    this.db.runSync(
      `INSERT INTO setting (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
      [key, value],
    );
  }

  getActive(): ActiveChallenge | null {
    const ch = this.db.getFirstSync<ChallengeRow>(
      `SELECT * FROM challenge WHERE status = 'active' ORDER BY id DESC LIMIT 1`,
    );
    if (!ch) return null;
    const attempt = this.db.getFirstSync<{ id: number }>(
      `SELECT id FROM attempt WHERE challenge_id = ? AND status = 'active' ORDER BY attempt_no DESC LIMIT 1`,
      [ch.id],
    );
    if (!attempt) return null;
    return this.buildActive(ch, attempt.id);
  }

  private buildActive(ch: ChallengeRow, attemptId: number): ActiveChallenge {
    const categories = this.db.getAllSync<PresetCategory>(
      `SELECT id, name FROM category WHERE challenge_id = ? ORDER BY sort_order`,
      [ch.id],
    );
    const items = this.db
      .getAllSync<{
        id: string;
        category_id: string;
        label: string;
        is_bonus: number;
        time_of_day: string;
      }>(`SELECT * FROM item WHERE challenge_id = ? ORDER BY sort_order`, [ch.id])
      .map(
        (r): PresetItem => ({
          id: r.id,
          categoryId: r.category_id,
          label: r.label,
          isBonus: r.is_bonus === 1,
          timeOfDay: r.time_of_day as PresetItem['timeOfDay'],
        }),
      );
    return {
      challengeId: ch.id,
      attemptId,
      name: ch.name,
      categories,
      items,
      config: {
        durationDays: ch.duration_days,
        dailyThresholdPct: ch.daily_threshold_pct,
        challengeThresholdPct: ch.challenge_threshold_pct,
        strictness: ch.strictness as ActiveChallenge['config']['strictness'],
        noRepeatMiss: ch.no_repeat_miss === 1,
        travelExemption: ch.travel_exempt === 1,
        items: items.map(({ id, categoryId, label, isBonus, timeOfDay }) => ({
          id,
          categoryId,
          label,
          isBonus,
          timeOfDay,
        })),
      },
    };
  }

  startChallenge(preset: ChallengePreset, todayLabel: string): ActiveChallenge {
    let result: ActiveChallenge | undefined;
    this.db.withTransactionSync(() => {
      // v1 shows a single active challenge (PLAN.md #10) — starting a new one
      // archives whatever was active rather than leaving two 'active' rows.
      this.db.runSync(`UPDATE challenge SET status = 'archived' WHERE status = 'active'`);
      const ch = this.db.runSync(
        `INSERT INTO challenge (name, duration_days, daily_threshold_pct, challenge_threshold_pct,
          strictness, no_repeat_miss, travel_exempt, created_at_utc)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          preset.name,
          preset.durationDays,
          preset.dailyThresholdPct,
          preset.challengeThresholdPct,
          preset.strictness,
          preset.noRepeatMiss ? 1 : 0,
          preset.travelExemption ? 1 : 0,
          new Date().toISOString(),
        ],
      );
      const challengeId = Number(ch.lastInsertRowId);
      preset.categories.forEach((c, idx) =>
        this.db.runSync(
          `INSERT INTO category (challenge_id, id, name, sort_order) VALUES (?, ?, ?, ?)`,
          [challengeId, c.id, c.name, idx],
        ),
      );
      preset.items.forEach((it, idx) =>
        this.db.runSync(
          `INSERT INTO item (challenge_id, id, category_id, label, is_bonus, time_of_day, sort_order)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [challengeId, it.id, it.categoryId, it.label, it.isBonus ? 1 : 0, it.timeOfDay, idx],
        ),
      );
      const at = this.db.runSync(
        `INSERT INTO attempt (challenge_id, attempt_no, started_local_date) VALUES (?, 1, ?)`,
        [challengeId, todayLabel],
      );
      const attemptId = Number(at.lastInsertRowId);
      this.db.runSync(`INSERT INTO day (attempt_id, day_index, local_date) VALUES (?, 0, ?)`, [
        attemptId,
        todayLabel,
      ]);
      const row = this.db.getFirstSync<ChallengeRow>(`SELECT * FROM challenge WHERE id = ?`, [
        challengeId,
      ]);
      result = this.buildActive(row as ChallengeRow, attemptId);
    });
    if (!result) throw new Error('startChallenge failed');
    return result;
  }

  getLogs(attemptId: number): DayLog[] {
    const days = this.db.getAllSync<DayRow>(
      `SELECT * FROM day WHERE attempt_id = ? ORDER BY day_index`,
      [attemptId],
    );
    return days.map((d) => {
      const done = this.db.getAllSync<{ item_id: string }>(
        `SELECT item_id FROM day_item WHERE day_id = ?`,
        [d.id],
      );
      const log: DayLog = {
        dayIndex: d.day_index,
        localDate: d.local_date,
        completedItemIds: done.map((r) => r.item_id),
        isTravel: d.is_travel === 1,
        closed: d.closed_at_utc !== null,
      };
      if (d.satisfaction !== null) log.satisfaction = d.satisfaction as Rating;
      if (d.mood !== null) log.mood = d.mood as Rating;
      if (d.notes !== null) log.notes = d.notes;
      return log;
    });
  }

  private dayId(attemptId: number, dayIndex: number): number {
    const row = this.db.getFirstSync<{ id: number }>(
      `SELECT id FROM day WHERE attempt_id = ? AND day_index = ?`,
      [attemptId, dayIndex],
    );
    if (!row) throw new Error(`No day ${dayIndex} in attempt ${attemptId}`);
    return row.id;
  }

  setItemDone(attemptId: number, dayIndex: number, itemId: string, done: boolean): void {
    const dayId = this.dayId(attemptId, dayIndex);
    if (done) {
      this.db.runSync(
        `INSERT OR REPLACE INTO day_item (day_id, item_id, completed_at_utc) VALUES (?, ?, ?)`,
        [dayId, itemId, new Date().toISOString()],
      );
    } else {
      this.db.runSync(`DELETE FROM day_item WHERE day_id = ? AND item_id = ?`, [dayId, itemId]);
    }
  }

  setDayMeta(attemptId: number, dayIndex: number, meta: DayMeta): void {
    const dayId = this.dayId(attemptId, dayIndex);
    const sets: string[] = [];
    const args: SQLite.SQLiteBindValue[] = [];
    if (meta.satisfaction !== undefined) {
      sets.push('satisfaction = ?');
      args.push(meta.satisfaction);
    }
    if (meta.mood !== undefined) {
      sets.push('mood = ?');
      args.push(meta.mood);
    }
    if (meta.notes !== undefined) {
      sets.push('notes = ?');
      args.push(meta.notes);
    }
    if (meta.isTravel !== undefined) {
      sets.push('is_travel = ?');
      args.push(meta.isTravel ? 1 : 0);
    }
    if (sets.length === 0) return;
    this.db.runSync(`UPDATE day SET ${sets.join(', ')} WHERE id = ?`, [...args, dayId]);
  }

  closeDay(attemptId: number, dayIndex: number, nextLabel: string): void {
    this.db.withTransactionSync(() => {
      this.db.runSync(
        `UPDATE day SET closed_at_utc = ? WHERE attempt_id = ? AND day_index = ? AND closed_at_utc IS NULL`,
        [new Date().toISOString(), attemptId, dayIndex],
      );
      const duration = this.db.getFirstSync<{ duration_days: number }>(
        `SELECT c.duration_days FROM challenge c JOIN attempt a ON a.challenge_id = c.id WHERE a.id = ?`,
        [attemptId],
      );
      if (duration && dayIndex + 1 < duration.duration_days) {
        this.db.runSync(
          `INSERT OR IGNORE INTO day (attempt_id, day_index, local_date) VALUES (?, ?, ?)`,
          [attemptId, dayIndex + 1, nextLabel],
        );
      }
    });
  }
}
