import { createAsyncThunk } from "@reduxjs/toolkit";
import paymentAPI from "./paymentAPI";

// Create payment
export const createPayment = createAsyncThunk(
  "payment/createPayment",
  async (data, { rejectWithValue }) => {
    try {
      const res = await paymentAPI.createPayment(data);
      return res.result || res;
    } catch (e) {
      return rejectWithValue(e.response?.data || e.message);
    }
  }
);

// Get payments
export const fetchPayments = createAsyncThunk(
  "payment/fetchPayments",
  async (params = {}, { rejectWithValue }) => {
    try {
      const res = await paymentAPI.getPayments(params);
      return res.result || res;
    } catch (e) {
      return rejectWithValue(e.response?.data || e.message);
    }
  }
);

// Get payment summary stats
export const fetchPaymentSummary = createAsyncThunk(
  "payment/fetchPaymentSummary",
  async (params = {}, { rejectWithValue }) => {
    try {
      const res = await paymentAPI.getPaymentSummary(params);
      return res.result || res;
    } catch (e) {
      return rejectWithValue(e.response?.data || e.message);
    }
  }
);

// Get payment by order
export const fetchPaymentByOrder = createAsyncThunk(
  "payment/fetchPaymentByOrder",
  async (orderId, { rejectWithValue }) => {
    try {
      const res = await paymentAPI.getPaymentByOrder(orderId);
      return res.result || res;
    } catch (e) {
      return rejectWithValue(e.response?.data || e.message);
    }
  }
);

export const refundItems = createAsyncThunk(
  "payment/refundItems",
  async ({ paymentId, data }, { rejectWithValue }) => {
    try {
      const res = await paymentAPI.refundItems(paymentId, data);
      return res.result || res;
    } catch (e) {
      return rejectWithValue(e.response?.data || e.message);
    }
  }
);

// Get refund history
export const fetchRefundHistory = createAsyncThunk(
  "payment/refundHistory",
  async (paymentId, { rejectWithValue }) => {
    try {
      const res = await paymentAPI.getRefundHistory(paymentId);
      return res.result || res;
    } catch (e) {
      return rejectWithValue(e.response?.data || e.message);
    }
  }
);

export const exportInvoice = createAsyncThunk(
  "payment/exportInvoice",
  async (paymentId, { rejectWithValue }) => {
    try {
      const res = await paymentAPI.exportInvoice(paymentId);
      return res; // HTML string
    } catch (e) {
      return rejectWithValue(e.response?.data || e.message);
    }
  }
);

export const fetchOrderById = createAsyncThunk(
  "payment/fetchOrderById",
  async (orderId, { rejectWithValue }) => {
    try {
      const res = await paymentAPI.getOrderById(orderId);
      return res.result || res;
    } catch (e) {
      return rejectWithValue(e.response?.data || e.message);
    }
  }
);