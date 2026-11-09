import React, { useEffect, useState, useMemo } from "react";
import {
  Card,
  CardBody,
  Typography,
  Button,
} from "@material-tailwind/react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchDiscounts,
  createDiscount,
  updateDiscount,
  deleteDiscount,
} from "@/features/discount/discountThunks";
import Pagination from "@/utils/Pagination";
import { formatDateTime } from "@/utils/dateFormat";
import {
  TicketIcon,
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ClockIcon,
  PauseCircleIcon,
  XCircleIcon,
  ClipboardDocumentCheckIcon,
  CalendarDaysIcon,
} from "@heroicons/react/24/solid";

export function Discounts() {
  const dispatch = useDispatch();

  const { list, loading } = useSelector((state) => state.discount);

  // Filter States
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Copy alert state
  const [copiedCode, setCopiedCode] = useState(null);

  // Modal States
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // "create" | "edit"
  const [editingId, setEditingId] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  const [form, setForm] = useState({
    code: "",
    name: "",
    value: "",
    startDate: "",
    endDate: "",
    active: true,
  });

  // Initial load
  useEffect(() => {
    dispatch(fetchDiscounts());
  }, [dispatch]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (modalOpen) {
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
  }, [modalOpen]);

  // Helper to get status of a discount
  const getDiscountStatus = (d) => {
    if (!d.active) {
      return {
        code: "INACTIVE",
        label: "Tạm dừng",
        badgeClass: "bg-gray-100 text-gray-700 border-gray-200",
        dotClass: "bg-gray-400",
      };
    }
    const now = new Date();
    const start = d.startDate ? new Date(d.startDate) : null;
    const end = d.endDate ? new Date(d.endDate) : null;

    if (end && now > end) {
      return {
        code: "EXPIRED",
        label: "Đã hết hạn",
        badgeClass: "bg-red-50 text-red-700 border-red-200",
        dotClass: "bg-red-500",
      };
    }
    if (start && now < start) {
      return {
        code: "UPCOMING",
        label: "Sắp diễn ra",
        badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
        dotClass: "bg-amber-500",
      };
    }
    return {
      code: "ACTIVE_VALID",
      label: "Đang hiệu lực",
      badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
      dotClass: "bg-emerald-500",
    };
  };

  // KPI Metrics Calculation
  const discountList = useMemo(() => {
    return Array.isArray(list) ? list : [];
  }, [list]);

  const kpis = useMemo(() => {
    let activeValid = 0;
    let upcoming = 0;
    let expired = 0;
    let inactive = 0;

    discountList.forEach((d) => {
      const st = getDiscountStatus(d);
      if (st.code === "ACTIVE_VALID") activeValid++;
      else if (st.code === "UPCOMING") upcoming++;
      else if (st.code === "EXPIRED") expired++;
      else if (st.code === "INACTIVE") inactive++;
    });

    return {
      total: discountList.length,
      activeValid,
      upcoming,
      expired,
      inactive,
    };
  }, [discountList]);

  // Filtered List
  const filteredList = useMemo(() => {
    return discountList.filter((d) => {
      // Keyword filter
      if (keyword.trim()) {
        const kw = keyword.trim().toLowerCase();
        const codeMatch = (d.code || "").toLowerCase().includes(kw);
        const nameMatch = (d.name || "").toLowerCase().includes(kw);
        if (!codeMatch && !nameMatch) return false;
      }

      // Status filter
      if (statusFilter !== "ALL") {
        const st = getDiscountStatus(d);
        if (st.code !== statusFilter) return false;
      }

      return true;
    });
  }, [discountList, keyword, statusFilter]);

  // Pagination on filtered list
  const totalPages = Math.ceil(filteredList.length / pageSize) || 1;
  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredList.slice(start, start + pageSize);
  }, [filteredList, currentPage]);

  // Currency Formatter
  const formatMoney = (val) => {
    return `${Number(val || 0).toLocaleString("vi-VN")} đ`;
  };

  // Convert Date to Local Input value YYYY-MM-DDTHH:mm
  const toLocalInputValue = (dateInput) => {
    if (!dateInput) return "";
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return "";
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
      d.getHours()
    )}:${pad(d.getMinutes())}`;
  };

  // Open Create Modal
  const handleOpenCreate = () => {
    const now = new Date();
    const nextMonth = new Date();
    nextMonth.setDate(now.getDate() + 30);

    setForm({
      code: "",
      name: "",
      value: "",
      startDate: toLocalInputValue(now),
      endDate: toLocalInputValue(nextMonth),
      active: true,
    });
    setEditingId(null);
    setModalMode("create");
    setModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (discount) => {
    setForm({
      code: discount.code || "",
      name: discount.name || "",
      value: discount.value ?? "",
      startDate: toLocalInputValue(discount.startDate),
      endDate: toLocalInputValue(discount.endDate),
      active: discount.active ?? true,
    });
    setEditingId(discount.id);
    setModalMode("edit");
    setModalOpen(true);
  };

  // Handle Form Change
  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : name === "code"
          ? value.toUpperCase().replace(/\s+/g, "")
          : value,
    }));
  };

  // Handle Save (Create or Update)
  const handleSave = async (e) => {
    e.preventDefault();

    if (!form.code.trim()) {
      alert("Vui lòng nhập Mã khuyến mãi (Voucher Code)!");
      return;
    }
    if (!form.name.trim()) {
      alert("Vui lòng nhập Tên chương trình khuyến mãi!");
      return;
    }
    const valNum = Number(form.value);
    if (isNaN(valNum) || valNum <= 0) {
      alert("Vui lòng nhập Số tiền giảm giá hợp lệ (> 0 VNĐ)!");
      return;
    }
    if (!form.startDate || !form.endDate) {
      alert("Vui lòng chọn đầy đủ Ngày bắt đầu và Ngày kết thúc!");
      return;
    }
    if (new Date(form.startDate) > new Date(form.endDate)) {
      alert("Ngày kết thúc phải diễn ra sau Ngày bắt đầu!");
      return;
    }

    setFormLoading(true);

    const payload = {
      code: form.code.trim(),
      name: form.name.trim(),
      value: valNum,
      startDate: form.startDate.length === 16 ? `${form.startDate}:00` : form.startDate,
      endDate: form.endDate.length === 16 ? `${form.endDate}:00` : form.endDate,
      active: Boolean(form.active),
    };

    try {
      if (modalMode === "create") {
        const res = await dispatch(createDiscount(payload));
        if (createDiscount.fulfilled.match(res)) {
          setModalOpen(false);
          dispatch(fetchDiscounts());
        } else {
          alert("Lỗi tạo mã: " + (res.payload?.message || res.payload || "Mã code đã tồn tại"));
        }
      } else {
        const res = await dispatch(updateDiscount({ id: editingId, data: payload }));
        if (updateDiscount.fulfilled.match(res)) {
          setModalOpen(false);
          dispatch(fetchDiscounts());
        } else {
          alert("Lỗi cập nhật mã: " + (res.payload?.message || res.payload || "Thao tác thất bại"));
        }
      }
    } catch (err) {
      console.error("Save discount error:", err);
      alert("Đã xảy ra lỗi khi lưu mã khuyến mãi!");
    } finally {
      setFormLoading(false);
    }
  };

  // Handle Delete
  const handleDelete = async (discount) => {
    if (
      window.confirm(
        `Bạn có chắc chắn muốn xóa mã voucher "${discount.code}" (${discount.name}) không?`
      )
    ) {
      try {
        await dispatch(deleteDiscount(discount.id));
      } catch (e) {
        console.error("Delete discount error:", e);
        alert("Xóa voucher thất bại!");
      }
    }
  };

  // Quick Toggle Active
  const handleToggleActive = async (discount) => {
    try {
      const payload = {
        code: discount.code,
        name: discount.name,
        value: discount.value,
        startDate: discount.startDate,
        endDate: discount.endDate,
        active: !discount.active,
      };
      await dispatch(updateDiscount({ id: discount.id, data: payload }));
      dispatch(fetchDiscounts());
    } catch (e) {
      console.error("Toggle active error:", e);
    }
  };

  // Copy Code to Clipboard
  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => {
      setCopiedCode(null);
    }, 2000);
  };

  return (
    <div className="mt-8 mb-8 flex flex-col gap-6">
      {/* ===== HEADER & TITLE ===== */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-blue-gray-100">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-600">
              <TicketIcon className="w-7 h-7" />
            </div>
            <div>
              <Typography variant="h5" color="blue-gray" className="font-bold">
                Quản Lý Khuyến Mãi & Voucher (Discount)
              </Typography>
              <Typography variant="small" className="text-gray-500 font-normal mt-0.5">
                Quản lý danh sách mã giảm giá, mức giảm trừ tiền mặt, thời hạn áp dụng tại quầy thu ngân POS
              </Typography>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Nút Tạo mới */}
          <Button
            size="sm"
            color="blue"
            className="flex items-center gap-2 normal-case text-xs font-semibold shadow-sm px-4"
            onClick={handleOpenCreate}
          >
            <PlusIcon className="w-4 h-4" />
            Thêm Mã Khuyến Mãi
          </Button>

          {/* Nút Làm mới */}
          <Button
            size="sm"
            variant="outlined"
            color="blue-gray"
            className="flex items-center gap-2 bg-white normal-case text-xs font-semibold"
            onClick={() => dispatch(fetchDiscounts())}
          >
            <ArrowPathIcon className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Làm mới
          </Button>
        </div>
      </div>

      {/* ===== 4 THẺ KPI TỔNG QUAN KHUYẾN MÃI ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Tổng số mã */}
        <Card className="border border-blue-gray-100 shadow-sm p-4 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <Typography variant="small" className="font-semibold text-gray-500 uppercase tracking-wider text-[11px]">
              Tổng Số Mã Voucher
            </Typography>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <TicketIcon className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-2">
            <Typography variant="h4" className="font-bold text-blue-gray-900">
              {kpis.total}{" "}
              <span className="text-xs font-normal text-gray-500">mã</span>
            </Typography>
            <Typography variant="small" className="text-xs text-gray-500 mt-1 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              Chương trình ưu đãi trong hệ thống
            </Typography>
          </div>
        </Card>

        {/* Card 2: Đang hiệu lực */}
        <Card className="border border-blue-gray-100 shadow-sm p-4 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <Typography variant="small" className="font-semibold text-gray-500 uppercase tracking-wider text-[11px]">
              Đang Hiệu Lực (POS Sẵn Sàng)
            </Typography>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircleIcon className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-2">
            <Typography variant="h4" className="font-bold text-emerald-800">
              {kpis.activeValid}{" "}
              <span className="text-xs font-normal text-gray-500">mã</span>
            </Typography>
            <Typography variant="small" className="text-xs text-emerald-700 font-semibold mt-1 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Áp dụng thành công tại màn hình bán hàng
            </Typography>
          </div>
        </Card>

        {/* Card 3: Sắp diễn ra */}
        <Card className="border border-blue-gray-100 shadow-sm p-4 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <Typography variant="small" className="font-semibold text-gray-500 uppercase tracking-wider text-[11px]">
              Sắp Diễn Ra (Chưa Tới Hạn)
            </Typography>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <ClockIcon className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-2">
            <Typography variant="h4" className="font-bold text-amber-900">
              {kpis.upcoming}{" "}
              <span className="text-xs font-normal text-gray-500">mã</span>
            </Typography>
            <Typography variant="small" className="text-xs text-gray-500 mt-1 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              Thời gian bắt đầu trong tương lai
            </Typography>
          </div>
        </Card>

        {/* Card 4: Hết hạn & Tạm dừng */}
        <Card className="border border-blue-gray-100 shadow-sm p-4 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <Typography variant="small" className="font-semibold text-gray-500 uppercase tracking-wider text-[11px]">
              Hết Hạn / Tạm Dừng
            </Typography>
            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
              <XCircleIcon className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-2">
            <Typography variant="h4" className="font-bold text-red-800">
              {kpis.expired + kpis.inactive}{" "}
              <span className="text-xs font-normal text-gray-500">mã</span>
            </Typography>
            <Typography variant="small" className="text-xs text-gray-500 mt-1 flex items-center gap-2">
              <span>Hết hạn: <b>{kpis.expired}</b></span>
              <span>•</span>
              <span>Tạm dừng: <b>{kpis.inactive}</b></span>
            </Typography>
          </div>
        </Card>
      </div>

      {/* ===== BỘ LỌC & TÌM KIẾM ===== */}
      <Card className="border border-blue-gray-100 shadow-sm p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-1 flex-col sm:flex-row items-center gap-3">
            {/* Search Input */}
            <div className="w-full sm:w-80 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <MagnifyingGlassIcon className="w-4 h-4" />
              </div>
              <input
                type="text"
                placeholder="Tìm Mã code, Tên chương trình..."
                value={keyword}
                onChange={(e) => {
                  setKeyword(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-9 pr-8 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {keyword && (
                <button
                  type="button"
                  onClick={() => {
                    setKeyword("");
                    setCurrentPage(1);
                  }}
                  className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Trạng thái Dropdown */}
            <div className="w-full sm:w-60">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">-- Tất cả trạng thái --</option>
                <option value="ACTIVE_VALID">Đang hiệu lực (Dùng được)</option>
                <option value="UPCOMING">Sắp diễn ra</option>
                <option value="EXPIRED">Đã hết hạn</option>
                <option value="INACTIVE">Đang tạm dừng</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {(keyword || statusFilter !== "ALL") && (
              <Button
                size="sm"
                variant="text"
                color="gray"
                className="normal-case text-xs font-semibold"
                onClick={() => {
                  setKeyword("");
                  setStatusFilter("ALL");
                  setCurrentPage(1);
                }}
              >
                Đặt lại
              </Button>
            )}
            <div className="text-xs text-gray-500">
              Tìm thấy <span className="font-semibold text-gray-800">{filteredList.length}</span> mã voucher
            </div>
          </div>
        </div>
      </Card>

      {/* ===== BẢNG DANH SÁCH MÃ GIẢM GIÁ ===== */}
      <Card className="border border-blue-gray-100 shadow-sm overflow-hidden">
        <CardBody className="px-0 pt-0 pb-2">
          {loading ? (
            <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <Typography className="text-sm font-medium text-gray-500">
                Đang tải danh sách khuyến mãi...
              </Typography>
            </div>
          ) : paginatedList.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center justify-center gap-2">
              <TicketIcon className="w-12 h-12 text-gray-300" />
              <Typography variant="h6" color="blue-gray" className="font-semibold">
                Không tìm thấy mã khuyến mãi nào
              </Typography>
              <Typography variant="small" className="text-gray-500 max-w-sm">
                Hãy thử thay đổi từ khóa tìm kiếm hoặc nhấn "+ Thêm Mã Khuyến Mãi" để tạo mới chương trình ưu đãi.
              </Typography>
              <Button
                size="sm"
                color="blue"
                className="mt-3 normal-case text-xs"
                onClick={handleOpenCreate}
              >
                + Thêm Mã Khuyến Mãi
              </Button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[850px] table-auto text-left">
                  <thead>
                    <tr className="bg-gray-50/80 border-b border-blue-gray-100">
                      {[
                        "Mã Voucher (Code)",
                        "Tên Chương Trình",
                        "Mức Giảm Giá (VNĐ)",
                        "Ngày Bắt Đầu",
                        "Ngày Kết Thúc",
                        "Trạng Thái",
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
                    {paginatedList.map((discount) => {
                      const st = getDiscountStatus(discount);

                      return (
                        <tr
                          key={discount.id}
                          className="hover:bg-blue-50/30 transition-colors"
                        >
                          {/* Mã Code */}
                          <td className="py-3 px-5">
                            <div className="flex items-center gap-1.5">
                              <span
                                onClick={() => handleCopyCode(discount.code)}
                                className="cursor-pointer font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 border border-blue-200 hover:bg-blue-100 transition-colors flex items-center gap-1.5"
                                title="Click để sao chép mã"
                              >
                                <TicketIcon className="w-3.5 h-3.5 text-blue-500" />
                                {discount.code}
                              </span>
                              {copiedCode === discount.code && (
                                <span className="text-[10px] text-emerald-600 font-bold animate-fadeIn">
                                  ✓ Đã chép!
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Tên Chương Trình */}
                          <td className="py-3 px-5">
                            <Typography className="text-xs font-bold text-gray-900">
                              {discount.name}
                            </Typography>
                          </td>

                          {/* Mức Giảm Giá */}
                          <td className="py-3 px-5">
                            <Typography className="text-xs font-extrabold text-emerald-700">
                              {formatMoney(discount.value)}
                            </Typography>
                          </td>

                          {/* Ngày Bắt Đầu */}
                          <td className="py-3 px-5">
                            <Typography className="text-xs text-gray-600">
                              {formatDateTime(discount.startDate)}
                            </Typography>
                          </td>

                          {/* Ngày Kết Thúc */}
                          <td className="py-3 px-5">
                            <Typography className="text-xs text-gray-600">
                              {formatDateTime(discount.endDate)}
                            </Typography>
                          </td>

                          {/* Trạng Thái */}
                          <td className="py-3 px-5">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${st.badgeClass}`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${st.dotClass}`}
                              ></span>
                              {st.label}
                            </span>
                          </td>

                          {/* Thao Tác */}
                          <td className="py-3 px-5">
                            <div className="flex items-center gap-1.5">
                              {/* Nút Sửa */}
                              <button
                                type="button"
                                onClick={() => handleOpenEdit(discount)}
                                className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Chỉnh sửa voucher"
                              >
                                <PencilSquareIcon className="w-4 h-4" />
                              </button>

                              {/* Nút Bật / Tắt kích hoạt nhanh */}
                              <button
                                type="button"
                                onClick={() => handleToggleActive(discount)}
                                className={`p-1.5 rounded-lg transition-colors ${
                                  discount.active
                                    ? "text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50"
                                    : "text-gray-400 hover:text-emerald-600 hover:bg-emerald-50"
                                }`}
                                title={
                                  discount.active
                                    ? "Đang bật - Bấm để tạm dừng"
                                    : "Đang tắt - Bấm để kích hoạt"
                                }
                              >
                                {discount.active ? (
                                  <PauseCircleIcon className="w-4 h-4 text-amber-600" />
                                ) : (
                                  <CheckCircleIcon className="w-4 h-4 text-gray-400" />
                                )}
                              </button>

                              {/* Nút Xóa */}
                              <button
                                type="button"
                                onClick={() => handleDelete(discount)}
                                className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Xóa voucher"
                              >
                                <TrashIcon className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Phân trang Client-side */}
              {totalPages > 1 && (
                <div className="border-t border-blue-gray-50 py-3">
                  <Pagination
                    page={currentPage - 1}
                    totalPages={totalPages}
                    onPageChange={(p) => setCurrentPage(p)}
                  />
                </div>
              )}
            </>
          )}
        </CardBody>
      </Card>

      {/* ===== MODAL THÊM / SỬA KHUYẾN MÃI (IN-PLACE MODAL) ===== */}
      {modalOpen && (
        <div
          onClick={() => setModalOpen(false)}
          className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-fadeIn"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/80">
              <div className="flex items-center gap-2">
                <TicketIcon className="w-5 h-5 text-blue-600" />
                <Typography variant="h6" className="font-bold text-gray-900">
                  {modalMode === "create"
                    ? "Tạo Mã Khuyến Mãi Mới"
                    : "Chỉnh Sửa Mã Khuyến Mãi"}
                </Typography>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-200"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSave} className="p-6 flex flex-col gap-4">
              {/* Mã Voucher */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Mã Voucher / Khuyến Mãi <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="code"
                  placeholder="VD: GIAM20K, CHAOHEXIN..."
                  value={form.code}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 text-xs font-mono font-bold uppercase bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <span className="text-[11px] text-gray-500">
                  Mã khách hàng hoặc thu ngân nhập tại POS để áp dụng giảm giá.
                </span>
              </div>

              {/* Tên chương trình */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Tên Chương Trình <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="VD: Giảm giá mừng khai trương, Tri ân khách VIP..."
                  value={form.name}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Mức giảm giá (VNĐ) */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Giá Trị Giảm Trừ Tiền Mặt (VNĐ) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="value"
                  placeholder="VD: 20000, 50000..."
                  value={form.value}
                  onChange={handleFormChange}
                  min="1"
                  step="1000"
                  className="w-full px-3 py-2 text-xs font-bold text-emerald-800 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <div className="flex items-center justify-between mt-1 text-[11px]">
                  <span className="text-gray-500">
                    Số tiền cố định trừ trực tiếp vào đơn hàng.
                  </span>
                  {form.value > 0 && (
                    <span className="font-extrabold text-emerald-700">
                      Gợi ý: {formatMoney(form.value)}
                    </span>
                  )}
                </div>
              </div>

              {/* Thời gian: Bắt đầu & Kết thúc */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Ngày Giờ Bắt Đầu <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    name="startDate"
                    value={form.startDate}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Ngày Giờ Kết Thúc <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    name="endDate"
                    value={form.endDate}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              {/* Checkbox Active */}
              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    name="active"
                    checked={form.active}
                    onChange={handleFormChange}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-xs font-semibold text-gray-800">
                    Kích hoạt chương trình ngay lập tức
                  </span>
                </label>
              </div>

              {/* Footer Buttons */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-100 mt-2">
                <Button
                  type="button"
                  variant="outlined"
                  color="gray"
                  size="sm"
                  className="normal-case text-xs font-semibold"
                  onClick={() => setModalOpen(false)}
                >
                  Hủy
                </Button>

                <Button
                  type="submit"
                  size="sm"
                  color="blue"
                  disabled={formLoading}
                  className="normal-case text-xs font-semibold shadow-sm px-5"
                >
                  {formLoading
                    ? "Đang lưu..."
                    : modalMode === "create"
                    ? "Tạo Mã Mới"
                    : "Lưu Thay Đổi"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Discounts;
