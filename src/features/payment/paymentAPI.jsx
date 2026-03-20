import axiosInstance from "@/services/axiosInstance";

export default {

  // Create payment
  createPayment: (data) =>
    axiosInstance.post("/payments", data)
      .then(res => res.data),

  // Get payment by orderId
  getPaymentByOrder: (orderId) =>
    axiosInstance.get(`/payments/order/${orderId}`)
      .then(res => res.data),

  // Get payment by id
  getPaymentById: (paymentId) =>
    axiosInstance.get(`/payments/${paymentId}`)
      .then(res => res.data),

  // Get payments (pagination)
  getPayments: (page = 1, size = 5) =>
    axiosInstance.get("/payments", { params: { page, size } })
      .then(res => res.data),

  // Refund payment
  refundPayment: (paymentId, data) =>
    axiosInstance.post(`/payments/${paymentId}/refund`, data)
      .then(res => res.data),

  // Get refund history
  getRefundHistory: (paymentId) =>
    axiosInstance.get(`/payments/${paymentId}/refund-history`)
      .then(res => res.data),

  // Export invoice (PDF)
exportInvoice: (paymentId) =>
  axiosInstance
    .get(`/payments/invoice/${paymentId}`, {
      responseType: "blob",
    })
    .then((res) => res.data),
};