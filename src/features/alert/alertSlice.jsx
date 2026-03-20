import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  open: false,
  message: "",
  type: "green",
};

const alertSlice = createSlice({
  name: "alert",
  initialState,
  reducers: {
    showAlert: (state, action) => {
      state.open = true;
      state.message = action.payload.message;
      state.type = action.payload.type || "green";
    },
    hideAlert: (state) => {
      state.open = false;
      state.message = "";
    },
  },
});

export const { showAlert, hideAlert } = alertSlice.actions;
export default alertSlice.reducer;