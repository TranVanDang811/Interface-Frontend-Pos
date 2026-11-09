import React from "react";
import PropTypes from "prop-types";

export const MaterialTailwind = React.createContext(null);
MaterialTailwind.displayName = "MaterialTailwindContext";

export function reducer(state, action) {
  switch (action.type) {
    case "OPEN_SIDENAV": {
      return { ...state, openSidenav: action.value };
    }
    case "SIDENAV_TYPE": {
      try {
        localStorage.setItem("app_sidenav_type", action.value);
      } catch (e) {}
      return { ...state, sidenavType: action.value };
    }
    case "SIDENAV_COLOR": {
      return { ...state, sidenavColor: action.value };
    }
    case "TRANSPARENT_NAVBAR": {
      return { ...state, transparentNavbar: action.value };
    }
    case "FIXED_NAVBAR": {
      return { ...state, fixedNavbar: action.value };
    }
    case "OPEN_CONFIGURATOR": {
      return { ...state, openConfigurator: action.value };
    }
    case "SET_LANGUAGE": {
      try {
        localStorage.setItem("app_lang", action.value);
      } catch (e) {}
      return { ...state, language: action.value };
    }
    case "SET_DARK_MODE": {
      try {
        localStorage.setItem("app_dark_mode", action.value ? "true" : "false");
      } catch (e) {}
      if (action.value) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      return { ...state, darkMode: action.value };
    }
    default: {
      throw new Error(`Unhandled action type: ${action.type}`);
    }
  }
}

export function MaterialTailwindControllerProvider({ children }) {
  const savedDarkMode = (() => {
    try {
      const stored = localStorage.getItem("app_dark_mode");
      // Mặc định bật Dark Mode nếu chưa cấu hình
      return stored === null ? true : stored === "true";
    } catch (e) {
      return true;
    }
  })();

  const savedSidenavType = (() => {
    try {
      const stored = localStorage.getItem("app_sidenav_type");
      return stored || (savedDarkMode ? "dark" : "white");
    } catch (e) {
      return "dark";
    }
  })();

  const savedLang = (() => {
    try {
      return localStorage.getItem("app_lang") || "vi";
    } catch (e) {
      return "vi";
    }
  })();

  React.useEffect(() => {
    if (savedDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [savedDarkMode]);

  const initialState = {
    openSidenav: false,
    sidenavColor: "blue",
    sidenavType: savedSidenavType,
    transparentNavbar: true,
    fixedNavbar: false,
    openConfigurator: false,
    language: savedLang,
    darkMode: savedDarkMode,
  };

  const [controller, dispatch] = React.useReducer(reducer, initialState);
  const value = React.useMemo(
    () => [controller, dispatch],
    [controller, dispatch]
  );

  return (
    <MaterialTailwind.Provider value={value}>
      {children}
    </MaterialTailwind.Provider>
  );
}

export function useMaterialTailwindController() {
  const context = React.useContext(MaterialTailwind);

  if (!context) {
    throw new Error(
      "useMaterialTailwindController should be used inside the MaterialTailwindControllerProvider."
    );
  }

  return context;
}

MaterialTailwindControllerProvider.displayName = "/src/context/index.jsx";

MaterialTailwindControllerProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const setOpenSidenav = (dispatch, value) =>
  dispatch({ type: "OPEN_SIDENAV", value });
export const setSidenavType = (dispatch, value) =>
  dispatch({ type: "SIDENAV_TYPE", value });
export const setSidenavColor = (dispatch, value) =>
  dispatch({ type: "SIDENAV_COLOR", value });
export const setTransparentNavbar = (dispatch, value) =>
  dispatch({ type: "TRANSPARENT_NAVBAR", value });
export const setFixedNavbar = (dispatch, value) =>
  dispatch({ type: "FIXED_NAVBAR", value });
export const setOpenConfigurator = (dispatch, value) =>
  dispatch({ type: "OPEN_CONFIGURATOR", value });
export const setLanguage = (dispatch, value) =>
  dispatch({ type: "SET_LANGUAGE", value });
export const setDarkMode = (dispatch, value) =>
  dispatch({ type: "SET_DARK_MODE", value });
