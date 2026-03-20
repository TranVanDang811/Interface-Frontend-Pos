import { createSlice } from "@reduxjs/toolkit";
import {
  fetchSuppliers,
  searchSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
} from "./supplierThunks";

const initialState = {
  list: [],
  page: 0,
  size: 5,
  totalPages: 0,
  totalElements: 0,
  loading: false,
  error: null,
};

const supplierSlice = createSlice({
  name: "supplier",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder

      // Fetch
      .addCase(fetchSuppliers.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(fetchSuppliers.fulfilled, (s, a) => {
        s.loading = false;
        s.list = a.payload.content;
        s.page = a.payload.number;
        s.totalPages = a.payload.totalPages;
        s.totalElements = a.payload.totalElements;
      })
      .addCase(fetchSuppliers.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
      })

      // Search
      .addCase(searchSuppliers.fulfilled, (s, a) => {
        s.list = a.payload.content;
        s.page = a.payload.number;
        s.totalPages = a.payload.totalPages;
        s.totalElements = a.payload.totalElements;
      })

      // Create
      .addCase(createSupplier.fulfilled, (s, a) => {
        s.list.unshift(a.payload);
      })

      // Update
      .addCase(updateSupplier.fulfilled, (s, a) => {
        const index = s.list.findIndex(i => i.id === a.payload.id);
        if (index !== -1) s.list[index] = a.payload;
      })

      // Delete
      .addCase(deleteSupplier.fulfilled, (s, a) => {
        s.list = s.list.filter(i => i.id !== a.payload);
      });
  },
});

export default supplierSlice.reducer;
