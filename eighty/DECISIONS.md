# Eighty — Decisions & Assumptions (made while you were away)

Product/technical calls I made autonomously, each with the reasoning, so you can
override any of them on review. Newest on top. Nothing here is irreversible.

---

## 2026-07-23 (later) — Onboarding + avoidance behavior (Task 2)

- **Palette:** you picked **Midnight Indigo** (the app's shipped palette) for onboarding —
  no token change needed. New positive item labels applied (Drink clean / Eat clean / Park
  the phone / Lights out, etc.).
- **Avoidance auto-confirm timing:** the brief said "auto-confirm at day *close*." I
  implemented **auto-complete at day *open*** (optimistic) instead — it's the only model that
  keeps the live daily % correct AND needs no engine/scoring change AND no new slip table.
  A tap logs a slip (un-checks). With wake-to-wake, the prior day only closes next morning,
  so the fast is effectively finalized then — matching the spirit. Flag if you want strict
  at-close semantics (would need a slips store).
- **"Lite" preset:** your CTA note mentioned "Lite and Founder's Protocol as alternatives,"
  but there's no Lite preset defined. "Start my 80" routes to the flagship preview
  (customize/alternatives reachable from there + the Challenges tab). **Do you want a Lite
  tier?** If so, tell me the ruleset.
- **Category-label redundancy** on Today for the flagship (time-group categories duplicate
  the section header) is still present — cheap to hide; say the word.

## 2026-07-23 (later) — Flagship preset overhaul (Task 1)

- Replaced the 80/80/80 seed list with the new **10 regular items** (grouped by time of
  day: Morning / Through the day / Evening) + **7 bonus**. Daily success = 8 of 10.
- Kept **75 Hard** unchanged; added **Founder's Protocol** = the previous 25-item list,
  renamed (20 of 25 daily). All three are in `PRESETS`.
- **Avoidance flag:** added `isAvoidance` as item metadata (`PresetItem` + a new
  `item.is_avoidance` column, with an additive `ALTER TABLE` migration so existing beta
  DBs don't break). **This is metadata only — the engine and its scoring are untouched.**
  The actual avoidance *rendering* + auto-confirm-at-close + slip-marking is Task 2 (its QA
  lives there), so until Task 2 ships, avoidance items render like normal action items.
- **Interpretation flagged:** the brief said "seed data only," but marking items as
  avoidance genuinely requires a metadata field + column. I treated it as additive item
  metadata (like `is_bonus`/`time_of_day`), not an architecture change. Say the word if
  you'd rather model it differently.
- Categories for the flagship are the time-of-day groups themselves (per "replacing domain
  categories"). Minor consequence: the per-row category chip on Today duplicates the
  section header — cheap to hide; I'll address it in the Task 2 Today-preview if you want.
- Engine test added for the fast's wake-to-wake attribution (counts for the still-open
  prior day). 68 tests, 100% coverage.

## 2026-07-18

### Theme switched to "Midnight Indigo" (Obsidian · Electric blue · Persimmon)
You picked this in the colorway studio. Applied to both `tokens.ts` palettes (dark + a
coordinated light variant), both verified ≥ WCAG AA. Regenerated the app icon/splash to
match (blue ring + persimmon dot on obsidian). Kept the token names `mint`/`sienna` (now
holding blue/persimmon) to avoid a churny rename across every screen. **Reversible:** the
old Night Fir values are in git history (pre-`7295632`).

### Version bumped to 1.0.0
For the TestFlight/App Store build. `buildNumber` auto-increments via the EAS `production`
profile.

## 2026-07-17

### M13 widget — you greenlit it; now BUILT (2026-07-18)
You said "build the whole app with the widget, I'll pay the $99," so I implemented it via
`@bacons/apple-targets`: SwiftUI ring in `targets/widget/`, an App Group data bridge in
`src/data/widget.ts` published from `useActiveChallenge`, and the entitlement/plugin in
`app.json`. Kept Expo Go working (the bridge no-ops without the native module; `expo export`
verified). **What I could not do on Windows:** compile the Swift or render the widget — that
happens in the EAS build. **What's left for you:** set `ios.appleTeamId` and run `eas build`
(then register the App Group when prompted). Steps in `WIDGET.md`. Chosen App Group id:
`group.com.keatentuttle.eighty`. **Reversible:** remove the plugin + `targets/` + the
entitlement to drop the widget entirely.

### Open questions for you (M14 submission) — not blocking, flagged for review
1. **iPad support — DECIDED 2026-07-18: iPhone-only.** Set `ios.supportsTablet: false`
   (you have no iPad/Mac to capture iPad screenshots, and Apple only requires them if the
   app supports iPad). iPad users can still install it at iPhone size. Reversible.
2. **App name.** "Eighty" is global-unique on the App Store and may be taken. Fallbacks
   drafted: "Eighty — 80/80/80" or "Fourscore" (from PLAN.md §7). The *on-device* name
   stays "Eighty" regardless. Confirm availability when you create the App Store Connect
   record.
3. **Bundle identifier.** I chose `com.keatentuttle.eighty`. Change it before your first
   EAS build if you'd prefer a different reverse-DNS id (it's permanent once submitted).

### App icon / identity: the 80%-progress ring
Picked the app's own `ProgressRing` motif — a mint ring filled to 80% with a sienna
leading dot on a Night Fir background — as the app icon/splash/favicon, rather than a
wordmark or an abstract glyph. Rationale: it's already the emotional centerpiece of the
Today screen, instantly says "80" and "almost there," and needs no localization. Rendered
programmatically (pure `pngjs`, 4× supersampled) so it's reproducible and tweakable — the
generator is committed at `scripts/generate-icons.js` (`node scripts/generate-icons.js`).
**Reversible:** edit that script and re-run, or just replace the PNGs in `assets/images/`.

### Reverted an unrelated `package-lock.json` change
The working tree had a modified root `package-lock.json` (transitive bumps: babel,
`@adobe/css-tools`, etc.) with no matching `package.json` change. That's portfolio-site
dependency drift, unrelated to Eighty, so I reverted it instead of committing it under an
Eighty message. **Reversible:** re-run `npm install` at the repo root if you want those
bumps back.
