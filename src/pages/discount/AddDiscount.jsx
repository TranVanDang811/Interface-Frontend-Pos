import {
  Card,
  CardBody,
  Typography,
  Input,
  Button,
} from "@material-tailwind/react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createDiscount } from "@/features/discount/discountThunks";
import { useNavigate } from "react-router-dom";
import { ArrowLeftIcon, TicketIcon } from "@heroicons/react/24/solid";

export default function AddDiscount() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.discount);

  const [form, setForm] = useState({
    code: "",
    name: "",
    value: "",
    startDate: "",
    endDate: "",
    active: true,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]:
        type === "checkbox"
          ? checked
          : name === "code"
          ? value.toUpperCase().replace(/\s+/g, "")
          : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.code.trim()) {
      alert("Vui lòng nhập Mã khuyến mãi (Voucher Code)!");
      return;
    }
    if (!form.name.trim()) {
      alert("Vui lòng nhập Tên chương trình khuyến mãi!");
      return;
    }
    const valNum = Number(form.value);
    if (isNaN(valNum) || valNum <= 0) {
      alert("Vui lòng nhập Số tiền giảm giá hợp lệ (> 0 VNĐ)!");
      return;
    }
    if (!form.startDate || !form.endDate) {
      alert("Vui lòng chọn Ngày bắt đầu và Ngày kết thúc!");
      return;
    }
    if (new Date(form.startDate) > new Date(form.endDate)) {
      alert("Ngày kết thúc phải diễn ra sau Ngày bắt đầu!");
      return;
    }

    const payload = {
      ...form,
      code: form.code.trim(),
      name: form.name.trim(),
      value: valNum,
      startDate: form.startDate.length === 16 ? `${form.startDate}:00` : form.startDate,
      endDate: form.endDate.length === 16 ? `${form.endDate}:00` : form.endDate,
    };

    const resultAction = await dispatch(createDiscount(payload));

    if (createDiscount.fulfilled.match(resultAction)) {
      alert("Thêm mã khuyến mãi thành công!");
      navigate("/dashboard/discounts");
    } else {
      alert(
        "Thêm mã thất bại: " +
          (resultAction.payload?.message || resultAction.payload || "Mã code đã tồn tại")
      );
    }
  };

  return (
    <div className="mt-8 flex justify-center">
      <Card className="w-full max-w-xl border border-blue-gray-100 shadow-sm">
        <CardBody className="flex flex-col gap-5 p-6">
          <div className="flex items-center justify-between border-b pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <TicketIcon className="w-6 h-6" />
              </div>
              <div>
                <Typography variant="h5" color="blue-gray" className="font-bold">
                  Thêm Mã Khuyến Mãi Mới
                </Typography>
                <Typography variant="small" className="text-gray-500 text-xs">
                  Tạo voucher ưu đãi giảm trừ tiền mặt cho đơn hàng
                </Typography>
              </div>
            </div>

            <Button
              size="sm"
              variant="text"
              color="gray"
              className="flex items-center gap-1.5 normal-case text-xs"
              onClick={() => navigate(-1)}
            >
              <ArrowLeftIcon className="w-3.5 h-3.5" />
              Quay lại
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Mã Khuyến Mãi (Code) *"
              name="code"
              placeholder="VD: GIAM20K, CHAOHEXIN"
              value={form.code}
              onChange={handleChange}
              required
            />

            <Input
              label="Tên Chương Trình *"
              name="name"
              placeholder="VD: Giảm giá mừng khai trương"
              value={form.name}
              onChange={handleChange}
              required
            />

            <div>
              <Input
                label="Giá Trị Giảm Tiền Mặt (VNĐ) *"
                name="value"
                type="number"
                min="1"
                step="1000"
                placeholder="VD: 20000, 50000"
                value={form.value}
                onChange={handleChange}
                required
              />
              {Number(form.value) > 0 && (
                <div className="text-[11px] font-bold text-emerald-700 mt-1 pl-1">
                  Mức giảm: {Number(form.value).toLocaleString("vi-VN")} đ
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Ngày Giờ Bắt Đầu *"
                name="startDate"
                type="datetime-local"
                value={form.startDate}
                onChange={handleChange}
                required
              />

              <Input
                label="Ngày Giờ Kết Thúc *"
                name="endDate"
                type="datetime-local"
                value={form.endDate}
                onChange={handleChange}
                required
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer pt-1">
              <input
                type="checkbox"
                name="active"
                checked={form.active}
                onChange={handleChange}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="text-xs font-semibold text-gray-800">
                Kích hoạt mã khuyến mãi ngay sau khi tạo
              </span>
            </label>

            <div className="flex justify-end gap-3 pt-3 border-t">
              <Button
                variant="outlined"
                color="gray"
                size="sm"
                className="normal-case text-xs"
                onClick={() => navigate(-1)}
              >
                Hủy bỏ
              </Button>

              <Button
                type="submit"
                color="blue"
                size="sm"
                disabled={loading}
                className="normal-case text-xs font-semibold shadow-sm px-5"
              >
                {loading ? "Đang xử lý..." : "Tạo Mã Khuyến Mãi"}
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
