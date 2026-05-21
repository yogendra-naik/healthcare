import { createContext, useCallback, useContext, useMemo, useState } from "react";

const SignInModalContext = createContext(null);

export function SignInModalProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);

  const openSignInModal = useCallback(() => setIsOpen(true), []);
  const closeSignInModal = useCallback(() => setIsOpen(false), []);

  const value = useMemo(
    () => ({ isOpen, openSignInModal, closeSignInModal }),
    [isOpen, openSignInModal, closeSignInModal]
  );

  return (
    <SignInModalContext.Provider value={value}>
      {children}
    </SignInModalContext.Provider>
  );
}

export function useSignInModal() {
  const ctx = useContext(SignInModalContext);
  if (!ctx) {
    throw new Error("useSignInModal must be used within SignInModalProvider");
  }
  return ctx;
}
