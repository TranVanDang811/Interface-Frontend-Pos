import axiosInstance from "../../services/axiosInstance";

export default {
  // Create product (multipart: product JSON + images)
createProduct: (formData) => {
  return axiosInstance.post("/products", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  }).then(res => res.data);
},

  // Get products (pagination)
  getProducts: (page = 1, size = 5) =>
    axiosInstance.get("/products", { params: { page, size } })
      .then(res => res.data),

  // Filter products
  filterProducts: (params) =>
    axiosInstance.get("/products/filter", { params })
      .then(res => res.data),

  // Get product by code
  getProductByCode: (productCode) =>
    axiosInstance.get(`/products/${productCode}`)
      .then(res => res.data), 

  // Delete product
  deleteProduct: (id) =>
    axiosInstance.delete(`/products/${id}`)
      .then(res => res.data),

  // Change product status
  changeStatus: (id, status) =>
    axiosInstance.patch(`/products/${id}`, null, {
      params: { status },
    }).then(res => res.data),

  // Statistics
  getStatistics: () =>
    axiosInstance.get("/products/statistics")
      .then(res => res.data),

      // Get products by supplier
getProductsBySupplier: (supplierId) =>
  axiosInstance.get(`/products/by-supplier/${supplierId}`)
    .then(res => res.data),
};

