import React, { useState } from "react";
import { Card, Input, Button, Typography, Select, Option } from "@material-tailwind/react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

import { openShift } from "@/features/shift/shiftThunks";
import { showAlert } from "@/features/alert/alertSlice";

export default function OpenShift() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // default tiền
  const [openingCash, setOpeningCash] = useState(1765000);

  // chọn option
  const [shiftOption, setShiftOption] = useState("A");

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

    // ✅ gộp option vào note
    const finalNote = `Ca ${shiftOption}${note ? " - " + note : ""}`;

    try {
      await dispatch(
        openShift({
          openingCash: Number(openingCash),
          note: finalNote,
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
        
        <div className="text-center mb-6">
          <Typography variant="h4" className="font-bold">
            Mở ca làm việc
          </Typography>
          <Typography className="text-gray-600 mt-1">
            Nhập số tiền đầu ca trước khi bắt đầu bán hàng
          </Typography>
        </div>

        <div className="flex flex-col gap-5">
          
          {/* Option A B C */}
          <div>
            <Typography className="mb-2 font-medium">
              Chọn ca
            </Typography>
            <Select value={shiftOption} onChange={(val) => setShiftOption(val)}>
              <Option value="A">Ca A - Ca sáng</Option>
              <Option value="B">Ca B - Ca chiều</Option>
              <Option value="C">Ca C - Ca tối</Option>
            </Select>
          </div>

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
            />
          </div>

  

          <Button color="green" onClick={handleSubmit}>
            Mở ca
          </Button>
        </div>
      </Card>
    </section>
  );
}