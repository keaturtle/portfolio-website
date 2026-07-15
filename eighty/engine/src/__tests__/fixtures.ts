import { ChallengeConfig, DayLog, ItemDef } from '../types';
import { addDays } from '../dayIdentity';

const item = (
  id: string,
  categoryId: string,
  label: string,
  isBonus = false,
): ItemDef => ({ id, categoryId, label, isBonus });

/** The real 80/80/80 checklist: 25 regular items + 6 bonus. */
export const EIGHTY_ITEMS: ItemDef[] = [
  item('w1', 'workout', 'Workout 1 — outside, 15 min minimum'),
  item('w2', 'workout', 'Workout 2 — any workout'),
  item('w60', 'workout', '60+ min intentional exercise or recovery'),
  item('wpush', 'workout', 'Pushups in morning'),
  item('wpull', 'workout', 'Pull-ups sometime in day'),
  item('wdiff', 'workout', 'At least one workout different from previous day'),
  item('dwindow', 'diet', 'No food after 8:30pm or before 9am'),
  item('dsweets', 'diet', 'No sweets'),
  item('dalcohol', 'diet', 'No alcohol'),
  item('dprotein', 'diet', 'Protein >100g'),
  item('dprobiotic', 'diet', 'Probiotic source once in day'),
  item('sbed11', 'sleep', 'In bed by 11pm'),
  item('s8h', 'sleep', 'At least 8 hours in bed'),
  item('sread', 'sleep', 'Read ≥5 min in bed'),
  item('snophone', 'sleep', 'No phone in bed'),
  item('ssun', 'sleep', '≥5 min of sun within 1 hour of waking'),
  item('supam', 'supplements', 'Morning supplements'),
  item('suppm', 'supplements', 'Night supplements'),
  item('mmed', 'mental', '≥10 min meditation'),
  item('mscreen', 'mental', '<2 hours solo phone/TV'),
  item('mcreative', 'mental', 'Practiced a creative activity or hobby'),
  item('mhwf', 'mental', 'Log ≥2 emotions in How We Feel'),
  item('mkitchen', 'mental', 'Go to sleep with a clean kitchen'),
  item('hbrush', 'hygiene', 'Brush AM; brush + floss PM'),
  item('hmoist', 'hygiene', 'Moisturizer morning and night'),
  item('bsocial', 'bonus', '1+ hour socially with friends', true),
  item('bsugar', 'bonus', 'No added refined sugars', true),
  item('bprocessed', 'bonus', 'No overprocessed foods', true),
  item('bselfless', 'bonus', '1 selfless act', true),
  item('bmed30', 'bonus', '30 min meditation', true),
  item('b3h', 'bonus', '3+ hours intentional exercise/recovery', true),
];

export const REGULAR_IDS = EIGHTY_ITEMS.filter((i) => !i.isBonus).map((i) => i.id);
export const BONUS_IDS = EIGHTY_ITEMS.filter((i) => i.isBonus).map((i) => i.id);

export const eighty: ChallengeConfig = {
  durationDays: 80,
  dailyThresholdPct: 80,
  challengeThresholdPct: 80,
  strictness: 'flexible',
  noRepeatMiss: true,
  travelExemption: true,
  items: EIGHTY_ITEMS,
};

/** 75-Hard-style config: 5 all-or-nothing items, hardcore restart. */
export const hard75: ChallengeConfig = {
  durationDays: 75,
  dailyThresholdPct: 100,
  challengeThresholdPct: 100,
  strictness: 'hardcore',
  noRepeatMiss: false,
  travelExemption: false,
  items: [
    item('workouts', 'core', 'Two 45-min workouts, one outdoors'),
    item('diet', 'core', 'Follow a diet; no alcohol or cheat meals'),
    item('water', 'core', '1 gallon water'),
    item('read', 'core', 'Read 10 pages nonfiction'),
    item('photo', 'core', 'Progress photo'),
  ],
};

export const START = '2026-07-01';

/** Build a DayLog at dayIndex `idx`; localDate follows from START. */
export function day(
  idx: number,
  completedItemIds: string[],
  opts: Partial<Omit<DayLog, 'dayIndex' | 'completedItemIds'>> = {},
): DayLog {
  return {
    dayIndex: idx,
    localDate: addDays(START, idx),
    completedItemIds,
    isTravel: false,
    closed: true,
    ...opts,
  };
}

/** First n regular item ids — handy for "did exactly n items" days. */
export function firstRegular(n: number): string[] {
  return REGULAR_IDS.slice(0, n);
}

/** All regular ids except the given ones. */
export function allBut(...missed: string[]): string[] {
  return REGULAR_IDS.filter((id) => !missed.includes(id));
}
