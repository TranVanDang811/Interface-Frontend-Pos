import axiosInstance from "@/services/axiosInstance";

const BASE_URL = "/suppliers";

export default {

  // Create
  createSupplier: (payload) =>
    axiosInstance.post(BASE_URL, payload)
      .then(res => res.data),

  // Get all (pagination)
  getSuppliers: (page = 1, size = 5) =>
    axiosInstance.get(BASE_URL, {
      params: { page, size },
    }).then(res => res.data),

  // Search by name
  searchSuppliers: (keyword, page = 1, size = 5) =>
    axiosInstance.get(`${BASE_URL}/search`, {
      params: { keyword, page, size },
    }).then(res => res.data),

  // Get by id
  getSupplierById: (id) =>
    axiosInstance.get(`${BASE_URL}/${id}`)
      .then(res => res.data),

  // Update
  updateSupplier: (id, payload) =>
    axiosInstance.put(`${BASE_URL}/${id}`, payload)
      .then(res => res.data),

  // Delete
  deleteSupplier: (id) =>
    axiosInstance.delete(`${BASE_URL}/${id}`)
      .then(res => res.data),
};
