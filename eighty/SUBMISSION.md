# Eighty — App Store Submission Checklist

This is the step-by-step for getting Eighty onto TestFlight and the App Store. I
(Claude) did everything that doesn't need your Apple account or a paid build. Anything
marked **🔑 YOU** needs you personally — your Apple ID, the $99/yr Apple Developer
Program, or a decision only you can make. Commands are copy-paste ready; run them from
the `eighty/` folder.

> Node isn't on PowerShell's PATH by default on your machine. Prefix a session once with:
> ```powershell
> $env:PATH = "C:\Program Files\nodejs;" + $env:PATH
> ```

---

## 0. What's already done (in the repo)

- ✅ Real app icon, splash, adaptive icon, favicon (Night Fir progress-ring mark).
- ✅ `ios.bundleIdentifier` = `com.keatentuttle.eighty` set in `app.json`.
- ✅ `ITSAppUsesNonExemptEncryption: false` set — skips the export-compliance prompt on
  every TestFlight upload (the app uses no non-exempt encryption; it's local-only).
- ✅ `eas.json` with `development` / `preview` / `production` build profiles + a
  `production` submit profile.
- ✅ Privacy policy written (`PRIVACY.md`) — ready to host.
- ✅ Store listing copy drafted (below).
- ✅ App Privacy answers worked out (below): "Data Not Collected."
- ✅ Home-screen **widget built** (`@bacons/apple-targets`, App Group). It ships inside the
  normal production build — no separate step — but needs your **Apple Team ID** and the App
  Group registered. See `WIDGET.md` for the last mile.

## 1. Accounts & prerequisites — 🔑 YOU

- [ ] **Apple Developer Program** membership — https://developer.apple.com/programs/
      ($99/yr). Required to ship to TestFlight or the App Store.
- [ ] **Expo account** (free) — https://expo.dev/signup. EAS uses it to run builds.
- [ ] Decide the **App Store display name**. "Eighty" may already be taken on the App
      Store (names are global and unique). Check in App Store Connect when you create the
      app record. Fallbacks: **"Eighty — 80/80/80"**, or the name from PLAN.md, **"Fourscore."**
      (The on-device app name in `app.json` can stay "Eighty" regardless.)

## 2. One-time project setup

```powershell
# from eighty/
npm install -g eas-cli
eas login                      # 🔑 YOU — your Expo credentials
eas init                       # links this project to an EAS project id, writes it to app.json
```

- [ ] Run the three commands above.
- [ ] `eas init` will add an `extra.eas.projectId` to `app.json`. Commit that change.

## 3. Bump the version before the first public build

`app.json` is currently `"version": "0.1.0"` (fine for development). For the first App
Store submission, set it to `1.0.0`:

- [ ] Edit `app.json` → `"version": "1.0.0"`.
- [ ] (`buildNumber` is auto-incremented by the `production` profile — you don't manage it.)
- [x] **For the widget:** `ios.appleTeamId` is set to `3M7JS7T537` in `app.json` (done
      2026-07-18) — the widget target can now be signed.

## 4. Build the iOS binary

```powershell
eas build --platform ios --profile production
```

- [ ] Run it. **🔑 YOU:** EAS will offer to generate/manage your iOS Distribution
      certificate and provisioning profile — say **yes** to let EAS handle signing (the
      easy path). This uses your Apple Developer account.
- [ ] Wait for the cloud build (~10–20 min). You'll get a link to the `.ipa`.

> This build step does **not** change your day-to-day Expo Go workflow. Expo Go still
> works from `npx expo start` as always; EAS builds are separate.

> ### Using it solo for a week (no laptop tethered)
> This is the key point: once the build is on your phone via **TestFlight**, it runs
> **standalone** — no `expo start`, no laptop, no Metro server. Expo Go (QR scanning) needs
> the laptop; a TestFlight build does not. A TestFlight build stays installable for **90
> days**, so a week of daily solo use is exactly what it's for, and the same build is your
> launch candidate. You only need the laptop for the ~20-minute build/submit below.

## 5. Send to TestFlight

```powershell
eas submit --platform ios --profile production
```

- [ ] Run it. **🔑 YOU:** provide App Store Connect auth when prompted — easiest is an
      **App Store Connect API key** (App Store Connect → Users and Access → Integrations →
      Keys). EAS walks you through it.
- [ ] In App Store Connect → TestFlight, install the build on your iPhone and do the
      full on-device pass (this is where you finally see the real app icon — Expo Go never
      shows it).
- [ ] Run the **on-device QA checklist** in `QA.md` against the TestFlight build.

## 6. Create the App Store listing — 🔑 YOU (content is below, ready to paste)

In App Store Connect → your app → App Store tab:

- [ ] **Name / Subtitle / Description / Keywords / Promo text** — see "Store copy" below.
- [ ] **Support URL** and **Marketing URL** — `https://keatentuttle.com` (or a dedicated
      page).
- [ ] **Privacy Policy URL** — host `PRIVACY.md` first (see step 7) and paste the URL.
- [ ] **Category:** Primary **Health & Fitness**, Secondary **Productivity**.
- [ ] **Age rating:** answer the questionnaire honestly — all "None" → rated **4+**.
- [ ] **Screenshots** — see step 8.

## 7. Host the privacy policy — ✅ built, needs a merge to go live

App Review requires a public Privacy Policy URL. **The page is already built** on the
portfolio site at `src/app/eighty/privacy/page.tsx` → **`https://keatentuttle.com/eighty/privacy`**.

- [ ] It deploys automatically **once this branch is merged to `main`** (Vercel builds
      `main`, not this feature branch). So: merge, confirm the URL loads, then use it.
- [ ] Paste `https://keatentuttle.com/eighty/privacy` into App Store Connect (step 6).

## 8. Screenshots — 🔑 YOU (capture on device/simulator)

Apple requires screenshots for at least the **6.7"** iPhone size; the more sizes you
provide, the better it looks.

- **6.7" iPhone** (iPhone 15/16 Pro Max): **1290 × 2796** — required.
- **6.5" iPhone** (older Pro Max): 1242 × 2688 — recommended.
- **iPad**: **not required** — the app is now iPhone-only (`supportsTablet: false`).

Capture the five screens that sell the app: **Today** (ring + checklist mid-progress),
**Dashboard** (calendar heat grid), **Trends**, the **preset picker / builder**, and a
**closed day** detail. Take them in an iOS Simulator (`⌘S` saves at the exact required
resolution) or on device.

### iPad support — decided: iPhone-only
`app.json` is set to `ios.supportsTablet: false`, so **no iPad screenshots are required**.
iPad owners can still install and run Eighty (at iPhone size) — it's just not "optimized
for iPad" in the listing. Flip back to `true` later if you ever want a native iPad layout.

## 9. App Privacy questionnaire — answers ready

In App Store Connect → App Privacy, answer: **"Data Not Collected."** Eighty stores
everything locally, has no account, no analytics, and makes no network calls. For every
data-type category, the answer is **not collected**. (`PRIVACY.md` backs this up.)

## 10. App Review notes

- No login required — a reviewer can tap "Start 80/80/80" and use the app immediately.
- All data is local; reminders are local notifications (no push server, no push
  entitlement).

---

## Store copy (paste-ready)

**App Name (≤30):** `Eighty`  *(fallback if taken: `Eighty — 80/80/80` or `Fourscore`)*

**Subtitle (≤30):** `Miss days, not habits`

**Promotional text (≤170):**
> Take on the 80/80/80 challenge — or 75 Hard, or your own. Check off your day, hit your
> threshold, and watch your margin for error. Everything stays on your phone.

**Keywords (≤100, comma-separated, no spaces):**
`80/80/80,75hard,habit,challenge,streak,tracker,discipline,routine,goals,daily,self improvement`

**Description:**
> **Eighty** is a challenge tracker for people who'd rather build a streak of *good
> enough* days than chase an impossible perfect one.
>
> The flagship 80/80/80 challenge is simple: complete at least 80% of your daily
> checklist, on at least 80% of 80 days. Eighty does the math so you always know exactly
> where you stand — and how many days you can still afford to miss.
>
> **What makes it different**
> • **Margin for error, front and center.** Not just a streak that shatters on day one —
>   a running count of how many days you can still miss and succeed.
> • **Miss days, not habits.** The optional "no-repeat-miss" rule keeps you from skipping
>   the same habit two days in a row.
> • **A day is a day you close out, not a clock.** Log your bedtime habits the next
>   morning and they still count for last night. Travel and time zones don't break it.
> • **Three intensities.** Flexible keeps you going after a bad day; strict and hardcore
>   restart the attempt — 75 Hard is built in.
> • **Build your own.** Any duration, thresholds, checklist, bonus items, and categories.
>   Share a challenge as a file; import one a friend sends you.
> • **See your patterns.** A calendar heat grid, a habit leaderboard, and satisfaction /
>   mood / weekday trends.
>
> **Private by design.** No account, no cloud, no tracking. Everything stays on your
> device. Back up or move your history with a single export whenever you want.
>
> Start today. Miss days, not habits.

**Support URL:** `https://keatentuttle.com`
**Marketing URL:** `https://keatentuttle.com`
**Privacy Policy URL:** `https://keatentuttle.com/eighty/privacy` _(live after this branch merges to main)_
**Copyright:** `© 2026 Keaten Tuttle`

---

## Repo extraction (deferred — per ROADMAP decision, 2026-07-17)

Eighty stays in the portfolio monorepo through submission; `eighty/` is excluded from the
website's root `tsconfig.json` so Vercel ignores it. If you later want a clean mobile-only
repo (PLAN.md §1 recommends it), extract `eighty/` into its own git repo **after** the
first release — it's not required to ship.
