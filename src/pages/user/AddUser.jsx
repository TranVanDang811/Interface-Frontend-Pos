import React, { useEffect, useState } from "react";
import {
  Card,
  CardBody,
  Typography,
  Button,
} from "@material-tailwind/react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { createUser } from "@/features/user/userThunks";
import { fetchRoles } from "@/features/role/roleThunks";
import { hideAlert, showAlert } from "@/features/alert/alertSlice";
import {
  ArrowLeftIcon,
  UserPlusIcon,
  UserIcon,
  ShieldCheckIcon,
  BriefcaseIcon,
  SparklesIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  PhoneIcon,
  EnvelopeIcon,
  KeyIcon,
  CalendarDaysIcon,
} from "@heroicons/react/24/solid";

export default function AddUser() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading } = useSelector((state) => state.user);
  const { list: rawRoles } = useSelector((state) => state.role);
  const { open } = useSelector((state) => state.alert);

  // Default fallback roles if API not loaded
  const rolesList =
    Array.isArray(rawRoles) && rawRoles.length > 0
      ? rawRoles
      : [
          { name: "EMPLOYEE", description: "Nhân viên bán hàng / Thu ngân" },
          { name: "CUSTOMER", description: "Khách hàng thành viên tích điểm" },
          { name: "MANAGE", description: "Quản lý chi nhánh / cửa hàng" },
          { name: "ADMIN", description: "Quản trị viên toàn hệ thống" },
        ];

  const todayStr = new Date().toISOString().split("T")[0];

  const [form, setForm] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    phone: "",
    roles: "EMPLOYEE",
    status: "active",

    employeeProfile: {
      position: "Thu ngân (Cashier)",
      salary: "6000000",
      hireDate: todayStr,
      shift: "Ca sáng (06:00 - 14:00)",
    },

    customerProfile: {
      loyaltyPoints: "0",
      membershipLevel: "BRONZE",
    },
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^[0-9]{9,11}$/;

  const isCustomer = form.roles === "CUSTOMER";
  const isEmployeeOrManager = ["EMPLOYEE", "MANAGE", "ADMIN"].includes(form.roles);

  useEffect(() => {
    dispatch(fetchRoles({ page: 1, size: 100 }));
  }, [dispatch]);

  // Auto hide global alert
  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => dispatch(hideAlert()), 4000);
      return () => clearTimeout(timer);
    }
  }, [open, dispatch]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    // Clear field-level error
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleEmployeeChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      employeeProfile: { ...prev.employeeProfile, [field]: value },
    }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleCustomerChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      customerProfile: { ...prev.customerProfile, [field]: value },
    }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const errs = {};

    // 1. Họ và tên: bắt buộc cho mọi người dùng
    if (!form.fullName || form.fullName.trim().length < 2) {
      errs.fullName = "Họ và tên bắt buộc, tối thiểu 2 ký tự";
    }

    if (!form.roles) {
      errs.roles = "Vui lòng chọn vai trò cho tài khoản";
    }

    // 2. Nếu là Nhân viên / Quản lý / Admin: bắt buộc Username, Password, Email
    if (!isCustomer) {
      if (!form.username || form.username.trim().length < 4) {
        errs.username = "Tên đăng nhập bắt buộc, tối thiểu 4 ký tự";
      } else if (/\s/.test(form.username.trim())) {
        errs.username = "Tên đăng nhập không được chứa khoảng trắng";
      }

      if (!form.password || form.password.length < 6) {
        errs.password = "Mật khẩu bắt buộc, tối thiểu 6 ký tự";
      }

      if (!form.email || !emailRegex.test(form.email.trim())) {
        errs.email = "Email bắt buộc và đúng định dạng (vd: user@example.com)";
      }

      if (form.phone && form.phone.trim() && !phoneRegex.test(form.phone.trim())) {
        errs.phone = "Số điện thoại phải từ 9 đến 11 chữ số";
      }

      if (form.employeeProfile.salary && Number(form.employeeProfile.salary) < 0) {
        errs.salary = "Lương cơ bản không được âm";
      }
    } else {
      // 3. Nếu là Khách hàng: Số điện thoại bắt buộc (để tra cứu và tích điểm POS)
      if (!form.phone || !phoneRegex.test(form.phone.trim())) {
        errs.phone = "Số điện thoại khách hàng bắt buộc (từ 9 đến 11 chữ số)";
      }

      // Email tùy chọn, nếu nhập thì phải đúng cú pháp
      if (form.email && form.email.trim() && !emailRegex.test(form.email.trim())) {
        errs.email = "Email không đúng định dạng";
      }

      if (
        form.customerProfile.loyaltyPoints &&
        Number(form.customerProfile.loyaltyPoints) < 0
      ) {
        errs.loyaltyPoints = "Điểm tích lũy ban đầu không được âm";
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      dispatch(
        showAlert({
          type: "orange",
          message: "Vui lòng kiểm tra lại các trường thông tin có viền đỏ!",
        })
      );
      return;
    }

    const payload = {
      fullName: form.fullName.trim(),
      roles: form.roles,
      status: form.status,
    };

    if (form.phone?.trim()) {
      payload.phone = form.phone.trim();
    }

    if (form.email?.trim()) {
      payload.email = form.email.trim();
    }

    // Tài khoản nội bộ (Nhân viên, Quản lý, Admin) thì gửi username, password
    if (!isCustomer) {
      payload.username = form.username.trim();
      payload.password = form.password;

      payload.employeeProfile = {
        position: form.employeeProfile.position || "Nhân viên",
        salary: form.employeeProfile.salary
          ? Number(form.employeeProfile.salary)
          : 0,
        hireDate: form.employeeProfile.hireDate || todayStr,
        shift: form.employeeProfile.shift || "Ca sáng (06:00 - 14:00)",
      };
    } else {
      // Khách hàng thì gửi hồ sơ khách hàng tích điểm
      payload.customerProfile = {
        loyaltyPoints: form.customerProfile.loyaltyPoints
          ? Number(form.customerProfile.loyaltyPoints)
          : 0,
        membershipLevel: form.customerProfile.membershipLevel || "BRONZE",
      };
    }

    const result = await dispatch(createUser(payload));

    if (createUser.fulfilled.match(result)) {
      dispatch(
        showAlert({
          type: "green",
          message: `Tạo tài khoản "${form.fullName}" thành công!`,
        })
      );
      if (isCustomer) {
        navigate("/dashboard/customers-history");
      } else {
        navigate("/dashboard/users");
      }
    } else {
      dispatch(
        showAlert({
          type: "red",
          message: result.payload?.message || "Tạo tài khoản thất bại!",
        })
      );
    }
  };

  const getRoleBadgeInfo = (roleName) => {
    switch (roleName) {
      case "ADMIN":
        return {
          title: "Quản trị viên (ADMIN)",
          desc: "Toàn quyền quản trị hệ thống, tài chính và cấu hình cửa hàng.",
          badgeBg: "bg-red-50 text-red-700 border-red-200",
        };
      case "MANAGE":
        return {
          title: "Quản lý chi nhánh (MANAGE)",
          desc: "Quản lý sản phẩm, kho hàng, nhập hàng và nhân viên.",
          badgeBg: "bg-purple-50 text-purple-700 border-purple-200",
        };
      case "EMPLOYEE":
        return {
          title: "Nhân viên bán hàng (EMPLOYEE)",
          desc: "Đăng nhập POS, mở ca thu ngân, tạo hóa đơn và bán hàng.",
          badgeBg: "bg-blue-50 text-blue-700 border-blue-200",
        };
      case "CUSTOMER":
        return {
          title: "Khách hàng thành viên (CUSTOMER)",
          desc: "Hồ sơ khách tích điểm tại quầy POS, không cần mật khẩu đăng nhập.",
          badgeBg: "bg-emerald-50 text-emerald-700 border-emerald-200",
        };
      default:
        return {
          title: roleName,
          desc: "Vai trò người dùng trong hệ thống",
          badgeBg: "bg-gray-50 text-gray-700 border-gray-200",
        };
    }
  };

  return (
    <div className="mt-6 mb-12 flex justify-center px-2 md:px-4">
      <Card className="w-full max-w-4xl shadow-xl rounded-2xl border border-slate-200/90 overflow-hidden">
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 p-6 md:p-8 text-white relative">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-all"
                title="Quay lại"
              >
                <ArrowLeftIcon className="w-5 h-5" />
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <UserPlusIcon className="w-6 h-6 text-blue-200" />
                  <Typography variant="h4" className="font-bold text-white">
                    Tạo Người Dùng Mới
                  </Typography>
                </div>
                <Typography className="text-xs text-blue-100 mt-1">
                  Thêm mới nhân viên, quản lý hoặc khách hàng thành viên vào hệ thống
                </Typography>
              </div>
            </div>

            <Link
              to="/dashboard/users"
              className="text-xs text-blue-100 hover:text-white underline"
            >
              Xem danh sách nhân sự
            </Link>
          </div>
        </div>

        <CardBody className="p-6 md:p-8 space-y-8 bg-slate-50/40">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* ================= KHỐI 1: CHỌN VAI TRÒ (ROLE) ================= */}
            <div className="bg-white p-5 md:p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <ShieldCheckIcon className="w-5 h-5 text-indigo-600" />
                  <Typography className="font-bold text-slate-800 text-sm">
                    1. Phân quyền & Vai trò người dùng <span className="text-red-500">*</span>
                  </Typography>
                </div>
                <span className="text-xs font-semibold text-slate-400">
                  Bước 1/3
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {rolesList.map((r) => {
                  const isSelected = form.roles === r.name;
                  const info = getRoleBadgeInfo(r.name);
                  return (
                    <div
                      key={r.name}
                      onClick={() => handleChange("roles", r.name)}
                      className={`
                        cursor-pointer p-4 rounded-xl border-2 transition-all flex flex-col justify-between
                        ${
                          isSelected
                            ? "border-blue-600 bg-blue-50/60 shadow-sm"
                            : "border-slate-200 hover:border-slate-300 bg-white"
                        }
                      `}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span
                            className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${info.badgeBg}`}
                          >
                            {r.name}
                          </span>
                          {isSelected && (
                            <CheckCircleIcon className="w-5 h-5 text-blue-600" />
                          )}
                        </div>
                        <div className="text-xs font-bold text-slate-800 mb-1">
                          {r.name === "EMPLOYEE"
                            ? "Nhân viên POS"
                            : r.name === "CUSTOMER"
                            ? "Khách hàng"
                            : r.name === "MANAGE"
                            ? "Quản lý"
                            : "Admin"}
                        </div>
                        <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2">
                          {info.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {errors.roles && (
                <p className="text-red-500 text-xs font-medium flex items-center gap-1">
                  <ExclamationCircleIcon className="w-4 h-4" /> {errors.roles}
                </p>
              )}

              {/* Notice Banner */}
              {isCustomer ? (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3 text-xs text-emerald-800">
                  <SparklesIcon className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Chế độ Khách Hàng:</span> Hồ sơ khách hàng lưu trữ tại quầy POS để tích lũy điểm và áp dụng chiết khấu. <strong>Không cần tạo Username và Mật khẩu đăng nhập.</strong>
                  </div>
                </div>
              ) : (
                <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-3 text-xs text-blue-800">
                  <CheckCircleIcon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Chế độ Nhân sự / Quản trị:</span> Bắt buộc nhập <strong>Tên đăng nhập (Username)</strong>, <strong>Mật khẩu</strong> và <strong>Email</strong> để nhân viên đăng nhập vào hệ thống POS / Dashboard.
                  </div>
                </div>
              )}
            </div>

            {/* ================= KHỐI 2: THÔNG TIN CƠ BẢN ================= */}
            <div className="bg-white p-5 md:p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <UserIcon className="w-5 h-5 text-blue-600" />
                  <Typography className="font-bold text-slate-800 text-sm">
                    2. Thông tin tài khoản cơ bản
                  </Typography>
                </div>
                <span className="text-xs font-semibold text-slate-400">
                  Bước 2/3
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Họ và tên */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Họ và tên <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="VD: Nguyễn Văn An"
                    value={form.fullName}
                    onChange={(e) => handleChange("fullName", e.target.value)}
                    className={`w-full px-3.5 py-2.5 text-xs rounded-xl border bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                      errors.fullName
                        ? "border-red-400 focus:ring-red-200 bg-red-50/20"
                        : "border-slate-200 focus:ring-blue-100 focus:border-blue-500"
                    }`}
                  />
                  {errors.fullName && (
                    <p className="text-red-500 text-[11px] mt-1 font-medium">
                      {errors.fullName}
                    </p>
                  )}
                </div>

                {/* Số điện thoại */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Số điện thoại {isCustomer ? <span className="text-red-500">* (Bắt buộc cho khách hàng)</span> : "(Tùy chọn)"}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="VD: 0912345678"
                      value={form.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      className={`w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl border bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                        errors.phone
                          ? "border-red-400 focus:ring-red-200 bg-red-50/20"
                          : "border-slate-200 focus:ring-blue-100 focus:border-blue-500"
                      }`}
                    />
                    <PhoneIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  </div>
                  {errors.phone && (
                    <p className="text-red-500 text-[11px] mt-1 font-medium">
                      {errors.phone}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Địa chỉ Email {!isCustomer ? <span className="text-red-500">*</span> : "(Tùy chọn)"}
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      placeholder="VD: nguyenvana@gmail.com"
                      value={form.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      className={`w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl border bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                        errors.email
                          ? "border-red-400 focus:ring-red-200 bg-red-50/20"
                          : "border-slate-200 focus:ring-blue-100 focus:border-blue-500"
                      }`}
                    />
                    <EnvelopeIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  </div>
                  {errors.email && (
                    <p className="text-red-500 text-[11px] mt-1 font-medium">
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Trạng thái tài khoản */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Trạng thái kích hoạt <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.status}
                    onChange={(e) => handleChange("status", e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                  >
                    <option value="active">Đang hoạt động (ACTIVE)</option>
                    <option value="inactive">Tạm ngưng / Khóa (INACTIVE)</option>
                  </select>
                </div>

                {/* Tên đăng nhập (Username) - ẨN NẾU LÀ CUSTOMER */}
                {!isCustomer && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Tên đăng nhập (Username) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="VD: staff_an, admin02"
                      value={form.username}
                      onChange={(e) => handleChange("username", e.target.value)}
                      className={`w-full px-3.5 py-2.5 text-xs rounded-xl border bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                        errors.username
                          ? "border-red-400 focus:ring-red-200 bg-red-50/20"
                          : "border-slate-200 focus:ring-blue-100 focus:border-blue-500"
                      }`}
                    />
                    {errors.username && (
                      <p className="text-red-500 text-[11px] mt-1 font-medium">
                        {errors.username}
                      </p>
                    )}
                  </div>
                )}

                {/* Mật khẩu (Password) - ẨN NẾU LÀ CUSTOMER */}
                {!isCustomer && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Mật khẩu khởi tạo <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Tối thiểu 6 ký tự"
                        value={form.password}
                        onChange={(e) => handleChange("password", e.target.value)}
                        className={`w-full pl-9 pr-10 py-2.5 text-xs rounded-xl border bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                          errors.password
                            ? "border-red-400 focus:ring-red-200 bg-red-50/20"
                            : "border-slate-200 focus:ring-blue-100 focus:border-blue-500"
                        }`}
                      />
                      <KeyIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 focus:outline-none"
                        title={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                      >
                        {showPassword ? (
                          <EyeSlashIcon className="w-4 h-4" />
                        ) : (
                          <EyeIcon className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-red-500 text-[11px] mt-1 font-medium">
                        {errors.password}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* ================= KHỐI 3A: HỒ SƠ NHÂN VIÊN (NẾU LÀ EMPLOYEE/MANAGE/ADMIN) ================= */}
            {isEmployeeOrManager && (
              <div className="bg-white p-5 md:p-6 rounded-2xl border border-blue-100 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-blue-50 pb-3">
                  <div className="flex items-center gap-2">
                    <BriefcaseIcon className="w-5 h-5 text-blue-600" />
                    <Typography className="font-bold text-slate-800 text-sm">
                      3. Hồ sơ công việc & Hợp đồng nhân sự
                    </Typography>
                  </div>
                  <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                    Employee Profile
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Vị trí / Chức vụ */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Chức vụ / Vị trí công tác
                    </label>
                    <select
                      value={form.employeeProfile.position}
                      onChange={(e) =>
                        handleEmployeeChange("position", e.target.value)
                      }
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                    >
                      <option value="Thu ngân (Cashier)">Thu ngân (Cashier)</option>
                      <option value="Nhân viên bán hàng (Sales Staff)">
                        Nhân viên bán hàng (Sales Staff)
                      </option>
                      <option value="Quản lý ca (Shift Leader)">
                        Quản lý ca (Shift Leader)
                      </option>
                      <option value="Quản lý cửa hàng (Store Manager)">
                        Quản lý cửa hàng (Store Manager)
                      </option>
                      <option value="Thủ kho (Warehouse Staff)">
                        Thủ kho (Warehouse Staff)
                      </option>
                      <option value="Kế toán (Accountant)">
                        Kế toán (Accountant)
                      </option>
                    </select>
                  </div>

                  {/* Ca làm việc */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Ca làm việc phân công
                    </label>
                    <select
                      value={form.employeeProfile.shift}
                      onChange={(e) =>
                        handleEmployeeChange("shift", e.target.value)
                      }
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                    >
                      <option value="Ca sáng (06:00 - 14:00)">
                        Ca sáng (06:00 - 14:00)
                      </option>
                      <option value="Ca chiều (14:00 - 22:00)">
                        Ca chiều (14:00 - 22:00)
                      </option>
                      <option value="Ca tối (18:00 - 23:00)">
                        Ca tối (18:00 - 23:00)
                      </option>
                      <option value="Toàn thời gian (Full-time)">
                        Toàn thời gian (Full-time)
                      </option>
                      <option value="Bán thời gian (Part-time)">
                        Bán thời gian (Part-time)
                      </option>
                    </select>
                  </div>

                  {/* Lương cơ bản */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Lương cơ bản hàng tháng (VNĐ)
                    </label>
                    <input
                      type="number"
                      step="500000"
                      min="0"
                      placeholder="VD: 6000000"
                      value={form.employeeProfile.salary}
                      onChange={(e) =>
                        handleEmployeeChange("salary", e.target.value)
                      }
                      className={`w-full px-3.5 py-2.5 text-xs rounded-xl border bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                        errors.salary
                          ? "border-red-400 focus:ring-red-200"
                          : "border-slate-200 focus:ring-blue-100 focus:border-blue-500"
                      }`}
                    />
                    {errors.salary && (
                      <p className="text-red-500 text-[11px] mt-1 font-medium">
                        {errors.salary}
                      </p>
                    )}
                  </div>

                  {/* Ngày vào làm */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Ngày vào làm
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        value={form.employeeProfile.hireDate}
                        onChange={(e) =>
                          handleEmployeeChange("hireDate", e.target.value)
                        }
                        className="w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                      />
                      <CalendarDaysIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ================= KHỐI 3B: HỒ SƠ KHÁCH HÀNG (NẾU LÀ CUSTOMER) ================= */}
            {isCustomer && (
              <div className="bg-white p-5 md:p-6 rounded-2xl border border-emerald-100 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-emerald-50 pb-3">
                  <div className="flex items-center gap-2">
                    <SparklesIcon className="w-5 h-5 text-emerald-600" />
                    <Typography className="font-bold text-slate-800 text-sm">
                      3. Hồ sơ thành viên & Tích lũy điểm POS
                    </Typography>
                  </div>
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                    Customer Profile
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Hạng thành viên */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Hạng thành viên
                    </label>
                    <select
                      value={form.customerProfile.membershipLevel}
                      onChange={(e) =>
                        handleCustomerChange("membershipLevel", e.target.value)
                      }
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500"
                    >
                      <option value="BRONZE">BRONZE (Hạng Đồng - Mặc định)</option>
                      <option value="SILVER">SILVER (Hạng Bạc - Giảm 5%)</option>
                      <option value="GOLD">GOLD (Hạng Vàng - Giảm 10%)</option>
                      <option value="DIAMOND">DIAMOND (Kim Cương - Giảm 15%)</option>
                    </select>
                  </div>

                  {/* Điểm tích lũy ban đầu */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Điểm thưởng tích lũy ban đầu
                    </label>
                    <input
                      type="number"
                      min="0"
                      placeholder="VD: 0 hoặc 50"
                      value={form.customerProfile.loyaltyPoints}
                      onChange={(e) =>
                        handleCustomerChange("loyaltyPoints", e.target.value)
                      }
                      className={`w-full px-3.5 py-2.5 text-xs rounded-xl border bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                        errors.loyaltyPoints
                          ? "border-red-400 focus:ring-red-200"
                          : "border-slate-200 focus:ring-emerald-100 focus:border-emerald-500"
                      }`}
                    />
                    <p className="text-[11px] text-slate-400 mt-1">
                      1 điểm = 1.000 đ giảm giá trực tiếp khi thanh toán tại quầy
                    </p>
                    {errors.loyaltyPoints && (
                      <p className="text-red-500 text-[11px] mt-1 font-medium">
                        {errors.loyaltyPoints}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ================= BUTTONS ================= */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200/80">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-100 text-xs font-semibold transition-all"
              >
                Hủy bỏ
              </button>

              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold shadow-md shadow-blue-500/25 transition-all disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent" />
                    <span>Đang khởi tạo...</span>
                  </>
                ) : (
                  <>
                    <UserPlusIcon className="w-4 h-4" />
                    <span>Xác nhận tạo tài khoản</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
