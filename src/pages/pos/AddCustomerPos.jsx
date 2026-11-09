import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { createUser } from "@/features/user/userThunks";
import { showAlert } from "@/features/alert/alertSlice";
import userAPI from "@/features/user/userAPI";

import {
  UserPlusIcon,
  PhoneIcon,
  UserIcon,
  EnvelopeIcon,
  SparklesIcon,
  CheckCircleIcon,
  XMarkIcon,
  ArrowLeftIcon,
  ExclamationCircleIcon,
  GiftIcon,
} from "@heroicons/react/24/solid";

const MEMBERSHIP_LEVELS = [
  { key: "NONE", label: "Mới / Thường", color: "bg-gray-100 text-gray-700 border-gray-300" },
  { key: "BRONZE", label: "Hạng Đồng (Bronze)", color: "bg-amber-100 text-amber-900 border-amber-300" },
  { key: "SILVER", label: "Hạng Bạc (Silver)", color: "bg-slate-200 text-slate-800 border-slate-300" },
  { key: "GOLD", label: "Hạng Vàng (Gold)", color: "bg-yellow-100 text-yellow-900 border-yellow-400" },
  { key: "PLATINUM", label: "Bạch Kim (Platinum)", color: "bg-purple-100 text-purple-900 border-purple-300" },
];

export default function AddCustomerPos({
  onSuccess,
  onClose,
  isModal = false,
  initialPhone = "",
}) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.user);

  const phoneInputRef = useRef(null);

  const [form, setForm] = useState({
    fullName: "",
    phone: initialPhone || "",
    email: "",
    membershipLevel: "NONE",
    loyaltyPoints: 0,
  });

  const [errors, setErrors] = useState({});
  const [existingCustomer, setExistingCustomer] = useState(null);
  const [isCheckingPhone, setIsCheckingPhone] = useState(false);

  // Auto focus ô SĐT khi mở
  useEffect(() => {
    phoneInputRef.current?.focus();
  }, []);

  // Hỗ trợ phím tắt Esc để đóng modal hoặc quay lại
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        if (isModal && onClose) {
          onClose();
        } else {
          navigate(-1);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isModal, onClose, navigate]);

  // Kiểm tra SĐT có tồn tại chưa khi người dùng nhập đủ 10 số
  useEffect(() => {
    const cleanPhone = (form.phone || "").replace(/\D/g, "");
    if (cleanPhone.length === 10) {
      let isCurrent = true;
      setIsCheckingPhone(true);
      setExistingCustomer(null);

      userAPI
        .getUserByPhone(cleanPhone)
        .then((res) => {
          if (isCurrent) {
            const cust = res.result || res;
            if (cust && cust.id) {
              setExistingCustomer(cust);
            }
          }
        })
        .catch(() => {
          // 404 hoặc không tìm thấy nghĩa là SĐT chưa đăng ký -> Hợp lệ
          if (isCurrent) {
            setExistingCustomer(null);
          }
        })
        .finally(() => {
          if (isCurrent) setIsCheckingPhone(false);
        });

      return () => {
        isCurrent = false;
      };
    } else {
      setExistingCustomer(null);
      setIsCheckingPhone(false);
    }
  }, [form.phone]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handlePhoneInput = (e) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 10);
    handleChange("phone", raw);
  };

  const validate = () => {
    const newErrors = {};
    const cleanPhone = (form.phone || "").trim();

    if (!cleanPhone) {
      newErrors.phone = "Vui lòng nhập số điện thoại";
    } else if (!/^0[3|5|7|8|9][0-9]{8}$/.test(cleanPhone)) {
      newErrors.phone = "Số điện thoại không hợp lệ (cần 10 chữ số, bắt đầu bằng 03, 05, 07, 08, 09)";
    }

    if (!form.fullName || form.fullName.trim().length < 2) {
      newErrors.fullName = "Họ và tên khách hàng tối thiểu 2 ký tự";
    }

    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      newErrors.email = "Địa chỉ email không đúng định dạng";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!validate()) return;

    if (existingCustomer) {
      dispatch(
        showAlert({
          type: "orange",
          message: `Số điện thoại này đã thuộc về khách hàng ${existingCustomer.fullName || existingCustomer.username}!`,
        })
      );
      return;
    }

    const payload = {
      username: null,
      password: null,
      fullName: form.fullName.trim(),
      phone: form.phone.trim(),
      email: form.email?.trim() || null,
      status: "active",
      roles: "CUSTOMER",
      customerProfile: {
        loyaltyPoints: Math.max(0, Number(form.loyaltyPoints) || 0),
        membershipLevel: form.membershipLevel || "NONE",
      },
    };

    const result = await dispatch(createUser(payload));

    if (createUser.fulfilled.match(result)) {
      const createdUser = result.payload?.result || result.payload;
      dispatch(
        showAlert({
          type: "green",
          message: `Tạo khách hàng "${payload.fullName}" thành công!`,
        })
      );

      if (onSuccess) {
        onSuccess(createdUser);
      }

      if (isModal && onClose) {
        onClose();
      } else {
        navigate("/pos");
      }
    } else {
      const errMsg =
        result.payload?.message ||
        result.error?.message ||
        "Tạo khách hàng thất bại. Vui lòng thử lại!";
      dispatch(showAlert({ type: "red", message: errMsg }));
    }
  };

  // Chọn nhanh khách hàng đã tồn tại
  const handleUseExisting = () => {
    if (!existingCustomer) return;
    dispatch(
      showAlert({
        type: "green",
        message: `Đã chọn khách hàng: ${existingCustomer.fullName || existingCustomer.username}`,
      })
    );
    if (onSuccess) onSuccess(existingCustomer);
    if (isModal && onClose) {
      onClose();
    } else {
      navigate("/pos");
    }
  };

  // UI FORM CONTENT
  const formContent = (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden flex flex-col w-full max-w-xl">
      {/* HEADER */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-5 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center backdrop-blur-xs">
            <UserPlusIcon className="h-6 w-6 text-yellow-300" />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-wide">Thêm Khách Hàng Mới</h2>
            <p className="text-xs text-blue-100 mt-0.5">
              Đăng ký thông tin nhanh tại quầy để tích lũy điểm & ưu đãi
            </p>
          </div>
        </div>

        {isModal ? (
          <button
            type="button"
            onClick={onClose}
            className="hover:bg-white/20 p-2 rounded-xl text-white transition cursor-pointer"
            title="Đóng (Esc)"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => navigate("/pos")}
            className="hover:bg-white/20 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-white/20"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            <span>Quay lại POS</span>
          </button>
        )}
      </div>

      {/* FORM BODY */}
      <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto max-h-[calc(85vh-130px)]">
        {/* SỐ ĐIỆN THOẠI & CHECK TRÙNG LẶP */}
        <div>
          <label className="flex items-center justify-between text-sm font-bold text-gray-800 mb-1.5">
            <span className="flex items-center gap-1.5">
              <PhoneIcon className="h-4 w-4 text-blue-600" />
              Số điện thoại <span className="text-red-500">*</span>
            </span>
            <span className="text-xs font-normal text-gray-500">
              {form.phone.length}/10 số
            </span>
          </label>

          <div className="relative">
            <input
              ref={phoneInputRef}
              type="tel"
              placeholder="Nhập 10 số SĐT (VD: 0912345678)..."
              value={form.phone}
              onChange={handlePhoneInput}
              className={`w-full h-12 px-4 rounded-xl text-base font-semibold border transition focus:outline-none focus:ring-2 bg-white ${
                errors.phone
                  ? "border-red-400 focus:ring-red-400 text-red-900"
                  : existingCustomer
                  ? "border-amber-400 focus:ring-amber-400 text-amber-900"
                  : "border-gray-300 focus:ring-blue-500 text-gray-900"
              }`}
            />
            {isCheckingPhone && (
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-blue-600 font-semibold flex items-center gap-1">
                <span className="w-3.5 h-3.5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></span>
                Đang kiểm tra...
              </span>
            )}
            {!isCheckingPhone && form.phone.length === 10 && !existingCustomer && (
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-emerald-600 font-bold flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <CheckCircleIcon className="h-4 w-4" />
                SĐT hợp lệ
              </span>
            )}
          </div>

          {errors.phone && (
            <p className="text-xs font-semibold text-red-500 mt-1.5 flex items-center gap-1">
              <ExclamationCircleIcon className="h-3.5 w-3.5" />
              {errors.phone}
            </p>
          )}

          {/* CẢNH BÁO NẾU SĐT ĐÃ TỒN TẠI TRONG HỆ THỐNG */}
          {existingCustomer && (
            <div className="mt-2.5 p-3 bg-amber-50 border border-amber-300 rounded-xl flex items-center justify-between text-amber-900">
              <div className="text-xs space-y-0.5">
                <div className="font-bold flex items-center gap-1.5">
                  <ExclamationCircleIcon className="h-4 w-4 text-amber-600" />
                  <span>SĐT này đã được đăng ký trước đó!</span>
                </div>
                <div>
                  Khách: <strong>{existingCustomer.fullName || existingCustomer.username}</strong> • Hạng:{" "}
                  <strong className="text-blue-700">
                    {existingCustomer.customerProfile?.membershipLevel || "Thành viên"}
                  </strong>{" "}
                  • Điểm:{" "}
                  <strong>{existingCustomer.customerProfile?.loyaltyPoints || 0} điểm</strong>
                </div>
              </div>
              <button
                type="button"
                onClick={handleUseExisting}
                className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-xs transition shrink-0 ml-2"
              >
                Chọn dùng ngay
              </button>
            </div>
          )}
        </div>

        {/* HỌ VÀ TÊN KHÁCH HÀNG */}
        <div>
          <label className="flex items-center gap-1.5 text-sm font-bold text-gray-800 mb-1.5">
            <UserIcon className="h-4 w-4 text-blue-600" />
            Họ và tên khách hàng <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Ví dụ: Nguyễn Văn A, Trần Thị B..."
            value={form.fullName}
            onChange={(e) => handleChange("fullName", e.target.value)}
            className={`w-full h-12 px-4 rounded-xl text-base font-semibold border transition focus:outline-none focus:ring-2 bg-white ${
              errors.fullName
                ? "border-red-400 focus:ring-red-400 text-red-900"
                : "border-gray-300 focus:ring-blue-500 text-gray-900"
            }`}
          />
          {errors.fullName && (
            <p className="text-xs font-semibold text-red-500 mt-1.5 flex items-center gap-1">
              <ExclamationCircleIcon className="h-3.5 w-3.5" />
              {errors.fullName}
            </p>
          )}
        </div>

        {/* EMAIL (TÙY CHỌN) */}
        <div>
          <label className="flex items-center justify-between text-sm font-bold text-gray-800 mb-1.5">
            <span className="flex items-center gap-1.5">
              <EnvelopeIcon className="h-4 w-4 text-blue-600" />
              Địa chỉ Email
            </span>
            <span className="text-xs font-normal text-gray-500">Tùy chọn (Gửi hóa đơn e-invoice)</span>
          </label>
          <input
            type="email"
            placeholder="khachhang@gmail.com..."
            value={form.email}
            onChange={(e) => handleChange("email", e.target.value)}
            className={`w-full h-11 px-4 rounded-xl text-sm border transition focus:outline-none focus:ring-2 bg-white ${
              errors.email
                ? "border-red-400 focus:ring-red-400 text-red-900"
                : "border-gray-300 focus:ring-blue-500 text-gray-900"
            }`}
          />
          {errors.email && (
            <p className="text-xs font-semibold text-red-500 mt-1.5 flex items-center gap-1">
              <ExclamationCircleIcon className="h-3.5 w-3.5" />
              {errors.email}
            </p>
          )}
        </div>

        {/* HẠNG THÀNH VIÊN BAN ĐẦU */}
        <div>
          <label className="flex items-center gap-1.5 text-sm font-bold text-gray-800 mb-2">
            <SparklesIcon className="h-4 w-4 text-amber-500" />
            Hạng thành viên ban đầu
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {MEMBERSHIP_LEVELS.map((level) => {
              const isSelected = form.membershipLevel === level.key;
              return (
                <button
                  key={level.key}
                  type="button"
                  onClick={() => handleChange("membershipLevel", level.key)}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-between ${
                    isSelected
                      ? "bg-blue-600 text-white border-blue-600 shadow-sm ring-2 ring-blue-300"
                      : "bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-200"
                  }`}
                >
                  <span>{level.label}</span>
                  {isSelected && <CheckCircleIcon className="h-4 w-4 text-white" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* ĐIỂM TÍCH LŨY BAN ĐẦU */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="flex items-center gap-1.5 text-sm font-bold text-gray-800">
              <GiftIcon className="h-4 w-4 text-purple-600" />
              Điểm tích lũy khởi tạo
            </label>
            <div className="flex gap-1.5">
              {[0, 10, 20, 50].map((pts) => (
                <button
                  key={pts}
                  type="button"
                  onClick={() => handleChange("loyaltyPoints", pts)}
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-md border transition ${
                    form.loyaltyPoints === pts
                      ? "bg-purple-600 text-white border-purple-600"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300"
                  }`}
                >
                  +{pts}đ
                </button>
              ))}
            </div>
          </div>
          <input
            type="number"
            min="0"
            placeholder="0"
            value={form.loyaltyPoints}
            onChange={(e) =>
              handleChange("loyaltyPoints", Math.max(0, parseInt(e.target.value) || 0))
            }
            className="w-full h-11 px-4 rounded-xl text-sm font-bold border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
          <p className="text-[11px] text-gray-500 mt-1">
            Mặc định là 0 điểm. Có thể cộng sẵn điểm thưởng chào mừng thành viên mới.
          </p>
        </div>

        {/* NÚT THAO TÁC */}
        <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={isModal ? onClose : () => navigate("/pos")}
            className="px-5 py-3 rounded-xl border border-gray-300 text-sm font-bold text-gray-700 hover:bg-gray-100 transition"
          >
            Hủy bỏ (Esc)
          </button>

          <button
            type="submit"
            disabled={loading || isCheckingPhone}
            className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-bold shadow-md transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>Đang tạo khách hàng...</span>
              </>
            ) : (
              <>
                <UserPlusIcon className="h-5 w-5" />
                <span>Lưu & Chọn khách này</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );

  // NẾU LÀ DẠNG MODAL POPUP
  if (isModal) {
    return (
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-[100] p-4 animate-fade-in"
        onClick={onClose}
      >
        <div onClick={(e) => e.stopPropagation()} className="w-full max-w-xl">
          {formContent}
        </div>
      </div>
    );
  }

  // NẾU LÀ TRANG FULL (/pos/add/customer)
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 sm:p-6 select-none font-sans">
      {formContent}
    </div>
  );
}
