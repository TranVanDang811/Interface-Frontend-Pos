import axiosInstance from "../../services/axiosInstance";

export default {
  createUser: (payload) =>
    axiosInstance.post("/users", payload).then((res) => res.data),

  getUsers: ({ page = 1, size = 10, roles, role } = {}) => {
    const params = new URLSearchParams();
    params.append("page", page);
    params.append("size", size);

    // roles = array (Users page)
    if (roles?.length) {
      roles.forEach((r) => params.append("roles", r));
    }
    // role = string (Customers page)
    else if (role) {
      params.append("roles", role);
    }

    return axiosInstance.get("/users", { params }).then((res) => res.data);
  },

  getUserById: (id) =>
    axiosInstance.get(`/users/${id}`).then((res) => res.data),

  getMyInfo: () =>
    axiosInstance.get("/users/myInfo").then((res) => res.data),

  searchUsers: (params = {}) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val === undefined || val === null || val === "") return;
      if (Array.isArray(val)) {
        val.forEach((item) => searchParams.append(key, item));
      } else {
        searchParams.append(key, val);
      }
    });
    return axiosInstance
      .get("/users/search", { params: searchParams })
      .then((res) => res.data);
  },

  deleteUser: (id) =>
    axiosInstance.delete(`/users/${id}`).then((res) => res.data),

  changeStatus: (id, status) =>
    axiosInstance
      .patch(`/users/${id}`, null, { params: { status } })
      .then((res) => res.data),

  updateRole: (id, roleName) =>
    axiosInstance
      .patch(`/users/${id}/role`, null, { params: { roleName } })
      .then((res) => res.data),

  changePassword: (id, payload) =>
    axiosInstance
      .patch(`/users/${id}/change-password`, payload)
      .then((res) => res.data),

  updateUser: (id, payload) =>
    axiosInstance.put(`/users/${id}`, payload).then((res) => res.data),

  getUserByPhone: (phone) =>
    axiosInstance.get(`/users/phone/${phone}`).then((res) => res.data),
};
