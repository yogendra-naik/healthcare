# MedRoute AI

AI-assisted hospital triage kiosk — symptom intake, urgency assessment, and department routing with Google sign-in.

## Stack

- **Client:** React + Vite (`client/`)
- **Server:** Express + MongoDB (`server/`)
- **Auth:** Google OAuth (verified accounts only), JWT sessions

## Quick start

### 1. Server

```bash
cd server
cp .env.example .env
# Edit .env: MONGODB_URI, GEMINI_API_KEY, GOOGLE_CLIENT_ID, JWT_SECRET
npm install
npm start
```

API runs at `http://localhost:8080`.

### 2. Client

```bash
cd client
cp .env.example .env
# Edit .env: VITE_GOOGLE_CLIENT_ID (same as server GOOGLE_CLIENT_ID)
npm install
npm run dev
```

Open the URL Vite prints (e.g. `http://localhost:5174`).

### 3. Google OAuth

See [GOOGLE_SETUP.md](./GOOGLE_SETUP.md) and [AUTH.md](./AUTH.md).

## Docs

- [DEPLOY.md](./DEPLOY.md) — **host on Render (API) + Vercel (web)**
- [AUTH.md](./AUTH.md) — authentication flow
- [GOOGLE_SETUP.md](./GOOGLE_SETUP.md) — Google Cloud Console setup
- [MOBILE.md](./MOBILE.md) — phone / PWA / Capacitor

## Important

Never commit `.env` files. Use `.env.example` as templates only.
