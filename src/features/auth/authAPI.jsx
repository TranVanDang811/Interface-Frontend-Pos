import axiosInstance from "../../services/axiosInstance";

export default {
  login: (payload) =>
    axiosInstance.post("/auth/token", payload).then(res => res.data),
  refresh: (payload) =>
    axiosInstance.post("/auth/refresh", payload).then(res => res.data),
  introspect: (payload) =>
    axiosInstance.post("/auth/introspect", payload).then(res => res.data),
  logout: (payload) =>
    axiosInstance.post("/auth/logout", payload).then(res => res.data),
};
