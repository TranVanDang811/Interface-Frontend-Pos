import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Avatar,
  Button,
  Chip,
} from "@material-tailwind/react";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

import { fetchOrderById } from "@/features/order/orderThunks";
import { ArrowLeftIcon } from "@heroicons/react/24/solid";
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

  console.log(orderDetail);
console.log(payment);

  return (
    <div className="mt-12 mb-8 flex flex-col gap-6">
      <Card>

       <CardHeader
  variant="gradient"
  color="gray"
  className="mb-8 p-6 flex items-center justify-between"
>
  <Typography variant="h6" color="white">
    Order Details - {id}
  </Typography>

  <Button
    size="sm"
    color="white"
    variant="text"
    className="flex items-center gap-2"
    onClick={() => navigate("/dashboard/sales-history")}
  >
    <ArrowLeftIcon className="h-4 w-4" />
    Back
  </Button>
</CardHeader>

        <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
            {/* Order Info */}
<div className="p-6 border-b border-blue-gray-100">
  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">

    <div>
      <Typography variant="small" className="text-blue-gray-400">
        Customer
      </Typography>
      <Typography className="font-semibold">
        {payment?.fullName}
      </Typography>
    </div>

    <div>
      <Typography variant="small" className="text-blue-gray-400">
        Status
      </Typography>
    <Chip
  value={orderDetail?.status}
  color={orderDetail?.status === "PAID" ? "green" : "amber"}
  size="sm"
/>
    </div>

    <div>
      <Typography variant="small" className="text-blue-gray-400">
        Created At
      </Typography>
      <Typography className="font-semibold">
        {formatDateTime(payment?.paymentDate)}
      </Typography>
    </div>

    <div>
      <Typography variant="small" className="text-blue-gray-400">
        Total Price
      </Typography>
      <Typography className="font-semibold">
        {orderDetail?.totalPrice?.toLocaleString()} đ
      </Typography>
    </div>

    <div>
      <Typography variant="small" className="text-blue-gray-400">
        Discount
      </Typography>
      <Typography className="font-semibold">
        {payment?.discountAmount?.toLocaleString()} đ
      </Typography>
    </div>

    <div>
      <Typography variant="small" className="text-blue-gray-400">
        Final Amount
      </Typography>
      <Typography className="font-semibold text-green-600">
        {payment?.amount?.toLocaleString()} đ
      </Typography>
    </div>

  </div>
</div>
          {loading ? (
            <div className="p-6 text-center">
              <Typography>Loading...</Typography>
            </div>
          ) : (
            
            <table className="w-full min-w-[640px] table-auto">

              <thead>
                <tr>
                  {["Product", "Price", "Quantity", "Total"].map((el) => (
                    <th
                      key={el}
                      className="border-b border-blue-gray-50 py-3 px-5 text-left"
                    >
                      <Typography
                        variant="small"
                        className="text-[11px] font-bold uppercase text-blue-gray-400"
                      >
                        {el}
                      </Typography>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {orderDetail?.orderDetails?.map((detail, key) => {
                  const className = `py-3 px-5 ${
                    key === orderDetail.orderDetails.length - 1
                      ? ""
                      : "border-b border-blue-gray-50"
                  }`;

                  return (
                    <tr key={detail.id}>
                          <td className={className}>
                        <div className="flex items-center gap-4">
                        

                          <Typography className="text-xs font-semibold text-blue-gray-600">
                            {detail.productCode}
                          </Typography>

                        </div>
                      </td>
                      {/* Product */}
                      <td className={className}>
                        <div className="flex items-center gap-4">
                        

                          <Typography className="text-xs font-semibold text-blue-gray-600">
                            {detail.name}
                          </Typography>

                        </div>
                      </td>

                      {/* Price */}
                      <td className={className}>
                        <Typography className="text-xs">
                          {detail.price?.toLocaleString()} đ
                        </Typography>
                      </td>

                      {/* Quantity */}
                      <td className={className}>
                        <Typography className="text-xs">
                          {detail.quantity}
                        </Typography>
                      </td>

                      {/* Total */}
                      <td className={className}>
                        <Typography className="text-xs font-semibold">
                          {detail.totalPrice?.toLocaleString()} đ
                        </Typography>
                      </td>

                    </tr>
                  );
                })}
              </tbody>

            </table>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

export default OrderDetail;