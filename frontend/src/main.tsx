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
import { setTokens } from "./api/api";
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

// ==================================================================
// Initialize App on first render and refresh token every 14 minutes
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

    const interval = setInterval(
      () => {
        dispatch(tokenRefresh());
      },
      14 * 60 * 1000,
    );

    return () => clearInterval(interval);
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
