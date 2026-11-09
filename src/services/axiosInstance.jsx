import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || (import.meta.env.PROD ? "/backend" : "http://localhost:8080/backend"),
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

/* =========================
   TOKEN HELPERS
   - Lưu ưu tiên vào sessionStorage để mỗi tab có thể đăng nhập độc lập
     (Ví dụ: Tab 1 là Employee bán hàng POS, Tab 2 là Admin/Manage xem Dashboard).
========================= */
export const getToken = () => {
  // Hỗ trợ mở Dashboard song song từ tab POS
  const handoff = localStorage.getItem("admin_handoff_token");
  if (handoff) {
    sessionStorage.setItem("token", handoff);
    localStorage.removeItem("admin_handoff_token");
    const handoffRefresh = localStorage.getItem("admin_handoff_refresh");
    if (handoffRefresh) {
      sessionStorage.setItem("refreshToken", handoffRefresh);
      localStorage.removeItem("admin_handoff_refresh");
    }
    return handoff;
  }
  return sessionStorage.getItem("token") || localStorage.getItem("token");
};

export const getRefreshToken = () => sessionStorage.getItem("refreshToken") || localStorage.getItem("refreshToken");

export const setTokens = ({ token, refreshToken }) => {
  if (token) {
    sessionStorage.setItem("token", token);
  }
  if (refreshToken) {
    sessionStorage.setItem("refreshToken", refreshToken);
  }
  // Xóa token ở localStorage để tránh xung đột giữa các tab trên cùng trình duyệt
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
};

export const clearTokens = () => {
  sessionStorage.removeItem("token");
  sessionStorage.removeItem("refreshToken");
  sessionStorage.removeItem("shiftCode");
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("shiftCode");
  localStorage.removeItem("admin_handoff_token");
  localStorage.removeItem("admin_handoff_refresh");
};

/* =========================
   REQUEST INTERCEPTOR
========================= */
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getToken();
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
   AUTH ENDPOINT GUARD
   - Không kích hoạt refresh token cho các endpoint đăng nhập/xác thực
========================= */
const isAuthEndpoint = (url = "") => {
  return (
    url.includes("/auth/token") ||
    url.includes("/auth/refresh") ||
    url.includes("/auth/logout") ||
    url.includes("/auth/introspect")
  );
};

/* =========================
   RESPONSE INTERCEPTOR
========================= */
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isAuthEndpoint(originalRequest.url)
    ) {
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
        const refreshToken = getRefreshToken();
        if (!refreshToken) throw new Error("No refresh token");

        const baseUrl = (axiosInstance.defaults.baseURL || "").replace(/\/+$/, "");
        const response = await axios.post(`${baseUrl}/auth/refresh`, {
          token: refreshToken,
        });

        const newToken =
          response.data.result?.token || response.data.token;

        const newRefreshToken =
          response.data.result?.refreshToken ||
          response.data.refreshToken;

        if (!newToken) throw new Error("Invalid refresh response");

        setTokens({ token: newToken, refreshToken: newRefreshToken });

        processQueue(null, newToken);

        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return axiosInstance(originalRequest);

      } catch (refreshError) {
        processQueue(refreshError, null);
        clearTokens();
        if (typeof window !== "undefined" && window.location.pathname !== "/auth/sign-in") {
          window.location.href = "/auth/sign-in";
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
