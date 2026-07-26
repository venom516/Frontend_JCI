import React, { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { authAPI } from "../api/axios";
import { Skeleton } from "../components/ui/skeleton";

const MemberLink = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setUser, setToken } = useAuth();

  useEffect(() => {
    const token = searchParams.get("token");
    const page = searchParams.get("page") || "dashboard";

    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    const processLink = async () => {
      try {
        const response = await authAPI.memberTokenLogin({ token });
        const { token: newToken, membre } = response.data.data;
        localStorage.setItem("token", newToken);
        setToken(newToken);
        setUser(membre);

        const routes = {
          dashboard: "/dashboard/membre",
          tasks: "/tasks-events",
          events: "/tasks-events",
          calendar: "/tasks-events",
          profile: "/profile",
          entretien: "/dashboard/membre",
        };
        const target = routes[page] || "/dashboard/membre";
        navigate(target, { replace: true });
      } catch {
        navigate("/login?expired=1", { replace: true });
      }
    };

    processLink();
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-surface-50">
      <div className="text-center space-y-4">
        <Skeleton className="h-16 w-16 rounded-full mx-auto" />
        <Skeleton className="h-4 w-48 mx-auto" />
        <Skeleton className="h-4 w-32 mx-auto" />
        <p className="text-surface-500 text-sm mt-4">Connexion en cours...</p>
      </div>
    </div>
  );
};

export default MemberLink;
