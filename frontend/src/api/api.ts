/* ===================================
API Configuration and Endpoints
=================================== */
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { ApiResponse } from '../types';
import { ResumeContent } from '../types';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => config,
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiResponse<any>>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    if (!originalRequest) return Promise.reject(error);

    const isAuthRequest = originalRequest.url?.includes('/auth/login') ||
                          originalRequest.url?.includes('/auth/register') ||
                          originalRequest.url?.includes('/auth/refresh') ||
                          originalRequest.url?.includes('/auth/me');

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthRequest) {
      originalRequest._retry = true;
      try {
        await api.post('/auth/refresh');
        return api(originalRequest);
      } catch (refreshError) {
        // Clear local storage on refresh failure
        localStorage.removeItem('user');
        // Redirect to login page (not /auth/login which doesn't exist)
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  googleLogin: () => window.location.href = `${API_URL}/auth/google`,
  getMe: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
};

export const userApi = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data: any) => api.put('/users/profile', data),
  deleteAccount: () => api.delete('/users/account'),
  useCredit: () => api.post('/users/use-credit'),
  addFreeCredits: () => api.post('/users/add-free-credits'),
  getFreeCreditsStatus: () => api.get('/users/free-credits-status'),
};

export const resumeApi = {
  getAll: (page = 1, limit = 10, sourceType?: 'uploaded' | 'builder') => 
    api.get(`/resumes?page=${page}&limit=${limit}${sourceType ? `&sourceType=${sourceType}` : ''}`),
  getById: (id: string) => api.get(`/resumes/${id}`),
  upload: (formData: FormData) => api.post('/resumes', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  createFromContent: (content: ResumeContent) => api.post('/resumes/content', { content }),
  update: (id: string, data: any) => api.put(`/resumes/${id}`, data),
  delete: (id: string) => api.delete(`/resumes/${id}`),
  deleteAll: () => api.delete('/resumes/delete-all'),
};

export const analysisApi = {
  getAll: (page = 1, limit = 10) => api.get(`/analysis?page=${page}&limit=${limit}`),
  getById: (id: string) => api.get(`/analysis/${id}`),
  create: (data: { resumeId: string; jobDescription: string; jobTitle?: string; company?: string }) =>
    api.post('/analysis', data),
  delete: (id: string) => api.delete(`/analysis/${id}`),
  deleteAll: () => api.delete('/analysis/delete-all'),
};

export const jobApi = {
  getAll: (page = 1, limit = 10) => api.get(`/jobs?page=${page}&limit=${limit}`),
  getById: (id: string) => api.get(`/jobs/${id}`),
  create: (data: { title: string; company?: string; description: string }) => api.post('/jobs', data),
  update: (id: string, data: any) => api.put(`/jobs/${id}`, data),
  delete: (id: string) => api.delete(`/jobs/${id}`),
};

export const atsScoreApi = {
  analyze: (data: { resumeName: string; resumeContent: any; jobDescription?: string }) =>
    api.post('/ats-score-history/analyze', data),
  getAll: (page = 1, limit = 3) => api.get(`/ats-score-history?page=${page}&limit=${limit}`),
  getById: (id: string) => api.get(`/ats-score-history/${id}`),
  delete: (id: string) => api.delete(`/ats-score-history/${id}`),
  deleteAll: () => api.delete('/ats-score-history'),
};

export const resumeBuildHistoryApi = {
  save: (data: { resumeContent: any; resumeName?: string }) => api.post('/resume-build-history', data),
  getAll: (page = 1, limit = 3) => api.get(`/resume-build-history?page=${page}&limit=${limit}`),
  getById: (id: string) => api.get(`/resume-build-history/${id}`),
  update: (id: string, data: { resumeContent: any }) => api.put(`/resume-build-history/${id}`, data),
  delete: (id: string) => api.delete(`/resume-build-history/${id}`),
  deleteAll: () => api.delete('/resume-build-history'),
};

export const resumeParserApi = {
  parse: (formData: FormData) => api.post('/resume-parser/parse', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
};

export const resumeBuilderApi = {
  createTemplate: (data: { name?: string }) => api.post('/resume-builder/templates', data),
  getTemplates: (page = 1, limit = 10) => api.get(`/resume-builder/templates?page=${page}&limit=${limit}`),
  getTemplate: (id: string) => api.get(`/resume-builder/templates/${id}`),
  updateTemplate: (id: string, data: any) => api.put(`/resume-builder/templates/${id}`, data),
  deleteTemplate: (id: string) => api.delete(`/resume-builder/templates/${id}`),
  generateSection: (data: { section: string; context?: any }) => api.post('/resume-builder/generate-section', data),
  improveSection: (data: { section: string; content: string }) => api.post('/resume-builder/improve-section', data),
  checkAts: (data: { content: any }) => api.post('/resume-builder/check-ats', data),
};

export default api;
