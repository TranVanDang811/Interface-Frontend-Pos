import axiosInstance from "../../services/axiosInstance";

export default {
  // Create
  createCategory: (payload) =>
    axiosInstance.post("/categories", payload)
      .then(res => res.data),

  // Get by id
  getCategoryById: (id) =>
    axiosInstance.get(`/categories/${id}`)
      .then(res => res.data),

  // Get all (pagination)
  getCategories: (page = 1, size = 5) =>
    axiosInstance.get("/categories", {
      params: { page, size },
    }).then(res => res.data),

  // Delete
  deleteCategory: (id) =>
    axiosInstance.delete(`/categories/${id}`)
      .then(res => res.data),
};
