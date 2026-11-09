import {
  Card,
  CardBody,
  Typography,
  Chip,
  Button,
} from "@material-tailwind/react";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { fetchUserById } from "@/features/user/userThunks";
import paymentAPI from "@/features/payment/paymentAPI";
import { formatDateTime } from "@/utils/dateFormat";
import {
  ShoppingBagIcon,
  CurrencyDollarIcon,
  SparklesIcon,
  CalendarDaysIcon,
  ArrowLeftIcon,
  EyeIcon,
} from "@heroicons/react/24/solid";

export default function UserDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { selectedUser, loading } = useSelector((state) => state.user);

  // Customer stats & purchase history state
  const [customerStats, setCustomerStats] = useState(null);
  const [customerPayments, setCustomerPayments] = useState([]);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyTotalPages, setHistoryTotalPages] = useState(1);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchUserById(id));
  }, [id, dispatch]);

  const isCustomer = selectedUser?.roles?.some(
    (r) => r.name === "CUSTOMER"
  );

  // Load customer stats and payments
  useEffect(() => {
    if (isCustomer && id) {
      loadCustomerStats();
      loadCustomerPayments(1);
    }
  }, [isCustomer, id]);

  const loadCustomerStats = async () => {
    try {
      const res = await paymentAPI.getCustomerStats(id);
      setCustomerStats(res.result || res);
    } catch (e) {
      console.error("Failed to load customer stats:", e);
    }
  };

  const loadCustomerPayments = async (page = 1) => {
    try {
      setHistoryLoading(true);
      const res = await paymentAPI.getCustomerPayments(id, page, 5);
      const data = res.result || res;
      setCustomerPayments(data.content || []);
      setHistoryPage(page);
      setHistoryTotalPages(data.totalPages || 1);
    } catch (e) {
      console.error("Failed to load customer payments:", e);
    } finally {
      setHistoryLoading(false);
    }
  };

  if (loading || !selectedUser) {
    return (
      <div className="p-16 text-center text-gray-500 flex flex-col items-center gap-3">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
        <Typography variant="h6">Đang tải thông tin người dùng...</Typography>
      </div>
    );
  }

  const isActive = String(selectedUser.status || "").toUpperCase() === "ACTIVE";

  const getMethodBadge = (method) => {
    switch (method) {
      case "CASH":
        return <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">Tiền mặt</span>;
      case "CREDIT_CARD":
        return <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">Thẻ</span>;
      case "MOMO":
        return <span className="text-xs font-semibold px-2 py-0.5 rounded bg-pink-50 text-pink-700 border border-pink-200">MoMo</span>;
      case "BANK_TRANSFER":
        return <span className="text-xs font-semibold px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">Chuyển khoản</span>;
      default:
        return <span className="text-xs font-semibold px-2 py-0.5 rounded bg-gray-100 text-gray-700">{method || "Khác"}</span>;
    }
  };

  return (
    <div className="mt-8 mb-8 flex justify-center px-4">
      <Card className="w-full max-w-5xl shadow-lg rounded-2xl border border-gray-100">
        <CardBody className="p-6 md:p-8">
          {/* Header */}
          <div className="flex flex-wrap justify-between items-center pb-6 border-b border-gray-100 gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 transition"
                title="Quay lại"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </button>
              <div>
                <Typography variant="h4" className="font-bold text-gray-900">
                  {selectedUser.fullName || selectedUser.username}
                </Typography>
                <Typography variant="small" className="text-gray-500 text-xs mt-0.5">
                  ID: {selectedUser.id} • Ngày tạo: {new Date(selectedUser.createdAt).toLocaleDateString("vi-VN")}
                </Typography>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Chip
                value={isActive ? "Đang hoạt động" : "Tạm khóa"}
                color={isActive ? "green" : "blue-gray"}
                size="sm"
                className="font-semibold"
              />
              {selectedUser.roles?.map((r) => (
                <span
                  key={r.name}
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    r.name === "ADMIN"
                      ? "bg-red-100 text-red-800 border border-red-200"
                      : r.name === "MANAGE"
                      ? "bg-purple-100 text-purple-800 border border-purple-200"
                      : r.name === "EMPLOYEE"
                      ? "bg-blue-100 text-blue-800 border border-blue-200"
                      : "bg-teal-100 text-teal-800 border border-teal-200"
                  }`}
                >
                  {r.name === "CUSTOMER" ? "KHÁCH HÀNG" : r.name}
                </span>
              ))}
            </div>
          </div>

          {/* ================= NẾU LÀ KHÁCH HÀNG ================= */}
          {isCustomer && (
            <div className="mt-6 space-y-6">
              {/* THẺ TÓM TẮT CHI TIÊU & HOẠT ĐỘNG */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-blue-50/60 border border-blue-100 p-4 rounded-xl flex items-center justify-between">
                  <div>
                    <Typography variant="small" className="text-xs text-blue-700 font-semibold uppercase">
                      Tổng Đơn Đã Mua
                    </Typography>
                    <Typography variant="h4" className="font-bold text-blue-900 mt-1">
                      {customerStats?.totalOrders ?? 0}
                    </Typography>
                    <Typography variant="small" className="text-[11px] text-blue-600 mt-0.5">
                      Đơn hàng hoàn tất
                    </Typography>
                  </div>
                  <div className="p-3 bg-blue-500 text-white rounded-xl shadow-sm">
                    <ShoppingBagIcon className="h-6 w-6" />
                  </div>
                </div>

                <div className="bg-emerald-50/60 border border-emerald-100 p-4 rounded-xl flex items-center justify-between">
                  <div>
                    <Typography variant="small" className="text-xs text-emerald-700 font-semibold uppercase">
                      Tổng Chi Tiêu
                    </Typography>
                    <Typography variant="h5" className="font-bold text-emerald-900 mt-1">
                      {(customerStats?.totalSpent ?? 0).toLocaleString("vi-VN")} đ
                    </Typography>
                    <Typography variant="small" className="text-[11px] text-emerald-600 mt-0.5">
                      Doanh thu từ khách
                    </Typography>
                  </div>
                  <div className="p-3 bg-emerald-500 text-white rounded-xl shadow-sm">
                    <CurrencyDollarIcon className="h-6 w-6" />
                  </div>
                </div>

                <div className="bg-amber-50/60 border border-amber-100 p-4 rounded-xl flex items-center justify-between">
                  <div>
                    <Typography variant="small" className="text-xs text-amber-700 font-semibold uppercase">
                      Điểm Tích Lũy
                    </Typography>
                    <Typography variant="h4" className="font-bold text-amber-900 mt-1">
                      {(customerStats?.loyaltyPoints ?? selectedUser.customerProfile?.loyaltyPoints ?? 0).toLocaleString()}
                    </Typography>
                    <Typography variant="small" className="text-[11px] text-amber-600 mt-0.5 font-bold">
                      Hạng: {customerStats?.membershipLevel ?? selectedUser.customerProfile?.membershipLevel ?? "NONE"}
                    </Typography>
                  </div>
                  <div className="p-3 bg-amber-500 text-white rounded-xl shadow-sm">
                    <SparklesIcon className="h-6 w-6" />
                  </div>
                </div>

                <div className="bg-purple-50/60 border border-purple-100 p-4 rounded-xl flex items-center justify-between">
                  <div>
                    <Typography variant="small" className="text-xs text-purple-700 font-semibold uppercase">
                      Lần Mua Gần Nhất
                    </Typography>
                    <Typography variant="small" className="font-bold text-purple-900 mt-1 line-clamp-1">
                      {customerStats?.lastPurchaseDate ? formatDateTime(customerStats.lastPurchaseDate) : "Chưa có đơn"}
                    </Typography>
                    <Typography variant="small" className="text-[11px] text-purple-600 mt-0.5">
                      SĐT: {selectedUser.phone || "—"}
                    </Typography>
                  </div>
                  <div className="p-3 bg-purple-500 text-white rounded-xl shadow-sm">
                    <CalendarDaysIcon className="h-6 w-6" />
                  </div>
                </div>
              </div>

              {/* BẢNG LỊCH SỬ MUA HÀNG CHI TIẾT */}
              <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="bg-gray-50 p-4 border-b border-gray-200 flex justify-between items-center">
                  <div>
                    <Typography variant="h6" className="font-bold text-gray-800">
                      Lịch Sử Đơn Hàng & Mua Sắm
                    </Typography>
                    <Typography variant="small" className="text-gray-500 text-xs">
                      Toàn bộ hóa đơn thanh toán của khách hàng tại quầy thu ngân POS
                    </Typography>
                  </div>
                  <Button
                    size="sm"
                    variant="text"
                    color="blue"
                    onClick={() => loadCustomerPayments(historyPage)}
                    className="text-xs"
                  >
                    Làm mới
                  </Button>
                </div>

                <div className="overflow-x-auto">
                  {historyLoading ? (
                    <div className="p-8 text-center text-gray-500">
                      <Typography variant="small">Đang tải lịch sử giao dịch...</Typography>
                    </div>
                  ) : customerPayments.length === 0 ? (
                    <div className="p-10 text-center text-gray-400">
                      <ShoppingBagIcon className="h-10 w-10 mx-auto text-gray-300 mb-2" />
                      <Typography variant="small" className="font-medium">
                        Khách hàng này chưa phát sinh đơn hàng nào
                      </Typography>
                    </div>
                  ) : (
                    <table className="w-full text-left text-xs min-w-[700px]">
                      <thead className="bg-gray-50/70 border-b border-gray-100">
                        <tr>
                          <th className="py-3 px-4 font-bold text-gray-600 uppercase">Mã đơn / Mã GD</th>
                          <th className="py-3 px-4 font-bold text-gray-600 uppercase">Thời gian</th>
                          <th className="py-3 px-4 font-bold text-gray-600 uppercase">Phương thức</th>
                          <th className="py-3 px-4 font-bold text-gray-600 uppercase text-right">Tổng tiền</th>
                          <th className="py-3 px-4 font-bold text-gray-600 uppercase text-center">Điểm tích / Dùng</th>
                          <th className="py-3 px-4 font-bold text-gray-600 uppercase text-center">Trạng thái</th>
                          <th className="py-3 px-4 font-bold text-gray-600 uppercase text-center">Chi tiết</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {customerPayments.map((p) => (
                          <tr key={p.id} className="hover:bg-blue-gray-50/50 transition">
                            <td className="py-3 px-4 font-bold text-blue-700">
                              {p.transactionId || (p.orderId ? p.orderId.substring(0, 8) + "..." : "—")}
                            </td>

                            <td className="py-3 px-4 text-gray-600">
                              {formatDateTime(p.paymentDate)}
                            </td>

                            <td className="py-3 px-4">
                              {getMethodBadge(p.method)}
                            </td>

                            <td className="py-3 px-4 font-bold text-emerald-600 text-right">
                              {Number(p.amount || 0).toLocaleString("vi-VN")} đ
                            </td>

                            <td className="py-3 px-4 text-center">
                              <span className="text-emerald-600 font-semibold">+{p.earnedPoints || 0}</span>
                              {p.usedPoints > 0 && (
                                <span className="text-amber-600 font-semibold ml-1.5">(-{p.usedPoints})</span>
                              )}
                            </td>

                            <td className="py-3 px-4 text-center">
                              <Chip
                                value={p.status === "SUCCESS" ? "Thành công" : p.status === "REFUNDED" ? "Đã hoàn" : p.status}
                                color={p.status === "SUCCESS" ? "green" : "red"}
                                size="sm"
                                className="font-semibold text-[10px] w-fit mx-auto"
                              />
                            </td>

                            <td className="py-3 px-4 text-center">
                              {p.orderId ? (
                                <Button
                                  size="sm"
                                  variant="text"
                                  color="blue"
                                  className="p-1 hover:bg-blue-50"
                                  onClick={() => navigate(`/dashboard/orders/${p.orderId}`)}
                                  title="Xem hóa đơn chi tiết"
                                >
                                  <EyeIcon className="h-4 w-4" />
                                </Button>
                              ) : (
                                "—"
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>

                {/* Phân trang lịch sử đơn */}
                {historyTotalPages > 1 && (
                  <div className="flex justify-end gap-2 p-3 bg-gray-50 border-t border-gray-100">
                    <Button
                      size="sm"
                      variant="outlined"
                      disabled={historyPage <= 1}
                      onClick={() => loadCustomerPayments(historyPage - 1)}
                      className="px-3 py-1 text-xs"
                    >
                      Trước
                    </Button>
                    <span className="text-xs text-gray-600 flex items-center px-2">
                      Trang {historyPage} / {historyTotalPages}
                    </span>
                    <Button
                      size="sm"
                      variant="outlined"
                      disabled={historyPage >= historyTotalPages}
                      onClick={() => loadCustomerPayments(historyPage + 1)}
                      className="px-3 py-1 text-xs"
                    >
                      Sau
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ================= NẾU LÀ NHÂN VIÊN (STAFF) ================= */}
          {!isCustomer && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <InfoItem label="Tên đăng nhập (Username)" value={selectedUser.username} />
              <InfoItem label="Email" value={selectedUser.email || "—"} />
              <InfoItem label="Số điện thoại" value={selectedUser.phone || "—"} />
              <InfoItem label="Ngày tạo" value={formatDateTime(selectedUser.createdAt)} />

              {selectedUser.employeeProfile && (
                <>
                  <InfoItem label="Chức vụ (Position)" value={selectedUser.employeeProfile.position || "—"} />
                  <InfoItem
                    label="Lương cơ bản (Salary)"
                    value={
                      selectedUser.employeeProfile.salary
                        ? Number(selectedUser.employeeProfile.salary).toLocaleString("vi-VN") + " đ"
                        : "—"
                    }
                  />
                  <InfoItem label="Ca làm việc (Shift)" value={selectedUser.employeeProfile.shift || "—"} />
                  <InfoItem label="Ngày vào làm (Hire Date)" value={selectedUser.employeeProfile.hireDate || "—"} />
                </>
              )}
            </div>
          )}

          {/* Footer Back Button */}
          <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-100">
            <Button variant="outlined" color="gray" onClick={() => navigate(-1)}>
              Quay lại
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

/* Reusable Component */
function InfoItem({ label, value }) {
  return (
    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
      <Typography variant="small" className="text-gray-500 text-xs mb-1 font-medium">
        {label}
      </Typography>
      <div className="text-sm font-semibold text-gray-800">
        {value}
      </div>
    </div>
  );
}
