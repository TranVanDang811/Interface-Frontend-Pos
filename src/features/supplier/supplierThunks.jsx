import { createAsyncThunk } from "@reduxjs/toolkit";
import supplierAPI from "./supplierAPI";

// Fetch list
export const fetchSuppliers = createAsyncThunk(
  "supplier/fetchSuppliers",
  async ({ page = 1, size = 5 } = {}, { rejectWithValue }) => {
    try {
      const res = await supplierAPI.getSuppliers(page, size);
        return res.result || res;
    } catch (e) {
      return rejectWithValue(e.response?.data || e.message);
    }
  }
);

// Search
export const searchSuppliers = createAsyncThunk(
  "supplier/searchSuppliers",
  async ({ keyword, page = 1, size = 5 }, { rejectWithValue }) => {
    try {
      const res = await supplierAPI.searchSuppliers(keyword, page, size);
      return res.result || res;
    } catch (e) {
      return rejectWithValue(e.response?.data || e.message);
    }
  }
);

// Create
export const createSupplier = createAsyncThunk(
  "supplier/createSupplier",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await supplierAPI.createSupplier(payload);
       return res.result || res;
    } catch (e) {
      return rejectWithValue(e.response?.data || e.message);
    }
  }
);

// Update
export const updateSupplier = createAsyncThunk(
  "supplier/updateSupplier",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await supplierAPI.updateSupplier(id, data);
      return res.result || res;
    } catch (e) {
      return rejectWithValue(e.response?.data || e.message);
    }
  }
);

// Delete
export const deleteSupplier = createAsyncThunk(
  "supplier/deleteSupplier",
  async (id, { rejectWithValue }) => {
    try {
      await supplierAPI.deleteSupplier(id);
      return id;
    } catch (e) {
      return rejectWithValue(e.response?.data || e.message);
    }
  }
);
