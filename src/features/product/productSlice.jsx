import { createSlice } from "@reduxjs/toolkit";
import {
  fetchProducts,
  createProduct,
  deleteProduct,
  changeProductStatus,
  filterProducts,
  fetchProductStatistics,
  searchProductByCode,
  fetchProductsBySupplier
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
      })
      .addCase(fetchProducts.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload || a.error.message;
      })
.addCase(fetchProductsBySupplier.pending, (s) => {
  s.loading = true;
})
.addCase(fetchProductsBySupplier.fulfilled, (s, a) => {
  s.loading = false;
  s.list = a.payload; // vì API trả List
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
    state.error = action.error.message;
  })
      // Delete product
      .addCase(deleteProduct.fulfilled, (s, a) => {
        s.list = s.list.filter(p => p.id !== a.payload);
      })

      // Change status
      .addCase(changeProductStatus.fulfilled, (s, a) => {
        const updated = a.payload;
        s.list = s.list.map(p =>
          p.id === updated.id ? updated : p
        );
      })

      // Filter
      .addCase(filterProducts.fulfilled, (s, a) => {
        const payload = a.payload;
        s.list = payload.content || payload;
        s.page = payload.number || 0;
        s.totalPages = payload.totalPages || 0;
      })


      // Statistics
      .addCase(fetchProductStatistics.fulfilled, (s, a) => {
        s.statistics = a.payload;
      })
      
      // Search by code
      .addCase(searchProductByCode.pending, (s) => {
        s.loading = true;
      })
      .addCase(searchProductByCode.fulfilled, (s, a) => {
        s.loading = false;

        // Vì API trả về 1 product → đưa về dạng list 1 phần tử
        s.list = [a.payload];
        s.totalPages = 1;
      })
      .addCase(searchProductByCode.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
        s.list = [];
      });
  },
});

export default productSlice.reducer;
