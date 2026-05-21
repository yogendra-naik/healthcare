import { useEffect, useState } from "react";
import { X, Loader2 } from "lucide-react";
import { isVerifiedGoogleUser } from "../api/auth.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useSignInModal } from "../context/SignInModalContext.jsx";
import GoogleSignInButton from "./GoogleSignInButton.jsx";

export default function SignInModal() {
  const { isOpen, closeSignInModal } = useSignInModal();
  const { user, googleLogin } = useAuth();
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isVerifiedGoogleUser(user)) {
      closeSignInModal();
    }
  }, [user, closeSignInModal]);

  useEffect(() => {
    if (!isOpen) {
      setError(null);
      setIsSubmitting(false);
      return undefined;
    }

    const onKey = (e) => {
      if (e.key === "Escape") closeSignInModal();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen, closeSignInModal]);

  if (!isOpen) return null;

  const handleGoogle = async (credential) => {
    setError(null);
    setIsSubmitting(true);
    try {
      await googleLogin(credential);
      closeSignInModal();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="signin-modal-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-slate-950/50 backdrop-blur-[2px]"
        aria-label="Close sign in"
        onClick={closeSignInModal}
      />

      <div className="relative w-full max-w-[400px] rounded-xl bg-white px-8 py-8 shadow-2xl sm:px-9 sm:py-9">
        <button
          type="button"
          onClick={closeSignInModal}
          className="absolute right-3 top-3 rounded-md p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <h2
          id="signin-modal-title"
          className="text-center text-xl font-semibold text-slate-900 sm:text-2xl"
        >
          Sign in to MedRoute
        </h2>
        <p className="mt-2 text-center text-sm text-slate-500">
          Welcome back! Please sign in to continue
        </p>

        <div className="mt-8">
          {isSubmitting ? (
            <div className="flex h-11 w-full items-center justify-center gap-2 rounded-md border border-slate-200 bg-white text-sm text-slate-600">
              <Loader2 className="h-5 w-5 animate-spin" />
              Signing in…
            </div>
          ) : (
            <div className="flex w-full justify-center overflow-hidden rounded-md">
              <GoogleSignInButton
                variant="modal"
                onSuccess={handleGoogle}
                onError={setError}
                disabled={isSubmitting}
              />
            </div>
          )}
        </div>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-slate-200" />
          <span className="text-xs text-slate-400">or</span>
          <div className="h-px flex-1 bg-slate-200" />
        </div>

        <p className="text-center text-sm text-slate-500">
          Don&apos;t have an account?{" "}
          <button
            type="button"
            onClick={() => {
              setError(null);
              const el = document.querySelector("#signin-google-slot");
              el?.querySelector("div[role=button]")?.click();
            }}
            className="font-medium text-slate-900 underline decoration-slate-300 underline-offset-2 hover:decoration-slate-900"
          >
            Sign up
          </button>
        </p>

        {error && (
          <p
            role="alert"
            className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-center text-sm text-red-700 ring-1 ring-red-100"
          >
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
