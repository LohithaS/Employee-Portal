import { createContext, useContext, ReactNode, useState, useCallback } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, getQueryFn, queryClient } from "@/lib/queryClient";

type User = {
  id: number;
  username: string;
  name: string;
  role: string;
};

type AuthContextType = {
  user: User | null;
  login: (credentials: { username: string; password: string; role: string; rememberMe?: boolean }) => void;
  register: (data: { username: string; password: string; name: string; role: string; email?: string }) => void;
  logout: () => void;
  isLoading: boolean;
  loginError: string | null;
  clearLoginError: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function parseErrorMessage(error: unknown): string {
  const raw = error instanceof Error ? error.message : String(error);
  const jsonMatch = raw.match(/\d+:\s*(\{.*\})/);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[1]);
      return parsed.message || raw;
    } catch {}
  }
  return raw;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [, setLocation] = useLocation();
  const [loginError, setLoginError] = useState<string | null>(null);

  const clearLoginError = useCallback(() => setLoginError(null), []);

  const { data: user, isLoading } = useQuery<User | null>({
    queryKey: ["/api/auth/me"],
    queryFn: getQueryFn<User | null>({ on401: "returnNull" }),
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: { username: string; password: string; role: string; rememberMe?: boolean }) => {
      const res = await apiRequest("POST", "/api/auth/login", credentials);
      return await res.json();
    },
    onSuccess: () => {
      setLoginError(null);
      queryClient.clear();
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      setLocation("/");
    },
    onError: (error: unknown) => {
      setLoginError(parseErrorMessage(error));
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: { username: string; password: string; name: string; role: string; email?: string }) => {
      const res = await apiRequest("POST", "/api/auth/register", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      setLocation("/");
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/auth/logout");
    },
    onSuccess: () => {
      queryClient.clear();
      setLocation("/auth");
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        login: (credentials) => loginMutation.mutate(credentials),
        register: (data) => registerMutation.mutate(data),
        logout: () => logoutMutation.mutate(),
        isLoading,
        loginError,
        clearLoginError,
      }}
    >
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
