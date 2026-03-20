import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Button,
  Input,
  Select,
  Option,
  Avatar,
} from "@material-tailwind/react";

import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { fetchProducts, fetchProductsBySupplier } from "@/features/product/productThunks";
import { createImportOrder } from "@/features/importOrder/importOrderThunks";
import { fetchSuppliers } from "@/features/supplier/supplierThunks";
import { useNavigate } from "react-router-dom";

export function ImportOrderCreate() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { list: products } = useSelector((s) => s.product);
  const { list: suppliers } = useSelector((s) => s.supplier);

  const [supplierId, setSupplierId] = useState("");
  const [items, setItems] = useState([]);

  // Load suppliers khi vào trang
  useEffect(() => {
    dispatch(fetchSuppliers({ page: 1, size: 100 }));
  }, [dispatch]);

  // Khi chọn supplier → load sản phẩm theo supplier
useEffect(() => {
  if (supplierId) {
    dispatch(fetchProductsBySupplier(supplierId));
    setItems([]);
  }
}, [supplierId, dispatch]);

  const handleAddProduct = (product) => {
    if (!supplierId) {
      alert("Vui lòng chọn supplier trước");
      return;
    }

    const exist = items.find((i) => i.productId === product.id);
    if (exist) return;

    setItems([
      ...items,
      {
        productId: product.id,
        name: product.name,
        imageUrl: product.imageUrl,
        quantity: 1,
        importPrice: 0,
      },
    ]);
  };

  const handleChange = (productId, field, value) => {
    setItems(
      items.map((i) =>
        i.productId === productId
          ? { ...i, [field]: Number(value) }
          : i
      )
    );
  };

  const handleRemove = (productId) => {
    setItems(items.filter((i) => i.productId !== productId));
  };

  const totalAmount = items.reduce(
    (sum, i) => sum + i.quantity * i.importPrice,
    0
  );

  const handleSubmit = () => {
    if (!supplierId) {
      alert("Chọn supplier");
      return;
    }

    if (items.length === 0) {
      alert("Chưa có sản phẩm");
      return;
    }

   dispatch(
  createImportOrder({
    supplierId,
    note: "Nhập hàng từ nhà cung cấp",
    importDetails: items.map((i) => ({
      productId: i.productId,
      quantity: i.quantity,
      importPrice: i.importPrice,
    })),
  })
)
  .unwrap()
  .then(() => {
    alert("Tạo đơn thành công");
    navigate("/dashboard/import-orders");
  })
  .catch((err) => {
    alert(err.message || "Tạo đơn thất bại");
  });
  };

  return (
    <div className="mt-12 mb-8">
      <Card>
        <CardHeader variant="gradient" color="blue" className="mb-8 p-6">
          <Typography variant="h6" color="white">
            Create Import Order
          </Typography>
          
        </CardHeader>

        <CardBody className="grid grid-cols-2 gap-6">

          {/* LEFT - Product list */}
          <div>
            <Typography variant="h6" className="mb-4">
              Products
            </Typography>

            {!supplierId && (
              <Typography color="red" className="text-sm mb-4">
                Hãy chọn supplier trước khi thêm sản phẩm
              </Typography>
            )}

            <div className="max-h-[450px] overflow-y-auto">
              {supplierId &&
                products?.map((p) => (
                  <div
                    key={p.id}
                    className="flex justify-between items-center border-b py-3"
                  >
                    <div className="flex gap-3 items-center">
                      <Avatar src={p.imageUrl} size="sm" />
                      <Typography className="text-sm">
                        {p.name}
                      </Typography>
                    </div>

                    <Button
                      size="sm"
                      color="green"
                      onClick={() => handleAddProduct(p)}
                    >
                      Add
                    </Button>
                  </div>
                ))}
            </div>
          </div>

          {/* RIGHT - Order table */}
          <div>

            <div className="mb-4">
              <Select
                label="Select Supplier"
                value={supplierId}
                onChange={(val) => setSupplierId(val)}
              >
                {suppliers?.map((s) => (
                  <Option key={s.id} value={s.id}>
                    {s.name}
                  </Option>
                ))}
              </Select>
            </div>

            <table className="w-full table-auto">
              <thead>
                <tr>
                  {["Product", "Import Price", "Qty", "Total", ""].map((h) => (
                    <th
                      key={h}
                      className="text-xs text-left py-2 uppercase text-blue-gray-400"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {items.map((i) => (
                  <tr key={i.productId} className="border-b">
                    <td className="py-2 text-sm">{i.name}</td>

                    <td className="py-2">
                      <Input
                        type="number"
                        value={i.importPrice}
                        onChange={(e) =>
                          handleChange(i.productId, "importPrice", e.target.value)
                        }
                      />
                    </td>

                    <td className="py-2">
                      <Input
                        type="number"
                        value={i.quantity}
                        onChange={(e) =>
                          handleChange(i.productId, "quantity", e.target.value)
                        }
                      />
                    </td>

                    <td className="py-2 text-sm">
                      {(i.quantity * i.importPrice).toLocaleString()} đ
                    </td>

                    <td>
                      <button
                        onClick={() => handleRemove(i.productId)}
                        className="text-red-500 text-xs"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-between mt-6">
              <Typography variant="h6">
                Total:
              </Typography>
              <Typography variant="h6" color="green">
                {totalAmount.toLocaleString()} đ
              </Typography>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <Button color="blue" onClick={handleSubmit}>
                Create
              </Button>
                    <Button variant="outlined" onClick={() => navigate(-1)}>
                Cancel
              </Button>
            </div>

          </div>

        </CardBody>
      </Card>
    </div>
  );
}

export default ImportOrderCreate;