import { createAsyncThunk } from "@reduxjs/toolkit";
import productAPI from "./productAPI";

// Fetch products
export const fetchProducts = createAsyncThunk(
  "product/fetchProducts",
  async (params = {}, { rejectWithValue }) => {
    try {
      let res;

      // nếu có filter → gọi API filter
      if (
        params.productCode ||
        params.keyword ||
        params.categoryName ||
        params.status ||
        params.price
      ) {
        res = await productAPI.filterProducts(params);
      } else {
        const { page = 1, size = 5 } = params;
        res = await productAPI.getProducts(page, size);
      }

      return res.result || res;
    } catch (e) {
      return rejectWithValue(e.response?.data || e.message);
    }
  }
);

// Create product

export const createProduct = createAsyncThunk(
  "product/create",
  async ({ product, image }, { rejectWithValue }) => {
    try {
      const formData = new FormData();

          formData.append("product", JSON.stringify(product));

      if (image) {
        formData.append("images", image);
      }

      return await productAPI.createProduct(formData);
    } catch (error) {
      return rejectWithValue(error.response?.data || "Create failed");
    }
  }
);


// Delete product
export const deleteProduct = createAsyncThunk(
  "product/deleteProduct",
  async (id, { rejectWithValue }) => {
    try {
      await productAPI.deleteProduct(id);
      return id;
    } catch (e) {
      return rejectWithValue(e.response?.data || e.message);
    }
  }
);

// Change status
export const changeProductStatus = createAsyncThunk(
  "product/changeStatus",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const res = await productAPI.changeStatus(id, status);
      return res.result || res;
    } catch (e) {
      return rejectWithValue(e.response?.data || e.message);
    }
  }
);

// Filter products
export const filterProducts = createAsyncThunk(
  "product/filterProducts",
  async (params, { rejectWithValue }) => {
    try {
      const res = await productAPI.filterProducts(params);
      return res.result || res;
    } catch (e) {
      return rejectWithValue(e.response?.data || e.message);
    }
  }
);

// Statistics
export const fetchProductStatistics = createAsyncThunk(
  "product/statistics",
  async (_, { rejectWithValue }) => {
    try {
      const res = await productAPI.getStatistics();
      return res.result || res;
    } catch (e) {
      return rejectWithValue(e.response?.data || e.message);
    }
  }
);

// Search by productCode
export const searchProductByCode = createAsyncThunk(
  "product/searchByCode",
  async (productCode, { rejectWithValue }) => {
    try {
      const res = await productAPI.getProductByCode(productCode);
      return res.result || res;
    } catch (e) {
      return rejectWithValue(e.response?.data || e.message);
    }
  }

);

export const fetchProductsBySupplier = createAsyncThunk(
  "product/fetchBySupplier",
  async (supplierId, { rejectWithValue }) => {
    try {
      const res = await productAPI.getProductsBySupplier(supplierId);
      return res.result || res;
    } catch (e) {
      return rejectWithValue(e.response?.data || e.message);
    }
  }
);
