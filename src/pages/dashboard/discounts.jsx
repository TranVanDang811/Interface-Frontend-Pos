import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Chip,
  IconButton,
  Button
} from "@material-tailwind/react";

import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";

import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";

import { fetchDiscounts, deleteDiscount } from "@/features/discount/discountThunks";
import Pagination from "@/utils/Pagination";
import { useNavigate } from "react-router-dom";

export function Discounts() {

  const dispatch = useDispatch();
const navigate = useNavigate();
  const { list, loading, page, totalPages  } = useSelector((state) => state.discount);

  useEffect(() => {
    dispatch(fetchDiscounts());
  }, [dispatch]);

  const handleDelete = (id) => {
    if (confirm("Delete discount?")) {
      dispatch(deleteDiscount(id));
    }
  };
  const handlePageChange = (newPage) => {
    dispatch(fetchDiscounts({ page: newPage, size: 5 }));
  };
  return (
    <div className="mt-12 mb-8 flex flex-col gap-12">

      <Card>

        <CardHeader variant="gradient" color="gray" className="mb-8 p-6 flex items-center justify-between">
          <Typography variant="h6" color="white">
            Discount Management
          </Typography>
          <Button size="sm" color="green" onClick={()=>
                          navigate("/dashboard/discounts/create")
                          }
                          >
                          + Create Discount
                      </Button>
        </CardHeader>

        <CardBody className="overflow-x-auto px-0 pt-0 pb-2">

          <table className="w-full min-w-[640px] table-auto">

            <thead>
              <tr>
                {["Name", "Code", "Value", "Start Date", "End Date", "Status", ""].map((el) => (
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

              {list.map((discount, key) => {

                const className = `py-3 px-5 ${
                  key === list.length - 1
                    ? ""
                    : "border-b border-blue-gray-50"
                }`;

                return (
                  <tr key={discount.id}>

                    <td className={className}>
                      <Typography className="text-sm font-semibold text-blue-gray-600">
                        {discount.name}
                      </Typography>
                    </td>

                    <td className={className}>
                      <Typography className="text-sm text-blue-gray-500">
                        {discount.code}
                      </Typography>
                    </td>

                    <td className={className}>
                      <Typography className="text-sm font-semibold text-green-600">
                        {discount.value}đ
                      </Typography>
                    </td>

                    <td className={className}>
                      <Typography className="text-sm text-blue-gray-500">
                        {new Date(discount.startDate).toLocaleDateString()}
                      </Typography>
                    </td>

                    <td className={className}>
                      <Typography className="text-sm text-blue-gray-500">
                        {new Date(discount.endDate).toLocaleDateString()}
                      </Typography>
                    </td>

                    <td className={className}>
                      <Chip
                        variant="gradient"
                        color={discount.active ? "green" : "red"}
                        value={discount.active ? "Active" : "Inactive"}
                        className="py-0.5 px-2 text-[11px] w-fit"
                      />
                    </td>

                    <td className={className}>

                      <div className="flex gap-2">

                        <IconButton variant="text">
                          <PencilIcon className="h-5 w-5 text-blue-gray-500" />
                        </IconButton>

                        <IconButton
                          variant="text"
                          onClick={() => handleDelete(discount.id)}
                        >
                          <TrashIcon className="h-5 w-5 text-red-500" />
                        </IconButton>

                      </div>

                    </td>

                  </tr>
                );
              })}

            </tbody>

          </table>
                {/* PAGINATION */}
     <Pagination
                    page={page}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
        </CardBody>

      </Card>

    </div>
  );
}

export default Discounts;