import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Chip,
  Button,
  Avatar,
} from "@material-tailwind/react";

import { useDispatch, useSelector } from "react-redux";
import { fetchUsers, searchUsers, createUser } from "@/features/user/userThunks";
import { showAlert } from "@/features/alert/alertSlice";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  XMarkIcon,
  UserPlusIcon,
  FunnelIcon,
  ArrowPathIcon,
  ShoppingBagIcon,
  SparklesIcon,
} from "@heroicons/react/24/solid";
import { formatDate } from "@/utils/dateUtils";
import Pagination from "@/utils/Pagination";

export function Customers() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [keyword, setKeyword] = useState("");
  const [membershipFilter, setMembershipFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Add customer modal state
  const [openAddModal, setOpenAddModal] = useState(false);
  const [addForm, setAddForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    loyaltyPoints: "0",
    membershipLevel: "NONE",
  });
  const [submittingAdd, setSubmittingAdd] = useState(false);

  const { list, loading, page, totalPages } = useSelector(
    (state) => state.user
  );

  // ================= LOAD FIRST =================
  useEffect(() => {
    loadCustomers(1);
  }, [dispatch]);

  const loadCustomers = (pageIndex = 1) => {
    const key = keyword.trim();
    if (key) {
      dispatch(
        searchUsers({
          keyword: key,
          page: pageIndex,
          size: 5,
          roleName: "CUSTOMER",
          roles: ["CUSTOMER"],
        })
      );
    } else {
      dispatch(
        fetchUsers({
          page: pageIndex,
          size: 5,
          roles: ["CUSTOMER"],
        })
      );
    }
  };

  // ================= PAGINATION =================
  const handlePageChange = (newPage) => {
    loadCustomers(newPage);
  };

  // ================= SEARCH =================
  const handleSearch = (e) => {
    e?.preventDefault();
    loadCustomers(1);
  };

  // ================= CLEAR SEARCH =================
  const handleClearSearch = () => {
    setKeyword("");
    setMembershipFilter("");
    setStatusFilter("");
    dispatch(
      fetchUsers({
        page: 1,
        size: 5,
        roles: ["CUSTOMER"],
      })
    );
  };

  // ================= HANDLE ADD CUSTOMER =================
  const handleAddCustomerSubmit = async () => {
    if (!addForm.fullName.trim()) {
      alert("Vui lòng nhập họ và tên khách hàng");
      return;
    }
    if (!addForm.phone.trim()) {
      alert("Vui lòng nhập số điện thoại");
      return;
    }

    setSubmittingAdd(true);

    const payload = {
      username: addForm.phone.trim(),
      password: "Customer@" + addForm.phone.trim().slice(-4),
      email: addForm.email?.trim() || null,
      fullName: addForm.fullName.trim(),
      phone: addForm.phone.trim(),
      status: "ACTIVE",
      roles: ["CUSTOMER"],
      customerProfile: {
        loyaltyPoints: Number(addForm.loyaltyPoints) || 0,
        membershipLevel: addForm.membershipLevel || "NONE",
      },
    };

    try {
      const res = await dispatch(createUser(payload));
      if (createUser.fulfilled.match(res)) {
        dispatch(
          showAlert({
            message: "Tạo khách hàng mới thành công!",
            type: "green",
          })
        );
        setOpenAddModal(false);
        setAddForm({
          fullName: "",
          phone: "",
          email: "",
          loyaltyPoints: "0",
          membershipLevel: "NONE",
        });
        loadCustomers(1);
      } else {
        alert(res.payload?.message || "Số điện thoại đã tồn tại trong hệ thống");
      }
    } catch (e) {
      alert("Có lỗi xảy ra khi tạo khách hàng");
    } finally {
      setSubmittingAdd(false);
    }
  };

  // Lọc client-side cho membership hoặc status nếu cần
  const filteredList = (list || []).filter((user) => {
    if (membershipFilter) {
      const level = (user.customerProfile?.membershipLevel || "NONE").toUpperCase();
      if (level !== membershipFilter.toUpperCase()) return false;
    }
    if (statusFilter) {
      const s = String(user.status || "").toUpperCase();
      if (s !== statusFilter.toUpperCase()) return false;
    }
    return true;
  });

  const getMembershipBadge = (level) => {
    const l = (level || "NONE").toUpperCase();
    switch (l) {
      case "PLATINUM":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
            <SparklesIcon className="h-3 w-3" /> Platinum
          </span>
        );
      case "GOLD":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
            ★ Gold
          </span>
        );
      case "SILVER":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-gray-200 text-gray-800 border border-gray-300">
            Silver
          </span>
        );
      case "BRONZE":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 border border-orange-200">
            Bronze
          </span>
        );
      default:
        return (
          <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-gray-100 text-gray-600">
            Thường
          </span>
        );
    }
  };

  return (
    <div className="mt-8 mb-8 flex flex-col gap-6">
      <Card className="border border-blue-gray-100 shadow-sm">
        {/* HEADER */}
        <CardHeader
          variant="gradient"
          color="gray"
          className="mb-4 p-6 flex flex-wrap items-center justify-between gap-4"
        >
          <div>
            <Typography variant="h5" color="white" className="font-bold">
              Lịch Sử & Quản Lý Khách Hàng (Customers History)
            </Typography>
            <Typography variant="small" color="white" className="opacity-80 mt-1">
              Theo dõi danh sách hội viên, tích điểm, phân hạng thành viên và tra cứu toàn bộ lịch sử mua sắm
            </Typography>
          </div>

          <Button
            size="sm"
            color="green"
            className="flex items-center gap-2 shadow-sm font-semibold"
            onClick={() => setOpenAddModal(true)}
          >
            <UserPlusIcon className="h-4 w-4" />
            + Thêm Khách Hàng
          </Button>
        </CardHeader>

        {/* BỘ LỌC TÌM KIẾM */}
        <div className="px-6 py-3 border-b border-gray-100 flex flex-wrap items-end gap-3 bg-gray-50/50">
          <div className="flex flex-col flex-1 min-w-[220px]">
            <Typography variant="small" className="text-xs font-semibold text-gray-700 mb-1">
              Tìm kiếm khách hàng
            </Typography>
            <div className="relative">
              <input
                type="text"
                placeholder="Nhập tên hoặc số điện thoại..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearch();
                }}
                className="w-full h-9 pl-3 pr-8 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              />
              {keyword && (
                <XMarkIcon
                  onClick={handleClearSearch}
                  className="h-4 w-4 absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-red-500"
                />
              )}
            </div>
          </div>

          {/* Lọc theo hạng thành viên */}
          <div className="flex flex-col min-w-[160px]">
            <Typography variant="small" className="text-xs font-semibold text-gray-700 mb-1">
              Hạng thành viên
            </Typography>
            <select
              value={membershipFilter}
              onChange={(e) => setMembershipFilter(e.target.value)}
              className="h-9 px-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">Tất cả hạng</option>
              <option value="NONE">Khách thường</option>
              <option value="BRONZE">Bronze (Đồng)</option>
              <option value="SILVER">Silver (Bạc)</option>
              <option value="GOLD">Gold (Vàng)</option>
              <option value="PLATINUM">Platinum (Bạch Kim)</option>
            </select>
          </div>

          {/* Lọc theo trạng thái */}
          <div className="flex flex-col min-w-[150px]">
            <Typography variant="small" className="text-xs font-semibold text-gray-700 mb-1">
              Trạng thái
            </Typography>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 px-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="ACTIVE">Đang hoạt động</option>
              <option value="INACTIVE">Tạm khóa</option>
            </select>
          </div>

          <Button
            size="sm"
            color="blue"
            className="h-9 px-4 flex items-center gap-1 font-semibold"
            onClick={handleSearch}
          >
            <FunnelIcon className="h-3.5 w-3.5" />
            Lọc
          </Button>

          <Button
            size="sm"
            variant="outlined"
            className="h-9 px-4 flex items-center gap-1"
            onClick={handleClearSearch}
          >
            <ArrowPathIcon className="h-3.5 w-3.5" />
            Làm mới
          </Button>
        </div>

        {/* TABLE */}
        <CardBody className="overflow-x-auto px-0 pt-0 pb-2">
          {loading ? (
            <div className="p-12 text-center text-gray-500 flex flex-col items-center gap-2">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
              <Typography>Đang tải danh sách khách hàng...</Typography>
            </div>
          ) : !filteredList || filteredList.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              <Typography>Không tìm thấy khách hàng nào phù hợp với bộ lọc.</Typography>
            </div>
          ) : (
            <>
              <table className="w-full min-w-[700px] table-auto text-left">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-200">
                    {[
                      "Khách hàng",
                      "Trạng thái",
                      "Điểm tích lũy",
                      "Hạng thành viên",
                      "Ngày đăng ký",
                      "Thao tác",
                    ].map((el) => (
                      <th
                        key={el}
                        className="py-3 px-5 text-xs font-bold uppercase text-gray-600"
                      >
                        {el}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {filteredList.map((user) => {
                    const isActive = String(user.status || "").toUpperCase() === "ACTIVE";

                    return (
                      <tr key={user.id} className="hover:bg-blue-gray-50/50 transition">
                        {/* KHÁCH HÀNG */}
                        <td className="py-3 px-5">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-sm border border-blue-100">
                              {(user.fullName || "K").charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-gray-900">
                                {user.fullName || "Chưa đặt tên"}
                              </p>
                              <p className="text-xs text-blue-600 font-medium">
                                {user.phone || "—"}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* STATUS (Đã sửa lỗi so sánh chữ hoa/thường) */}
                        <td className="py-3 px-5">
                          <Chip
                            variant="gradient"
                            size="sm"
                            color={isActive ? "green" : "blue-gray"}
                            value={isActive ? "Hoạt động" : "Tạm khóa"}
                            className="py-0.5 px-2 text-[10px] font-semibold w-fit"
                          />
                        </td>

                        {/* POINT */}
                        <td className="py-3 px-5">
                          <Chip
                            value={`${(user.customerProfile?.loyaltyPoints || 0).toLocaleString()} điểm`}
                            color="amber"
                            variant="gradient"
                            size="sm"
                            className="py-0.5 px-3 text-xs font-bold w-fit"
                          />
                        </td>

                        {/* MEMBERSHIP */}
                        <td className="py-3 px-5">
                          {getMembershipBadge(user.customerProfile?.membershipLevel)}
                        </td>

                        {/* CREATED */}
                        <td className="py-3 px-5">
                          <p className="text-xs text-gray-600">
                            {formatDate(user.createdAt)}
                          </p>
                        </td>

                        {/* ACTION */}
                        <td className="py-3 px-5">
                          <Button
                            size="sm"
                            color="blue"
                            variant="outlined"
                            className="text-xs px-3 py-1.5 flex items-center gap-1.5 font-semibold"
                            onClick={() =>
                              navigate(`/dashboard/customers-history/${user.id}`)
                            }
                            title="Xem hồ sơ và lịch sử đơn hàng của khách"
                          >
                            <ShoppingBagIcon className="h-3.5 w-3.5" />
                            Lịch sử mua hàng
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* PAGINATION */}
              <div className="mt-4 px-4">
                <Pagination
                  page={page}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            </>
          )}
        </CardBody>
      </Card>

      {/* ================= MODAL THÊM KHÁCH HÀNG MỚI ================= */}
      {openAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fade-in my-8 border border-gray-100">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <div>
                <Typography variant="h6" className="font-bold text-gray-900">
                  Thêm Khách Hàng Mới
                </Typography>
                <Typography variant="small" className="text-gray-500 text-xs">
                  Tạo tài khoản hội viên để tích điểm và áp dụng ưu đãi
                </Typography>
              </div>
              <button
                onClick={() => setOpenAddModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3.5 py-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Họ và tên *
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Nguyễn Văn A"
                  value={addForm.fullName}
                  onChange={(e) => setAddForm({ ...addForm, fullName: e.target.value })}
                  className="w-full h-9 px-3 border rounded-lg focus:outline-blue-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Số điện thoại *
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: 0987654321"
                  value={addForm.phone}
                  onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
                  className="w-full h-9 px-3 border rounded-lg focus:outline-blue-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Email (tùy chọn)
                </label>
                <input
                  type="email"
                  placeholder="khachhang@example.com"
                  value={addForm.email}
                  onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                  className="w-full h-9 px-3 border rounded-lg focus:outline-blue-500 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Điểm ban đầu
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={addForm.loyaltyPoints}
                    onChange={(e) => setAddForm({ ...addForm, loyaltyPoints: e.target.value })}
                    className="w-full h-9 px-3 border rounded-lg focus:outline-blue-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Hạng thành viên
                  </label>
                  <select
                    value={addForm.membershipLevel}
                    onChange={(e) => setAddForm({ ...addForm, membershipLevel: e.target.value })}
                    className="w-full h-9 px-3 border rounded-lg focus:outline-blue-500 text-sm bg-white"
                  >
                    <option value="NONE">Thường</option>
                    <option value="BRONZE">Bronze</option>
                    <option value="SILVER">Silver</option>
                    <option value="GOLD">Gold</option>
                    <option value="PLATINUM">Platinum</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
              <Button
                variant="outlined"
                color="gray"
                size="sm"
                onClick={() => setOpenAddModal(false)}
                disabled={submittingAdd}
              >
                Hủy bỏ
              </Button>
              <Button
                color="green"
                size="sm"
                onClick={handleAddCustomerSubmit}
                disabled={submittingAdd}
                className="font-semibold"
              >
                {submittingAdd ? "Đang tạo..." : "+ Tạo Khách Hàng"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Customers;
