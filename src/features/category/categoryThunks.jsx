import { createAsyncThunk } from "@reduxjs/toolkit";
import categoryAPI from "./categoryAPI";

// Fetch categories with search and pagination
export const fetchCategories = createAsyncThunk(
  "category/fetchCategories",
  async (params = {}, { rejectWithValue }) => {
    try {
      const res = await categoryAPI.getCategories(params);
      return res.result;
    } catch (e) {
      return rejectWithValue(e.response?.data || e.message);
    }
  }
);

// Fetch summary KPIs
export const fetchCategorySummary = createAsyncThunk(
  "category/fetchCategorySummary",
  async (_, { rejectWithValue }) => {
    try {
      const res = await categoryAPI.getSummary();
      return res.result;
    } catch (e) {
      return rejectWithValue(e.response?.data || e.message);
    }
  }
);

// Create
export const createCategory = createAsyncThunk(
  "category/createCategory",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await categoryAPI.createCategory(payload);
      return res.result;
    } catch (e) {
      return rejectWithValue(e.response?.data || e.message);
    }
  }
);

// Update
export const updateCategory = createAsyncThunk(
  "category/updateCategory",
  async ({ id, ...payload }, { rejectWithValue }) => {
    try {
      const res = await categoryAPI.updateCategory(id, payload);
      return res.result;
    } catch (e) {
      return rejectWithValue(e.response?.data || e.message);
    }
  }
);

// Delete
export const deleteCategory = createAsyncThunk(
  "category/deleteCategory",
  async (id, { rejectWithValue }) => {
    try {
      await categoryAPI.deleteCategory(id);
      return id;
    } catch (e) {
      return rejectWithValue(e.response?.data || e.message);
    }
  }
);
