import { BackupFile } from './repository';

export type BackupParseResult = { ok: true; data: BackupFile } | { ok: false; error: string };

/**
 * Structural check for a full-database backup file. Lighter than templates.ts's
 * per-field validation — this is a round-trip format we control on both ends, so
 * the goal is catching "not a backup" / "wrong version" / "corrupt JSON," not
 * defending field-by-field against an adversarial file.
 */
export function parseBackupJson(text: string): BackupParseResult {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return { ok: false, error: 'Not valid JSON.' };
  }
  if (typeof raw !== 'object' || raw === null) return { ok: false, error: 'Expected a JSON object.' };
  const obj = raw as Record<string, unknown>;
  if (obj.schemaVersion !== 1) return { ok: false, error: 'Unsupported or missing schemaVersion.' };
  if (!Array.isArray(obj.challenges)) return { ok: false, error: 'Missing "challenges" array.' };
  if (typeof obj.settings !== 'object' || obj.settings === null) {
    return { ok: false, error: 'Missing "settings" object.' };
  }
  for (const ch of obj.challenges) {
    if (typeof ch !== 'object' || ch === null) return { ok: false, error: 'Each challenge must be an object.' };
    const rec = ch as Record<string, unknown>;
    if (typeof rec.name !== 'string' || !Array.isArray(rec.categories) || !Array.isArray(rec.items) || !Array.isArray(rec.attempts)) {
      return { ok: false, error: 'A challenge is missing required fields.' };
    }
    for (const a of rec.attempts) {
      if (typeof a !== 'object' || a === null || !Array.isArray((a as Record<string, unknown>).days)) {
        return { ok: false, error: 'An attempt is missing its days.' };
      }
    }
  }
  return { ok: true, data: raw as BackupFile };
}
