import { useAuth } from "../context/AuthContext.jsx";
import { useSignInModal } from "../context/SignInModalContext.jsx";
import { isVerifiedGoogleUser } from "../api/auth.js";
import HeaderGooglePill from "./HeaderGooglePill.jsx";

export default function HeaderAuthNav() {
  const { user, logout } = useAuth();
  const { openSignInModal } = useSignInModal();

  if (user && isVerifiedGoogleUser(user)) {
    return (
      <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 pl-1 pr-3 py-1">
          {user.picture && (
            <img
              src={user.picture}
              alt=""
              className="h-8 w-8 rounded-full ring-1 ring-white/20"
            />
          )}
          <span className="max-w-[140px] truncate text-sm font-medium text-slate-200">
            {user.name}
          </span>
        </div>
        <button
          type="button"
          onClick={logout}
          className="rounded-full px-3 py-2 text-sm font-medium text-slate-300 transition hover:text-white sm:px-4"
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <nav
      className="flex flex-wrap items-center justify-end gap-3 sm:gap-4"
      aria-label="Account access"
    >
      <button
        type="button"
        onClick={openSignInModal}
        className="text-sm font-medium text-slate-300 transition hover:text-white"
      >
        Sign in
      </button>

      <HeaderGooglePill onClick={openSignInModal} />

      <button
        type="button"
        onClick={openSignInModal}
        className="inline-flex h-10 items-center rounded-full bg-white px-4 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-100 sm:px-5"
      >
        Get Started
      </button>
    </nav>
  );
}
