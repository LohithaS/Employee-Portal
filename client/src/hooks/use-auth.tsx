import { createContext, useContext, useState, ReactNode } from "react";
import { useLocation } from "wouter";

type User = {
  id: string;
  username: string;
  name: string;
  role: string;
} | null;

type AuthContextType = {
  user: User;
  login: (username: string) => void;
  logout: () => void;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();

  const login = (username: string) => {
    setIsLoading(true);
    // Mock login delay
    setTimeout(() => {
      setUser({
        id: "1",
        username,
        name: "Alex Morgan",
        role: "Employee",
      });
      setIsLoading(false);
      setLocation("/");
    }, 1000);
  };

  const logout = () => {
    setUser(null);
    setLocation("/auth");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
