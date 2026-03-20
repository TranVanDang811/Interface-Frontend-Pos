import axiosInstance from "@/services/axiosInstance";

export default {

  // Create discount
  createDiscount: (data) =>
    axiosInstance.post("/discounts", data)
      .then(res => res.data),

  // Update discount
  updateDiscount: (id, data) =>
    axiosInstance.put(`/discounts/${id}`, data)
      .then(res => res.data),

  // Delete discount
  deleteDiscount: (id) =>
    axiosInstance.delete(`/discounts/${id}`)
      .then(res => res.data),

  // Get discount by id
  getDiscountById: (id) =>
    axiosInstance.get(`/discounts/${id}`)
      .then(res => res.data),

  // Get all discounts
  getDiscounts: () =>
    axiosInstance.get("/discounts")
      .then(res => res.data),

  // Get active discounts
  getActiveDiscounts: () =>
    axiosInstance.get("/discounts/active")
      .then(res => res.data),

  // Get discount by code
  getDiscountByCode: (code) =>
    axiosInstance.get(`/discounts/code/${code}`)
      .then(res => res.data),
};