import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export type Role = "admin" | "operator";

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  role: Role;
}

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  hasRole: (role: Role) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_KEY = "wifi-noc-auth";

const DEMO_USERS: Record<string, { password: string; user: AuthUser }> = {
  admin: {
    password: "admin",
    user: { id: "u1", username: "admin", email: "admin@noc.local", role: "admin" },
  },
  operator: {
    password: "operator",
    user: { id: "u2", username: "operator", email: "ops@noc.local", role: "operator" },
  },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") {
      setIsLoading(false);
      return;
    }
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        setUser(JSON.parse(raw));
      } catch {
        /* ignore */
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    const entry = DEMO_USERS[username.toLowerCase()];
    if (!entry || entry.password !== password) {
      throw new Error("Invalid credentials");
    }
    setUser(entry.user);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entry.user));
  };

  const logout = () => {
    setUser(null);
    window.localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        hasRole: (role) => user?.role === role,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
