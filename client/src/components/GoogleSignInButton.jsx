import { useRef } from "react";
import { GOOGLE_CLIENT_ID } from "../config/api.js";
import { useGoogleButton } from "../hooks/useGoogleButton.js";
const VARIANT_OPTIONS = {
  nav: { theme: "filled_black", size: "medium", shape: "pill", width: 220 },
  modal: { theme: "outline", size: "large", shape: "rectangular", width: 320 },
  form: { theme: "outline", size: "large", shape: "pill", width: 280 },
};

export default function GoogleSignInButton({
  onSuccess,
  onError,
  disabled,
  variant = "form",
}) {
  const containerRef = useRef(null);
  const opts = VARIANT_OPTIONS[variant] || VARIANT_OPTIONS.form;
  const isModal = variant === "modal";

  useGoogleButton(containerRef, {
    onSuccess,
    onError,
    options: opts,
  });

  if (!GOOGLE_CLIENT_ID) {
    return null;
  }

  return (
    <div
      id={isModal ? "signin-google-slot" : undefined}
      ref={containerRef}
      className={`inline-flex min-h-[44px] items-center justify-center ${
        isModal ? "w-full min-w-[280px]" : ""
      } ${disabled ? "pointer-events-none opacity-50" : ""}`}
      aria-label="Continue with Google"
    />
  );
}
