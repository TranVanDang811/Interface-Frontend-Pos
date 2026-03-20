import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Button,
} from "@material-tailwind/react";

import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";

import { fetchSuppliers } from "@/features/supplier/supplierThunks";
import Pagination from "@/utils/Pagination";
import { useNavigate } from "react-router-dom";

export function Suppliers() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { list, loading, page, totalPages } = useSelector(
    (state) => state.supplier
  );

  useEffect(() => {
    dispatch(fetchSuppliers({ page: 1, size: 5 }));
  }, [dispatch]);

  const handlePageChange = (newPage) => {
    dispatch(fetchSuppliers({ page: newPage, size: 5 }));
  };

  return (
    <div className="mt-12 mb-8 flex flex-col gap-12">
      <Card>
 <CardHeader
          variant="gradient"
          color="gray"
          className="mb-8 p-6 flex items-center justify-between"
        >
          <Typography variant="h6" color="white">
             Suppliers
          </Typography>

          <div className="flex items-center gap-4">
       
           

            {/* ADD */}
            <Button
              size="sm"
              color="green"
              onClick={() => navigate("/dashboard/suppliers/add")}
              className="shadow-md hover:shadow-lg transition"
            >
              + Add Supplier
            </Button>
          </div>
        </CardHeader>
        <CardBody className="px-0 pt-0 pb-2">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] table-auto">
              <thead>
                <tr>
                  {["ID", "Name", "Phone", "Email", "Address"].map((el) => (
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
                {loading ? (
                  <tr>
                    <td colSpan="5" className="text-center py-6">
                      Loading...
                    </td>
                  </tr>
                ) : list.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-6">
                      No suppliers found
                    </td>
                  </tr>
                ) : (
                  list.map((supplier, index) => {
                    const className = `py-3 px-5 ${
                      index === list.length - 1
                        ? ""
                        : "border-b border-blue-gray-50"
                    }`;

                    return (
                      <tr key={supplier.id}>
                        <td className={className}>
                          <Typography className="text-xs font-semibold text-blue-gray-600">
                            {supplier.id}
                          </Typography>
                        </td>

                        <td className={className}>
                          <Typography className="text-xs font-semibold text-blue-gray-600">
                            {supplier.name}
                          </Typography>
                        </td>

                        <td className={className}>
                          <Typography className="text-xs text-blue-gray-600">
                            {supplier.phone}
                          </Typography>
                        </td>

                        <td className={className}>
                          <Typography className="text-xs text-blue-gray-600">
                            {supplier.email}
                          </Typography>
                        </td>

                        <td className={className}>
                          <Typography className="text-xs text-blue-gray-500">
                            {supplier.address}
                          </Typography>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
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

export default Suppliers;