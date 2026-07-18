# Eighty — iOS Home-Screen Widget (M13)

**Status: BUILT in the repo. Goes live after you set your Apple Team ID and run a build.**

You greenlit the widget (and paying the $99). It's implemented and wired up. Because a
WidgetKit extension is native Swift, it can't run in Expo Go and I can't compile it on your
Windows machine — it comes to life when **EAS builds** the app (or you build on a Mac). The
main app still loads in Expo Go exactly as before (verified: `expo export` bundles; the
data bridge no-ops when the native module is absent).

---

## What's in the repo now

| File | What it is |
|------|-----------|
| `targets/widget/index.swift` | The WidgetKit extension — SwiftUI ring in Night Fir colors, small + medium families, reads the shared snapshot. |
| `targets/widget/expo-target.config.js` | Tells `@bacons/apple-targets` this is a `widget` target and shares the App Group. |
| `src/data/widget.ts` | App-side bridge: `buildWidgetSnapshot()` (pure) + `publishWidgetSnapshot()` (writes to the App Group, no-op in Expo Go). |
| `src/data/useActiveChallenge.ts` | Publishes a fresh snapshot after every mutation and on app open. |
| `app.json` | Registers the `@bacons/apple-targets` plugin and declares the App Group entitlement `group.com.keatentuttle.eighty`. |

### How it works

```
Eighty app (JS) ──writes snapshot──▶ App Group (group.com.keatentuttle.eighty) ──read──▶ EightyWidget (Swift)
   {pct, day N/M, success days, margin, name}         shared UserDefaults              SwiftUI ring
```

The app and widget can't share SQLite, so the app writes a tiny JSON snapshot of today's
ring to a shared App Group whenever data changes (`refreshWidget` in `useActiveChallenge`),
and calls `WidgetKit.reloadAllTimelines()`. The widget just renders the last snapshot — it
never runs the engine.

---

## The last mile — 🔑 YOU (after you pay the $99)

Everything below needs the paid Apple Developer account. Run from `eighty/`:

### 1. Add your Apple Team ID — ✅ done
Set in `app.json` → `ios.appleTeamId: "3M7JS7T537"` (2026-07-18). The `[bacons/apple-targets]
missing appleTeamId` warning is gone.

### 2. Register the App Group (or let EAS do it)
In the Apple Developer portal → Identifiers → **App Groups**, add
`group.com.keatentuttle.eighty`, and enable the App Groups capability on the
`com.keatentuttle.eighty` App ID. `eas build` with managed credentials will usually create
these for you the first time — just say **yes** when it offers.

### 3. Build a dev client that includes the widget
```powershell
$env:PATH = "C:\Program Files\nodejs;" + $env:PATH
eas build --platform ios --profile development
```
Install it on your iPhone (it replaces Expo Go for *this app* only). Open Eighty once so it
writes the first snapshot, then long-press the home screen → **+** → search **Eighty** →
add the widget. Toggle items in the app and watch the ring update.

> For the App Store build, the widget is included automatically in
> `eas build --profile production` — no extra step.

### 4. Confirm Expo Go still works (sanity check)
```powershell
npx expo start                     # scan in Expo Go — the app still loads
npx expo export --platform ios     # still bundles; then delete dist/
```
The widget just won't appear in Expo Go (expected — Expo Go can't host native extensions).

---

## Notes & gotchas

- **iOS 18 quirk:** if the widget doesn't show in the gallery after installing, long-press
  the app icon and pick the widget display option (known WidgetKit behavior on iOS 18).
- **Deployment target** is set to iOS 17 (WidgetKit `containerBackground`). Devices on iOS
  16 or older just won't see the widget; the app itself still supports older iOS.
- **Data shape:** `EightySnapshot` in `index.swift` must stay in sync with `WidgetSnapshot`
  in `src/data/widget.ts` (same field names). If you add a field, add it in both.
- **Verified here:** `tsc` clean, engine still 64 tests green, `expo export` bundles. **Not
  verifiable on Windows:** the Swift compile + on-device render — that happens in the EAS
  build.
