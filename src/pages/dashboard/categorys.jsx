import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Button,
} from "@material-tailwind/react";

import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";

import {
  fetchCategories,
  deleteCategory,
} from "@/features/category/categoryThunks";

import { useNavigate } from "react-router-dom";
import { XMarkIcon } from "@heroicons/react/24/solid";
import Pagination from "@/utils/Pagination";

export function Categories() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [searchName, setSearchName] = useState("");

  const { list, loading, page, totalPages } = useSelector(
    (state) => state.category
  );

  // load lần đầu
  useEffect(() => {
    dispatch(fetchCategories({ page: 1, size: 4 }));
  }, [dispatch]);

  // đổi trang
  const handlePageChange = (newPage) => {
    dispatch(fetchCategories({ page: newPage, size: 4 }));
  };

  // delete
  const handleDelete = (id) => {
    if (window.confirm("Anh có chắc muốn xóa category này không?")) {
      dispatch(deleteCategory(id));
    }
  };



  return (
    <div className="mt-12 mb-8 flex flex-col gap-6">
      <Card>
        {/* HEADER */}
        <CardHeader
          variant="gradient"
          color="gray"
          className="mb-8 p-6 flex items-center justify-between"
        >
          <Typography variant="h6" color="white">
            Categories
          </Typography>

          <div className="flex items-center gap-4">
       
           

            {/* ADD */}
            <Button
              size="sm"
              color="green"
              onClick={() => navigate("/dashboard/categories/add")}
              className="shadow-md hover:shadow-lg transition"
            >
              + Add Category
            </Button>
          </div>
        </CardHeader>

        {/* BODY */}
        <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
          {loading ? (
            <div className="p-6 text-center">
              <Typography>Loading...</Typography>
            </div>
          ) : (
            <>
              <table className="w-full min-w-[500px] table-auto">
                <thead>
                  <tr>
                    {["ID", "Name", "Description", ""].map((el) => (
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
                  {list?.map((category, index) => {
                    const className = `py-3 px-5 ${
                      index === list.length - 1
                        ? ""
                        : "border-b border-blue-gray-50"
                    }`;

                    return (
                      <tr key={category.id}>
                        <td className={className}>
                          <Typography className="text-xs font-semibold text-blue-gray-600">
                            {category.id}
                          </Typography>
                        </td>

                        <td className={className}>
                          <Typography className="text-xs font-semibold text-blue-gray-600">
                            {category.name}
                          </Typography>
                        </td>

                        <td className={className}>
                          <Typography className="text-xs text-blue-gray-500">
                            {category.description}
                          </Typography>
                        </td>

                        <td className={className}>
                          <Typography
                            as="button"
                            onClick={() => handleDelete(category.id)}
                            className="text-xs font-semibold text-red-600 hover:underline cursor-pointer"
                          >
                            Delete
                          </Typography>
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
            </>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

export default Categories;