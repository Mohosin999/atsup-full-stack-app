/* ===================================
API Configuration and Endpoints
=================================== */
import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { ApiResponse } from "../types";
import { ResumeContent } from "../types";

const API_URL = import.meta.env.VITE_API_URL || "/api";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => config,
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
      originalRequest._retry = true;
      try {
        await api.post("/auth/refresh");
        return api(originalRequest);
      } catch (refreshError) {
        // Clear local storage on refresh failure
        localStorage.removeItem("user");
        // Redirect to login page (not /auth/login which doesn't exist)
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  },
);

export const authApi = {
  googleLogin: () => (window.location.href = `${API_URL}/auth/google`),
  getMe: () => api.get("/auth/me"),
  logout: () => api.post("/auth/logout"),
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
  }) => api.post("/ats-score/analyze", data),
  getHistory: (page = 1, limit = 3) =>
    api.get(`/ats-score/history?page=${page}&limit=${limit}`),
  getById: (id: string) => api.get(`/ats-score/history/${id}`),
  delete: (id: string) => api.delete(`/ats-score/history/${id}`),
  deleteAll: () => api.delete("/ats-score/history"),
};

// Unlimited ATS check — no AI credits, no LLM (dictionary-based).
export const unlimitedAtsApi = {
  analyze: (formData: FormData) =>
    api.post("/unlimited-ats-check/analyze", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
};

export default api;
