import React, { useState } from "react";
import { Card, Input, Button, Typography } from "@material-tailwind/react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

import { openShift } from "@/features/shift/shiftThunks";
import { showAlert } from "@/features/alert/alertSlice";

export default function OpenShift() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [openingCash, setOpeningCash] = useState("");
  const [note, setNote] = useState("");

  const handleSubmit = async () => {
    if (!openingCash || Number(openingCash) <= 0) {
      dispatch(
        showAlert({
          type: "red",
          message: "Vui lòng nhập số tiền đầu ca hợp lệ",
        })
      );
      return;
    }

    try {
      const result = await dispatch(
        openShift({
          openingCash: Number(openingCash),
          note,
        })
      ).unwrap();

      dispatch(
        showAlert({
          type: "green",
          message: "Mở ca thành công",
        })
      );

      navigate("/pos");
    } catch (err) {
      dispatch(
        showAlert({
          type: "red",
          message: err || "Không thể mở ca",
        })
      );
    }
  };

  return (
    <section className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md p-8 shadow-xl rounded-2xl">
        {/* Title */}
        <div className="text-center mb-6">
          <Typography variant="h4" className="font-bold">
            Mở ca làm việc
          </Typography>
          <Typography className="text-gray-600 mt-1">
            Nhập số tiền đầu ca trước khi bắt đầu bán hàng
          </Typography>
        </div>

        {/* Form */}
        <div className="flex flex-col gap-5">
          {/* Opening Cash */}
          <div>
            <Typography className="mb-2 font-medium">
              Tiền đầu ca
            </Typography>
            <Input
              type="number"
              min="0"
              value={openingCash}
              onChange={(e) => setOpeningCash(e.target.value)}
              placeholder="Nhập số tiền..."
            />
          </div>

          {/* Note */}
          <div>
            <Typography className="mb-2 font-medium">
              Ghi chú (tuỳ chọn)
            </Typography>
            <Input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ví dụ: Mở ca sáng"
            />
          </div>

          {/* Buttons */}
          <Button color="green" onClick={handleSubmit}>
            Mở ca
          </Button>
        </div>
      </Card>
    </section>
  );
}