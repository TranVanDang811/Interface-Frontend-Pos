import axiosInstance from "../../services/axiosInstance";

export default {
  createUser: (payload) => axiosInstance.post("/users", payload).then(res => res.data),

  getUsers: ({ page = 0, size = 10, role } = {}) =>
  axiosInstance
    .get("/users", {
      params: { page, size, role },
    })
    .then((res) => res.data),

  getUserById: (id) =>
    axiosInstance.get(`/users/${id}`).then(res => res.data),

  getMyInfo: () =>
    axiosInstance.get("/users/myInfo").then(res => res.data),

  searchUsers: (params) =>
    axiosInstance.get("/users/search", { params }).then(res => res.data),

  deleteUser: (id) =>
    axiosInstance.delete(`/users/${id}`).then(res => res.data),

  changeStatus: (id, status) =>
    axiosInstance.patch(`/users/${id}`, null, { params: { status } }).then(res => res.data),

  updateRole: (id, roleName) =>
    axiosInstance.patch(`/users/${id}/role`, null, { params: { roleName } }).then(res => res.data),

  changePassword: (id, payload) =>
    axiosInstance.patch(`/users/${id}/change-password`, payload).then(res => res.data),

  updateUser: (id, payload) =>
    axiosInstance.put(`/users/${id}`, payload).then(res => res.data),

  getUserByPhone: (phone) =>
  axiosInstance.get(`/users/phone/${phone}`).then(res => res.data),
};