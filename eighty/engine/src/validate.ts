import { ChallengeConfig } from './types';
import { regularItems } from './scoring';

export interface ConfigValidationError {
  field: string;
  message: string;
}

/** Structural checks a builder UI needs before it can call startChallenge. */
export function validateConfig(cfg: ChallengeConfig): ConfigValidationError[] {
  const errors: ConfigValidationError[] = [];

  if (!Number.isInteger(cfg.durationDays) || cfg.durationDays < 1) {
    errors.push({ field: 'durationDays', message: 'Duration must be a whole number of at least 1 day.' });
  }
  if (!isPct(cfg.dailyThresholdPct)) {
    errors.push({ field: 'dailyThresholdPct', message: 'Daily threshold must be between 0 and 100.' });
  }
  if (!isPct(cfg.challengeThresholdPct)) {
    errors.push({ field: 'challengeThresholdPct', message: 'Challenge threshold must be between 0 and 100.' });
  }
  if (cfg.items.length === 0) {
    errors.push({ field: 'items', message: 'Add at least one item.' });
  } else if (regularItems(cfg).length === 0) {
    errors.push({ field: 'items', message: 'Add at least one non-bonus item.' });
  }
  if (cfg.items.some((i) => i.id.trim() === '' || i.label.trim() === '')) {
    errors.push({ field: 'items', message: 'Every item needs an id and a label.' });
  }
  const ids = cfg.items.map((i) => i.id);
  const dupes = [...new Set(ids.filter((id, i) => ids.indexOf(id) !== i))];
  if (dupes.length > 0) {
    errors.push({ field: 'items', message: `Duplicate item id(s): ${dupes.join(', ')}` });
  }

  return errors;
}

function isPct(n: number): boolean {
  return Number.isFinite(n) && n >= 0 && n <= 100;
}
