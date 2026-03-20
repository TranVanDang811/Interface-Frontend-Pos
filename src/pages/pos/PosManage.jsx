import { Card, CardBody, Typography } from "@material-tailwind/react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

export default function PosManage() {

  const navigate = useNavigate();

 const user = useSelector((state) => state.auth.user);


  const isAdmin = user?.roles?.some(role => role.name === "ADMIN");
  console.log(user);
  
 console.log(isAdmin);
 
  const menus = [
    {
      title: "In lại hóa đơn",
      action: () => navigate("/pos/reprint"),
    },
    {
      title: "Kết toán",
      action: () => navigate("/pos/settlement"),
    },
    {
      title: "Đổi mật khẩu",
      action: () => navigate("/auth/change-password"),
    },
    {
      title: "Logout",
      action: () => {
        localStorage.clear();
        navigate("/login");
      },
    },
    {
      title: "Quay lại POS",
      action: () => navigate("/pos"),
    },

    // chỉ thêm nếu admin
    ...(isAdmin
      ? [
          {
            title: "Dashboard",
            action: () => navigate("/dashboard/home"),
          },
        ]
      : []),
  ];

  return (
    <div className="p-10">
      <Typography variant="h4" className="mb-8 text-center">
        Quản lý POS
      </Typography>

      <div className="grid grid-cols-2 gap-6 max-w-xl mx-auto">
        {menus.map((item, index) => (
          <Card
            key={index}
            onClick={item.action}
            className="cursor-pointer hover:shadow-xl hover:scale-105 transition"
          >
            <CardBody className="flex justify-center items-center h-32">
              <Typography variant="h6">{item.title}</Typography>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}