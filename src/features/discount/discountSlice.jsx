import { createSlice } from "@reduxjs/toolkit";
import {
  fetchDiscounts,
  fetchActiveDiscounts,
  createDiscount,
  updateDiscount,
  deleteDiscount,
  searchDiscountByCode
} from "./discountThunks";

const initialState = {
  list: [],
  activeDiscounts: [],
  discountDetail: null,
  loading: false,
  error: null,
};

const discountSlice = createSlice({
  name: "discount",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder

      // Fetch all
      .addCase(fetchDiscounts.pending, (s) => {
        s.loading = true;
      })
      .addCase(fetchDiscounts.fulfilled, (s, a) => {
        s.loading = false;
        s.list = a.payload;
      })
      .addCase(fetchDiscounts.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
      })

      // Active discounts
      .addCase(fetchActiveDiscounts.fulfilled, (s, a) => {
        s.activeDiscounts = a.payload;
      })

      // Create
      .addCase(createDiscount.fulfilled, (s, a) => {
        s.list.push(a.payload);
      })

      // Update
      .addCase(updateDiscount.fulfilled, (s, a) => {
        const updated = a.payload;
        s.list = s.list.map(d =>
          d.id === updated.id ? updated : d
        );
      })

      // Delete
      .addCase(deleteDiscount.fulfilled, (s, a) => {
        s.list = s.list.filter(d => d.id !== a.payload);
      })

      // Search by code
      .addCase(searchDiscountByCode.fulfilled, (s, a) => {
        s.discountDetail = a.payload;
      });
  },
});

export default discountSlice.reducer;