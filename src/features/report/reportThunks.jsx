import { createAsyncThunk } from "@reduxjs/toolkit";
import reportAPI from "./reportAPI";

// Daily report
export const fetchDailyReport = createAsyncThunk(
  "report/daily",
  async (date, { rejectWithValue }) => {
    try {
      const res = await reportAPI.getDailyReport(date);
      return res.result || res;
    } catch (e) {
      return rejectWithValue(e.response?.data || e.message);
    }
  }
);

// Monthly report
export const fetchMonthlyReport = createAsyncThunk(
  "report/monthly",
  async (month, { rejectWithValue }) => {
    try {
      const res = await reportAPI.getMonthlyReport(month);
      return res.result || res;
    } catch (e) {
      return rejectWithValue(e.response?.data || e.message);
    }
  }
);

// Dashboard report
export const fetchDashboardReport = createAsyncThunk(
  "report/dashboard",
  async (_, { rejectWithValue }) => {
    try {
      const res = await reportAPI.getDashboardReport();
      return res.result || res;
    } catch (e) {
      return rejectWithValue(e.response?.data || e.message);
    }
  }
);