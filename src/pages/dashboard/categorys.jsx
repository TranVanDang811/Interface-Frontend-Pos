import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Button,
  Input,
  Chip,
} from "@material-tailwind/react";

import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState, useMemo, useCallback } from "react";
import {
  fetchCategories,
  fetchCategorySummary,
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/features/category/categoryThunks";

import Pagination from "@/utils/Pagination";
import {
  TagIcon,
  ArchiveBoxIcon,
  FolderMinusIcon,
  CubeIcon,
  FolderIcon,
  FolderPlusIcon,
  PencilSquareIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClipboardDocumentCheckIcon,
} from "@heroicons/react/24/solid";

export function Categories() {
  const dispatch = useDispatch();

  // Redux state
  const { list, loading, page, totalPages, totalElements, summary } = useSelector(
    (state) => state.category
  );

  // Local filter states
  const [keyword, setKeyword] = useState("");
  const [appliedKeyword, setAppliedKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL"); // ALL, HAS_PRODUCTS, EMPTY
  const [pageSize, setPageSize] = useState(10);

  // Modal Add / Edit state
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  // Warning / Confirmation Modal for Safe Delete
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  // Load data & summary
  const loadData = useCallback(
    (pageNumber = 1) => {
      dispatch(
        fetchCategories({
          page: pageNumber,
          size: pageSize,
          keyword: appliedKeyword.trim(),
        })
      );
      dispatch(fetchCategorySummary());
    },
    [dispatch, pageSize, appliedKeyword]
  );

  useEffect(() => {
    loadData(1);
  }, [loadData]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (modalOpen || deleteModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [modalOpen, deleteModalOpen]);

  // Handle Search submit & clear
  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    setAppliedKeyword(keyword);
  };

  const handleClearSearch = () => {
    setKeyword("");
    setAppliedKeyword("");
  };

  // Handle Page Change (1-based from Pagination component)
  const handlePageChange = (newPage) => {
    dispatch(
      fetchCategories({
        page: newPage,
        size: pageSize,
        keyword: appliedKeyword.trim(),
      })
    );
  };

  // Client-side status filter applied to current page list (or for display)
  const filteredList = useMemo(() => {
    if (!Array.isArray(list)) return [];
    if (statusFilter === "HAS_PRODUCTS") {
      return list.filter((c) => (c.productCount || 0) > 0);
    }
    if (statusFilter === "EMPTY") {
      return list.filter((c) => (c.productCount || 0) === 0);
    }
    return list;
  }, [list, statusFilter]);

  // KPI counts
  const kpiData = useMemo(() => {
    const totalCats = summary?.totalCategories ?? totalElements ?? 0;
    const withProds = summary?.categoriesWithProducts ?? 0;
    const emptyCats = summary?.emptyCategories ?? 0;
    const totalProds = summary?.totalProducts ?? 0;

    return {
      totalCategories: totalCats,
      categoriesWithProducts: withProds,
      emptyCategories: emptyCats,
      totalProducts: totalProds,
    };
  }, [summary, totalElements]);

  // Copy ID to clipboard
  const handleCopyId = (id) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Open Add Modal
  const handleOpenAddModal = () => {
    setIsEditMode(false);
    setEditingId(null);
    setFormData({ name: "", description: "" });
    setFormError(null);
    setModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (cat) => {
    setIsEditMode(true);
    setEditingId(cat.id);
    setFormData({
      name: cat.name || "",
      description: cat.description || "",
    });
    setFormError(null);
    setModalOpen(true);
  };

  // Submit Add / Edit Form
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormError("Vui lòng nhập tên danh mục");
      return;
    }

    setFormLoading(true);
    setFormError(null);

    try {
      if (isEditMode) {
        const action = await dispatch(
          updateCategory({
            id: editingId,
            name: formData.name.trim(),
            description: formData.description.trim(),
          })
        );
        if (updateCategory.fulfilled.match(action)) {
          setModalOpen(false);
          loadData(page + 1);
        } else {
          setFormError(
            action.payload?.message || "Không thể cập nhật danh mục. Vui lòng kiểm tra lại."
          );
        }
      } else {
        const action = await dispatch(
          createCategory({
            name: formData.name.trim(),
            description: formData.description.trim(),
          })
        );
        if (createCategory.fulfilled.match(action)) {
          setModalOpen(false);
          loadData(1);
        } else {
          setFormError(
            action.payload?.message || "Không thể thêm mới danh mục. Có thể tên đã tồn tại."
          );
        }
      }
    } catch (err) {
      setFormError("Đã xảy ra lỗi kết nối!");
    } finally {
      setFormLoading(false);
    }
  };

  // Prompt delete action
  const handleDeleteClick = (cat) => {
    setSelectedCategory(cat);
    setDeleteModalOpen(true);
  };

  // Execute safe delete
  const handleConfirmDelete = async () => {
    if (!selectedCategory) return;
    try {
      const action = await dispatch(deleteCategory(selectedCategory.id));
      if (deleteCategory.fulfilled.match(action)) {
        setDeleteModalOpen(false);
        setSelectedCategory(null);
        loadData(page + 1);
      } else {
        alert(action.payload?.message || "Lỗi khi xóa danh mục!");
      }
    } catch (err) {
      alert("Lỗi kết nối khi xóa danh mục!");
    }
  };

  return (
    <div className="mt-8 mb-8 flex flex-col gap-6 px-2 sm:px-4">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
              <TagIcon className="h-6 w-6" />
            </div>
            <div>
              <Typography variant="h5" color="blue-gray" className="font-bold">
                Quản lý Danh mục Sản phẩm
              </Typography>
              <Typography variant="small" className="text-gray-500 font-normal mt-0.5">
                Phân loại ngành hàng, cấu trúc danh mục và kiểm soát số lượng sản phẩm liên kết
              </Typography>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outlined"
            color="blue-gray"
            onClick={() => loadData(page + 1)}
            className="flex items-center gap-2 normal-case py-2.5 px-4 font-semibold text-gray-700 border-gray-300 hover:bg-gray-50 transition"
          >
            <ArrowPathIcon className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Làm mới
          </Button>

          <Button
            size="sm"
            color="blue"
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 normal-case py-2.5 px-4 font-semibold shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/40 transition"
          >
            <FolderPlusIcon className="h-4 w-4" />
            + Thêm Danh mục
          </Button>
        </div>
      </div>

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Tổng số danh mục */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center justify-between hover:shadow-md transition">
          <div>
            <Typography variant="small" className="text-gray-500 font-medium">
              Tổng số danh mục
            </Typography>
            <Typography variant="h4" color="blue-gray" className="font-bold mt-1">
              {kpiData.totalCategories.toLocaleString()}
            </Typography>
            <Typography variant="small" className="text-blue-600 font-medium text-xs mt-1">
              Ngành hàng đang quản lý
            </Typography>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <TagIcon className="h-6 w-6" />
          </div>
        </div>

        {/* Card 2: Có sản phẩm */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center justify-between hover:shadow-md transition">
          <div>
            <Typography variant="small" className="text-gray-500 font-medium">
              Đang có sản phẩm
            </Typography>
            <Typography variant="h4" color="blue-gray" className="font-bold mt-1 text-emerald-600">
              {kpiData.categoriesWithProducts.toLocaleString()}
            </Typography>
            <Typography variant="small" className="text-emerald-700 font-medium text-xs mt-1">
              Đang kinh doanh hoạt động
            </Typography>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <ArchiveBoxIcon className="h-6 w-6" />
          </div>
        </div>

        {/* Card 3: Danh mục trống */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center justify-between hover:shadow-md transition">
          <div>
            <Typography variant="small" className="text-gray-500 font-medium">
              Danh mục trống
            </Typography>
            <Typography variant="h4" color="blue-gray" className="font-bold mt-1 text-amber-600">
              {kpiData.emptyCategories.toLocaleString()}
            </Typography>
            <Typography variant="small" className="text-amber-700 font-medium text-xs mt-1">
              Chưa gán sản phẩm nào
            </Typography>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <FolderMinusIcon className="h-6 w-6" />
          </div>
        </div>

        {/* Card 4: Tổng sản phẩm */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center justify-between hover:shadow-md transition">
          <div>
            <Typography variant="small" className="text-gray-500 font-medium">
              Tổng số sản phẩm
            </Typography>
            <Typography variant="h4" color="blue-gray" className="font-bold mt-1 text-purple-600">
              {kpiData.totalProducts.toLocaleString()}
            </Typography>
            <Typography variant="small" className="text-purple-700 font-medium text-xs mt-1">
              Phân bổ trong hệ thống
            </Typography>
          </div>
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <CubeIcon className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Tìm theo tên danh mục, mô tả..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
            />
            <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            {keyword && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 rounded-full"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            )}
          </div>
          <Button
            type="submit"
            size="sm"
            color="gray"
            className="normal-case py-2.5 px-4 font-semibold shrink-0"
          >
            Tìm kiếm
          </Button>
        </form>

        {/* Filter controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Status filter pills */}
          <div className="flex bg-gray-100 p-1 rounded-xl text-xs font-semibold text-gray-600">
            <button
              onClick={() => setStatusFilter("ALL")}
              className={`px-3 py-1.5 rounded-lg transition ${
                statusFilter === "ALL"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "hover:text-gray-900"
              }`}
            >
              Tất cả ({totalElements})
            </button>
            <button
              onClick={() => setStatusFilter("HAS_PRODUCTS")}
              className={`px-3 py-1.5 rounded-lg transition ${
                statusFilter === "HAS_PRODUCTS"
                  ? "bg-white text-emerald-600 shadow-sm"
                  : "hover:text-gray-900"
              }`}
            >
              Có sản phẩm
            </button>
            <button
              onClick={() => setStatusFilter("EMPTY")}
              className={`px-3 py-1.5 rounded-lg transition ${
                statusFilter === "EMPTY"
                  ? "bg-white text-amber-600 shadow-sm"
                  : "hover:text-gray-900"
              }`}
            >
              Danh mục trống
            </button>
          </div>

          {/* Page size select */}
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <span>Hiển thị:</span>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="border border-gray-300 rounded-lg px-2 py-1.5 text-xs text-gray-700 bg-white focus:outline-none focus:border-blue-500"
            >
              <option value={5}>5 dòng</option>
              <option value={10}>10 dòng</option>
              <option value={20}>20 dòng</option>
              <option value={50}>50 dòng</option>
            </select>
          </div>
        </div>
      </div>

      {/* CATEGORIES TABLE */}
      <Card className="border border-gray-100 shadow-sm rounded-2xl overflow-hidden">
        <CardBody className="overflow-x-auto p-0">
          {loading ? (
            <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
              <ArrowPathIcon className="h-8 w-8 text-blue-500 animate-spin" />
              <Typography className="text-gray-500 font-medium text-sm">
                Đang tải danh sách danh mục...
              </Typography>
            </div>
          ) : filteredList.length === 0 ? (
            <div className="py-16 text-center flex flex-col items-center justify-center gap-2">
              <FolderMinusIcon className="h-12 w-12 text-gray-300" />
              <Typography variant="h6" className="text-gray-700 font-bold">
                Không tìm thấy danh mục nào
              </Typography>
              <Typography className="text-gray-500 text-xs max-w-sm">
                {appliedKeyword
                  ? `Không có kết quả khớp với từ khóa "${appliedKeyword}". Hãy thử tìm kiếm bằng từ khóa khác.`
                  : "Hệ thống chưa có danh mục sản phẩm nào. Hãy bấm '+ Thêm Danh mục' để tạo mới."}
              </Typography>
              {appliedKeyword && (
                <Button
                  size="sm"
                  variant="text"
                  color="blue"
                  onClick={handleClearSearch}
                  className="mt-2 normal-case font-semibold"
                >
                  Xóa bộ lọc tìm kiếm
                </Button>
              )}
            </div>
          ) : (
            <table className="w-full min-w-[700px] table-auto text-left">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100 text-gray-500 text-[11px] font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-5">Mã Danh mục</th>
                  <th className="py-3.5 px-5">Tên Danh mục</th>
                  <th className="py-3.5 px-5">Mô tả</th>
                  <th className="py-3.5 px-5 text-center">Số lượng Sản phẩm</th>
                  <th className="py-3.5 px-5 text-center">Trạng thái</th>
                  <th className="py-3.5 px-5 text-right">Thao tác</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {filteredList.map((category) => {
                  const productCount = category.productCount || 0;
                  const hasProducts = productCount > 0;

                  return (
                    <tr
                      key={category.id}
                      className="hover:bg-blue-50/30 transition-colors"
                    >
                      {/* ID with Copy */}
                      <td className="py-3.5 px-5">
                        <button
                          type="button"
                          onClick={() => handleCopyId(category.id)}
                          title="Bấm để sao chép ID"
                          className="group inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-gray-100 hover:bg-blue-50 border border-gray-200 text-xs font-mono font-medium text-gray-700 hover:text-blue-700 transition"
                        >
                          <span className="max-w-[130px] truncate">{category.id}</span>
                          {copiedId === category.id ? (
                            <ClipboardDocumentCheckIcon className="h-3.5 w-3.5 text-emerald-600" />
                          ) : (
                            <span className="text-[10px] text-gray-400 group-hover:text-blue-500 font-sans">
                              copy
                            </span>
                          )}
                        </button>
                      </td>

                      {/* Name with icon */}
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg shrink-0">
                            <FolderIcon className="h-4 w-4" />
                          </div>
                          <Typography className="text-sm font-bold text-gray-800">
                            {category.name}
                          </Typography>
                        </div>
                      </td>

                      {/* Description */}
                      <td className="py-3.5 px-5 max-w-xs">
                        <Typography className="text-xs text-gray-600 line-clamp-2">
                          {category.description ? (
                            category.description
                          ) : (
                            <span className="italic text-gray-400 font-light">
                              Chưa có mô tả chi tiết
                            </span>
                          )}
                        </Typography>
                      </td>

                      {/* Product Count */}
                      <td className="py-3.5 px-5 text-center">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                            hasProducts
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-gray-100 text-gray-500 border border-gray-200"
                          }`}
                        >
                          <CubeIcon className="h-3.5 w-3.5" />
                          {productCount.toLocaleString()} sản phẩm
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-5 text-center">
                        {hasProducts ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                            Đang hoạt động
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
                            Danh mục trống
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Edit button */}
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(category)}
                            title="Chỉnh sửa danh mục"
                            className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 hover:text-blue-700 transition"
                          >
                            <PencilSquareIcon className="h-4 w-4" />
                          </button>

                          {/* Delete button */}
                          <button
                            type="button"
                            onClick={() => handleDeleteClick(category)}
                            title="Xóa danh mục"
                            className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 hover:text-red-700 transition"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {/* PAGINATION */}
          <div className="p-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <Typography variant="small" className="text-gray-500 text-xs">
              Hiển thị {filteredList.length} trên tổng số {totalElements} danh mục
            </Typography>
            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        </CardBody>
      </Card>

      {/* ======================================================== */}
      {/* IN-PLACE MODAL: ADD / EDIT CATEGORY */}
      {/* ======================================================== */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100 animate-scale-up">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                  {isEditMode ? (
                    <PencilSquareIcon className="h-5 w-5" />
                  ) : (
                    <FolderPlusIcon className="h-5 w-5" />
                  )}
                </div>
                <div>
                  <Typography variant="h6" className="font-bold text-gray-800">
                    {isEditMode ? "Cập nhật Danh mục" : "Thêm Danh mục Mới"}
                  </Typography>
                  <Typography className="text-xs text-gray-500">
                    {isEditMode
                      ? "Chỉnh sửa tên hoặc mô tả danh mục sản phẩm"
                      : "Tạo danh mục mới để phân loại sản phẩm trong kho"}
                  </Typography>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-xl hover:bg-gray-100 transition"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleFormSubmit}>
              <div className="p-6 flex flex-col gap-4">
                {formError && (
                  <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
                    <ExclamationTriangleIcon className="h-4 w-4 shrink-0 mt-0.5 text-red-500" />
                    <span>{formError}</span>
                  </div>
                )}

                {/* Name */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                    Tên Danh mục <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Đồ uống, Bánh kẹo, Thực phẩm đông lạnh..."
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                  />
                  <span className="text-[11px] text-gray-400 mt-1 block">
                    Tên danh mục cần ngắn gọn, rõ ràng và không được trùng lặp.
                  </span>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                    Mô tả Danh mục
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Mô tả tóm tắt về nhóm sản phẩm này (tùy chọn)..."
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-2.5 px-6 py-4 bg-gray-50 border-t border-gray-100">
                <Button
                  type="button"
                  variant="outlined"
                  size="sm"
                  color="blue-gray"
                  onClick={() => setModalOpen(false)}
                  disabled={formLoading}
                  className="normal-case font-semibold border-gray-300 text-gray-700"
                >
                  Hủy bỏ
                </Button>

                <Button
                  type="submit"
                  size="sm"
                  color="blue"
                  disabled={formLoading}
                  className="normal-case font-semibold shadow-md shadow-blue-500/20 flex items-center gap-2"
                >
                  {formLoading && <ArrowPathIcon className="h-4 w-4 animate-spin" />}
                  {isEditMode ? "Lưu thay đổi" : "Tạo danh mục"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SAFE DELETE CONFIRMATION / BLOCKED MODAL */}
      {/* ======================================================== */}
      {deleteModalOpen && selectedCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100 animate-scale-up">
            {/* Header */}
            <div className="p-6 text-center">
              {(selectedCategory.productCount || 0) > 0 ? (
                /* BLOCKED CASE: Category has linked products */
                <>
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 border border-amber-200">
                    <ExclamationTriangleIcon className="h-8 w-8" />
                  </div>
                  <Typography variant="h5" color="blue-gray" className="font-bold">
                    Không thể xóa danh mục!
                  </Typography>
                  <Typography className="text-sm text-gray-600 mt-2">
                    Danh mục{" "}
                    <span className="font-bold text-gray-800">
                      "{selectedCategory.name}"
                    </span>{" "}
                    hiện đang chứa{" "}
                    <span className="font-bold text-amber-600">
                      {selectedCategory.productCount} sản phẩm
                    </span>
                    .
                  </Typography>
                  <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-200 text-left text-xs text-amber-900 leading-relaxed">
                    💡 <strong>Để xóa danh mục này an toàn:</strong>
                    <ul className="list-disc ml-4 mt-1 space-y-1">
                      <li>Chuyển các sản phẩm thuộc danh mục này sang danh mục khác, hoặc</li>
                      <li>Xóa các sản phẩm liên kết trước khi xóa danh mục.</li>
                    </ul>
                  </div>

                  <div className="mt-6 flex justify-center">
                    <Button
                      size="sm"
                      color="blue-gray"
                      onClick={() => setDeleteModalOpen(false)}
                      className="normal-case font-semibold px-6"
                    >
                      Đã hiểu
                    </Button>
                  </div>
                </>
              ) : (
                /* SAFE CASE: Category has 0 products */
                <>
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600 border border-red-200">
                    <TrashIcon className="h-8 w-8" />
                  </div>
                  <Typography variant="h5" color="blue-gray" className="font-bold">
                    Xác nhận xóa danh mục?
                  </Typography>
                  <Typography className="text-sm text-gray-600 mt-2">
                    Bạn có chắc chắn muốn xóa danh mục{" "}
                    <span className="font-bold text-gray-800">
                      "{selectedCategory.name}"
                    </span>
                    ? Thao tác này không thể hoàn tác.
                  </Typography>

                  <div className="mt-6 flex items-center justify-center gap-3">
                    <Button
                      variant="outlined"
                      size="sm"
                      color="blue-gray"
                      onClick={() => setDeleteModalOpen(false)}
                      className="normal-case font-semibold border-gray-300 text-gray-700"
                    >
                      Hủy bỏ
                    </Button>
                    <Button
                      size="sm"
                      color="red"
                      onClick={handleConfirmDelete}
                      className="normal-case font-semibold shadow-md shadow-red-500/20"
                    >
                      Xác nhận xóa
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Categories;
