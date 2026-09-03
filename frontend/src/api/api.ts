/* ===================================
API Configuration and Endpoints
=================================== */
import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { ApiResponse } from "../types";
import { ResumeContent } from "../types";

const API_URL = import.meta.env.VITE_API_URL || "/api";

export const getAccessToken = () => localStorage.getItem("accessToken");
export const getRefreshToken = () => localStorage.getItem("refreshToken");
export const setTokens = (accessToken: string, refreshToken: string) => {
  localStorage.setItem("accessToken", accessToken);
  localStorage.setItem("refreshToken", refreshToken);
};
export const clearTokens = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
};

const api = axios.create({
  baseURL: API_URL,
  withCredentials: false,
  headers: {
    "Content-Type": "application/json",
  },
});

// Queue for concurrent 401 handling - prevents multiple refresh calls
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token!);
  });
  failedQueue = [];
};

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Don't overwrite Authorization if caller already set it (e.g., refresh/logout with refreshToken)
    const hasAuthHeader = !!(
      config.headers &&
      (config.headers.Authorization || (config.headers as any).authorization)
    );
    if (hasAuthHeader) return config;

    // Refresh/logout must use refreshToken, not expired accessToken
    if (config.url?.includes("/auth/refresh") || config.url?.includes("/auth/logout")) {
      return config;
    }

    const token = getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiResponse<any>>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };
    if (!originalRequest) return Promise.reject(error);

    const isAuthRequest =
      originalRequest.url?.includes("/auth/login") ||
      originalRequest.url?.includes("/auth/register") ||
      originalRequest.url?.includes("/auth/refresh");

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isAuthRequest
    ) {
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        isRefreshing = false;
        clearTokens();
        localStorage.removeItem("user");
        const { store } = await import("../store");
        const { clearUser } = await import("../store/slices/authSlice");
        store.dispatch(clearUser());
        return Promise.reject(error);
      }
      try {
        const res = await api.post("/auth/refresh", {}, {
          headers: { Authorization: `Bearer ${refreshToken}` },
        });
        const newAccessToken = res.data?.data?.accessToken;
        const newRefreshToken = res.data?.data?.refreshToken;
        if (newAccessToken && newRefreshToken) {
          setTokens(newAccessToken, newRefreshToken);
          console.log("[api] refresh success via interceptor");
          processQueue(null, newAccessToken);
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        } else if (newAccessToken) {
          localStorage.setItem("accessToken", newAccessToken);
          console.log("[api] refresh success (access only) via interceptor");
          processQueue(null, newAccessToken);
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }
        isRefreshing = false;
        return api(originalRequest);
      } catch (refreshError: any) {
        console.error("[api] refresh failed:", refreshError.response?.data || refreshError.message);
        processQueue(refreshError, null);
        isRefreshing = false;
        // Clear the auth state; PrivateRoute redirects to login only on
        // protected pages, so public pages (e.g. home) stay visible.
        clearTokens();
        localStorage.removeItem("user");
        const { store } = await import("../store");
        const { clearUser } = await import("../store/slices/authSlice");
        store.dispatch(clearUser());
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  },
);

export const authApi = {
  googleLogin: () => (window.location.href = `${API_URL}/auth/google`),
  getMe: () => api.get("/auth/me"),
  logout: () => {
    const refreshToken = getRefreshToken();
    return api.post("/auth/logout", {}, {
      headers: refreshToken ? { Authorization: `Bearer ${refreshToken}` } : {},
    });
  },
};

export const userApi = {
  getProfile: () => api.get("/users/profile"),
  updateProfile: (data: any) => api.put("/users/profile", data),
  deleteAccount: () => api.delete("/users/account"),
  useCredit: () => api.post("/users/use-credit"),
  addFreeCredits: () => api.post("/users/add-free-credits"),
  getFreeCreditsStatus: () => api.get("/users/free-credits-status"),
};

export const resumeApi = {
  getAll: (page = 1, limit = 10, sourceType?: "uploaded" | "builder") =>
    api.get(
      `/resumes?page=${page}&limit=${limit}${sourceType ? `&sourceType=${sourceType}` : ""}`,
    ),
  getById: (id: string) => api.get(`/resumes/${id}`),
  upload: (formData: FormData) =>
    api.post("/resumes", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  createFromContent: (content: ResumeContent) =>
    api.post("/resumes/content", { content }),
  update: (id: string, data: any) => api.put(`/resumes/${id}`, data),
  duplicate: (id: string) => api.post(`/resumes/${id}/duplicate`),
  delete: (id: string) => api.delete(`/resumes/${id}`),
  deleteAll: () => api.delete("/resumes/delete-all"),
};

export const atsScoreApi = {
  parseResume: (formData: FormData) =>
    api.post("/ats-score/parse-resume", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  parseJD: (description: string) =>
    api.post("/ats-score/parse-jd", { description }),
  analyze: (data: {
    resumeName: string;
    aiResearch?: any;
    jobDescription?: string;
    structuredJD?: any;
    originalPdf?: string;
  }) => api.post("/ats-score/analyze", data),
  getHistory: (page = 1, limit = 3) =>
    api.get(`/ats-score/history?page=${page}&limit=${limit}`),
  getById: (id: string) => api.get(`/ats-score/history/${id}`),
  delete: (id: string) => api.delete(`/ats-score/history/${id}`),
  rename: (id: string, resumeName: string) =>
    api.put(`/ats-score/history/${id}/rename`, { resumeName }),
  deleteAll: () => api.delete("/ats-score/history"),
  fixResume: (data: { resumeContent: any; failed: any; suggestions?: string[] }) =>
    api.post("/ats-score/fix-resume", data),
};

// Unlimited ATS check — no AI credits, no LLM (dictionary-based).
export const unlimitedAtsApi = {
  analyze: (formData: FormData) =>
    api.post("/unlimited-ats-check/analyze", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  rescan: (historyId: string, formData: FormData) =>
    api.post(`/unlimited-ats-check/rescan/${historyId}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
};

// Support / problem reporting
export const supportApi = {
  create: (formData: FormData) =>
    api.post("/support", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  getMine: () => api.get("/support/mine"),
};

export const reviewApi = {
  submit: (data: { rating: number; message: string }) =>
    api.post("/feedback", data),
  getHomeReviews: () => api.get("/feedback/home"),
};

// Admin review management
export const adminReviewApi = {
  getAll: () => api.get("/admin-dashboard/reviews"),
  delete: (id: string) => api.delete(`/admin-dashboard/reviews/${id}`),
  deleteAll: () => api.delete("/admin-dashboard/reviews"),
  toggleHome: (id: string) => api.patch(`/admin-dashboard/reviews/${id}/toggle-home`),
};

export default api;
