import {
  HomeIcon,
  UserCircleIcon,
  TableCellsIcon,
  InformationCircleIcon,
  ServerStackIcon,
  RectangleStackIcon,
} from "@heroicons/react/24/solid";
import { Home} from "@/pages/dashboard";
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

const icon = {
  className: "w-5 h-5 text-inherit",
};

export const routes = [
  {
    layout: "dashboard",
    pages: [
      {
        icon: <HomeIcon {...icon} />,
        name: "dashboard",
        path: "/home",
        element: <Home />,
      },

      // ===== NHÓM NGƯỜI DÙNG =====
      {
        icon: <ServerStackIcon {...icon} />,
        name: "Commodity",
        collapse: [
            {
            name: "products",
            path: "/products",
            element: <Products />,
          },
          {
            name: "importOrder",
            path: "/import-orders",
            element: <ImportOrders />,
          },
        
        ],
      },

  
      {
        icon: <UserCircleIcon {...icon} />, 
        name: "USERs",
        collapse: [
           {
            name: "Staff",
            path: "/users",
            element: <Users />,
          },
            {
            name: "Customers history",
            path: "/customers-history",
            element: <Customers />,
          },
      
        ],
      },
      {
        icon: <UserCircleIcon {...icon} />, 
        name: "SALES",
        collapse: [
           {
            name: "Sales History",
            path: "/sales-history",
            element: <Payments />,
          },  {
            name: "Orders History",
            path: "/orders-history",
            element: <Orders />,
          },
           
        ],
      },
      {
        icon: <UserCircleIcon {...icon} />, 
        name: "ADMIN",
          roles: ["ADMIN"], 
        collapse: [
          {
            name: "Discount",
            path: "/discounts",
            element: <Discounts />,
          },
           {
            name: "Category",
            path: "/categories",
            element: <Categorys />,
          },
             {
            name: "Supplier",
            path: "/suppliers",
            element: <Suppliers />,
          },
             
        ],
      },
    ],
  },

  {
    // title: "auth pages",
   
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
