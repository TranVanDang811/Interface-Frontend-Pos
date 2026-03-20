import { createSlice } from "@reduxjs/toolkit";
import {
  fetchUsers,
  deleteUser,
  changeUserStatus,
  updateUserRole,
  fetchMyInfo,
  fetchUserById,
  createUser,
  searchUsers,
  findUserByPhone,
  changePassword,
} from "./userThunks";

const initialState = {
  list: [],
  user: null,
  currentUser: null,
  selectedUser: null,
    customer: null,
  page: 0,
  size: 10,
  totalPages: 0,
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder

      // ================= FETCH USERS =================
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;

        const payload = action.payload;
        const data = payload.result || payload;

        state.list = data.content || [];
        state.page = data.number ?? 0;
        state.size = data.size ?? state.size;
        state.totalPages = data.totalPages ?? 0;
      })

      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })

      // ================= SEARCH USERS =================
      .addCase(searchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(searchUsers.fulfilled, (state, action) => {
        state.loading = false;

        const payload = action.payload;
        const data = payload.result || payload;

        state.list = data.content || [];
        state.page = data.number ?? 0;
        state.size = data.size ?? state.size;
        state.totalPages = data.totalPages ?? 0;
      })

      .addCase(searchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })

      // ================= DELETE USER =================
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.list = state.list.filter((u) => u.id !== action.payload);
      })

      // ================= CHANGE STATUS =================
      .addCase(changeUserStatus.fulfilled, (state, action) => {
        const updated = action.payload.result || action.payload;

        state.list = state.list.map((u) =>
          u.id === updated.id ? updated : u
        );
      })

      // ================= UPDATE ROLE =================
      .addCase(updateUserRole.fulfilled, (state, action) => {
        const updated = action.payload.result || action.payload;

        state.list = state.list.map((u) =>
          u.id === updated.id ? updated : u
        );
      })

      // ================= FETCH MY INFO =================
      .addCase(fetchMyInfo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchMyInfo.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload;
      })

      .addCase(fetchMyInfo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })

      // ================= FETCH USER BY ID =================
      .addCase(fetchUserById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedUser = action.payload;
      })

      .addCase(fetchUserById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })

      // ================= CREATE USER =================
      .addCase(createUser.pending, (state) => {
        state.loading = true;
      })

      .addCase(createUser.fulfilled, (state, action) => {
        state.loading = false;

        const newUser = action.payload.result || action.payload;
        state.list.unshift(newUser);
      })

      .addCase(createUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
     .addCase(findUserByPhone.fulfilled, (state, action) => {
        state.customer = action.payload.result || action.payload;
      })
      .addCase(changePassword.pending, (state) => {
  state.loading = true;
  state.error = null;
})

.addCase(changePassword.fulfilled, (state) => {
  state.loading = false;
})

.addCase(changePassword.rejected, (state, action) => {
  state.loading = false;
  state.error = action.payload || action.error.message;
})
      ;
  },
});

export default userSlice.reducer;