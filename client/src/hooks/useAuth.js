import { useState, useCallback } from 'react';

// Holds auth state in React memory only (never localStorage / sessionStorage).
export function useAuth() {
  const [auth, setAuth] = useState({ token: null, tier: null, email: null });

  const login = useCallback(({ token, tier, email }) => {
    setAuth({ token, tier, email });
  }, []);

  const logout = useCallback(() => {
    setAuth({ token: null, tier: null, email: null });
  }, []);

  return { auth, login, logout, isAuthenticated: Boolean(auth.token) };
}
