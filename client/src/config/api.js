/** API base URLs. On phones, set VITE_API_BASE to your server (e.g. http://192.168.0.103:8080/api/triage). */
export const TRIAGE_API =
  import.meta.env.VITE_API_BASE || "/api/triage";

export const PATIENTS_API =
  import.meta.env.VITE_API_BASE?.replace(/\/triage\/?$/, "") || "/api";

export const AUTH_API = `${PATIENTS_API}/auth`;

export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";
