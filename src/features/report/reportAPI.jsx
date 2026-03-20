import axiosInstance from "@/services/axiosInstance";

export default {

  // Daily report
  getDailyReport: (date) =>
    axiosInstance.get("/reports/daily", {
      params: { date }
    }).then(res => res.data),

  // Monthly report
  getMonthlyReport: (month) =>
    axiosInstance.get("/reports/monthly", {
      params: { month }
    }).then(res => res.data),

  // Dashboard report
  getDashboardReport: () =>
    axiosInstance.get("/reports/dashboard")
      .then(res => res.data),
};