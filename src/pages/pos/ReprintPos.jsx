import { exportInvoice, fetchPayments, fetchPaymentSummary } from "@/features/payment/paymentThunks";
import { useEffect, useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import RefundModal from "./RefundModal";
import {
  PrinterIcon,
  ArrowUturnLeftIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
  ArrowLeftIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  BanknotesIcon,
  CreditCardIcon,
  QrCodeIcon,
  DocumentTextIcon,
  CalendarDaysIcon,
} from "@heroicons/react/24/solid";

/* ---------------- STATUS BADGE ---------------- */
const StatusBadge = ({ status }) => {
  const map = {
    SUCCESS: { label: "Thành công", color: "bg-emerald-100 text-emerald-800 border-emerald-200" },
    REFUNDED: { label: "Đã hoàn tiền", color: "bg-red-100 text-red-700 border-red-200" },
    PARTIALLY_REFUNDED: { label: "Hoàn một phần", color: "bg-amber-100 text-amber-800 border-amber-200" },
    FAILED: { label: "Thất bại", color: "bg-gray-100 text-gray-700 border-gray-300" },
    PENDING: { label: "Đang chờ", color: "bg-blue-100 text-blue-800 border-blue-200" },
  };

  const current = map[status] || { label: status, color: "bg-gray-100 text-gray-700 border-gray-200" };

  return (
    <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold border ${current.color}`}>
      {current.label}
    </span>
  );
};

/* ---------------- METHOD BADGE ---------------- */
const MethodBadge = ({ method }) => {
  switch (method) {
    case "CASH":
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded-md border border-green-200">
          <BanknotesIcon className="h-3.5 w-3.5" />
          Tiền mặt
        </span>
      );
    case "BANK_TRANSFER":
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
          <QrCodeIcon className="h-3.5 w-3.5" />
          Chuyển khoản QR
        </span>
      );
    case "MOMO":
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-pink-700 bg-pink-50 px-2 py-0.5 rounded-md border border-pink-200">
          Ví MoMo
        </span>
      );
    case "CREDIT_CARD":
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
          <CreditCardIcon className="h-3.5 w-3.5" />
          Thẻ / POS
        </span>
      );
    default:
      return <span className="text-xs text-gray-500 font-medium">{method || "—"}</span>;
  }
};

/* ---------------- RECEIPT COMPONENT ---------------- */
const ThermalReceipt = ({ html }) => {
  if (!html) return null;
  return (
    <div
      className="w-[280px] text-[11px] leading-relaxed font-mono text-black bg-white mx-auto p-4 rounded-lg shadow-inner border border-gray-200"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

/* ---------------- EXPANDED DETAIL ROW ---------------- */
const ExpandedDetail = ({ payment }) => {
  const Item = ({ label, value }) => (
    <div>
      <div className="text-[11px] text-gray-500 font-semibold mb-0.5">{label}</div>
      <div className="text-sm font-bold text-gray-800">{value}</div>
    </div>
  );

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 px-5 py-3.5 border-t border-gray-100 bg-gray-50/80 text-xs">
      <Item label="Mã đơn hàng (Order ID)" value={payment.orderId || "—"} />
      <Item label="Phương thức" value={<MethodBadge method={payment.method} />} />
      <Item label="Trạng thái" value={<StatusBadge status={payment.status} />} />
      <Item
        label="Tiền khách đưa"
        value={payment.cashReceived != null ? `${payment.cashReceived.toLocaleString()} đ` : "—"}
      />
      <Item
        label="Tiền thối lại"
        value={payment.changeAmount != null ? `${payment.changeAmount.toLocaleString()} đ` : "—"}
      />
      <Item label="Ghi chú" value={payment.note || "—"} />
    </div>
  );
};

/* ---------------- CARD COMPONENT ---------------- */
const PaymentCard = ({ payment, expanded, onToggle, onReprint, onRefund, isReprinting }) => {
  return (
    <div className={`bg-white border rounded-xl transition hover:border-blue-300 hover:shadow-sm ${expanded ? "shadow-sm border-blue-200" : "border-gray-200"}`}>
      <div
        onClick={onToggle}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-3.5 cursor-pointer select-none"
      >
        {/* LEFT: Mã giao dịch & Khách hàng */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-sm text-gray-900 truncate">
              {payment.transactionId}
            </span>
            <MethodBadge method={payment.method} />
          </div>
          <div className="text-xs text-gray-500 mt-0.5 truncate">
            <strong>{payment.fullName || payment.userName || "Khách vãng lai"}</strong>
            {(payment.userPhone || payment.Phone) && (
              <span className="text-gray-400"> • {payment.userPhone || payment.Phone}</span>
            )}
          </div>
        </div>

        {/* MIDDLE: Thời gian thanh toán */}
        <div className="text-xs text-gray-500 flex items-center gap-1 font-mono">
          <ClockIcon className="h-3.5 w-3.5 text-gray-400" />
          <span>{payment.paymentDate ? new Date(payment.paymentDate).toLocaleString("vi-VN") : "—"}</span>
        </div>

        {/* RIGHT: Trạng thái, Số tiền & Thao tác */}
        <div className="flex items-center gap-3 justify-between sm:justify-end">
          <StatusBadge status={payment.status} />

          <div
            className={`font-mono font-extrabold text-sm sm:text-base text-right min-w-[90px] ${
              payment.status === "REFUNDED" ? "text-red-600 line-through" : "text-emerald-700"
            }`}
          >
            {payment.finalAmount?.toLocaleString()} đ
          </div>

          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
            {/* Nút In Lại */}
            <button
              type="button"
              onClick={() => onReprint(payment.id)}
              disabled={isReprinting}
              className="bg-gray-900 hover:bg-black text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition flex items-center gap-1 shadow-sm disabled:opacity-50"
              title="Xem trước & In lại hóa đơn K80"
            >
              <PrinterIcon className="h-3.5 w-3.5" />
              <span>In bill</span>
            </button>

            {/* Nút Hoàn Tiền */}
            {payment.status !== "REFUNDED" && (
              <button
                type="button"
                onClick={() => onRefund(payment)}
                className="bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 border border-red-200 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition flex items-center gap-1"
                title="Hoàn tiền trả món"
              >
                <ArrowUturnLeftIcon className="h-3 w-3" />
                <span>Hoàn tiền</span>
              </button>
            )}
          </div>

          <ChevronDownIcon
            className={`h-4 w-4 text-gray-400 transition-transform ${
              expanded ? "rotate-180" : ""
            }`}
          />
        </div>
      </div>

      {expanded && <ExpandedDetail payment={payment} />}
    </div>
  );
};

/* ---------------- FILTER BAR ---------------- */
const FilterBar = ({ filters, onChange, onReset }) => {
  const base = "border border-gray-300 rounded-xl px-3 py-2 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500";

  // Phím lọc nhanh ngày
  const setQuickDate = (type) => {
    const today = new Date().toISOString().split("T")[0];
    if (type === "today") {
      onChange("fromDate", today);
      onChange("toDate", today);
    } else if (type === "7days") {
      const d = new Date();
      d.setDate(d.getDate() - 7);
      onChange("fromDate", d.toISOString().split("T")[0]);
      onChange("toDate", today);
    } else if (type === "month") {
      const d = new Date();
      const firstDay = new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split("T")[0];
      onChange("fromDate", firstDay);
      onChange("toDate", today);
    } else if (type === "all") {
      onChange("fromDate", "");
      onChange("toDate", "");
    }
  };

  return (
    <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm mb-5 space-y-3">
      {/* Hàng 1: Nút bấm lọc nhanh theo ngày */}
      <div className="flex flex-wrap items-center gap-2 pb-3 border-b border-gray-100 text-xs">
        <span className="font-semibold text-gray-500 mr-1 flex items-center gap-1">
          <CalendarDaysIcon className="h-4 w-4 text-blue-600" />
          Lọc nhanh:
        </span>
        <button
          type="button"
          onClick={() => setQuickDate("all")}
          className={`px-3 py-1 rounded-lg font-semibold transition border ${
            !filters.fromDate && !filters.toDate
              ? "bg-blue-600 text-white border-blue-600 shadow-sm"
              : "bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200"
          }`}
        >
          Tất cả thời gian
        </button>
        <button
          type="button"
          onClick={() => setQuickDate("today")}
          className="px-3 py-1 rounded-lg font-semibold bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 transition"
        >
          Hôm nay
        </button>
        <button
          type="button"
          onClick={() => setQuickDate("7days")}
          className="px-3 py-1 rounded-lg font-semibold bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 transition"
        >
          7 ngày qua
        </button>
        <button
          type="button"
          onClick={() => setQuickDate("month")}
          className="px-3 py-1 rounded-lg font-semibold bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 transition"
        >
          Tháng này
        </button>
      </div>

      {/* Hàng 2: Các ô nhập điều kiện lọc */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2.5">
        <div>
          <label className="block text-[11px] font-semibold text-gray-500 mb-1">Từ ngày</label>
          <input
            type="date"
            value={filters.fromDate}
            onChange={(e) => onChange("fromDate", e.target.value)}
            className={`${base} w-full`}
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-gray-500 mb-1">Đến ngày</label>
          <input
            type="date"
            value={filters.toDate}
            onChange={(e) => onChange("toDate", e.target.value)}
            className={`${base} w-full`}
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-gray-500 mb-1">Trạng thái</label>
          <select
            value={filters.status}
            onChange={(e) => onChange("status", e.target.value)}
            className={`${base} w-full`}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="SUCCESS">Thành công (SUCCESS)</option>
            <option value="REFUNDED">Đã hoàn tiền (REFUNDED)</option>
            <option value="PARTIALLY_REFUNDED">Hoàn một phần (PARTIALLY)</option>
            <option value="FAILED">Thất bại (FAILED)</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-gray-500 mb-1">Phương thức</label>
          <select
            value={filters.method}
            onChange={(e) => onChange("method", e.target.value)}
            className={`${base} w-full`}
          >
            <option value="">Tất cả phương thức</option>
            <option value="CASH">Tiền mặt (CASH)</option>
            <option value="BANK_TRANSFER">Chuyển khoản QR (BANK_TRANSFER)</option>
            <option value="MOMO">Ví MoMo (MOMO)</option>
            <option value="CREDIT_CARD">Thẻ / POS (CREDIT_CARD)</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-gray-500 mb-1">Tìm kiếm từ khóa</label>
          <div className="relative">
            <MagnifyingGlassIcon className="h-4 w-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              placeholder="Mã GD, SĐT, tên KH..."
              value={filters.keyword}
              onChange={(e) => onChange("keyword", e.target.value)}
              className={`${base} w-full pl-8`}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-1">
        <button
          type="button"
          onClick={onReset}
          className="text-xs text-gray-500 hover:text-red-600 font-semibold flex items-center gap-1 transition"
        >
          <ArrowPathIcon className="h-3.5 w-3.5" />
          <span>Đặt lại bộ lọc</span>
        </button>
      </div>
    </div>
  );
};

const INITIAL_FILTERS = {
  page: 1,
  size: 15,
  fromDate: "",
  toDate: "",
  status: "",
  method: "",
  keyword: "",
};

/* ================= MAIN COMPONENT ================= */
export default function ReprintPos() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { list = [], totalPages = 1, page = 0, loading = false, summary } = useSelector(
    (state) => state.payment
  );

  const [expandedRow, setExpandedRow] = useState(null);
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [reprintingId, setReprintingId] = useState(null);

  // Invoice modal state
  const [modal, setModal] = useState({
    open: false,
    paymentId: null,
    htmlContent: "",
    payment: null,
  });

  // Refund modal state
  const [refundModal, setRefundModal] = useState({
    open: false,
    payment: null,
  });

  // Phím tắt Esc đóng modal xem trước
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape" && modal.open) {
        closeInvoiceModal();
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [modal.open]);

  // Tự động tải danh sách & tóm tắt theo bộ lọc
  useEffect(() => {
    const t = setTimeout(() => {
      dispatch(fetchPayments(filters));
      dispatch(fetchPaymentSummary(filters));
    }, 350);
    return () => clearTimeout(t);
  }, [filters, dispatch]);

  const handleFilterChange = (k, v) =>
    setFilters((prev) => ({ ...prev, [k]: v, page: 1 }));

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  // Mở xem trước hóa đơn in nhiệt
  const handleReprint = async (id) => {
    setReprintingId(id);
    try {
      const payment = list.find((p) => p.id === id) || null;
      const res = await dispatch(exportInvoice(id)).unwrap();
      setModal({ open: true, paymentId: id, htmlContent: res, payment });
    } catch (err) {
      console.error("Export invoice error:", err);
    } finally {
      setReprintingId(null);
    }
  };

  // In hóa đơn nhiệt chuẩn K80
  const handlePrint = () => {
    if (!modal.htmlContent) return;

    const printWindow = window.open("", "_blank", "width=400,height=650");
    if (!printWindow) {
      alert("Trình duyệt đã chặn pop-up. Vui lòng cho phép mở pop-up để in hóa đơn!");
      return;
    }

    const styledHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8"/>
        <title>In Lại Hóa Đơn - ${modal.paymentId || ""}</title>
        <style>
          @page {
            size: 80mm auto;
            margin: 0;
          }
          @media print {
            body {
              margin: 0;
              padding: 4mm;
              width: 80mm;
              font-family: monospace;
            }
          }
        </style>
      </head>
      <body>
        ${modal.htmlContent}
        <script>
          window.onload = function() {
            window.focus();
            window.print();
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(styledHtml);
    printWindow.document.close();
  };

  const openRefund = (payment) => setRefundModal({ open: true, payment });
  const closeRefund = () => setRefundModal({ open: false, payment: null });
  const closeInvoiceModal = () =>
    setModal({ open: false, paymentId: null, htmlContent: "", payment: null });

  return (
    <div className="p-4 sm:p-6 bg-gray-100 min-h-screen font-sans">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <DocumentTextIcon className="h-6 w-6 text-blue-600" />
            Tra Cứu & In Lại Hóa Đơn (Reprint POS)
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Lịch sử giao dịch bán hàng, xem lại hóa đơn nhiệt K80 và hỗ trợ hoàn trả món
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/pos")}
          className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm self-start sm:self-auto"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          <span>Quay lại POS</span>
        </button>
      </div>

      {/* THẺ THỐNG KÊ DOANH THU & GIAO DỊCH */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <div className="bg-white p-3.5 rounded-2xl border border-gray-200 shadow-sm">
          <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">
            Tổng giao dịch
          </div>
          <div className="text-xl font-extrabold text-gray-900 mt-1 font-mono">
            {summary?.totalTransactions != null ? Number(summary.totalTransactions).toLocaleString() : list.length}
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-gray-200 shadow-sm">
          <div className="text-[11px] font-bold text-emerald-600 uppercase tracking-wide">
            Tổng doanh thu
          </div>
          <div className="text-xl font-extrabold text-emerald-700 mt-1 font-mono">
            {summary?.totalRevenue != null
              ? `${Number(summary.totalRevenue).toLocaleString()} đ`
              : "0 đ"}
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-gray-200 shadow-sm">
          <div className="text-[11px] font-bold text-blue-600 uppercase tracking-wide">
            Tiền mặt / Điện tử
          </div>
          <div className="text-xs font-semibold text-gray-700 mt-1.5 space-y-0.5">
            <div>Tiền mặt: <strong className="text-gray-900 font-mono">{summary?.totalCash != null ? Number(summary.totalCash).toLocaleString() : 0} đ</strong></div>
            <div>Điện tử: <strong className="text-gray-900 font-mono">{summary?.totalDigital != null ? Number(summary.totalDigital).toLocaleString() : 0} đ</strong></div>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-gray-200 shadow-sm">
          <div className="text-[11px] font-bold text-red-500 uppercase tracking-wide">
            Đã hoàn tiền
          </div>
          <div className="text-xl font-extrabold text-red-600 mt-1 font-mono">
            {summary?.totalRefunded != null
              ? `${Number(summary.totalRefunded).toLocaleString()} đ`
              : "0 đ"}
          </div>
        </div>
      </div>

      {/* BỘ LỌC TÌM KIẾM */}
      <FilterBar
        filters={filters}
        onChange={handleFilterChange}
        onReset={() => setFilters(INITIAL_FILTERS)}
      />

      {/* DANH SÁCH GIAO DỊCH */}
      <div className="flex flex-col gap-2.5">
        {loading ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-xs font-semibold text-gray-500">Đang tải danh sách giao dịch...</p>
          </div>
        ) : list.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-200 text-gray-400">
            <DocumentTextIcon className="h-10 w-10 mx-auto text-gray-300 mb-2" />
            <p className="text-sm font-semibold text-gray-700">Không tìm thấy giao dịch nào</p>
            <p className="text-xs text-gray-400 mt-1">
              Thử thay đổi bộ lọc ngày hoặc từ khóa tìm kiếm
            </p>
          </div>
        ) : (
          list.map((p) => (
            <PaymentCard
              key={p.id}
              payment={p}
              expanded={expandedRow === p.id}
              onToggle={() => setExpandedRow(expandedRow === p.id ? null : p.id)}
              onReprint={handleReprint}
              onRefund={openRefund}
              isReprinting={reprintingId === p.id}
            />
          ))
        )}
      </div>

      {/* PHÂN TRANG */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white px-5 py-3 rounded-2xl border border-gray-200 shadow-sm mt-4">
          <div className="text-xs text-gray-500 font-medium">
            Trang <strong>{filters.page}</strong> / <strong>{totalPages}</strong>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={filters.page <= 1}
              onClick={() => handlePageChange(filters.page - 1)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-semibold hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              ← Trang trước
            </button>
            <button
              type="button"
              disabled={filters.page >= totalPages}
              onClick={() => handlePageChange(filters.page + 1)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-semibold hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              Trang sau →
            </button>
          </div>
        </div>
      )}

      {/* MODAL XEM TRƯỚC HÓA ĐƠN K80 (TÁCH BIỆT QUA PORTAL) */}
      {modal.open && typeof document !== "undefined" && createPortal(
        <div
          onClick={closeInvoiceModal}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl w-[400px] max-w-[94vw] max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-fade-in"
          >
            {/* Header Modal */}
            <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
              <div>
                <div className="font-bold text-sm text-gray-800 flex items-center gap-1.5">
                  <PrinterIcon className="h-4 w-4 text-blue-600" />
                  <span>Xem Trước & In Lại Hóa Đơn</span>
                </div>
                <div className="text-[11px] text-gray-400 font-mono mt-0.5">
                  ID: {modal.paymentId}
                </div>
              </div>
              <button
                type="button"
                onClick={closeInvoiceModal}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            {/* Nội dung hóa đơn */}
            <div className="p-5 overflow-y-auto bg-gray-100 flex-1">
              <ThermalReceipt html={modal.htmlContent} />
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-end gap-2 p-3.5 border-t border-gray-100 bg-white">
              <button
                type="button"
                onClick={closeInvoiceModal}
                className="px-3.5 py-2 border border-gray-300 hover:bg-gray-50 rounded-xl text-xs font-semibold text-gray-700 transition"
              >
                Đóng (Esc)
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="bg-gray-900 hover:bg-black text-white px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow"
              >
                <PrinterIcon className="h-4 w-4" />
                <span>🖨 In hóa đơn (K80)</span>
              </button>

              {modal.payment?.status !== "REFUNDED" && (
                <button
                  type="button"
                  onClick={() => {
                    closeInvoiceModal();
                    openRefund(modal.payment);
                  }}
                  className="bg-red-500 hover:bg-red-600 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1 shadow"
                >
                  <ArrowUturnLeftIcon className="h-3.5 w-3.5" />
                  <span>Hoàn tiền</span>
                </button>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* MODAL HOÀN TIỀN */}
      <RefundModal
        open={refundModal.open}
        payment={refundModal.payment}
        onClose={closeRefund}
        onSuccess={() => {
          dispatch(fetchPayments(filters));
          dispatch(fetchPaymentSummary(filters));
        }}
      />
    </div>
  );
}
