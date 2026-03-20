import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/backend",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

/* =========================
   REQUEST INTERCEPTOR
========================= */
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/* =========================
   REFRESH LOGIC
========================= */

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

/* =========================
   RESPONSE INTERCEPTOR
========================= */
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = "Bearer " + token;
            return axiosInstance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) throw new Error("No refresh token");

        // ⚠ QUAN TRỌNG: phải đúng field backend yêu cầu
        const response = await axios.post(
          `${axiosInstance.defaults.baseURL}/auth/refresh`,
          { token: refreshToken }
        );

        const newToken =
          response.data.result?.token || response.data.token;

        const newRefreshToken =
          response.data.result?.refreshToken ||
          response.data.refreshToken;

        if (!newToken) throw new Error("Invalid refresh response");

        localStorage.setItem("token", newToken);

        if (newRefreshToken) {
          localStorage.setItem("refreshToken", newRefreshToken);
        }

        processQueue(null, newToken);

        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return axiosInstance(originalRequest);

      } catch (refreshError) {
        processQueue(refreshError, null);
        clearTokens();
        window.location.href = "/auth/sign-in";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

/* =========================
   TOKEN HELPERS
========================= */

export const setTokens = ({ token, refreshToken }) => {
  if (token) localStorage.setItem("token", token);
  if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
};

export const clearTokens = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
};

export const getToken = () => localStorage.getItem("token");
export const getRefreshToken = () => localStorage.getItem("refreshToken");

export default axiosInstance;
