import React from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import {
  LanguageIcon,
  MoonIcon,
  SunIcon,
  CheckIcon,
  SparklesIcon,
} from "@heroicons/react/24/solid";
import {
  useMaterialTailwindController,
  setOpenConfigurator,
  setSidenavColor,
  setSidenavType,
  setLanguage,
  setDarkMode,
} from "@/context";
import { getTranslation } from "@/utils/translations";

export function Configurator() {
  const [controller, dispatch] = useMaterialTailwindController();
  const {
    openConfigurator,
    sidenavColor,
    sidenavType,
    language = "vi",
    darkMode = true,
  } = controller;

  const t = (key) => getTranslation(language, key);

  const colorMap = {
    blue: "bg-gradient-to-tr from-blue-500 to-indigo-600",
    green: "bg-gradient-to-tr from-emerald-400 to-teal-600",
    orange: "bg-gradient-to-tr from-amber-400 to-orange-600",
    red: "bg-gradient-to-tr from-rose-500 to-red-600",
    pink: "bg-gradient-to-tr from-pink-400 to-fuchsia-600",
    dark: "bg-gradient-to-tr from-slate-600 to-slate-800",
  };

  return (
    <>
      {/* Backdrop overlay */}
      {openConfigurator && (
        <div
          className="fixed inset-0 z-[999] bg-black/70 backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setOpenConfigurator(dispatch, false)}
        />
      )}

      {/* Slide-out Drawer */}
      <aside
        style={{ backgroundColor: "#0f172a" }}
        className={`fixed top-0 right-0 z-[1000] h-screen w-96 max-w-[90vw] border-l border-slate-800 text-slate-100 shadow-2xl transition-transform duration-300 flex flex-col select-none ${
          openConfigurator ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* ===== HEADER ===== */}
        <div
          style={{ backgroundColor: "#0f172a" }}
          className="flex items-center justify-between px-6 py-5 border-b border-slate-800 flex-shrink-0"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/25">
              <SparklesIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-wide">
                {t("configuratorTitle")}
              </h2>
              <p className="text-[11px] text-slate-400">
                {t("configuratorSubtitle")}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setOpenConfigurator(dispatch, false)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title={t("closeBtn")}
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* ===== BODY CONTENT ===== */}
        <div
          style={{ backgroundColor: "#0f172a" }}
          className="flex-1 overflow-y-auto px-6 py-5 space-y-6 scrollbar-thin scrollbar-thumb-slate-800"
        >
          {/* 1. ĐỔI NGÔN NGỮ (LANGUAGE) */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <LanguageIcon className="w-4 h-4 text-blue-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                {t("languageSectionTitle")}
              </h3>
            </div>
            <p className="text-[11px] text-slate-400 mb-3">
              {t("languageSectionDesc")}
            </p>

            <div className="grid grid-cols-2 gap-2.5">
              {/* Tiếng Việt */}
              <button
                type="button"
                onClick={() => setLanguage(dispatch, "vi")}
                style={{ backgroundColor: language === "vi" ? "#1e293b" : "#111827" }}
                className={`
                  flex flex-col items-start p-3 rounded-xl border text-left transition-all duration-150 relative
                  ${
                    language === "vi"
                      ? "border-blue-500 text-white shadow-sm ring-1 ring-blue-500/50"
                      : "border-slate-800 text-slate-300 hover:border-slate-700"
                  }
                `}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="text-xl">🇻🇳</span>
                  {language === "vi" && (
                    <span className="w-4 h-4 rounded-full bg-blue-500 text-white flex items-center justify-center">
                      <CheckIcon className="w-3 h-3 stroke-[3]" />
                    </span>
                  )}
                </div>
                <div className="text-xs font-bold">{t("langVi")}</div>
                <div className="text-[10px] text-slate-400">{t("langViSubtitle")}</div>
              </button>

              {/* English */}
              <button
                type="button"
                onClick={() => setLanguage(dispatch, "en")}
                style={{ backgroundColor: language === "en" ? "#1e293b" : "#111827" }}
                className={`
                  flex flex-col items-start p-3 rounded-xl border text-left transition-all duration-150 relative
                  ${
                    language === "en"
                      ? "border-blue-500 text-white shadow-sm ring-1 ring-blue-500/50"
                      : "border-slate-800 text-slate-300 hover:border-slate-700"
                  }
                `}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="text-xl">🇬🇧</span>
                  {language === "en" && (
                    <span className="w-4 h-4 rounded-full bg-blue-500 text-white flex items-center justify-center">
                      <CheckIcon className="w-3 h-3 stroke-[3]" />
                    </span>
                  )}
                </div>
                <div className="text-xs font-bold">{t("langEn")}</div>
                <div className="text-[10px] text-slate-400">{t("langEnSubtitle")}</div>
              </button>
            </div>
          </div>

          {/* 2. CHẾ ĐỘ NỀN (THEME / DARK MODE) */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <MoonIcon className="w-4 h-4 text-indigo-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                {t("themeSectionTitle")}
              </h3>
            </div>
            <p className="text-[11px] text-slate-400 mb-3">
              {t("themeSectionDesc")}
            </p>

            <div className="grid grid-cols-2 gap-2.5">
              {/* Dark Theme */}
              <button
                type="button"
                onClick={() => {
                  setDarkMode(dispatch, true);
                  setSidenavType(dispatch, "dark");
                }}
                style={{ backgroundColor: darkMode ? "#1e293b" : "#111827" }}
                className={`
                  flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all duration-150
                  ${
                    darkMode
                      ? "border-indigo-500 text-white shadow-sm ring-1 ring-indigo-500/50"
                      : "border-slate-800 text-slate-300 hover:border-slate-700"
                  }
                `}
              >
                <div className="w-8 h-8 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center text-indigo-400 flex-shrink-0">
                  <MoonIcon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold">{t("darkTheme")}</div>
                  <div className="text-[10px] text-slate-400 truncate">
                    {t("darkThemeDesc")}
                  </div>
                </div>
              </button>

              {/* Light Theme */}
              <button
                type="button"
                onClick={() => {
                  setDarkMode(dispatch, false);
                  setSidenavType(dispatch, "white");
                }}
                style={{ backgroundColor: !darkMode ? "#1e293b" : "#111827" }}
                className={`
                  flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all duration-150
                  ${
                    !darkMode
                      ? "border-indigo-500 text-white shadow-sm ring-1 ring-indigo-500/50"
                      : "border-slate-800 text-slate-300 hover:border-slate-700"
                  }
                `}
              >
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 flex-shrink-0">
                  <SunIcon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold">{t("lightTheme")}</div>
                  <div className="text-[10px] text-slate-400 truncate">
                    {t("lightThemeDesc")}
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* 3. KIỂU THANH BÊN (SIDENAV TYPES) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                {t("sidenavTypesTitle")}
              </h3>
            </div>
            <p className="text-[11px] text-slate-400 mb-3">
              {t("sidenavTypesDesc")}
            </p>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSidenavType(dispatch, "dark")}
                style={{
                  backgroundColor: sidenavType === "dark" ? "#2563eb" : "#111827",
                }}
                className={`
                  py-2.5 px-2 rounded-xl text-xs font-bold border transition-all text-center
                  ${
                    sidenavType === "dark"
                      ? "border-blue-500 text-white shadow-md shadow-blue-500/20"
                      : "border-slate-800 text-slate-300 hover:border-slate-700"
                  }
                `}
              >
                {t("sidenavDark")}
              </button>

              <button
                type="button"
                onClick={() => setSidenavType(dispatch, "white")}
                style={{
                  backgroundColor: sidenavType === "white" ? "#ffffff" : "#111827",
                  color: sidenavType === "white" ? "#0f172a" : "#cbd5e1",
                }}
                className={`
                  py-2.5 px-2 rounded-xl text-xs font-bold border transition-all text-center
                  ${
                    sidenavType === "white"
                      ? "border-white shadow-md"
                      : "border-slate-800 hover:border-slate-700"
                  }
                `}
              >
                {t("sidenavWhite")}
              </button>

              <button
                type="button"
                onClick={() => setSidenavType(dispatch, "transparent")}
                style={{
                  backgroundColor: sidenavType === "transparent" ? "#334155" : "#111827",
                }}
                className={`
                  py-2.5 px-2 rounded-xl text-xs font-bold border transition-all text-center
                  ${
                    sidenavType === "transparent"
                      ? "border-slate-500 text-white shadow-md"
                      : "border-slate-800 text-slate-300 hover:border-slate-700"
                  }
                `}
              >
                {t("sidenavTransparent")}
              </button>
            </div>
          </div>

          {/* 4. MÀU SẮC CHỦ ĐẠO (ACCENT COLORS) */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2.5">
              {t("sidenavColorsTitle")}
            </h3>
            <div className="flex items-center gap-3">
              {Object.keys(colorMap).map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSidenavColor(dispatch, color)}
                  className={`
                    w-7 h-7 rounded-full transition-all duration-150 flex items-center justify-center shadow-sm
                    ${colorMap[color]}
                    ${
                      sidenavColor === color
                        ? "scale-125 ring-2 ring-white ring-offset-2 ring-offset-slate-900"
                        : "hover:scale-110 opacity-75 hover:opacity-100"
                    }
                  `}
                >
                  {sidenavColor === color && (
                    <CheckIcon className="w-3.5 h-3.5 text-white stroke-[3]" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ===== FOOTER ===== */}
        <div
          style={{ backgroundColor: "#0f172a" }}
          className="p-4 border-t border-slate-800 text-center space-y-1 flex-shrink-0"
        >
          <div className="text-xs font-semibold text-slate-300 flex items-center justify-center gap-1.5">
            <span>{t("thankYou")}</span>
          </div>
          <div className="text-[10px] text-slate-500">
            {t("version")}
          </div>
        </div>
      </aside>
    </>
  );
}

Configurator.displayName = "/src/widgets/layout/configurator.jsx";

export default Configurator;
