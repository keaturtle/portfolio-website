# Eighty — Decisions & Assumptions (made while you were away)

Product/technical calls I made autonomously, each with the reasoning, so you can
override any of them on review. Newest on top. Nothing here is irreversible.

---

## 2026-07-17

### Reverted an unrelated `package-lock.json` change
The working tree had a modified root `package-lock.json` (transitive bumps: babel,
`@adobe/css-tools`, etc.) with no matching `package.json` change. That's portfolio-site
dependency drift, unrelated to Eighty, so I reverted it instead of committing it under an
Eighty message. **Reversible:** re-run `npm install` at the repo root if you want those
bumps back.
