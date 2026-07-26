import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useI18n } from "../../contexts/I18nContext";
import { useTheme } from "next-themes";
import jci from "../../config/jci";
import { Menu, X, Sun, Moon } from "lucide-react";

const Navbar = () => {
  const { t, lang, changeLang } = useI18n();
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinkClass = (path) =>
    `relative px-4 py-2.5 text-base font-medium rounded-lg transition-all duration-200 ${
      location.pathname === path
        ? "text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30"
        : "text-surface-700/70 dark:text-gray-300/70 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50/50 dark:hover:bg-primary-900/20"
    }`;

  const mobileLinkClass = (path) =>
    `block px-4 py-2.5 rounded-lg text-base font-medium transition-colors ${
      location.pathname === path
        ? "text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30"
        : "text-surface-600 dark:text-gray-400 hover:text-surface-900 dark:hover:text-gray-100 hover:bg-surface-50 dark:hover:bg-gray-800"
    }`;

  const closeMobile = () => setMobileOpen(false);

  return (
    <nav className="sticky top-0 z-[100] bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-b border-surface-200/60 dark:border-gray-700/60 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[72px]">
          <Link to="/" className="flex items-center gap-3 group shrink-0">
            <div className="w-14 h-14 rounded-2xl bg-white/40 dark:bg-gray-800/40 backdrop-blur-xl flex items-center justify-center border border-white/60 dark:border-gray-700/60 shadow-soft group-hover:shadow-glow transition-all duration-300">
              <img src="/images/logo-jci.png" alt={jci.nom} className="h-11 w-auto dark:hidden" />
              <img src="/images/logo-jci-white.png" alt={jci.nom} className="h-11 w-auto hidden dark:block" />
            </div>
            <span className="text-xl font-bold text-primary-700 dark:text-primary-400 font-display">
              JCI<span className="text-primary-500 dark:text-primary-400"> </span>Sidi Mansour
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-2">
            <Link to="/" className={navLinkClass("/")}>{t("nav.accueil")}</Link>
            <Link to="/about" className={navLinkClass("/about")}>{t("nav.a_propos")}</Link>
            <Link to="/contact" className={navLinkClass("/contact")}>{t("nav.contact")}</Link>

            <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-surface-50/80 dark:bg-gray-800/80 border border-surface-200/50 dark:border-gray-700/50">
              {[
                { code: "fr", label: "FR" },
                { code: "ar", label: "AR" },
                { code: "en", label: "EN" },
              ].map((l) => (
                <button
                  key={l.code}
                  onClick={() => changeLang(l.code)}
                  className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all ${
                    lang === l.code
                      ? "bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300"
                      : "text-surface-400 dark:text-gray-500 hover:text-surface-600 dark:hover:text-gray-300"
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>

            <div className="w-px h-6 bg-primary-200 dark:bg-gray-600" />

            <a href={jci.facebook} target="_blank" rel="noopener noreferrer"
              className="px-2 py-2.5 text-base font-medium text-primary-700/70 dark:text-gray-300/70 hover:text-primary-600 dark:hover:text-primary-400 rounded-lg hover:bg-primary-50/50 dark:hover:bg-primary-900/20 transition-all duration-200" title={t("nav.facebook")}>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
            </a>
            <a href={jci.instagram} target="_blank" rel="noopener noreferrer"
              className="px-2 py-2.5 text-base font-medium text-primary-700/70 dark:text-gray-300/70 hover:text-primary-600 dark:hover:text-primary-400 rounded-lg hover:bg-primary-50/50 dark:hover:bg-primary-900/20 transition-all duration-200" title={t("nav.instagram")}>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
            </a>
            <a href={jci.linkedin} target="_blank" rel="noopener noreferrer"
              className="px-2 py-2.5 text-base font-medium text-primary-700/70 dark:text-gray-300/70 hover:text-primary-600 dark:hover:text-primary-400 rounded-lg hover:bg-primary-50/50 dark:hover:bg-primary-900/20 transition-all duration-200" title={t("nav.linkedin")}>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
            </a>
            <a href={jci.youtube} target="_blank" rel="noopener noreferrer"
              className="px-2 py-2.5 text-base font-medium text-primary-700/70 dark:text-gray-300/70 hover:text-primary-600 dark:hover:text-primary-400 rounded-lg hover:bg-primary-50/50 dark:hover:bg-primary-900/20 transition-all duration-200" title={t("nav.youtube")}>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>
            </a>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2.5 rounded-lg text-primary-700/70 dark:text-gray-300/70 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50/50 dark:hover:bg-primary-900/20 transition-all duration-200"
              aria-label={t("aria.basculer_theme")}
            >
              {theme === "light" ?
              <Moon className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              :<Sun className="h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            }</button>

            <div className="flex items-center gap-3">
              <Link to="/login" className="px-5 py-2.5 text-base font-medium text-primary-700/70 dark:text-gray-300/70 hover:text-primary-600 dark:hover:text-primary-400 rounded-lg hover:bg-primary-50/50 dark:hover:bg-primary-900/20 transition-all duration-200">
                {t("nav.connexion")}
              </Link>
              <Link to="/register" className="btn-primary text-base !py-2.5">
                {t("nav.inscription")}
              </Link>
            </div>
          </div>

          <button className="md:hidden p-2.5 rounded-lg text-primary-700/70 dark:text-gray-300/70 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50/50 dark:hover:bg-primary-900/20" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
          </button>
        </div>
      </div>

       {mobileOpen && (
        <div className="md:hidden border-t border-surface-200 dark:border-gray-700 bg-white dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 py-4 space-y-2">
            <Link to="/" className={mobileLinkClass("/")} onClick={closeMobile}>{t("nav.accueil")}</Link>
            <Link to="/about" className={mobileLinkClass("/about")} onClick={closeMobile}>{t("nav.a_propos")}</Link>
            <Link to="/contact" className={mobileLinkClass("/contact")} onClick={closeMobile}>{t("nav.contact")}</Link>
            <div className="pt-4 border-t border-surface-200">
              <div className="flex gap-2 px-3">
                {[
                  { code: "fr", label: "FR" },
                  { code: "ar", label: "AR" },
                  { code: "en", label: "EN" },
                ].map((l) => (
                  <button
                    key={l.code}
                    onClick={() => { changeLang(l.code); closeMobile(); }}
                    className={`flex-1 px-3 py-2 text-sm font-semibold rounded-lg transition-all ${
                      lang === l.code
                        ? "bg-primary-100 text-primary-700"
                        : "text-surface-400 hover:text-surface-600 hover:bg-surface-100"
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="pt-4 border-t border-surface-200 flex items-center gap-3">
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-2.5 rounded-lg text-primary-700/70 hover:text-primary-600 hover:bg-primary-50/50"
                aria-label={t("aria.basculer_theme")}
              >
                {theme === "light" ?
                <Moon className="w-6 h-6 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                :<Sun className="w-6 h-6 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />}
              </button>
              <Link to="/login" className="flex-1 btn-ghost text-primary-700/70 hover:text-primary-600 justify-center" onClick={closeMobile}>{t("nav.connexion")}</Link>
              <Link to="/register" className="flex-1 btn-primary justify-center text-base" onClick={closeMobile}>{t("nav.inscription")}</Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
