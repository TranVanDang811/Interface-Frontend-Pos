import { createAsyncThunk } from "@reduxjs/toolkit";
import roleAPI from "./roleAPI";

// Fetch roles
export const fetchRoles = createAsyncThunk(
  "role/fetchRoles",
  async ({ page = 1, size = 5 } = {}, { rejectWithValue }) => {
    try {
      const res = await roleAPI.getRoles(page, size);
      return res.result || res;
    } catch (e) {
      return rejectWithValue(e.response?.data || e.message);
    }
  }
);

// Create role
export const createRole = createAsyncThunk(
  "role/createRole",
  async (data, { rejectWithValue }) => {
    try {
      const res = await roleAPI.createRole(data);
      return res.result || res;
    } catch (e) {
      return rejectWithValue(e.response?.data || e.message);
    }
  }
);

// Delete role
export const deleteRole = createAsyncThunk(
  "role/deleteRole",
  async (role, { rejectWithValue }) => {
    try {
      await roleAPI.deleteRole(role);
      return role;
    } catch (e) {
      return rejectWithValue(e.response?.data || e.message);
    }
  }
);