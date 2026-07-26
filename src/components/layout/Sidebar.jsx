import { useEffect, useRef, useCallback, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useI18n } from "../../contexts/I18nContext";
import { useSidebar } from "../../contexts/SidebarContext";
import SidebarItem from "./SidebarItem";
import {
  Home, Info, Mail, Newspaper, GraduationCap, LogIn, UserPlus,
  LayoutDashboard, Users, Calendar, ListTodo,
  Megaphone, FileText, UserCircle,
  CheckSquare, Phone, Globe, X, LogOut,
  Award, Star, Shield, CalendarDays, ChevronDown, ChevronRight
} from "lucide-react";

const Sidebar = () => {
  const navigate = useNavigate();
  const { isOpen, close } = useSidebar();
  const { user, isAuthenticated, hasAnyRole, logout } = useAuth();
  const { t, lang, changeLang } = useI18n();
  const sidebarRef = useRef(null);
  const [calendarOpen, setCalendarOpen] = useState(true);
  const [tasksOpen, setTasksOpen] = useState(true);

  const publicLinks = [
    { title: t("nav.accueil"), href: "/", icon: Home },
    { title: t("nav.a_propos"), href: "/about", icon: Info },
    { title: t("nav.contact"), href: "/contact", icon: Mail },
    { title: t("nav.actualites"), href: "/actualites", icon: Newspaper },
    { title: t("nav.formations"), href: "/formations", icon: GraduationCap },
    { title: t("nav.connexion"), href: "/login", icon: LogIn },
    { title: t("nav.inscription"), href: "/register", icon: UserPlus },
  ];

  const navItems = [
    { title: t("nav.dashboard"), href: "/dashboard", icon: LayoutDashboard, roles: null },
    { title: t("nav.profil"), href: "/profile", icon: UserCircle, roles: null },
  ];

  const managementItems = [
    { title: t("nav.membres"), href: "/members", icon: Users, roles: ["Admin", "President", "SecretaireGeneral", "ConseillerMedia"] },
    { title: t("nav.evenements"), href: "/events", icon: Calendar, roles: null },
    { title: t("nav.actualites"), href: "/news", icon: Newspaper, roles: ["ConseillerMedia", "President"] },
    { title: t("nav.publications"), href: "/publications", icon: Megaphone, roles: ["ConseillerMedia", "President"] },
    { title: t("nav.documents"), href: "/documents", icon: FileText, roles: ["SecretaireGeneral", "President"] },
  ];

  const calendarItems = [
    { title: t("nav.calendrier"), href: "/calendar", icon: Calendar, roles: null },
    { title: t("nav.calendrier_media"), href: "/calendar/media", icon: Calendar, roles: ["ConseillerMedia", "President"] },
    { title: t("nav.calendrier_president"), href: "/calendar/president", icon: Calendar, roles: ["President"] },
  ];

  const tasksItems = [
    { title: t("nav.taches_normale"), href: "/tasks/normale", icon: ListTodo, roles: null },
    { title: t("nav.taches_media"), href: "/tasks/media", icon: ListTodo, roles: ["ConseillerMedia", "President"] },
  ];

  const presidentItems = [
    { title: t("nav.validations_entretiens"), href: "/president/validations", icon: CheckSquare, roles: ["President"] },
    { title: t("nav.contacts"), href: "/president/contacts", icon: Phone, roles: ["President"] },
    { title: t("nav.config"), href: "/president/config", icon: Globe, roles: ["President"] },
  ];

  const dashboardItems = [
    { title: t("nav.membre"), href: "/dashboard/membre", icon: UserCircle, roles: ["Membre"] },
    { title: t("nav.past_president"), href: "/dashboard/past-president", icon: Award, roles: ["PP", "Past President"] },
    { title: t("nav.ppi"), href: "/dashboard/ppi", icon: Star, roles: ["PPI"] },
    { title: t("nav.senateur"), href: "/dashboard/senateur", icon: Shield, roles: ["Sénateur"] },
  ];

  const handleLogout = () => {
    logout();
    close();
    navigate("/login");
  };

  const filterByRole = useCallback((items) => items.filter((item) => !item.roles || hasAnyRole(item.roles)), [hasAnyRole]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        close();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, close]);

  useEffect(() => {
    if (isOpen && sidebarRef.current) {
      const firstButton = sidebarRef.current.querySelector("button");
      if (firstButton) firstButton.focus();
    }
  }, [isOpen]);

  const initials = user ? `${user.prenom?.[0] || ""}${user.nom?.[0] || ""}`.toUpperCase() : "JCI";

  return createPortal(
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-md z-40"
          onClick={close}
        />
      )}

      <aside
        ref={sidebarRef}
        role="dialog"
        aria-modal="true"
        aria-label={isAuthenticated ? t("nav.section_navigation") : t("nav.accueil")}
        className={`
          fixed top-0 z-50 h-full
          ltr:left-0 rtl:right-0
          bg-white/95 dark:bg-gray-900/95 backdrop-blur-2xl
          ltr:border-r rtl:border-l border-surface-200 dark:border-gray-700
          shadow-2xl
          flex flex-col
          transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : lang === "ar" ? "translate-x-full" : "-translate-x-full"}
          w-[85%] md:w-[70%] lg:w-[35%] lg:max-w-[350px]
        `}
      >
          <div className="flex items-center justify-between px-4 py-4 border-b border-surface-200/60 dark:border-gray-700/60 flex-shrink-0">
          <div className="flex items-center gap-3">
            <img src="/images/logo-jci.png" alt="JCI" className="h-10 w-auto dark:hidden object-top" />
            <img src="/images/logo-jci-white.png" alt="JCI" className="h-10 w-auto hidden dark:block object-top" />
            <div>
              <p className="text-sm font-bold text-primary-700 dark:text-primary-400">JCI Sidi Mansour</p>
              {isAuthenticated && (
                <p className="text-[10px] text-primary-500/70 dark:text-primary-400/70 truncate">{user?.role || t('common.membre')}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1">
            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="p-1.5 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all duration-200"
                aria-label={t("aria.deconnexion")}
              >
                <LogOut className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={close}
              className="p-1.5 rounded-lg text-surface-400 dark:text-gray-500 hover:text-surface-600 dark:hover:text-gray-300 hover:bg-surface-100 dark:hover:bg-gray-800 transition-all"
              aria-label={t("aria.fermer_menu")}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {isAuthenticated && user && (
          <div className="flex items-center gap-2 px-4 py-3 border-b border-surface-200/60 dark:border-gray-700/60 flex-shrink-0">
            <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-primary-200 dark:ring-primary-700">
              {user.photo ? (
                <img src={user.photo} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-xs font-bold text-white">
                  {initials}
                </div>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-primary-700 dark:text-primary-400 truncate">{user.prenom} {user.nom}</p>
              <p className="text-[11px] text-primary-500/70 dark:text-primary-400/70 truncate">{user.role || t('common.membre')}</p>
            </div>
          </div>
        )}

        <div className="flex-shrink-0 px-3 py-2 border-b border-surface-200/60 dark:border-gray-700/60">
          <div className="flex gap-1">
            {[
              { code: "fr", label: "FR" },
              { code: "ar", label: "AR" },
              { code: "en", label: "EN" },
            ].map((l) => (
              <button
                key={l.code}
                onClick={() => changeLang(l.code)}
                className={`flex-1 px-2 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 ${
                  lang === l.code
                    ? "bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300"
                    : "text-surface-400 dark:text-gray-500 hover:text-surface-600 dark:hover:text-gray-300 hover:bg-surface-100 dark:hover:bg-gray-800"
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1 scrollbar-hide">
          {isAuthenticated ? (
            <>
              {user?.role === "SecretaireGeneral" && (
                <>
                  <SidebarItem item={{ title: t("nav.profil"), href: "/profile", icon: UserCircle }} onClick={close} />
                  <SidebarItem item={{ title: t("nav.taches"), href: "/tasks", icon: ListTodo }} onClick={close} />
                  <SidebarItem item={{ title: t("nav.documents"), href: "/documents", icon: FileText }} onClick={close} />
                </>
              )}
              {user?.role === "ConseillerMedia" && (
                <>
                  <SidebarItem item={{ title: t("nav.profil"), href: "/profile", icon: UserCircle }} onClick={close} />
                  <SidebarItem item={{ title: t("nav.taches_media"), href: "/tasks/media", icon: ListTodo }} onClick={close} />
                  <SidebarItem item={{ title: t("nav.actualites"), href: "/news", icon: Newspaper }} onClick={close} />
                  <SidebarItem item={{ title: t("nav.publications"), href: "/publications", icon: Megaphone }} onClick={close} />
                  <SidebarItem item={{ title: t("nav.calendrier_media"), href: "/calendar/media", icon: Calendar }} onClick={close} />
                </>
              )}
              {user?.role === "President" && (
                <>
                  {navItems.map((item) => (
                    <SidebarItem key={item.href} item={item} onClick={close} />
                  ))}
                  {filterByRole(managementItems).map((item) => (
                    <SidebarItem key={item.href} item={item} onClick={close} />
                  ))}
                  <div className="space-y-1">
                    <button
                      onClick={() => setCalendarOpen(!calendarOpen)}
                      className="flex items-center gap-3 w-full text-sm font-medium rounded-lg px-3 py-2.5 text-surface-700 hover:bg-surface-100 hover:text-surface-900 transition-all duration-200"
                    >
                      <Calendar className="w-4 h-4 flex-shrink-0" />
                      <span className="flex-1 text-left">{t("nav.calendrier")}</span>
                      {calendarOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </button>
                    {calendarOpen && (
                      <div className="ml-4 space-y-1">
                        <SidebarItem item={{ title: t("calendar.general_title"), href: "/calendar/general", icon: Calendar }} onClick={close} />
                        <SidebarItem item={{ title: t("nav.calendrier_media"), href: "/calendar/president/media", icon: Calendar }} onClick={close} />
                      </div>
                    )}
                  </div>
                  <div className="space-y-1">
                    <button
                      onClick={() => setTasksOpen(!tasksOpen)}
                      className="flex items-center gap-3 w-full text-sm font-medium rounded-lg px-3 py-2.5 text-surface-700 hover:bg-surface-100 hover:text-surface-900 transition-all duration-200"
                    >
                      <ListTodo className="w-4 h-4 flex-shrink-0" />
                      <span className="flex-1 text-left">{t("nav.taches")}</span>
                      {tasksOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </button>
                    {tasksOpen && (
                      <div className="ml-4 space-y-1">
                        <SidebarItem item={{ title: t("nav.taches_normale"), href: "/tasks/normale", icon: ListTodo }} onClick={close} />
                        <SidebarItem item={{ title: t("nav.taches_media"), href: "/tasks/media", icon: ListTodo }} onClick={close} />
                      </div>
                    )}
                  </div>
                  {presidentItems.map((item) => (
                    <SidebarItem key={item.href} item={item} onClick={close} />
                  ))}
                  {filterByRole(dashboardItems).map((item) => (
                    <SidebarItem key={item.href} item={item} onClick={close} />
                  ))}
                </>
              )}
              {user?.role === "Membre" && (
                <>
                  <SidebarItem item={{ title: t("nav.dashboard"), href: "/dashboard", icon: LayoutDashboard }} onClick={close} />
                  <SidebarItem item={{ title: t("nav.profil"), href: "/profile", icon: UserCircle }} onClick={close} />
                  <SidebarItem item={{ title: t("nav.taches_evenements"), href: "/tasks-events", icon: CalendarDays }} onClick={close} />
                </>
              )}
              {!["President", "SecretaireGeneral", "ConseillerMedia", "Membre"].includes(user?.role) && (
                <>
                  {navItems.map((item) => (
                    <SidebarItem key={item.href} item={item} onClick={close} />
                  ))}
                  {filterByRole(managementItems).map((item) => (
                    <SidebarItem key={item.href} item={item} onClick={close} />
                  ))}
                  {filterByRole(tasksItems).map((item) => (
                    <SidebarItem key={item.href} item={item} onClick={close} />
                  ))}
                  {filterByRole(calendarItems).map((item) => (
                    <SidebarItem key={item.href} item={item} onClick={close} />
                  ))}
                  {filterByRole(dashboardItems).map((item) => (
                    <SidebarItem key={item.href} item={item} onClick={close} />
                  ))}
                </>
              )}
            </>
          ) : (
            publicLinks.map((item) => (
              <SidebarItem key={item.href} item={item} onClick={close} />
            ))
          )}
        </nav>

        <div className="flex-shrink-0 p-4 border-t border-surface-200/60 dark:border-gray-700/60 text-center">
          <p className="text-[10px] text-surface-400 dark:text-gray-500">&copy; {new Date().getFullYear()} JCI Sidi Mansour</p>
        </div>
      </aside>
    </>,
    document.body
  );
};

export default Sidebar;
