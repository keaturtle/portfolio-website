# Eighty — Session Log

A running, human-readable log so you can catch up in two minutes. Newest entry on top.

---

## 2026-07-17 — Takeover session (autonomous)

**Caught up & verified the baseline.**

- Read PLAN.md, ROADMAP.md, CLAUDE.md, the engine, and the app source.
- `npm --prefix eighty/engine test` → **64 tests green, 100% coverage** (stmts/branch/funcs/lines).
- `cd eighty && npx tsc --noEmit` → **clean**.
- `npx expo export --platform ios` → **bundles successfully** (3.6 MB hbc). Deleted `dist/`.
- Found one uncommitted change in the tree: root `package-lock.json` had unrelated
  transitive-dependency drift (babel, adobe/css-tools) with **no** `package.json` change.
  It was portfolio-website noise, not Eighty work, so I reverted it rather than commit it.

**Reconciled the roadmap to git.** The roadmap's "done" implication ran ahead of the
commits. Added a "Status at a glance" table mapping each milestone to the commit that
landed it. Committed = M4, M5, M6, M7, M9, M11. Not started = M8, M10, M12, M13, M14.

**Then proceeded autonomously through the remaining milestones** (see commits after the
roadmap-reconcile commit for details).

**M8 — Accessibility & motion polish (done).**
- WCAG contrast audit on both palettes. Dark passes AA everywhere. Light `sub`/`mint`/
  `sienna` were ~0.01–0.5 under 4.5:1 on the lightest surfaces; darkened slightly to
  clear AA. Accepted the low-contrast card border as an intentional separator (card is
  identified by fill). Full table in QA.md.
- VoiceOver: ProgressRing grouped label, RatingScale selected-state, ItemStatRow and
  Sparkline read as one line, and roles/labels on every icon-only button + switch + pill.
- Haptics: extended selection/impact/success vocabulary to calendar taps, theme pills,
  strictness pills, and all toggle switches.
- Motion: animated ring fill (core RN Animated on the SVG dash offset — Expo-Go-safe),
  gated by a new `useReducedMotion()` hook.
- Verified: tsc clean, 64 engine tests green, iOS bundle exports.

**M10 — Visual identity (done).**
- Replaced Expo-template art with a real Night Fir mark: the app's signature progress
  ring at 80% (mint arc + faint track + sienna leading dot) on a subtle fir radial.
- Generated `icon.png` (opaque 1024), `splash-icon.png` (transparent), `adaptive-icon.png`
  (Android foreground), `favicon.png`; committed the generator at `scripts/generate-icons.js`.
- Wired Android `adaptiveIcon` in app.json; bumped splash `imageWidth` to 220.
- NB: Expo Go shows *its own* icon — this is only visible on an EAS build / TestFlight.

**M13 — iOS widget (BUILT after your go-ahead).** You said build it + you'll pay the $99.
Implemented via `@bacons/apple-targets`:
- `targets/widget/index.swift` — SwiftUI ring (small + medium) in Night Fir colors.
- `src/data/widget.ts` — pure `buildWidgetSnapshot` + guarded `publishWidgetSnapshot`
  (writes to App Group `group.com.keatentuttle.eighty`; no-op in Expo Go).
- `useActiveChallenge` publishes after every mutation + on mount.
- `app.json` — plugin + App Group entitlement.
- Verified: tsc clean, engine green, **`expo export` still bundles → Expo Go intact.**
- Could NOT verify on Windows: the Swift compile / on-device render (needs the EAS build).
- Left for you: set `ios.appleTeamId`, `eas build`. Steps in `WIDGET.md`.

**M14 — Submission prep (done; the rest needs your Apple account).**
- `eas.json` (development/preview/production + submit), `ios.bundleIdentifier`
  (`com.keatentuttle.eighty`), `ITSAppUsesNonExemptEncryption: false`.
- `PRIVACY.md` (host it on the portfolio site), paste-ready store copy, App Privacy =
  "Data Not Collected", and a full step-by-step in `SUBMISSION.md`.
- Two decisions left for you (in DECISIONS.md): iPad support (screenshots) and final App
  Store name (may be taken).

**M12 — Performance at 80-day scale (done).**
- `getLogs`: was 1 + N queries (one per day for its items); now 2 total via a joined
  `day_item` fetch grouped in memory. Same fix applied to `exportAllData` (one DB-wide
  `day_item` fetch instead of per-day). Order-independent, so the engine is unaffected.
- Added `idx_attempt_challenge`; day/day_item hot paths were already covered by their
  UNIQUE/PK autoindexes.
- `useMemo`'d `evaluateAttempt`/`itemStats` on Today/Dashboard/Trends (logs snapshot is
  stable between unrelated re-renders, so the memo actually saves the 80-day walk).
- Verified: tsc clean, 64 engine tests green, iOS bundle exports.

### Verified this session
- Engine: 64+ tests, 100% coverage (kept green after any engine change).
- `tsc --noEmit`: clean.
- `expo export --platform ios`: bundles (dist deleted each time).

### Assumptions made while you were away
See `DECISIONS.md` — anything I chose without you is logged there with the reasoning.

### What's left when I stop
**Every milestone M4–M14 is now built and committed**, including the M13 widget. The only
remaining work is the stuff that physically requires *your* Apple account + a Mac-based
build (which I can't do from Windows/Expo Go):

1. **Build & ship (M13 + M14).** Set `ios.appleTeamId`, then `eas build` / `eas submit`.
   This one flow both makes the **widget** go live and produces the App Store binary. Host
   `PRIVACY.md`, add screenshots. Every step is in `SUBMISSION.md` and `WIDGET.md`.
2. **Two small decisions** (DECISIONS.md): iPad support (affects required screenshots) and
   the final App Store name (may be taken).

Nothing is stranded — everything is committed and pushed on
`claude/eighty-challenge-tracker-sbj6q1`. Read `DECISIONS.md` for the calls I made and the
few I left to you.
