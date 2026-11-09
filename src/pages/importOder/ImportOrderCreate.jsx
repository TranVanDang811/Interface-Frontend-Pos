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
import { fetchProductsBySupplier } from "@/features/product/productThunks";
import { createImportOrder } from "@/features/importOrder/importOrderThunks";
import { fetchSuppliers } from "@/features/supplier/supplierThunks";
import { useNavigate } from "react-router-dom";

export function ImportOrderCreate() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { list: products } = useSelector((s) => s.product);
  const { list: suppliers } = useSelector((s) => s.supplier);

  const [supplierId, setSupplierId] = useState("");
  const [note, setNote] = useState("");
  const [items, setItems] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchSuppliers({ page: 1, size: 100 }));
  }, [dispatch]);

  useEffect(() => {
    if (supplierId) {
      dispatch(fetchProductsBySupplier(supplierId));
      setItems([]);
    }
  }, [supplierId, dispatch]);

  const handleAddProduct = (product) => {
    if (!supplierId) {
      alert("Vui lòng chọn nhà cung cấp trước!");
      return;
    }

    const exist = items.find((i) => i.productId === product.id);
    if (exist) {
      // Tăng số lượng nếu đã có trong danh sách
      setItems(
        items.map((i) =>
          i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i
        )
      );
      return;
    }

    setItems([
      ...items,
      {
        productId: product.id,
        name: product.name,
        imageUrl: product.imageUrl,
        quantity: 1,
        importPrice: product.cost || 0,
      },
    ]);
  };

  const handleChange = (productId, field, value) => {
    const num = Math.max(0, Number(value) || 0);
    setItems(
      items.map((i) =>
        i.productId === productId ? { ...i, [field]: num } : i
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

  const handleSubmit = async () => {
    if (!supplierId) return alert("Vui lòng chọn nhà cung cấp");
    if (items.length === 0) return alert("Vui lòng thêm ít nhất một sản phẩm vào đơn nhập");

    const invalidItem = items.find((i) => i.quantity <= 0);
    if (invalidItem) {
      return alert(`Sản phẩm "${invalidItem.name}" phải có số lượng nhập lớn hơn 0`);
    }

    setSubmitting(true);
    try {
      await dispatch(
        createImportOrder({
          supplierId,
          note: note.trim() || "Nhập hàng từ nhà cung cấp",
          importDetails: items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
            importPrice: i.importPrice,
          })),
        })
      ).unwrap();

      alert("Tạo phiếu nhập hàng thành công!");
      navigate("/dashboard/import-orders");
    } catch (err) {
      alert(err.message || "Tạo phiếu nhập hàng thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-8 mb-12">
      <Card className="shadow-xl border border-gray-200">
        <CardHeader
          floated={false}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 flex justify-between items-center"
        >
          <div>
            <Typography variant="h5" color="white">
              Tạo Phiếu Nhập Hàng Mới
            </Typography>
            <Typography variant="small" color="white" className="opacity-80">
              Chọn nhà cung cấp, thêm mặt hàng và thiết lập số lượng / giá nhập
            </Typography>
          </div>
          <Button
            size="sm"
            variant="outlined"
            color="white"
            onClick={() => navigate("/dashboard/import-orders")}
          >
            Quay lại danh sách
          </Button>
        </CardHeader>

        <CardBody className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-6 p-6">
          {/* CỘT TRÁI: DANH SÁCH SẢN PHẨM CỦA NCC */}
          <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200 flex flex-col">
            <Typography variant="h6" className="mb-2 text-gray-800">
              Sản phẩm của nhà cung cấp
            </Typography>

            {!supplierId ? (
              <div className="p-6 text-center text-sm text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
                Vui lòng chọn <strong>Nhà cung cấp</strong> ở bên phải trước để xem danh mục sản phẩm.
              </div>
            ) : products?.length === 0 ? (
              <div className="p-6 text-center text-sm text-gray-500 bg-white rounded-xl">
                Nhà cung cấp này chưa có sản phẩm nào.
              </div>
            ) : (
              <div className="max-h-[500px] overflow-y-auto space-y-2 pr-1">
                {products?.map((p) => (
                  <div
                    key={p.id}
                    className="flex justify-between items-center bg-white p-3 rounded-xl shadow-sm hover:shadow-md transition border border-gray-100"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar
                        src={p.imageUrl || "https://images.unsplash.com/photo-1544816155-12df9643f363?w=100"}
                        alt={p.name}
                        size="sm"
                        className="border"
                      />
                      <div>
                        <Typography className="text-xs font-bold text-gray-800">
                          {p.name}
                        </Typography>
                        <Typography className="text-[11px] text-gray-500">
                          Giá vốn hiện tại: {(p.cost || 0).toLocaleString()} đ
                        </Typography>
                      </div>
                    </div>

                    <Button
                      size="sm"
                      color="green"
                      className="rounded-lg px-2.5 py-1 text-xs"
                      onClick={() => handleAddProduct(p)}
                      title="Thêm vào phiếu nhập"
                    >
                      + Thêm
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* CỘT PHẢI: THÔNG TIN PHIẾU VÀ BẢNG SẢN PHẨM ĐƯỢC CHỌN */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <Typography variant="small" className="font-semibold text-gray-700 mb-1">
                    Nhà cung cấp <span className="text-red-500">*</span>
                  </Typography>
                  <Select
                    label="Chọn nhà cung cấp"
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

                <div>
                  <Typography variant="small" className="font-semibold text-gray-700 mb-1">
                    Ghi chú phiếu nhập
                  </Typography>
                  <Input
                    placeholder="Ví dụ: Nhập hàng đợt 1 tháng 11..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                </div>
              </div>

              {/* BẢNG CÁC SẢN PHẨM ĐÃ CHỌN */}
              <Typography variant="small" className="font-bold text-gray-800 mb-2">
                Chi tiết các mặt hàng nhập ({items.length})
              </Typography>

              {items.length === 0 ? (
                <div className="p-8 text-center text-sm text-gray-400 border border-dashed rounded-xl bg-gray-50/50">
                  Chưa có sản phẩm nào được chọn. Hãy bấm <strong>+ Thêm</strong> từ danh sách bên trái.
                </div>
              ) : (
                <div className="max-h-[380px] overflow-y-auto border rounded-xl overflow-hidden">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-gray-100 text-gray-700 border-b">
                        <th className="py-2.5 px-3 text-left">Sản phẩm</th>
                        <th className="py-2.5 px-3 text-center w-28">Giá nhập (đ)</th>
                        <th className="py-2.5 px-3 text-center w-24">Số lượng</th>
                        <th className="py-2.5 px-3 text-right">Thành tiền</th>
                        <th className="py-2.5 px-2 text-center w-12"></th>
                      </tr>
                    </thead>

                    <tbody>
                      {items.map((i) => (
                        <tr key={i.productId} className="border-b hover:bg-gray-50/70">
                          <td className="py-2.5 px-3 font-medium text-gray-900">{i.name}</td>

                          <td className="py-2 px-2 text-center">
                            <input
                              type="number"
                              min="0"
                              value={i.importPrice}
                              className="border rounded px-2 py-1 w-24 text-right text-xs font-semibold focus:outline-blue-500"
                              onChange={(e) =>
                                handleChange(i.productId, "importPrice", e.target.value)
                              }
                            />
                          </td>

                          <td className="py-2 px-2 text-center">
                            <input
                              type="number"
                              min="1"
                              value={i.quantity}
                              className="border rounded px-2 py-1 w-20 text-center text-xs font-bold text-blue-700 focus:outline-blue-500"
                              onChange={(e) =>
                                handleChange(i.productId, "quantity", e.target.value)
                              }
                            />
                          </td>

                          <td className="py-2.5 px-3 text-right font-bold text-green-600">
                            {(i.quantity * i.importPrice).toLocaleString()} đ
                          </td>

                          <td className="py-2 px-2 text-center">
                            <button
                              onClick={() => handleRemove(i.productId)}
                              className="text-red-500 hover:text-red-700 text-sm font-bold"
                              title="Xóa mặt hàng này"
                            >
                              ✕
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* PHẦN TỔNG KẾT VÀ NÚT TẠO ĐƠN */}
            <div className="mt-6 pt-4 border-t">
              <div className="p-4 bg-gray-50 rounded-xl flex justify-between items-center border">
                <div>
                  <Typography variant="small" className="text-gray-500">
                    Tổng số lượng: <strong>{items.reduce((s, i) => s + i.quantity, 0)}</strong> sản phẩm
                  </Typography>
                </div>
                <div className="text-right">
                  <span className="text-sm text-gray-500 mr-2">Tổng tiền:</span>
                  <span className="text-2xl font-bold text-green-600">
                    {totalAmount.toLocaleString()} đ
                  </span>
                </div>
              </div>

              <div className="mt-4 flex justify-end gap-3">
                <Button variant="outlined" color="gray" onClick={() => navigate(-1)} disabled={submitting}>
                  Hủy bỏ
                </Button>

                <Button color="blue" onClick={handleSubmit} disabled={submitting || items.length === 0}>
                  {submitting ? "Đang tạo phiếu..." : "Lưu Phiếu Nhập Hàng"}
                </Button>
              </div>
            </div>

          </div>
        </CardBody>
      </Card>
    </div>
  );
}

export default ImportOrderCreate;
