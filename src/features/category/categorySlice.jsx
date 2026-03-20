import { createSlice } from "@reduxjs/toolkit";
import {
  fetchCategories,
  createCategory,
  deleteCategory,
} from "./categoryThunks";

const initialState = {
  list: [],
  page: 0,
  size: 5,
  totalPages: 0,
  totalElements: 0,
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

        s.list = pageData.content;
        s.page = pageData.number;
        s.size = pageData.size;
        s.totalPages = pageData.totalPages;
        s.totalElements = pageData.totalElements;
      })
      .addCase(fetchCategories.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload || a.error.message;
      })

      // Create
      .addCase(createCategory.fulfilled, (s, a) => {
        s.list.unshift(a.payload);
      })

      // Delete
      .addCase(deleteCategory.fulfilled, (s, a) => {
        s.list = s.list.filter(c => c.id !== a.payload);
      });
  },
});

export default categorySlice.reducer;
