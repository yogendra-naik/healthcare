import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  fetchCurrentUser,
  loginAccount,
  loginWithGoogle,
  logoutLocal,
  registerAccount,
} from "../api/auth.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const current = await fetchCurrentUser();
    setUser(current);
    return current;
  }, []);

  useEffect(() => {
    refreshUser().finally(() => setLoading(false));
  }, [refreshUser]);

  const login = useCallback(async (credentials) => {
    const loggedIn = await loginAccount(credentials);
    setUser(loggedIn);
    return loggedIn;
  }, []);

  const register = useCallback(async (payload) => {
    const registered = await registerAccount(payload);
    setUser(registered);
    return registered;
  }, []);

  const googleLogin = useCallback(async (credential) => {
    const loggedIn = await loginWithGoogle(credential);
    setUser(loggedIn);
    return loggedIn;
  }, []);

  const logout = useCallback(() => {
    logoutLocal();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      register,
      googleLogin,
      logout,
      refreshUser,
      isAuthenticated: Boolean(user),
    }),
    [user, loading, login, register, googleLogin, logout, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
