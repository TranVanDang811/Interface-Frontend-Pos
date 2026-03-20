import { createAsyncThunk } from "@reduxjs/toolkit";
import userAPI from "./userAPI";

export const fetchUsers = createAsyncThunk(
  "user/fetchUsers",
  async ({ page = 0, size = 10, role } = {}, { rejectWithValue }) => {
    try {
      const res = await userAPI.getUsers({ page, size, role });
      return res.result || res;
    } catch (e) {
      return rejectWithValue(e.response?.data || e.message);
    }
  }
);

export const deleteUser = createAsyncThunk("user/deleteUser", async (id, { rejectWithValue }) => {
  try {
    const res = await userAPI.deleteUser(id);
    return id;
  } catch (e) {
    return rejectWithValue(e.response?.data || e.message);
  }
});

export const changeUserStatus = createAsyncThunk("user/changeStatus", async ({ id, status }, { rejectWithValue }) => {
  try {
    const res = await userAPI.changeStatus(id, status);
    return res.result || res;
  } catch (e) {
    return rejectWithValue(e.response?.data || e.message);
  }
});

export const updateUserRole = createAsyncThunk("user/updateRole", async ({ id, roleName }, { rejectWithValue }) => {
  try {
    const res = await userAPI.updateRole(id, roleName);
    return res.result || res;
  } catch (e) {
    return rejectWithValue(e.response?.data || e.message);
  }
});

export const fetchMyInfo = createAsyncThunk(
  "user/fetchMyInfo",
  async (_, { rejectWithValue }) => {
    try {
      const res = await userAPI.getMyInfo();
      return res.result || res; // backend có thể wrap trong result
    } catch (e) {
      return rejectWithValue(e.response?.data || e.message);
    }
  }
);

export const fetchUserById = createAsyncThunk(
  "user/fetchUserById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await userAPI.getUserById(id);
      return res.result || res;
    } catch (e) {
      return rejectWithValue(e.response?.data || e.message);
    }
  }
);

export const createUser = createAsyncThunk(
  "user/createUser",
  async (data, { rejectWithValue }) => {
    try {
      const res = await userAPI.createUser(data); 
      return res;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const searchUsers = createAsyncThunk(
  "user/searchUsers",
  async ({ keyword, page = 0, size = 5, role }, { rejectWithValue }) => {
    try {
      const res = await userAPI.searchUsers({
        keyword,
        page,
        size,
        role,
      });

      return res.result || res;
    } catch (e) {
      return rejectWithValue(e.response?.data || e.message);
    }
  }
);

export const findUserByPhone = createAsyncThunk(
  "user/findUserByPhone",
  async (phone, { rejectWithValue }) => {
    try {

      const res = await userAPI.getUserByPhone(phone);
      return res.result || res;

    } catch (e) {

      return rejectWithValue(e.response?.data || e.message);

    }
  }
);

export const changePassword = createAsyncThunk(
  "user/changePassword",
  async ({ id, data }, { rejectWithValue }) => {
    try {

      const res = await userAPI.changePassword(id, data);

      return res.result || res;

    } catch (e) {

      return rejectWithValue(e.response?.data || e.message);

    }
  }
);