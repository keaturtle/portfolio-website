# Eighty — Decisions & Assumptions (made while you were away)

Product/technical calls I made autonomously, each with the reasoning, so you can
override any of them on review. Newest on top. Nothing here is irreversible.

---

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
