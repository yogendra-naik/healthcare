# Authentication setup

## Routes

| Path | Page |
|------|------|
| `/` | Landing + triage (Google sign-in required for triage) |
| `/login` | Google sign-in only |
| `/register` | Redirects to `/login` |

## Security

- Google ID tokens are verified on the server with Google's official library.
- Only accounts with **`email_verified: true`** from Google are accepted.
- Email/password registration and login are **disabled**.
- Triage API requires a valid JWT from a verified Google-linked user.

## Server `.env`

Add to `server/.env`:

```env
JWT_SECRET=your_long_random_secret_here
GOOGLE_CLIENT_ID=xxxx.apps.googleusercontent.com
```

Restart: `cd server && npm start`

Install new packages once: `cd server && npm install`

## Google OAuth (required for Google button)

1. Open [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project → **APIs & Services** → **Credentials**
3. **Create credentials** → **OAuth client ID** → **Web application**
4. **Authorized JavaScript origins:**
   - `http://localhost:5174`
   - `http://192.168.0.103:5174` (your LAN IP for phone testing)
5. Copy the **Client ID** into:
   - `server/.env` → `GOOGLE_CLIENT_ID=...`
   - `client/.env` → `VITE_GOOGLE_CLIENT_ID=...` (same value)
6. Restart server and client dev servers

## Client `.env`

```env
VITE_GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
VITE_API_BASE=http://192.168.0.103:8080/api/triage
```

## Email registration

- Password minimum 8 characters
- Optional age and contact on register page
