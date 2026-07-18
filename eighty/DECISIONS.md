# Eighty — Decisions & Assumptions (made while you were away)

Product/technical calls I made autonomously, each with the reasoning, so you can
override any of them on review. Newest on top. Nothing here is irreversible.

---

## 2026-07-17

### Open questions for you (M14 submission) — not blocking, flagged for review
1. **iPad support.** `app.json` keeps `ios.supportsTablet: true`, which means Apple will
   **require iPad screenshots**. The UI is phone-designed but runs fine scaled on iPad.
   Set it to `false` for a phone-only v1 if you'd rather skip iPad screenshots. Left as-is
   (no data loss either way). Details in SUBMISSION.md § 8.
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
