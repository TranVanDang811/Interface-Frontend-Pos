import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Chip,
  Button,
} from "@material-tailwind/react";

import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";

import {
  fetchPayments,

} from "@/features/payment/paymentThunks";

import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/solid";
import Pagination from "@/utils/Pagination";
import { formatDateTime } from "@/utils/dateFormat";
import { useNavigate } from "react-router-dom";
import paymentAPI from "@/features/payment/paymentAPI";

export function Payments() {
  const dispatch = useDispatch();
const navigate = useNavigate();
  const { list, loading, page, totalPages } = useSelector(
    (state) => state.payment
  );

  const [searchOrderId, setSearchOrderId] = useState("");

  useEffect(() => {
    dispatch(fetchPayments({ page: 1, size: 5 }));
  }, [dispatch]);

  const handlePageChange = (newPage) => {
    dispatch(fetchPayments({ page: newPage, size: 5 }));
  };

const handlePrintInvoice = async (paymentId) => {
  try {
    const blob = await paymentAPI.exportInvoice(paymentId);

    const fileURL = window.URL.createObjectURL(blob);

    const printWindow = window.open(fileURL);

    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
    };
  } catch (error) {
    console.error("Print invoice error:", error);
  }
};


  return (
    <div className="mt-12 mb-8 flex flex-col gap-6">
      <Card>
        <CardHeader
          variant="gradient"
          color="gray"
          className="mb-8 p-6 flex items-center justify-between"
        >
          <Typography variant="h6" color="white">
            Payments
          </Typography>

      
        </CardHeader>

        <CardBody className=" px-0 pt-0 pb-2">
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
                      "Payment ID",
                      "Order ID",
                      "Amount",
                      "Method",
                      "Status",
                      "Payment Date",
                      "Action"
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
                  {list?.map((payment, key) => {
                    const className = `py-3 px-5 ${
                      key === list.length - 1
                        ? ""
                        : "border-b border-blue-gray-50"
                    }`;

                    return (
                      <tr key={payment.id}>
                        <td className={className}>
                          <Typography className="text-xs font-semibold">
                            {payment.id}
                          </Typography>
                        </td>

                      <td className={className}>
  <Typography
    as="button"
    onClick={() => navigate(`/dashboard/orders/${payment.orderId}`)}
    className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
  >
    {payment.orderId}
  </Typography>
</td>

                        <td className={className}>
                          <Typography className="text-xs">
                            {payment.amount?.toLocaleString()} đ
                          </Typography>
                        </td>

                        <td className={className}>
                          <Chip
                            value={payment.method}
                            color="blue"
                            className="text-xs w-fit"
                          />
                        </td>

                        <td className={className}>
                          <Chip
                            value={payment.status}
                            color={
                              payment.status === "SUCCESS"
                                ? "green"
                                : payment.status === "PENDING"
                                ? "orange"
                                : "red"
                            }
                            className="text-xs w-fit"
                          />
                        </td>

                        <td className={className}>
                          <Typography className="text-xs">
                            {formatDateTime(payment.paymentDate)}
                          </Typography>
                        </td>
<td className={className}>
  <Button
    size="sm"
    color="blue"
    onClick={() => handlePrintInvoice(payment.id)}
  >
    Print
  </Button>
</td>
                       
                      </tr>
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

export default Payments;