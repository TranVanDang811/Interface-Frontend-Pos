import { createSlice } from "@reduxjs/toolkit";
import {
  fetchPayments,
  createPayment,
  fetchPaymentByOrder,
  fetchRefundHistory,
  refundItems,
  fetchOrderById,
  fetchPaymentSummary
} from "./paymentThunks";

const initialState = {
  list: [],
  paymentDetail: null,
  orderDetail: null,
  refundHistory: [],
  summary: null,
  refunding: false,
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

    .addCase(fetchOrderById.pending, (s) => {
  s.loading = true;
})
.addCase(fetchOrderById.fulfilled, (s, a) => {
  s.loading = false;
  s.orderDetail = a.payload;
})
.addCase(fetchOrderById.rejected, (s, a) => {
  s.loading = false;
  s.error = a.payload;
})
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
          .addCase(refundItems.pending, (s) => {
        s.refunding = true;
      })
      .addCase(refundItems.fulfilled, (s, a) => {
        s.refunding = false;
        s.paymentDetail = a.payload;
      })
      .addCase(refundItems.rejected, (s, a) => {
        s.refunding = false;
        s.error = a.payload;
      })
      // Refund history
      .addCase(fetchRefundHistory.fulfilled, (s, a) => {
        s.refundHistory = a.payload;
      })
      .addCase(fetchPaymentSummary.fulfilled, (s, a) => {
        s.summary = a.payload;
      });
  },
});

export default paymentSlice.reducer;