import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import App from "./App";
import "./index.css";
import { store, AppDispatch } from "./store";
import { fetchUser, tokenRefresh } from "./store/slices/authSlice";
import { getAccessToken, setTokens } from "./api/api";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// ==================================================================
// React Query Client Configuration
// ==================================================================
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000, // 30s
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Helper: check if access token is expiring soon (within 70s for 2m testing)
function isTokenExpiringSoon(): boolean {
  try {
    const token = getAccessToken();
    if (!token) return false;
    const payload = JSON.parse(atob(token.split(".")[1]));
    if (!payload.exp) return false;
    const expiresAt = payload.exp * 1000;
    return expiresAt - Date.now() < 70 * 1000;
  } catch {
    return false;
  }
}

// ==================================================================
// Initialize App on first render and refresh token every 1 minute
// (2m access token -> 1m refresh = 60s buffer for testing)
// ==================================================================
function InitializeApp() {
  const dispatch: AppDispatch = store.dispatch as AppDispatch;

  useEffect(() => {
    // Plan A: handle OAuth tokens directly on / (skip /auth/callback page)
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get("accessToken");
    const refreshToken = params.get("refreshToken");
    const error = params.get("error");

    if (accessToken && refreshToken) {
      setTokens(accessToken, refreshToken);
      params.delete("accessToken");
      params.delete("refreshToken");
      if (error) params.delete("error");
      const newSearch = params.toString();
      const newUrl =
        window.location.pathname + (newSearch ? `?${newSearch}` : "") + window.location.hash;
      window.history.replaceState({}, "", newUrl);
      sessionStorage.setItem("oauth_pending", "1");
    } else if (error && window.location.pathname === "/") {
      // OAuth error landed on / (e.g. missing tokens) -> forward to /login via App effect
      sessionStorage.setItem("oauth_error", error);
      params.delete("error");
      params.delete("accessToken");
      params.delete("refreshToken");
      const newSearch = params.toString();
      const newUrl =
        window.location.pathname + (newSearch ? `?${newSearch}` : "") + window.location.hash;
      window.history.replaceState({}, "", newUrl);
    }
    // If error is on /login (backend failureRedirect), leave it in URL for Login page to handle

    dispatch(fetchUser());

    // Refresh token every 50s (70s buffer before 2m expiry) with throttling
    const interval = setInterval(
      () => {
        const lastRefresh = Number(localStorage.getItem("lastRefreshTime") || 0);
        if (Date.now() - lastRefresh < 30 * 1000) {
          console.log("[refresh] interval throttled, skipping");
          return;
        }
        localStorage.setItem("lastRefreshTime", String(Date.now()));
        console.log("[refresh] interval triggered");
        dispatch(tokenRefresh())
          .unwrap()
          .then(() => console.log("[refresh] interval success"))
          .catch((e) => console.error("[refresh] interval failed:", e));
      },
      50 * 1000,
    );

    // Proactive refresh when tab becomes visible (handles browser throttling)
    // Only refresh if token is expiring within 70s and throttled (30s gap)
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && isTokenExpiringSoon()) {
        const lastRefresh = Number(localStorage.getItem("lastRefreshTime") || 0);
        if (Date.now() - lastRefresh < 30 * 1000) {
          console.log("[refresh] visibility throttled, skipping");
          return;
        }
        localStorage.setItem("lastRefreshTime", String(Date.now()));
        console.log("[refresh] visibility triggered");
        dispatch(tokenRefresh())
          .unwrap()
          .then(() => console.log("[refresh] visibility success"))
          .catch((e) => console.error("[refresh] visibility failed:", e));
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [dispatch]);

  return null;
}

// ==================================================================
// Render App
// ==================================================================
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <InitializeApp />
          <div className="bg-white dark:bg-primary">
          {/* <div className="bg-[#fffdf6] dark:bg-[#222831]"> */}
            <Navbar />
              <App />
            <Footer />
          </div>
          <ToastContainer
            position="bottom-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="dark"
          />
        </BrowserRouter>
      </QueryClientProvider>
    </Provider>
  </React.StrictMode>,
);
