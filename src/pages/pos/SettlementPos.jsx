import React, { useState, useMemo } from "react";
import { Card, Input, Button, Typography } from "@material-tailwind/react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { closeShift } from "@/features/shift/shiftThunks";
import { showAlert } from "@/features/alert/alertSlice";
import { logout } from "@/features/auth/authThunks";

const denominations = [
  { label: "500,000", value: 500000, key: "note500k" },
  { label: "200,000", value: 200000, key: "note200k" },
  { label: "100,000", value: 100000, key: "note100k" },
  { label: "50,000", value: 50000, key: "note50k" },
  { label: "20,000", value: 20000, key: "note20k" },
  { label: "10,000", value: 10000, key: "note10k" },
  { label: "5,000", value: 5000, key: "note5k" },
  { label: "2,000", value: 2000, key: "note2k" },
  { label: "1,000", value: 1000, key: "note1k" },
];

export default function SettlementPos() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [cash, setCash] = useState({
    note500k: 0,
    note200k: 0,
    note100k: 0,
    note50k: 0,
    note20k: 0,
    note10k: 0,
    note5k: 0,
    note2k: 0,
    note1k: 0,
  });

  // 👉 Tính tổng tiền
  const totalAmount = useMemo(() => {
    return denominations.reduce((sum, item) => {
      return sum + (cash[item.key] || 0) * item.value;
    }, 0);
  }, [cash]);

  // 👉 Handle input
  const handleChange = (key, value) => {
    setCash((prev) => ({
      ...prev,
      [key]: Number(value) || 0,
    }));
  };

  // 👉 Submit close shift
  const handleSubmit = async () => {
    try {
      await dispatch(
        closeShift({
          ...cash,
          totalCash: totalAmount,
        })
      ).unwrap();

      dispatch(
        showAlert({
          type: "green",
          message: "Đóng ca thành công",
        })
      );

        
    await dispatch(logout()).unwrap();

    navigate("/login");
    } catch (err) {
      dispatch(
        showAlert({
          type: "red",
          message: err || "Đóng ca thất bại",
        })
      );
    }
  };

  return (
    <div className="p-6 flex justify-center">
      <Card className="w-full max-w-3xl p-6 shadow-xl rounded-2xl">
        <Typography variant="h4" className="mb-6 text-center font-bold">
          Kiểm tiền cuối ca
        </Typography>

        <div className="grid grid-cols-2 gap-4">
          {denominations.map((item) => (
            <React.Fragment key={item.key}>
              {/* Bên trái: mệnh giá */}
              <div className="flex items-center font-medium">
                {item.label} đ
              </div>

              {/* Bên phải: input */}
              <Input
                type="number"
                min="0"
                value={cash[item.key]}
                onChange={(e) =>
                  handleChange(item.key, e.target.value)
                }
                label="Số lượng"
              />
            </React.Fragment>
          ))}
        </div>

        {/* 👉 Tổng tiền */}
        <div className="mt-6 text-right">
          <Typography variant="h5" className="font-bold">
            Tổng: {totalAmount.toLocaleString()} đ
          </Typography>
        </div>

        {/* 👉 Buttons */}
        <div className="mt-6 flex justify-between">
          <Button
            color="gray"
            onClick={() => navigate(-1)}
          >
            Quay lại
          </Button>

          <Button
            color="green"
            onClick={handleSubmit}
          >
            Lưu
          </Button>
        </div>
      </Card>
    </div>
  );
}