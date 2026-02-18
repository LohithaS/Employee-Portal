import { useAuth } from "@/hooks/use-auth";
import { Redirect, Route } from "wouter";
import { Spinner } from "@/components/ui/spinner";

export function ProtectedRoute({ component: Component, path }: { component: any; path: string }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Route path={path}>
        {() => (
          <div className="flex items-center justify-center min-h-screen">
            <Spinner className="h-8 w-8" />
          </div>
        )}
      </Route>
    );
  }

  return (
    <Route path={path}>
      {(params) => (user ? <Component {...params} /> : <Redirect to="/auth" />)}
    </Route>
  );
}
