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
          <div className="bg-[#fffdf6]">
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
