import { createSlice } from "@reduxjs/toolkit";
import {
  fetchCategories,
  fetchCategorySummary,
  createCategory,
  updateCategory,
  deleteCategory,
} from "./categoryThunks";

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

const categorySlice = createSlice({
  name: "category",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchCategories.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(fetchCategories.fulfilled, (s, a) => {
        s.loading = false;
        const pageData = a.payload;
        s.list = pageData.content || [];
        s.page = pageData.number || 0;
        s.size = pageData.size || 10;
        s.totalPages = pageData.totalPages || 0;
        s.totalElements = pageData.totalElements || 0;
      })
      .addCase(fetchCategories.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload || a.error.message;
      })

      // Summary
      .addCase(fetchCategorySummary.fulfilled, (s, a) => {
        s.summary = a.payload;
      })

      // Create
      .addCase(createCategory.fulfilled, (s, a) => {
        s.list.unshift(a.payload);
        s.totalElements += 1;
      })

      // Update
      .addCase(updateCategory.fulfilled, (s, a) => {
        const index = s.list.findIndex(c => c.id === a.payload.id);
        if (index !== -1) {
          s.list[index] = a.payload;
        }
      })

      // Delete
      .addCase(deleteCategory.fulfilled, (s, a) => {
        s.list = s.list.filter(c => c.id !== a.payload);
        s.totalElements = Math.max(0, s.totalElements - 1);
      });
  },
});

export default categorySlice.reducer;
