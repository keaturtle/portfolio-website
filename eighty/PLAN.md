# Eighty — Phase 0 Build Plan

*Self-improvement challenge tracker. Flagship: the 80/80/80 Challenge. This plan locks direction before any code is written.*

## 1. Stack (confirmed)

**Expo (React Native + TypeScript), expo-router, expo-sqlite, Jest.** Expo is the right call for the stated priorities: runs on iPhone today via Expo Go, native haptics/notifications, clean TestFlight path. No alternative stack beats it on "on my phone today + reliable"; a PWA would sacrifice haptics, notifications, and home-screen polish.

- Strict TypeScript, ESLint + Prettier.
- The challenge engine is a **pure TS module with zero React/Expo imports**, 100% Jest-covered.
- Data access goes through a `ChallengeRepository` interface; `SqliteRepository` is the only v1 implementation. Cloud sync later = new implementation, no rewrite.
- App lives in `eighty/` inside this repo for now (the assigned branch is here). Recommend extracting to its own repo before TestFlight — Vercel/portfolio CI shouldn't build a mobile app.

## 2. Module structure

```
eighty/
├── app/                    # expo-router screens
│   ├── (tabs)/index.tsx        # Today
│   ├── (tabs)/dashboard.tsx    # Challenge dashboard
│   ├── (tabs)/trends.tsx       # Trends
│   ├── (tabs)/challenges.tsx   # Challenge list / presets / builder
│   └── day/[dayIndex].tsx      # Day detail / amend
├── src/
│   ├── engine/             # PURE: scoring, streaks, restarts, day identity
│   │   ├── types.ts  scoring.ts  noRepeat.ts  attempt.ts  dayIdentity.ts
│   │   └── __tests__/
│   ├── data/               # repository interface + SQLite impl + migrations
│   ├── templates/          # preset JSON (80/80/80, 75 Hard) + import/export + versioned schema
│   ├── ui/                 # components (CheckRow, ProgressRing, HeatGrid, …)
│   └── theme/tokens.ts     # design tokens (chosen in Phase 1)
└── package.json            # self-contained Expo project
```

## 3. SQLite schema

Derived stats are **never stored** — the engine recomputes everything from raw logs, which makes retroactive edits trivially correct.

```sql
challenge   (id PK, name, duration_days, daily_threshold_pct, challenge_threshold_pct,
             strictness, no_repeat_miss INT, travel_exempt INT, status, created_at_utc,
             template_id NULL)
attempt     (id PK, challenge_id FK, attempt_no INT, started_local_date TEXT,
             status TEXT, ended_reason TEXT NULL)          -- strict/hardcore restarts = new attempt rows
category    (id PK, challenge_id FK, name, sort_order)
item        (id PK, challenge_id FK, category_id FK, label, is_bonus INT, icon NULL, sort_order)
day         (id PK, attempt_id FK, day_index INT, local_date TEXT, is_travel INT,
             satisfaction INT NULL, mood INT NULL, notes TEXT NULL,
             closed_at_utc TEXT NULL, UNIQUE(attempt_id, day_index))
day_item    (day_id FK, item_id FK, completed INT, completed_at_utc TEXT,
             PRIMARY KEY(day_id, item_id))
template    (id PK, schema_version INT, name, source TEXT, json TEXT, created_at_utc)
setting     (key PK, value)
```

Timestamps stored UTC; each `day` carries its local-date label assigned at logging time (see ambiguity #2).

## 4. Challenge-engine API surface (signatures + types only)

```ts
export type Strictness = 'flexible' | 'strict' | 'hardcore';

export interface ItemDef { id: string; categoryId: string; label: string; isBonus: boolean }

export interface ChallengeConfig {
  durationDays: number;            // 80
  dailyThresholdPct: number;       // 80  (75 Hard preset: 100)
  challengeThresholdPct: number;   // 80  → ceil(80 × 0.80) = 64 success days
  strictness: Strictness;
  noRepeatMiss: boolean;
  travelExemption: boolean;
  items: ItemDef[];
}

export interface DayLog {
  dayIndex: number;                // 0-based counter within an attempt (NOT clock-derived)
  localDate: string;               // 'YYYY-MM-DD' display label
  completedItemIds: string[];
  isTravel: boolean;
  satisfaction?: 1 | 2 | 3 | 4 | 5;
  mood?: 1 | 2 | 3 | 4 | 5;
  notes?: string;
  closed: boolean;
}

export interface NoRepeatViolation { itemId: string; firstDayIndex: number; secondDayIndex: number }

export interface DayScore {
  dayIndex: number;
  completedRegular: number; totalRegular: number; completedBonus: number;
  pct: number;                     // (regular + bonus done) / regular total
  metThreshold: boolean;
  violations: NoRepeatViolation[]; // pairs ending on this day
  outcome: 'success' | 'fail' | 'pending';
  failReason?: 'below-threshold' | 'no-repeat-miss';
}

export interface AttemptState {
  status: 'active' | 'succeeded' | 'failed' | 'restart-required';
  restartReason?: 'no-repeat-miss' | 'incomplete-day';
  daysElapsed: number; daysRemaining: number;
  successDays: number; failedDays: number;
  successDaysNeeded: number;       // still needed to reach 64
  marginForError: number;          // "you can miss N more days"
  mathematicallyImpossible: boolean;
  projectedEndLocalDate: string;
  rollingPct: number;
  avgSatisfaction: number | null; avgMood: number | null;
  dayScores: DayScore[];
}

export interface ItemStat { itemId: string; completed: number; eligibleDays: number; pct: number }

export function scoreDay(cfg: ChallengeConfig, log: DayLog, prev?: DayLog): DayScore;
export function evaluateAttempt(cfg: ChallengeConfig, logs: DayLog[]): AttemptState;  // single source of truth
export function itemStats(cfg: ChallengeConfig, logs: DayLog[]): ItemStat[];          // habit leaderboard
export function atRiskItems(cfg: ChallengeConfig, yesterday?: DayLog): string[];      // "don't miss twice" warnings
```

Amending any past day = update its `DayLog`, re-run `evaluateAttempt`. Pure and idempotent by construction.

## 5. Day identity & timezones (design decision)

A day is a **counter advanced by user action, not by the wall clock**. There is always exactly one "open day"; all logging targets it. "Close out yesterday" / "start today" advances the counter and stamps the new day's local-date label from the device timezone at that moment. Consequences:

- Wake-to-wake works by definition — logging sleep items at 9am counts for the still-open previous day.
- DST can't duplicate or skip a day (counter, not clock math).
- Timezone travel just changes the label of subsequent days; day count stays exact.
- If the calendar drifts (open day's label is ≥2 days old), the Today screen nudges to close out; skipped calendar days are handled per ambiguity #2.

## 6. Product ambiguities found + proposed resolutions

1. **Exactly at threshold:** ≥ counts. 20/25 items = day success; 64/80 days = challenge success.
2. **Fully unlogged/skipped days** (user disappears for 2 days): count as failed days with all items missed, and they feed the no-repeat-miss rule (consistent, matches the spirit of the challenge). Close-out flow shows what that implies before confirming.
3. **Which day fails on a no-repeat violation (flexible mode):** the *second* day of the pair is marked failed, even if it hit 80%.
4. **Travel exemption scope:** if *either* day of a missed-pair is a travel day, the pair is exempt. Travel days are still scored against the 80% daily threshold — they only relax the no-repeat rule.
5. **Bonus items** are exempt from the no-repeat-miss rule (they're extra credit; never penalized).
6. **Strict/hardcore restart timing:** the violating day ends the attempt; day 1 of the new attempt starts the *next* day. Old attempts are archived and visible in History.
7. **Hardcore mode generalization:** "any incomplete day restarts" = any day failing its daily threshold restarts. The 75 Hard preset sets `dailyThresholdPct: 100`, so any missed item restarts — no special-case code.
8. **"Workout different from previous day"** is a plain self-reported checkbox (the engine doesn't validate workout types).
9. **Numerator can exceed denominator** via bonus items; day pct is capped at 100% for display, uncapped internally.
10. **Multiple concurrent challenges:** schema and engine support it; v1 UI assumes one active challenge (Today shows the single active one).
11. **Retroactive edits under strict/hardcore:** an edit that newly triggers a restart condition shows a confirmation spelling out the consequence before saving.
12. **When success becomes mathematically impossible (flexible):** the challenge is marked failed; the app offers "restart" or "finish anyway" (keep logging, stats keep computing).

## 7. Name

"Eighty" reads as a number, not a brand. Suggestions: **Fourscore** (a "score" is 20 — four score = 80; literary, premium, on-theme) · **Tally** · **Margin** (the key stat is your margin for error) · keep **Eighty**. Recommendation: **Fourscore**.

---

*Phase 1 (visual directions as static HTML mockups) begins only after this plan is approved.*
