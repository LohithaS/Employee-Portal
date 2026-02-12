import { useAuth } from "@/hooks/use-auth";
import { Redirect, Route } from "wouter";

export function ProtectedRoute({ component: Component, path }: { component: any; path: string }) {
  const { user } = useAuth();

  return (
    <Route path={path}>
      {(params) => (user ? <Component {...params} /> : <Redirect to="/auth" />)}
    </Route>
  );
}
