  import axiosInstance from "@/services/axiosInstance";

  export default {

    // Create order
    createOrder: (data) =>
      axiosInstance.post("/orders", data)
        .then(res => res.data),

    // Get orders (pagination)
    getOrders: (page = 1, size = 5) =>
      axiosInstance.get("/orders", { params: { page, size } })
        .then(res => res.data),

    // Get order by id
    getOrderById: (orderId) =>
      axiosInstance.get(`/orders/${orderId}`)
        .then(res => res.data),

    // Delete order
    deleteOrder: (orderId) =>
      axiosInstance.delete(`/orders/${orderId}`)
        .then(res => res.data),

    // Filter orders
    filterOrders: (params) =>
      axiosInstance.get("/orders/filter", { params })
        .then(res => res.data),

    // Revenue statistics
    getRevenue: (params) =>
      axiosInstance.get("/orders/revenue", { params })
        .then(res => res.data),

    // HOLD order
    holdOrder: (orderId) =>
      axiosInstance.put(`/orders/${orderId}/hold`)
        .then(res => res.data),

    // Update order (suspend/edit)
    updateOrder: (orderId, data) =>
      axiosInstance.put(`/orders/${orderId}/update`, data)
        .then(res => res.data),

    // Get orders by status
    getOrdersByStatus: (status, page = 1, size = 5) =>
      axiosInstance.get(`/orders/status/${status}`, { params: { page, size } })
        .then(res => res.data),
  };