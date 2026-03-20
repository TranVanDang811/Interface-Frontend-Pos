import { Routes, Route } from "react-router-dom";
import { Cog6ToothIcon } from "@heroicons/react/24/solid";
import { IconButton } from "@material-tailwind/react";
import {
  Sidenav,
  DashboardNavbar,
  Configurator,
  Footer,
} from "@/widgets/layout";
import routes from "@/routes";
import { useMaterialTailwindController, setOpenConfigurator } from "@/context";
import AddProduct from "@/pages/product/AddProduct";
import ImportOrderCreate from "@/pages/importOder/ImportOrderCreate";
import UserDetail from "@/pages/user/UserDetail";
import AddUser from "@/pages/user/AddUser";
import OrderDetail from "@/pages/order/OrderDetail";
import AddCategory from "@/pages/category/AddCategory";
import AddDiscount from "@/pages/discount/AddDiscount";
import AddSupplier from "@/pages/supplier/AddSupplier";

export function Dashboard() {
  const [controller, dispatch] = useMaterialTailwindController();
  const { sidenavType } = controller;

  return (
    <div className="min-h-screen bg-blue-gray-50/50">
      <Sidenav
        routes={routes}
        brandImg={
          sidenavType === "dark" ? "/img/logo-ct.png" : "/img/logo-ct-dark.png"
        }
      />
      <div className="p-4 xl:ml-80">
        <DashboardNavbar />
        <Configurator />
        <IconButton
          size="lg"
          color="white"
          className="fixed bottom-8 right-8 z-40 rounded-full shadow-blue-gray-900/10"
          ripple={false}
          onClick={() => setOpenConfigurator(dispatch, true)}
        >
          <Cog6ToothIcon className="h-5 w-5" />
        </IconButton>
        <Routes>
  {routes.map(
    ({ layout, pages }) =>
      layout === "dashboard" &&
      pages.map((page) => {
        // Nếu có collapse
        if (page.collapse) {
          return page.collapse.map(({ path, element }) => (
            <Route key={path} path={path} element={element} />
          ));
        }

        // Route bình thường
        return (
          <Route key={page.path} path={page.path} element={page.element} />
        );
      })
  )}

  <Route path="/products/add" element={<AddProduct />} />
  <Route path="/suppliers/add" element={<AddSupplier />} />
  <Route path="/import-orders/create" element={<ImportOrderCreate />} />
  <Route path="/users/:id" element={<UserDetail />} />
  <Route path="/users/create" element={<AddUser />} />
  <Route path="/customers-history/:id" element={<UserDetail />} />
  <Route path="/orders/:id" element={<OrderDetail  />} />
  <Route path="/categories/add" element={<AddCategory />} />
  <Route path="/discounts/create" element={<AddDiscount />} />

</Routes>

        <div className="text-blue-gray-600">
          <Footer />
        </div>
      </div>
    </div>
  );
}

Dashboard.displayName = "/src/layout/dashboard.jsx";

export default Dashboard;
