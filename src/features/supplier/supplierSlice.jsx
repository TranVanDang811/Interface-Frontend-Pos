import { createSlice } from "@reduxjs/toolkit";
import {
  fetchSuppliers,
  fetchSupplierSummary,
  searchSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
} from "./supplierThunks";

const initialState = {
  list: [],
  page: 0,
  size: 10,
  totalPages: 0,
  totalElements: 0,
  summary: null,
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
        s.list = a.payload.content || [];
        s.page = a.payload.number || 0;
        s.size = a.payload.size || 10;
        s.totalPages = a.payload.totalPages || 0;
        s.totalElements = a.payload.totalElements || 0;
      })
      .addCase(fetchSuppliers.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
      })

      // Summary
      .addCase(fetchSupplierSummary.fulfilled, (s, a) => {
        s.summary = a.payload;
      })

      // Search
      .addCase(searchSuppliers.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(searchSuppliers.fulfilled, (s, a) => {
        s.loading = false;
        s.list = a.payload.content || [];
        s.page = a.payload.number || 0;
        s.size = a.payload.size || 10;
        s.totalPages = a.payload.totalPages || 0;
        s.totalElements = a.payload.totalElements || 0;
      })
      .addCase(searchSuppliers.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
      })

      // Create
      .addCase(createSupplier.fulfilled, (s, a) => {
        s.list.unshift(a.payload);
        s.totalElements += 1;
      })

      // Update
      .addCase(updateSupplier.fulfilled, (s, a) => {
        const index = s.list.findIndex((i) => i.id === a.payload.id);
        if (index !== -1) s.list[index] = a.payload;
      })

      // Delete
      .addCase(deleteSupplier.fulfilled, (s, a) => {
        s.list = s.list.filter((i) => i.id !== a.payload);
        s.totalElements = Math.max(0, s.totalElements - 1);
      });
  },
});

export default supplierSlice.reducer;
