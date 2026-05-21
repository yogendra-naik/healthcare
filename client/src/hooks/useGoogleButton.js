import { useEffect, useRef } from "react";
import { GOOGLE_CLIENT_ID } from "../config/api.js";

export function useGoogleButton(containerRef, { onSuccess, onError, options = {} }) {
  const callbackRef = useRef({ onSuccess, onError });
  callbackRef.current = { onSuccess, onError };

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || !containerRef.current) return undefined;

    const {
      theme = "outline",
      size = "large",
      shape = "pill",
      width = 280,
    } = options;

    const render = () => {
      if (!window.google?.accounts?.id || !containerRef.current) {
        return false;
      }

      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (response) => {
          if (response?.credential) {
            callbackRef.current.onSuccess(response.credential);
          } else {
            callbackRef.current.onError?.("No credential returned from Google");
          }
        },
      });

      containerRef.current.innerHTML = "";
      window.google.accounts.id.renderButton(containerRef.current, {
        type: "standard",
        theme,
        size,
        text: "continue_with",
        shape,
        width,
        logo_alignment: "left",
      });

      return true;
    };

    if (render()) return undefined;

    const interval = setInterval(() => {
      if (render()) clearInterval(interval);
    }, 150);

    return () => clearInterval(interval);
  }, [containerRef, options.theme, options.size, options.shape, options.width]);
}
