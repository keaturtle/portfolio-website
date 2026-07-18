# Eighty — Roadmap to App Store

*Written after Phases 0–3 (plan, visual direction, tested engine, Today-screen walking
skeleton). Everything below is new. Each milestone lists what ships and whether it
needs a **custom dev build** (breaks Expo Go on your phone until you install a new
client) or works in **plain Expo Go** (just `npx expo start`, scan, done).

Legend: 🟢 Expo Go · 🟡 Expo Go now, dev-build only at submission time · 🔴 needs a
custom dev build to test at all.

Status legend: ✅ committed · 🔨 in progress · ⬜ not started.

---

## Status at a glance (reconciled to git 2026-07-17)

| Milestone | State | Landed in |
|-----------|-------|-----------|
| M4 Dashboard / calendar / leaderboard | ✅ | `05a7a9e`, refined `5fc0607` |
| M5 Builder / 75 Hard / import-export | ✅ | `5e03401` |
| M7 Onboarding & first-run | ✅ | `fe4bca5` (+ preview `4b78aa9`) |
| M6 Trends / day-edit / notifications / Settings | ✅ | `7011ed2` |
| M11 Multi-challenge switching & history | ✅ | `22995ff` |
| M9 Backup / restore | ✅ | `47344a0` |
| M8 Accessibility & motion polish | ✅ | this session |
| M12 Performance at 80-day scale | ✅ | this session |
| M10 Visual identity (icon/splash) | ✅ | this session |
| M14 App Store submission prep | ⬜ | — |
| M13 iOS home-screen widget (dev build) | ⬜ | — |

Earlier this file implied more was shipped than the commit history showed; the table
above is the source of truth and is kept in sync with what is actually committed.

---

## M4 — Dashboard, calendar, leaderboard (original Phase 4) 🟢 ✅

The engine already computes everything here (`evaluateAttempt`, `itemStats`) — this
milestone is pure UI.

- Challenge dashboard screen: ring/stats reused from Today, `AttemptState` summary
  (success days, margin for error, projected end date, mathematically-impossible
  banner).
- 80-day calendar heat grid: one cell per `DayScore`, colored by outcome
  (success / fail / pending / travel-exempt), tap a cell → day detail.
- Habit leaderboard from `itemStats`: sorted completion-rate bars per item, grouped
  by category.
- Introduce `(tabs)` layout in expo-router (Today / Dashboard / Trends / Challenges)
  — currently everything lives at `app/index.tsx`.

## M5 — Challenge builder, presets, import/export (original Phase 5) 🟢 ✅

- Builder flow: name, duration, daily/challenge thresholds, strictness, no-repeat
  toggle, travel exemption, categories + items (regular/bonus, time-of-day).
- **75 Hard preset** (`dailyThresholdPct: 100`, hardcore strictness) — engine already
  generalizes hardcore mode with no special-case code, per PLAN.md #7.
- Add a config validator to the engine (e.g. `validateConfig`) so the builder can't
  produce a nonsensical `ChallengeConfig` (empty items, threshold > 100, etc.) — this
  is a rule change, so it ships with tests and keeps the engine at 100% coverage.
- JSON import/export using the versioned `template` schema already in PLAN.md
  (`schema_version`, `source`) — share a challenge as a file, re-import elsewhere.
- Wire `getActive()`/`startChallenge()` to a real challenge list instead of assuming
  the 80/80/80 preset.

## M6 — Trends, day editing, notifications, Settings (original Phase 6 + extensions) 🟡 ✅

- **Trends** 🟢: satisfaction/mood over time, category-level completion trends,
  weekday breakdown (which weekday you're weakest on) — all derived from
  `dayScores`/`itemStats`, no new engine surface needed.
- **Editing past days** 🟢: open any closed day from the calendar, change item
  checks/meta, re-run `evaluateAttempt`. If the edit would newly trigger a restart
  (strict/hardcore) or flip challenge outcome, show a confirmation spelling out the
  consequence first (PLAN.md #11 — already designed, not yet built).
- **Local notifications** 🟡: morning "close out yesterday" nudge + evening
  "you've got N unchecked items" reminder, via `expo-notifications`. Local
  (non-push) notifications still work in Expo Go today, but Expo has been
  narrowing Expo Go's notification support release over release — confirm on your
  installed Expo Go build before relying on it, and this is the first candidate to
  fall over if a future SDK bump drops it.
- **Settings screen** 🟢: theme override (auto/light/dark — tokens.ts already
  supports both), notification toggles/times, data export/backup, about/version,
  switch active challenge (ties into M9).

## M7 — Onboarding & first-run 🟢 ✅

- Replace the single "Start day 1 today" button with a real first-run flow: pick a
  preset (80/80/80 or 75 Hard) or "customize" → into the M5 builder, confirm items,
  go. Target **under 2 minutes, zero explanation needed** — this is the first thing
  every new user sees, so it's worth its own milestone rather than folding into M5.
- Empty/loading/error states everywhere a screen can render before data exists
  (dashboard with 0 days logged, trends with 1 data point, SQLite open failure,
  etc.) — currently only the Today screen's "no active challenge" case is handled.

## M8 — Accessibility & motion polish 🟢 ✅

*Done this session. Contrast audited on both palettes (light `sub`/`mint`/`sienna`
darkened to clear AA); VoiceOver labels added across icon-only buttons, switches,
pills, ring, sparklines, and stat rows; haptic vocabulary extended to calendar taps
and all toggles; signature ring-fill animation added with `useReducedMotion` support.
Full write-up in [QA.md](./QA.md).*

- VoiceOver labels on every interactive element (CheckRow and RatingScale already
  do this — audit ProgressRing, calendar cells, builder controls, tab bar).
- Dynamic Type: audit hardcoded `fontSize` values in `tokens.ts`/screens against
  `PixelRatio`/`useWindowDimensions` scaling or `allowFontScaling`.
- Color contrast check on both palettes in `tokens.ts` (WCAG AA at minimum) —
  `sub`/`line` grays are the likely failure points.
- Haptic pass consistency (Today already uses `expo-haptics` well) — extend the same
  vocabulary (light/medium/selection/success) to calendar taps, builder steps, toggle
  switches app-wide.
- Motion: shared-element or fade transitions between tabs, ring fill animation on
  load, calendar cell stagger — `useReducedMotion` respected throughout (already the
  standard per CLAUDE.md-equivalent guidance in PLAN.md).

## M9 — Data safety & sync groundwork 🟢 ✅

- Manual backup/restore: export the whole SQLite DB (or a JSON dump of all
  challenges/attempts/days) to a file via `expo-file-system` + share sheet; restore
  by re-import.
- This *is* the disaster-recovery story for v1 — no cloud, so make it easy to find
  (Settings) and unambiguous about what it captures.
- Confirm the `ChallengeRepository` interface (already designed for this) needs no
  changes to support a future `CloudSyncRepository` — v1 ships `SqliteRepository`
  only, cloud sync is explicitly a "later" swap-in, not built now.

## M10 — Visual identity 🟢 ✅ (build-safe, but only checkable in a real build/TestFlight)

*Done this session. Replaced the Expo-template art with a real "Night Fir" mark: the
app's signature progress ring at 80% (mint arc, faint track, sienna leading dot) on a
subtle fir radial. Generated `icon.png` (1024, opaque), `splash-icon.png` (transparent),
`adaptive-icon.png` (Android foreground), and `favicon.png`; wired the Android adaptive
icon in `app.json`. **Reminder:** Expo Go shows its own icon — you won't see this until an
EAS build / TestFlight install (see SUBMISSION.md).*

- Real app icon + adaptive icon + splash screen assets (currently placeholder paths
  in `app.json` — `assets/images/icon.png` etc. need real art in "Night Fir" style).
- Expo Go always shows *its own* icon on your home screen regardless of `app.json`
  — you won't see the real icon until an EAS build/TestFlight install, so this
  needs a milestone-close check on-device via TestFlight, not Expo Go.

## M11 — Multi-challenge support 🟢 ✅

- Schema and engine already support multiple challenges (PLAN.md #10); v1 UI only
  ever shows one active challenge. Build the "switch active challenge" UI (list of
  challenges, activate/pause/archive) and a History view for past attempts
  (including strict/hardcore restart chains — PLAN.md #6).

## M12 — Performance pass at full 80-day scale 🟢 ✅

*Done this session. `getLogs` went from 1 + N (a query per day) to 2 queries via a
single joined `day_item` fetch grouped in memory; `exportAllData` got the same
treatment (one `day_item` fetch for the whole DB instead of per-day). Added
`idx_attempt_challenge`. `evaluateAttempt`/`itemStats` are now `useMemo`'d on the
Today/Dashboard/Trends screens so unrelated re-renders don't re-walk 80 days.*

- `getLogs` currently does one query per day for `day_item` — fine at low volumes,
  worth batching into a single joined query before dashboard/calendar/trends all
  read the full 80-day history on every render.
- Memoize `evaluateAttempt`/`itemStats` calls per screen (they're pure — safe to
  memo on the logs array reference) so re-renders don't re-walk 80 days repeatedly.
- Confirm SQLite indexes exist for the query patterns each new screen introduces
  (calendar/trends will scan the full `day`/`day_item` range).

## M13 — iOS home-screen widget 🔴 ⬜

- Today's ring on the home screen needs a native WidgetKit extension — there is no
  way to build this without a custom dev client / EAS build with a config plugin
  (e.g. `@bacons/apple-targets` or a hand-written widget extension). This is the one
  item on this whole roadmap that **cannot** be prototyped in Expo Go at all, even
  for a quick look.
- Flagging for your explicit go-ahead per the hard constraint — see questions below.

## M14 — App Store submission checklist 🟡 ⬜

- EAS Build for iOS (`eas build --platform ios`) — produces the signed binary; this
  step alone doesn't change your day-to-day Expo Go workflow.
- TestFlight distribution via EAS Submit — full on-device test pass before public
  release.
- App Store screenshots (all required device sizes), privacy policy page (contact
  form question: hosted where? — the main portfolio site is the obvious host),
  App Privacy questionnaire (data collected: none leaves the device in v1 — easy
  answer given no cloud sync yet), app description/keywords/support URL.
- Decide: extract `eighty/` into its own git repo before this step (PLAN.md §1
  already recommends it — "Vercel/portfolio CI shouldn't build a mobile app") or
  stay in the portfolio monorepo through submission.

---

## Proposed build order

1. **M4** dashboard + calendar + leaderboard — biggest visible gap, all pure UI on
   an already-tested engine.
2. **M5** challenge builder + 75 Hard preset + import/export — unlocks anything
   beyond the one hardcoded preset.
3. **M7** onboarding — do this once the builder exists, since onboarding routes into
   it.
4. **M6** trends + day editing + notifications + Settings.
5. **M11** multi-challenge switching — natural follow-on once Settings exists.
6. **M9** backup/restore.
7. **M8** accessibility + motion polish pass.
8. **M12** performance pass (once dashboard/calendar/trends exist to actually
   profile).
9. **M10** real icon/splash art.
10. **M14** App Store submission checklist.
11. **M13** widget — last, and only if you approve the dev-build tradeoff.

**Decided (2026-07-17):**

1. **Home-screen widget (M13):** build it last, right before App Store submission —
   everything else stays pure Expo Go until then.
2. **Repo extraction (M14):** stays in the portfolio monorepo through all
   development milestones; extract to its own repo only at the M14 submission step.

Building in the order above now, keeping the engine green, keeping it running in
Expo Go, committing per coherent chunk — flagging only if something I find changes
the picture.
