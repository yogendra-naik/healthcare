import GoogleIcon from "./GoogleIcon.jsx";

/** Visual match for nav — opens sign-in modal (Google runs inside modal). */
export default function HeaderGooglePill({ onClick, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex h-10 items-center gap-2.5 rounded-full border border-slate-600 bg-slate-800/90 px-4 text-sm font-medium text-white shadow-sm transition hover:border-slate-500 hover:bg-slate-700 disabled:opacity-50 sm:px-5"
    >
      <GoogleIcon className="h-[18px] w-[18px] shrink-0" />
      Continue with Google
    </button>
  );
}
