import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Avatar,
  Chip,
  Button,
} from "@material-tailwind/react";

import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import {
  changeProductStatus,
  deleteProduct,
  fetchProducts,
} from "@/features/product/productThunks";
import { useNavigate } from "react-router-dom";
import { XMarkIcon } from "@heroicons/react/24/solid";
import Pagination from "@/utils/Pagination";

export function Products() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [searchCode, setSearchCode] = useState("");

  const { list, loading, page, totalPages } = useSelector(
    (state) => state.product
  );

  // load lần đầu
  useEffect(() => {
    dispatch(fetchProducts({ page: 1, size: 5 }));
  }, [dispatch]);

  // đổi trang (giữ search)
  const handlePageChange = (newPage) => {
    dispatch(
      fetchProducts({
        productCode: searchCode || null,
        page: newPage,
        size: 5,
      })
    );
  };

  const handleDelete = (id) => {
    if (window.confirm("Anh có chắc muốn xóa sản phẩm này không?")) {
      dispatch(deleteProduct(id));
    }
  };

  const handleToggleStatus = (product) => {
    let newStatus;

    if (product.status === "ACTIVE") {
      newStatus = "OUT_OF_STOCK";
    } else if (product.status === "OUT_OF_STOCK") {
      if (product.stock <= 0) {
        alert("Không thể ACTIVE khi stock = 0");
        return;
      }

      newStatus = "ACTIVE";
    } else {
      alert("Sản phẩm đã discontinued.");
      return;
    }

    dispatch(
      changeProductStatus({
        id: product.id,
        status: newStatus,
      })
    );
  };

  const handleSearch = () => {
    dispatch(
      fetchProducts({
        productCode: searchCode || null,
        page: 1,
        size: 5,
      })
    );
  };

  const handleDiscontinue = (id) => {
    if (window.confirm("Ngừng kinh doanh sản phẩm này?")) {
      dispatch(
        changeProductStatus({
          id,
          status: "DISCONTINUED",
        })
      );
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
            Products
          </Typography>

          <div className="flex items-center gap-4">
            {/* Search box */}
            <div className="relative w-72">
              <input
                type="text"
                placeholder="Search product code..."
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearch();
                }}
                className="w-full px-4 py-2 rounded-lg bg-white/10 text-white 
                placeholder:text-white/60 
                border border-white/20 
                focus:outline-none focus:ring-2 focus:ring-white/40 
                transition"
              />

              {searchCode && (
                <XMarkIcon
                  onClick={() => {
                    setSearchCode("");
                    dispatch(fetchProducts({ page: 1, size: 5 }));
                  }}
                  className="h-4 w-4 absolute right-3 top-1/2 -translate-y-1/2 
                  cursor-pointer text-white/60 hover:text-red-400 transition"
                />
              )}
            </div>

            <Button
              size="sm"
              color="green"
              onClick={() => navigate("/dashboard/products/add")}
              className="shadow-md hover:shadow-lg transition"
            >
              + Add Product
            </Button>
          </div>
        </CardHeader>

        <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
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
                      "Image",
                      "Code",
                      "Name",
                      "Price",
                      "Stock",
                      "Status",
                      "",
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
                  {list?.map((product, key) => {
                    const className = `py-3 px-5 ${
                      key === list.length - 1
                        ? ""
                        : "border-b border-blue-gray-50"
                    }`;

                    return (
                      <tr key={product.id}>
                        <td className={className}>
                          <Avatar
                            src={
                              product.imageUrl ||
                              "/img/default-product.png"
                            }
                            alt={product.name}
                            size="sm"
                            variant="rounded"
                          />
                        </td>

                        <td className={className}>
                          <Typography className="text-xs font-semibold text-blue-gray-600">
                            {product.productCode}
                          </Typography>
                        </td>

                        <td className={className}>
                          <Typography className="text-xs font-semibold text-blue-gray-600">
                            {product.name}
                          </Typography>
                        </td>

                        <td className={className}>
                          <Typography className="text-xs font-semibold text-blue-gray-600">
                            {product.price?.toLocaleString()} đ
                          </Typography>
                        </td>

                        <td className={className}>
                          <Typography className="text-xs text-blue-gray-500">
                            {product.stock}
                          </Typography>
                        </td>

                        <td className={className}>
                          <Chip
                            variant="gradient"
                            color={
                              product.status === "ACTIVE"
                                ? "green"
                                : product.status === "OUT_OF_STOCK"
                                ? "orange"
                                : "red"
                            }
                            value={product.status}
                            onClick={() => {
                              if (product.status !== "DISCONTINUED") {
                                handleToggleStatus(product);
                              }
                            }}
                            className={`py-0.5 px-2 text-[11px] font-medium w-fit
                            ${
                              product.status !== "DISCONTINUED"
                                ? "cursor-pointer hover:opacity-80"
                                : "opacity-60 cursor-not-allowed"
                            }`}
                          />
                        </td>

                        <td className={className}>
                          <Typography
                            as="button"
                            onClick={() => handleDelete(product.id)}
                            className="text-xs font-semibold text-red-600 hover:underline cursor-pointer"
                          >
                            Delete
                          </Typography>
                        </td>

                        <td className={className}>
                          <Typography
                            as="button"
                            onClick={() => handleDiscontinue(product.id)}
                            className="text-xs font-semibold text-gray-600 hover:underline cursor-pointer"
                          >
                            Discontinue
                          </Typography>
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

export default Products;