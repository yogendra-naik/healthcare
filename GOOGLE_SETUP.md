# Fix Google Sign-In (step by step)

Google login **will not work** until you add a Google OAuth Client ID.  
Right now your `.env` files have an **empty** `GOOGLE_CLIENT_ID`.

---

## Step 1 — Create Google OAuth Client

1. Go to: https://console.cloud.google.com/
2. Create or select a project.
3. Open **APIs & Services** → **Credentials**.
4. Click **+ Create Credentials** → **OAuth client ID**.
5. If asked, configure the **OAuth consent screen** (External is fine for testing).
6. Application type: **Web application**.
7. Name: `MedRoute Local` (any name).

### Authorized JavaScript origins (add ALL you use)

```
http://localhost:5173
http://localhost:5174
http://localhost:5175
http://127.0.0.1:5174
http://127.0.0.1:5175
```

If you test on your phone, also add:

```
http://YOUR_MAC_IP:5174
```

(example: `http://10.110.6.253:5174`)

8. Click **Create**.
9. Copy the **Client ID** (ends with `.apps.googleusercontent.com`).

---

## Step 2 — Add to `server/.env`

Open `/Users/gaju/Desktop/healthCare/server/.env` and set:

```env
GOOGLE_CLIENT_ID=PASTE_YOUR_CLIENT_ID_HERE.apps.googleusercontent.com
```

(Replace the empty line after `GOOGLE_CLIENT_ID=`)

---

## Step 3 — Add to `client/.env`

Open `/Users/gaju/Desktop/healthCare/client/.env` and add:

```env
VITE_API_BASE=http://192.168.0.103:8080/api/triage
VITE_GOOGLE_CLIENT_ID=PASTE_THE_SAME_CLIENT_ID_HERE.apps.googleusercontent.com
```

**Important:** `VITE_GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_ID` must be **the same value**.

---

## Step 4 — Restart both servers

**Terminal 1 — API**

```bash
cd /Users/gaju/Desktop/healthCare/server
npm start
```

**Terminal 2 — Website**

```bash
cd /Users/gaju/Desktop/healthCare/client
npm run dev
```

Open the URL shown (e.g. `http://localhost:5175`).

---

## Step 5 — Test

1. Click **Sign in** → modal opens.
2. Click **Continue with Google** → Google popup opens.
3. Pick a **real Google account** (verified email).
4. Modal closes → you see your name in the header → triage works.

---

## Common errors

| Problem | Fix |
|--------|-----|
| Button says "not configured" | Add `VITE_GOOGLE_CLIENT_ID` to `client/.env` and restart `npm run dev` |
| `redirect_uri_mismatch` / `origin_mismatch` | Add your exact browser URL to Authorized JavaScript origins in Google Console |
| `Google sign-in is not configured on the server` | Set `GOOGLE_CLIENT_ID` in `server/.env` and restart `npm start` |
| `email is not verified` | Use a Google account with verified email |
| Nothing happens on click | Hard refresh browser (Cmd+Shift+R) after restarting dev server |

---

## Security (already enabled)

- Server verifies the Google token with Google’s API.
- Only **verified** Google emails are accepted.
- Fake/manual tokens are rejected.
