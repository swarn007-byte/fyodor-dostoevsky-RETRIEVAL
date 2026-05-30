import { Navigate, Outlet } from "react-router-dom";
import { useSession } from "../lib/auth-client";

export function ProtectedRoute() {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return (
      <div className="void-root flex min-h-screen items-center justify-center bg-[#030304]">
        <div className="h-8 w-8 animate-spin rounded-full border border-stone-800 border-t-amber-800/50" />
      </div>
    );
  }

  if (!session?.user) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
