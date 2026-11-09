import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { refundItems, fetchRefundHistory, fetchOrderById } from "@/features/payment/paymentThunks";

const RefundModal = ({ open, payment, onClose, onSuccess }) => {
  const dispatch = useDispatch();
  const { refunding } = useSelector((s) => s.payment);

  const [reason, setReason] = useState("");
  const [selectedItems, setSelectedItems] = useState({});
  const [orderItems, setOrderItems] = useState([]);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [itemsError, setItemsError] = useState(false);
  const [errors, setErrors] = useState({});
  const [step, setStep] = useState("form");
  const [errorMsg, setErrorMsg] = useState("");
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const reasonRef = useRef(null);

  useEffect(() => {
    if (open && payment) {
      setStep("form");
      setReason("");
      setErrors({});
      setErrorMsg("");
      setOrderItems([]);
      setSelectedItems({});
      fetchItems();
      loadHistory();
      setTimeout(() => reasonRef.current?.focus(), 120);
    }
  }, [open, payment?.id]);

  // ✅ FIX: đọc đúng field "orderDetails" và map "name" thay vì "productName"
  const fetchItems = async () => {
    if (!payment?.orderId) return;
    setItemsLoading(true);
    setItemsError(false);
    try {
      const res = await dispatch(fetchOrderById(payment.orderId));
      const items = res.payload?.orderDetails || []; // ✅ fix 1

      setOrderItems(items);
      const init = {};
      items.forEach((item) => {
        init[item.productId] = {
          checked: false,
          quantity: 1,
          max: item.quantity,
          name: item.name,   // ✅ fix 2
          price: item.price,
        };
      });
      setSelectedItems(init);
    } catch {
      setItemsError(true);
    } finally {
      setItemsLoading(false);
    }
  };

  const loadHistory = async () => {
    if (!payment?.id) return;
    setHistoryLoading(true);
    try {
      const res = await dispatch(fetchRefundHistory(payment.id));
      setHistory(res.payload || []);
    } catch {
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  const formatVND = (v) => Number(v).toLocaleString("vi-VN") + " đ";

  const checkedItems = Object.entries(selectedItems).filter(([, v]) => v.checked);

  const validate = () => {
    const e = {};
    if (!reason.trim()) e.reason = "Vui lòng nhập lý do hoàn tiền.";
    if (checkedItems.length === 0) e.items = "Vui lòng chọn ít nhất 1 sản phẩm để hoàn.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    setStep("confirm");
  };

  const handleConfirm = async () => {
    setStep("form");
    const payload = {
      reason: reason.trim(),
      items: checkedItems.map(([productId, v]) => ({
        productId,
        quantity: Number(v.quantity),
      })),
    };
    try {
      const result = await dispatch(refundItems({ paymentId: payment.id, data: payload }));
      if (result.error) throw new Error(result.payload || "Refund failed");
      setStep("success");
      onSuccess?.(result.payload);
      loadHistory();
    } catch (err) {
      setErrorMsg(err.message || "Đã xảy ra lỗi. Vui lòng thử lại.");
      setStep("error");
    }
  };

  const toggleItem = (productId) => {
    setSelectedItems((prev) => ({
      ...prev,
      [productId]: { ...prev[productId], checked: !prev[productId].checked },
    }));
    if (errors.items) setErrors((p) => ({ ...p, items: null }));
  };

  const changeQty = (productId, val) => {
    const max = selectedItems[productId].max;
    const qty = Math.max(1, Math.min(Number(val) || 1, max));
    setSelectedItems((prev) => ({
      ...prev,
      [productId]: { ...prev[productId], quantity: qty },
    }));
  };

  if (!open || !payment) return null;

  return (
    <>
      <div
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-[2px]"
        style={{ animation: "fadeIn 0.18s ease" }}
      />

      <div className="fixed z-50 inset-0 flex items-center justify-center p-4" style={{ pointerEvents: "none" }}>
        <div
          className="relative bg-white rounded-2xl shadow-2xl w-full max-w-[520px] flex flex-col overflow-hidden"
          style={{ pointerEvents: "auto", animation: "slideUp 0.22s ease" }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b">
            <div>
              <h2 className="text-[17px] font-semibold tracking-tight">Hoàn tiền theo sản phẩm</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                #{payment.transactionId}&nbsp;·&nbsp;{payment.fullName}
              </p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-xl leading-none mt-0.5">✕</button>
          </div>

          {/* Body */}
          <div className="overflow-y-auto max-h-[75vh]">

            {(step === "form" || step === "confirm") && (
              <div className="px-6 pt-5 pb-4 space-y-5">

                {/* Lý do */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                    Lý do hoàn tiền <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    ref={reasonRef}
                    rows={2}
                    value={reason}
                    onChange={(e) => {
                      setReason(e.target.value);
                      if (errors.reason) setErrors((p) => ({ ...p, reason: null }));
                    }}
                    placeholder="Khách trả lại sản phẩm lỗi..."
                    className={`w-full border rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-black/10 transition ${
                      errors.reason ? "border-red-400 bg-red-50" : "border-gray-200"
                    }`}
                  />
                  {errors.reason && <p className="text-xs text-red-500 mt-1">{errors.reason}</p>}
                </div>

                {/* Danh sách items */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                    Chọn sản phẩm hoàn <span className="text-red-500">*</span>
                  </label>

                  {itemsLoading && (
                    <div className="flex items-center gap-2 py-4 text-sm text-gray-400">
                      <span className="w-4 h-4 border-2 border-gray-200 border-t-gray-500 rounded-full animate-spin" />
                      Đang tải sản phẩm...
                    </div>
                  )}

                  {!itemsLoading && itemsError && (
                    <div className="flex items-center justify-between py-3 px-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-500">
                      Không thể tải sản phẩm.
                      <button onClick={fetchItems} className="underline text-xs">Thử lại</button>
                    </div>
                  )}

                  {!itemsLoading && !itemsError && orderItems.length === 0 && (
                    <p className="text-xs text-gray-400 py-2">Không có sản phẩm nào.</p>
                  )}

                  {!itemsLoading && !itemsError && orderItems.length > 0 && (
                    <div className="space-y-2">
                      {orderItems.map((item) => {
                        const si = selectedItems[item.productId] || {};
                        return (
                          <div
                            key={item.productId}
                            onClick={() => toggleItem(item.productId)}
                            className={`flex items-center gap-3 border rounded-xl px-4 py-3 cursor-pointer transition select-none ${
                              si.checked ? "border-black bg-gray-50" : "border-gray-200 hover:border-gray-300"
                            }`}
                          >
                            <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                              si.checked ? "bg-black border-black" : "border-gray-300"
                            }`}>
                              {si.checked && <span className="text-white text-[10px] font-bold">✓</span>}
                            </div>

                            <div className="flex-1 min-w-0">
                              {/* ✅ fix 3: dùng item.name */}
                              <p className="text-sm font-medium truncate">{item.name}</p>
                              <p className="text-xs text-gray-400">
                                {item.quantity} x {formatVND(item.price)}
                              </p>
                            </div>

                            {si.checked && (
                              <div
                                className="flex items-center gap-1.5"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button
                                  onClick={() => changeQty(item.productId, si.quantity - 1)}
                                  className="w-6 h-6 rounded-md border text-sm hover:bg-gray-100 flex items-center justify-center"
                                >−</button>
                                <input
                                  type="number"
                                  min={1}
                                  max={item.quantity}
                                  value={si.quantity}
                                  onChange={(e) => changeQty(item.productId, e.target.value)}
                                  className="w-10 text-center border rounded-md text-sm py-0.5 focus:outline-none focus:ring-1 focus:ring-black/20"
                                />
                                <button
                                  onClick={() => changeQty(item.productId, si.quantity + 1)}
                                  className="w-6 h-6 rounded-md border text-sm hover:bg-gray-100 flex items-center justify-center"
                                >+</button>
                                <span className="text-xs text-gray-400">/ {item.quantity}</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                  {errors.items && <p className="text-xs text-red-500 mt-1.5">{errors.items}</p>}
                </div>

                {/* Confirm preview */}
                {step === "confirm" && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-2">
                    <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide">Xác nhận hoàn tiền</p>
                    <div className="space-y-1">
                      {checkedItems.map(([productId, v]) => (
                        <div key={productId} className="flex justify-between text-sm">
                          <span className="text-gray-600 truncate max-w-[65%]">{v.name}</span>
                          <span className="text-amber-700 font-medium">x{v.quantity}</span>
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-amber-200 pt-2 flex justify-between text-sm">
                      <span className="text-gray-500">Lý do</span>
                      <span className="text-right text-gray-700 max-w-[60%] truncate">{reason}</span>
                    </div>
                    <p className="text-[11px] text-amber-600 pt-1">⚠️ Thao tác này không thể hoàn tác. Bạn có chắc chắn?</p>
                  </div>
                )}
              </div>
            )}

            {/* SUCCESS */}
            {step === "success" && (
              <div className="flex flex-col items-center px-6 py-10 gap-3">
                <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center text-2xl">✓</div>
                <p className="font-semibold text-gray-800">Hoàn tiền thành công!</p>
                <p className="text-sm text-gray-400 text-center">Các sản phẩm đã được hoàn trả.</p>
                <button onClick={onClose} className="mt-3 bg-black text-white text-sm px-6 py-2.5 rounded-xl hover:opacity-80 transition">Đóng</button>
              </div>
            )}

            {/* ERROR */}
            {step === "error" && (
              <div className="flex flex-col items-center px-6 py-10 gap-3">
                <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center text-2xl">✕</div>
                <p className="font-semibold text-gray-800">Hoàn tiền thất bại</p>
                <p className="text-sm text-red-500 text-center">{errorMsg}</p>
                <button onClick={() => setStep("form")} className="mt-3 bg-black text-white text-sm px-6 py-2.5 rounded-xl hover:opacity-80 transition">Thử lại</button>
              </div>
            )}

            {/* Refund history */}
            {(step === "form" || step === "confirm") && (
              <div className="px-6 pb-6">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Lịch sử hoàn tiền</p>
                {historyLoading ? (
                  <p className="text-xs text-gray-400 py-2">Đang tải...</p>
                ) : history.length === 0 ? (
                  <p className="text-xs text-gray-400 py-2">Chưa có lần hoàn tiền nào.</p>
                ) : (
                  <div className="space-y-2">
                    {history.map((h, i) => (
                      <div key={i} className="flex items-center justify-between text-xs bg-gray-50 border rounded-lg px-3 py-2">
                        <div>
                          {/* ✅ fix 4: đọc đúng field từ RefundRecord backend trả về */}
                          <p className="text-gray-700 font-medium">{h.reason || "—"}</p>
                          <p className="text-gray-400">
                            {h.date ? new Date(h.date).toLocaleString("vi-VN") : "—"}
                          </p>
                        </div>
                        <span className="text-red-500 font-semibold">-{formatVND(h.amount || 0)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          {(step === "form" || step === "confirm") && (
            <div className="flex gap-2 px-6 py-4 border-t bg-white">
              {step === "form" ? (
                <>
                  <button onClick={onClose} className="flex-1 border rounded-xl py-2.5 text-sm hover:bg-gray-50 transition">Hủy</button>
                  <button onClick={handleSubmit} className="flex-1 bg-black text-white rounded-xl py-2.5 text-sm hover:opacity-80 transition">Tiếp tục</button>
                </>
              ) : (
                <>
                  <button onClick={() => setStep("form")} className="flex-1 border rounded-xl py-2.5 text-sm hover:bg-gray-50 transition">Quay lại</button>
                  <button
                    onClick={handleConfirm}
                    disabled={refunding}
                    className="flex-1 bg-red-500 text-white rounded-xl py-2.5 text-sm hover:bg-red-600 transition disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {refunding && <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
                    Xác nhận hoàn tiền
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn  { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(16px) } to { opacity: 1; transform: translateY(0) } }
      `}</style>
    </>
  );
};

export default RefundModal;