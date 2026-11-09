import axiosInstance from "@/services/axiosInstance";

const BASE_URL = "/suppliers";

export default {
  // Create
  createSupplier: (payload) =>
    axiosInstance.post(BASE_URL, payload).then((res) => res.data),

  // Get all with optional search & pagination
  getSuppliers: (params = {}) => {
    const { page = 1, size = 10, keyword = "" } =
      typeof params === "object" ? params : { page: params };
    return axiosInstance
      .get(BASE_URL, {
        params: {
          page,
          size,
          ...(keyword ? { keyword } : {}),
        },
      })
      .then((res) => res.data);
  },

  // Get summary KPIs
  getSummary: () =>
    axiosInstance.get(`${BASE_URL}/summary`).then((res) => res.data),

  // Search by keyword (name, phone, email)
  searchSuppliers: (keyword, page = 1, size = 10) =>
    axiosInstance
      .get(`${BASE_URL}/search`, {
        params: { keyword, page, size },
      })
      .then((res) => res.data),

  // Get by id
  getSupplierById: (id) =>
    axiosInstance.get(`${BASE_URL}/${id}`).then((res) => res.data),

  // Update
  updateSupplier: (id, payload) =>
    axiosInstance.put(`${BASE_URL}/${id}`, payload).then((res) => res.data),

  // Delete
  deleteSupplier: (id) =>
    axiosInstance.delete(`${BASE_URL}/${id}`).then((res) => res.data),
};
