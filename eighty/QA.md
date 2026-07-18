# Eighty — QA & Accessibility

Two things live here: the **accessibility audit** (M8) and the **manual QA checklist**
from the original spec, each scenario mapped to how it's verified.

---

## Accessibility (M8)

### Color contrast (WCAG)

Both "Night Fir" palettes were checked with the standard WCAG relative-luminance
formula (script kept in the session scratchpad; reproducible from `tokens.ts`).
Targets: **4.5:1** for normal text, **3:1** for large text / UI components.

**Dark palette (native scheme):** every text pairing passes AA comfortably —
`ink` 15–16:1, `sub` 5.8–7:1, `mint`/`sienna` accents 5.3–11:1, button labels
6.6–11:1.

**Light palette:** three tokens were darkened slightly from the first draft so they
clear AA on the lightest surfaces (cards and chips), where the original values landed
just under 4.5:1:

| Token | Was | Now | Tightest ratio now |
|-------|-----|-----|--------------------|
| `sub`    | `#5f7168` | `#586a60` | 4.77:1 on `card2` |
| `mint`   | `#177651` | `#156c4a` | 5.13:1 on `mintSoft` |
| `sienna` | `#b95c34` | `#a54c26` | 4.59:1 on `siennaSoft` |

**Known, accepted sub-3:1 pairing:** the card **border** (`line`) sits ~1.2:1 against
the card fill in both palettes. This is an intentional, low-contrast separator; the
card is already identified by its **fill** (`card` vs `bg`), so the border is not the
sole means of distinguishing the component (WCAG 1.4.11 is about information *required*
to identify a control). Left as-is to preserve the premium look; documented here so the
choice is deliberate, not an oversight.

### VoiceOver labels

Audited every interactive element. Added/confirmed:
- **ProgressRing** — groups its inner texts under one label ("Today's progress: N
  percent complete, goal M percent. Goal met.") instead of reading "N%" and "goal M%"
  as two fragments.
- **CheckRow** — `checkbox` role + checked state (pre-existing).
- **RatingScale** — `button` role + `selected` state per dot.
- **HeatGrid cells** — `button` role + "Day N, {outcome}" label (pre-existing);
  added a selection haptic on tap.
- **ItemStatRow** — reads as one line ("{label}, {category}: completed N percent of
  eligible days") instead of fragmenting.
- **Sparkline** — was silent; now carries a summary ("{Satisfaction} trend over N
  days: latest X, ranging Y to Z").
- **Icon-only buttons** — Settings gears (Dashboard/Trends), export/delete on
  Challenges, remove-item ✕ in Builder, all given roles + labels.
- **Switches** — Travel-day (Today + Day detail) and reminder toggles (Settings)
  and builder toggles given explicit labels.
- **Theme / strictness pills** — `button` role + `selected` state.
- **Tab bar** — expo-router derives accessible tab roles/labels from each screen's
  `title`; no change needed.

### Dynamic Type

RN `Text` scales with iOS Dynamic Type by default (`allowFontScaling` defaults on).
Grep confirms nothing sets `allowFontScaling={false}` anywhere, so all copy scales.
Layouts use padding-driven (not fixed-height) containers, so scaled text reflows
rather than clipping. Single-glyph fixed dots (rating 1–5) are the only fixed-size
text and remain legible at the largest setting.

### Haptics vocabulary (consistent app-wide)

- **selection** — toggles (travel, reminders, theme), rating dots, strictness pills,
  calendar cell taps, builder preset load/steps.
- **impact medium** — checking an item on; **impact light** — unchecking.
- **notification success** — closing out a day.

### Motion

- Signature **ring fill** animates from empty on load and eases to new values as items
  are checked (core RN `Animated` on the SVG dash offset — works in Expo Go, no
  reanimated babel setup needed).
- Respects **Reduce Motion**: `useReducedMotion()` (`AccessibilityInfo`) snaps the ring
  straight to its final value when the OS setting is on.

---

## Manual QA checklist (from the spec / PLAN.md)

Legend: **engine** = covered by an automated engine test (100% coverage) · **UI** = a
manual on-device check (no pure-logic surface to automate).

| # | Scenario | How it's verified |
|---|----------|-------------------|
| 1 | Exact-80% day counts as success (20/25; 64/80) | **engine** — `scoreDay` "exactly 80% (20/25) is a success"; `thresholds` "80% of 80 days = 64" |
| 2 | No-repeat-miss + travel exemption | **engine** — `findViolations` travel-exemption suite (either/both days, and disabled) |
| 3 | All three restart modes (flexible / strict / hardcore) | **engine** — `strictness modes` suite incl. 75 Hard (100% daily) |
| 4 | Close-out-yesterday attribution (bed items log to the still-open day) | **engine** day-identity (`localDateLabel`, `fillGaps`) + **UI** close-out banner on Today |
| 5 | Editing an old day recomputes everything downstream | **engine** — `retroactive edits recompute everything downstream` (both cases) |
| 6 | Mathematical-impossibility timing (16 survivable, 17th fatal) | **engine** — `challenge success and mathematical impossibility` suite |
| 7 | DST day neither skips nor duplicates a day | **engine** — `localDateLabel` + `addDays/diffDays` DST tests (Denver spring/fall) |
| 8 | Export → import round-trip preserves everything | **UI** — `Settings → Back up everything` then `Restore`; and per-challenge export/import on Challenges. Data-layer (SQLite) path, not pure engine. |

### UI-only checks to run on device before submission
- [ ] First-run: pick 80/80/80 preset → preview → start, under 2 minutes.
- [ ] Check/uncheck items; ring animates and margin/stat text updates live.
- [ ] Close out a day whose label is in the past (close-out banner path).
- [ ] Open a past calendar cell, toggle an item that flips a later day, confirm the
      "Heads up" consequence dialog appears (strict/hardcore or success-flip).
- [ ] Back up everything → delete a challenge → restore → data returns intact.
- [ ] Export a single challenge to a file → import it back → preview matches.
- [ ] Toggle OS Reduce Motion → ring no longer animates.
- [ ] VoiceOver sweep of Today, Dashboard, Trends, Builder, Settings.
- [ ] Largest Dynamic Type setting → no clipped or truncated critical text.
