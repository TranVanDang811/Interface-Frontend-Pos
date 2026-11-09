import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Avatar,
  Chip,
  Button,
  Input,
} from "@material-tailwind/react";

import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import {
  changeProductStatus,
  deleteProduct,
  fetchProducts,
  updateProduct,
} from "@/features/product/productThunks";
import { fetchCategories } from "@/features/category/categoryThunks";
import { fetchSuppliers } from "@/features/supplier/supplierThunks";
import { showAlert } from "@/features/alert/alertSlice";
import { useNavigate } from "react-router-dom";
import {
  XMarkIcon,
  PencilSquareIcon,
  TrashIcon,
  NoSymbolIcon,
  FunnelIcon,
  ArrowPathIcon,
  PlusIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/solid";
import Pagination from "@/utils/Pagination";

export function Products() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Filters
  const [keyword, setKeyword] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  // Edit modal state
  const [editingProduct, setEditingProduct] = useState(null);
  const [editForm, setEditForm] = useState({
    productCode: "",
    name: "",
    price: "",
    cost: "",
    unit: "",
    stock: "",
    categoryName: "",
    supplierName: "",
    status: "",
  });
  const [editImage, setEditImage] = useState(null);
  const [editImagePreview, setEditImagePreview] = useState("");
  const [submittingEdit, setSubmittingEdit] = useState(false);

  const { list, loading, page, totalPages } = useSelector(
    (state) => state.product
  );
  const categories = useSelector((state) => state.category.list) || [];
  const suppliers = useSelector((state) => state.supplier.list) || [];

  // Load danh mục, nhà cung cấp và sản phẩm
  useEffect(() => {
    dispatch(fetchCategories({ page: 1, size: 100 }));
    dispatch(fetchSuppliers({ page: 1, size: 100 }));
    loadData(1);
  }, [dispatch]);

  const loadData = (
    pageIndex = 1,
    customKeyword = keyword,
    customCategory = selectedCategory,
    customStatus = selectedStatus
  ) => {
    dispatch(
      fetchProducts({
        keyword: customKeyword.trim() || undefined,
        categoryName: customCategory || undefined,
        status: customStatus || undefined,
        page: pageIndex,
        size: 5,
      })
    );
  };

  const handlePageChange = (newPage) => {
    loadData(newPage);
  };

  const handleSearch = (e) => {
    e?.preventDefault();
    loadData(1);
  };

  const handleResetFilters = () => {
    setKeyword("");
    setSelectedCategory("");
    setSelectedStatus("");
    loadData(1, "", "", "");
  };

  // Mở modal sửa sản phẩm
  const handleOpenEditModal = (product) => {
    setEditingProduct(product);
    setEditForm({
      productCode: product.productCode || "",
      name: product.name || "",
      price: product.price ?? "",
      cost: product.cost ?? "",
      unit: product.unit || "",
      stock: product.stock ?? 0,
      categoryName: product.category?.name || "",
      supplierName: product.supplier?.name || "",
      status: product.status || "ACTIVE",
    });
    setEditImage(null);
    setEditImagePreview(product.imageUrl || "");
  };

  const handleCloseEditModal = () => {
    setEditingProduct(null);
    setSubmittingEdit(false);
  };

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditImage(file);
      setEditImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSaveEdit = async () => {
    if (!editForm.name.trim()) {
      alert("Tên sản phẩm không được để trống");
      return;
    }
    if (!editForm.productCode.trim()) {
      alert("Mã sản phẩm không được để trống");
      return;
    }

    setSubmittingEdit(true);

    const payload = {
      ...editForm,
      price: Number(editForm.price),
      cost: editForm.cost !== "" ? Number(editForm.cost) : null,
      stock: Number(editForm.stock),
    };

    try {
      const res = await dispatch(
        updateProduct({
          id: editingProduct.id,
          product: payload,
          image: editImage,
        })
      );

      if (updateProduct.fulfilled.match(res)) {
        dispatch(
          showAlert({
            message: "Cập nhật sản phẩm thành công!",
            type: "green",
          })
        );
        handleCloseEditModal();
        loadData(page + 1);
      } else {
        alert(res.payload?.message || "Cập nhật thất bại. Vui lòng kiểm tra lại mã sản phẩm!");
      }
    } catch (err) {
      alert("Có lỗi xảy ra khi lưu sản phẩm");
    } finally {
      setSubmittingEdit(false);
    }
  };

  const handleDelete = async (id) => {
    if (
      window.confirm(
        "Bạn có chắc muốn xóa sản phẩm này?\n\n(Lưu ý: Nếu sản phẩm đã từng phát sinh đơn hàng hoặc phiếu nhập, hệ thống sẽ tự động chuyển sang trạng thái Ngừng kinh doanh để bảo toàn dữ liệu sổ sách)."
      )
    ) {
      await dispatch(deleteProduct(id));
      dispatch(
        showAlert({
          message: "Đã xử lý xóa / lưu trữ sản phẩm",
          type: "blue",
        })
      );
      loadData(page + 1);
    }
  };

  const handleToggleStatus = (product) => {
    let newStatus;
    if (product.status === "ACTIVE") {
      newStatus = "OUT_OF_STOCK";
    } else if (product.status === "OUT_OF_STOCK") {
      if (product.stock <= 0) {
        alert("Sản phẩm có tồn kho bằng 0, không thể chuyển sang Đang bán (ACTIVE). Vui lòng nhập hàng trước!");
        return;
      }
      newStatus = "ACTIVE";
    } else {
      alert("Sản phẩm đã ngừng kinh doanh (DISCONTINUED).");
      return;
    }

    dispatch(
      changeProductStatus({
        id: product.id,
        status: newStatus,
      })
    );
  };

  const handleDiscontinue = (id) => {
    if (window.confirm("Xác nhận ngừng kinh doanh sản phẩm này?")) {
      dispatch(
        changeProductStatus({
          id,
          status: "DISCONTINUED",
        })
      );
    }
  };

  return (
    <div className="mt-8 mb-8 flex flex-col gap-6">
      <Card className="border border-blue-gray-100 shadow-sm">
        {/* HEADER */}
        <CardHeader
          variant="gradient"
          color="gray"
          className="mb-4 p-6 flex flex-wrap items-center justify-between gap-4"
        >
          <div>
            <Typography variant="h5" color="white" className="font-bold">
              Quản Lý Hàng Hóa & Sản Phẩm (Products)
            </Typography>
            <Typography variant="small" color="white" className="opacity-80 mt-1">
              Theo dõi danh mục, giá bán, giá vốn bình quân gia quyền và tồn kho theo thời gian thực
            </Typography>
          </div>

          <Button
            size="sm"
            color="green"
            onClick={() => navigate("/dashboard/products/add")}
            className="flex items-center gap-2 shadow-sm font-semibold"
          >
            <PlusIcon className="h-4 w-4" />
            + Thêm Sản Phẩm
          </Button>
        </CardHeader>

        {/* BỘ LỌC TÌM KIẾM */}
        <div className="px-6 py-3 border-b border-gray-100 flex flex-wrap items-end gap-3 bg-gray-50/50">
          {/* Ô tìm kiếm đa năng */}
          <div className="flex flex-col flex-1 min-w-[240px]">
            <Typography variant="small" className="text-xs font-semibold text-gray-700 mb-1">
              Tìm kiếm (Tên hoặc Mã SP)
            </Typography>
            <div className="relative">
              <MagnifyingGlassIcon className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Nhập tên món hoặc mã sản phẩm..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearch();
                }}
                className="w-full h-9 pl-9 pr-8 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              />
              {keyword && (
                <XMarkIcon
                  onClick={() => {
                    setKeyword("");
                    loadData(1, "", selectedCategory, selectedStatus);
                  }}
                  className="h-4 w-4 absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-red-500"
                />
              )}
            </div>
          </div>

          {/* Lọc theo danh mục */}
          <div className="flex flex-col min-w-[170px]">
            <Typography variant="small" className="text-xs font-semibold text-gray-700 mb-1">
              Danh mục
            </Typography>
            <select
              value={selectedCategory}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedCategory(val);
                loadData(1, keyword, val, selectedStatus);
              }}
              className="h-9 px-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">Tất cả danh mục</option>
              {categories.map((c) => (
                <option key={c.id || c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Lọc theo trạng thái */}
          <div className="flex flex-col min-w-[160px]">
            <Typography variant="small" className="text-xs font-semibold text-gray-700 mb-1">
              Trạng thái
            </Typography>
            <select
              value={selectedStatus}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedStatus(val);
                loadData(1, keyword, selectedCategory, val);
              }}
              className="h-9 px-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="ACTIVE">Đang bán (ACTIVE)</option>
              <option value="OUT_OF_STOCK">Hết hàng (OUT_OF_STOCK)</option>
              <option value="DISCONTINUED">Ngừng bán (DISCONTINUED)</option>
            </select>
          </div>

          <Button
            size="sm"
            color="blue"
            className="h-9 px-4 flex items-center gap-1.5 font-semibold"
            onClick={handleSearch}
          >
            <MagnifyingGlassIcon className="h-4 w-4" />
            Tìm kiếm
          </Button>

          <Button
            size="sm"
            variant="outlined"
            className="h-9 px-4 flex items-center gap-1"
            onClick={handleResetFilters}
          >
            <ArrowPathIcon className="h-3.5 w-3.5" />
            Làm mới
          </Button>
        </div>

        {/* BẢNG DỮ LIỆU */}
        <CardBody className="overflow-x-auto px-0 pt-0 pb-2">
          {loading ? (
            <div className="p-12 text-center text-gray-500 flex flex-col items-center gap-2">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
              <Typography>Đang tải danh sách sản phẩm...</Typography>
            </div>
          ) : !list || list.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              <Typography>Không tìm thấy sản phẩm nào phù hợp với bộ lọc.</Typography>
            </div>
          ) : (
            <>
              <table className="w-full min-w-[900px] table-auto text-left">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-200">
                    {["Hình ảnh", "Mã SP", "Tên sản phẩm", "Danh mục", "Giá bán", "Giá vốn (BQ)", "Tồn kho", "ĐVT", "Trạng thái", "Thao tác"].map(
                      (el) => (
                        <th key={el} className="py-3 px-4 text-xs font-bold uppercase text-gray-600">
                          {el}
                        </th>
                      )
                    )}
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {list.map((product) => {
                    const isOutOfStock = product.stock <= 0 || product.status === "OUT_OF_STOCK";
                    const isLowStock = product.stock > 0 && product.stock <= 5;

                    return (
                      <tr key={product.id} className="hover:bg-blue-gray-50/50 transition">
                        {/* Hình ảnh */}
                        <td className="py-3 px-4">
                          <Avatar
                            src={product.imageUrl || "/img/default-product.svg"}
                            alt={product.name}
                            size="sm"
                            variant="rounded"
                            className="border border-gray-200"
                          />
                        </td>

                        {/* Mã SP */}
                        <td className="py-3 px-4">
                          <Typography className="text-xs font-bold text-blue-700">
                            {product.productCode}
                          </Typography>
                        </td>

                        {/* Tên sản phẩm */}
                        <td className="py-3 px-4">
                          <Typography className="text-xs font-semibold text-gray-900 max-w-[200px] truncate" title={product.name}>
                            {product.name}
                          </Typography>
                          <Typography className="text-[10px] text-gray-400">
                            NCC: {product.supplier?.name || "-"}
                          </Typography>
                        </td>

                        {/* Danh mục */}
                        <td className="py-3 px-4">
                          <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded font-medium">
                            {product.category?.name || "Chưa phân loại"}
                          </span>
                        </td>

                        {/* Giá bán */}
                        <td className="py-3 px-4">
                          <Typography className="text-xs font-bold text-emerald-600">
                            {product.price?.toLocaleString()} đ
                          </Typography>
                        </td>

                        {/* Giá vốn bình quân */}
                        <td className="py-3 px-4">
                          <Typography className="text-xs font-medium text-gray-600">
                            {product.cost ? `${product.cost.toLocaleString()} đ` : "-"}
                          </Typography>
                        </td>

                        {/* Tồn kho có cảnh báo */}
                        <td className="py-3 px-4">
                          {isOutOfStock ? (
                            <span className="inline-block text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                              0 (Hết hàng)
                            </span>
                          ) : isLowStock ? (
                            <span className="inline-block text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                              {product.stock} (Sắp hết)
                            </span>
                          ) : (
                            <Typography className="text-xs font-bold text-gray-800">
                              {product.stock}
                            </Typography>
                          )}
                        </td>

                        {/* Đơn vị tính */}
                        <td className="py-3 px-4">
                          <Typography className="text-xs text-gray-500">
                            {product.unit || "-"}
                          </Typography>
                        </td>

                        {/* Trạng thái */}
                        <td className="py-3 px-4">
                          <Chip
                            variant="gradient"
                            size="sm"
                            color={
                              product.status === "ACTIVE"
                                ? "green"
                                : product.status === "OUT_OF_STOCK"
                                ? "orange"
                                : "red"
                            }
                            value={
                              product.status === "ACTIVE"
                                ? "Đang bán"
                                : product.status === "OUT_OF_STOCK"
                                ? "Hết hàng"
                                : "Ngừng bán"
                            }
                            onClick={() => {
                              if (product.status !== "DISCONTINUED") {
                                handleToggleStatus(product);
                              }
                            }}
                            className={`py-0.5 px-2 text-[10px] font-medium w-fit ${
                              product.status !== "DISCONTINUED"
                                ? "cursor-pointer hover:opacity-80"
                                : "opacity-60 cursor-not-allowed"
                            }`}
                            title={product.status !== "DISCONTINUED" ? "Bấm để đổi nhanh trạng thái" : "Sản phẩm đã ngừng kinh doanh"}
                          />
                        </td>

                        {/* Thao tác */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            {/* Nút Sửa */}
                            <Button
                              size="sm"
                              color="blue"
                              variant="outlined"
                              onClick={() => handleOpenEditModal(product)}
                              className="px-2.5 py-1 text-xs flex items-center gap-1 font-semibold"
                              title="Chỉnh sửa thông tin sản phẩm"
                            >
                              <PencilSquareIcon className="h-3.5 w-3.5" />
                              Sửa
                            </Button>

                            {/* Nút Ngừng kinh doanh */}
                            {product.status !== "DISCONTINUED" && (
                              <Button
                                size="sm"
                                variant="text"
                                color="blue-gray"
                                onClick={() => handleDiscontinue(product.id)}
                                className="px-2 py-1 text-xs"
                                title="Ngừng bán món này"
                              >
                                Ngừng KD
                              </Button>
                            )}

                            {/* Nút Xóa */}
                            <Button
                              size="sm"
                              variant="text"
                              color="red"
                              onClick={() => handleDelete(product.id)}
                              className="px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                              title="Xóa hẳn (nếu chưa có đơn) hoặc lưu trữ"
                            >
                              <TrashIcon className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              <div className="mt-4 px-4">
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

      {/* ================= MODAL CHỈNH SỬA SẢN PHẨM ================= */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 animate-fade-in my-8 border border-gray-100">
            {/* Header Modal */}
            <div className="flex justify-between items-center pb-4 border-b border-gray-100">
              <div>
                <Typography variant="h6" className="font-bold text-gray-900">
                  Chỉnh Sửa Thông Tin Sản Phẩm
                </Typography>
                <Typography variant="small" className="text-gray-500 text-xs">
                  Cập nhật giá bán, giá vốn, danh mục, nhà cung cấp và ảnh đại diện
                </Typography>
              </div>
              <button
                onClick={handleCloseEditModal}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Mã sản phẩm *
                </label>
                <input
                  type="text"
                  name="productCode"
                  value={editForm.productCode}
                  onChange={handleEditChange}
                  className="w-full h-9 px-3 border rounded-lg focus:outline-blue-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Tên sản phẩm *
                </label>
                <input
                  type="text"
                  name="name"
                  value={editForm.name}
                  onChange={handleEditChange}
                  className="w-full h-9 px-3 border rounded-lg focus:outline-blue-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Giá bán (VND) *
                </label>
                <input
                  type="number"
                  min="0"
                  name="price"
                  value={editForm.price}
                  onChange={handleEditChange}
                  className="w-full h-9 px-3 border rounded-lg focus:outline-blue-500 text-sm font-semibold text-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Giá vốn (VND)
                </label>
                <input
                  type="number"
                  min="0"
                  name="cost"
                  value={editForm.cost}
                  onChange={handleEditChange}
                  className="w-full h-9 px-3 border rounded-lg focus:outline-blue-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Số lượng tồn kho
                </label>
                <input
                  type="number"
                  min="0"
                  name="stock"
                  value={editForm.stock}
                  onChange={handleEditChange}
                  className="w-full h-9 px-3 border rounded-lg focus:outline-blue-500 text-sm font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Đơn vị tính (ly, cái, kg...)
                </label>
                <input
                  type="text"
                  name="unit"
                  value={editForm.unit}
                  onChange={handleEditChange}
                  className="w-full h-9 px-3 border rounded-lg focus:outline-blue-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Danh mục
                </label>
                <select
                  name="categoryName"
                  value={editForm.categoryName}
                  onChange={handleEditChange}
                  className="w-full h-9 px-3 border rounded-lg focus:outline-blue-500 text-sm bg-white"
                >
                  <option value="">-- Chọn danh mục --</option>
                  {categories.map((c) => (
                    <option key={c.id || c.name} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Nhà cung cấp
                </label>
                <select
                  name="supplierName"
                  value={editForm.supplierName}
                  onChange={handleEditChange}
                  className="w-full h-9 px-3 border rounded-lg focus:outline-blue-500 text-sm bg-white"
                >
                  <option value="">-- Chọn nhà cung cấp --</option>
                  {suppliers.map((s) => (
                    <option key={s.id || s.name} value={s.name}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Trạng thái
                </label>
                <select
                  name="status"
                  value={editForm.status}
                  onChange={handleEditChange}
                  className="w-full h-9 px-3 border rounded-lg focus:outline-blue-500 text-sm bg-white"
                >
                  <option value="ACTIVE">Đang bán (ACTIVE)</option>
                  <option value="OUT_OF_STOCK">Hết hàng (OUT_OF_STOCK)</option>
                  <option value="DISCONTINUED">Ngừng bán (DISCONTINUED)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Ảnh sản phẩm mới (tùy chọn)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full text-xs text-gray-500 file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>

              {editImagePreview && (
                <div className="col-span-1 md:col-span-2 flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                  <img
                    src={editImagePreview}
                    alt="Preview"
                    className="h-16 w-16 object-cover rounded-lg border"
                  />
                  <Typography variant="small" className="text-xs text-gray-500">
                    Ảnh đang sử dụng cho sản phẩm này
                  </Typography>
                </div>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <Button
                variant="outlined"
                color="gray"
                size="sm"
                onClick={handleCloseEditModal}
                disabled={submittingEdit}
              >
                Hủy bỏ
              </Button>
              <Button
                color="blue"
                size="sm"
                onClick={handleSaveEdit}
                disabled={submittingEdit}
                className="font-semibold"
              >
                {submittingEdit ? "Đang lưu..." : "Lưu thay đổi"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Products;
