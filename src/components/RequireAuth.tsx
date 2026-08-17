import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/features/auth/AuthContext";

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="flex min-h-[70vh] items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-gold" /></div>;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname, intent: "purchase" }} />;
  }

  return <>{children}</>;
}
