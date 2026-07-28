/**
 * Test double for `expo-sqlite`, backed by Node's built-in `node:sqlite` (a real
 * SQLite engine), so SqliteRepository runs against genuine SQL semantics in Jest:
 * real foreign keys, real UNIQUE constraints, real transactions.
 *
 * Only the surface SqliteRepository uses is implemented. `openDatabaseSync` keeps a
 * per-name registry, mirroring expo-sqlite's same-file-same-data behavior, so tests
 * can open a second handle to the same database for raw-SQL assertions.
 */
import { DatabaseSync } from 'node:sqlite';

export type SQLiteBindValue = string | number | boolean | null;

export interface SQLiteRunResult {
  lastInsertRowId: number;
  changes: number;
}

function bind(params: SQLiteBindValue[]): (string | number | null)[] {
  // node:sqlite rejects booleans; expo-sqlite coerces them. Match expo-sqlite.
  return params.map((v) => (v === true ? 1 : v === false ? 0 : v));
}

export class SQLiteDatabase {
  constructor(private readonly db: DatabaseSync) {}

  execSync(sql: string): void {
    this.db.exec(sql);
  }

  runSync(sql: string, params: SQLiteBindValue[] = []): SQLiteRunResult {
    const res = this.db.prepare(sql).run(...bind(params));
    return { lastInsertRowId: Number(res.lastInsertRowid), changes: Number(res.changes) };
  }

  getAllSync<T>(sql: string, params: SQLiteBindValue[] = []): T[] {
    return this.db.prepare(sql).all(...bind(params)) as T[];
  }

  getFirstSync<T>(sql: string, params: SQLiteBindValue[] = []): T | null {
    const row = this.db.prepare(sql).get(...bind(params));
    return (row as T | undefined) ?? null;
  }

  withTransactionSync(fn: () => void): void {
    this.db.exec('BEGIN');
    try {
      fn();
      this.db.exec('COMMIT');
    } catch (e) {
      this.db.exec('ROLLBACK');
      throw e;
    }
  }
}

const registry = new Map<string, SQLiteDatabase>();

export function openDatabaseSync(name: string): SQLiteDatabase {
  let db = registry.get(name);
  if (!db) {
    db = new SQLiteDatabase(new DatabaseSync(':memory:'));
    registry.set(name, db);
  }
  return db;
}

/** Test-only: drop a named database so the next open starts fresh. */
export function __resetDatabase(name: string): void {
  registry.delete(name);
}
