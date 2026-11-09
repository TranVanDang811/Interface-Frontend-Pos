import React, { useState, useEffect, useRef, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import { fetchProducts } from "@/features/product/productThunks";
import { fetchCategories } from "@/features/category/categoryThunks";
import { fetchMyInfo } from "@/features/user/userThunks";
import { showAlert } from "@/features/alert/alertSlice";
import { fetchCurrentShift } from "@/features/shift/shiftThunks";
import AddCustomerPos from "@/pages/pos/AddCustomerPos";
import {
  addItem,
  changeQuantity,
  setQuantity,
  removeItem,
  clearCart,
  setCart,
} from "@/features/posCart/posCartSlice";

import {
  MagnifyingGlassIcon,
  XMarkIcon,
  TrashIcon,
  PlusIcon,
  MinusIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
  ShoppingBagIcon,
  DocumentMagnifyingGlassIcon,
  UserPlusIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  BookmarkIcon,
} from "@heroicons/react/24/solid";

export default function POS() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const searchInputRef = useRef(null);

  const { currentShift } = useSelector((state) => state.shift);
  const shiftCode =
    currentShift?.shiftCode ||
    sessionStorage.getItem("shiftCode") ||
    localStorage.getItem("shiftCode");

  const { currentUser } = useSelector((state) => state.user);
  const { list: products = [] } = useSelector((state) => state.product);
  const { list: categories = [], loading } = useSelector(
    (state) => state.category
  );
  const { items: order } = useSelector((state) => state.posCart);

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Modal xác nhận xóa giỏ hàng
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Modal quản lý đơn tạm (Park / Hold orders)
  const [heldOrders, setHeldOrders] = useState(() => {
    try {
      const saved = localStorage.getItem("pos_held_orders");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [showHeldModal, setShowHeldModal] = useState(false);

  // Modal thêm khách hàng mới trực tiếp tại quầy
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);

  // FULLSCREEN
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  // LOAD DATA & CLOCK
  useEffect(() => {
    dispatch(fetchProducts({ page: 1, size: 200 }));
    dispatch(fetchCategories({ page: 1, size: 50 }));
    dispatch(fetchMyInfo());
    dispatch(fetchCurrentShift());

    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, [dispatch]);

  // HOTKEYS (F2: Search, F4: Checkout, F8: Clear, F9: Held orders)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "F2") {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === "F4") {
        e.preventDefault();
        handleCheckout();
      } else if (e.key === "F8" && order.length > 0) {
        e.preventDefault();
        setShowClearConfirm(true);
      } else if (e.key === "F9") {
        e.preventDefault();
        setShowHeldModal((prev) => !prev);
      } else if (e.key === "Escape") {
        setShowClearConfirm(false);
        setShowHeldModal(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [order, shiftCode]);

  // Lưu danh sách đơn tạm vào localStorage
  const saveHeldOrders = (newList) => {
    setHeldOrders(newList);
    localStorage.setItem("pos_held_orders", JSON.stringify(newList));
  };

  // Lọc sản phẩm: loại bỏ nguyên liệu & các món ngừng kinh doanh (memoized để không re-calculate mỗi giây khi đồng hồ nhảy)
  const filteredProducts = useMemo(() => {
    return products
      ?.filter((p) => p.category?.name !== "INGREDIENT")
      ?.filter((p) => p.status !== "DISCONTINUED")
      ?.filter((p) => {
        const term = (search || "").trim().toLowerCase();
        if (!term) return true;
        const matchName = p.name && p.name.toLowerCase().includes(term);
        const matchCode =
          p.productCode && p.productCode.toLowerCase().includes(term);
        return matchName || matchCode;
      })
      ?.filter((p) =>
        selectedCategory ? p.category?.name === selectedCategory : true
      );
  }, [products, search, selectedCategory]);

  // Thêm món vào giỏ
  const handleAddItem = (product) => {
    if (product.stock <= 0 || product.status === "OUT_OF_STOCK") {
      dispatch(
        showAlert({
          message: `Sản phẩm "${product.name}" đã hết hàng!`,
          type: "orange",
        })
      );
      return;
    }
    dispatch(addItem(product));
  };

  // Đổi số lượng
  const handleQtyChange = (id, delta) => {
    dispatch(changeQuantity({ id, delta }));
  };

  // Nhập trực tiếp số lượng
  const handleDirectQty = (id, val) => {
    dispatch(setQuantity({ id, quantity: val }));
  };

  // Xóa món khỏi giỏ
  const handleRemoveItem = (id) => {
    dispatch(removeItem(id));
  };

  // Tổng tiền
  const totalItemsCount = order.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = order.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // Xóa sạch giỏ hàng
  const handleConfirmClear = () => {
    dispatch(clearCart());
    setShowClearConfirm(false);
  };

  // Lưu đơn tạm (Hold bill)
  const handleHoldOrder = () => {
    if (order.length === 0) {
      dispatch(
        showAlert({
          message: "Giỏ hàng đang trống, không thể lưu đơn tạm!",
          type: "orange",
        })
      );
      return;
    }

    const newHold = {
      id: Date.now(),
      createdAt: new Date().toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      items: order,
      subtotal,
    };

    saveHeldOrders([newHold, ...heldOrders]);
    dispatch(clearCart());
    dispatch(
      showAlert({
        message: `Đã lưu đơn tạm (${newHold.items.length} món)`,
        type: "green",
      })
    );
  };

  // Khôi phục đơn tạm
  const handleRestoreHeld = (held) => {
    if (order.length > 0) {
      // Lưu lại giỏ hiện tại trước khi khôi phục
      const currentAsHold = {
        id: Date.now(),
        createdAt: new Date().toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        items: order,
        subtotal,
      };
      saveHeldOrders([
        currentAsHold,
        ...heldOrders.filter((h) => h.id !== held.id),
      ]);
    } else {
      saveHeldOrders(heldOrders.filter((h) => h.id !== held.id));
    }

    dispatch(setCart(held.items));
    setShowHeldModal(false);
    dispatch(
      showAlert({
        message: "Đã mở lại đơn tạm thành công!",
        type: "green",
      })
    );
  };

  // Xóa một đơn tạm
  const handleDeleteHeld = (heldId) => {
    saveHeldOrders(heldOrders.filter((h) => h.id !== heldId));
  };

  // Thanh toán
  const handleCheckout = () => {
    if (order.length === 0) {
      dispatch(
        showAlert({
          message: "Giỏ hàng đang trống. Vui lòng chọn món trước khi thanh toán!",
          type: "red",
        })
      );
      return;
    }

    if (!shiftCode) {
      dispatch(
        showAlert({
          message:
            "Chưa có ca làm việc đang mở. Vui lòng mở ca trước khi thanh toán!",
          type: "orange",
        })
      );
      navigate("/pos/open-shift");
      return;
    }

    navigate("/pos/payment", {
      state: {
        order,
        subtotal,
      },
    });
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100 pb-11 select-none text-gray-800">
      {/* TOP BAR */}
      <div className="h-14 bg-blue-600 text-white flex items-center px-5 gap-3.5 font-medium shadow-md flex-shrink-0">
        {/* Logo & Brand */}
        <div className="flex items-center gap-2.5 font-bold text-xl tracking-wide mr-2">
          <ShoppingBagIcon className="h-7 w-7 text-yellow-300" />
          <span>POS Quầy Bán Hàng</span>
        </div>

        {/* Trạng thái ca làm việc */}
        {shiftCode ? (
          <div
            onClick={() => navigate("/pos/settlement")}
            className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 px-3.5 py-1.5 rounded-lg text-sm font-bold cursor-pointer transition border border-blue-400/40 shadow-sm"
            title="Nhấn để xem kết toán hoặc đóng ca"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse"></span>
            <span>Ca: {shiftCode}</span>
          </div>
        ) : (
          <div
            onClick={() => navigate("/pos/open-shift")}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-3.5 py-1.5 rounded-lg text-sm font-bold cursor-pointer transition shadow-sm"
            title="Chưa mở ca - Nhấn để mở ca ngay"
          >
            <ExclamationTriangleIcon className="h-4 w-4" />
            <span>Chưa mở ca (Mở ngay)</span>
          </div>
        )}

        <div className="h-6 w-[1px] bg-blue-400/50 mx-1"></div>

        {/* Menu phím tắt nhanh */}
        <button
          onClick={() => navigate("/pos/manage")}
          className="hover:bg-blue-700/80 px-3.5 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-1.5"
        >
          Quản lý ca / Hệ thống
        </button>

        <button
          onClick={() => setShowAddCustomerModal(true)}
          className="hover:bg-blue-700/80 px-3.5 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-1.5 cursor-pointer"
          title="Đăng ký nhanh khách hàng mới ngay tại quầy"
        >
          <UserPlusIcon className="h-5 w-5" />
          <span>Thêm khách hàng</span>
        </button>

        <button
          onClick={() => navigate("/pos/reprint")}
          className="hover:bg-blue-700/80 px-3.5 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-1.5"
          title="Tra cứu danh sách đơn hàng đã bán & in lại hóa đơn"
        >
          <DocumentMagnifyingGlassIcon className="h-5 w-5" />
          Tra cứu & In lại hóa đơn
        </button>

        {/* Nút đơn tạm */}
        <button
          onClick={() => setShowHeldModal(true)}
          className="relative hover:bg-blue-700/80 px-3.5 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-1.5"
          title="Xem danh sách các đơn đang treo (F9)"
        >
          <BookmarkIcon className="h-5 w-5 text-yellow-300" />
          <span>Đơn tạm</span>
          {heldOrders.length > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full ml-1">
              {heldOrders.length}
            </span>
          )}
        </button>

        {/* Fullscreen Button */}
        <button
          onClick={toggleFullscreen}
          className="ml-auto bg-blue-700 hover:bg-blue-800 px-3.5 py-2 rounded-lg text-sm font-semibold flex items-center gap-1.5 transition"
          title="Bật/Tắt toàn màn hình"
        >
          {isFullscreen ? (
            <>
              <ArrowsPointingInIcon className="h-5 w-5" />
              <span>Thu nhỏ</span>
            </>
          ) : (
            <>
              <ArrowsPointingOutIcon className="h-5 w-5" />
              <span>Toàn màn hình</span>
            </>
          )}
        </button>
      </div>

      {/* CẢNH BÁO CHƯA MỞ CA */}
      {!shiftCode && (
        <div className="bg-amber-100 border-b border-amber-300 text-amber-900 px-6 py-2.5 text-sm font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ExclamationTriangleIcon className="h-5 w-5 text-amber-600" />
            <span>
              <strong>Cảnh báo:</strong> Bạn chưa mở ca làm việc. Doanh thu của
              các đơn hàng này chưa được tính vào ca của bạn!
            </span>
          </div>
          <button
            onClick={() => navigate("/pos/open-shift")}
            className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-1.5 rounded-lg text-sm font-bold transition shadow-sm"
          >
            Mở ca ngay
          </button>
        </div>
      )}

      {/* MAIN LAYOUT */}
      <div className="flex flex-1 overflow-hidden">
        {/* PRODUCT AREA */}
        <div className="flex-1 p-5 flex flex-col overflow-hidden">
          {/* SEARCH BAR & CATEGORY BAR */}
          <div className="flex items-center gap-3 mb-3.5">
            {/* Search Input */}
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                ref={searchInputRef}
                placeholder="Tìm món theo tên hoặc mã SP... (Phím tắt F2)"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-12 pl-11 pr-10 bg-white border border-gray-300 rounded-xl text-base font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
              />
              {search && (
                <XMarkIcon
                  onClick={() => setSearch("")}
                  className="h-5 w-5 absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 cursor-pointer"
                />
              )}
            </div>
          </div>

          {/* CATEGORIES PILLS */}
          <div className="flex gap-2 mb-3.5 flex-wrap items-center">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-full text-sm font-bold transition ${
                selectedCategory === null
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              Tất cả món ({products.filter((p) => p.category?.name !== "INGREDIENT").length})
            </button>

            {loading && (
              <span className="text-sm text-gray-400 italic">Đang tải danh mục...</span>
            )}

            {categories
              ?.filter((cat) => cat.name !== "INGREDIENT")
              ?.map((cat) => (
                <button
                  key={cat.id || cat.name}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`px-4 py-2 rounded-full text-sm font-bold transition ${
                    selectedCategory === cat.name
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
          </div>

          {/* PRODUCT GRID */}
          <div className="flex-1 overflow-y-auto pr-1">
            {filteredProducts.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-gray-400">
                <ShoppingBagIcon className="h-14 w-14 mb-2 text-gray-300" />
                <p className="text-base font-semibold">Không tìm thấy sản phẩm phù hợp</p>
                <p className="text-sm mt-1 text-gray-400">
                  Thử tìm với từ khóa hoặc danh mục khác
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {filteredProducts.map((product) => {
                  const isOutOfStock =
                    product.stock <= 0 || product.status === "OUT_OF_STOCK";

                  return (
                    <div
                      key={product.id}
                      onClick={() => handleAddItem(product)}
                      className={`relative bg-white rounded-xl shadow-sm hover:shadow-md transition p-3.5 flex flex-col justify-between border border-gray-200/90 cursor-pointer group ${
                        isOutOfStock
                          ? "opacity-60 bg-gray-50 border-dashed cursor-not-allowed"
                          : "hover:border-blue-400"
                      }`}
                    >
                      {/* Product Code Badge */}
                      {product.productCode && (
                        <span className="absolute top-2 left-2 bg-gray-100 text-gray-700 text-xs font-mono font-bold px-2 py-0.5 rounded border border-gray-200">
                          {product.productCode}
                        </span>
                      )}

                      {/* Stock badge */}
                      {isOutOfStock ? (
                        <span className="absolute top-2 right-2 bg-red-100 text-red-700 text-xs font-bold px-2.5 py-0.5 rounded-full">
                          Hết hàng
                        </span>
                      ) : product.stock <= 5 ? (
                        <span className="absolute top-2 right-2 bg-amber-100 text-amber-800 text-xs font-bold px-2 py-0.5 rounded">
                          Còn {product.stock}
                        </span>
                      ) : null}

                      {/* Product Image */}
                      <div className="h-28 w-full flex items-center justify-center my-2">
                        <img
                          src={
                            product.imageUrl ||
                            "https://images.unsplash.com/photo-1544816155-12df9643f363?w=140"
                          }
                          alt={product.name}
                          className="h-24 max-w-full object-contain transition-transform group-hover:scale-105"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src =
                              "https://images.unsplash.com/photo-1544816155-12df9643f363?w=140";
                          }}
                        />
                      </div>

                      {/* Product Details */}
                      <div className="mt-1.5">
                        <div
                          className="font-bold text-sm text-gray-900 line-clamp-2 min-h-[40px] leading-snug"
                          title={product.name}
                        >
                          {product.name}
                        </div>

                        <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-gray-100">
                          <span className="text-blue-600 font-extrabold text-base">
                            {(product.price || 0).toLocaleString()} đ
                          </span>
                          <span className="text-xs font-medium text-gray-500">
                            {product.unit || "phần"}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ORDER CART PANEL */}
        <div className="w-[430px] bg-white shadow-xl flex flex-col border-l border-gray-200 flex-shrink-0">
          {/* CART HEADER */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
            <div>
              <div className="font-bold text-lg text-gray-900 flex items-center gap-2">
                <ShoppingBagIcon className="h-6 w-6 text-blue-600" />
                <span>Chi tiết đơn hàng</span>
              </div>
              <div className="text-sm text-gray-500 mt-0.5">
                Tổng cộng: <strong className="text-gray-800">{totalItemsCount}</strong> món
              </div>
            </div>

            {/* Nút lưu đơn tạm */}
            <button
              onClick={handleHoldOrder}
              disabled={order.length === 0}
              className="px-3 py-1.5 text-sm font-bold text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 disabled:opacity-40 disabled:pointer-events-none transition flex items-center gap-1.5"
              title="Lưu đơn này để phục vụ khách khác trước"
            >
              <BookmarkIcon className="h-4 w-4" />
              <span>Treo đơn</span>
            </button>
          </div>

          {/* CART ITEMS LIST */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {order.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 text-center py-10">
                <ShoppingBagIcon className="h-16 w-16 mb-2.5 text-gray-300" />
                <p className="text-base font-bold text-gray-600">
                  Giỏ hàng đang trống
                </p>
                <p className="text-sm text-gray-400 mt-1 max-w-[240px]">
                  Bấm vào món bên trái hoặc gõ tìm kiếm để thêm vào đơn
                </p>
              </div>
            ) : (
              order.map((item) => (
                <div
                  key={item.id}
                  className="bg-gray-50 rounded-xl p-3 border border-gray-200 flex items-center gap-3 transition hover:border-blue-300"
                >
                  {/* Thumbnail */}
                  <img
                    src={
                      item.image ||
                      "https://images.unsplash.com/photo-1544816155-12df9643f363?w=80"
                    }
                    alt={item.name}
                    className="w-12 h-12 rounded-lg object-contain bg-white border border-gray-100 flex-shrink-0"
                  />

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div
                      className="font-bold text-sm text-gray-900 truncate"
                      title={item.name}
                    >
                      {item.name}
                    </div>
                    {item.productCode && (
                      <div className="text-xs text-gray-500 font-mono">
                        {item.productCode}
                      </div>
                    )}
                    <div className="text-blue-600 font-black text-sm mt-0.5">
                      {(item.price * item.quantity).toLocaleString()} đ
                    </div>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-1 bg-white border border-gray-300 rounded-lg p-0.5">
                    <button
                      onClick={() => handleQtyChange(item.id, -1)}
                      className="w-7 h-7 flex items-center justify-center text-gray-700 hover:bg-gray-100 rounded text-sm font-bold transition"
                      title="Giảm số lượng"
                    >
                      <MinusIcon className="h-3.5 w-3.5" />
                    </button>

                    <input
                      type="number"
                      min="1"
                      max={item.stock || 999}
                      value={item.quantity}
                      onChange={(e) => handleDirectQty(item.id, e.target.value)}
                      className="w-10 text-center text-sm font-bold text-gray-900 focus:outline-none"
                    />

                    <button
                      onClick={() => handleQtyChange(item.id, 1)}
                      disabled={
                        item.stock != null && item.quantity >= item.stock
                      }
                      className="w-7 h-7 flex items-center justify-center text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:pointer-events-none rounded text-sm font-bold transition"
                      title="Tăng số lượng"
                    >
                      <PlusIcon className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg transition"
                    title="Xóa món này"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* CART FOOTER */}
          <div className="p-4 border-t border-gray-200 bg-white">
            <div className="space-y-2 mb-3.5 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Số lượng món:</span>
                <span className="font-bold text-gray-800">
                  {totalItemsCount}
                </span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tạm tính (Subtotal):</span>
                <span className="font-bold text-gray-800">
                  {subtotal.toLocaleString()} đ
                </span>
              </div>
              <div className="flex justify-between items-center pt-2.5 border-t border-dashed border-gray-300">
                <span className="font-bold text-base text-gray-900">
                  Tổng thanh toán:
                </span>
                <span className="text-2xl font-black text-blue-600">
                  {subtotal.toLocaleString()} đ
                </span>
              </div>
            </div>

            {/* Nút hành động */}
            <div className="space-y-2.5">
              <button
                onClick={handleCheckout}
                disabled={order.length === 0}
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl font-bold text-base shadow-md transition flex items-center justify-center gap-2.5"
              >
                <span>Thanh toán ngay (F4)</span>
                <span className="text-sm bg-blue-700 px-2.5 py-1 rounded font-mono font-bold">
                  {subtotal.toLocaleString()} đ
                </span>
              </button>

              <button
                onClick={() => setShowClearConfirm(true)}
                disabled={order.length === 0}
                className="w-full py-2.5 text-sm font-bold text-red-500 hover:bg-red-50 disabled:opacity-30 rounded-lg transition"
              >
                Xóa sạch giỏ hàng (F8)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM STATUS BAR */}
      <div className="fixed bottom-0 left-0 w-full h-11 bg-gray-900 text-gray-300 flex items-center justify-between px-6 text-sm z-20 border-t border-gray-800">
        <div className="flex items-center gap-2.5 font-mono">
          <ClockIcon className="h-4 w-4 text-blue-400" />
          <span className="font-medium">{currentTime.toLocaleString("vi-VN")}</span>
        </div>

        <div className="flex items-center gap-5">
          <div className="text-gray-400 text-sm">
            Phím tắt: <kbd className="bg-gray-800 px-1.5 py-0.5 rounded border border-gray-700 font-mono text-xs font-bold text-gray-300">F2</kbd> Tìm món |{" "}
            <kbd className="bg-gray-800 px-1.5 py-0.5 rounded border border-gray-700 font-mono text-xs font-bold text-gray-300">F4</kbd> Thanh toán |{" "}
            <kbd className="bg-gray-800 px-1.5 py-0.5 rounded border border-gray-700 font-mono text-xs font-bold text-gray-300">F9</kbd> Đơn tạm
          </div>

          <div className="h-4 w-[1px] bg-gray-700"></div>

          <div className="text-sm">
            Thu ngân:{" "}
            <strong className="text-white font-semibold">
              {currentUser?.fullName || currentUser?.username || "Đang tải..."}
            </strong>{" "}
            | Ca:{" "}
            <strong className={shiftCode ? "text-green-400 font-bold" : "text-amber-400 font-bold"}>
              {shiftCode || "Chưa mở ca"}
            </strong>
          </div>
        </div>
      </div>

      {/* MODAL XÁC NHẬN CLEAR GIỎ HÀNG */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-fade-in">
            <div className="flex items-center gap-3 text-red-600 mb-3">
              <TrashIcon className="h-7 w-7" />
              <h3 className="font-bold text-lg text-gray-800">
                Xác nhận xóa giỏ hàng
              </h3>
            </div>
            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
              Bạn có chắc chắn muốn xóa tất cả <strong>{totalItemsCount}</strong> món
              trong giỏ hàng hiện tại? Thao tác này không thể hoàn tác.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 py-2.5 text-sm font-semibold text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-100"
              >
                Hủy bỏ (Esc)
              </button>
              <button
                onClick={handleConfirmClear}
                className="flex-1 py-2.5 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow"
              >
                Đồng ý xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL QUẢN LÝ ĐƠN TẠM (HOLD BILLS) */}
      {showHeldModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-blue-600 text-white">
              <div className="flex items-center gap-2 font-bold text-base">
                <BookmarkIcon className="h-5 w-5 text-yellow-300" />
                <span>Danh sách đơn hàng tạm ({heldOrders.length})</span>
              </div>
              <button
                onClick={() => setShowHeldModal(false)}
                className="hover:bg-blue-700 p-1 rounded-lg"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 flex-1 overflow-y-auto space-y-3">
              {heldOrders.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <BookmarkIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm font-medium">Hiện không có đơn hàng tạm nào.</p>
                </div>
              ) : (
                heldOrders.map((held, idx) => (
                  <div
                    key={held.id}
                    className="bg-gray-50 rounded-xl p-3.5 border border-gray-200 flex items-center justify-between hover:border-blue-400 transition"
                  >
                    <div>
                      <div className="font-bold text-sm text-gray-800">
                        Đơn tạm #{idx + 1} • {held.createdAt}
                      </div>
                      <div className="text-sm text-gray-500 mt-0.5">
                        {held.items.length} món •{" "}
                        <strong className="text-blue-600 text-base font-extrabold">
                          {held.subtotal.toLocaleString()} đ
                        </strong>
                      </div>
                      <div className="text-xs text-gray-500 truncate max-w-[280px] mt-1">
                        {held.items.map((i) => `${i.name} (x${i.quantity})`).join(", ")}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleRestoreHeld(held)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 rounded-lg text-sm font-bold shadow transition"
                      >
                        Mở đơn
                      </button>
                      <button
                        onClick={() => handleDeleteHeld(held.id)}
                        className="p-2 text-gray-400 hover:text-red-500 rounded-lg transition"
                        title="Xóa đơn tạm này"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-3.5 border-t border-gray-100 bg-gray-50 flex justify-end">
              <button
                onClick={() => setShowHeldModal(false)}
                className="px-5 py-2 text-sm font-semibold text-gray-600 border border-gray-300 rounded-lg hover:bg-white"
              >
                Đóng (Esc)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL THÊM KHÁCH HÀNG NHANH TẠI QUẦY */}
      {showAddCustomerModal && (
        <AddCustomerPos
          isModal={true}
          onClose={() => setShowAddCustomerModal(false)}
          onSuccess={(newCustomer) => {
            setShowAddCustomerModal(false);
          }}
        />
      )}
    </div>
  );
}
