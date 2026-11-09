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
import RoleProtectedRoute from "@/components/RoleProtectedRoute";

export function Dashboard() {
  const [controller, dispatch] = useMaterialTailwindController();
  const { sidenavType, darkMode } = controller;

  return (
    <div
      style={darkMode ? { backgroundColor: "#0b0f19", color: "#f8fafc" } : {}}
      className={`min-h-screen transition-colors duration-200 ${
        darkMode ? "bg-slate-950 text-slate-100" : "bg-blue-gray-50/50 text-slate-800"
      }`}
    >
      <Sidenav
        routes={routes}
        brandImg={
          sidenavType === "dark" || darkMode ? "/img/logo-ct.png" : "/img/logo-ct-dark.png"
        }
      />
      <div className="p-4 xl:ml-80">
        <DashboardNavbar />
        <Configurator />
        <button
          type="button"
          onClick={() => setOpenConfigurator(dispatch, true)}
          className="fixed bottom-7 right-7 z-40 p-3 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 hover:scale-110 active:scale-95 transition-all duration-200 group"
          title="Cài đặt giao diện / Configurator"
        >
          <Cog6ToothIcon className="h-6 w-6 group-hover:rotate-90 transition-transform duration-300" />
        </button>
        <Routes>
          {routes.map(
            ({ layout, pages }) =>
              layout === "dashboard" &&
              pages.map((page) => {
                const groupRoles = page.roles;
                // Nếu có collapse
                if (page.collapse) {
                  return page.collapse.map(
                    ({ path, element, roles: itemRoles }) => {
                      const effectiveRoles = itemRoles || groupRoles;
                      const routeElement = effectiveRoles ? (
                        <RoleProtectedRoute allowedRoles={effectiveRoles}>
                          {element}
                        </RoleProtectedRoute>
                      ) : (
                        element
                      );
                      return (
                        <Route
                          key={path}
                          path={path}
                          element={routeElement}
                        />
                      );
                    }
                  );
                }

                // Route bình thường
                const routeElement = page.roles ? (
                  <RoleProtectedRoute allowedRoles={page.roles}>
                    {page.element}
                  </RoleProtectedRoute>
                ) : (
                  page.element
                );
                return (
                  <Route
                    key={page.path}
                    path={page.path}
                    element={routeElement}
                  />
                );
              })
          )}

          <Route path="/products/add" element={<AddProduct />} />
          <Route
            path="/suppliers/add"
            element={
              <RoleProtectedRoute allowedRoles={["ADMIN"]}>
                <AddSupplier />
              </RoleProtectedRoute>
            }
          />
          <Route path="/import-orders/create" element={<ImportOrderCreate />} />
          <Route path="/users/:id" element={<UserDetail />} />
          <Route path="/users/create" element={<AddUser />} />
          <Route path="/customers-history/:id" element={<UserDetail />} />
          <Route path="/orders/:id" element={<OrderDetail />} />
          <Route
            path="/categories/add"
            element={
              <RoleProtectedRoute allowedRoles={["ADMIN"]}>
                <AddCategory />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/discounts/create"
            element={
              <RoleProtectedRoute allowedRoles={["ADMIN"]}>
                <AddDiscount />
              </RoleProtectedRoute>
            }
          />
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
