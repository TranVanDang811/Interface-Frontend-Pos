import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Link, NavLink, useLocation } from "react-router-dom";
import { XMarkIcon } from "@heroicons/react/24/outline";
import {
  ShoppingBagIcon,
  ChevronDownIcon,
  ComputerDesktopIcon,
  ArrowTopRightOnSquareIcon,
} from "@heroicons/react/24/solid";
import { IconButton, Typography } from "@material-tailwind/react";
import { useSelector } from "react-redux";
import { useMaterialTailwindController, setOpenSidenav } from "@/context";
import { getTranslation } from "@/utils/translations";

export function Sidenav({ brandName, routes }) {
  const [controller, dispatch] = useMaterialTailwindController();
  const { sidenavType, openSidenav, language = "vi", darkMode = false } = controller;
  const isDark = sidenavType === "dark" || darkMode;
  const t = (key) => getTranslation(language, key);
  const location = useLocation();

  const navNameMap = {
    Dashboard: language === "en" ? "Dashboard" : "Bảng điều khiển",
    Commodity: language === "en" ? "Commodity" : "Hàng Hóa",
    Products: language === "en" ? "Products" : "Sản Phẩm",
    "Import Orders": language === "en" ? "Import Orders" : "Đơn Nhập Hàng",
    Users: language === "en" ? "Users" : "Nhân Sự",
    Staff: language === "en" ? "Staff" : "Nhân Viên",
    "Customers History": language === "en" ? "Customers" : "Khách Hàng",
    Sales: language === "en" ? "Sales" : "Bán Hàng",
    "Sales History": language === "en" ? "Sales History" : "Lịch Sử Bán Hàng",
    "Orders History": language === "en" ? "Orders History" : "Lịch Sử Đơn Hàng",
    "Products Sales": language === "en" ? "Products Sales" : "Báo Cáo Doanh Số",
    Admin: language === "en" ? "Admin" : "Quản Trị",
    Discounts: language === "en" ? "Discounts" : "Mã Giảm Giá",
    Categories: language === "en" ? "Categories" : "Danh Mục",
    Suppliers: language === "en" ? "Suppliers" : "Nhà Cung Cấp",
  };

  const badgeMap = {
    "Kho hàng": language === "en" ? "Warehouse" : "Kho hàng",
    "Nhân sự": language === "en" ? "HR" : "Nhân sự",
    "Giao dịch": language === "en" ? "Orders" : "Giao dịch",
    "Quản trị": language === "en" ? "Admin" : "Quản trị",
  };

  // User & Roles from Redux
  const authUser = useSelector((state) => state.auth.user);
  const currentUser = useSelector((state) => state.user?.currentUser);
  const user = currentUser || authUser;
  const userRoles =
    user?.roles?.map((r) => {
      const raw = typeof r === "string" ? r : r?.name || "";
      return raw.replace(/^ROLE_/, "").toUpperCase();
    }) || [];

  // Collapsible sections state
  const [openSections, setOpenSections] = useState({
    Commodity: true,
    Users: true,
    Sales: true,
    Admin: true,
  });

  // Auto-expand section if currently on its route
  useEffect(() => {
    routes.forEach((route) => {
      if (route.layout === "dashboard") {
        route.pages?.forEach((page) => {
          if (page.collapse) {
            const hasActiveRoute = page.collapse.some(
              (item) =>
                location.pathname === `/dashboard${item.path}` ||
                location.pathname.startsWith(`/dashboard${item.path}/`)
            );
            if (hasActiveRoute) {
              setOpenSections((prev) => ({ ...prev, [page.name]: true }));
            }
          }
        });
      }
    });
  }, [location.pathname, routes]);

  const toggleSection = (sectionName) => {
    setOpenSections((prev) => ({
      ...prev,
      [sectionName]: !prev[sectionName],
    }));
  };

  const sidenavTypes = {
    dark: "bg-slate-900 border-slate-800 text-white",
    white: "bg-white border-slate-200/90 text-slate-800 shadow-xl shadow-slate-200/50",
    transparent: "bg-transparent",
  };

  return (
    <aside
      style={
        isDark
          ? { backgroundColor: "#0f172a" }
          : sidenavType === "transparent"
          ? { backgroundColor: "transparent" }
          : { backgroundColor: "#ffffff" }
      }
      className={`
        ${isDark ? "border-slate-800 text-white shadow-2xl shadow-black/40" : "border-slate-200/90 text-slate-800 shadow-xl shadow-slate-200/50"}
        ${openSidenav ? "translate-x-0" : "-translate-x-80"}
        fixed inset-0 z-50 my-3 ml-3
        h-[calc(100vh-24px)] w-72
        rounded-2xl border
        transition-all duration-300 xl:translate-x-0
        flex flex-col overflow-hidden select-none
      `}
    >
      {/* ===== HEADER / BRAND ===== */}
      <div className={`px-5 py-4.5 border-b flex items-center justify-between ${isDark ? "border-slate-800" : "border-slate-100"}`}>
        <Link
          to="/dashboard/home"
          className="flex items-center gap-3 group transition-transform"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-blue-500/25 group-hover:scale-105 transition-transform">
            <ShoppingBagIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className={`text-sm font-extrabold tracking-wide flex items-center gap-1.5 ${isDark ? "text-white" : "text-slate-800"}`}>
              {brandName || "DANGCAP SHOP"}
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>
            <div className="text-[11px] font-medium text-slate-400">
              POS & Management
            </div>
          </div>
        </Link>

        <IconButton
          variant="text"
          color="blue-gray"
          size="sm"
          ripple={false}
          className={`xl:hidden rounded-lg ${isDark ? "hover:bg-slate-800" : "hover:bg-slate-100"}`}
          onClick={() => setOpenSidenav(dispatch, false)}
        >
          <XMarkIcon strokeWidth={2.5} className="h-5 w-5 text-slate-400" />
        </IconButton>
      </div>

      {/* ===== MENU NAVIGATION LIST ===== */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 scrollbar-thin scrollbar-thumb-slate-800">
        {routes
          .filter((route) => !route.hidden)
          .map(({ layout, title, pages }, key) => {
            // Filter page role
            const filteredPages = pages.filter((page) => {
              if (!page.roles) return true;
              return page.roles.some((role) =>
                userRoles.includes(role.replace(/^ROLE_/, "").toUpperCase())
              );
            });

            return (
              <ul key={key} className="flex flex-col gap-1.5">
                {title && (
                  <li className="px-3 pt-2 pb-1">
                    <Typography
                      variant="small"
                      className="text-[10px] font-bold uppercase tracking-wider text-slate-400"
                    >
                      {title}
                    </Typography>
                  </li>
                )}

                {filteredPages.map((page) => {
                  const translatedPageName = navNameMap[page.name] || page.name;

                  // ===== GROUP CÓ SUB MENU (COLLAPSIBLE) =====
                  if (page.collapse) {
                    const filteredCollapse = page.collapse.filter((item) => {
                      if (!item.roles) return true;
                      return item.roles.some((role) =>
                        userRoles.includes(role.replace(/^ROLE_/, "").toUpperCase())
                      );
                    });

                    if (filteredCollapse.length === 0) return null;

                    const isOpen = openSections[page.name] ?? true;
                    const hasActiveChild = filteredCollapse.some(
                      (item) =>
                        location.pathname === `/${layout}${item.path}` ||
                        location.pathname.startsWith(`/${layout}${item.path}/`)
                    );

                    return (
                      <li key={page.name} className="flex flex-col">
                        {/* Section Header Button */}
                        <button
                          type="button"
                          onClick={() => toggleSection(page.name)}
                          className={`
                            w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-all duration-150 group
                            ${
                              hasActiveChild
                                ? isDark
                                  ? "bg-slate-800/90 text-white"
                                  : "bg-slate-100/70 text-slate-900"
                                : isDark
                                ? "text-slate-400 hover:text-white hover:bg-slate-800/60"
                                : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                            }
                          `}
                        >
                          <div className="flex items-center gap-2.5">
                            <span
                              className={`
                                w-7 h-7 rounded-lg flex items-center justify-center transition-colors
                                ${
                                  hasActiveChild
                                    ? "bg-blue-600 text-white shadow-sm"
                                    : isDark
                                    ? "bg-slate-800 text-slate-400 group-hover:bg-slate-700 group-hover:text-blue-400"
                                    : "bg-slate-100 text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600"
                                }
                              `}
                            >
                              {page.icon}
                            </span>
                            <span className="text-xs font-bold uppercase tracking-wider">
                              {translatedPageName}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            {page.badge && (
                              <span
                                className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${
                                  isDark
                                    ? "text-slate-300 bg-slate-800 border border-slate-700/60"
                                    : "text-slate-400 bg-slate-200/60"
                                }`}
                              >
                                {badgeMap[page.badge] || page.badge}
                              </span>
                            )}
                            <ChevronDownIcon
                              className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                                isOpen ? "rotate-0" : "-rotate-90"
                              }`}
                            />
                          </div>
                        </button>

                        {/* Collapsible Sub-Items */}
                        {isOpen && (
                          <ul
                            className={`ml-4 pl-3 my-1 border-l-2 flex flex-col gap-1 ${
                              isDark ? "border-slate-800" : "border-slate-100"
                            }`}
                          >
                            {filteredCollapse.map((item) => {
                              const translatedItemName =
                                navNameMap[item.name] || item.name;

                              return (
                                <li key={item.name}>
                                  <NavLink to={`/${layout}${item.path}`}>
                                    {({ isActive }) => (
                                      <div
                                        className={`
                                          group relative flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-all duration-150
                                          ${
                                            isActive
                                              ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-md shadow-blue-500/20"
                                              : isDark
                                              ? "text-slate-400 hover:text-white hover:bg-slate-800/80 font-medium"
                                              : "text-slate-600 hover:text-blue-600 hover:bg-blue-50/70 font-medium"
                                          }
                                        `}
                                      >
                                        <span
                                          className={`transition-colors flex-shrink-0 ${
                                            isActive
                                              ? "text-white"
                                              : isDark
                                              ? "text-slate-500 group-hover:text-blue-400"
                                              : "text-slate-400 group-hover:text-blue-500"
                                          }`}
                                        >
                                          {item.icon || (
                                            <span className="w-1.5 h-1.5 rounded-full bg-current block" />
                                          )}
                                        </span>
                                        <span className="truncate">
                                          {translatedItemName}
                                        </span>
                                        {isActive && (
                                          <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white shadow-sm flex-shrink-0" />
                                        )}
                                      </div>
                                    )}
                                  </NavLink>
                                </li>
                              );
                            })}
                          </ul>
                        )}
                      </li>
                    );
                  }

                  // ===== MENU ĐƠN (VD: DASHBOARD) =====
                  return (
                    <li key={page.name}>
                      <NavLink to={`/${layout}${page.path}`}>
                        {({ isActive }) => (
                          <div
                            className={`
                              group flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150
                              ${
                                isActive
                                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20"
                                  : isDark
                                  ? "text-slate-300 hover:text-white hover:bg-slate-800/80 font-medium"
                                  : "text-slate-700 hover:text-blue-600 hover:bg-blue-50/70 font-medium"
                              }
                            `}
                          >
                            <span
                              className={`transition-colors ${
                                isActive
                                  ? "text-white"
                                  : isDark
                                  ? "text-slate-400 group-hover:text-blue-400"
                                  : "text-slate-400 group-hover:text-blue-500"
                              }`}
                            >
                              {page.icon}
                            </span>
                            <span className="truncate">
                              {translatedPageName}
                            </span>
                          </div>
                        )}
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            );
          })}
      </div>

      {/* ===== FOOTER SHORTCUT & USER INFO ===== */}
      <div
        className={`p-3 border-t flex flex-col gap-2.5 ${
          isDark
            ? "border-slate-800 bg-slate-900/90"
            : "border-slate-100 bg-slate-50/60"
        }`}
      >
        {/* Quick Link to POS Screen */}
        <Link
          to="/pos"
          className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-sm hover:shadow-md transition-all group"
          title={t("openPos")}
        >
          <div className="flex items-center gap-2.5">
            <ComputerDesktopIcon className="w-4 h-4 text-white" />
            <span className="text-xs font-bold tracking-wide">
              {t("openPos")}
            </span>
          </div>
          <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5 opacity-80 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </Link>

        {/* Current User Card */}
        <div
          style={isDark ? { backgroundColor: "#1e293b" } : { backgroundColor: "#f8fafc" }}
          className={`flex items-center gap-2.5 px-2 py-1.5 rounded-lg border shadow-xs ${
            isDark
              ? "border-slate-700/60"
              : "border-slate-200/80"
          }`}
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center ring-2 ring-white shadow-sm flex-shrink-0">
            {(user?.fullName || user?.username || "A").charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div
              className={`text-xs font-semibold truncate ${
                isDark ? "text-slate-200" : "text-slate-800"
              }`}
            >
              {user?.fullName || user?.username || "Administrator"}
            </div>
            <div className="text-[10px] text-slate-400 truncate">
              {userRoles.includes("ADMIN")
                ? t("systemAdmin")
                : userRoles.includes("MANAGE")
                ? t("branchManager")
                : t("posStaff")}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

Sidenav.defaultProps = {
  brandImg: "/img/logo-ct.png",
  brandName: "DANGCAP SHOP",
};

Sidenav.propTypes = {
  brandImg: PropTypes.string,
  brandName: PropTypes.string,
  routes: PropTypes.arrayOf(PropTypes.object).isRequired,
};

Sidenav.displayName = "Sidenav";

export default Sidenav;
