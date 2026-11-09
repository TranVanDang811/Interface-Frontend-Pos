import { useLocation, Link, useNavigate } from "react-router-dom";
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
import { logout } from "@/features/auth/authThunks";
import { getToken } from "@/services/axiosInstance";

export function DashboardNavbar() {
  const [controller] = useMaterialTailwindController();
  const { fixedNavbar, language = "vi", darkMode = false } = controller;

  const navigate = useNavigate();
  const reduxDispatch = useDispatch();
  const user = useSelector((state) => state.user.currentUser);

  const { pathname } = useLocation();
  const [layout, page] = pathname.split("/").filter((el) => el !== "");

  useEffect(() => {
    const token = getToken();
    if (token && !user) {
      reduxDispatch(fetchMyInfo());
    }
  }, [reduxDispatch, user]);

  return (
    <Navbar
      color={fixedNavbar ? (darkMode ? "blue-gray" : "white") : "transparent"}
      style={
        fixedNavbar
          ? darkMode
            ? { backgroundColor: "rgba(17, 24, 39, 0.95)", borderColor: "#1f2937" }
            : { backgroundColor: "rgba(255, 255, 255, 0.95)", borderColor: "#e2e8f0" }
          : {}
      }
      className={`rounded-xl transition-all ${
        fixedNavbar
          ? `sticky top-4 z-40 py-3 shadow-md border ${darkMode ? "shadow-black/20" : "shadow-blue-gray-500/5"}`
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
                color={darkMode ? "white" : "blue-gray"}
                className={`font-normal hover:text-blue-500 ${darkMode ? "opacity-60" : "opacity-50"}`}
              >
                {layout}
              </Typography>
            </Link>
            <Typography
              variant="small"
              color={darkMode ? "white" : "blue-gray"}
              className="font-semibold"
            >
              {page}
            </Typography>
          </Breadcrumbs>
        </div>

        <div className="flex items-center gap-2">
          {user ? (
            <Menu>
              <MenuHandler>
                <div
                  className={`flex items-center gap-2 cursor-pointer px-3 py-1.5 rounded-xl border transition ${
                    darkMode
                      ? "bg-slate-800/90 border-slate-700/80 hover:bg-slate-800 text-white"
                      : "bg-blue-50 border-blue-100 hover:bg-blue-100 text-slate-800"
                  }`}
                >
                  <UserCircleIcon className="h-5 w-5 text-blue-500" />
                  <span className="text-xs font-semibold">
                    {user.fullName || user.username}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-500 font-bold uppercase ml-1">
                    {language.toUpperCase()}
                  </span>
                </div>
              </MenuHandler>

              <MenuList className={darkMode ? "bg-slate-900 border-slate-800 text-white shadow-xl" : ""}>
                <MenuItem onClick={() => navigate("/auth/change-password")}>
                  {language === "en" ? "Change Password" : "Đổi mật khẩu"}
                </MenuItem>
                <MenuItem onClick={() => navigate("/pos")}>
                  {language === "en" ? "POS Screen" : "Màn hình POS"}
                </MenuItem>
                <MenuItem onClick={() => window.open("/pos", "_blank")}>
                  {language === "en" ? "Open POS in New Tab" : "Mở POS trong Tab mới"}
                </MenuItem>
                <hr className={darkMode ? "my-2 border-slate-800" : "my-2 border-slate-100"} />
                <MenuItem
                  className="text-red-500 font-medium"
                  onClick={async () => {
                    await reduxDispatch(logout());
                    navigate("/auth/sign-in");
                  }}
                >
                  {language === "en" ? "Sign Out" : "Đăng xuất"}
                </MenuItem>
              </MenuList>
            </Menu>
          ) : (
            <Link to="/auth/sign-in">
              <Button
                variant="text"
                color={darkMode ? "white" : "blue-gray"}
                className="hidden items-center gap-1 px-4 xl:flex normal-case"
              >
                <UserCircleIcon className="h-5 w-5" />
                {language === "en" ? "Sign In" : "Đăng nhập"}
              </Button>
            </Link>
          )}
        </div>

      </div>
    </Navbar>
  );
}

export default DashboardNavbar;
