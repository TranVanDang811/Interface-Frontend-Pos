import axiosInstance from "@/services/axiosInstance";

const BASE_URL = "/import-orders";

const importOrderAPI = {

  // CREATE
  createImportOrder: (payload) =>
    axiosInstance.post(BASE_URL, payload)
      .then(res => res.data.result),

  // UPDATE
  updateImportOrder: (orderId, payload) =>
    axiosInstance.put(`${BASE_URL}/${orderId}`, payload)
      .then(res => res.data.result),

  // GET LIST
  getImportOrders: (params) =>
    axiosInstance.get(BASE_URL, { params })
      .then(res => res.data.result),

  // GET BY ID
  getById: (id) =>
    axiosInstance.get(`${BASE_URL}/${id}`)
      .then(res => res.data.result),

  // CONFIRM FINALIZE
  confirmImportOrder: (orderId) =>
    axiosInstance.put(`${BASE_URL}/${orderId}/confirm-finalize`)
      .then(res => res.data.result),

  // DELETE
  deleteImportOrder: (orderId) =>
    axiosInstance.delete(`${BASE_URL}/${orderId}`),

  // GET DETAILS
  getImportOrderDetails: (orderId, params) =>
    axiosInstance.get(`${BASE_URL}/${orderId}/details`, { params })
      .then(res => res.data.result),

  // GET DETAIL
  getImportOrderDetail: (orderId, detailId) =>
    axiosInstance.get(`${BASE_URL}/${orderId}/details/${detailId}`)
      .then(res => res.data.result),

  // UPDATE RECEIVED QUANTITY
  updateReceivedQuantity: (orderId, detailId, receivedQuantity) =>
    axiosInstance.patch(
      `${BASE_URL}/${orderId}/receive-detail/${detailId}`,
      null,
      { params: { receivedQuantity } }
    ).then(res => res.data.result),

  // STATISTICS
  getStatistics: (from, to) =>
    axiosInstance.get(`${BASE_URL}/statistics`, {
      params: { from, to }
    }).then(res => res.data.result),

  // EXPORT EXCEL
  exportExcel: () =>
    axiosInstance.get(`${BASE_URL}/export`, {
      responseType: "blob"
    }),
};

export default importOrderAPI;