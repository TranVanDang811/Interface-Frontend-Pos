import { createAsyncThunk } from "@reduxjs/toolkit";
import categoryAPI from "./categoryAPI";

// Fetch categories
export const fetchCategories = createAsyncThunk(
  "category/fetchCategories",
  async ({ page = 1, size = 5 } = {}, { rejectWithValue }) => {
    try {
      const res = await categoryAPI.getCategories(page, size);
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
