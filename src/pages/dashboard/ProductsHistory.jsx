import React, { useEffect, useState, useMemo } from "react";
import {
  Card,
  CardBody,
  Typography,
  Button,
} from "@material-tailwind/react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProductReport } from "@/features/report/reportThunks";
import { fetchCategories } from "@/features/category/categoryThunks";
import {
  MagnifyingGlassIcon,
  XMarkIcon,
  FunnelIcon,
  ArrowPathIcon,
  CurrencyDollarIcon,
  ShoppingBagIcon,
  TagIcon,
  TrophyIcon,
  CalendarDaysIcon,
  ArrowDownTrayIcon,
  BarsArrowDownIcon,
} from "@heroicons/react/24/solid";

export function ProductsHistory() {
  const dispatch = useDispatch();

  const { products, loading } = useSelector((state) => state.report);
  const { list: categories } = useSelector((state) => state.category);

  // Filter States
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [keyword, setKeyword] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [datePreset, setDatePreset] = useState("all");
  const [sortBy, setSortBy] = useState("quantity_desc"); // quantity_desc, revenue_desc, quantity_asc, revenue_asc, name_asc

  // Load categories on mount
  useEffect(() => {
    dispatch(fetchCategories({ page: 1, size: 100 }));
  }, [dispatch]);

  // Format Date to YYYY-MM-DD
  const formatDateStr = (d) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Convert Date to ISO string with full time
  const toIsoStart = (dateStr) => {
    if (!dateStr) return null;
    return `${dateStr}T00:00:00`;
  };

  const toIsoEnd = (dateStr) => {
    if (!dateStr) return null;
    return `${dateStr}T23:59:59`;
  };

  // Trigger search with params
  const executeFetch = (from, to, kw, cat) => {
    dispatch(
      fetchProductReport({
        fromDate: from ? toIsoStart(from) : null,
        toDate: to ? toIsoEnd(to) : null,
        keyword: kw?.trim() || null,
        categoryName: cat || null,
      })
    );
  };

  // Default to ALL on mount (consistent with Orders and Payments history)
  useEffect(() => {
    const now = new Date();
    const endStr = formatDateStr(now);
    const startStr = "2020-01-01";
    setFromDate(startStr);
    setToDate(endStr);
    setDatePreset("all");

    executeFetch(startStr, endStr, "", "");
  }, [dispatch]);

  // Quick Date Preset handler
  const handleDatePreset = (preset) => {
    setDatePreset(preset);
    const now = new Date();
    let startStr = "";
    let endStr = formatDateStr(now);

    if (preset === "today") {
      startStr = endStr;
    } else if (preset === "yesterday") {
      const yesterday = new Date();
      yesterday.setDate(now.getDate() - 1);
      startStr = formatDateStr(yesterday);
      endStr = startStr;
    } else if (preset === "week") {
      const pastWeek = new Date();
      pastWeek.setDate(now.getDate() - 7);
      startStr = formatDateStr(pastWeek);
    } else if (preset === "month") {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      startStr = formatDateStr(startOfMonth);
    } else if (preset === "all") {
      startStr = "2020-01-01";
      endStr = formatDateStr(now);
    }

    setFromDate(startStr);
    setToDate(endStr);
    executeFetch(startStr, endStr, keyword, categoryName);
  };

  // Handle Search submit
  const handleSearch = (e) => {
    if (e) e.preventDefault();
    executeFetch(fromDate, toDate, keyword, categoryName);
  };

  // Reset Filters
  const handleResetFilters = () => {
    const now = new Date();
    const endStr = formatDateStr(now);
    const startStr = "2020-01-01";
    setFromDate(startStr);
    setToDate(endStr);
    setKeyword("");
    setCategoryName("");
    setDatePreset("all");
    setSortBy("quantity_desc");

    executeFetch(startStr, endStr, "", "");
  };

  // Currency Formatter
  const formatMoney = (val) => {
    return `${Number(val || 0).toLocaleString("vi-VN")} đ`;
  };

  // Sorted and Processed Products List
  const processedProducts = useMemo(() => {
    if (!products || !Array.isArray(products)) return [];
    const list = [...products];

    switch (sortBy) {
      case "revenue_desc":
        return list.sort((a, b) => (b.totalRevenue || 0) - (a.totalRevenue || 0));
      case "revenue_asc":
        return list.sort((a, b) => (a.totalRevenue || 0) - (b.totalRevenue || 0));
      case "quantity_asc":
        return list.sort((a, b) => (a.totalQuantity || 0) - (b.totalQuantity || 0));
      case "name_asc":
        return list.sort((a, b) => (a.productName || "").localeCompare(b.productName || ""));
      case "quantity_desc":
      default:
        return list.sort((a, b) => (b.totalQuantity || 0) - (a.totalQuantity || 0));
    }
  }, [products, sortBy]);

  // Summary Metrics
  const totalProducts = processedProducts.length;
  const totalSold = processedProducts.reduce(
    (sum, p) => sum + (p.totalQuantity || 0),
    0
  );
  const totalRevenue = processedProducts.reduce(
    (sum, p) => sum + (p.totalRevenue || 0),
    0
  );
  const topProduct = processedProducts.length > 0 ? processedProducts[0] : null;

  // Export CSV Handler
  const handleExportCSV = () => {
    if (processedProducts.length === 0) {
      alert("Không có dữ liệu để xuất file!");
      return;
    }

    const headers = [
      "Hạng",
      "Mã Sản Phẩm",
      "Tên Sản Phẩm",
      "Danh Mục",
      "Số Lượng Bán",
      "Đơn Giá TB (VNĐ)",
      "Doanh Thu (VNĐ)",
      "Tỷ Trọng (%)",
    ];

    const rows = processedProducts.map((p, idx) => {
      const avgPrice = p.totalQuantity > 0 ? Math.round(p.totalRevenue / p.totalQuantity) : 0;
      const share = totalRevenue > 0 ? ((p.totalRevenue / totalRevenue) * 100).toFixed(1) : 0;
      return [
        idx + 1,
        `"${p.productCode || ""}"`,
        `"${(p.productName || "").replace(/"/g, '""')}"`,
        `"${(p.categoryName || "").replace(/"/g, '""')}"`,
        p.totalQuantity || 0,
        avgPrice,
        p.totalRevenue || 0,
        `${share}%`,
      ];
    });

    // Add BOM for Excel UTF-8 display
    const csvContent =
      "\uFEFF" +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Bao_Cao_Doanh_So_San_Pham_${fromDate}_den_${toDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="mt-8 mb-8 flex flex-col gap-6">
      {/* ===== HEADER & TITLE ===== */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-blue-gray-100">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-600">
              <TrophyIcon className="w-7 h-7" />
            </div>
            <div>
              <Typography variant="h5" color="blue-gray" className="font-bold">
                Báo Cáo Doanh Số Sản Phẩm (Products Sales)
              </Typography>
              <Typography variant="small" className="text-gray-500 font-normal mt-0.5">
                Phân tích số lượng tiêu thụ, doanh thu và xếp hạng sản phẩm bán chạy theo danh mục và thời gian
              </Typography>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Nút Xuất Excel / CSV */}
          <Button
            size="sm"
            color="emerald"
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 normal-case text-xs font-semibold shadow-sm"
            onClick={handleExportCSV}
            disabled={processedProducts.length === 0}
          >
            <ArrowDownTrayIcon className="w-4 h-4" />
            Xuất Excel / CSV
          </Button>

          {/* Nút Làm mới */}
          <Button
            size="sm"
            variant="outlined"
            color="blue-gray"
            className="flex items-center gap-2 bg-white normal-case text-xs font-semibold"
            onClick={() => executeFetch(fromDate, toDate, keyword, categoryName)}
          >
            <ArrowPathIcon className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Làm mới
          </Button>
        </div>
      </div>

      {/* ===== 4 THẺ KPI PHÂN TÍCH DOANH SỐ ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Tổng Doanh Thu */}
        <Card className="border border-blue-gray-100 shadow-sm p-4 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <Typography variant="small" className="font-semibold text-gray-500 uppercase tracking-wider text-[11px]">
              Tổng Doanh Thu Sản Phẩm
            </Typography>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CurrencyDollarIcon className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-2">
            <Typography variant="h4" className="font-bold text-emerald-800">
              {formatMoney(totalRevenue)}
            </Typography>
            <Typography variant="small" className="text-xs text-gray-500 mt-1 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Doanh thu từ các đơn hàng thành công
            </Typography>
          </div>
        </Card>

        {/* Card 2: Tổng Lượng Bán Ra */}
        <Card className="border border-blue-gray-100 shadow-sm p-4 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <Typography variant="small" className="font-semibold text-gray-500 uppercase tracking-wider text-[11px]">
              Tổng Lượng Tiêu Thụ
            </Typography>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShoppingBagIcon className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-2">
            <Typography variant="h4" className="font-bold text-blue-gray-900">
              {totalSold.toLocaleString("vi-VN")}{" "}
              <span className="text-xs font-normal text-gray-500">món/sản phẩm</span>
            </Typography>
            <Typography variant="small" className="text-xs text-gray-500 mt-1 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              Tổng số lượng sản phẩm bán ra
            </Typography>
          </div>
        </Card>

        {/* Card 3: Số Mặt Hàng Bán Được */}
        <Card className="border border-blue-gray-100 shadow-sm p-4 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <Typography variant="small" className="font-semibold text-gray-500 uppercase tracking-wider text-[11px]">
              Số Mặt Hàng Đã Bán
            </Typography>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <TagIcon className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-2">
            <Typography variant="h4" className="font-bold text-purple-900">
              {totalProducts}{" "}
              <span className="text-xs font-normal text-gray-500">mặt hàng</span>
            </Typography>
            <Typography variant="small" className="text-xs text-gray-500 mt-1 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-purple-500"></span>
              Sản phẩm có phát sinh doanh số trong kỳ
            </Typography>
          </div>
        </Card>

        {/* Card 4: Quán Quân Bán Chạy (#1 Best Seller) */}
        <Card className="border border-blue-gray-100 shadow-sm p-4 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <Typography variant="small" className="font-semibold text-gray-500 uppercase tracking-wider text-[11px]">
              #1 Quán Quân Bán Chạy
            </Typography>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <TrophyIcon className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-2">
            <Typography
              variant="h6"
              className="font-bold text-gray-900 truncate"
              title={topProduct?.productName || "Chưa có"}
            >
              {topProduct?.productName || "Chưa có dữ liệu"}
            </Typography>
            <Typography variant="small" className="text-xs text-amber-700 font-semibold mt-1 flex items-center gap-1">
              {topProduct ? (
                <>
                  <span>{topProduct.totalQuantity} đã bán</span>
                  <span>•</span>
                  <span>{formatMoney(topProduct.totalRevenue)}</span>
                </>
              ) : (
                "Chưa phát sinh doanh số"
              )}
            </Typography>
          </div>
        </Card>
      </div>

      {/* ===== BỘ LỌC & TÌM KIẾM NÂNG CAO ===== */}
      <Card className="border border-blue-gray-100 shadow-sm p-5">
        <form onSubmit={handleSearch} className="flex flex-col gap-4">
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
                  Toàn thời gian
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
                  onClick={() => handleDatePreset("yesterday")}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                    datePreset === "yesterday"
                      ? "bg-white text-blue-600 shadow-sm font-semibold"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Hôm qua
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
              Có <span className="font-semibold text-gray-800">{processedProducts.length}</span> sản phẩm trong kết quả
            </div>
          </div>

          {/* Hàng 2: Form inputs */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            {/* Search Input (4 cols) */}
            <div className="md:col-span-4 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <MagnifyingGlassIcon className="w-4 h-4" />
              </div>
              <input
                type="text"
                placeholder="Tìm Tên sản phẩm, Mã sản phẩm..."
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

            {/* Danh mục (2 cols) */}
            <div className="md:col-span-2">
              <select
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                className="w-full px-2.5 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Tất cả danh mục --</option>
                {categories?.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Sắp xếp (2 cols) */}
            <div className="md:col-span-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-2.5 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="quantity_desc">Bán chạy nhất (SL ↓)</option>
                <option value="revenue_desc">Doanh thu cao nhất (VNĐ ↓)</option>
                <option value="quantity_asc">Bán ít nhất (SL ↑)</option>
                <option value="revenue_asc">Doanh thu thấp nhất (VNĐ ↑)</option>
                <option value="name_asc">Tên sản phẩm (A-Z)</option>
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
              Lọc dữ liệu
            </Button>
          </div>
        </form>
      </Card>

      {/* ===== BẢNG BÁO CÁO DOANH SỐ SẢN PHẨM ===== */}
      <Card className="border border-blue-gray-100 shadow-sm overflow-hidden">
        <CardBody className="px-0 pt-0 pb-2">
          {loading ? (
            <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <Typography className="text-sm font-medium text-gray-500">
                Đang tổng hợp dữ liệu doanh số sản phẩm...
              </Typography>
            </div>
          ) : processedProducts.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center justify-center gap-2">
              <ShoppingBagIcon className="w-12 h-12 text-gray-300" />
              <Typography variant="h6" color="blue-gray" className="font-semibold">
                Không tìm thấy dữ liệu bán hàng
              </Typography>
              <Typography variant="small" className="text-gray-500 max-w-sm">
                Không có sản phẩm nào phát sinh doanh số trong khoảng thời gian hoặc danh mục đã chọn.
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
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] table-auto text-left">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-blue-gray-100">
                    {[
                      "Xếp Hạng",
                      "Mã Sản Phẩm",
                      "Tên Sản Phẩm",
                      "Danh Mục",
                      "Đơn Giá TB",
                      "Số Lượng Bán",
                      "Doanh Thu Thu Được",
                      "Tỷ Trọng Doanh Thu",
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
                  {processedProducts.map((p, index) => {
                    const avgPrice =
                      p.totalQuantity > 0
                        ? Math.round(p.totalRevenue / p.totalQuantity)
                        : 0;
                    const sharePercent =
                      totalRevenue > 0
                        ? ((p.totalRevenue / totalRevenue) * 100).toFixed(1)
                        : 0;

                    return (
                      <tr
                        key={p.productCode || index}
                        className="hover:bg-blue-50/30 transition-colors"
                      >
                        {/* Hạng Rank */}
                        <td className="py-3 px-5">
                          {index === 0 ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                              🥇 Top 1
                            </span>
                          ) : index === 1 ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-200 text-gray-800 border border-gray-300">
                              🥈 Top 2
                            </span>
                          ) : index === 2 ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-900 border border-orange-300">
                              🥉 Top 3
                            </span>
                          ) : (
                            <span className="font-mono text-xs font-semibold text-gray-500 pl-2">
                              #{index + 1}
                            </span>
                          )}
                        </td>

                        {/* Mã SP */}
                        <td className="py-3 px-5">
                          <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                            {p.productCode}
                          </span>
                        </td>

                        {/* Tên SP */}
                        <td className="py-3 px-5">
                          <Typography className="text-xs font-bold text-gray-900">
                            {p.productName}
                          </Typography>
                        </td>

                        {/* Danh Mục */}
                        <td className="py-3 px-5">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-gray-100 text-gray-700">
                            {p.categoryName || "Khác"}
                          </span>
                        </td>

                        {/* Đơn Giá TB */}
                        <td className="py-3 px-5">
                          <Typography className="text-xs text-gray-600">
                            {formatMoney(avgPrice)}
                          </Typography>
                        </td>

                        {/* Số Lượng Bán */}
                        <td className="py-3 px-5">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700">
                            {p.totalQuantity} món
                          </span>
                        </td>

                        {/* Doanh Thu */}
                        <td className="py-3 px-5">
                          <Typography className="text-xs font-extrabold text-emerald-700">
                            {formatMoney(p.totalRevenue)}
                          </Typography>
                        </td>

                        {/* Tỷ Trọng Doanh Thu */}
                        <td className="py-3 px-5">
                          <div className="w-36">
                            <div className="flex items-center justify-between text-[11px] mb-1">
                              <span className="font-bold text-gray-700">
                                {sharePercent}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                              <div
                                className="bg-emerald-500 h-1.5 rounded-full"
                                style={{ width: `${Math.min(sharePercent, 100)}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>

                {/* Footer Tổng kết */}
                <tfoot>
                  <tr className="bg-gray-100/90 font-bold text-xs text-gray-800 border-t border-gray-300">
                    <td colSpan="5" className="py-3 px-5 text-right uppercase tracking-wider">
                      Tổng Cộng Toàn Bộ:
                    </td>
                    <td className="py-3 px-5 text-indigo-700 font-extrabold">
                      {totalSold.toLocaleString("vi-VN")} món
                    </td>
                    <td className="py-3 px-5 text-emerald-800 font-extrabold text-sm">
                      {formatMoney(totalRevenue)}
                    </td>
                    <td className="py-3 px-5 text-gray-600 font-bold">
                      100%
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

export default ProductsHistory;
