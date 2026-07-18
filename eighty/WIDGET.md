# Eighty — iOS Home-Screen Widget (M13) — Implementation Plan

**Status: NOT built yet — awaiting your go-ahead on the dev-build tradeoff.**

This is the one feature on the whole roadmap that **cannot** run in Expo Go, not even
for a quick look. A home-screen widget is a native **WidgetKit** extension — a second
build target written in Swift. To get it onto your phone you need a **custom dev build**
(EAS build with a config plugin), which installs a *new* app client alongside Expo Go.
Everything else in Eighty stays pure Expo Go until you decide to do this.

I deliberately did **not** add any of this to `app.json`/native config yet, because an
uninstalled config plugin in `plugins` would break `npx expo start` and `expo export` —
i.e. it would break the thing the hard constraint says must keep working. This document
is the turnkey plan so it's a short, low-risk job once you greenlight it.

---

## The tradeoff, in plain terms

- **Cost:** you stop testing via Expo Go and start testing via a *dev build* (a custom
  client you install once through EAS/TestFlight). Slightly heavier iteration loop.
- **Benefit:** today's ring on the home screen (and lock-screen), glanceable without
  opening the app.
- **When:** the roadmap already says do this **last, right before App Store submission**
  so the rest of development stays on the fast Expo Go loop. Nothing here blocks shipping
  a v1 *without* a widget.

**Decision needed from you:** "yes, add the widget (I accept the dev-build loop)" or
"ship v1 without it." Until then this stays unbuilt and Expo Go keeps working.

---

## Recommended approach: `@bacons/apple-targets`

Evan Bacon's config plugin is the least-painful way to add an iOS widget target to an
Expo app without ejecting. Alternatives (hand-written extension + manual `.pbxproj`
edits) are far more brittle.

### High-level architecture

```
┌─────────────────┐     writes snapshot      ┌──────────────────────┐
│  Eighty RN app  │ ───────────────────────▶ │  App Group container │
│ (JS/TS)         │   {pct, day, goal, …}    │  group.com.keaten…   │
└─────────────────┘                          └──────────┬───────────┘
                                                        │ reads
                                             ┌──────────▼───────────┐
                                             │  EightyWidget (Swift) │
                                             │  WidgetKit + SwiftUI  │
                                             └───────────────────────┘
```

The app and the widget can't share the SQLite DB directly, so the app writes a tiny
**snapshot** to a shared **App Group**, and the widget reads it. The widget never runs
the engine — it just renders the last snapshot the app wrote.

---

## Step 1 — App Group

- App Group id: `group.com.keatentuttle.eighty`.
- Register it in the Apple Developer portal (Certificates, IDs & Profiles → Identifiers →
  App Groups), and add it to the app's identifier's capabilities.
- Declare it for both targets via the config plugin (below). EAS-managed credentials will
  pick it up.

## Step 2 — The snapshot the app writes (this is the only app-side code)

Add a tiny, **Expo-Go-safe** writer. It computes the same numbers the Today screen shows
and writes them to the App Group's `UserDefaults` suite. In Expo Go (no native module /
no App Group) it must **no-op**, so nothing breaks on the normal dev loop.

```ts
// src/data/widget.ts  (add when building the widget)
import { ExtensionStorage } from '@bacons/apple-targets'; // provided by the plugin
import { AttemptState, DayScore } from '@engine';

const SUITE = 'group.com.keatentuttle.eighty';

export interface WidgetSnapshot {
  pct: number;        // today's day-progress %, capped 0..100
  goalPct: number;    // daily threshold
  dayNumber: number;  // 1-based day index
  totalDays: number;
  successDays: number;
  marginForError: number;
  updatedAt: string;  // ISO
}

export function publishWidgetSnapshot(snap: WidgetSnapshot | null): void {
  try {
    const storage = new ExtensionStorage(SUITE);
    storage.set('today', snap ? JSON.stringify(snap) : null);
    ExtensionStorage.reloadWidget(); // ask WidgetKit to refresh
  } catch {
    // Expo Go / no App Group — safe no-op.
  }
}
```

Call `publishWidgetSnapshot(...)` from the same places that already `refresh()` after a
write (item toggle, close-out, day edit). Build the payload from the values Today already
computes: `scoreDay(...).pct`, `config.dailyThresholdPct`, `openDay.dayIndex + 1`,
`state.successDays`, `state.marginForError`.

> Because the import is only referenced inside a `try`, and the plugin ships a JS shim,
> this file stays importable in Expo Go. If you prefer belt-and-suspenders, gate the whole
> module behind `Constants.appOwnership !== 'expo'`.

A pure `buildWidgetSnapshot(config, logs)` selector belongs in `src/data` (not the
engine) so it can be unit-tested without native modules; keep the engine untouched.

## Step 3 — The widget (Swift / WidgetKit)

`@bacons/apple-targets` puts native target files under `targets/widget/`. Sketch:

```swift
// targets/widget/Widget.swift
import WidgetKit
import SwiftUI

struct Entry: TimelineEntry {
  let date: Date
  let pct: Double
  let goalPct: Double
  let dayNumber: Int
  let totalDays: Int
}

struct Provider: TimelineProvider {
  func placeholder(in ctx: Context) -> Entry {
    Entry(date: .now, pct: 0.8, goalPct: 0.8, dayNumber: 1, totalDays: 80)
  }
  func getSnapshot(in ctx: Context, completion: @escaping (Entry) -> Void) {
    completion(readEntry())
  }
  func getTimeline(in ctx: Context, completion: @escaping (Timeline<Entry>) -> Void) {
    // App calls reloadWidget on every change; also refresh hourly as a fallback.
    let next = Calendar.current.date(byAdding: .hour, value: 1, to: .now)!
    completion(Timeline(entries: [readEntry()], policy: .after(next)))
  }
  private func readEntry() -> Entry {
    let d = UserDefaults(suiteName: "group.com.keatentuttle.eighty")
    guard let raw = d?.string(forKey: "today"),
          let data = raw.data(using: .utf8),
          let s = try? JSONDecoder().decode(Snapshot.self, from: data)
    else { return Entry(date: .now, pct: 0, goalPct: 0.8, dayNumber: 0, totalDays: 80) }
    return Entry(date: .now, pct: s.pct / 100, goalPct: s.goalPct / 100,
                 dayNumber: s.dayNumber, totalDays: s.totalDays)
  }
}

struct Snapshot: Codable { let pct: Double; let goalPct: Double
  let dayNumber: Int; let totalDays: Int; let successDays: Int
  let marginForError: Int; let updatedAt: String }

struct EightyWidgetView: View {
  var entry: Entry
  var body: some View {
    ZStack {
      Circle().stroke(Color(hex: 0x1a2620), lineWidth: 10)
      Circle().trim(from: 0, to: entry.pct)
        .stroke(Color(hex: 0x7fdcb2), style: .init(lineWidth: 10, lineCap: .round))
        .rotationEffect(.degrees(-90))
      VStack(spacing: 2) {
        Text("\(Int(entry.pct * 100))%").font(.system(size: 22, weight: .heavy))
        Text("Day \(entry.dayNumber)/\(entry.totalDays)").font(.system(size: 11))
          .foregroundColor(Color(hex: 0x8da399))
      }
    }
    .padding(12)
    .containerBackground(Color(hex: 0x0d1411), for: .widget)
  }
}
// + a small Color(hex:) helper, the @main Widget struct, and Info.plist for the target.
```

The palette hexes above are the Night Fir tokens (`card2`, `mint`, `sub`, `bg`) so the
widget matches the in-app ring exactly.

## Step 4 — Config plugin wiring (build time only — do NOT add until building)

```jsonc
// app.json → expo.plugins  (ADD ONLY when you build; installing the pkg first)
["@bacons/apple-targets", { "appleTeamId": "YOUR_TEAM_ID" }]
```
```powershell
npx expo install @bacons/apple-targets
```
Because config plugins only run during prebuild/native builds, adding this does **not**
affect the JS bundle — but the package must be installed or Metro will error, which is
exactly why it's not in `app.json` today.

## Step 5 — Build & test

```powershell
$env:PATH = "C:\Program Files\nodejs;" + $env:PATH
eas build --platform ios --profile development   # dev client WITH the widget target
```
Install the dev build on your iPhone, open Eighty once (so it writes the first snapshot),
then long-press the home screen → add the **Eighty** widget. Toggle items in the app and
confirm the ring updates.

## Step 6 — Verify Expo Go still works

Before/after, confirm the normal loop is untouched:
```powershell
npx expo start        # scan in Expo Go — must still load
npx expo export --platform ios   # must still bundle; then delete dist/
```

---

## Effort & risk

- **Effort:** ~half a day once the Apple team id + App Group exist. Most of it is Swift
  UI polish and getting the App Group entitlement right.
- **Risk:** entitlement/credential mismatches are the usual snag; EAS-managed credentials
  handle most of it. The RN side is tiny and guarded, so it can't break Expo Go.
- **Not required for v1.** Ship the app first if you want; add the widget in a follow-up
  release.
