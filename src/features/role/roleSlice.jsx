import { createSlice } from "@reduxjs/toolkit";
import { fetchRoles, createRole, deleteRole } from "./roleThunks";

const initialState = {
  list: [],
  page: 0,
  totalPages: 0,
  size: 5,
  loading: false,
  error: null,
};

const roleSlice = createSlice({
  name: "role",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder

      // FETCH
      .addCase(fetchRoles.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchRoles.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload;

        state.list = payload.content || payload;
        state.page = payload.number || 0;
        state.totalPages = payload.totalPages || 0;
      })
      .addCase(fetchRoles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // CREATE
      .addCase(createRole.fulfilled, (state) => {
        state.loading = false;
      })

      // DELETE
      .addCase(deleteRole.fulfilled, (state, action) => {
        state.list = state.list.filter(r => r.name !== action.payload);
      });
  },
});

export default roleSlice.reducer;