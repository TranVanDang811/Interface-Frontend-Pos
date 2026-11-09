import { createSlice } from "@reduxjs/toolkit";
import {
  fetchDailyReport,
  fetchMonthlyReport,
  fetchDashboardReport,
  fetchProductReport
} from "./reportThunks";

const initialState = {
  daily: null,
  monthly: null,
  dashboard: null,
  products: [],
  loading: false,
  error: null,
};

const reportSlice = createSlice({
  name: "report",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Daily
      .addCase(fetchDailyReport.pending, (s) => {
        s.loading = true;
      })
      .addCase(fetchDailyReport.fulfilled, (s, a) => {
        s.loading = false;
        s.daily = a.payload;
      })
      .addCase(fetchDailyReport.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
      })

      // Monthly
      .addCase(fetchMonthlyReport.pending, (s) => {
        s.loading = true;
      })
      .addCase(fetchMonthlyReport.fulfilled, (s, a) => {
        s.loading = false;
        s.monthly = a.payload;
      })

      // Dashboard
      .addCase(fetchDashboardReport.pending, (s) => {
        s.loading = true;
      })
      .addCase(fetchDashboardReport.fulfilled, (s, a) => {
        s.loading = false;
        s.dashboard = a.payload;
      })
      .addCase(fetchDashboardReport.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
      })

      // Products report
      .addCase(fetchProductReport.pending, (s) => {
        s.loading = true;
      })
      .addCase(fetchProductReport.fulfilled, (s, a) => {
        s.loading = false;
        s.products = a.payload;
      })
      .addCase(fetchProductReport.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
      });
  },
});

export default reportSlice.reducer;
