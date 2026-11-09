import { createSlice } from "@reduxjs/toolkit";
import {
  fetchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  changeProductStatus,
  filterProducts,
  fetchProductStatistics,
  searchProductByCode,
  fetchProductsBySupplier,
} from "./productThunks";

const initialState = {
  list: [],
  page: 0,
  size: 5,
  totalPages: 0,
  statistics: null,
  loading: false,
  error: null,
};

const productSlice = createSlice({
  name: "product",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch products
      .addCase(fetchProducts.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(fetchProducts.fulfilled, (s, a) => {
        s.loading = false;
        const payload = a.payload;

        s.list = payload.content || payload;
        s.page = payload.number || 0;
        s.size = payload.size || s.size;
        s.totalPages = payload.totalPages || 0;
        s.totalElements = payload.totalElements || 0;
      })
      .addCase(fetchProducts.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload || a.error?.message;
      })

      .addCase(fetchProductsBySupplier.pending, (s) => {
        s.loading = true;
      })
      .addCase(fetchProductsBySupplier.fulfilled, (s, a) => {
        s.loading = false;
        s.list = a.payload;
      })
      .addCase(fetchProductsBySupplier.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
      })

      // Create product
      .addCase(createProduct.pending, (state) => {
        state.loading = true;
      })
      .addCase(createProduct.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error?.message;
      })

      // Update product
      .addCase(updateProduct.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload;
        state.list = state.list.map((p) => (p.id === updated.id ? updated : p));
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error?.message;
      })

      // Delete product
      .addCase(deleteProduct.fulfilled, (s, a) => {
        s.list = s.list.filter((p) => p.id !== a.payload);
      })

      // Change status
      .addCase(changeProductStatus.fulfilled, (s, a) => {
        const updated = a.payload;
        s.list = s.list.map((p) => (p.id === updated.id ? updated : p));
      })

      // Filter
      .addCase(filterProducts.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(filterProducts.fulfilled, (s, a) => {
        s.loading = false;
        const payload = a.payload;
        s.list = payload.content || payload;
        s.page = payload.number || 0;
        s.size = payload.size || s.size;
        s.totalPages = payload.totalPages || 0;
        s.totalElements = payload.totalElements || 0;
      })
      .addCase(filterProducts.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload || a.error?.message;
      })

      // Statistics
      .addCase(fetchProductStatistics.fulfilled, (s, a) => {
        s.statistics = a.payload;
      })

      // Search by code
      .addCase(searchProductByCode.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(searchProductByCode.fulfilled, (s, a) => {
        s.loading = false;
        const p = a.payload;
        s.list = p ? [p] : [];
        s.page = 0;
        s.totalPages = p ? 1 : 0;
        s.totalElements = p ? 1 : 0;
      })
      .addCase(searchProductByCode.rejected, (s, a) => {
        s.loading = false;
        s.list = [];
        s.page = 0;
        s.totalPages = 0;
        s.totalElements = 0;
        s.error = a.payload || a.error?.message;
      });
  },
});

export default productSlice.reducer;
