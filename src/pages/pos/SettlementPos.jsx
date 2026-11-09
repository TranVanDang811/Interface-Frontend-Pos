import React, { useState, useMemo, useEffect } from "react";
import { Card, Input, Button, Typography } from "@material-tailwind/react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { closeShift, exportShiftReport } from "@/features/shift/shiftThunks";
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
const [modal, setModal] = useState({
  open: false,
  htmlContent: "",
});
const ThermalReceipt = ({ html }) => {
  if (!html) return null;
  return (
    <div
      className="w-[260px] text-[11px] font-mono bg-white mx-auto"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};
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
    const res = await dispatch(
      closeShift({
        ...cash,
        totalCash: totalAmount,
      })
    ).unwrap();

    // 👉 Nếu không có shiftCode -> coi như lỗi logic
    if (!res || !res.shiftCode) {
      throw new Error("Không có ca đang mở");
    }

    dispatch(
      showAlert({
        type: "green",
        message: "Đóng ca thành công",
      })
    );

    const shiftCode = res.shiftCode;

    // 👉 export chỉ khi closeShift OK
    const html = await dispatch(exportShiftReport(shiftCode)).unwrap();

    setModal({
      open: true,
      htmlContent: html,
    });

  } catch (err) {
    console.error("Close shift error:", err);

    // 👉 Handle nhiều kiểu lỗi backend
    let message = "Đóng ca thất bại";

    if (typeof err === "string") {
      message = err;
    } else if (err?.message) {
      message = err.message;
    } else if (err?.response?.data?.message) {
      message = err.response.data.message;
    }

    // 👉 custom lỗi không có ca
    if (message.toLowerCase().includes("shift") || message.includes("ca")) {
      message = "Hiện tại không có ca đang mở";
    }

    dispatch(
      showAlert({
        type: "red",
        message,
      })
    );
  }
};
useEffect(() => {
  if (modal.open) {
    document.body.style.overflow = "hidden";
    document.body.style.width = "100%";
  } else {
    document.body.style.overflow = "";
    document.body.style.width = "";
  }
  return () => {
    document.body.style.overflow = "";
    document.body.style.width = "";
  };
}, [modal.open]);
window.onerror = function (message, source, lineno, colno, error) {
  console.error("Global error:", error);
};
const handlePrint = () => {
  const w = window.open("", "", "width=300,height=600");
  w.document.write(`<body style="font-family:monospace">${modal.htmlContent}</body>`);
  w.document.close();
  w.print();
  w.close();
};
const handleCloseModal = async () => {
  setModal({ open: false, htmlContent: "" });
  await dispatch(logout());
  navigate("/login");
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
      {modal.open && (
  <div
    onClick={() => setModal({ open: false, htmlContent: "" })}
    className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
  >
    <div
      onClick={(e) => e.stopPropagation()}
      className="bg-white rounded-xl w-[420px] max-h-[90vh] flex flex-col overflow-hidden"
    >
      {/* HEADER */}
      <div className="p-4 border-b">
        <div className="font-semibold">Shift Report</div>
      </div>

      {/* BODY */}
      <div className="p-5 overflow-y-auto text-center">
        <ThermalReceipt html={modal.htmlContent} />
      </div>

      {/* FOOTER */}
      <div className="flex justify-end gap-2 p-4 border-t">
        <button
          onClick={handleCloseModal}
          className="px-4 py-2 border rounded-lg text-sm"
        >
          Đóng
        </button>

        <button
          onClick={handlePrint}
          className="bg-black text-white px-4 py-2 rounded-lg text-sm"
        >
          🖨 In
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
}