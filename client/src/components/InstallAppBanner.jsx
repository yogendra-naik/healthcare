import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

export default function InstallAppBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [dismissed, setDismissed] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const ua = window.navigator.userAgent;
    setIsIos(/iPad|iPhone|iPod/.test(ua) && !window.MSStream);
    setIsStandalone(
      window.matchMedia("(display-mode: standalone)").matches ||
        window.navigator.standalone === true
    );

    const onBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstall);
  }, []);

  if (dismissed || isStandalone) return null;

  const showAndroid = Boolean(deferredPrompt);
  const showIos = isIos && !deferredPrompt;

  if (!showAndroid && !showIos) return null;

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setDismissed(true);
  };

  return (
    <div
      role="region"
      aria-label="Install app"
      className="border-b border-medical-200/80 bg-medical-50 px-4 py-3 safe-top sm:px-6"
    >
      <div className="mx-auto flex max-w-7xl items-start gap-3">
        <Download className="mt-0.5 h-5 w-5 shrink-0 text-medical-700" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-medical-950">Install MedRoute on your phone</p>
          {showAndroid ? (
            <p className="mt-0.5 text-xs text-slate-600">
              Add to your home screen for quick access like a native app.
            </p>
          ) : (
            <p className="mt-0.5 text-xs text-slate-600">
              Tap Share, then &quot;Add to Home Screen&quot; in Safari.
            </p>
          )}
          {showAndroid && (
            <button
              type="button"
              onClick={handleInstall}
              className="mt-2 rounded-lg bg-medical-700 px-3 py-1.5 text-xs font-bold text-white"
            >
              Install app
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="shrink-0 rounded-lg p-1 text-slate-500 hover:bg-white"
          aria-label="Dismiss install hint"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
