import { createAsyncThunk } from "@reduxjs/toolkit";
import authAPI from "./authAPI";
import userAPI from "@/features/user/userAPI";
import { setTokens, clearTokens } from "@/services/axiosInstance";

export const login = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      // 1. Đăng nhập lấy token
      const authRes = await authAPI.login(credentials);
      const authPayload = authRes.result || authRes;

      const token = authPayload.token || authPayload.accessToken;
      const refreshToken = authPayload.refreshToken;

      // 2. Lưu token vào localStorage và axios instance
      setTokens({ token, refreshToken });

      // 3. Lấy thông tin user
      const userRes = await userAPI.getMyInfo();
      const user = userRes.result || userRes;

      return {
        token,
        refreshToken,
        user,
      };
    } catch (e) {
      clearTokens();
      return rejectWithValue(e.response?.data?.message || e.message || "Đăng nhập thất bại");
    }
  }
);

export const refreshToken = createAsyncThunk(
  "auth/refresh",
  async (_, { rejectWithValue }) => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) throw new Error("No refresh token");

      const res = await authAPI.refresh({ token: refreshToken }); 
      // ⚠ backend của anh dùng request.getToken()

      const payload = res.result || res;

      const newToken = payload.token || payload.accessToken;
      const newRefreshToken = payload.refreshToken;

      setTokens({ token: newToken, refreshToken: newRefreshToken });

      return { token: newToken, refreshToken: newRefreshToken };
    } catch (e) {
      clearTokens();
      return rejectWithValue(
        e.response?.data?.message || e.message || "Refresh thất bại"
      );
    }
  }
);


export const logout = createAsyncThunk(
  "auth/logout",
  async (payload, { rejectWithValue }) => {
    try {
      await authAPI.logout(payload);
    } catch (e) {
      // Vẫn clear token dù API fail
      console.error("Logout API error:", e);
    } finally {
      clearTokens();
    }
  }
);

// Thunk để khôi phục session từ localStorage
export const restoreSession = createAsyncThunk(
  "auth/restoreSession",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const refreshToken = localStorage.getItem("refreshToken");

      if (!token) {
        return rejectWithValue("No token found");
      }

      // Verify token bằng cách gọi API getMyInfo
      const userRes = await userAPI.getMyInfo();
      const user = userRes.result || userRes;

      return {
        token,
        refreshToken,
        user,
      };
    } catch (e) {
      clearTokens();
      return rejectWithValue(e.response?.data || e.message);
    }
  }
);