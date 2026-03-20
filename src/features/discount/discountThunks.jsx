import { createAsyncThunk } from "@reduxjs/toolkit";
import discountAPI from "./discountAPI";

// Fetch all discounts
export const fetchDiscounts = createAsyncThunk(
  "discount/fetchDiscounts",
  async (_, { rejectWithValue }) => {
    try {
      const res = await discountAPI.getDiscounts();
      return res.result || res;
    } catch (e) {
      return rejectWithValue(e.response?.data || e.message);
    }
  }
);

// Fetch active discounts
export const fetchActiveDiscounts = createAsyncThunk(
  "discount/fetchActive",
  async (_, { rejectWithValue }) => {
    try {
      const res = await discountAPI.getActiveDiscounts();
      return res.result || res;
    } catch (e) {
      return rejectWithValue(e.response?.data || e.message);
    }
  }
);

// Create discount
export const createDiscount = createAsyncThunk(
  "discount/create",
  async (data, { rejectWithValue }) => {
    try {
      const res = await discountAPI.createDiscount(data);
      return res.result || res;
    } catch (e) {
      return rejectWithValue(e.response?.data || e.message);
    }
  }
);

// Update discount
export const updateDiscount = createAsyncThunk(
  "discount/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await discountAPI.updateDiscount(id, data);
      return res.result || res;
    } catch (e) {
      return rejectWithValue(e.response?.data || e.message);
    }
  }
);

// Delete discount
export const deleteDiscount = createAsyncThunk(
  "discount/delete",
  async (id, { rejectWithValue }) => {
    try {
      await discountAPI.deleteDiscount(id);
      return id;
    } catch (e) {
      return rejectWithValue(e.response?.data || e.message);
    }
  }
);

// Search discount by code
export const searchDiscountByCode = createAsyncThunk(
  "discount/searchByCode",
  async (code, { rejectWithValue }) => {
    try {
      const res = await discountAPI.getDiscountByCode(code);
      return res.result || res;
    } catch (e) {
      return rejectWithValue(e.response?.data || e.message);
    }
  }
);