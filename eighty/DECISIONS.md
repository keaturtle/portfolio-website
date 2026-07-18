# Eighty — Decisions & Assumptions (made while you were away)

Product/technical calls I made autonomously, each with the reasoning, so you can
override any of them on review. Newest on top. Nothing here is irreversible.

---

## 2026-07-17

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
