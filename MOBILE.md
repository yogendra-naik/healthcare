# MedRoute — Android & iOS

MedRoute works on phones in three ways:

## 1. Mobile browser (fastest)

1. Start the API: `cd server && npm start`
2. Start the web app: `cd client && npm run dev`
3. On your phone (same Wi‑Fi), open the URL Vite prints under **Network** (e.g. `http://192.168.1.5:5173`)

For registration/triage API calls from a phone, create `client/.env`:

```env
VITE_API_BASE=http://YOUR_COMPUTER_IP:8080/api/triage
```

Restart `npm run dev` after changing `.env`.

## 2. Install as an app (PWA)

- **Android (Chrome):** Open the site → menu → **Install app**, or use the banner **Install app**.
- **iPhone (Safari):** Share → **Add to Home Screen**

Production: deploy the `client/dist` build over HTTPS; PWAs require HTTPS (except localhost).

## 3. Native Android / iOS (Capacitor)

### Prerequisites

- **Android:** [Android Studio](https://developer.android.com/studio)
- **iOS (Mac only):** Xcode from the Mac App Store
- Node.js 18+ (Capacitor 6). Use Node 20+ if you upgrade to Capacitor 7 later.

### Build steps

```bash
cd client
npm install
npm run build
npx cap add android    # first time only
npx cap add ios        # first time only, Mac only
npm run cap:sync
```

Open in native IDEs:

```bash
npm run cap:android   # Android Studio
npm run cap:ios       # Xcode
```

### API URL on device

Native apps do not use the Vite proxy. Before `npm run build`, set in `client/.env`:

```env
VITE_API_BASE=http://YOUR_LAN_IP:8080/api/triage
```

Use your machine’s LAN IP while testing. For production, use your deployed API URL (HTTPS).

Restart the server after changing `server/.env` CORS if you add new origins.

### Useful commands

| Command | Purpose |
|--------|---------|
| `npm run dev` | Dev server + mobile-friendly layout |
| `npm run build` | Production web build |
| `npm run cap:sync` | Rebuild web assets and copy into native projects |
| `npm run cap:android` | Open Android project |
| `npm run cap:ios` | Open iOS project |
