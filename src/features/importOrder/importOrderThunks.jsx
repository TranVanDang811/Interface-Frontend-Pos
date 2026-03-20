import { createAsyncThunk } from "@reduxjs/toolkit";
import importOrderAPI from "./importOrderAPI";

// FETCH LIST
export const fetchImportOrders = createAsyncThunk(
  "importOrder/fetch",
  async (params, { rejectWithValue }) => {
    try {
      return await importOrderAPI.getImportOrders(params);
    } catch (e) {
      return rejectWithValue(e.response?.data || e.message);
    }
  }
);

// FETCH DETAILS
export const fetchImportOrderDetails = createAsyncThunk(
  "importOrder/fetchDetails",
  async ({ orderId, page = 1, size = 5 }, { rejectWithValue }) => {
    try {
      const data = await importOrderAPI.getImportOrderDetails(orderId, {
        page,
        size,
      });

      return { orderId, data };

    } catch (e) {
      return rejectWithValue(e.response?.data || e.message);
    }
  }
);

// CREATE
export const createImportOrder = createAsyncThunk(
  "importOrder/create",
  async (payload, { rejectWithValue }) => {
    try {
      return await importOrderAPI.createImportOrder(payload);
    } catch (e) {
      return rejectWithValue(e.response?.data || e.message);
    }
  }
);

// CONFIRM
export const confirmImportOrder = createAsyncThunk(
  "importOrder/confirm",
  async (orderId, { rejectWithValue }) => {
    try {
      return await importOrderAPI.confirmImportOrder(orderId);
    } catch (e) {
      return rejectWithValue(e.response?.data || e.message);
    }
  }
);

// DELETE
export const deleteImportOrder = createAsyncThunk(
  "importOrder/delete",
  async (orderId, { rejectWithValue }) => {
    try {
      await importOrderAPI.deleteImportOrder(orderId);
      return orderId;
    } catch (e) {
      return rejectWithValue(e.response?.data || e.message);
    }
  }
);

// UPDATE RECEIVED
export const updateReceivedQuantity = createAsyncThunk(
  "importOrder/updateReceived",
  async ({ orderId, detailId, receivedQuantity }, { rejectWithValue }) => {
    try {
      return await importOrderAPI.updateReceivedQuantity(
        orderId,
        detailId,
        receivedQuantity
      );
    } catch (e) {
      return rejectWithValue(e.response?.data || e.message);
    }
  }
);

// STATISTICS
export const fetchImportStatistics = createAsyncThunk(
  "importOrder/statistics",
  async ({ from, to }, { rejectWithValue }) => {
    try {
      return await importOrderAPI.getStatistics(from, to);
    } catch (e) {
      return rejectWithValue(e.response?.data || e.message);
    }
  }
);