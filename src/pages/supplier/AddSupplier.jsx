import {
  Card,
  CardBody,
  Typography,
  Button,
} from "@material-tailwind/react";

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createSupplier } from "@/features/supplier/supplierThunks";
import { useNavigate } from "react-router-dom";
import {
  TruckIcon,
  ArrowLeftIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/solid";

export default function AddSupplier() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading } = useSelector((state) => state.supplier);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
  });
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("Vui lòng nhập tên nhà cung cấp!");
      return;
    }

    try {
      const resultAction = await dispatch(
        createSupplier({
          name: form.name.trim(),
          phone: form.phone.trim(),
          email: form.email.trim(),
          address: form.address.trim(),
        })
      );

      if (createSupplier.fulfilled.match(resultAction)) {
        navigate("/dashboard/suppliers");
      } else {
        setError(
          resultAction.payload?.message ||
            "Thêm nhà cung cấp thất bại. Tên nhà cung cấp có thể đã tồn tại."
        );
      }
    } catch (err) {
      setError("Đã xảy ra lỗi kết nối máy chủ!");
    }
  };

  return (
    <div className="mt-8 mb-12 flex justify-center px-4">
      <Card className="w-full max-w-2xl border border-gray-100 shadow-sm rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100 bg-gray-50/50">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
            <TruckIcon className="h-6 w-6" />
          </div>
          <div>
            <Typography variant="h5" color="blue-gray" className="font-bold">
              Thêm Nhà cung cấp Mới
            </Typography>
            <Typography variant="small" className="text-gray-500 font-normal">
              Đăng ký thông tin nhà phân phối đối tác trong chuỗi cung ứng
            </Typography>
          </div>
        </div>

        {/* Body */}
        <CardBody className="p-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {error && (
              <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
                <ExclamationTriangleIcon className="h-4 w-4 shrink-0 mt-0.5 text-red-500" />
                <span>{error}</span>
              </div>
            )}

            {/* Supplier Name */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                Tên Nhà cung cấp <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                required
                placeholder="Ví dụ: Công ty Cổ phần Thực phẩm ABC, Vinamilk..."
                value={form.name}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
              />
              <span className="text-[11px] text-gray-400 mt-1 block">
                Tên nhà cung cấp phải là duy nhất trong hệ thống.
              </span>
            </div>

            {/* Phone & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                  Số điện thoại
                </label>
                <input
                  type="text"
                  name="phone"
                  placeholder="0912 345 678"
                  value={form.phone}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                  Email liên hệ
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="lienhe@doitac.vn"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                Địa chỉ trụ sở / kho bãi
              </label>
              <textarea
                name="address"
                rows={4}
                placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố..."
                value={form.address}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-gray-100">
              <Button
                type="button"
                variant="outlined"
                color="blue-gray"
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 normal-case font-semibold border-gray-300 text-gray-700"
              >
                <ArrowLeftIcon className="h-4 w-4" />
                Quay lại
              </Button>

              <Button
                type="submit"
                color="blue"
                disabled={loading}
                className="flex items-center gap-2 normal-case font-semibold shadow-md shadow-blue-500/20"
              >
                {loading && <ArrowPathIcon className="h-4 w-4 animate-spin" />}
                {loading ? "Đang lưu..." : "Tạo nhà cung cấp"}
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
