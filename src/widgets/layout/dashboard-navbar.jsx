import { useLocation, Link } from "react-router-dom";
import {
  Navbar,
  Typography,
  Button,
  Breadcrumbs,
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
} from "@material-tailwind/react";
import { UserCircleIcon } from "@heroicons/react/24/solid";
import {
  useMaterialTailwindController,
} from "@/context";

import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { fetchMyInfo } from "@/features/user/userThunks";

export function DashboardNavbar() {

  // ✅ đổi tên dispatch của MaterialTailwind
  const [controller, mtDispatch] = useMaterialTailwindController();
  const { fixedNavbar } = controller;

  const reduxDispatch = useDispatch();   // 👈 dispatch của Redux
 const user = useSelector((state) => state.user.currentUser);

  const { pathname } = useLocation();
  const [layout, page] = pathname.split("/").filter((el) => el !== "");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token && !user) {
      reduxDispatch(fetchMyInfo());
    }
  }, [reduxDispatch, user]);

  return (
    <Navbar
      color={fixedNavbar ? "white" : "transparent"}
      className={`rounded-xl transition-all ${
        fixedNavbar
          ? "sticky top-4 z-40 py-3 shadow-md shadow-blue-gray-500/5"
          : "px-0 py-1"
      }`}
      fullWidth
      blurred={fixedNavbar}
    >
      <div className="flex flex-col-reverse justify-between gap-6 md:flex-row md:items-center">
        
        <div className="capitalize">
          <Breadcrumbs className="bg-transparent p-0">
            <Link to={`/${layout}`}>
              <Typography
                variant="small"
                color="blue-gray"
                className="font-normal opacity-50 hover:text-blue-500"
              >
                {layout}
              </Typography>
            </Link>
            <Typography variant="small" color="blue-gray">
              {page}
            </Typography>
          </Breadcrumbs>
        </div>

        <div className="flex items-center">
         {user ? (
  <Menu>
    <MenuHandler>
      <Typography
        variant="small"
        color="blue-gray"
        className="font-medium cursor-pointer"
      >
        {user.username}
      </Typography>
    </MenuHandler>

    <MenuList>
              <MenuItem
        onClick={() => {
window.location.href = "/auth/change-password";        }}
      >
        Change Password
      </MenuItem>
          <MenuItem
        onClick={() => {
          window.location.href = "/pos";
        }}
      >
        Pos
      </MenuItem>
      <MenuItem
        onClick={() => {
          localStorage.removeItem("token");
          reduxDispatch({ type: "user/logout" }); // nếu có reducer logout
          window.location.href = "/auth/sign-in";
        }}
      >
        Logout
      </MenuItem>
    </MenuList>
  </Menu>
) : (
  <Link to="/auth/sign-in">
    <Button
      variant="text"
      color="blue-gray"
      className="hidden items-center gap-1 px-4 xl:flex normal-case"
    >
      <UserCircleIcon className="h-5 w-5 text-blue-gray-500" />
      Sign In
    </Button>
  </Link>
)}

        </div>

      </div>
    </Navbar>
  );
}

export default DashboardNavbar;
