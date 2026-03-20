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
  async ({ page = 1, size = 5 } = {}, { rejectWithValue }) => {
    try {
      const res = await paymentAPI.getPayments(page, size);
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

// Refund payment
export const refundPayment = createAsyncThunk(
  "payment/refundPayment",
  async ({ paymentId, data }, { rejectWithValue }) => {
    try {
      const res = await paymentAPI.refundPayment(paymentId, data);
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
      return res;
    } catch (e) {
      return rejectWithValue(e.response?.data || e.message);
    }
  }
);