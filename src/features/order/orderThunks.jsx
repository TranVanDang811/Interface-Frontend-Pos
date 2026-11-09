import { createAsyncThunk } from "@reduxjs/toolkit";
import orderAPI from "./orderAPI";

// Fetch orders (with filtering and pagination)
export const fetchOrders = createAsyncThunk(
  "order/fetchOrders",
  async (params = { page: 1, size: 10 }, { rejectWithValue }) => {
    try {
      const res = await orderAPI.getOrders(params);
      return res.result || res;
    } catch (e) {
      return rejectWithValue(e.response?.data || e.message);
    }
  }
);

// Fetch order summary stats
export const fetchOrderSummary = createAsyncThunk(
  "order/fetchOrderSummary",
  async (params = {}, { rejectWithValue }) => {
    try {
      const res = await orderAPI.getOrderSummary(params);
      return res.result || res;
    } catch (e) {
      return rejectWithValue(e.response?.data || e.message);
    }
  }
);

// Create order
export const createOrder = createAsyncThunk(
  "order/createOrder",
  async (data, { rejectWithValue }) => {
    try {
      const res = await orderAPI.createOrder(data);
      return res.result || res;
    } catch (e) {
      return rejectWithValue(e.response?.data || e.message);
    }
  }
);

// Get order by id
export const fetchOrderById = createAsyncThunk(
  "order/fetchOrderById",
  async (orderId, { rejectWithValue }) => {
    try {
      const res = await orderAPI.getOrderById(orderId);
      return res.result || res;
    } catch (e) {
      return rejectWithValue(e.response?.data || e.message);
    }
  }
);

// Delete order
export const deleteOrder = createAsyncThunk(
  "order/deleteOrder",
  async (orderId, { rejectWithValue }) => {
    try {
      await orderAPI.deleteOrder(orderId);
      return orderId;
    } catch (e) {
      return rejectWithValue(e.response?.data || e.message);
    }
  }
);

// Filter orders
export const filterOrders = createAsyncThunk(
  "order/filterOrders",
  async (params, { rejectWithValue }) => {
    try {
      const res = await orderAPI.filterOrders(params);
      return res.result || res;
    } catch (e) {
      return rejectWithValue(e.response?.data || e.message);
    }
  }
);

// Revenue statistics
export const fetchRevenueStats = createAsyncThunk(
  "order/revenueStats",
  async (params, { rejectWithValue }) => {
    try {
      const res = await orderAPI.getRevenue(params);
      return res.result || res;
    } catch (e) {
      return rejectWithValue(e.response?.data || e.message);
    }
  }
);

// HOLD order
export const holdOrder = createAsyncThunk(
  "order/holdOrder",
  async (orderId, { rejectWithValue }) => {
    try {
      const res = await orderAPI.holdOrder(orderId);
      return { orderId, ...res };
    } catch (e) {
      return rejectWithValue(e.response?.data || e.message);
    }
  }
);

// Update order
export const updateOrder = createAsyncThunk(
  "order/updateOrder",
  async ({ orderId, data }, { rejectWithValue }) => {
    try {
      const res = await orderAPI.updateOrder(orderId, data);
      return res.result || res;
    } catch (e) {
      return rejectWithValue(e.response?.data || e.message);
    }
  }
);

// Get orders by status
export const fetchOrdersByStatus = createAsyncThunk(
  "order/fetchOrdersByStatus",
  async ({ status, page = 1, size = 10 }, { rejectWithValue }) => {
    try {
      const res = await orderAPI.getOrdersByStatus(status, page, size);
      return res.result || res;
    } catch (e) {
      return rejectWithValue(e.response?.data || e.message);
    }
  }
);
