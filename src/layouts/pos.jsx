import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import { fetchProducts } from "@/features/product/productThunks";
import { fetchCategories } from "@/features/category/categoryThunks";
import { createOrder } from "@/features/order/orderThunks";
import { fetchMyInfo } from "@/features/user/userThunks";
import { showAlert } from "@/features/alert/alertSlice";
import { useNavigate } from "react-router-dom";
import {
  addItem,
  changeQuantity,
  removeItem,
  clearCart
} from "@/features/posCart/posCartSlice";
export default function POS() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentShift } = useSelector((state) => state.shift);

  const shiftCode = currentShift?.shiftCode;
  console.log(shiftCode);
  
  const { currentUser } = useSelector((state) => state.user);
  const { list: products = [] } = useSelector((state) => state.product);
  const { list: categories = [], loading } = useSelector(
    (state) => state.category
  );

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const { items: order } = useSelector((state) => state.posCart);  const [currentTime, setCurrentTime] = useState(new Date());
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [orderId, setOrderId] = useState(null);
  // FULLSCREEN
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // LOAD DATA
  useEffect(() => {
    dispatch(fetchProducts({ page: 1, size: 50 }));
    dispatch(fetchCategories({ page: 1, size: 50 }));
    dispatch(fetchMyInfo());

    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, [dispatch]);

  // FILTER PRODUCTS
 const filteredProducts = products
  ?.filter((p) => p.category?.name !== "INGREDIENT") 
  ?.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )
  ?.filter((p) =>
    selectedCategory ? p.category?.name === selectedCategory : true
  );

  // ADD ITEM
const addItemToOrder = (product) => {
  dispatch(addItem(product));
};

  // CHANGE QUANTITY
 const changeQty = (id, delta) => {
  dispatch(changeQuantity({ id, delta }));
};

  // REMOVE
const removeItemFromCart = (id) => {
  dispatch(removeItem(id));
};

  // TOTAL
  const subtotal = order.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // CLEAR
  const handleClearCart = () => {
  dispatch(clearCart());
};

  // CHECKOUT
const handleCheckout = () => {

  if (order.length === 0) {
    dispatch(
      showAlert({
        message: "Chưa có sản phẩm",
        type: "red",
      })
    );
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
    <div className="flex flex-col h-screen bg-gray-100 pb-10">

      {/* TOP BAR */}
      <div className="h-12 bg-blue-600 text-white flex items-center px-6 gap-6 font-medium shadow">

        <button onClick={() => navigate("/pos/manage")} className="hover:bg-blue-700 px-3 py-1 rounded">
          Quản lý
        </button>
        <button onClick={() => navigate("/pos/add/customer")} className="hover:bg-blue-700 px-3 py-1 rounded">
          Thêm khách hàng
        </button>
        <button className="hover:bg-blue-700 px-3 py-1 rounded">
          Tra cứu
        </button>

        <button
          onClick={toggleFullscreen}
          className="ml-auto bg-blue-700 px-3 py-1 rounded"
        >
          {isFullscreen ? "Exit Full" : "Full Screen"}
        </button>

      </div>

      {/* MAIN */}
      <div className="flex flex-1 overflow-hidden">

        {/* PRODUCT AREA */}
        <div className="flex-1 p-6 flex flex-col">

          {/* SEARCH */}
          <input
            placeholder="Tìm sản phẩm..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="p-2 border rounded mb-4"
          />

          {/* CATEGORY */}
          <div className="flex gap-2 mb-4 flex-wrap">

            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-1 rounded-full ${
                selectedCategory === null
                  ? "bg-blue-500 text-white"
                  : "bg-white shadow"
              }`}
            >
              All
            </button>

            {loading && <p>Loading...</p>}

            {categories
                ?.filter((cat) => cat.name !== "INGREDIENT")
                ?.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.name)}
                    className={`px-4 py-1 rounded-full ${
                      selectedCategory === cat.name
                        ? "bg-blue-500 text-white"
                        : "bg-white shadow"
                    }`}
                  >
                    {cat.name}
                  </button>
              ))}

          </div>

          {/* PRODUCT GRID */}
          <div className="grid grid-cols-4 gap-4 overflow-y-auto">

            {filteredProducts?.map((product) => (
              <div
                key={product.id}
                onClick={() => addItemToOrder(product)}
                className="bg-white rounded-xl shadow hover:shadow-lg cursor-pointer p-4 flex flex-col items-center"
              >

                <div className="h-24 flex items-center justify-center">
                  <img
                    src={product.imageUrl || "https://via.placeholder.com/80"}
                    alt={product.name}
                    className="h-20 object-contain"
                  />
                </div>

                <div className="mt-3 text-center font-medium">
                  {product.name}
                </div>

                <div className="text-blue-500 font-semibold">
                  {product.price.toLocaleString()} đ
                </div>

              </div>
            ))}

          </div>

        </div>

        {/* ORDER PANEL */}
        <div className="w-[380px] bg-white shadow-lg flex flex-col">

          <div className="p-4 border-b font-bold text-lg">
            Order Details
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">

            {order.length === 0 && (
              <p className="text-gray-400 text-center">
                Chưa có sản phẩm
              </p>
            )}

            {order.map((item) => (
              <div key={item.id} className="flex items-center gap-3">

                <div className="flex-1">
                  <div className="font-medium text-sm">
                    {item.name}
                  </div>

                  <div className="text-gray-500 text-xs">
                    {item.quantity} x {item.price.toLocaleString()} đ
                  </div>
                </div>

                <div className="font-semibold text-blue-500">
                  {(item.price * item.quantity).toLocaleString()} đ
                </div>

                <div className="flex flex-col">
                  <button onClick={() => changeQty(item.id, 1)}>+</button>
                  <button onClick={() => changeQty(item.id, -1)}>-</button>
                  <button onClick={() => removeItemFromCart(item.id)}>x</button>
                </div>

              </div>
            ))}

          </div>

          {/* TOTAL */}
          <div className="p-4 border-t">

            <div className="flex justify-between text-gray-600 mb-2">
              <span>Subtotal</span>
              <span>{subtotal.toLocaleString()} đ</span>
            </div>

            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span className="text-blue-600">
                {subtotal.toLocaleString()} đ
              </span>
            </div>

                <button
  onClick={handleCheckout}
  className="mt-4 w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700"
> 
  Pay Now
</button>

            <button
              onClick={handleClearCart}
              className="mt-2 w-full bg-red-500 text-white py-2 rounded-lg"
            >
              Clear Cart
            </button>

          </div>

        </div>

      </div>

      {/* BOTTOM BAR */}
      <div className="fixed bottom-0 left-0 w-full h-10 bg-gray-800 text-white flex items-center justify-between px-6 text-sm">

        <div>
          {currentTime.toLocaleString()}
        </div>

        <div>
          User: {currentUser?.username || "Loading..."} |{" "}
          {currentUser?.fullName || "Loading..."} | {shiftCode|| "Loading..."}
        </div>

      </div>

    </div>
  );
}