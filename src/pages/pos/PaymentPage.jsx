import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { createOrder } from "@/features/order/orderThunks";
import { clearCart } from "@/features/posCart/posCartSlice";
import { createPayment } from "@/features/payment/paymentThunks";
import { findUserByPhone } from "@/features/user/userThunks";
import { showAlert } from "@/features/alert/alertSlice";

export default function PaymentPage() {

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { items: order } = useSelector((state) => state.posCart);
  const { currentUser } = useSelector((state) => state.user);
const [usedPoints, setUsedPoints] = useState(0);
  const subtotal = order.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
const pointDiscount = usedPoints;
  // CUSTOMER
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerName, setCustomerName] = useState("");
const { customer } = useSelector((state) => state.user);
  // PAYMENT
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [voucher, setVoucher] = useState(0);
  const [customerMoney, setCustomerMoney] = useState(0);

const totalAfterDiscount = subtotal - voucher - pointDiscount;
  const change = customerMoney - totalAfterDiscount;
const handlePhoneChange = async (e) => {

  const phone = e.target.value;
  setCustomerPhone(phone);

  if (phone.length >= 10) {
    dispatch(findUserByPhone(phone));
  }

};
useEffect(() => {

  if (customer) {
    setCustomerName(customer.fullName);
  }

}, [customer]);
const handlePayment = async () => {

  if (order.length === 0) {
    dispatch(showAlert({
      type: "red",
      message: "Không có sản phẩm trong đơn"
    }));
    return;
  }

  if (customerMoney <= 0) {
    dispatch(showAlert({
      type: "red",
      message: "Vui lòng nhập số tiền khách đưa"
    }));
    return;
  }

  if (customerMoney < totalAfterDiscount) {
    dispatch(showAlert({
      type: "red",
      message: "Số tiền khách đưa không đủ"
    }));
    return;
  }

  try {

    const orderPayload = {
      userPhone: currentUser?.phone || null,
      orderDetails: order.map(item => ({
        productId: item.id,
        quantity: item.quantity
      }))
    };

    const orderRes = await dispatch(createOrder(orderPayload)).unwrap();

    const paymentPayload = {
      userPhone: customerPhone || null,
      orderId: orderRes.id,
      cashReceived: customerMoney,
      method: paymentMethod,
      usedPoints: usedPoints,
      note: "POS Payment"
    };

    await dispatch(createPayment(paymentPayload)).unwrap();

    dispatch(showAlert({
      type: "green",
      message: "Thanh toán thành công!"
    }));

    dispatch(clearCart());
    navigate("/pos");

  } catch (err) {

    dispatch(showAlert({
      type: "red",
      message: "Thanh toán thất bại"
    }));

  }

};
console.log(customer);

  return (
    <div className="flex h-screen bg-gray-100">

      {/* LEFT */}
      <div className="flex-1 p-6 bg-white">

        <h2 className="text-xl font-bold mb-3">
          Thông tin khách hàng
        </h2>

        <div className="space-y-3 mb-6">

        <input
  type="text"
  placeholder="Số điện thoại"
  className="border p-2 rounded w-full"
  value={customerPhone}
  onChange={handlePhoneChange}
/>

          <input
            type="text"
            placeholder="Tên khách hàng"
            className="border p-2 rounded w-full"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
          />
<div className="text-sm text-gray-600">
  Điểm tích lũy: {customer?.customerProfile?.loyaltyPoints || 0}
</div>
  <h2 className="text-xl font-bold mb-3">
          Nhập số điểm muốn sử dụng
        </h2>
<input
  type="number"
  placeholder="Nhập điểm muốn sử dụng"
  className="border p-2 rounded w-full"
  value={usedPoints}
 onChange={(e) => {

  const value = Number(e.target.value);

  const maxPoints = customer?.customerProfile?.loyaltyPoints || 0;

  if (value > maxPoints) {
    alert("Không đủ điểm");
    return;
  }

  if (value > subtotal) {
    alert("Điểm vượt quá giá trị đơn hàng");
    return;
  }

  setUsedPoints(value);

}}
/>
        </div>
  <h2 className="text-xl font-bold mt-6 mb-2">
          Voucher
        </h2>

        <input
          type="number"
          placeholder="Nhập số tiền giảm"
          className="border p-2 rounded w-full"
          value={voucher}
          onChange={(e) => setVoucher(Number(e.target.value))}
        />
        <h2 className="text-xl font-bold mb-3">
          Phương thức thanh toán
        </h2>

        <div className="space-y-3">

          <button
            onClick={() => setPaymentMethod("CASH")}
            className={`w-full p-3 border rounded ${
              paymentMethod === "CASH"
                ? "bg-blue-500 text-white"
                : "bg-white"
            }`}
          >
            Tiền mặt
          </button>

          <button
            onClick={() => setPaymentMethod("BANK")}
            className={`w-full p-3 border rounded ${
              paymentMethod === "BANK"
                ? "bg-blue-500 text-white"
                : "bg-white"
            }`}
          >
            Chuyển khoản
          </button>

          <button
            onClick={() => setPaymentMethod("MOMO")}
            className={`w-full p-3 border rounded ${
              paymentMethod === "MOMO"
                ? "bg-blue-500 text-white"
                : "bg-white"
            }`}
          >
            Ví MoMo
          </button>

        </div>

      

      </div>


      {/* RIGHT */}
      <div className="w-[420px] bg-gray-50 p-6 border-l">

        <h2 className="text-xl font-bold mb-4">
          Thông tin thanh toán
        </h2>

        <div className="space-y-3 text-lg">

          <div className="flex justify-between">
            <span>Tổng tiền</span>
            <span>{subtotal.toLocaleString()} đ</span>
          </div>

          <div className="flex justify-between text-red-500">
            <span>Giảm giá</span>
            <span>- {voucher.toLocaleString()} đ</span>
          </div>
          <div className="flex justify-between text-blue-500">
            <span>Giảm từ điểm</span>
            <span>- {pointDiscount.toLocaleString()} đ</span>
          </div>
          <div className="flex justify-between font-bold text-xl border-t pt-2">
            <span>Cần trả</span>
            <span>{totalAfterDiscount.toLocaleString()} đ</span>
          </div>

        </div>

        <div className="mt-6">

          <label className="font-semibold">
            Khách đưa
          </label>

          <input
            type="number"
            className="border p-2 rounded w-full mt-2"
            value={customerMoney}
            onChange={(e) => setCustomerMoney(Number(e.target.value))}
          />

        </div>

        <div className="flex justify-between mt-4 text-lg">

          <span>Tiền thừa</span>

          <span className="text-green-600 font-bold">
            {change > 0 ? change.toLocaleString() : 0} đ
          </span>

        </div>

        <button
          onClick={handlePayment}
          className="mt-6 w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700"
        >
          Xác nhận thanh toán
        </button>

        <button
          onClick={() => navigate("/pos")}
          className="mt-2 w-full bg-gray-400 text-white py-2 rounded-lg hover:bg-gray-500"
        >
          Quay lại POS
        </button>

      </div>

    </div>
  );
}