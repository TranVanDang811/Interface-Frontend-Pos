import {
  Card,
  CardBody,
  Typography,
  Button,
} from "@material-tailwind/react";

import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState, useMemo, useCallback } from "react";
import {
  fetchSuppliers,
  fetchSupplierSummary,
  createSupplier,
  updateSupplier,
  deleteSupplier,
} from "@/features/supplier/supplierThunks";

import Pagination from "@/utils/Pagination";
import {
  BuildingOffice2Icon,
  TruckIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  DocumentTextIcon,
  CubeIcon,
  PencilSquareIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClipboardDocumentCheckIcon,
  PlusIcon,
  ClockIcon,
} from "@heroicons/react/24/solid";

export function Suppliers() {
  const dispatch = useDispatch();

  // Redux state
  const { list, loading, page, totalPages, totalElements, summary } = useSelector(
    (state) => state.supplier
  );

  // Local filter states
  const [keyword, setKeyword] = useState("");
  const [appliedKeyword, setAppliedKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL"); // ALL, ACTIVE, IDLE
  const [pageSize, setPageSize] = useState(10);

  // Modal Add / Edit state
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
  });

  // Safe delete confirmation modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  // Load data & summary
  const loadData = useCallback(
    (pageNumber = 1) => {
      dispatch(
        fetchSuppliers({
          page: pageNumber,
          size: pageSize,
          keyword: appliedKeyword.trim(),
        })
      );
      dispatch(fetchSupplierSummary());
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

  // Handle search
  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    setAppliedKeyword(keyword);
  };

  const handleClearSearch = () => {
    setKeyword("");
    setAppliedKeyword("");
  };

  // Handle page change (1-based from Pagination component)
  const handlePageChange = (newPage) => {
    dispatch(
      fetchSuppliers({
        page: newPage,
        size: pageSize,
        keyword: appliedKeyword.trim(),
      })
    );
  };

  // Filter list by active status
  const filteredList = useMemo(() => {
    if (!Array.isArray(list)) return [];
    if (statusFilter === "ACTIVE") {
      return list.filter(
        (s) => (s.productCount || 0) > 0 || (s.importOrderCount || 0) > 0
      );
    }
    if (statusFilter === "IDLE") {
      return list.filter(
        (s) => (s.productCount || 0) === 0 && (s.importOrderCount || 0) === 0
      );
    }
    return list;
  }, [list, statusFilter]);

  // KPI Data
  const kpiData = useMemo(() => {
    const totalSups = summary?.totalSuppliers ?? totalElements ?? 0;
    const activeSups = summary?.activeSuppliers ?? 0;
    const idleSups = summary?.idleSuppliers ?? 0;
    const totalProds = summary?.totalProductsSupplied ?? 0;
    const totalOrders = summary?.totalImportOrders ?? 0;

    return {
      totalSuppliers: totalSups,
      activeSuppliers: activeSups,
      idleSuppliers: idleSups,
      totalProductsSupplied: totalProds,
      totalImportOrders: totalOrders,
    };
  }, [summary, totalElements]);

  // Copy ID
  const handleCopyId = (id) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Open Add Modal
  const handleOpenAddModal = () => {
    setIsEditMode(false);
    setEditingId(null);
    setFormData({ name: "", phone: "", email: "", address: "" });
    setFormError(null);
    setModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (sup) => {
    setIsEditMode(true);
    setEditingId(sup.id);
    setFormData({
      name: sup.name || "",
      phone: sup.phone || "",
      email: sup.email || "",
      address: sup.address || "",
    });
    setFormError(null);
    setModalOpen(true);
  };

  // Submit Form
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormError("Vui lòng nhập tên nhà cung cấp");
      return;
    }

    setFormLoading(true);
    setFormError(null);

    try {
      if (isEditMode) {
        const action = await dispatch(
          updateSupplier({
            id: editingId,
            name: formData.name.trim(),
            phone: formData.phone.trim(),
            email: formData.email.trim(),
            address: formData.address.trim(),
          })
        );
        if (updateSupplier.fulfilled.match(action)) {
          setModalOpen(false);
          loadData(page + 1);
        } else {
          setFormError(
            action.payload?.message ||
              "Không thể cập nhật nhà cung cấp. Vui lòng kiểm tra lại."
          );
        }
      } else {
        const action = await dispatch(
          createSupplier({
            name: formData.name.trim(),
            phone: formData.phone.trim(),
            email: formData.email.trim(),
            address: formData.address.trim(),
          })
        );
        if (createSupplier.fulfilled.match(action)) {
          setModalOpen(false);
          loadData(1);
        } else {
          setFormError(
            action.payload?.message ||
              "Không thể thêm nhà cung cấp. Tên nhà cung cấp có thể đã tồn tại."
          );
        }
      }
    } catch (err) {
      setFormError("Đã xảy ra lỗi kết nối máy chủ!");
    } finally {
      setFormLoading(false);
    }
  };

  // Prompt delete
  const handleDeleteClick = (sup) => {
    setSelectedSupplier(sup);
    setDeleteModalOpen(true);
  };

  // Execute safe delete
  const handleConfirmDelete = async () => {
    if (!selectedSupplier) return;
    try {
      const action = await dispatch(deleteSupplier(selectedSupplier.id));
      if (deleteSupplier.fulfilled.match(action)) {
        setDeleteModalOpen(false);
        setSelectedSupplier(null);
        loadData(page + 1);
      } else {
        alert(action.payload?.message || "Lỗi khi xóa nhà cung cấp!");
      }
    } catch (err) {
      alert("Lỗi kết nối khi xóa nhà cung cấp!");
    }
  };

  return (
    <div className="mt-8 mb-8 flex flex-col gap-6 px-2 sm:px-4">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
              <TruckIcon className="h-6 w-6" />
            </div>
            <div>
              <Typography variant="h5" color="blue-gray" className="font-bold">
                Quản lý Nhà cung cấp (Suppliers)
              </Typography>
              <Typography variant="small" className="text-gray-500 font-normal mt-0.5">
                Quản lý thông tin đối tác cung ứng, liên hệ, kiểm soát danh mục sản phẩm và đơn nhập hàng
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
            <PlusIcon className="h-4 w-4" />
            + Thêm Nhà cung cấp
          </Button>
        </div>
      </div>

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Tổng số nhà cung cấp */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center justify-between hover:shadow-md transition">
          <div>
            <Typography variant="small" className="text-gray-500 font-medium">
              Tổng số đối tác NCC
            </Typography>
            <Typography variant="h4" color="blue-gray" className="font-bold mt-1">
              {kpiData.totalSuppliers.toLocaleString()}
            </Typography>
            <Typography variant="small" className="text-blue-600 font-medium text-xs mt-1">
              Đơn vị đối tác cung ứng
            </Typography>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <BuildingOffice2Icon className="h-6 w-6" />
          </div>
        </div>

        {/* Card 2: Đang hợp tác tích cực */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center justify-between hover:shadow-md transition">
          <div>
            <Typography variant="small" className="text-gray-500 font-medium">
              Đang hợp tác tích cực
            </Typography>
            <Typography variant="h4" color="blue-gray" className="font-bold mt-1 text-emerald-600">
              {kpiData.activeSuppliers.toLocaleString()}
            </Typography>
            <Typography variant="small" className="text-emerald-700 font-medium text-xs mt-1">
              Có sản phẩm hoặc đơn nhập
            </Typography>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircleIcon className="h-6 w-6" />
          </div>
        </div>

        {/* Card 3: Chưa phát sinh giao dịch */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center justify-between hover:shadow-md transition">
          <div>
            <Typography variant="small" className="text-gray-500 font-medium">
              Chưa phát sinh dữ liệu
            </Typography>
            <Typography variant="h4" color="blue-gray" className="font-bold mt-1 text-amber-600">
              {kpiData.idleSuppliers.toLocaleString()}
            </Typography>
            <Typography variant="small" className="text-amber-700 font-medium text-xs mt-1">
              Đối tác mới / chưa gán hàng
            </Typography>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <ClockIcon className="h-6 w-6" />
          </div>
        </div>

        {/* Card 4: Tổng sản phẩm cung ứng */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center justify-between hover:shadow-md transition">
          <div>
            <Typography variant="small" className="text-gray-500 font-medium">
              Sản phẩm & Đơn nhập
            </Typography>
            <Typography variant="h4" color="blue-gray" className="font-bold mt-1 text-purple-600">
              {kpiData.totalProductsSupplied.toLocaleString()}
            </Typography>
            <Typography variant="small" className="text-purple-700 font-medium text-xs mt-1">
              {kpiData.totalImportOrders.toLocaleString()} đơn nhập hàng
            </Typography>
          </div>
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <CubeIcon className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search input */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Tìm theo tên NCC, SĐT, email, địa chỉ..."
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

        {/* Filter pills & page size */}
        <div className="flex flex-wrap items-center gap-3">
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
              onClick={() => setStatusFilter("ACTIVE")}
              className={`px-3 py-1.5 rounded-lg transition ${
                statusFilter === "ACTIVE"
                  ? "bg-white text-emerald-600 shadow-sm"
                  : "hover:text-gray-900"
              }`}
            >
              Đang hợp tác
            </button>
            <button
              onClick={() => setStatusFilter("IDLE")}
              className={`px-3 py-1.5 rounded-lg transition ${
                statusFilter === "IDLE"
                  ? "bg-white text-amber-600 shadow-sm"
                  : "hover:text-gray-900"
              }`}
            >
              Chưa có dữ liệu
            </button>
          </div>

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

      {/* SUPPLIERS TABLE */}
      <Card className="border border-gray-100 shadow-sm rounded-2xl overflow-hidden">
        <CardBody className="overflow-x-auto p-0">
          {loading ? (
            <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
              <ArrowPathIcon className="h-8 w-8 text-blue-500 animate-spin" />
              <Typography className="text-gray-500 font-medium text-sm">
                Đang tải danh sách nhà cung cấp...
              </Typography>
            </div>
          ) : filteredList.length === 0 ? (
            <div className="py-16 text-center flex flex-col items-center justify-center gap-2">
              <TruckIcon className="h-12 w-12 text-gray-300" />
              <Typography variant="h6" className="text-gray-700 font-bold">
                Không tìm thấy nhà cung cấp nào
              </Typography>
              <Typography className="text-gray-500 text-xs max-w-sm">
                {appliedKeyword
                  ? `Không có kết quả khớp với từ khóa "${appliedKeyword}". Hãy thử tìm kiếm bằng từ khóa khác.`
                  : "Hệ thống chưa có đối tác cung ứng nào. Hãy bấm '+ Thêm Nhà cung cấp' để tạo mới."}
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
            <table className="w-full min-w-[850px] table-auto text-left">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100 text-gray-500 text-[11px] font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-5">Mã NCC</th>
                  <th className="py-3.5 px-5">Tên Nhà cung cấp</th>
                  <th className="py-3.5 px-5">Liên hệ</th>
                  <th className="py-3.5 px-5">Địa chỉ</th>
                  <th className="py-3.5 px-5 text-center">Quy mô hợp tác</th>
                  <th className="py-3.5 px-5 text-center">Trạng thái</th>
                  <th className="py-3.5 px-5 text-right">Thao tác</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {filteredList.map((supplier) => {
                  const productCount = supplier.productCount || 0;
                  const orderCount = supplier.importOrderCount || 0;
                  const isActive = productCount > 0 || orderCount > 0;

                  return (
                    <tr
                      key={supplier.id}
                      className="hover:bg-blue-50/30 transition-colors"
                    >
                      {/* ID with Copy */}
                      <td className="py-3.5 px-5">
                        <button
                          type="button"
                          onClick={() => handleCopyId(supplier.id)}
                          title="Bấm để sao chép ID"
                          className="group inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-gray-100 hover:bg-blue-50 border border-gray-200 text-xs font-mono font-medium text-gray-700 hover:text-blue-700 transition"
                        >
                          <span className="max-w-[120px] truncate">{supplier.id}</span>
                          {copiedId === supplier.id ? (
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
                            <BuildingOffice2Icon className="h-4 w-4" />
                          </div>
                          <div>
                            <Typography className="text-sm font-bold text-gray-800">
                              {supplier.name}
                            </Typography>
                          </div>
                        </div>
                      </td>

                      {/* Contact Info (Phone & Email) */}
                      <td className="py-3.5 px-5">
                        <div className="flex flex-col gap-1 text-xs">
                          {supplier.phone ? (
                            <a
                              href={`tel:${supplier.phone}`}
                              className="inline-flex items-center gap-1.5 text-gray-700 hover:text-blue-600 transition"
                            >
                              <PhoneIcon className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                              <span>{supplier.phone}</span>
                            </a>
                          ) : (
                            <span className="text-gray-400 italic text-[11px]">
                              Chưa có SĐT
                            </span>
                          )}

                          {supplier.email ? (
                            <a
                              href={`mailto:${supplier.email}`}
                              className="inline-flex items-center gap-1.5 text-gray-600 hover:text-blue-600 transition"
                            >
                              <EnvelopeIcon className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                              <span className="max-w-[180px] truncate">
                                {supplier.email}
                              </span>
                            </a>
                          ) : (
                            <span className="text-gray-400 italic text-[11px]">
                              Chưa có Email
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Address */}
                      <td className="py-3.5 px-5 max-w-xs">
                        <div className="flex items-start gap-1.5 text-xs text-gray-600">
                          {supplier.address ? (
                            <>
                              <MapPinIcon className="h-3.5 w-3.5 text-gray-400 shrink-0 mt-0.5" />
                              <span className="line-clamp-2">{supplier.address}</span>
                            </>
                          ) : (
                            <span className="italic text-gray-400">
                              Chưa có địa chỉ
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Collaboration scale (Products & Orders) */}
                      <td className="py-3.5 px-5 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                              productCount > 0
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-gray-100 text-gray-500"
                            }`}
                          >
                            <CubeIcon className="h-3 w-3" />
                            {productCount.toLocaleString()} SP
                          </span>
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                              orderCount > 0
                                ? "bg-blue-50 text-blue-700 border border-blue-200"
                                : "bg-gray-100 text-gray-500"
                            }`}
                          >
                            <DocumentTextIcon className="h-3 w-3" />
                            {orderCount.toLocaleString()} đơn nhập
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-5 text-center">
                        {isActive ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                            Đang hợp tác
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
                            Chưa có dữ liệu
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Edit button */}
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(supplier)}
                            title="Chỉnh sửa thông tin NCC"
                            className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 hover:text-blue-700 transition"
                          >
                            <PencilSquareIcon className="h-4 w-4" />
                          </button>

                          {/* Delete button */}
                          <button
                            type="button"
                            onClick={() => handleDeleteClick(supplier)}
                            title="Xóa nhà cung cấp"
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
              Hiển thị {filteredList.length} trên tổng số {totalElements} đối tác nhà cung cấp
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
      {/* IN-PLACE MODAL: ADD / EDIT SUPPLIER */}
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
                    <TruckIcon className="h-5 w-5" />
                  )}
                </div>
                <div>
                  <Typography variant="h6" className="font-bold text-gray-800">
                    {isEditMode
                      ? "Cập nhật Nhà cung cấp"
                      : "Thêm Nhà cung cấp Mới"}
                  </Typography>
                  <Typography className="text-xs text-gray-500">
                    {isEditMode
                      ? "Chỉnh sửa thông tin đối tác cung ứng hàng hóa"
                      : "Đăng ký thông tin nhà phân phối đối tác mới"}
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

            {/* Modal Form */}
            <form onSubmit={handleFormSubmit}>
              <div className="p-6 flex flex-col gap-4">
                {formError && (
                  <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
                    <ExclamationTriangleIcon className="h-4 w-4 shrink-0 mt-0.5 text-red-500" />
                    <span>{formError}</span>
                  </div>
                )}

                {/* Supplier Name */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                    Tên Nhà cung cấp <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Công ty TNHH Thực Phẩm ABC, Vinamilk..."
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                  />
                </div>

                {/* Phone & Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                      Số điện thoại
                    </label>
                    <input
                      type="text"
                      placeholder="0912 345 678"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                      Email liên hệ
                    </label>
                    <input
                      type="email"
                      placeholder="lienhe@doitac.vn"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                    />
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                    Địa chỉ trụ sở / kho bãi
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố..."
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
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
                  {isEditMode ? "Lưu thay đổi" : "Tạo nhà cung cấp"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SAFE DELETE CONFIRMATION / BLOCKED MODAL */}
      {/* ======================================================== */}
      {deleteModalOpen && selectedSupplier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100 animate-scale-up">
            <div className="p-6 text-center">
              {(selectedSupplier.productCount || 0) > 0 ||
              (selectedSupplier.importOrderCount || 0) > 0 ? (
                /* BLOCKED CASE: Supplier has linked products or import orders */
                <>
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 border border-amber-200">
                    <ExclamationTriangleIcon className="h-8 w-8" />
                  </div>
                  <Typography variant="h5" color="blue-gray" className="font-bold">
                    Không thể xóa nhà cung cấp!
                  </Typography>
                  <Typography className="text-sm text-gray-600 mt-2">
                    Đối tác{" "}
                    <span className="font-bold text-gray-800">
                      "{selectedSupplier.name}"
                    </span>{" "}
                    đang có ràng buộc với dữ liệu kho hàng:
                  </Typography>

                  <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-200 text-left text-xs text-amber-900 leading-relaxed">
                    <ul className="list-disc ml-4 space-y-1">
                      <li>
                        Đang liên kết với{" "}
                        <strong className="text-amber-800">
                          {selectedSupplier.productCount || 0} sản phẩm
                        </strong>
                      </li>
                      <li>
                        Có{" "}
                        <strong className="text-amber-800">
                          {selectedSupplier.importOrderCount || 0} đơn nhập hàng
                        </strong>{" "}
                        trong lịch sử
                      </li>
                    </ul>
                    <div className="mt-2 text-[11px] text-amber-800">
                      💡 Để đảm bảo tính toàn vẹn chứng từ kế toán và kho, bạn không thể xóa nhà cung cấp đã có giao dịch. Hãy chuyển liên kết sản phẩm trước nếu muốn dọn dẹp.
                    </div>
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
                /* SAFE CASE: 0 products & 0 import orders */
                <>
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600 border border-red-200">
                    <TrashIcon className="h-8 w-8" />
                  </div>
                  <Typography variant="h5" color="blue-gray" className="font-bold">
                    Xác nhận xóa nhà cung cấp?
                  </Typography>
                  <Typography className="text-sm text-gray-600 mt-2">
                    Bạn có chắc chắn muốn xóa đối tác{" "}
                    <span className="font-bold text-gray-800">
                      "{selectedSupplier.name}"
                    </span>
                    ? Thao tác này sẽ xóa hoàn toàn khỏi danh bạ đối tác.
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

export default Suppliers;
