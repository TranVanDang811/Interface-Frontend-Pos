import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { useDispatch, useSelector } from "react-redux";

import { createOrder } from "@/features/order/orderThunks";
import { clearCart } from "@/features/posCart/posCartSlice";
import { createPayment, exportInvoice } from "@/features/payment/paymentThunks";
import { findUserByPhone } from "@/features/user/userThunks";
import { showAlert } from "@/features/alert/alertSlice";
import { fetchActiveDiscounts } from "@/features/discount/discountThunks";
import AddCustomerPos from "./AddCustomerPos";

import {
  BanknotesIcon,
  CreditCardIcon,
  DevicePhoneMobileIcon,
  QrCodeIcon,
  PrinterIcon,
  CheckCircleIcon,
  XMarkIcon,
  ArrowLeftIcon,
  UserIcon,
  UserPlusIcon,
  TicketIcon,
  SparklesIcon,
  ShoppingBagIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/solid";

export default function PaymentPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const { activeDiscounts = [] } = useSelector((state) => state.discount);
  const reduxOrder = useSelector((state) => state.posCart?.items) || [];
  const order = reduxOrder.length > 0 ? reduxOrder : location.state?.order || [];
  const { currentUser, customer } = useSelector((state) => state.user);

  // Khách hàng & Điểm
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [usedPoints, setUsedPoints] = useState(0);
  const [pointError, setPointError] = useState("");
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);

  // Voucher / Giảm giá
  const [voucherCode, setVoucherCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(null);
  const [voucher, setVoucher] = useState(0);
  const [showDiscountList, setShowDiscountList] = useState(false);

  // Phương thức thanh toán (Khớp với enum Backend: CASH, BANK_TRANSFER, MOMO, CREDIT_CARD)
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [customerMoney, setCustomerMoney] = useState(0);

  // Trạng thái thanh toán & in hóa đơn
  const [isSubmitting, setIsSubmitting] = useState(false);
  const containerRef = useRef(null);
  const [printModal, setPrintModal] = useState({
    open: false,
    paymentId: null,
    htmlContent: "",
    loading: false,
  });

  // Tải danh sách mã giảm giá khả dụng
  useEffect(() => {
    dispatch(fetchActiveDiscounts());
  }, [dispatch]);

  // Tự động điền tên khi tìm thấy khách hàng
  useEffect(() => {
    if (customer) {
      setCustomerName(customer.fullName || "");
    }
  }, [customer]);

  // Đảm bảo viewport ở vị trí (0,0) khi mở trang
  useEffect(() => {
    window.scrollTo(0, 0);
    if (document.documentElement) document.documentElement.scrollLeft = 0;
    if (document.body) document.body.scrollLeft = 0;
  }, []);

  // Phím tắt: Esc để đóng modal/menu, Enter để in hóa đơn khi modal đang mở
  useEffect(() => {
    const handleKeys = (e) => {
      if (printModal.open) {
        if (e.key === "Escape") {
          handleCloseModal();
        } else if (e.key === "Enter") {
          handlePrint();
        }
      } else if (showDiscountList && e.key === "Escape") {
        setShowDiscountList(false);
      }
    };
    window.addEventListener("keydown", handleKeys);
    return () => window.removeEventListener("keydown", handleKeys);
  }, [printModal.open, showDiscountList, printModal.htmlContent]);

  // Tính toán tiền hàng với kiểm tra Number an toàn tránh NaN
  const subtotal = useMemo(() => {
    return order.reduce((sum, item) => {
      const price = Number(item.price) || 0;
      const qty = Number(item.quantity) || 1;
      return sum + price * qty;
    }, 0);
  }, [order]);

  const safeVoucher = Number(voucher) || 0;
  const pointDiscount = Number(usedPoints) || 0;
  const totalAfterDiscount = Math.max(0, subtotal - safeVoucher - pointDiscount);
  const safeCustomerMoney = Number(customerMoney) || 0;
  const change = Math.max(0, safeCustomerMoney - totalAfterDiscount);

  // Tự động điền tiền khách đưa khi chọn Chuyển khoản / MoMo / Thẻ
  useEffect(() => {
    if (paymentMethod !== "CASH") {
      setCustomerMoney(totalAfterDiscount);
    }
  }, [paymentMethod, totalAfterDiscount]);

  // Tra cứu số điện thoại khách hàng
  const handlePhoneChange = (e) => {
    const phone = e.target.value.replace(/\D/g, "");
    setCustomerPhone(phone);
    if (phone.length >= 10) {
      dispatch(findUserByPhone(phone));
    }
  };

  // Áp dụng mã giảm giá
  const handleApplyDiscount = (discount) => {
    setAppliedDiscount(discount);
    setVoucherCode(discount.code);
    setVoucher(Number(discount.value) || 0);
    setShowDiscountList(false);
  };

  const handleRemoveDiscount = () => {
    setAppliedDiscount(null);
    setVoucherCode("");
    setVoucher(0);
  };

  // Sử dụng điểm tích lũy
  const maxAvailablePoints = customer?.customerProfile?.loyaltyPoints || 0;

  const handlePointChange = (val) => {
    const num = Math.max(0, parseInt(val, 10) || 0);
    if (num > maxAvailablePoints) {
      setPointError(`Khách chỉ có tối đa ${maxAvailablePoints.toLocaleString()} điểm`);
      setUsedPoints(maxAvailablePoints);
    } else if (num > subtotal - safeVoucher) {
      setPointError(`Điểm không thể vượt quá giá trị đơn hàng sau khi trừ voucher`);
      setUsedPoints(Math.max(0, subtotal - safeVoucher));
    } else {
      setPointError("");
      setUsedPoints(num);
    }
  };

  const handleUseMaxPoints = () => {
    const maxCanUse = Math.min(maxAvailablePoints, Math.max(0, subtotal - safeVoucher));
    setUsedPoints(maxCanUse);
    setPointError("");
  };

  // Tiền mặt nhanh (Quick cash)
  const handleQuickCash = (amount) => {
    setCustomerMoney((prev) => (Number(prev) || 0) + amount);
  };

  const handleSetExact = () => {
    setCustomerMoney(totalAfterDiscount);
  };

  const handleClearMoney = () => {
    setCustomerMoney(0);
  };

  // Gợi ý mốc tiền làm tròn thông minh
  const smartRoundSuggestions = useMemo(() => {
    if (totalAfterDiscount <= 0) return [];
    const suggestions = new Set();
    suggestions.add(totalAfterDiscount);

    // Làm tròn 50.000đ
    const round50k = Math.ceil(totalAfterDiscount / 50000) * 50000;
    if (round50k > totalAfterDiscount) suggestions.add(round50k);

    // Làm tròn 100.000đ
    const round100k = Math.ceil(totalAfterDiscount / 100000) * 100000;
    if (round100k > totalAfterDiscount) suggestions.add(round100k);

    // Các mốc tiền thông dụng lớn hơn
    if (totalAfterDiscount < 200000) suggestions.add(200000);
    if (totalAfterDiscount < 500000) suggestions.add(500000);

    return Array.from(suggestions)
      .sort((a, b) => a - b)
      .slice(0, 4);
  }, [totalAfterDiscount]);

  // Xử lý xác nhận thanh toán
  const handlePayment = async () => {
    if (order.length === 0) {
      dispatch(
        showAlert({ type: "red", message: "Giỏ hàng trống. Vui lòng quay lại POS chọn món!" })
      );
      return;
    }

    if (paymentMethod === "CASH" && safeCustomerMoney < totalAfterDiscount) {
      dispatch(
        showAlert({
          type: "red",
          message: `Số tiền khách đưa chưa đủ! Thiếu ${(totalAfterDiscount - safeCustomerMoney).toLocaleString()} đ`,
        })
      );
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Tạo đơn hàng (Gắn đúng SĐT khách hàng)
      const orderPayload = {
        userPhone: customerPhone || currentUser?.phone || null,
        discountCode: appliedDiscount?.code || null,
        orderDetails: order.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
        })),
      };

      const orderRes = await dispatch(createOrder(orderPayload)).unwrap();

      // 2. Tạo bản ghi thanh toán
      const paymentPayload = {
        userPhone: customerPhone || null,
        orderId: orderRes.id,
        cashReceived: paymentMethod === "CASH" ? safeCustomerMoney : totalAfterDiscount,
        method: paymentMethod, // CASH, BANK_TRANSFER, MOMO, CREDIT_CARD
        usedPoints: usedPoints,
        note: `POS Payment - ${paymentMethod}`,
      };

      const paymentRes = await dispatch(createPayment(paymentPayload)).unwrap();

      dispatch(
        showAlert({
          type: "green",
          message: "Thanh toán thành công!",
        })
      );

      // 3. Mở modal xem trước hóa đơn
      setPrintModal({
        open: true,
        paymentId: paymentRes.id,
        htmlContent: "",
        loading: true,
      });

      // 4. Lấy nội dung hóa đơn in nhiệt từ backend
      const invoiceRes = await dispatch(exportInvoice(paymentRes.id));

      setPrintModal({
        open: true,
        paymentId: paymentRes.id,
        htmlContent: invoiceRes.payload,
        loading: false,
      });
    } catch (err) {
      console.error("Payment error:", err);
      dispatch(
        showAlert({
          type: "red",
          message: err?.message || err?.response?.data?.message || "Thanh toán thất bại. Vui lòng thử lại!",
        })
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // In hóa đơn nhiệt chuẩn K80
  const handlePrint = () => {
    if (!printModal.htmlContent) return;

    const printWindow = window.open("", "_blank", "width=400,height=650");
    if (!printWindow) {
      dispatch(
        showAlert({
          type: "orange",
          message: "Trình duyệt đã chặn pop-up. Vui lòng cấp quyền mở pop-up để in hóa đơn!",
        })
      );
      return;
    }

    const styledHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <title>In Hóa Đơn - ${printModal.paymentId || ""}</title>
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
        ${printModal.htmlContent}
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

  // Đóng modal và hoàn tất thanh toán
  const handleCloseModal = () => {
    dispatch(clearCart());
    setPrintModal({ open: false, paymentId: null, htmlContent: "", loading: false });
    navigate("/pos");
  };

  return (
    <>
      <div
        ref={containerRef}
      className="flex h-screen w-full bg-gray-100 overflow-hidden font-sans select-none"
    >
      {/* CỘT TRÁI: THÔNG TIN KHÁCH HÀNG, MÃ GIẢM GIÁ & PHƯƠNG THỨC THANH TOÁN */}
      <div className="flex-1 min-w-0 p-4 lg:p-6 bg-white overflow-y-auto border-r border-gray-200">
        {/* Header điều hướng */}
        <div className="flex items-center justify-between pb-4 mb-5 border-b border-gray-100">
          <button
            onClick={() => navigate("/pos")}
            className="flex items-center gap-2 text-base font-bold text-gray-600 hover:text-blue-600 transition"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            <span>Quay lại POS</span>
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Thu Ngân & Thanh Toán</h1>
          <span className="text-sm text-gray-500 font-mono">
            {new Date().toLocaleDateString("vi-VN")}
          </span>
        </div>

        {/* 1. THÔNG TIN KHÁCH HÀNG & TÍCH ĐIỂM */}
        <div className="bg-gray-50/80 rounded-2xl p-5 border border-gray-200/80 mb-5">
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center gap-2.5">
              <UserIcon className="h-6 w-6 text-blue-600 shrink-0" />
              <h2 className="text-base font-bold text-gray-800 uppercase tracking-wide">
                Khách Hàng & Điểm Tích Lũy
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setShowAddCustomerModal(true)}
              className="px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Đăng ký tài khoản khách hàng mới ngay tại quầy"
            >
              <UserPlusIcon className="h-4 w-4" />
              <span>+ Khách mới</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-3">
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
                Số điện thoại khách hàng
              </label>
              <input
                type="text"
                placeholder="Nhập 10 số SĐT để tra cứu..."
                className="w-full h-11 px-3.5 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                value={customerPhone}
                onChange={handlePhoneChange}
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
                Tên khách hàng
              </label>
              <input
                type="text"
                placeholder="Tên khách hàng (hoặc Khách vãng lai)"
                className="w-full h-11 px-3.5 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
            </div>
          </div>

          {/* Gợi ý tạo khách mới nếu SĐT chưa có trong hệ thống */}
          {!customer && customerPhone.length === 10 && (
            <div className="mb-3 p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center justify-between">
              <span>Chưa có thông tin khách hàng với số điện thoại <strong>{customerPhone}</strong></span>
              <button
                type="button"
                onClick={() => setShowAddCustomerModal(true)}
                className="text-blue-600 font-bold hover:underline cursor-pointer ml-2"
              >
                + Đăng ký khách này ngay
              </button>
            </div>
          )}

          {/* Thẻ hiển thị điểm tích lũy */}
          {customer && (
            <div className="bg-white rounded-xl p-3.5 border border-blue-200 flex items-center justify-between mb-3 shadow-xs">
              <div>
                <div className="text-sm font-bold text-gray-800 flex items-center gap-2">
                  <SparklesIcon className="h-5 w-5 text-amber-500 shrink-0" />
                  <span>{customer.fullName || customer.username}</span>
                  <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2.5 py-0.5 rounded-full ml-1">
                    {customer.customerProfile?.membershipLevel || "Thành viên"}
                  </span>
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  Điểm hiện có:{" "}
                  <strong className="text-amber-600 text-base font-bold">
                    {maxAvailablePoints.toLocaleString()} điểm
                  </strong>
                </div>
              </div>

              {maxAvailablePoints > 0 && (
                <button
                  type="button"
                  onClick={handleUseMaxPoints}
                  className="px-3.5 py-1.5 text-sm font-bold bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-300 rounded-lg transition"
                >
                  Dùng tối đa
                </button>
              )}
            </div>
          )}

          {/* Ô nhập số điểm muốn dùng */}
          {maxAvailablePoints > 0 && (
            <div className="mt-2.5">
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-sm font-semibold text-gray-700">
                  Số điểm muốn tiêu cho đơn này (1 điểm = 1 đ):
                </label>
                {usedPoints > 0 && (
                  <button
                    onClick={() => {
                      setUsedPoints(0);
                      setPointError("");
                    }}
                    className="text-sm text-red-500 hover:underline font-semibold"
                  >
                    Hủy dùng điểm
                  </button>
                )}
              </div>
              <input
                type="number"
                min="0"
                max={maxAvailablePoints}
                placeholder="Nhập số điểm muốn dùng..."
                className="w-full h-11 px-3.5 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white font-medium"
                value={usedPoints || ""}
                onChange={(e) => handlePointChange(e.target.value)}
              />
              {pointError && (
                <p className="text-sm text-red-500 mt-1 font-medium">{pointError}</p>
              )}
            </div>
          )}
        </div>

        {/* 2. MÃ GIẢM GIÁ / VOUCHER */}
        <div className="bg-gray-50/80 rounded-2xl p-5 border border-gray-200/80 mb-5">
          <div className="flex items-center gap-2.5 mb-3.5">
            <TicketIcon className="h-6 w-6 text-green-600 shrink-0" />
            <h2 className="text-base font-bold text-gray-800 uppercase tracking-wide">
              Mã Giảm Giá / Voucher
            </h2>
          </div>

          <div className="relative">
            <div className="flex gap-2.5">
              <input
                type="text"
                placeholder="Nhập hoặc chọn mã giảm giá khả dụng..."
                className="flex-1 h-11 px-3.5 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white uppercase font-mono font-bold"
                value={voucherCode}
                readOnly={!!appliedDiscount}
                onChange={(e) => setVoucherCode(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowDiscountList((prev) => !prev)}
                className="bg-green-600 hover:bg-green-700 text-white px-5 rounded-xl text-sm font-bold transition shadow-sm whitespace-nowrap"
                style={{ backgroundColor: '#16a34a', color: '#ffffff' }}
              >
                {showDiscountList ? "Đóng danh sách" : "Chọn mã giảm"}
              </button>
            </div>

            {/* Dropdown danh sách mã giảm giá */}
            {showDiscountList && (
              <div className="absolute z-30 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-xl max-h-60 overflow-y-auto divide-y divide-gray-100">
                {activeDiscounts.length === 0 ? (
                  <div className="p-4 text-gray-400 text-xs text-center">
                    Hiện không có mã giảm giá nào đang kích hoạt.
                  </div>
                ) : (
                  activeDiscounts.map((discount) => (
                    <button
                      key={discount.id || discount.code}
                      onClick={() => handleApplyDiscount(discount)}
                      className="w-full text-left p-3 hover:bg-green-50/60 transition flex justify-between items-center group"
                    >
                      <div>
                        <span className="font-mono font-bold text-green-700 text-sm">
                          {discount.code}
                        </span>
                        <span className="ml-2 text-xs text-gray-600 font-medium">
                          {discount.name}
                        </span>
                      </div>
                      <span className="text-green-600 font-extrabold text-sm group-hover:scale-105 transition-transform">
                        -{Number(discount.value).toLocaleString()} đ
                      </span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Hiển thị badge mã đang áp dụng */}
          {appliedDiscount && (
            <div className="mt-2.5 flex items-center justify-between bg-green-50 border border-green-300 rounded-xl px-3 py-2 text-xs">
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="h-4 w-4 text-green-600" />
                <span className="font-bold text-green-800 font-mono">
                  {appliedDiscount.code}
                </span>
                <span className="text-gray-600">({appliedDiscount.name})</span>
                <span className="font-bold text-green-700">
                  -{(Number(appliedDiscount.value) || 0).toLocaleString()} đ
                </span>
              </div>
              <button
                type="button"
                onClick={handleRemoveDiscount}
                className="text-red-500 hover:text-red-700 font-bold text-xs"
              >
                ✕ Hủy mã
              </button>
            </div>
          )}
        </div>

        {/* 3. PHƯƠNG THỨC THANH TOÁN */}
        <div className="bg-gray-50/80 rounded-2xl p-4 border border-gray-200/80">
          <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide mb-3">
            Chọn Phương Thức Thanh Toán
          </h2>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 mb-4">
            {/* Tiền mặt */}
            <button
              type="button"
              onClick={() => setPaymentMethod("CASH")}
              className={`p-3.5 rounded-xl border flex flex-col items-center justify-center gap-2 transition font-bold text-sm ${paymentMethod === "CASH"
                ? "bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-300"
                : "bg-white text-gray-700 hover:bg-gray-100 border-gray-200"
                }`}
            >
              <BanknotesIcon className="h-6 w-6" />
              <span>Tiền mặt</span>
            </button>

            {/* Chuyển khoản (VietQR) */}
            <button
              type="button"
              onClick={() => setPaymentMethod("BANK_TRANSFER")}
              className={`p-3.5 rounded-xl border flex flex-col items-center justify-center gap-2 transition font-bold text-sm ${paymentMethod === "BANK_TRANSFER"
                ? "bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-300"
                : "bg-white text-gray-700 hover:bg-gray-100 border-gray-200"
                }`}
            >
              <QrCodeIcon className="h-6 w-6" />
              <span>Chuyển khoản (QR)</span>
            </button>

            {/* Ví MoMo */}
            <button
              type="button"
              onClick={() => setPaymentMethod("MOMO")}
              className={`p-3.5 rounded-xl border flex flex-col items-center justify-center gap-2 transition font-bold text-sm ${paymentMethod === "MOMO"
                ? "bg-pink-600 text-white border-pink-600 shadow-md ring-2 ring-pink-300"
                : "bg-white text-gray-700 hover:bg-gray-100 border-gray-200"
                }`}
            >
              <DevicePhoneMobileIcon className="h-6 w-6" />
              <span>Ví MoMo</span>
            </button>

            {/* Thẻ ngân hàng */}
            <button
              type="button"
              onClick={() => setPaymentMethod("CREDIT_CARD")}
              className={`p-3.5 rounded-xl border flex flex-col items-center justify-center gap-2 transition font-bold text-sm ${paymentMethod === "CREDIT_CARD"
                ? "bg-indigo-600 text-white border-indigo-600 shadow-md ring-2 ring-indigo-300"
                : "bg-white text-gray-700 hover:bg-gray-100 border-gray-200"
                }`}
            >
              <CreditCardIcon className="h-6 w-6" />
              <span>Thẻ / POS</span>
            </button>
          </div>

          {/* Khu vực chi tiết theo từng phương thức */}
          {paymentMethod === "BANK_TRANSFER" && (
            <div className="bg-white rounded-xl p-4 border border-blue-200 flex flex-col sm:flex-row items-center gap-5">
              <div className="bg-white p-2.5 rounded-xl border border-gray-200 shadow-sm flex-shrink-0">
                <img
                  src={`https://img.vietqr.io/image/MB-0345678999-compact2.png?amount=${totalAfterDiscount}&addInfo=POS%20Thanh%20Toan`}
                  alt="VietQR Chuyển khoản"
                  className="w-40 h-40 object-contain"
                />
              </div>
              <div className="text-sm space-y-2 text-gray-700">
                <div className="font-bold text-base text-blue-700 flex items-center gap-1.5">
                  <QrCodeIcon className="h-5 w-5" />
                  <span>Quét mã VietQR bằng ứng dụng Ngân hàng</span>
                </div>
                <div>Ngân hàng: <strong className="text-gray-900">MB Bank (Quân Đội)</strong></div>
                <div>Số tài khoản: <strong className="font-mono text-base text-gray-900">0345678999</strong></div>
                <div>Chủ tài khoản: <strong className="text-gray-900">DANG CAP STORE</strong></div>
                <div>
                  Số tiền cần chuyển:{" "}
                  <strong className="text-blue-600 text-base font-extrabold">
                    {totalAfterDiscount.toLocaleString()} đ
                  </strong>
                </div>
                <div className="text-xs text-gray-400 italic">
                  * Mã QR tự động điền số tiền chính xác cho khách hàng
                </div>
              </div>
            </div>
          )}

          {paymentMethod === "MOMO" && (
            <div className="bg-pink-50/60 rounded-xl p-5 border border-pink-200 flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-pink-600 text-white flex items-center justify-center font-bold text-xl shadow">
                MoMo
              </div>
              <div className="text-sm space-y-1.5 text-gray-700">
                <div className="font-bold text-base text-pink-700">Thanh toán qua Ví MoMo</div>
                <div>Số điện thoại nhận: <strong className="font-mono text-base text-gray-900">0345 678 999</strong></div>
                <div>
                  Số tiền: <strong className="text-pink-600 text-base font-extrabold">{totalAfterDiscount.toLocaleString()} đ</strong>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CỘT PHẢI: TÓM TẮT ĐƠN HÀNG, TÍNH TIỀN & NÚT XÁC NHẬN CỐ ĐỊNH Ở ĐÁY */}
      <div className="w-[370px] lg:w-[410px] xl:w-[440px] flex-shrink-0 bg-gray-50 flex flex-col h-full border-l border-gray-200 shadow-xl overflow-hidden">
        {/* PHẦN CUỘN NỘI DUNG: MÓN, TỔNG TIỀN, TIỀN MẶT */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* TÓM TẮT ĐƠN HÀNG */}
          <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-100">
              <div className="font-bold text-sm text-gray-800 uppercase tracking-wide flex items-center gap-1.5">
                <ShoppingBagIcon className="h-5 w-5 text-blue-600" />
                <span>Món trong đơn ({order.length})</span>
              </div>
              <span className="text-sm text-gray-500 font-semibold">
                {order.reduce((sum, i) => sum + (Number(i.quantity) || 1), 0)} sản phẩm
              </span>
            </div>

            <div className="max-h-40 overflow-y-auto space-y-2 pr-1 divide-y divide-gray-100">
              {order.length === 0 ? (
                <div className="text-center py-4 text-sm text-gray-400">
                  Không có sản phẩm nào trong đơn hàng
                </div>
              ) : (
                order.map((item) => (
                  <div key={item.id} className="pt-2 flex justify-between items-center text-sm">
                    <div className="flex-1 pr-2 truncate">
                      <span className="font-bold text-gray-900">{item.name}</span>
                      <span className="text-gray-500 ml-2 font-bold">x{item.quantity}</span>
                    </div>
                    <span className="font-extrabold text-gray-800">
                      {((Number(item.price) || 0) * (Number(item.quantity) || 1)).toLocaleString()} đ
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* BẢNG TỔNG KẾT TIỀN */}
          <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm space-y-2.5 text-sm">
            <div className="flex justify-between text-gray-700">
              <span>Tổng tiền hàng</span>
              <span className="font-bold text-gray-900">{subtotal.toLocaleString()} đ</span>
            </div>

            {safeVoucher > 0 && (
              <div className="flex justify-between text-green-600 font-medium">
                <span>Voucher giảm giá</span>
                <span className="font-bold">-{safeVoucher.toLocaleString()} đ</span>
              </div>
            )}

            {pointDiscount > 0 && (
              <div className="flex justify-between text-blue-600 font-medium">
                <span>Giảm từ điểm tích lũy</span>
                <span className="font-bold">-{pointDiscount.toLocaleString()} đ</span>
              </div>
            )}

            <div className="flex justify-between items-center font-extrabold text-base border-t border-dashed border-gray-200 pt-3">
              <span className="text-gray-900">Số tiền cần thanh toán</span>
              <span className="text-2xl text-blue-600 font-black">
                {totalAfterDiscount.toLocaleString()} đ
              </span>
            </div>
          </div>

          {/* KHU VỰC TIỀN MẶT KHÁCH ĐƯA & TIỀN THỪA (CHỈ HIỂN THỊ KHI CHỌN CASH) */}
          {paymentMethod === "CASH" && (
            <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm">
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-sm font-bold text-gray-800 uppercase tracking-wide">
                  Tiền khách đưa:
                </label>
                <div className="flex gap-2.5">
                  <button
                    type="button"
                    onClick={handleSetExact}
                    className="text-sm font-bold text-blue-600 hover:underline"
                  >
                    Đúng số tiền
                  </button>
                  <button
                    type="button"
                    onClick={handleClearMoney}
                    className="text-sm font-bold text-red-500 hover:underline"
                  >
                    Xóa
                  </button>
                </div>
              </div>

              <div className="relative">
                <input
                  type="number"
                  min="0"
                  className="w-full h-12 px-3.5 border border-gray-300 rounded-xl text-xl font-black text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  value={customerMoney || ""}
                  onChange={(e) => setCustomerMoney(Math.max(0, Number(e.target.value) || 0))}
                />
              </div>

              {/* Gợi ý mốc tiền thông minh */}
              <div className="mt-3">
                <div className="text-xs text-gray-500 font-bold mb-1.5">
                  Mốc tiền gợi ý:
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {smartRoundSuggestions.map((money) => (
                    <button
                      key={money}
                      type="button"
                      onClick={() => setCustomerMoney(money)}
                      className={`py-2 px-2.5 text-sm font-bold rounded-lg border transition ${safeCustomerMoney === money
                        ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                        : "bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200"
                        }`}
                    >
                      {money.toLocaleString()} đ
                    </button>
                  ))}
                </div>
              </div>

              {/* Các nút cộng tiền nhanh */}
              <div className="mt-2.5 pt-2.5 border-t border-dashed border-gray-100">
                <div className="text-xs text-gray-500 font-bold mb-1.5">
                  Cộng thêm tiền lẻ/chẵn:
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {[20000, 50000, 100000, 200000, 500000].map((money) => (
                    <button
                      key={money}
                      type="button"
                      onClick={() => handleQuickCash(money)}
                      className="py-1.5 px-2 text-xs font-bold bg-white hover:bg-blue-50 text-gray-800 border border-gray-200 rounded-lg transition"
                    >
                      +{money >= 1000000 ? `${money / 1000000}tr` : `${money / 1000}k`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tiền thừa trả khách */}
              <div className="flex justify-between items-center mt-3.5 pt-3 border-t border-gray-100">
                <span className="text-sm font-bold text-gray-800 uppercase">
                  Tiền thừa trả khách:
                </span>
                <span
                  className={`text-xl font-black ${change > 0 ? "text-green-600" : "text-gray-400"
                    }`}
                >
                  {change.toLocaleString()} đ
                </span>
              </div>
            </div>
          )}
        </div>

        {/* NÚT XÁC NHẬN THANH TOÁN - GHIM CỐ ĐỊNH Ở ĐÁY KHÔNG BỊ TRÔI */}
        <div className="p-4 bg-white border-t border-gray-200 shadow-2xl flex-shrink-0 z-20">
          {/* Cảnh báo tiền khách đưa chưa đủ */}
          {paymentMethod === "CASH" && safeCustomerMoney > 0 && safeCustomerMoney < totalAfterDiscount && (
            <div className="mb-2 text-sm font-semibold text-red-600 bg-red-50 border border-red-200 rounded-xl py-2 px-3.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <ExclamationCircleIcon className="h-5 w-5 shrink-0" />
                Khách đưa chưa đủ tiền:
              </span>
              <span className="font-bold font-mono">
                Thiếu {(totalAfterDiscount - safeCustomerMoney).toLocaleString()} đ
              </span>
            </div>
          )}

          <button
            type="button"
            onClick={handlePayment}
            disabled={
              isSubmitting ||
              order.length === 0 ||
              (paymentMethod === "CASH" && safeCustomerMoney < totalAfterDiscount)
            }
            className="w-full py-4 px-4 bg-green-600 hover:bg-green-700 active:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold shadow-md transition flex items-center justify-between"
            style={{
              backgroundColor:
                isSubmitting ||
                  order.length === 0 ||
                  (paymentMethod === "CASH" && safeCustomerMoney < totalAfterDiscount)
                  ? '#9ca3af'
                  : '#16a34a',
              color: '#ffffff',
            }}
          >
            <div className="flex items-center gap-2">
              {isSubmitting ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <CheckCircleIcon className="h-6 w-6 text-white" />
              )}
              <span className="text-lg tracking-wide font-bold text-white">
                {isSubmitting
                  ? "Đang xử lý..."
                  : order.length === 0
                    ? "Giỏ hàng trống"
                    : "Xác nhận thanh toán"}
              </span>
            </div>

            <span
              className="border border-green-300/40 text-white font-mono font-extrabold text-base px-3.5 py-1 rounded-lg"
              style={{ backgroundColor: 'rgba(0, 0, 0, 0.25)', color: '#ffffff' }}
            >
              {totalAfterDiscount.toLocaleString()} đ
            </span>
          </button>
        </div>
      </div>
    </div>

      {/* MODAL IN HÓA ĐƠN K80 (TÁCH BIỆT HOÀN TOÀN QUA PORTAL) */}
      {printModal.open && typeof document !== "undefined" && createPortal(
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl w-[440px] max-w-[94vw] max-h-[92vh] flex flex-col overflow-hidden shadow-2xl animate-fade-in">
          {/* Header Modal */}
          <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
            <div>
              <div className="font-bold text-base text-gray-800 flex items-center gap-1.5">
                <CheckCircleIcon className="h-5 w-5 text-green-600" />
                <span>Thanh toán thành công!</span>
              </div>
              <div className="text-xs text-gray-400 font-mono mt-0.5">
                Mã giao dịch: {printModal.paymentId}
              </div>
            </div>
            <button
              onClick={handleCloseModal}
              className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition"
              title="Đóng & Bán đơn mới (Esc)"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Thanh thông báo trạng thái đơn */}
          <div className="bg-green-50 px-4 py-2 border-b border-green-100 text-xs text-green-800 flex items-center justify-between">
            <span>Đơn hàng đã được lưu vào hệ thống</span>
            <span className="text-[11px] text-green-600 font-medium">ESC: Đơn mới | Enter: In bill</span>
          </div>

          {/* Nội dung Hóa đơn nhiệt K80 */}
          <div className="p-5 overflow-y-auto text-center bg-gray-100 flex-1">
            {printModal.loading ? (
              <div className="py-12 flex flex-col items-center justify-center text-gray-500">
                <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mb-3"></div>
                <p className="text-xs font-semibold">Đang chuẩn bị hóa đơn in nhiệt...</p>
              </div>
            ) : (
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 inline-block text-left w-[300px] font-mono text-[11px] leading-relaxed mx-auto">
                <div
                  dangerouslySetInnerHTML={{
                    __html: printModal.htmlContent || "<p class='text-center'>Không có nội dung</p>",
                  }}
                />
              </div>
            )}
          </div>

          {/* Footer Nút hành động */}
          <div className="p-4 border-t border-gray-100 bg-white flex justify-end items-center gap-2.5">
            <button
              type="button"
              onClick={handleCloseModal}
              className="px-4 py-2.5 border border-gray-300 hover:bg-gray-100 active:bg-gray-200 rounded-xl text-xs font-bold text-gray-700 transition"
            >
              ✕ Bỏ qua & Đơn mới
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="bg-gray-900 hover:bg-black active:bg-gray-800 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md"
            >
              <PrinterIcon className="h-4 w-4" />
              <span>🖨 In hóa đơn (K80)</span>
            </button>
          </div>
        </div>
      </div>,
      document.body
    )}

    {/* MODAL THÊM KHÁCH HÀNG NHANH TẠI QUẦY */}
    {showAddCustomerModal && (
      <AddCustomerPos
        isModal={true}
        initialPhone={customerPhone}
        onClose={() => setShowAddCustomerModal(false)}
        onSuccess={(newCustomer) => {
          setShowAddCustomerModal(false);
          if (newCustomer?.phone) {
            setCustomerPhone(newCustomer.phone);
            dispatch(findUserByPhone(newCustomer.phone));
          }
          if (newCustomer?.fullName) {
            setCustomerName(newCustomer.fullName);
          }
        }}
      />
    )}
    </>
  );
}
