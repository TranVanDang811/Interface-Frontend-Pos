import React, { useEffect, useMemo } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Chip,
  Button,
} from "@material-tailwind/react";
import {
  CurrencyDollarIcon,
  ShoppingCartIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  UserGroupIcon,
  UserPlusIcon,
  ExclamationTriangleIcon,
  ArchiveBoxXMarkIcon,
  TruckIcon,
  ArrowRightIcon,
  BuildingStorefrontIcon,
  PlusCircleIcon,
  ClipboardDocumentListIcon,
} from "@heroicons/react/24/solid";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchDashboardReport } from "@/features/report/reportThunks";
import { StatisticsChart } from "@/widgets/charts";
import { formatDateTime } from "@/utils/dateFormat";

export function Home() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { dashboard, loading } = useSelector((state) => state.report);

  useEffect(() => {
    dispatch(fetchDashboardReport());
  }, [dispatch]);

  // Tạo nhãn ngày thực tế cho biểu đồ 7 ngày gần nhất (vd: 30/10, 31/10, ..., Hôm nay)
  const chartCategories = useMemo(() => {
    const categories = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      if (i === 0) {
        categories.push("Hôm nay");
      } else {
        const d = new Date();
        d.setDate(today.getDate() - i);
        const day = String(d.getDate()).padStart(2, "0");
        const month = String(d.getMonth() + 1).padStart(2, "0");
        categories.push(`${day}/${month}`);
      }
    }
    return categories;
  }, []);

  if (loading && !dashboard) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-blue-gray-600 gap-3">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent"></div>
        <Typography variant="h6">Đang tải dữ liệu tổng quan...</Typography>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-500 gap-3">
        <Typography variant="h6">Không tìm thấy dữ liệu thống kê.</Typography>
        <Button size="sm" color="blue" onClick={() => dispatch(fetchDashboardReport())}>
          Tải lại
        </Button>
      </div>
    );
  }

  // ================= CARDS CONFIG =================
  const statCards = [
    {
      title: "Doanh thu hôm nay",
      value: (dashboard.todayRevenue ?? 0).toLocaleString("vi-VN") + " đ",
      subtitle: "Doanh thu thanh toán trong ngày",
      icon: CurrencyDollarIcon,
      bgColor: "bg-emerald-500",
      textColor: "text-emerald-600",
    },
    {
      title: "Đơn hàng hôm nay",
      value: dashboard.todayOrders ?? 0,
      subtitle: "Tổng số đơn đã thanh toán",
      icon: ShoppingCartIcon,
      bgColor: "bg-blue-500",
      textColor: "text-blue-600",
    },
    {
      title: "Lượt khách hôm nay",
      value: dashboard.totalCustomersToday ?? 0,
      subtitle: "Bao gồm khách TV & vãng lai",
      icon: UserGroupIcon,
      bgColor: "bg-indigo-500",
      textColor: "text-indigo-600",
    },
    {
      title: "Thành viên mới",
      value: dashboard.newMembersToday ?? 0,
      subtitle: "Khách hàng đăng ký mới hôm nay",
      icon: UserPlusIcon,
      bgColor: "bg-cyan-500",
      textColor: "text-cyan-600",
    },
    {
      title: "Doanh thu 7 ngày",
      value: (dashboard.weekRevenue ?? 0).toLocaleString("vi-VN") + " đ",
      subtitle: "Tổng thu tuần gần nhất",
      icon: ChartBarIcon,
      bgColor: "bg-amber-500",
      textColor: "text-amber-600",
    },
    {
      title: "Doanh thu tháng này",
      value: (dashboard.monthRevenue ?? 0).toLocaleString("vi-VN") + " đ",
      subtitle: `Tháng ${new Date().getMonth() + 1}/${new Date().getFullYear()}`,
      icon: CalendarDaysIcon,
      bgColor: "bg-purple-500",
      textColor: "text-purple-600",
    },
  ];

  // ================= CHART CONFIG =================
  const chartData = {
    type: "line",
    height: 270,
    series: [
      {
        name: "Doanh thu",
        data: dashboard.revenueLast7Days || [],
      },
    ],
    options: {
      chart: {
        toolbar: { show: false },
      },
      stroke: {
        curve: "smooth",
        width: 3,
      },
      colors: ["#0284c7"],
      markers: {
        size: 4,
        colors: ["#0284c7"],
        strokeColors: "#ffffff",
        strokeWidth: 2,
      },
      xaxis: {
        categories: chartCategories,
        labels: {
          style: {
            colors: "#64748b",
            fontSize: "12px",
            fontWeight: 500,
          },
        },
      },
      yaxis: {
        labels: {
          formatter: (val) => `${(val / 1000).toLocaleString("vi-VN")}k`,
          style: {
            colors: "#64748b",
            fontSize: "11px",
          },
        },
      },
      tooltip: {
        y: {
          formatter: (val) => `${Number(val).toLocaleString("vi-VN")} đ`,
        },
      },
    },
  };

  const getOrderStatusChip = (status) => {
    switch (status) {
      case "PAID":
        return <Chip value="Đã thanh toán" color="green" size="sm" className="font-medium" />;
      case "PENDING":
        return <Chip value="Chờ thanh toán" color="amber" size="sm" className="font-medium" />;
      case "CANCELLED":
        return <Chip value="Đã hủy" color="red" size="sm" className="font-medium" />;
      default:
        return <Chip value={status} color="gray" size="sm" className="font-medium" />;
    }
  };

  return (
    <div className="mt-8 mb-8 space-y-8">
      {/* ================= HEADER & QUICK ACTIONS ================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-blue-gray-900 to-blue-gray-800 p-6 rounded-2xl shadow-lg text-white">
        <div>
          <Typography variant="h5" className="font-bold tracking-tight">
            Bảng Điều Khiển Tổng Quan (Dashboard)
          </Typography>
          <Typography variant="small" className="opacity-80 mt-1">
            Theo dõi tình hình kinh doanh, dòng tiền bán hàng và cảnh báo kho hàng theo thời gian thực
          </Typography>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            color="green"
            className="flex items-center gap-2 shadow-sm font-semibold"
            onClick={() => navigate("/pos")}
          >
            <BuildingStorefrontIcon className="h-4 w-4" />
            Vào POS Bán Hàng
          </Button>

          <Button
            size="sm"
            color="blue"
            className="flex items-center gap-2 shadow-sm font-semibold"
            onClick={() => navigate("/dashboard/import-orders/create")}
          >
            <TruckIcon className="h-4 w-4" />
            + Tạo Phiếu Nhập
          </Button>

          <Button
            size="sm"
            variant="outlined"
            color="white"
            className="flex items-center gap-2 font-semibold"
            onClick={() => navigate("/dashboard/products/add")}
          >
            <PlusCircleIcon className="h-4 w-4" />
            + Thêm Sản Phẩm
          </Button>
        </div>
      </div>

      {/* ================= CẢNH BÁO VẬN HÀNH (KHO & NHẬP HÀNG) ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* CẢNH BÁO TỒN KHO */}
        <Card className="border border-blue-gray-100 shadow-sm hover:shadow-md transition">
          <CardBody className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-red-50 text-red-600">
                <ArchiveBoxXMarkIcon className="h-6 w-6" />
              </div>
              <div>
                <Typography variant="small" className="font-bold text-gray-800">
                  Cảnh báo Tồn kho & Hàng hóa
                </Typography>
                <div className="flex items-center gap-3 mt-1 text-xs">
                  <span className="text-red-600 font-semibold">
                    • Hết hàng: <strong>{dashboard.outOfStockCount || 0}</strong> SP
                  </span>
                  <span className="text-amber-600 font-semibold">
                    • Sắp hết hàng (&le;5): <strong>{dashboard.lowStockCount || 0}</strong> SP
                  </span>
                </div>
              </div>
            </div>

            <Button
              size="sm"
              variant="text"
              color="blue"
              className="flex items-center gap-1 text-xs px-2"
              onClick={() => navigate("/dashboard/products")}
            >
              Xem kho <ArrowRightIcon className="h-3 w-3" />
            </Button>
          </CardBody>
        </Card>

        {/* CẢNH BÁO NHẬP HÀNG */}
        <Card className="border border-blue-gray-100 shadow-sm hover:shadow-md transition">
          <CardBody className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-amber-50 text-amber-600">
                <TruckIcon className="h-6 w-6" />
              </div>
              <div>
                <Typography variant="small" className="font-bold text-gray-800">
                  Cảnh báo Nhập hàng & Quá hạn
                </Typography>
                <div className="flex items-center gap-3 mt-1 text-xs">
                  <span className="text-blue-gray-600 font-medium">
                    • Đang chờ nhận: <strong>{dashboard.pendingImportCount || 0}</strong> đơn
                  </span>
                  <span className={`${dashboard.overdueImportCount > 0 ? "text-red-600 font-bold bg-red-50 px-1.5 py-0.5 rounded" : "text-gray-500"}`}>
                    • Quá 3 ngày (NCC chưa giao): <strong>{dashboard.overdueImportCount || 0}</strong> đơn
                  </span>
                </div>
              </div>
            </div>

            <Button
              size="sm"
              variant="text"
              color="blue"
              className="flex items-center gap-1 text-xs px-2"
              onClick={() => navigate("/dashboard/import-orders")}
            >
              Xử lý <ArrowRightIcon className="h-3 w-3" />
            </Button>
          </CardBody>
        </Card>
      </div>

      {/* ================= 6 THẺ CHỈ SỐ DOANH THU & KHÁCH HÀNG ================= */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {statCards.map((card, index) => {
          const Icon = card.icon;

          return (
            <Card key={index} className="border border-blue-gray-100 shadow-sm hover:shadow-md transition">
              <CardBody className="p-4 flex flex-col justify-between h-full">
                <div className="flex items-center justify-between mb-2">
                  <Typography variant="small" className="text-xs font-semibold text-blue-gray-600">
                    {card.title}
                  </Typography>
                  <div className={`p-2 rounded-lg ${card.bgColor} text-white shadow-sm`}>
                    <Icon className="h-4 w-4" />
                  </div>
                </div>

                <div>
                  <Typography variant="h5" className="font-bold text-gray-900 tracking-tight">
                    {card.value}
                  </Typography>
                  <Typography variant="small" className="text-[11px] text-gray-500 mt-0.5 truncate" title={card.subtitle}>
                    {card.subtitle}
                  </Typography>
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>

      {/* ================= BIỂU ĐỒ DOANH THU + TOP SẢN PHẨM ================= */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Biểu đồ doanh thu 7 ngày */}
        <Card className="xl:col-span-2 border border-blue-gray-100 shadow-sm">
          <CardHeader floated={false} shadow={false} className="p-4 border-b flex items-center justify-between">
            <div>
              <Typography variant="h6" color="blue-gray" className="font-bold">
                Doanh Thu 7 Ngày Gần Nhất
              </Typography>
              <Typography variant="small" className="text-gray-500 text-xs">
                Biểu đồ xu hướng biến động doanh thu theo từng ngày
              </Typography>
            </div>
            <div className="flex items-center gap-1 text-xs text-blue-600 font-semibold bg-blue-50 px-2.5 py-1 rounded-full">
              <ChartBarIcon className="h-3.5 w-3.5" />
              Tuần hiện tại
            </div>
          </CardHeader>

          <CardBody className="pt-2">
            <StatisticsChart
              title=""
              description=""
              chart={chartData}
              footer={
                <div className="flex items-center justify-between text-xs text-gray-500 w-full">
                  <span>Cập nhật mới nhất lúc {new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}</span>
                  <span className="font-semibold text-blue-600 cursor-pointer hover:underline" onClick={() => dispatch(fetchDashboardReport())}>
                    Làm mới
                  </span>
                </div>
              }
            />
          </CardBody>
        </Card>

        {/* Top sản phẩm bán chạy hôm nay */}
        <Card className="border border-blue-gray-100 shadow-sm">
          <CardHeader floated={false} shadow={false} className="p-4 border-b flex items-center justify-between">
            <div>
              <Typography variant="h6" color="blue-gray" className="font-bold">
                Top Sản Phẩm Hôm Nay
              </Typography>
              <Typography variant="small" className="text-gray-500 text-xs">
                Mặt hàng có số lượng bán nhiều nhất
              </Typography>
            </div>
            <span className="text-xs bg-amber-50 text-amber-700 font-bold px-2 py-0.5 rounded-full">
              Hôm nay
            </span>
          </CardHeader>

          <CardBody className="p-4 space-y-3 max-h-[380px] overflow-y-auto">
            {(!dashboard.topProductsToday || dashboard.topProductsToday.length === 0) ? (
              <div className="text-center py-10 text-gray-400 text-sm">
                Chưa có sản phẩm nào được bán trong ngày
              </div>
            ) : (
              dashboard.topProductsToday.map((p, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-2.5 rounded-lg border border-gray-100 hover:bg-gray-50/70 transition"
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      index === 0 ? "bg-amber-500 text-white" :
                      index === 1 ? "bg-gray-400 text-white" :
                      index === 2 ? "bg-amber-700 text-white" : "bg-gray-100 text-gray-700"
                    }`}>
                      {index + 1}
                    </span>
                    <div>
                      <Typography className="text-xs font-bold text-gray-900 line-clamp-1">
                        {p.productName}
                      </Typography>
                      <Typography variant="small" className="text-[11px] text-gray-500 font-medium">
                        Số lượng đã bán: <strong className="text-blue-600">{p.quantity}</strong>
                      </Typography>
                    </div>
                  </div>

                  <Typography className="text-xs font-bold text-emerald-600 whitespace-nowrap">
                    {Number(p.revenue).toLocaleString("vi-VN")} đ
                  </Typography>
                </div>
              ))
            )}
          </CardBody>
        </Card>
      </div>

      {/* ================= ĐƠN HÀNG GẦN ĐÂY ================= */}
      <Card className="border border-blue-gray-100 shadow-sm">
        <CardHeader floated={false} shadow={false} className="p-4 border-b flex items-center justify-between">
          <div>
            <Typography variant="h6" color="blue-gray" className="font-bold">
              Đơn Hàng Gần Đây
            </Typography>
            <Typography variant="small" className="text-gray-500 text-xs">
              5 đơn hàng phát sinh gần nhất từ quầy thu ngân
            </Typography>
          </div>

          <Button
            size="sm"
            variant="outlined"
            color="blue"
            className="text-xs py-1.5 px-3 flex items-center gap-1"
            onClick={() => navigate("/dashboard/orders-history")}
          >
            Xem tất cả đơn hàng <ArrowRightIcon className="h-3 w-3" />
          </Button>
        </CardHeader>

        <CardBody className="p-0 overflow-x-auto">
          {(!dashboard.recentOrders || dashboard.recentOrders.length === 0) ? (
            <div className="text-center py-8 text-gray-400 text-sm">
              Chưa có đơn hàng nào phát sinh gần đây
            </div>
          ) : (
            <table className="w-full text-left min-w-[600px]">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-3 text-xs font-bold text-gray-600 uppercase">Mã đơn hàng</th>
                  <th className="px-6 py-3 text-xs font-bold text-gray-600 uppercase text-right">Tổng tiền</th>
                  <th className="px-6 py-3 text-xs font-bold text-gray-600 uppercase text-center">Trạng thái</th>
                  <th className="px-6 py-3 text-xs font-bold text-gray-600 uppercase text-right">Thời gian tạo</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {dashboard.recentOrders.map((order, index) => (
                  <tr key={index} className="hover:bg-blue-gray-50/50 transition">
                    <td className="px-6 py-3.5">
                      <Typography className="text-xs font-bold text-blue-600">
                        {order.orderCode}
                      </Typography>
                    </td>

                    <td className="px-6 py-3.5 text-right">
                      <Typography className="text-xs font-bold text-emerald-600">
                        {Number(order.amount).toLocaleString("vi-VN")} đ
                      </Typography>
                    </td>

                    <td className="px-6 py-3.5 text-center">
                      {getOrderStatusChip(order.status)}
                    </td>

                    <td className="px-6 py-3.5 text-right">
                      <Typography className="text-xs text-gray-500">
                        {formatDateTime(order.createdAt)}
                      </Typography>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

export default Home;
