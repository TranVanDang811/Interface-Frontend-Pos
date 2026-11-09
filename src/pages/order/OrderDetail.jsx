import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Button,
  Chip,
} from "@material-tailwind/react";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { fetchOrderById } from "@/features/order/orderThunks";
import { ArrowLeftIcon, ShoppingBagIcon } from "@heroicons/react/24/solid";
import { formatDateTime } from "@/utils/dateFormat";
import { fetchPaymentByOrder } from "@/features/payment/paymentThunks";

export function OrderDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { orderDetail, loading } = useSelector((state) => state.order);
  const payment = useSelector((state) => state.payment.paymentDetail);

  useEffect(() => {
    if (id) {
      dispatch(fetchOrderById(id));
      dispatch(fetchPaymentByOrder(id));
    }
  }, [dispatch, id]);

  const renderStatusChip = (st) => {
    switch (st) {
      case "PAID":
        return <Chip value="Đã thanh toán" color="green" size="sm" className="w-fit" />;
      case "PENDING":
        return <Chip value="Chờ thanh toán" color="amber" size="sm" className="w-fit" />;
      case "HOLD":
        return <Chip value="Tạm giữ" color="orange" size="sm" className="w-fit" />;
      case "CANCELED":
        return <Chip value="Đã hủy" color="red" size="sm" className="w-fit" />;
      default:
        return <Chip value={st || "Không rõ"} color="gray" size="sm" className="w-fit" />;
    }
  };

  return (
    <div className="mt-8 mb-8 flex flex-col gap-6">
      <Card className="border border-blue-gray-100 shadow-sm">
        <CardHeader
          variant="gradient"
          color="gray"
          className="mb-6 p-6 flex items-center justify-between"
        >
          <div>
            <Typography variant="h6" color="white" className="font-bold flex items-center gap-2">
              <ShoppingBagIcon className="w-5 h-5 text-gray-300" />
              Chi Tiết Đơn Hàng: {orderDetail?.orderCode || id}
            </Typography>
            <Typography variant="small" className="text-gray-300 font-mono text-xs mt-0.5">
              ID Hệ thống: {id}
            </Typography>
          </div>

          <Button
            size="sm"
            color="white"
            variant="text"
            className="flex items-center gap-2 normal-case font-semibold bg-white/10 hover:bg-white/20 text-white"
            onClick={() => navigate(-1)}
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Quay lại
          </Button>
        </CardHeader>

        <CardBody className="px-0 pt-0 pb-6">
          {/* Order Info Cards */}
          <div className="p-6 border-b border-blue-gray-100 bg-gray-50/50">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {/* Khách hàng */}
              <div>
                <Typography variant="small" className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Khách Hàng
                </Typography>
                <Typography className="font-bold text-gray-900 mt-1 text-sm">
                  {payment?.fullName || "Khách vãng lai"}
                </Typography>
                {payment?.userPhone && (
                  <Typography className="text-xs font-mono text-gray-500">
                    SĐT: {payment.userPhone}
                  </Typography>
                )}
              </div>

              {/* Trạng thái đơn */}
              <div>
                <Typography variant="small" className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Trạng Thái Đơn
                </Typography>
                <div className="mt-1">
                  {renderStatusChip(orderDetail?.status)}
                </div>
              </div>

              {/* Thời gian tạo */}
              <div>
                <Typography variant="small" className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Thời Gian Tạo
                </Typography>
                <Typography className="font-semibold text-gray-900 mt-1 text-sm">
                  {formatDateTime(payment?.paymentDate || orderDetail?.createdAt)}
                </Typography>
              </div>

              {/* Tổng tiền hàng */}
              <div>
                <Typography variant="small" className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Tổng Tiền Hàng
                </Typography>
                <Typography className="font-bold text-gray-900 mt-1 text-sm">
                  {(orderDetail?.totalPrice || 0).toLocaleString("vi-VN")} đ
                </Typography>
              </div>
            </div>

            {/* Chi tiết Voucher & Điểm & Thực trả */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-5 pt-4 border-t border-gray-200">
              {/* Voucher */}
              <div>
                <Typography variant="small" className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Voucher / Giảm Giá
                </Typography>
                <Typography className="font-bold text-red-500 mt-1 text-sm">
                  {orderDetail?.discountCode
                    ? `[${orderDetail.discountCode}] -${(orderDetail?.discountAmount || 0).toLocaleString("vi-VN")} đ`
                    : "Không áp dụng"}
                </Typography>
              </div>

              {/* Giảm từ điểm */}
              <div>
                <Typography variant="small" className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Giảm Từ Điểm Tích Lũy
                </Typography>
                <Typography className="font-bold text-blue-600 mt-1 text-sm">
                  {payment?.pointDiscount > 0
                    ? `-${(payment.pointDiscount).toLocaleString("vi-VN")} đ`
                    : "0 đ"}
                </Typography>
              </div>

              {/* Tổng tiền thực trả */}
              <div>
                <Typography variant="small" className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Tổng Tiền Thực Trả
                </Typography>
                <Typography className="font-extrabold text-emerald-700 mt-1 text-base">
                  {(payment?.amount || orderDetail?.finalAmount || 0).toLocaleString("vi-VN")} đ
                </Typography>
              </div>

              {/* Phương thức TT nếu có */}
              <div>
                <Typography variant="small" className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Phương Thức TT
                </Typography>
                <Typography className="font-semibold text-gray-800 mt-1 text-sm">
                  {payment?.method || (orderDetail?.status === "PAID" ? "Đã ghi nhận" : "Chưa thanh toán")}
                </Typography>
              </div>
            </div>
          </div>

          {/* Table Sản phẩm trong đơn */}
          {loading ? (
            <div className="p-10 text-center flex flex-col items-center justify-center gap-2">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <Typography className="text-sm font-medium text-gray-500">
                Đang tải chi tiết giỏ hàng...
              </Typography>
            </div>
          ) : !orderDetail?.orderDetails || orderDetail.orderDetails.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              Không có sản phẩm nào trong đơn hàng này
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] table-auto">
                <thead>
                  <tr className="bg-gray-50/70 border-b border-blue-gray-100">
                    {[
                      "Mã Sản Phẩm",
                      "Tên Sản Phẩm",
                      "Đơn Giá",
                      "Số Lượng",
                      "Thành Tiền",
                    ].map((el) => (
                      <th
                        key={el}
                        className="border-b border-blue-gray-50 py-3 px-5 text-left"
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
                  {orderDetail.orderDetails.map((detail) => (
                    <tr key={detail.id || detail.productId} className="hover:bg-blue-50/20">
                      {/* Mã SP */}
                      <td className="py-3 px-5">
                        <span className="font-mono text-xs font-semibold text-gray-700 bg-gray-100 px-2 py-0.5 rounded">
                          {detail.productCode || detail.productId || "—"}
                        </span>
                      </td>

                      {/* Tên SP */}
                      <td className="py-3 px-5">
                        <Typography className="text-xs font-bold text-gray-900">
                          {detail.name}
                        </Typography>
                      </td>

                      {/* Đơn Giá */}
                      <td className="py-3 px-5">
                        <Typography className="text-xs text-gray-700">
                          {(detail.price || 0).toLocaleString("vi-VN")} đ
                        </Typography>
                      </td>

                      {/* Số Lượng */}
                      <td className="py-3 px-5">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700">
                          {detail.quantity}
                        </span>
                      </td>

                      {/* Thành Tiền */}
                      <td className="py-3 px-5">
                        <Typography className="text-xs font-bold text-emerald-700">
                          {(detail.totalPrice || detail.price * detail.quantity || 0).toLocaleString("vi-VN")} đ
                        </Typography>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

export default OrderDetail;
