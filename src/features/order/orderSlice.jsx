import { createSlice } from "@reduxjs/toolkit";
import {
  fetchOrders,
  createOrder,
  deleteOrder,
  fetchOrderById,
  filterOrders,
  fetchRevenueStats,
  holdOrder,
  updateOrder,
  fetchOrdersByStatus
} from "./orderThunks";

const initialState = {
  list: [],
  orderDetail: null,
  revenueStats: null,
  page: 0,
  totalPages: 0,
  loading: false,
  error: null,
};

const orderSlice = createSlice({
  name: "order",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder

      // Fetch orders
      .addCase(fetchOrders.pending, (s) => {
        s.loading = true;
      })
      .addCase(fetchOrders.fulfilled, (s, a) => {
        s.loading = false;
        const payload = a.payload;

        s.list = payload.content || payload;
        s.page = payload.number || 0;
        s.totalPages = payload.totalPages || 0;
      })
      .addCase(fetchOrders.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
      })

      // Create order
      .addCase(createOrder.fulfilled, (s, a) => {
        s.orderDetail = a.payload;
      })

      // Get order by id
      .addCase(fetchOrderById.fulfilled, (s, a) => {
        s.orderDetail = a.payload;
      })

      // Delete order
      .addCase(deleteOrder.fulfilled, (s, a) => {
        s.list = s.list.filter(o => o.id !== a.payload);
      })

      // Filter orders
      .addCase(filterOrders.fulfilled, (s, a) => {
        s.list = a.payload;
      })

      // Revenue stats
      .addCase(fetchRevenueStats.fulfilled, (s, a) => {
        s.revenueStats = a.payload;
      })
      
      // HOLD order
      .addCase(holdOrder.fulfilled, (s, a) => {
        const order = s.list.find(o => o.id === a.payload.orderId);
        if (order) {
          order.status = "HOLD";
        }
      })

      // Update order
      .addCase(updateOrder.fulfilled, (s, a) => {
        s.orderDetail = a.payload;
      })

      // Fetch orders by status
      .addCase(fetchOrdersByStatus.fulfilled, (s, a) => {
        const payload = a.payload;

        s.list = payload.content || payload;
        s.page = payload.number || 0;
        s.totalPages = payload.totalPages || 0;
      });
      ;
  },
});

export default orderSlice.reducer;