import { createAsyncThunk } from "@reduxjs/toolkit";
import shiftAPI from "./shiftAPI";

// Open shift
export const openShift = createAsyncThunk(
  "shift/open",
  async (data, { rejectWithValue }) => {
    try {
      const res = await shiftAPI.openShift(data);
      return res.result || res;
    } catch (e) {
      return rejectWithValue(e.response?.data || e.message);
    }
  }
);

// Close shift
export const closeShift = createAsyncThunk(
  "shift/close",
  async (data, { rejectWithValue }) => {
    try {
      const res = await shiftAPI.closeShift(data);
      return res.result || res;
    } catch (e) {
      return rejectWithValue(e.response?.data || e.message);
    }
  }
);

// Current shift
export const fetchCurrentShift = createAsyncThunk(
  "shift/current",
  async (_, { rejectWithValue }) => {
    try {
      const res = await shiftAPI.getCurrentShift();
      return res.result || res;
    } catch (e) {
      return rejectWithValue(e.response?.data || e.message);
    }
  }
);

// Shift report
export const fetchShiftReport = createAsyncThunk(
  "shift/report",
  async (_, { rejectWithValue }) => {
    try {
      return await shiftAPI.getShiftReport(); // không có result
    } catch (e) {
      return rejectWithValue(e.response?.data || e.message);
    }
  }
);