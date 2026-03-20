import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  items: [],
};

const posCartSlice = createSlice({
  name: "posCart",
  initialState,
  reducers: {

    addItem: (state, action) => {
      const product = action.payload;

      const existing = state.items.find(i => i.id === product.id);

      if (existing) {
        existing.quantity += 1;
      } else {
        state.items.push({
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.imageUrl,
          quantity: 1
        });
      }
    },

    changeQuantity: (state, action) => {
      const { id, delta } = action.payload;

      const item = state.items.find(i => i.id === id);

      if (item) {
        item.quantity += delta;

        if (item.quantity <= 0) {
          state.items = state.items.filter(i => i.id !== id);
        }
      }
    },

    removeItem: (state, action) => {
      const id = action.payload;

      state.items = state.items.filter(i => i.id !== id);
    },

    clearCart: (state) => {
      state.items = [];
    }

  }
});

export const {
  addItem,
  changeQuantity,
  removeItem,
  clearCart
} = posCartSlice.actions;

export default posCartSlice.reducer;