import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Chip,
  Button,
} from "@material-tailwind/react";
import { useDispatch, useSelector } from "react-redux";
import {
  changeUserStatus,
  deleteUser,
  fetchUsers,
  searchUsers,
} from "@/features/user/userThunks";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { TrashIcon, XMarkIcon } from "@heroicons/react/24/solid";
import Pagination from "@/utils/Pagination";

export function Users() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [keyword, setKeyword] = useState("");
  const [selectedRole, setSelectedRole] = useState("ALL");

  const isAdminOrManager = user?.roles?.some(
    (role) => role.name === "ADMIN" || role.name === "MANAGE"
  );

  const { list, loading, page, totalPages } = useSelector(
    (state) => state.user
  );

  const getRolesFilter = (role) => {
    if (role === "ALL") return ["ADMIN", "MANAGE", "EMPLOYEE"];
    return [role];
  };

  // Load danh sách staff lần đầu hoặc khi đổi role filter
  useEffect(() => {
    if (keyword.trim()) {
      dispatch(
        searchUsers({
          keyword: keyword.trim(),
          roleName: selectedRole === "ALL" ? null : selectedRole,
          roles: getRolesFilter(selectedRole),
          page: 1,
          size: 10,
        })
      );
    } else {
      dispatch(
        fetchUsers({
          page: 1,
          size: 10,
          roles: getRolesFilter(selectedRole),
        })
      );
    }
  }, [dispatch, selectedRole]);

  // Pagination
  const handlePageChange = (newPage) => {
    if (keyword.trim()) {
      dispatch(
        searchUsers({
          keyword: keyword.trim(),
          roleName: selectedRole === "ALL" ? null : selectedRole,
          roles: getRolesFilter(selectedRole),
          page: newPage,
          size: 10,
        })
      );
    } else {
      dispatch(
        fetchUsers({
          page: newPage,
          size: 10,
          roles: getRolesFilter(selectedRole),
        })
      );
    }
  };

  // Search
  const handleSearch = () => {
    const key = keyword.trim();
    if (!key) {
      dispatch(
        fetchUsers({
          page: 1,
          size: 10,
          roles: getRolesFilter(selectedRole),
        })
      );
      return;
    }

    dispatch(
      searchUsers({
        keyword: key,
        roleName: selectedRole === "ALL" ? null : selectedRole,
        roles: getRolesFilter(selectedRole),
        page: 1,
        size: 10,
      })
    );
  };

  // Clear search
  const handleClearSearch = () => {
    setKeyword("");
    dispatch(
      fetchUsers({
        page: 1,
        size: 10,
        roles: getRolesFilter(selectedRole),
      })
    );
  };

  const handleDeleteUser = (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    dispatch(deleteUser(id));
  };

  const handleChangeStatus = (id, currentStatus) => {
    const newStatus = currentStatus === "active" ? "INACTIVE" : "ACTIVE";
    if (!window.confirm(`Change status to ${newStatus}?`)) return;
    dispatch(changeUserStatus({ id, status: newStatus }));
  };

  return (
    <div className="mt-12 mb-8 flex flex-col gap-12">
      <Card>
        {/* HEADER */}
        <CardHeader
          variant="gradient"
          color="gray"
          className="mb-8 p-6 flex flex-wrap justify-between items-center gap-4"
        >
          <div>
            <Typography variant="h6" color="white">
              Staff Management
            </Typography>
            <Typography variant="small" className="text-white/70">
              Quản lý tài khoản Admin, Quản lý (MANAGE) và Nhân viên (EMPLOYEE)
            </Typography>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* ROLE FILTER */}
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="px-3 py-2 rounded-lg bg-white/10 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/40 text-sm [&>option]:text-black cursor-pointer"
            >
              <option value="ALL">Tất cả vai trò</option>
              <option value="MANAGE">Quản lý (MANAGE)</option>
              <option value="EMPLOYEE">Nhân viên (EMPLOYEE)</option>
              <option value="ADMIN">Admin (ADMIN)</option>
            </select>

            {/* SEARCH */}
            <div className="relative w-64">
              <input
                type="text"
                placeholder="Tìm username / họ tên..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearch();
                }}
                className="w-full px-4 py-2 rounded-lg bg-white/10 text-white placeholder:text-white/60 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/40 text-sm transition"
              />

              {keyword && (
                <XMarkIcon
                  onClick={handleClearSearch}
                  className="h-4 w-4 absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-white/60 hover:text-red-400 transition"
                />
              )}
            </div>

            {isAdminOrManager && (
              <Button
                size="sm"
                color="green"
                onClick={() => navigate("/dashboard/users/create")}
                className="flex items-center gap-1"
              >
                + Add User
              </Button>
            )}
          </div>
        </CardHeader>

        {/* TABLE */}
        <CardBody className="px-0 pt-0 pb-2">
          {loading ? (
            <div className="p-6 text-center">
              <Typography>Loading...</Typography>
            </div>
          ) : (
            <>
              <table className="w-full min-w-[640px] table-auto">
                <thead>
                  <tr>
                    {["User", "Role", "Position / Shift", "Status", "Created At", ""].map(
                      (el) => (
                        <th
                          key={el}
                          className="border-b border-blue-gray-50 py-3 px-5 text-left"
                        >
                          <Typography
                            variant="small"
                            className="text-[11px] font-bold uppercase text-blue-gray-400"
                          >
                            {el}
                          </Typography>
                        </th>
                      )
                    )}
                  </tr>
                </thead>

                <tbody>
                  {list?.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-blue-gray-500">
                        Không tìm thấy người dùng nào phù hợp.
                      </td>
                    </tr>
                  ) : (
                    list?.map((u, key) => {
                      const className = `py-3 px-5 ${
                        key === list.length - 1
                          ? ""
                          : "border-b border-blue-gray-50"
                      }`;

                      return (
                        <tr key={u.id}>
                          {/* USER INFO */}
                          <td className={className}>
                            <div>
                              <p className="text-sm font-semibold text-blue-gray-800">
                                {u.fullName || u.username}
                              </p>
                              <p className="text-xs text-blue-gray-500">
                                @{u.username} {u.phone ? `• ${u.phone}` : ""}
                              </p>
                            </div>
                          </td>

                          {/* ROLES */}
                          <td className={className}>
                            <div className="flex flex-wrap gap-1">
                              {u.roles?.map((r) => (
                                <span
                                  key={r.name}
                                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                    r.name === "ADMIN"
                                      ? "bg-red-100 text-red-800 border border-red-200"
                                      : r.name === "MANAGE"
                                      ? "bg-purple-100 text-purple-800 border border-purple-200"
                                      : r.name === "EMPLOYEE"
                                      ? "bg-blue-100 text-blue-800 border border-blue-200"
                                      : "bg-gray-100 text-gray-800 border border-gray-200"
                                  }`}
                                >
                                  {r.name}
                                </span>
                              ))}
                            </div>
                          </td>

                          {/* POSITION / SHIFT */}
                          <td className={className}>
                            <p className="text-xs font-medium text-blue-gray-700">
                              {u.employeeProfile?.position || "—"}
                            </p>
                            {u.employeeProfile?.shift && (
                              <p className="text-[11px] text-blue-gray-500">
                                {u.employeeProfile.shift}
                              </p>
                            )}
                          </td>

                          {/* STATUS */}
                          <td className={className}>
                            <Chip
                              variant="gradient"
                              color={u.status === "active" ? "green" : "blue-gray"}
                              value={u.status === "active" ? "Active" : "Inactive"}
                              className="py-0.5 px-2 text-[11px] font-medium w-fit cursor-pointer"
                              onClick={() => handleChangeStatus(u.id, u.status)}
                            />
                          </td>

                          {/* CREATED AT */}
                          <td className={className}>
                            <p className="text-xs text-blue-gray-600">
                              {new Date(u.createdAt).toLocaleDateString()}
                            </p>
                          </td>

                          {/* ACTIONS */}
                          <td className={className}>
                            <div className="flex gap-3 items-center">
                              <p
                                onClick={() => navigate(`/dashboard/users/${u.id}`)}
                                className="text-xs font-semibold text-blue-600 cursor-pointer hover:text-blue-800"
                              >
                                View
                              </p>

                              {isAdminOrManager && (
                                <TrashIcon
                                  onClick={() => handleDeleteUser(u.id)}
                                  className="h-4 w-4 text-red-500 cursor-pointer hover:text-red-700"
                                />
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>

              {/* PAGINATION */}
              <Pagination
                page={page}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

export default Users;
