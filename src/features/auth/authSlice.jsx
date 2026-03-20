import { createSlice } from "@reduxjs/toolkit";
import { login, refreshToken, logout, restoreSession } from "./authThunks";

const initialState = {
  user: null,
  token: null,
  refreshToken: null,
  loading: false,
  error: null,
  isAuthenticated: false,
  sessionRestored: false, // để biết đã check session chưa
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearAuth(state) {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.error = null;
      state.isAuthenticated = false;
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
        state.sessionRestored = true;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
        state.isAuthenticated = false;
      })

      // Refresh Token
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
      })
      .addCase(refreshToken.rejected, (state) => {
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
      })

      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.error = null;
      })

      // Restore Session
      .addCase(restoreSession.pending, (state) => {
        state.loading = true;
      })
      .addCase(restoreSession.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
        state.sessionRestored = true;
      })
      .addCase(restoreSession.rejected, (state) => {
        state.loading = false;
        state.sessionRestored = true; // đánh dấu đã check xong
        state.isAuthenticated = false;
      });
  },
});

export const { clearAuth, clearError } = authSlice.actions;
export default authSlice.reducer;