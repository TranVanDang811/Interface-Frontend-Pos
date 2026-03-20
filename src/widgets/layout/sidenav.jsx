import PropTypes from "prop-types";
import { Link, NavLink } from "react-router-dom";
import { XMarkIcon } from "@heroicons/react/24/outline";
import {
  Button,
  IconButton,
  Typography,
} from "@material-tailwind/react";
import { useSelector } from "react-redux";

import { useMaterialTailwindController, setOpenSidenav } from "@/context";

export function Sidenav({ brandImg, brandName, routes }) {
  const [controller, dispatch] = useMaterialTailwindController();
  const { sidenavColor, sidenavType, openSidenav } = controller;

  // ===== LẤY USER =====
  const user = useSelector((state) => state.auth.user);

  // ===== LẤY DANH SÁCH ROLE =====
  const userRoles = user?.roles?.map((r) => r.name) || [];

  console.log("USER:", user);
  console.log("ROLES:", userRoles);

  const sidenavTypes = {
    dark: "bg-gradient-to-br from-gray-800 to-gray-900",
    white: "bg-white shadow-sm",
    transparent: "bg-transparent",
  };

  return (
    <aside
      className={`
        ${sidenavTypes[sidenavType]}
        ${openSidenav ? "translate-x-0" : "-translate-x-80"}
        fixed inset-0 z-50 my-4 ml-4
        h-[calc(100vh-32px)] w-72
        rounded-xl border border-blue-gray-100
        transition-transform duration-300 xl:translate-x-0
        flex flex-col
      `}
    >
      {/* ===== HEADER ===== */}
      <div className="relative">
        <Link to="/" className="py-6 px-8 text-center block">
          <Typography
            variant="h6"
            color={sidenavType === "dark" ? "white" : "blue-gray"}
          >
            {brandName}
          </Typography>
        </Link>

        <IconButton
          variant="text"
          color="white"
          size="sm"
          ripple={false}
          className="absolute right-0 top-0 grid rounded-br-none rounded-tl-none xl:hidden"
          onClick={() => setOpenSidenav(dispatch, false)}
        >
          <XMarkIcon strokeWidth={2.5} className="h-5 w-5 text-white" />
        </IconButton>
      </div>

      {/* ===== MENU ===== */}
      <div className="flex-1 overflow-y-auto m-4">
        {routes
          .filter((route) => !route.hidden)
          .map(({ layout, title, pages }, key) => {
            
            // ===== FILTER PAGE ROLE =====
            const filteredPages = pages.filter((page) => {
              if (!page.roles) return true;
              return page.roles.some((role) => userRoles.includes(role));
            });

            return (
              <ul key={key} className="mb-4 flex flex-col gap-1">
                {title && (
                  <li className="mx-3.5 mt-4 mb-2">
                    <Typography
                      variant="small"
                      color={sidenavType === "dark" ? "white" : "blue-gray"}
                      className="font-black uppercase opacity-75"
                    >
                      {title}
                    </Typography>
                  </li>
                )}

                {filteredPages.map((page) => {

                  // ===== MENU CÓ SUB MENU =====
                  if (page.collapse) {

                    const filteredCollapse = page.collapse.filter((item) => {
                      if (!item.roles) return true;
                      return item.roles.some((role) =>
                        userRoles.includes(role)
                      );
                    });

                    if (filteredCollapse.length === 0) return null;

                    return (
                      <li key={page.name}>
                        <div className="flex items-center gap-4 px-4 py-2 mt-2 text-sm font-bold uppercase text-blue-gray-400">
                          {page.icon}
                          {page.name}
                        </div>

                        <ul className="ml-6 mt-1 flex flex-col gap-1">
                          {filteredCollapse.map((item) => (
                            <li key={item.name}>
                              <NavLink to={`/${layout}${item.path}`}>
                                {({ isActive }) => (
                                  <Button
                                    variant={isActive ? "gradient" : "text"}
                                    color={
                                      isActive
                                        ? sidenavColor
                                        : sidenavType === "dark"
                                        ? "white"
                                        : "blue-gray"
                                    }
                                    className="flex items-center gap-4 px-4 capitalize"
                                    fullWidth
                                  >
                                    <Typography
                                      color="inherit"
                                      className="font-medium capitalize"
                                    >
                                      {item.name}
                                    </Typography>
                                  </Button>
                                )}
                              </NavLink>
                            </li>
                          ))}
                        </ul>
                      </li>
                    );
                  }

                  // ===== MENU THƯỜNG =====
                  return (
                    <li key={page.name}>
                      <NavLink to={`/${layout}${page.path}`}>
                        {({ isActive }) => (
                          <Button
                            variant={isActive ? "gradient" : "text"}
                            color={
                              isActive
                                ? sidenavColor
                                : sidenavType === "dark"
                                ? "white"
                                : "blue-gray"
                            }
                            className="flex items-center gap-4 px-4 capitalize"
                            fullWidth
                          >
                            {page.icon}

                            <Typography
                              color="inherit"
                              className="font-medium capitalize"
                            >
                              {page.name}
                            </Typography>
                          </Button>
                        )}
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            );
          })}
      </div>
    </aside>
  );
}

Sidenav.defaultProps = {
  brandImg: "/img/logo-ct.png",
  brandName: "DANGCAPSHOP",
};

Sidenav.propTypes = {
  brandImg: PropTypes.string,
  brandName: PropTypes.string,
  routes: PropTypes.arrayOf(PropTypes.object).isRequired,
};

Sidenav.displayName = "Sidenav";

export default Sidenav;