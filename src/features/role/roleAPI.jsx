import axiosInstance from "../../services/axiosInstance";

export default {

  // Get roles (pagination)
  getRoles: (page = 1, size = 5) =>
    axiosInstance
      .get("/roles", { params: { page, size } })
      .then(res => res.data),

  // Create role
  createRole: (data) =>
    axiosInstance
      .post("/roles", data)
      .then(res => res.data),

  // Delete role
  deleteRole: (role) =>
    axiosInstance
      .delete(`/roles/${role}`)
      .then(res => res.data),
};