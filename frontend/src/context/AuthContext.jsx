import { createContext, useContext, useState, useEffect, useMemo } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [profile, setProfile] = useState(null);

  // Fetch the real user (id, email) from the backend whenever the token changes
  useEffect(() => {
    if (!token) {
      setProfile(null);
      return;
    }

    let cancelled = false;

    fetch("http://localhost:8000/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (res.status === 401) {
          // token expired or invalid
          localStorage.removeItem("token");
          setToken(null);
          return null;
        }
        return res.ok ? res.json() : null;
      })
      .then((data) => {
        if (!cancelled) setProfile(data);
      })
      .catch(() => {
        if (!cancelled) setProfile(null);
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  // Build the display name from the email (part before the @)
  const user = useMemo(() => {
    if (!profile || !profile.email) return null;
    const base = profile.email.split("@")[0];
    const name = base.charAt(0).toUpperCase() + base.slice(1);
    return {
      id: profile.id,
      email: profile.email,
      name,
    };
  }, [profile]);

  function login(newToken) {
    localStorage.setItem("token", newToken);
    setToken(newToken);
  }

  function logout() {
    localStorage.removeItem("token");
    setToken(null);
    setProfile(null);
  }

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}