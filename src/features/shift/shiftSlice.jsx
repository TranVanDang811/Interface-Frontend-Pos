import { createSlice } from "@reduxjs/toolkit";
import {
  openShift,
  closeShift,
  fetchCurrentShift,
  fetchShiftReport
} from "./shiftThunks";

const initialState = {
  currentShift: null,
  shiftReport: null,
  loading: false,
  error: null,
};

const shiftSlice = createSlice({
  name: "shift",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder

      // Open shift
      .addCase(openShift.pending, (s) => {
        s.loading = true;
      })
      .addCase(openShift.fulfilled, (s, a) => {
        s.loading = false;
        s.currentShift = a.payload;
      })

      // Close shift
      .addCase(closeShift.fulfilled, (s) => {
        s.currentShift = null;
      })

      // Current shift
     .addCase(fetchCurrentShift.fulfilled, (state, action) => {
  state.currentShift = action.payload.result; 
})

      // Report
      .addCase(fetchShiftReport.fulfilled, (s, a) => {
        s.shiftReport = a.payload;
      });
  },
});

export default shiftSlice.reducer;