import {
  HomeIcon,
  ArchiveBoxIcon,
  CubeIcon,
  TagIcon,
  ArrowDownTrayIcon,
  UserGroupIcon,
  IdentificationIcon,
  UserIcon,
  BanknotesIcon,
  CreditCardIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  TicketIcon,
  Squares2X2Icon,
  BuildingStorefrontIcon,
  ServerStackIcon,
  RectangleStackIcon,
} from "@heroicons/react/24/solid";
import { Home } from "@/pages/dashboard";
import { SignIn, SignUp } from "@/pages/auth";
import Products from "./pages/dashboard/products";
import AddProduct from "./pages/product/AddProduct";
import ImportOrders from "./pages/dashboard/ImportOrders";
import Users from "./pages/dashboard/users";
import Customers from "./pages/customers";
import Payments from "./pages/dashboard/payments";
import Categorys from "./pages/dashboard/categorys";
import Suppliers from "./pages/dashboard/suppliers";
import Discounts from "./pages/dashboard/discounts";
import POS from "./layouts/pos";
import ChangePassword from "./pages/auth/ChangePassword";
import Orders from "./pages/dashboard/orders";
import ProductsHistory from "./pages/dashboard/ProductsHistory";

const icon = {
  className: "w-5 h-5 text-inherit",
};

const subIcon = {
  className: "w-4 h-4 text-inherit",
};

export const routes = [
  {
    layout: "dashboard",
    pages: [
      {
        icon: <HomeIcon {...icon} />,
        name: "Dashboard",
        path: "/home",
        element: <Home />,
      },

      // ===== HÀNG HÓA & KHO =====
      {
        icon: <ArchiveBoxIcon {...icon} />,
        name: "Commodity",
        badge: "Kho hàng",
        collapse: [
          {
            icon: <TagIcon {...subIcon} />,
            name: "Products",
            path: "/products",
            element: <Products />,
          },
          {
            icon: <ArrowDownTrayIcon {...subIcon} />,
            name: "Import Orders",
            path: "/import-orders",
            element: <ImportOrders />,
          },
        ],
      },

      // ===== NGƯỜI DÙNG =====
      {
        icon: <UserGroupIcon {...icon} />,
        name: "Users",
        badge: "Nhân sự",
        collapse: [
          {
            icon: <IdentificationIcon {...subIcon} />,
            name: "Staff",
            path: "/users",
            element: <Users />,
          },
          {
            icon: <UserIcon {...subIcon} />,
            name: "Customers History",
            path: "/customers-history",
            element: <Customers />,
          },
        ],
      },

      // ===== BÁN HÀNG =====
      {
        icon: <BanknotesIcon {...icon} />,
        name: "Sales",
        badge: "Giao dịch",
        collapse: [
          {
            icon: <CreditCardIcon {...subIcon} />,
            name: "Sales History",
            path: "/sales-history",
            element: <Payments />,
          },
          {
            icon: <ClipboardDocumentListIcon {...subIcon} />,
            name: "Orders History",
            path: "/orders-history",
            element: <Orders />,
          },
          {
            icon: <ChartBarIcon {...subIcon} />,
            name: "Products Sales",
            path: "/products-history",
            element: <ProductsHistory />,
          },
        ],
      },

      // ===== QUẢN TRỊ =====
      {
        icon: <ShieldCheckIcon {...icon} />,
        name: "Admin",
        roles: ["ADMIN"],
        badge: "Quản trị",
        collapse: [
          {
            icon: <TicketIcon {...subIcon} />,
            name: "Discounts",
            path: "/discounts",
            element: <Discounts />,
            roles: ["ADMIN"],
          },
          {
            icon: <Squares2X2Icon {...subIcon} />,
            name: "Categories",
            path: "/categories",
            element: <Categorys />,
            roles: ["ADMIN"],
          },
          {
            icon: <BuildingStorefrontIcon {...subIcon} />,
            name: "Suppliers",
            path: "/suppliers",
            element: <Suppliers />,
            roles: ["ADMIN"],
          },
        ],
      },
    ],
  },

  {
    layout: "auth",
    hidden: true,
    pages: [
      {
        icon: <ServerStackIcon {...icon} />,
        name: "sign in",
        path: "/sign-in",
        element: <SignIn />,
      },
      {
        icon: <RectangleStackIcon {...icon} />,
        name: "sign up",
        path: "/sign-up",
        element: <SignUp />,
      },
      {
        icon: <RectangleStackIcon {...icon} />,
        name: "change password",
        path: "/change-password",
        element: <ChangePassword />,
      },
    ],
  },
];

export default routes;
