import { createSlice } from "@reduxjs/toolkit";
import {
  fetchImportOrders,
  createImportOrder,
  confirmImportOrder,
  deleteImportOrder,
  fetchImportStatistics,
  fetchImportOrderDetails,
  updateReceivedQuantity,
} from "./importOrderThunks";

const initialState = {
  list: [],
  page: 0,
  totalPages: 0,
  totalElements: 0,

  loading: false,
  error: null,

  // cache detail theo orderId
  details: {},        // { [orderId]: Page<ImportOrderDetailResponse> }
  detailLoading: {},  // { [orderId]: boolean }
  confirmedMap: {},
  statistics: null,
};

const importOrderSlice = createSlice({
  name: "importOrder",
  initialState,
  reducers: {
    clearImportOrderDetails: (state, action) => {
      delete state.details[action.payload];
    },
  },
  extraReducers: (builder) => {
    builder

      // ================================
      // FETCH LIST
      // ================================
      .addCase(fetchImportOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchImportOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.content;
        state.page = action.payload.number;
        state.totalPages = action.payload.totalPages;
        state.totalElements = action.payload.totalElements;
      })
      .addCase(fetchImportOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ================================
      // CREATE
      // ================================
      .addCase(createImportOrder.fulfilled, (state, action) => {
        state.list.unshift(action.payload);
      })

      // ================================
      // CONFIRM
      // ================================
      .addCase(confirmImportOrder.fulfilled, (state, action) => {
          const updatedOrder = action.payload;

          const index = state.list.findIndex(o => o.id === updatedOrder.id);
          if (index !== -1) {
            state.list[index] = updatedOrder;
          }

          state.confirmedMap[updatedOrder.id] = true;
        })
      // ================================
      // DELETE
      // ================================
    .addCase(deleteImportOrder.fulfilled, (state, action) => {
  state.list = state.list.filter(o => o.id !== action.payload);
  delete state.details[action.payload];
})

      // ================================
      // STATISTICS
      // ================================
      .addCase(fetchImportStatistics.fulfilled, (state, action) => {
        state.statistics = action.payload;
      })

      // ================================
      // FETCH DETAILS
      // ================================
      .addCase(fetchImportOrderDetails.pending, (state, action) => {
        const orderId = action.meta.arg.orderId;
        state.detailLoading[orderId] = true;
      })
      .addCase(fetchImportOrderDetails.fulfilled, (state, action) => {
        const { orderId, data } = action.payload;

        state.detailLoading[orderId] = false;
        state.details[orderId] = data;
      })
      .addCase(fetchImportOrderDetails.rejected, (state, action) => {
        const orderId = action.meta.arg.orderId;
        state.detailLoading[orderId] = false;
      })

      // ================================
      // UPDATE RECEIVED QUANTITY
      // ================================
     .addCase(updateReceivedQuantity.fulfilled, (state, action) => {

  const updatedOrder = action.payload;

  const index = state.list.findIndex(o => o.id === updatedOrder.id);

  if (index !== -1) {
    state.list[index] = updatedOrder;
  }

  delete state.details[updatedOrder.id];
});
  },
});

export const { clearImportOrderDetails } = importOrderSlice.actions;
export default importOrderSlice.reducer;