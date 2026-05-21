import { Link } from "react-router-dom";
import { HeartPulse, Shield } from "lucide-react";

export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="mobile-page flex min-h-[100dvh] flex-col bg-gradient-to-br from-medical-950 via-medical-900 to-slate-900">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-10 safe-top safe-bottom">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-medical-600 text-white shadow-medical">
            <HeartPulse className="h-7 w-7" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-medical-300">
              University Medical Center
            </p>
            <h1 className="text-xl font-extrabold text-white">MedRoute AI</h1>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white p-6 shadow-2xl sm:p-8">
          <h2 className="text-2xl font-extrabold text-medical-950">{title}</h2>
          {subtitle && (
            <p className="mt-1 text-sm text-slate-600">{subtitle}</p>
          )}

          <div className="mb-6 mt-4 flex items-start gap-2 rounded-xl bg-medical-50 px-3 py-2.5 text-xs text-medical-900 ring-1 ring-medical-100">
            <Shield className="mt-0.5 h-4 w-4 shrink-0 text-medical-600" />
            <span>Secure sign-in for triage and patient routing</span>
          </div>

          {children}
        </div>

        {footer && <div className="mt-6 text-center text-sm text-medical-200">{footer}</div>}
      </div>
    </div>
  );
}

export function AuthLink({ to, children }) {
  return (
    <Link
      to={to}
      className="font-semibold text-medical-600 underline decoration-2 underline-offset-2 hover:text-medical-800"
    >
      {children}
    </Link>
  );
}
