import React, { useEffect, useState, useMemo } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Chip,
  Button,
} from "@material-tailwind/react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  fetchPayments,
  fetchPaymentSummary,
} from "@/features/payment/paymentThunks";
import paymentAPI from "@/features/payment/paymentAPI";
import Pagination from "@/utils/Pagination";
import { formatDateTime } from "@/utils/dateFormat";
import {
  MagnifyingGlassIcon,
  XMarkIcon,
  FunnelIcon,
  ArrowPathIcon,
  EyeIcon,
  PrinterIcon,
  CurrencyDollarIcon,
  BanknotesIcon,
  CreditCardIcon,
  ShoppingBagIcon,
  CalendarDaysIcon,
  ArrowTopRightOnSquareIcon,
} from "@heroicons/react/24/solid";

export function Payments() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { list, loading, page, totalPages, summary, totalElements } = useSelector(
    (state) => state.payment
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
      let cash = 0;
      let digital = 0;
      let refunded = 0;

      list.forEach((p) => {
        const amt = Number(p.amount) || 0;
        const ref = Number(p.totalRefunded) || 0;
        refunded += ref;

        if (p.status === "SUCCESS") {
          revenue += amt;
          if (p.method === "CASH") {
            cash += amt;
          } else {
            digital += amt;
          }
        }
      });

      return {
        totalRevenue: revenue,
        totalCash: cash,
        totalDigital: digital,
        totalRefunded: refunded,
        totalTransactions: totalElements || list.length,
      };
    }

    return summary || {
      totalRevenue: 0,
      totalCash: 0,
      totalDigital: 0,
      totalRefunded: 0,
      totalTransactions: totalElements || 0,
    };
  }, [summary, list, totalElements]);

  // Filter States
  const [keyword, setKeyword] = useState("");
  const [method, setMethod] = useState("");
  const [status, setStatus] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [datePreset, setDatePreset] = useState("all");
  const [pageSize, setPageSize] = useState(10);

  // Modals
  const [invoiceModal, setInvoiceModal] = useState({
    open: false,
    paymentId: null,
    htmlContent: "",
    loading: false,
  });

  const [detailModal, setDetailModal] = useState({
    open: false,
    payment: null,
    refundHistory: [],
    loading: false,
  });

  // Lock body scroll when any modal is open
  useEffect(() => {
    if (invoiceModal.open || detailModal.open) {
      document.body.style.overflow = "hidden";
      document.body.style.width = "100%";
    } else {
      document.body.style.overflow = "";
      document.body.style.width = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.width = "";
    };
  }, [invoiceModal.open, detailModal.open]);

  // Load data function
  const loadData = (pageNum = 1) => {
    const params = {
      page: pageNum,
      size: pageSize,
    };
    if (keyword.trim()) params.keyword = keyword.trim();
    if (method) params.method = method;
    if (status) params.status = status;
    if (fromDate) params.fromDate = fromDate;
    if (toDate) params.toDate = toDate;

    dispatch(fetchPayments(params));

    const summaryParams = {};
    if (keyword.trim()) summaryParams.keyword = keyword.trim();
    if (method) summaryParams.method = method;
    if (status) summaryParams.status = status;
    if (fromDate) summaryParams.fromDate = fromDate;
    if (toDate) summaryParams.toDate = toDate;
    dispatch(fetchPaymentSummary(summaryParams));
  };

  // Initial load
  useEffect(() => {
    loadData(1);
  }, [dispatch, pageSize]);

  // Quick Date Preset handler
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
    if (method) params.method = method;
    if (status) params.status = status;
    if (start) params.fromDate = start;
    if (end) params.toDate = end;

    dispatch(fetchPayments(params));

    const summaryParams = {};
    if (keyword.trim()) summaryParams.keyword = keyword.trim();
    if (method) summaryParams.method = method;
    if (status) summaryParams.status = status;
    if (start) summaryParams.fromDate = start;
    if (end) summaryParams.toDate = end;
    dispatch(fetchPaymentSummary(summaryParams));
  };

  // Handle Search Submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadData(1);
  };

  // Reset all filters
  const handleResetFilters = () => {
    setKeyword("");
    setMethod("");
    setStatus("");
    setFromDate("");
    setToDate("");
    setDatePreset("all");

    dispatch(fetchPayments({ page: 1, size: pageSize }));
    dispatch(fetchPaymentSummary({}));
  };

  // Handle Pagination change
  const handlePageChange = (newPage) => {
    loadData(newPage);
  };

  // Open Detail Modal
  const handleOpenDetail = async (payment) => {
    setDetailModal({
      open: true,
      payment,
      refundHistory: [],
      loading: true,
    });

    try {
      if (
        payment.status === "REFUNDED" ||
        payment.status === "PARTIALLY_REFUNDED"
      ) {
        const historyRes = await paymentAPI.getRefundHistory(payment.id);
        const historyData = historyRes.result || historyRes || [];
        setDetailModal((prev) => ({
          ...prev,
          refundHistory: historyData,
          loading: false,
        }));
      } else {
        setDetailModal((prev) => ({ ...prev, loading: false }));
      }
    } catch (e) {
      console.error("Load refund history error:", e);
      setDetailModal((prev) => ({ ...prev, loading: false }));
    }
  };

  // Open Invoice Preview Modal
  const handlePrintInvoice = async (paymentId) => {
    setInvoiceModal({
      open: true,
      paymentId,
      htmlContent: "",
      loading: true,
    });

    try {
      const res = await paymentAPI.exportInvoice(paymentId);
      setInvoiceModal({
        open: true,
        paymentId,
        htmlContent: res,
        loading: false,
      });
    } catch (error) {
      console.error("Print invoice error:", error);
      setInvoiceModal((prev) => ({ ...prev, loading: false }));
    }
  };

  // Print Window Trigger
  const handlePrint = () => {
    if (!invoiceModal.htmlContent) return;
    const w = window.open("", "", "width=380,height=650");
    w.document.write(
      `<!DOCTYPE html><html><head><title>Hóa đơn ${invoiceModal.paymentId}</title><style>body { font-family: monospace; margin: 10px; font-size: 12px; }</style></head><body>${invoiceModal.htmlContent}</body></html>`
    );
    w.document.close();
    w.focus();
    setTimeout(() => {
      w.print();
      w.close();
    }, 250);
  };

  // Format Helper for Currency
  const formatMoney = (val) => {
    return `${Number(val || 0).toLocaleString("vi-VN")} đ`;
  };

  // Helper for Method Badge
  const renderMethodBadge = (m) => {
    switch (m) {
      case "CASH":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Tiền mặt
          </span>
        );
      case "BANK_TRANSFER":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
            Chuyển khoản
          </span>
        );
      case "MOMO":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-pink-50 text-pink-700 border border-pink-200">
            <span className="w-1.5 h-1.5 rounded-full bg-pink-500"></span>
            Ví MoMo
          </span>
        );
      case "CREDIT_CARD":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
            Thẻ ngân hàng
          </span>
        );
      case "VNPAY":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-cyan-50 text-cyan-700 border border-cyan-200">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500"></span>
            VNPay
          </span>
        );
      case "ZALOPAY":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-sky-50 text-sky-700 border border-sky-200">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
            ZaloPay
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-700 border border-gray-200">
            {m || "Khác"}
          </span>
        );
    }
  };

  // Helper for Status Badge
  const renderStatusBadge = (st) => {
    switch (st) {
      case "SUCCESS":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-green-100 text-green-800">
            ✓ Thành công
          </span>
        );
      case "REFUNDED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-red-100 text-red-800">
            ✕ Đã hoàn tiền
          </span>
        );
      case "PARTIALLY_REFUNDED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-amber-100 text-amber-800">
            ⟳ Hoàn 1 phần
          </span>
        );
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-yellow-100 text-yellow-800">
            ⏳ Chờ xử lý
          </span>
        );
      case "FAILED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-gray-200 text-gray-800">
            Thất bại
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
              <CurrencyDollarIcon className="w-7 h-7" />
            </div>
            <div>
              <Typography variant="h5" color="blue-gray" className="font-bold">
                Lịch Sử Bán Hàng & Doanh Thu
              </Typography>
              <Typography variant="small" className="text-gray-500 font-normal mt-0.5">
                Theo dõi chi tiết thanh toán đơn hàng, đối soát dòng tiền và in lại hóa đơn bán lẻ
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

      {/* ===== 4 THẺ KPI TỔNG QUAN TÀI CHÍNH ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Tổng Doanh Thu */}
        <Card className="border border-blue-gray-100 shadow-sm p-4 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <Typography variant="small" className="font-semibold text-gray-500 uppercase tracking-wider text-[11px]">
              Tổng Doanh Thu Thực Thu
            </Typography>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CurrencyDollarIcon className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-2">
            <Typography variant="h4" className="font-bold text-blue-gray-900">
              {formatMoney(displaySummary?.totalRevenue)}
            </Typography>
            <Typography variant="small" className="text-xs text-gray-500 mt-1 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Giao dịch thành công trong kỳ
            </Typography>
          </div>
        </Card>

        {/* Card 2: Tiền mặt tại két */}
        <Card className="border border-blue-gray-100 shadow-sm p-4 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <Typography variant="small" className="font-semibold text-gray-500 uppercase tracking-wider text-[11px]">
              Doanh Thu Tiền Mặt (Két)
            </Typography>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <BanknotesIcon className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-2">
            <Typography variant="h4" className="font-bold text-blue-gray-900">
              {formatMoney(displaySummary?.totalCash)}
            </Typography>
            <Typography variant="small" className="text-xs text-gray-500 mt-1 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              Đối soát tiền mặt tại quầy thu ngân
            </Typography>
          </div>
        </Card>

        {/* Card 3: Chuyển khoản & Ví điện tử */}
        <Card className="border border-blue-gray-100 shadow-sm p-4 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <Typography variant="small" className="font-semibold text-gray-500 uppercase tracking-wider text-[11px]">
              Chuyển Khoản & Ví Điện Tử
            </Typography>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <CreditCardIcon className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-2">
            <Typography variant="h4" className="font-bold text-blue-gray-900">
              {formatMoney(displaySummary?.totalDigital)}
            </Typography>
            <Typography variant="small" className="text-xs text-gray-500 mt-1 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-purple-500"></span>
              Tài khoản ngân hàng / MoMo / VNPay
            </Typography>
          </div>
        </Card>

        {/* Card 4: Tiền hoàn & Tổng đơn */}
        <Card className="border border-blue-gray-100 shadow-sm p-4 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <Typography variant="small" className="font-semibold text-gray-500 uppercase tracking-wider text-[11px]">
              Tiền Đã Hoàn & Tổng GD
            </Typography>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <ShoppingBagIcon className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-2">
            <Typography variant="h4" className="font-bold text-amber-900">
              {formatMoney(displaySummary?.totalRefunded)}
            </Typography>
            <Typography variant="small" className="text-xs text-gray-500 mt-1 flex items-center gap-1">
              <span className="font-semibold text-blue-600">
                {displaySummary?.totalTransactions || 0}
              </span>{" "}
              lượt thanh toán ghi nhận
            </Typography>
          </div>
        </Card>
      </div>

      {/* ===== BỘ LỌC & TÌM KIẾM NÂNG CAO ===== */}
      <Card className="border border-blue-gray-100 shadow-sm p-5">
        <form onSubmit={handleSearchSubmit} className="flex flex-col gap-4">
          {/* Hàng 1: Nút chọn khoảng thời gian nhanh */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-blue-gray-50 pb-3">
            <div className="flex items-center gap-2">
              <CalendarDaysIcon className="w-5 h-5 text-gray-400" />
              <span className="text-xs font-semibold text-gray-600">Khoảng thời gian:</span>
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
              Hiển thị <span className="font-semibold text-gray-800">{list?.length || 0}</span> giao dịch trên trang này
            </div>
          </div>

          {/* Hàng 2: Bộ lọc chi tiết */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            {/* Search Input (4 cols) */}
            <div className="md:col-span-4 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <MagnifyingGlassIcon className="w-4 h-4" />
              </div>
              <input
                type="text"
                placeholder="Tìm Mã Đơn, Mã Hóa Đơn, Tên/SĐT Khách..."
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

            {/* Phương thức (2 cols) */}
            <div className="md:col-span-2">
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="w-full px-2.5 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Phương thức --</option>
                <option value="CASH">Tiền mặt (CASH)</option>
                <option value="BANK_TRANSFER">Chuyển khoản</option>
                <option value="MOMO">Ví MoMo</option>
                <option value="CREDIT_CARD">Thẻ tín dụng/ngân hàng</option>
                <option value="VNPAY">VNPay</option>
                <option value="ZALOPAY">ZaloPay</option>
              </select>
            </div>

            {/* Trạng thái (2 cols) */}
            <div className="md:col-span-2">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-2.5 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Trạng thái --</option>
                <option value="SUCCESS">Thành công</option>
                <option value="REFUNDED">Đã hoàn tiền</option>
                <option value="PARTIALLY_REFUNDED">Hoàn 1 phần</option>
                <option value="PENDING">Đang chờ xử lý</option>
              </select>
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

      {/* ===== BẢNG DỮ LIỆU GIAO DỊCH THANH TOÁN ===== */}
      <Card className="border border-blue-gray-100 shadow-sm overflow-hidden">
        <CardBody className="px-0 pt-0 pb-2">
          {loading ? (
            <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <Typography className="text-sm font-medium text-gray-500">
                Đang tải dữ liệu giao dịch...
              </Typography>
            </div>
          ) : !list || list.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center justify-center gap-2">
              <ShoppingBagIcon className="w-12 h-12 text-gray-300" />
              <Typography variant="h6" color="blue-gray" className="font-semibold">
                Không tìm thấy giao dịch nào
              </Typography>
              <Typography variant="small" className="text-gray-500 max-w-sm">
                Hãy thử thay đổi từ khóa tìm kiếm, phương thức thanh toán hoặc điều chỉnh khoảng ngày lọc.
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
                        "Mã Hóa Đơn",
                        "Mã Đơn Hàng",
                        "Khách Hàng",
                        "Số Tiền Thực Thu",
                        "Phương Thức",
                        "Trạng Thái",
                        "Thời Gian",
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
                    {list.map((payment, index) => {
                      const hasCustomer = payment.fullName || payment.userPhone;

                      return (
                        <tr
                          key={payment.id}
                          className="hover:bg-blue-50/30 transition-colors"
                        >
                          {/* Mã Hóa Đơn */}
                          <td className="py-3 px-5">
                            <span
                              className="font-mono text-xs font-bold text-gray-800 hover:text-blue-600 cursor-pointer"
                              onClick={() => handleOpenDetail(payment)}
                              title="Xem chi tiết"
                            >
                              {payment.id}
                            </span>
                          </td>

                          {/* Mã Đơn Hàng */}
                          <td className="py-3 px-5">
                            <button
                              type="button"
                              onClick={() =>
                                navigate(`/dashboard/orders/${payment.orderId}`)
                              }
                              className="inline-flex items-center gap-1 font-mono text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                              title="Đi tới chi tiết đơn hàng"
                            >
                              {payment.orderId}
                              <ArrowTopRightOnSquareIcon className="w-3 h-3 text-blue-400" />
                            </button>
                          </td>

                          {/* Khách Hàng */}
                          <td className="py-3 px-5">
                            {hasCustomer ? (
                              <div className="flex flex-col">
                                <span className="text-xs font-semibold text-gray-900">
                                  {payment.fullName || "Khách thành viên"}
                                </span>
                                {payment.userPhone && (
                                  <span className="text-[11px] font-mono text-gray-500">
                                    {payment.userPhone}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-gray-100 text-gray-600">
                                Khách vãng lai
                              </span>
                            )}
                          </td>

                          {/* Số Tiền Thực Thu */}
                          <td className="py-3 px-5">
                            <div className="flex flex-col">
                              <span
                                className={`text-xs font-bold ${
                                  payment.status === "REFUNDED"
                                    ? "text-red-600 line-through"
                                    : "text-emerald-700 font-semibold"
                                }`}
                              >
                                {formatMoney(payment.amount)}
                              </span>
                              {payment.pointDiscount > 0 && (
                                <span className="text-[10px] text-amber-700">
                                  -Giảm điểm: {formatMoney(payment.pointDiscount)}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Phương Thức */}
                          <td className="py-3 px-5">
                            {renderMethodBadge(payment.method)}
                          </td>

                          {/* Trạng Thái */}
                          <td className="py-3 px-5">
                            {renderStatusBadge(payment.status)}
                          </td>

                          {/* Thời Gian */}
                          <td className="py-3 px-5">
                            <Typography className="text-xs text-gray-600">
                              {formatDateTime(payment.paymentDate)}
                            </Typography>
                          </td>

                          {/* Thao Tác */}
                          <td className="py-3 px-5">
                            <div className="flex items-center gap-1.5">
                              {/* Xem chi tiết */}
                              <button
                                type="button"
                                onClick={() => handleOpenDetail(payment)}
                                className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Xem chi tiết giao dịch"
                              >
                                <EyeIcon className="w-4 h-4" />
                              </button>

                              {/* In hóa đơn */}
                              <button
                                type="button"
                                onClick={() => handlePrintInvoice(payment.id)}
                                className="p-1.5 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                title="In hóa đơn bán hàng"
                              >
                                <PrinterIcon className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
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

      {/* ===== MODAL CHI TIẾT GIAO DỊCH ===== */}
      {detailModal.open && detailModal.payment && (
        <div
          onClick={() => setDetailModal({ open: false, payment: null, refundHistory: [] })}
          className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-fadeIn"
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/70">
              <div>
                <Typography variant="h6" className="font-bold text-gray-900">
                  Chi Tiết Giao Dịch Thanh Toán
                </Typography>
                <div className="text-xs text-gray-500 font-mono mt-0.5">
                  ID: {detailModal.payment.id}
                </div>
              </div>
              <button
                onClick={() =>
                  setDetailModal({ open: false, payment: null, refundHistory: [] })
                }
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex flex-col gap-5">
              {/* Box 1: Tổng quan trạng thái & đơn hàng */}
              <div className="grid grid-cols-2 gap-3 p-4 bg-blue-50/40 rounded-xl border border-blue-100">
                <div>
                  <div className="text-[11px] font-semibold text-gray-500 uppercase">
                    Mã đơn hàng
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setDetailModal({ open: false, payment: null, refundHistory: [] });
                      navigate(`/dashboard/orders/${detailModal.payment.orderId}`);
                    }}
                    className="font-mono text-sm font-bold text-blue-600 hover:underline inline-flex items-center gap-1 mt-0.5"
                  >
                    {detailModal.payment.orderId}
                    <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div>
                  <div className="text-[11px] font-semibold text-gray-500 uppercase">
                    Thời gian giao dịch
                  </div>
                  <div className="text-xs font-medium text-gray-800 mt-0.5">
                    {formatDateTime(detailModal.payment.paymentDate)}
                  </div>
                </div>

                <div>
                  <div className="text-[11px] font-semibold text-gray-500 uppercase">
                    Phương thức
                  </div>
                  <div className="mt-1">
                    {renderMethodBadge(detailModal.payment.method)}
                  </div>
                </div>

                <div>
                  <div className="text-[11px] font-semibold text-gray-500 uppercase">
                    Trạng thái
                  </div>
                  <div className="mt-1">
                    {renderStatusBadge(detailModal.payment.status)}
                  </div>
                </div>
              </div>

              {/* Box 2: Thông tin khách hàng */}
              <div className="p-4 rounded-xl border border-gray-200">
                <div className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Thông tin khách hàng
                </div>
                {detailModal.payment.fullName || detailModal.payment.userPhone ? (
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-gray-500">Họ và tên:</span>{" "}
                      <span className="font-semibold text-gray-800">
                        {detailModal.payment.fullName || "—"}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Số điện thoại:</span>{" "}
                      <span className="font-mono font-semibold text-gray-800">
                        {detailModal.payment.userPhone || "—"}
                      </span>
                    </div>
                    {detailModal.payment.remainingPoints !== undefined && (
                      <div>
                        <span className="text-gray-500">Điểm hiện có:</span>{" "}
                        <span className="font-bold text-blue-600">
                          {detailModal.payment.remainingPoints} điểm
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-xs text-gray-500 italic">
                    Khách lẻ vãng lai (không lưu hồ sơ thành viên)
                  </div>
                )}
              </div>

              {/* Box 3: Chi tiết tài chính */}
              <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 flex flex-col gap-2 text-xs">
                <div className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Chi tiết thanh toán
                </div>

                <div className="flex justify-between items-center text-gray-600">
                  <span>Tổng tiền thanh toán:</span>
                  <span className="font-semibold text-gray-900">
                    {formatMoney(detailModal.payment.amount)}
                  </span>
                </div>

                {detailModal.payment.pointDiscount > 0 && (
                  <div className="flex justify-between items-center text-amber-700">
                    <span>
                      Giảm giá tích điểm ({detailModal.payment.usedPoints || 0} điểm):
                    </span>
                    <span className="font-semibold">
                      -{formatMoney(detailModal.payment.pointDiscount)}
                    </span>
                  </div>
                )}

                {detailModal.payment.cashReceived !== null &&
                  detailModal.payment.cashReceived !== undefined && (
                    <div className="flex justify-between items-center text-gray-600">
                      <span>Tiền khách đưa:</span>
                      <span className="font-medium text-gray-800">
                        {formatMoney(detailModal.payment.cashReceived)}
                      </span>
                    </div>
                  )}

                {detailModal.payment.changeAmount !== null &&
                  detailModal.payment.changeAmount !== undefined && (
                    <div className="flex justify-between items-center text-gray-600">
                      <span>Tiền thối lại cho khách:</span>
                      <span className="font-medium text-gray-800">
                        {formatMoney(detailModal.payment.changeAmount)}
                      </span>
                    </div>
                  )}

                {detailModal.payment.earnedPoints > 0 && (
                  <div className="flex justify-between items-center text-emerald-700 font-medium">
                    <span>Điểm thưởng tích được:</span>
                    <span>+{detailModal.payment.earnedPoints} điểm</span>
                  </div>
                )}

                {detailModal.payment.transactionId && (
                  <div className="flex justify-between items-center text-gray-500 pt-1 border-t border-gray-200 text-[11px]">
                    <span>Mã GD Cổng thanh toán:</span>
                    <span className="font-mono">{detailModal.payment.transactionId}</span>
                  </div>
                )}

                {detailModal.payment.note && (
                  <div className="text-[11px] text-gray-500 pt-1 border-t border-gray-200">
                    <span className="font-semibold">Ghi chú:</span> {detailModal.payment.note}
                  </div>
                )}
              </div>

              {/* Box 4: Lịch sử hoàn tiền nếu có */}
              {(detailModal.payment.status === "REFUNDED" ||
                detailModal.payment.status === "PARTIALLY_REFUNDED" ||
                detailModal.refundHistory.length > 0) && (
                <div className="p-4 rounded-xl border border-red-200 bg-red-50/40">
                  <div className="text-xs font-bold text-red-800 uppercase tracking-wider mb-2">
                    Lịch sử hoàn tiền / Đổi trả
                  </div>
                  {detailModal.refundHistory.length > 0 ? (
                    <div className="flex flex-col gap-2">
                      {detailModal.refundHistory.map((item, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 bg-white rounded-lg border border-red-100 text-xs flex justify-between items-center"
                        >
                          <div>
                            <div className="font-semibold text-red-700">
                              {formatMoney(item.amount)}
                            </div>
                            <div className="text-[11px] text-gray-500">
                              Lý do: {item.reason || "Khách yêu cầu trả hàng"}
                            </div>
                          </div>
                          <div className="text-[11px] text-gray-400">
                            {formatDateTime(item.date)}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-red-600">
                      Giao dịch đã được ghi nhận hoàn tiền.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/70">
              <Button
                size="sm"
                variant="outlined"
                color="blue"
                className="flex items-center gap-1.5 normal-case text-xs font-semibold"
                onClick={() => {
                  handlePrintInvoice(detailModal.payment.id);
                }}
              >
                <PrinterIcon className="w-4 h-4" />
                In lại hóa đơn
              </Button>

              <Button
                size="sm"
                color="gray"
                className="normal-case text-xs font-semibold"
                onClick={() =>
                  setDetailModal({ open: false, payment: null, refundHistory: [] })
                }
              >
                Đóng
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ===== MODAL IN HÓA ĐƠN NHIỆT (THERMAL RECEIPT PREVIEW) ===== */}
      {invoiceModal.open && (
        <div
          onClick={() => setInvoiceModal({ open: false, paymentId: null, htmlContent: "" })}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl w-full max-w-[420px] max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-fadeIn"
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <div>
                <div className="font-bold text-gray-900 text-sm">Xem Trước Hóa Đơn Bán Lẻ</div>
                <div className="text-xs font-mono text-gray-400">
                  {invoiceModal.paymentId}
                </div>
              </div>
              <button
                onClick={() =>
                  setInvoiceModal({ open: false, paymentId: null, htmlContent: "" })
                }
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-200"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Content: Cuộn bill in nhiệt */}
            <div className="p-4 overflow-y-auto bg-gray-100/60 flex items-center justify-center min-h-[300px]">
              {invoiceModal.loading ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-7 h-7 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-xs text-gray-500">Đang tạo bản in hóa đơn...</span>
                </div>
              ) : invoiceModal.htmlContent ? (
                <div className="bg-white p-5 shadow-sm rounded-lg border border-gray-200 w-[290px] text-[11px] font-mono leading-tight">
                  <div
                    dangerouslySetInnerHTML={{ __html: invoiceModal.htmlContent }}
                  />
                </div>
              ) : (
                <div className="text-xs text-red-500">
                  Không thể tải nội dung hóa đơn
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-2 p-4 border-t border-gray-100 bg-white">
              <Button
                size="sm"
                variant="outlined"
                color="gray"
                onClick={() =>
                  setInvoiceModal({ open: false, paymentId: null, htmlContent: "" })
                }
                className="normal-case text-xs font-semibold"
              >
                Đóng
              </Button>

              <Button
                size="sm"
                color="blue"
                onClick={handlePrint}
                disabled={!invoiceModal.htmlContent || invoiceModal.loading}
                className="flex items-center gap-1.5 normal-case text-xs font-semibold shadow-sm"
              >
                <PrinterIcon className="w-4 h-4" />
                In Hóa Đơn
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Payments;
