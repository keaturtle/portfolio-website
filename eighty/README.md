# Eighty

Mobile-first self-improvement challenge tracker. Flagship: the **80/80/80 Challenge**.

- `engine/` — pure TypeScript challenge engine (no UI, no I/O). 100% Jest coverage: `cd engine && npm test`
- `src/` — Expo app (SDK 57, expo-router, expo-sqlite). Data access goes through `src/data/repository.ts`.
- `mockups/` — throwaway Phase 1 design mockups. `PLAN.md` — the approved build plan.

## Run it on your iPhone (Expo Go)

1. Install **Expo Go** from the App Store.
2. On your computer (same Wi-Fi as the phone), from this `eighty/` folder:

```powershell
$env:PATH = "C:\Program Files\nodejs;" + $env:PATH
npm install
npx expo start
```

3. Scan the QR code in the terminal with the iPhone camera → opens in Expo Go.
4. Tap **Start day 1 today** and log your day. Data persists on the phone (SQLite).

If phone and computer can't see each other, use `npx expo start --tunnel`.
