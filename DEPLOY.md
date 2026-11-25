# Deploy MedRoute AI (Render + Vercel)

| Part | Platform | URL example |
|------|----------|-------------|
| **API** (Express + MongoDB) | [Render](https://render.com) | `https://medroute-api.onrender.com` |
| **Web app** (React + Vite) | [Vercel](https://vercel.com) | `https://medroute.vercel.app` |

Deploy the **server on Render first**, then the **client on Vercel** (the client needs the API URL).

---

## Prerequisites

1. Code pushed to **GitHub** (see README).
2. **MongoDB Atlas** cluster (free tier is fine).
   - Atlas → Network Access → allow `0.0.0.0/0` (or Render’s IPs) so Render can connect.
   - Copy the connection string → `MONGODB_URI`.
3. **Google Cloud** OAuth Web client (see [GOOGLE_SETUP.md](./GOOGLE_SETUP.md)).
4. **Gemini API key** for triage ([Google AI Studio](https://aistudio.google.com/apikey)).

---

## Part 1 — Backend on Render

### Create the web service

1. [dashboard.render.com](https://dashboard.render.com) → **New +** → **Web Service**.
2. Connect your GitHub repo.
3. Settings:

| Field | Value |
|-------|--------|
| **Name** | `medroute-api` (or any name) |
| **Root Directory** | `server` |
| **Runtime** | Node |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Health Check Path** | `/api/health` |

4. **Instance type:** Free (note: free services spin down after inactivity; first request may be slow).

### Environment variables (Render → Environment)

Add these in the Render dashboard (use your real values):

| Key | Example / notes |
|-----|------------------|
| `MONGODB_URI` | `mongodb+srv://USER:PASS@cluster.mongodb.net/medroute?retryWrites=true&w=majority` |
| `GEMINI_API_KEY` | Your Gemini key |
| `JWT_SECRET` | Long random string (e.g. 32+ chars) |
| `GOOGLE_CLIENT_ID` | Same as local — ends with `.apps.googleusercontent.com` |
| `CORS_ORIGINS` | Your Vercel URL, e.g. `https://medroute.vercel.app` (add after Vercel deploy) |
| `ALLOW_VERCEL_PREVIEWS` | `true` (allows `*.vercel.app` preview URLs) |
| `NODE_VERSION` | `20` (optional) |

`PORT` is set automatically by Render — do not override it.

### Deploy and test

1. Click **Create Web Service** and wait for **Live**.
2. Open: `https://YOUR-SERVICE.onrender.com/api/health`  
   Expected: `{"status":"ok"}`

Copy your API base URL, e.g.:

`https://medroute-api.onrender.com`

---

## Part 2 — Frontend on Vercel

### Import the project

1. [vercel.com/new](https://vercel.com/new) → import the same GitHub repo.
2. Settings:

| Field | Value |
|-------|--------|
| **Framework Preset** | Vite |
| **Root Directory** | `client` |
| **Build Command** | `npm run build` (default) |
| **Output Directory** | `dist` (default) |

### Environment variables (Vercel → Settings → Environment Variables)

| Key | Value |
|-----|--------|
| `VITE_API_BASE` | `https://YOUR-SERVICE.onrender.com/api/triage` |
| `VITE_GOOGLE_CLIENT_ID` | Same `GOOGLE_CLIENT_ID` as Render |

Apply to **Production** (and Preview if you use preview deployments).

### Deploy

1. Click **Deploy**.
2. Note your URL, e.g. `https://medroute.vercel.app`.

### Update Render CORS

Back on Render, set or update:

```env
CORS_ORIGINS=https://medroute.vercel.app
ALLOW_VERCEL_PREVIEWS=true
```

Redeploy or wait for Render to pick up env changes (manual redeploy if needed).

---

## Part 3 — Google OAuth (required for login)

In [Google Cloud Console](https://console.cloud.google.com/) → **Credentials** → your **OAuth 2.0 Web client**:

**Authorized JavaScript origins** — add:

- `https://your-app.vercel.app`
- `http://localhost:5174` (local dev)

**Authorized redirect URIs** — GIS button usually does not need redirect URIs; if you add any, use Vercel’s origin only.

Save and wait a few minutes before testing production login.

---

## Quick checklist

- [ ] Render `/api/health` returns OK  
- [ ] Vercel site loads  
- [ ] `VITE_API_BASE` points to Render `/api/triage`  
- [ ] `GOOGLE_CLIENT_ID` matches on Render, Vercel, and Google Console  
- [ ] `CORS_ORIGINS` includes your Vercel URL  
- [ ] MongoDB Atlas allows connections from the internet  
- [ ] Google OAuth origins include your Vercel URL  

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Login / API “Cannot reach server” | Check `VITE_API_BASE` on Vercel; cold-start: wait 30s on free Render |
| CORS error in browser console | Add Vercel URL to `CORS_ORIGINS` on Render; set `ALLOW_VERCEL_PREVIEWS=true` |
| Google sign-in fails | Add Vercel URL to **Authorized JavaScript origins** |
| 500 on login | Check Render logs; verify `MONGODB_URI` and `GOOGLE_CLIENT_ID` |
| Render build fails | Root Directory must be `server`, not repo root |

---

## Local vs production

| | Local | Production |
|--|--------|------------|
| Client | `npm run dev` in `client/` | Vercel |
| API | `npm start` in `server/` | Render |
| `VITE_API_BASE` | unset (Vite proxy) | `https://xxx.onrender.com/api/triage` |

Never commit `.env` files. Set secrets only in Render and Vercel dashboards.
