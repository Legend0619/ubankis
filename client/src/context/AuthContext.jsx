import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api, getToken, setToken } from "../api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!getToken()) {
      setReady(true);
      return;
    }
    api("/auth/me")
      .then(({ user }) => setUser(user))
      .catch(() => setToken(null))
      .finally(() => setReady(true));
  }, []);

  const value = useMemo(() => ({
    user,
    ready,
    login: (email, password) =>
      api("/auth/login", { method: "POST", body: { email, password } }).then(({ token, user }) => {
        setToken(token);
        setUser(user);
        return user;
      }),
    logout: () => {
      setToken(null);
      setUser(null);
    },
  }), [user, ready]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
