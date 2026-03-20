import axiosInstance from "@/services/axiosInstance";

export default {

  // Open shift
  openShift: (data) =>
    axiosInstance.post("/shifts/open", data)
      .then(res => res.data),

  // Close shift
  closeShift: (data) =>
    axiosInstance.post("/shifts/close", data)
      .then(res => res.data),

  // Get current shift
  getCurrentShift: () =>
    axiosInstance.get("/shifts/current")
      .then(res => res.data),

  // Get shift report (NOTE: API này không có ApiResponse wrapper)
  getShiftReport: () =>
    axiosInstance.get("/shifts/report")
      .then(res => res.data),
};