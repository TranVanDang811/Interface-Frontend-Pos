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
      if (product.stock != null && product.stock <= 0) {
        return;
      }

      const existing = state.items.find((i) => i.id === product.id);

      if (existing) {
        if (existing.stock != null && existing.quantity >= existing.stock) {
          return;
        }
        existing.quantity += 1;
      } else {
        state.items.push({
          id: product.id,
          productCode: product.productCode,
          name: product.name,
          price: product.price,
          image: product.imageUrl,
          stock: product.stock,
          quantity: 1,
        });
      }
    },

    changeQuantity: (state, action) => {
      const { id, delta } = action.payload;

      const item = state.items.find((i) => i.id === id);

      if (item) {
        if (delta > 0 && item.stock != null && item.quantity >= item.stock) {
          return;
        }
        item.quantity += delta;

        if (item.quantity <= 0) {
          state.items = state.items.filter((i) => i.id !== id);
        }
      }
    },

    setQuantity: (state, action) => {
      const { id, quantity } = action.payload;
      const num = parseInt(quantity, 10);
      const item = state.items.find((i) => i.id === id);

      if (item) {
        if (isNaN(num) || num <= 0) {
          state.items = state.items.filter((i) => i.id !== id);
        } else {
          const maxStock = item.stock != null ? item.stock : Infinity;
          item.quantity = Math.min(num, maxStock);
        }
      }
    },

    removeItem: (state, action) => {
      const id = action.payload;
      state.items = state.items.filter((i) => i.id !== id);
    },

    clearCart: (state) => {
      state.items = [];
    },

    setCart: (state, action) => {
      state.items = Array.isArray(action.payload) ? action.payload : [];
    },
  },
});

export const {
  addItem,
  changeQuantity,
  setQuantity,
  removeItem,
  clearCart,
  setCart,
} = posCartSlice.actions;

export default posCartSlice.reducer;
