# Eighty — MVP Polish Review (branch `mvp-polish`)

Full review-and-fix pass, 2026-07-27. Baseline preserved at tag
`mvp-snapshot-pre-fable-review`; every change is on `mvp-polish` in small
commits. Verified after every chunk: engine suite (68 tests, 100% coverage —
unchanged), new app-level data suite (27 tests), `tsc --noEmit`, and an iOS
bundle export. Still fully loadable in Expo Go; the widget target remains the
only EAS-build exception.

---

## The root causes behind the reported bugs

### 1. "Delete does nothing / Today shows the start screen / edits don't stick" — one bug, not three

`deleteChallenge` was never broken. A new SQL-level test harness (Jest running
`SqliteRepository` against Node's built-in SQLite — real foreign keys, real
transactions) proves the delete cascades orphan-free. The actual defect: every
screen held its **own isolated snapshot** from `useActiveChallenge()`, and
`refresh()` only refreshed the calling screen. Tab screens stay mounted
forever, so after any create/delete/switch/edit, the *other* screens kept
rendering stale data — which presented as all three reported bugs.

**Fix (architecture):** a versioned change bus (`src/data/events.ts`), a
`NotifyingRepository` wrapper so **every** repository mutation emits
(`src/data/db.ts`), and one shared snapshot cache (`src/data/store.ts`) that
all screens read through `useSyncExternalStore`. Screens no longer refresh
manually — they can't be stale. Widget publishing now rides the same bus.

### 2. "The day doesn't advance"

Two defects:
- The "Move on to Day N" banner compares the open day's date to *today*, but
  nothing re-rendered when the date changed — an app resumed the next morning
  never showed it. Now the store bumps its version on **foreground** and at
  **local midnight**, so date-dependent UI re-renders itself.
- `closeDay` labelled the next day "today" no matter how long you were away —
  silently pausing the challenge, contradicting the approved plan (PLAN.md #2)
  and the engine's own `fillGaps`. Now skipped calendar days become real,
  closed, empty rows: they count as missed, they're back-fillable from the
  calendar, and the banner **discloses it before the tap** ("You've been away
  2 days — moving on logs them as missed"). A long absence past the end of the
  window finishes the challenge ("Finish the challenge" button, no new day).

### 3. "Custom challenges can't back-date"

The builder started challenges directly, skipping the preview screen (which
owns the start-date stepper). The builder now validates and routes into the
preview — presets, custom builds, and imported files all share one start path.

## Other defects found during review (not in the brief)

- **Template import dropped `isAvoidance`** — shared/re-imported challenges
  silently lost auto-count behavior. Fixed + round-trip/legacy-file tests.
- **Backdating farther than the challenge length** left a stale *open* day
  (window already over). Now every day closes and none opens. Test added.
- **Builder number fields snapped to "0"** while clearing/typing (parsed on
  every keystroke). Now string-edited, parsed at review.
- **Double haptic** on edit-challenge rule toggles.
- **Raw engine slug** (`no-repeat-miss`) rendered on the dashboard header.
- **Floating settings gears sat inside the notch** (fixed 16pt top).
- **Picker rejections** in import/restore were unhandled promises.
- **A corrupted database crashed before React mounted** (module-level open).
  The connection now opens lazily on first use so the ErrorBoundary shows a
  recoverable screen instead.

## UX / IA changes (Part B)

- Settings reachable from **all four tabs** (shared 44pt gear; safe-area-aware
  floating variant on empty states).
- Notification toggles state exactly what fires and when; iOS permission flow
  distinguishes a fresh decline (respected silently) from "blocked in iOS
  Settings" (offers an **Open Settings** button).
- Builder/edit-challenge threshold fields aligned (shared form primitives with
  reserved two-line captions replace three drifting per-screen copies);
  builder's new-item controls restructured into wrapping rows; custom items
  can be **Bonus** or **Counts by default** (avoidance), mutually exclusive.
- Design QA: 44pt targets (rating dots, row icons, links, Skip), Dynamic Type
  caps (1.1–1.2×) on tightly-fitted numerals only, VoiceOver labels on notes
  inputs, chevrons + button roles on Settings nav rows, redundant category
  chips hidden on the flagship's time-grouped Today list, empty-state copy
  tightened.

## Copy & voice (Part C)

All personal/founder references removed: preview's "Keaten's own ruleset",
onboarding's "— Keaten, builder of Eighty" sign-off and first-person voice,
Settings' "email me". **"Founder's Protocol" renamed "80/80/80 Classic"**
(existing installs keep their stored name; only new starts see the new one).
Avoidance rows now say "Counts as done — tap only if you slipped" (the old
"auto-confirms at day close" was internal jargon *and* the wrong timing —
seeding happens at day open). Notification content rewritten off the dead
"close out yesterday" model. Voice documented in `BRAND_VOICE.md`.

**Removed a business commitment from onboarding:** the beta screen promised
"you keep premium free for life." No pricing exists yet; shipping a permanent
pricing promise in a beta screen is a decision for you, not for copy. The
screen now thanks beta users and points at feedback without binding future
pricing. If you *want* a founding-user reward, decide it deliberately and I'll
write it back in.

## Engineering & performance (Part D)

- **New test harness:** `tests/` runs the real `SqliteRepository` against
  `node:sqlite` (zero new native deps; Node 24 ships it). 27 tests cover
  start/backdate/avoidance seeding, delete cascade + FK enforcement,
  closed-day edits, closeDay gap-fill/cap/idempotence/back-fill, config
  update, activation, settings, export/import round-trip, the legacy-DB
  column migration, template parsing, and mutation-notification behavior.
  `npm test` at `eighty/` runs it; the engine's isolated 100%-coverage gate is
  untouched.
- **Migration safety for existing TestFlight users:** this branch adds **no**
  schema changes. The only migration in the app remains the additive
  `is_avoidance` column with an idempotent guard (tested against a simulated
  legacy DB, data preserved).
- **Performance at 80 days:** one shared snapshot per data change for all
  screens (previously each screen re-queried independently); the Challenges
  list memoizes its every-challenge history walk on the data version
  (previously recomputed per render); `evaluateAttempt`/`itemStats` remain
  memoized per screen; `getLogs` stays at 2 queries per read. Remaining list
  renders are ≤ ~90 rows in plain ScrollViews — well under jank territory.

## Assumptions & judgment calls (flag if you disagree)

1. **Skipped days count as missed** (with plain-language disclosure and
   back-fill). This follows your approved PLAN.md #2 and makes "Day N" track
   the calendar — the alternative "challenge pauses while you're away" model
   is a one-line revert in `closeDay` if you'd rather have it.
2. **"80/80/80 Classic"** as the replacement preset name.
3. **Feedback email stays `keatentuttle@gmail.com`** — it's the only working
   contact. Consider a `feedback@`-style alias before public launch.
4. **Avoidance + Bonus are mutually exclusive** in the builder (a
   complete-by-default bonus would be free credit for nothing).
5. Backup restore applies the restored theme immediately (ThemeProvider
   re-reads on data change) — previously needed an app restart.

## Deferred / out of scope (intentionally)

- **Payments/subscription** — future update per your instruction; the only
  related change was *removing* the premature free-for-life promise.
- **Reminder time pickers** — toggles now state their fixed times (8:00 AM /
  9:00 PM); user-configurable times are a sensible v1.1.
- **HeatGrid cells** are ~40pt (dense-grid exception); day detail remains the
  accessible path.
- **Widget runtime verification** — can't compile Swift on Windows; the
  heartbeat diagnostic from the previous session still stands for the next
  TestFlight build.

## Needs you / Apple

- Rebuild for TestFlight when ready:
  `npx eas-cli build --platform ios --profile production --auto-submit`
  (nothing in this branch changes native config — no new permissions,
  entitlements, or targets).
- Read the widget's "synced / not synced" diagnostic on that build (see
  WIDGET.md) — it pinpoints the remaining widget issue if the ring is still
  empty.
- Merge decision: `mvp-polish` → your working branch when you've reviewed.
