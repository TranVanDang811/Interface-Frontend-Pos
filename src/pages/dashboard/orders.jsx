import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Chip,
} from "@material-tailwind/react";

import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";

import {
  fetchOrders,
  fetchOrderById,
} from "@/features/order/orderThunks";

import Pagination from "@/utils/Pagination";
import { formatDateTime } from "@/utils/dateFormat";

export function Orders() {
  const dispatch = useDispatch();

  const { list, loading, page, totalPages, orderDetail } = useSelector(
    (state) => state.order
  );

  const [expandedOrderId, setExpandedOrderId] = useState(null);

  useEffect(() => {
    dispatch(fetchOrders({ page: 1, size: 5 }));
  }, [dispatch]);

  const handlePageChange = (newPage) => {
    dispatch(fetchOrders({ page: newPage, size: 5 }));
  };

  const handleToggle = async (orderId) => {
    if (expandedOrderId === orderId) {
      setExpandedOrderId(null);
    } else {
      await dispatch(fetchOrderById(orderId));
      setExpandedOrderId(orderId);
    }
  };

  return (
    <div className="mt-12 mb-8 flex flex-col gap-6">
      <Card>
        <CardHeader
          variant="gradient"
          color="gray"
          className="mb-8 p-6"
        >
          <Typography variant="h6" color="white">
            Orders
          </Typography>
        </CardHeader>

        <CardBody className="px-0 pt-0 pb-2">
          {loading ? (
            <div className="p-6 text-center">
              <Typography>Loading...</Typography>
            </div>
          ) : (
            <>
              <table className="w-full min-w-[640px] table-auto">
                <thead>
                  <tr>
                    {[
                      "Order ID",
                      "Order Code",
                      "Total",
                      "Status",
                      "Created At",
                    ].map((el) => (
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
                  {list?.map((order, key) => {
                    const className = `py-3 px-5 ${
                      key === list.length - 1
                        ? ""
                        : "border-b border-blue-gray-50"
                    }`;

                    return (
                      <>
                        {/* ORDER ROW */}
                        <tr key={order.id}>
                          <td className={className}>
                            <Typography
                              className="text-xs font-semibold text-blue-600 cursor-pointer hover:underline"
                              onClick={() => handleToggle(order.id)}
                            >
                              {order.id}
                            </Typography>
                          </td>

                          <td className={className}>
                            <Typography className="text-xs">
                              {order.orderCode}
                            </Typography>
                          </td>

                          <td className={className}>
                            <Typography className="text-xs">
                              {order.finalAmount?.toLocaleString()} đ
                            </Typography>
                          </td>

                          <td className={className}>
                            <Chip
                              value={order.status}
                              color={
                                order.status === "PAID"
                                  ? "green"
                                  : order.status === "PENDING"
                                  ? "orange"
                                  : "red"
                              }
                              className="text-xs w-fit"
                            />
                          </td>

                          <td className={className}>
                            <Typography className="text-xs">
                              {formatDateTime(order.createdAt)}
                            </Typography>
                          </td>
                        </tr>

                        {/* ORDER DETAIL ROW */}
                        {expandedOrderId === order.id && orderDetail && (
                          <tr>
                            <td colSpan="5" className="bg-gray-50 p-4">
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="border-b">
                                    <th className="text-left py-2">
                                      Product
                                    </th>
                                    <th className="text-left py-2">
                                      Price
                                    </th>
                                    <th className="text-left py-2">
                                      Quantity
                                    </th>
                                    <th className="text-left py-2">
                                      Total
                                    </th>
                                  </tr>
                                </thead>

                                <tbody>
                                  {orderDetail.orderDetails?.map(
                                    (item) => (
                                      <tr key={item.id}>
                                        <td className="py-2">
                                          {item.name}
                                        </td>
                                        <td className="py-2">
                                          {item.price?.toLocaleString()} đ
                                        </td>
                                        <td className="py-2">
                                          {item.quantity}
                                        </td>
                                        <td className="py-2">
                                          {(
                                            item.price *
                                            item.quantity
                                          ).toLocaleString()}{" "}
                                          đ
                                        </td>
                                      </tr>
                                    )
                                  )}
                                </tbody>
                              </table>
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })}
                </tbody>
              </table>

              <Pagination
                page={page}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

export default Orders; 