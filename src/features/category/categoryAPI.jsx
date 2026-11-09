import axiosInstance from "../../services/axiosInstance";

export default {
  // Create
  createCategory: (payload) =>
    axiosInstance.post("/categories", payload)
      .then(res => res.data),

  // Update
  updateCategory: (id, payload) =>
    axiosInstance.put(`/categories/${id}`, payload)
      .then(res => res.data),

  // Get by id
  getCategoryById: (id) =>
    axiosInstance.get(`/categories/${id}`)
      .then(res => res.data),

  // Get summary KPIs
  getSummary: () =>
    axiosInstance.get("/categories/summary")
      .then(res => res.data),

  // Get all (pagination & search)
  getCategories: (params = {}) => {
    const { page = 1, size = 10, keyword = "" } = typeof params === "object" ? params : { page: params };
    return axiosInstance.get("/categories", {
      params: { 
        page, 
        size, 
        ...(keyword ? { keyword } : {}) 
      },
    }).then(res => res.data);
  },

  // Delete
  deleteCategory: (id) =>
    axiosInstance.delete(`/categories/${id}`)
      .then(res => res.data),
};
