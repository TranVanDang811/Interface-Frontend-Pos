import React, { useEffect } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Chip,
} from "@material-tailwind/react";

import {
  CurrencyDollarIcon,
  ShoppingCartIcon,
  CalendarDaysIcon,
  ChartBarIcon,
} from "@heroicons/react/24/solid";

import { useDispatch, useSelector } from "react-redux";
import { fetchDashboardReport } from "@/features/report/reportThunks";

import { StatisticsChart } from "@/widgets/charts";

export function Home() {
  const dispatch = useDispatch();
  const { dashboard, loading } = useSelector((state) => state.report);

  useEffect(() => {
    dispatch(fetchDashboardReport());
  }, [dispatch]);

  if (loading) {
    return (
      <div className="flex justify-center mt-20 text-lg font-semibold">
        Loading dashboard...
      </div>
    );
  }

  if (!dashboard) return null;

  // ================= CARDS =================

  const cards = [
    {
      title: "Today's Revenue",
      value: dashboard.todayRevenue.toLocaleString() + " VND",
      icon: CurrencyDollarIcon,
      color: "green",
    },
    {
      title: "Week Revenue",
      value: dashboard.weekRevenue.toLocaleString() + " VND",
      icon: ChartBarIcon,
      color: "blue",
    },
    {
      title: "Month Revenue",
      value: dashboard.monthRevenue.toLocaleString() + " VND",
      icon: CalendarDaysIcon,
      color: "purple",
    },
    {
      title: "Orders Today",
      value: dashboard.todayOrders,
      icon: ShoppingCartIcon,
      color: "orange",
    },
  ];

  // ================= CHART =================

  const chartData = {
    type: "line",
    height: 260,
    series: [
      {
        name: "Revenue",
        data: dashboard.revenueLast7Days,
      },
    ],
    options: {
      chart: {
        toolbar: { show: false },
      },
      stroke: {
        curve: "smooth",
      },
      xaxis: {
        categories: ["-6d", "-5d", "-4d", "-3d", "-2d", "-1d", "Today"],
      },
    },
  };

  return (
    <div className="mt-10 space-y-8">

      {/* ================= STATISTICS ================= */}

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card, index) => {
          const Icon = card.icon;

          return (
            <Card key={index} className="shadow-md hover:shadow-lg transition">
              <CardBody className="flex items-center justify-between">

                <div>
                  <Typography variant="small" className="text-blue-gray-500">
                    {card.title}
                  </Typography>

                  <Typography variant="h5" className="font-bold mt-1">
                    {card.value}
                  </Typography>
                </div>

                <div
                  className={`p-3 rounded-full bg-${card.color}-500`}
                >
                  <Icon className="h-6 w-6 text-white" />
                </div>

              </CardBody>
            </Card>
          );
        })}
      </div>

      {/* ================= CHART + TOP PRODUCTS ================= */}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Chart */}

        <Card className="xl:col-span-2 shadow-md">
          <CardHeader floated={false} shadow={false}>
            <Typography variant="h6">Revenue Last 7 Days</Typography>
          </CardHeader>

          <CardBody>
            <StatisticsChart
              title=""
              description=""
              chart={chartData}
              footer="Updated just now"
            />
          </CardBody>
        </Card>

        {/* Top Products */}

        <Card className="shadow-md">
          <CardHeader floated={false} shadow={false}>
            <Typography variant="h6">Top Products Today</Typography>
          </CardHeader>

          <CardBody className="space-y-4">
            {dashboard.topProductsToday.map((p, index) => (
              <div
                key={index}
                className="flex justify-between items-center border-b pb-2"
              >
                <div>
                  <Typography className="font-medium">
                    {p.productName}
                  </Typography>

                  <Typography variant="small" className="text-blue-gray-500">
                    Qty: {p.quantity}
                  </Typography>
                </div>

                <Typography className="font-semibold text-green-600">
                  {Number(p.revenue).toLocaleString()} VND
                </Typography>
              </div>
            ))}
          </CardBody>
        </Card>

      </div>

      {/* ================= RECENT ORDERS ================= */}

      <Card className="shadow-md">
        <CardHeader floated={false} shadow={false}>
          <Typography variant="h6">Recent Orders</Typography>
        </CardHeader>

        <CardBody className="px-0">

          <table className="w-full text-left">

            <thead className="bg-blue-gray-50">
              <tr>
                <th className="px-6 py-3">Order</th>
                <th className="px-6 py-3">Amount</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Created</th>
              </tr>
            </thead>

            <tbody>
              {dashboard.recentOrders.map((order, index) => (
                <tr key={index} className="border-b hover:bg-blue-gray-50">

                  <td className="px-6 py-3 font-medium">
                    {order.orderCode}
                  </td>

                  <td className="px-6 py-3">
                    {Number(order.amount).toLocaleString()} VND
                  </td>

                  <td className="px-6 py-3">
                    <Chip
                      value={order.status}
                      color={order.status === "PAID" ? "green" : "orange"}
                      size="sm"
                    />
                  </td>

                  <td className="px-6 py-3 text-blue-gray-500">
                    {new Date(order.createdAt).toLocaleString()}
                  </td>

                </tr>
              ))}
            </tbody>

          </table>

        </CardBody>
      </Card>

    </div>
  );
}

export default Home;