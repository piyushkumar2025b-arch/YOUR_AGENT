import axios, { type AxiosRequestConfig } from "axios";

export const apiClient = axios.create({
  timeout: 30000,
  headers: {
    "Content-Type": "application/json"
  }
});

// Response interceptor for unified error formatting and fallback
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.warn("Axios request error intercepted:", error?.message || error);
    return Promise.reject({
      message: error?.response?.data?.message || error?.message || "API request failed",
      status: error?.response?.status || 500,
      originalError: error
    });
  }
);

export async function safeFetchJson<T>(url: string, config?: AxiosRequestConfig): Promise<T | null> {
  try {
    const res = await apiClient.get<T>(url, config);
    return res.data;
  } catch (err) {
    console.warn(`safeFetchJson failed for ${url}:`, err);
    return null;
  }
}

export async function safePostJson<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T | null> {
  try {
    const res = await apiClient.post<T>(url, data, config);
    return res.data;
  } catch (err) {
    console.warn(`safePostJson failed for ${url}:`, err);
    return null;
  }
}
