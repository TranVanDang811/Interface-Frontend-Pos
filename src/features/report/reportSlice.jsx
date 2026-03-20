import { createSlice } from "@reduxjs/toolkit";
import {
  fetchDailyReport,
  fetchMonthlyReport,
  fetchDashboardReport
} from "./reportThunks";

const initialState = {
  daily: null,
  monthly: null,
  dashboard: null,
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
      .addCase(fetchDashboardReport.fulfilled, (s, a) => {
        s.dashboard = a.payload;
      });
  },
});

export default reportSlice.reducer;