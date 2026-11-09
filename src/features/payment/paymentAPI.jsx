import axiosInstance from "@/services/axiosInstance";

export default {
  // Create payment
  createPayment: (data) =>
    axiosInstance.post("/payments", data).then((res) => res.data),

  getOrderById: (orderId) =>
    axiosInstance.get(`/orders/${orderId}`).then((res) => res.data),

  // Get payment by orderId
  getPaymentByOrder: (orderId) =>
    axiosInstance.get(`/payments/order/${orderId}`).then((res) => res.data),

  // Get payment by id
  getPaymentById: (paymentId) =>
    axiosInstance.get(`/payments/${paymentId}`).then((res) => res.data),

  // Get payments (pagination)
  getPayments: (params) =>
    axiosInstance.get("/payments", { params }).then((res) => res.data),

  // Get payment summary stats
  getPaymentSummary: (params) =>
    axiosInstance.get("/payments/summary", { params }).then((res) => res.data),

  // Refund payment
  refundItems: (paymentId, data) =>
    axiosInstance.post(`/payments/refund-items/${paymentId}`, data).then((res) => res.data),

  // Get refund history
  getRefundHistory: (paymentId) =>
    axiosInstance.get(`/payments/${paymentId}/refund-history`).then((res) => res.data),

  // Export invoice (PDF)
  exportInvoice: (paymentId) =>
    axiosInstance.get(`/payments/invoice-html/${paymentId}`).then((res) => res.data),

  // Get customer purchase history
  getCustomerPayments: (userId, page = 1, size = 10) =>
    axiosInstance
      .get(`/payments/customer/${userId}`, { params: { page, size } })
      .then((res) => res.data),

  // Get customer spending stats
  getCustomerStats: (userId) =>
    axiosInstance
      .get(`/payments/customer/${userId}/stats`)
      .then((res) => res.data),
};
