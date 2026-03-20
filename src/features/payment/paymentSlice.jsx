import { createSlice } from "@reduxjs/toolkit";
import {
  fetchPayments,
  createPayment,
  refundPayment,
  fetchPaymentByOrder,
  fetchRefundHistory
} from "./paymentThunks";

const initialState = {
  list: [],
  paymentDetail: null,
  refundHistory: [],
  page: 0,
  totalPages: 0,
  loading: false,
  error: null,
};

const paymentSlice = createSlice({
  name: "payment",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder

      // Fetch payments
      .addCase(fetchPayments.pending, (s) => {
        s.loading = true;
      })
      .addCase(fetchPayments.fulfilled, (s, a) => {
        s.loading = false;
        const payload = a.payload;

        s.list = payload.content || payload;
        s.page = payload.number || 0;
        s.totalPages = payload.totalPages || 0;
      })
      .addCase(fetchPayments.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
      })

      // Create payment
      .addCase(createPayment.fulfilled, (s, a) => {
        s.paymentDetail = a.payload;
      })

      // Payment by order
      .addCase(fetchPaymentByOrder.fulfilled, (s, a) => {
        s.paymentDetail = a.payload;
      })

      // Refund
      .addCase(refundPayment.fulfilled, (s, a) => {
        s.paymentDetail = a.payload;
      })

      // Refund history
      .addCase(fetchRefundHistory.fulfilled, (s, a) => {
        s.refundHistory = a.payload;
      });
  },
});

export default paymentSlice.reducer;