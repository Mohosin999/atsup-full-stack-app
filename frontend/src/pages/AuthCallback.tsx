import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAppDispatch } from "../hooks/redux";
import { fetchUser } from "../store/slices/authSlice";
import { setTokens } from "../api/api";
import LoadingSpinner from "../components/ui/LoadingSpinner";

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  useEffect(() => {
    const accessToken = searchParams.get("accessToken");
    const refreshToken = searchParams.get("refreshToken");
    const error = searchParams.get("error");

    if (error) {
      navigate(`/login?error=${error}`, { replace: true });
      return;
    }

    if (accessToken && refreshToken) {
      setTokens(accessToken, refreshToken);
      dispatch(fetchUser())
        .unwrap()
        .then((user) => {
          if (user?.role === "admin") navigate("/admin-dashboard", { replace: true });
          else navigate("/", { replace: true });
        })
        .catch(() => {
          navigate("/login?error=callback_failed", { replace: true });
        });
    } else {
      navigate("/login?error=missing_token", { replace: true });
    }
  }, [searchParams, navigate, dispatch]);

  return <LoadingSpinner fullScreen />;
}
