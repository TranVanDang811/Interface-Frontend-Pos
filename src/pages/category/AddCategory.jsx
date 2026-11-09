import {
  Card,
  CardBody,
  Typography,
  Button,
} from "@material-tailwind/react";

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createCategory } from "@/features/category/categoryThunks";
import { useNavigate } from "react-router-dom";
import {
  FolderPlusIcon,
  ArrowLeftIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/solid";

export default function AddCategory() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading } = useSelector((state) => state.category);

  const [form, setForm] = useState({
    name: "",
    description: "",
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
      setError("Vui lòng nhập tên danh mục!");
      return;
    }

    try {
      const resultAction = await dispatch(
        createCategory({
          name: form.name.trim(),
          description: form.description.trim(),
        })
      );

      if (createCategory.fulfilled.match(resultAction)) {
        navigate("/dashboard/categories");
      } else {
        setError(
          resultAction.payload?.message ||
            "Thêm danh mục thất bại. Tên danh mục có thể đã tồn tại."
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
            <FolderPlusIcon className="h-6 w-6" />
          </div>
          <div>
            <Typography variant="h5" color="blue-gray" className="font-bold">
              Thêm Danh mục Mới
            </Typography>
            <Typography variant="small" className="text-gray-500 font-normal">
              Tạo danh mục mới để phân loại và quản lý sản phẩm
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

            {/* Category Name */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                Tên Danh mục <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                required
                placeholder="Ví dụ: Đồ uống, Bánh kẹo, Hàng tiêu dùng..."
                value={form.name}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
              />
              <span className="text-[11px] text-gray-400 mt-1 block">
                Tên danh mục là bắt buộc và phải là duy nhất.
              </span>
            </div>

            {/* Category Description */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                Mô tả Danh mục
              </label>
              <textarea
                name="description"
                rows={4}
                placeholder="Nhập mô tả tóm tắt về danh mục này (tùy chọn)..."
                value={form.description}
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
                {loading ? "Đang lưu..." : "Tạo danh mục"}
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
