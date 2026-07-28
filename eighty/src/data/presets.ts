import { ChallengePreset, PresetItem } from './repository';
import { TimeOfDay } from '@engine';

const i = (
  id: string,
  categoryId: string,
  label: string,
  timeOfDay: TimeOfDay,
  isBonus = false,
  isAvoidance = false,
): PresetItem => ({ id, categoryId, label, timeOfDay, isBonus, isAvoidance });

/** Avoidance habit: complete-by-default, mark a slip to fail it. */
const av = (id: string, categoryId: string, label: string, timeOfDay: TimeOfDay): PresetItem =>
  i(id, categoryId, label, timeOfDay, false, true);

/**
 * The flagship 80/80/80 preset — 10 regular items grouped by time of day (the grouping
 * is the Today-screen display order for this preset) + 7 bonus. Daily success = 8 of 10.
 */
export const EIGHTY_PRESET: ChallengePreset = {
  name: '80/80/80',
  durationDays: 80,
  dailyThresholdPct: 80,
  challengeThresholdPct: 80,
  strictness: 'flexible',
  noRepeatMiss: true,
  travelExemption: true,
  categories: [
    { id: 'morning', name: 'Morning' },
    { id: 'day', name: 'Through the day' },
    { id: 'evening', name: 'Evening' },
  ],
  items: [
    // Morning
    i('hydrate', 'morning', 'Hydrate — drink 3L+ of water today', 'morning'),
    i('move', 'morning', 'Move — 30+ min of intentional exercise, any kind', 'morning'),
    // Through the day
    i('protein', 'day', 'Protein — hit your protein target', 'day'),
    av('noalcohol', 'day', 'Drink clean — water, coffee, tea, and zero-proof only today', 'day'),
    av('nosweets', 'day', 'Eat clean — zero added-sugar desserts today', 'day'),
    av('fast', 'day', 'Fast — complete your 8pm–10am fast (14 hours)', 'day'),
    i('read', 'day', 'Read — 10+ minutes', 'day'),
    i('meditate', 'day', 'Meditate — 10+ minutes', 'day'),
    // Evening
    av('nophonebed', 'evening', "Park the phone — charge it out of arm's reach overnight, wake without it", 'evening'),
    i('bed11', 'evening', 'Lights out — in bed by 11pm', 'evening'),
    // Bonus — count toward the numerator only, never against you
    i('bsun', 'morning', 'Morning sunlight — 10 min within an hour of waking', 'morning', true),
    i('bcold', 'morning', 'Cold exposure', 'morning', true),
    i('bworkout2', 'day', 'Second workout', 'day', true),
    i('bsocial', 'day', '1+ hr social time with friends', 'day', true),
    i('bselfless', 'day', '1 selfless act', 'day', true),
    i('bkitchen', 'evening', 'Clean kitchen before bed', 'evening', true),
    i('bcreative', 'day', 'Creative hobby time', 'day', true),
  ],
};

/** 75 Hard — all-or-nothing: any missed item restarts the attempt (hardcore mode). */
export const HARD_75_PRESET: ChallengePreset = {
  name: '75 Hard',
  durationDays: 75,
  dailyThresholdPct: 100,
  challengeThresholdPct: 100,
  strictness: 'hardcore',
  noRepeatMiss: false,
  travelExemption: false,
  categories: [
    { id: 'diet', name: 'Diet' },
    { id: 'workout', name: 'Workout' },
    { id: 'hydration', name: 'Hydration' },
    { id: 'growth', name: 'Growth' },
    { id: 'tracking', name: 'Tracking' },
  ],
  items: [
    i('diet', 'diet', 'Follow your diet — no cheat meals, no alcohol', 'day'),
    i('workout1', 'workout', 'Workout 1 — 45 minutes', 'day'),
    i('workout2', 'workout', 'Workout 2 — 45 minutes, outdoors', 'day'),
    i('water', 'hydration', 'Drink 1 gallon of water', 'day'),
    i('read', 'growth', 'Read 10 pages of a non-fiction book', 'evening'),
    i('photo', 'tracking', 'Take a progress photo', 'morning'),
  ],
};

/**
 * 80/80/80 Classic — the original 25-item list, kept as the maximalist tier
 * (hit 20 of 25 daily). Domain-grouped (workout / diet / sleep / …).
 */
export const CLASSIC_80_PRESET: ChallengePreset = {
  name: '80/80/80 Classic',
  durationDays: 80,
  dailyThresholdPct: 80,
  challengeThresholdPct: 80,
  strictness: 'flexible',
  noRepeatMiss: true,
  travelExemption: true,
  categories: [
    { id: 'workout', name: 'Workout' },
    { id: 'diet', name: 'Diet' },
    { id: 'sleep', name: 'Sleep' },
    { id: 'supplements', name: 'Supplements' },
    { id: 'mental', name: 'Mental Health' },
    { id: 'hygiene', name: 'Hygiene' },
  ],
  items: [
    i('w1', 'workout', 'Workout 1 — outside, 15 min minimum', 'day'),
    i('w2', 'workout', 'Workout 2 — any workout', 'day'),
    i('w60', 'workout', '60+ min intentional exercise or recovery', 'day'),
    i('wpush', 'workout', 'Pushups in morning', 'morning'),
    i('wpull', 'workout', 'Pull-ups sometime in day', 'day'),
    i('wdiff', 'workout', 'At least one workout different from previous day', 'day'),
    i('dwindow', 'diet', 'No food after 8:30pm or before 9am', 'evening'),
    i('dsweets', 'diet', 'No sweets (dessert / cookies / candy)', 'evening'),
    i('dalcohol', 'diet', 'No alcohol', 'evening'),
    i('dprotein', 'diet', 'Protein >100g', 'day'),
    i('dprobiotic', 'diet', 'Probiotic source once in day', 'day'),
    i('sbed11', 'sleep', 'In bed by 11pm', 'bed'),
    i('s8h', 'sleep', 'At least 8 hours in bed', 'bed'),
    i('sread', 'sleep', 'Read ≥5 min in bed', 'bed'),
    i('snophone', 'sleep', 'No phone in bed (morning and night)', 'bed'),
    i('ssun', 'sleep', '≥5 min of sun within 1 hour of waking', 'morning'),
    i('supam', 'supplements', 'Morning supplements', 'morning'),
    i('suppm', 'supplements', 'Night supplements', 'evening'),
    i('mmed', 'mental', '≥10 min meditation', 'day'),
    i('mscreen', 'mental', '<2 hours solo phone / TV', 'evening'),
    i('mcreative', 'mental', 'Practiced a creative activity or hobby', 'day'),
    i('mhwf', 'mental', 'Log ≥2 emotions in How We Feel', 'day'),
    i('mkitchen', 'mental', 'Go to sleep with a clean kitchen', 'evening'),
    i('hbrush', 'hygiene', 'Brush AM; brush + floss PM', 'evening'),
    i('hmoist', 'hygiene', 'Moisturizer morning and night', 'evening'),
    i('bsocial', 'mental', '1+ hour socially with friends', 'day', true),
    i('bsugar', 'diet', 'No added refined sugars', 'evening', true),
    i('bprocessed', 'diet', 'No overprocessed foods', 'evening', true),
    i('bselfless', 'mental', '1 selfless act', 'day', true),
    i('bmed30', 'mental', '30 min meditation', 'day', true),
    i('b3h', 'workout', '3+ hours intentional exercise / recovery', 'day', true),
  ],
};

export const PRESETS: ChallengePreset[] = [EIGHTY_PRESET, HARD_75_PRESET, CLASSIC_80_PRESET];
