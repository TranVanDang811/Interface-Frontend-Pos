import React, { useEffect, useState, useMemo } from "react";
import {
  Card,
  CardBody,
  Typography,
  Chip,
  Button,
} from "@material-tailwind/react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  fetchOrders,
  fetchOrderSummary,
} from "@/features/order/orderThunks";
import orderAPI from "@/features/order/orderAPI";
import Pagination from "@/utils/Pagination";
import { formatDateTime } from "@/utils/dateFormat";
import {
  MagnifyingGlassIcon,
  XMarkIcon,
  FunnelIcon,
  ArrowPathIcon,
  ShoppingBagIcon,
  ClipboardDocumentListIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  CalendarDaysIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ArrowTopRightOnSquareIcon,
  TicketIcon,
} from "@heroicons/react/24/solid";

export function Orders() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { list, loading, page, totalPages, summary, totalElements } = useSelector(
    (state) => state.order
  );

  // Dynamic stats with fallback calculation from currently loaded list
  const displaySummary = useMemo(() => {
    // If summary from backend is valid, use it
    if (summary && typeof summary === "object") {
      return summary;
    }

    // Otherwise compute client-side fallback from list items
    if (Array.isArray(list) && list.length > 0) {
      let revenue = 0;
      let paid = 0;
      let pending = 0;
      let hold = 0;
      let canceled = 0;

      list.forEach((ord) => {
        const amt = Number(ord.finalAmount ?? ord.totalPrice) || 0;
        if (ord.status === "PAID") {
          paid++;
          revenue += amt;
        } else if (ord.status === "PENDING") {
          pending++;
        } else if (ord.status === "HOLD") {
          hold++;
        } else if (ord.status === "CANCELED") {
          canceled++;
        }
      });

      return {
        totalOrders: totalElements || list.length,
        paidOrders: paid,
        pendingOrders: pending,
        holdOrders: hold,
        canceledOrders: canceled,
        totalRevenue: revenue,
      };
    }

    return summary || {
      totalOrders: totalElements || 0,
      paidOrders: 0,
      pendingOrders: 0,
      holdOrders: 0,
      canceledOrders: 0,
      totalRevenue: 0,
    };
  }, [summary, list, totalElements]);

  // Filter States
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [datePreset, setDatePreset] = useState("all");
  const [pageSize, setPageSize] = useState(10);

  // Expanded row state & cached details
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [detailCache, setDetailCache] = useState({});
  const [loadingDetailId, setLoadingDetailId] = useState(null);

  // Load data function
  const loadData = (pageNum = 1) => {
    const params = {
      page: pageNum,
      size: pageSize,
    };
    if (keyword.trim()) params.keyword = keyword.trim();
    if (status) params.status = status;
    if (fromDate) params.fromDate = fromDate;
    if (toDate) params.toDate = toDate;

    dispatch(fetchOrders(params));

    const summaryParams = {};
    if (keyword.trim()) summaryParams.keyword = keyword.trim();
    if (status) summaryParams.status = status;
    if (fromDate) summaryParams.fromDate = fromDate;
    if (toDate) summaryParams.toDate = toDate;
    dispatch(fetchOrderSummary(summaryParams));
  };

  // Initial load
  useEffect(() => {
    loadData(1);
  }, [dispatch, pageSize]);

  // Handle Quick Date Presets
  const handleDatePreset = (preset) => {
    setDatePreset(preset);
    const now = new Date();
    const formatDateStr = (d) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    let start = "";
    let end = "";
    if (preset === "today") {
      const todayStr = formatDateStr(now);
      start = todayStr;
      end = todayStr;
    } else if (preset === "week") {
      const pastWeek = new Date();
      pastWeek.setDate(now.getDate() - 7);
      start = formatDateStr(pastWeek);
      end = formatDateStr(now);
    } else if (preset === "month") {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      start = formatDateStr(startOfMonth);
      end = formatDateStr(now);
    } else if (preset === "all") {
      start = "";
      end = "";
    }
    setFromDate(start);
    setToDate(end);

    const params = {
      page: 1,
      size: pageSize,
    };
    if (keyword.trim()) params.keyword = keyword.trim();
    if (status) params.status = status;
    if (start) params.fromDate = start;
    if (end) params.toDate = end;

    dispatch(fetchOrders(params));

    const summaryParams = {};
    if (keyword.trim()) summaryParams.keyword = keyword.trim();
    if (status) summaryParams.status = status;
    if (start) summaryParams.fromDate = start;
    if (end) summaryParams.toDate = end;
    dispatch(fetchOrderSummary(summaryParams));
  };

  // Handle Search Submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadData(1);
  };

  // Reset Filters
  const handleResetFilters = () => {
    setKeyword("");
    setStatus("");
    setFromDate("");
    setToDate("");
    setDatePreset("all");

    dispatch(fetchOrders({ page: 1, size: pageSize }));
    dispatch(fetchOrderSummary({}));
  };

  // Handle Page Change
  const handlePageChange = (newPage) => {
    loadData(newPage);
  };

  // Toggle Accordion Details for an Order
  const handleToggleExpand = async (order) => {
    if (expandedOrderId === order.id) {
      setExpandedOrderId(null);
      return;
    }

    setExpandedOrderId(order.id);

    // If order already has orderDetails list
    if (order.orderDetails && order.orderDetails.length > 0) {
      setDetailCache((prev) => ({ ...prev, [order.id]: order.orderDetails }));
      return;
    }

    // Check if already in cache
    if (detailCache[order.id]) return;

    // Fetch details
    try {
      setLoadingDetailId(order.id);
      const res = await orderAPI.getOrderById(order.id);
      const data = res.result || res;
      setDetailCache((prev) => ({
        ...prev,
        [order.id]: data.orderDetails || [],
      }));
    } catch (e) {
      console.error("Load order detail error:", e);
    } finally {
      setLoadingDetailId(null);
    }
  };

  // Format Helper for Currency
  const formatMoney = (val) => {
    return `${Number(val || 0).toLocaleString("vi-VN")} đ`;
  };

  // Status Badge Helper
  const renderStatusBadge = (st) => {
    switch (st) {
      case "PAID":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-emerald-100 text-emerald-800">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Đã thanh toán
          </span>
        );
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-amber-100 text-amber-800">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            Chờ thanh toán
          </span>
        );
      case "HOLD":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-orange-100 text-orange-800">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
            Tạm giữ
          </span>
        );
      case "CANCELED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-red-100 text-red-800">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
            Đã hủy
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-gray-100 text-gray-700">
            {st || "Không rõ"}
          </span>
        );
    }
  };

  return (
    <div className="mt-8 mb-8 flex flex-col gap-6">
      {/* ===== HEADER & TITLE ===== */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-blue-gray-100">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-600">
              <ClipboardDocumentListIcon className="w-7 h-7" />
            </div>
            <div>
              <Typography variant="h5" color="blue-gray" className="font-bold">
                Lịch Sử Đơn Hàng (Orders History)
              </Typography>
              <Typography variant="small" className="text-gray-500 font-normal mt-0.5">
                Quản lý danh sách đơn hàng bán lẻ, giỏ hàng sản phẩm, voucher giảm giá và trạng thái xử lý đơn
              </Typography>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outlined"
            color="blue-gray"
            className="flex items-center gap-2 bg-white normal-case text-xs font-semibold"
            onClick={() => loadData(page + 1)}
          >
            <ArrowPathIcon className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Làm mới
          </Button>
        </div>
      </div>

      {/* ===== 4 THẺ KPI TỔNG QUAN ĐƠN HÀNG ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Tổng số đơn */}
        <Card className="border border-blue-gray-100 shadow-sm p-4 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <Typography variant="small" className="font-semibold text-gray-500 uppercase tracking-wider text-[11px]">
              Tổng Số Đơn Hàng
            </Typography>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShoppingBagIcon className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-2">
            <Typography variant="h4" className="font-bold text-blue-gray-900">
              {displaySummary?.totalOrders ?? 0}
            </Typography>
            <Typography variant="small" className="text-xs text-gray-500 mt-1 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              Đơn hàng ghi nhận trong hệ thống
            </Typography>
          </div>
        </Card>

        {/* Card 2: Đã thanh toán & Doanh số */}
        <Card className="border border-blue-gray-100 shadow-sm p-4 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <Typography variant="small" className="font-semibold text-gray-500 uppercase tracking-wider text-[11px]">
              Đã Thanh Toán (PAID)
            </Typography>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircleIcon className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-2">
            <Typography variant="h4" className="font-bold text-emerald-800">
              {displaySummary?.paidOrders ?? 0}{" "}
              <span className="text-xs font-normal text-gray-500">đơn</span>
            </Typography>
            <Typography variant="small" className="text-xs text-emerald-700 font-semibold mt-1">
              Doanh số: {formatMoney(displaySummary?.totalRevenue)}
            </Typography>
          </div>
        </Card>

        {/* Card 3: Đang chờ & Tạm giữ */}
        <Card className="border border-blue-gray-100 shadow-sm p-4 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <Typography variant="small" className="font-semibold text-gray-500 uppercase tracking-wider text-[11px]">
              Chờ Thanh Toán & Tạm Giữ
            </Typography>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <ClockIcon className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-2">
            <Typography variant="h4" className="font-bold text-amber-900">
              {(displaySummary?.pendingOrders || 0) + (displaySummary?.holdOrders || 0)}{" "}
              <span className="text-xs font-normal text-gray-500">đơn</span>
            </Typography>
            <Typography variant="small" className="text-xs text-gray-500 mt-1 flex items-center gap-2">
              <span>Chờ: <b>{displaySummary?.pendingOrders || 0}</b></span>
              <span>•</span>
              <span>Giữ: <b>{displaySummary?.holdOrders || 0}</b></span>
            </Typography>
          </div>
        </Card>

        {/* Card 4: Đã hủy */}
        <Card className="border border-blue-gray-100 shadow-sm p-4 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <Typography variant="small" className="font-semibold text-gray-500 uppercase tracking-wider text-[11px]">
              Đơn Đã Hủy (CANCELED)
            </Typography>
            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
              <XCircleIcon className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-2">
            <Typography variant="h4" className="font-bold text-red-800">
              {displaySummary?.canceledOrders ?? 0}{" "}
              <span className="text-xs font-normal text-gray-500">đơn</span>
            </Typography>
            <Typography variant="small" className="text-xs text-gray-500 mt-1 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
              Đơn hủy bỏ hoặc không thanh toán
            </Typography>
          </div>
        </Card>
      </div>

      {/* ===== BỘ LỌC & TÌM KIẾM NÂNG CAO ===== */}
      <Card className="border border-blue-gray-100 shadow-sm p-5">
        <form onSubmit={handleSearchSubmit} className="flex flex-col gap-4">
          {/* Hàng 1: Quick date presets */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-blue-gray-50 pb-3">
            <div className="flex items-center gap-2">
              <CalendarDaysIcon className="w-5 h-5 text-gray-400" />
              <span className="text-xs font-semibold text-gray-600">Mốc thời gian:</span>
              <div className="inline-flex rounded-lg border border-gray-200 p-0.5 bg-gray-50">
                <button
                  type="button"
                  onClick={() => handleDatePreset("all")}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                    datePreset === "all"
                      ? "bg-white text-blue-600 shadow-sm font-semibold"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Tất cả
                </button>
                <button
                  type="button"
                  onClick={() => handleDatePreset("today")}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                    datePreset === "today"
                      ? "bg-white text-blue-600 shadow-sm font-semibold"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Hôm nay
                </button>
                <button
                  type="button"
                  onClick={() => handleDatePreset("week")}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                    datePreset === "week"
                      ? "bg-white text-blue-600 shadow-sm font-semibold"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  7 ngày qua
                </button>
                <button
                  type="button"
                  onClick={() => handleDatePreset("month")}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                    datePreset === "month"
                      ? "bg-white text-blue-600 shadow-sm font-semibold"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Tháng này
                </button>
              </div>
            </div>

            <div className="text-xs text-gray-500">
              Hiển thị <span className="font-semibold text-gray-800">{list?.length || 0}</span> đơn hàng trên trang này
            </div>
          </div>

          {/* Hàng 2: Form inputs */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            {/* Search Input (5 cols) */}
            <div className="md:col-span-5 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <MagnifyingGlassIcon className="w-4 h-4" />
              </div>
              <input
                type="text"
                placeholder="Tìm Mã Đơn (ORD-...), Mã ID, Voucher..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="w-full pl-9 pr-8 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {keyword && (
                <button
                  type="button"
                  onClick={() => setKeyword("")}
                  className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Trạng thái (3 cols) */}
            <div className="md:col-span-3">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-2.5 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Tất cả trạng thái --</option>
                <option value="PAID">Đã thanh toán (PAID)</option>
                <option value="PENDING">Chờ thanh toán (PENDING)</option>
                <option value="HOLD">Tạm giữ (HOLD)</option>
                <option value="CANCELED">Đã hủy (CANCELED)</option>
              </select>
            </div>

            {/* Từ ngày (2 cols) */}
            <div className="md:col-span-2">
              <input
                type="date"
                value={fromDate}
                onChange={(e) => {
                  setFromDate(e.target.value);
                  setDatePreset("custom");
                }}
                className="w-full px-2.5 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                title="Từ ngày"
              />
            </div>

            {/* Đến ngày (2 cols) */}
            <div className="md:col-span-2">
              <input
                type="date"
                value={toDate}
                onChange={(e) => {
                  setToDate(e.target.value);
                  setDatePreset("custom");
                }}
                className="w-full px-2.5 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                title="Đến ngày"
              />
            </div>
          </div>

          {/* Hàng 3: Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-1">
            <Button
              type="button"
              size="sm"
              variant="text"
              color="gray"
              className="normal-case text-xs font-semibold"
              onClick={handleResetFilters}
            >
              Đặt lại bộ lọc
            </Button>
            <Button
              type="submit"
              size="sm"
              color="blue"
              className="flex items-center gap-1.5 normal-case text-xs font-semibold shadow-sm px-4"
            >
              <FunnelIcon className="w-3.5 h-3.5" />
              Áp dụng lọc
            </Button>
          </div>
        </form>
      </Card>

      {/* ===== BẢNG DỮ LIỆU ĐƠN HÀNG ===== */}
      <Card className="border border-blue-gray-100 shadow-sm overflow-hidden">
        <CardBody className="px-0 pt-0 pb-2">
          {loading ? (
            <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <Typography className="text-sm font-medium text-gray-500">
                Đang tải dữ liệu đơn hàng...
              </Typography>
            </div>
          ) : !list || list.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center justify-center gap-2">
              <ShoppingBagIcon className="w-12 h-12 text-gray-300" />
              <Typography variant="h6" color="blue-gray" className="font-semibold">
                Không tìm thấy đơn hàng nào
              </Typography>
              <Typography variant="small" className="text-gray-500 max-w-sm">
                Hãy thử thay đổi từ khóa tìm kiếm, trạng thái đơn hoặc khoảng ngày lọc.
              </Typography>
              <Button
                size="sm"
                variant="outlined"
                color="blue"
                className="mt-3 normal-case text-xs"
                onClick={handleResetFilters}
              >
                Xóa bộ lọc
              </Button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] table-auto text-left">
                  <thead>
                    <tr className="bg-gray-50/80 border-b border-blue-gray-100">
                      {[
                        "Mã Đơn Hàng",
                        "Mã Hệ Thống (ID)",
                        "Tổng Tiền Hàng",
                        "Voucher / Giảm Giá",
                        "Tổng Thực Trả",
                        "Trạng Thái",
                        "Thời Gian Tạo",
                        "Thao Tác",
                      ].map((el) => (
                        <th
                          key={el}
                          className="py-3 px-5 text-left border-b border-blue-gray-50"
                        >
                          <Typography
                            variant="small"
                            className="text-[11px] font-bold uppercase text-blue-gray-500 tracking-wider"
                          >
                            {el}
                          </Typography>
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-blue-gray-50">
                    {list.map((order) => {
                      const isExpanded = expandedOrderId === order.id;
                      const details = detailCache[order.id] || order.orderDetails || [];

                      return (
                        <React.Fragment key={order.id}>
                          {/* ORDER ROW */}
                          <tr
                            className={`hover:bg-blue-50/30 transition-colors ${
                              isExpanded ? "bg-blue-50/20" : ""
                            }`}
                          >
                            {/* Mã Đơn Hàng */}
                            <td className="py-3 px-5">
                              <button
                                type="button"
                                onClick={() => handleToggleExpand(order)}
                                className="font-mono text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1.5"
                                title="Bấm để xem sản phẩm trong đơn"
                              >
                                {order.orderCode}
                                {isExpanded ? (
                                  <ChevronUpIcon className="w-3.5 h-3.5 text-blue-500" />
                                ) : (
                                  <ChevronDownIcon className="w-3.5 h-3.5 text-gray-400" />
                                )}
                              </button>
                            </td>

                            {/* Mã ID */}
                            <td className="py-3 px-5">
                              <span className="font-mono text-[11px] text-gray-500">
                                {order.id}
                              </span>
                            </td>

                            {/* Tổng Tiền Hàng */}
                            <td className="py-3 px-5">
                              <Typography className="text-xs font-medium text-gray-800">
                                {formatMoney(order.totalPrice)}
                              </Typography>
                            </td>

                            {/* Voucher / Giảm giá */}
                            <td className="py-3 px-5">
                              {order.discountCode || order.discountAmount > 0 ? (
                                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-red-50 text-red-700 border border-red-200">
                                  <TicketIcon className="w-3 h-3 text-red-500" />
                                  <span>{order.discountCode || "Voucher"}</span>
                                  <span>(-{formatMoney(order.discountAmount)})</span>
                                </div>
                              ) : (
                                <span className="text-xs text-gray-400">—</span>
                              )}
                            </td>

                            {/* Tổng Thực Trả */}
                            <td className="py-3 px-5">
                              <Typography className="text-xs font-bold text-emerald-700">
                                {formatMoney(order.finalAmount)}
                              </Typography>
                            </td>

                            {/* Trạng Thái */}
                            <td className="py-3 px-5">
                              {renderStatusBadge(order.status)}
                            </td>

                            {/* Thời Gian Tạo */}
                            <td className="py-3 px-5">
                              <Typography className="text-xs text-gray-600">
                                {formatDateTime(order.createdAt)}
                              </Typography>
                            </td>

                            {/* Thao Tác */}
                            <td className="py-3 px-5">
                              <div className="flex items-center gap-1.5">
                                {/* Xem nhanh accordion */}
                                <button
                                  type="button"
                                  onClick={() => handleToggleExpand(order)}
                                  className={`p-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 ${
                                    isExpanded
                                      ? "bg-blue-100 text-blue-700"
                                      : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                                  }`}
                                  title="Xem nhanh giỏ hàng"
                                >
                                  {isExpanded ? "Đóng" : "Xem SP"}
                                </button>

                                {/* Đi tới trang chi tiết đầy đủ */}
                                <button
                                  type="button"
                                  onClick={() => navigate(`/dashboard/orders/${order.id}`)}
                                  className="p-1.5 text-gray-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                                  title="Xem trang chi tiết đơn hàng đầy đủ"
                                >
                                  <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>

                          {/* ACCORDION ORDER DETAIL ROW */}
                          {isExpanded && (
                            <tr>
                              <td colSpan="8" className="bg-blue-50/30 p-4 border-b border-blue-gray-100">
                                <div className="bg-white rounded-xl p-4 border border-blue-gray-100 shadow-xs">
                                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100">
                                    <div className="flex items-center gap-2">
                                      <ShoppingBagIcon className="w-4 h-4 text-blue-600" />
                                      <span className="text-xs font-bold text-gray-800">
                                        Giỏ hàng sản phẩm - {order.orderCode}
                                      </span>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => navigate(`/dashboard/orders/${order.id}`)}
                                      className="text-xs text-blue-600 hover:underline font-semibold flex items-center gap-1"
                                    >
                                      Xem chi tiết đầy đủ
                                      <ArrowTopRightOnSquareIcon className="w-3 h-3" />
                                    </button>
                                  </div>

                                  {loadingDetailId === order.id ? (
                                    <div className="p-4 text-center text-xs text-gray-500">
                                      Đang tải chi tiết mặt hàng...
                                    </div>
                                  ) : details.length === 0 ? (
                                    <div className="p-4 text-center text-xs text-gray-400 italic">
                                      Không có sản phẩm nào trong đơn hàng này
                                    </div>
                                  ) : (
                                    <table className="w-full text-xs">
                                      <thead>
                                        <tr className="border-b border-gray-100 text-gray-400 font-semibold text-[11px]">
                                          <th className="text-left py-2">Mã Sản Phẩm</th>
                                          <th className="text-left py-2">Tên Sản Phẩm</th>
                                          <th className="text-right py-2">Đơn Giá</th>
                                          <th className="text-center py-2">Số Lượng</th>
                                          <th className="text-right py-2">Thành Tiền</th>
                                        </tr>
                                      </thead>

                                      <tbody className="divide-y divide-gray-50">
                                        {details.map((item, idx) => (
                                          <tr key={item.id || idx}>
                                            <td className="py-2 font-mono text-gray-600">
                                              {item.productCode || item.productId || "—"}
                                            </td>
                                            <td className="py-2 font-semibold text-gray-800">
                                              {item.name}
                                            </td>
                                            <td className="py-2 text-right text-gray-600">
                                              {formatMoney(item.price)}
                                            </td>
                                            <td className="py-2 text-center">
                                              <span className="inline-flex px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold text-[11px]">
                                                {item.quantity}
                                              </span>
                                            </td>
                                            <td className="py-2 text-right font-bold text-gray-900">
                                              {formatMoney(item.totalPrice || item.price * item.quantity)}
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>

                                      <tfoot>
                                        <tr className="border-t border-gray-200 font-semibold text-gray-700">
                                          <td colSpan="3" className="py-2 text-right">
                                            Tổng tiền hàng:
                                          </td>
                                          <td className="py-2 text-center font-bold text-blue-600">
                                            {details.reduce((sum, it) => sum + (it.quantity || 0), 0)} món
                                          </td>
                                          <td className="py-2 text-right font-bold text-emerald-700">
                                            {formatMoney(order.totalPrice)}
                                          </td>
                                        </tr>
                                      </tfoot>
                                    </table>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Phân trang */}
              <div className="border-t border-blue-gray-50 py-3">
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
    </div>
  );
}

export default Orders;
