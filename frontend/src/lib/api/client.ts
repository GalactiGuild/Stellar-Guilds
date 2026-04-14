import axios, {
  AxiosError,
  InternalAxiosRequestConfig,
  AxiosResponse,
} from 'axios';

/* ---------- types ---------- */

export interface ApiClientConfig {
  baseURL?: string;
  timeout?: number;
}

/* ---------- token accessors ---------- */

/**
 * Get the current auth token.
 * Checks localStorage first (for JWT from login), then falls back to null.
 */
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token') || localStorage.getItem('jwt');
}

/**
 * Clear auth state on 401 (forced logout).
 */
function clearAuthState(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('auth_token');
  localStorage.removeItem('jwt');
  // Dispatch a global event so stores / components can react
  window.dispatchEvent(new CustomEvent('auth:logout'));
}

/* ---------- client ---------- */

const DEFAULT_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const apiClient = axios.create({
  baseURL: DEFAULT_BASE_URL,
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
});

/* ---- request interceptor: attach JWT ---- */

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAuthToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

/* ---- response interceptor: handle 401 ---- */

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expired or invalid → clear auth and signal logout
      clearAuthState();

      // Avoid infinite redirect loops
      if (
        typeof window !== 'undefined' &&
        !window.location.pathname.includes('/login')
      ) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);

/* ---- convenience wrappers ---- */

export const api = {
  get: <T>(url: string, config?: ApiClientConfig) =>
    apiClient.get<T>(url, config).then((r) => r.data),
  post: <T>(url: string, data?: unknown, config?: ApiClientConfig) =>
    apiClient.post<T>(url, data, config).then((r) => r.data),
  put: <T>(url: string, data?: unknown, config?: ApiClientConfig) =>
    apiClient.put<T>(url, data, config).then((r) => r.data),
  patch: <T>(url: string, data?: unknown, config?: ApiClientConfig) =>
    apiClient.patch<T>(url, data, config).then((r) => r.data),
  delete: <T>(url: string, config?: ApiClientConfig) =>
    apiClient.delete<T>(url, config).then((r) => r.data),
};

export default apiClient;
