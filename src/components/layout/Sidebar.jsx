import { useEffect, useRef, useCallback, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useI18n } from "../../contexts/I18nContext";
import { useSidebar } from "../../contexts/SidebarContext";
import { taskAPI, eventAPI } from "../../api/axios";
import SidebarItem from "./SidebarItem";
import {
  Home, Info, Mail, Newspaper, LogIn, UserPlus,
  LayoutDashboard, Users, Calendar, ListTodo,
  Megaphone, FileText, UserCircle,
  CheckSquare, Phone, Globe, X, LogOut,
  Award, Star, Shield, ChevronDown, ChevronRight,
  ChevronLeft, Clock, Tag
} from "lucide-react";

const AccordionGroup = ({ title, icon: Icon, open, onToggle, onClose, items }) => {
  return (
    <div className="space-y-1">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex items-center gap-3 w-full text-sm font-medium rounded-lg px-3 py-2.5 text-surface-700 hover:bg-surface-100 hover:text-surface-900 transition-all duration-200"
      >
        <Icon className="w-4 h-4 flex-shrink-0" />
        <span className="flex-1 text-left">{title}</span>
        <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
      </button>
      <div
        className={`grid transition-all duration-300 ease-in-out ${
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden min-h-0">
          <div className="ms-4 space-y-1 pt-1">
            {items.map((item) => (
              <SidebarItem key={item.href} small item={item} onClick={onClose} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const Sidebar = () => {
  const navigate = useNavigate();
  const { isOpen, close } = useSidebar();
  const { user, isAuthenticated, hasAnyRole, logout } = useAuth();
  const { t, lang, changeLang, formatDateTime } = useI18n();
  const sidebarRef = useRef(null);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [tasksOpen, setTasksOpen] = useState(false);
  const [validationsOpen, setValidationsOpen] = useState(false);

  const publicLinks = [
    { title: t("nav.accueil"), href: "/", icon: Home },
    { title: t("nav.a_propos"), href: "/about", icon: Info },
    { title: t("nav.contact"), href: "/contact", icon: Mail },
    { title: t("nav.actualites"), href: "/actualites", icon: Newspaper },
    { title: t("nav.connexion"), href: "/login", icon: LogIn },
    { title: t("nav.inscription"), href: "/register", icon: UserPlus },
  ];

  const navItems = [
    { title: t("nav.dashboard"), href: "/dashboard", icon: LayoutDashboard, roles: null },
    { title: t("nav.profil"), href: "/profile", icon: UserCircle, roles: null },
  ];

  const managementItems = [
    { title: t("nav.membres"), href: "/members", icon: Users, roles: ["President"] },
    { title: t("nav.evenements"), href: "/events", icon: Calendar, roles: ["Membre", "President", "ConseillerMedia"] },
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

  // Mini-calendrier membre (tâches + événements)
  const [memberTasks, setMemberTasks] = useState([]);
  const [memberEvents, setMemberEvents] = useState([]);
  const [calLoading, setCalLoading] = useState(false);
  const [calMonth, setCalMonth] = useState(new Date());
  const [selDate, setSelDate] = useState(null);
  const [selItems, setSelItems] = useState([]);
  const [detailItem, setDetailItem] = useState(null);

  useEffect(() => {
    if (["Membre", "VPFD", "VPPRE"].includes(user?.role) && user?._id) {
      setCalLoading(true);
      Promise.all([
        taskAPI.getAll({ membre: user._id }),
        eventAPI.getAll()
      ]).then(([tRes, eRes]) => {
        setMemberTasks(tRes.data.data || []);
        setMemberEvents(eRes.data.data || []);
      }).catch(() => {}).finally(() => setCalLoading(false));
    }
  }, [user?._id, user?.role]);

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];
    const start = firstDay.getDay();
    for (let i = 0; i < start; i++) {
      const prevDate = new Date(year, month, -i);
      days.unshift({ date: prevDate, isCurrentMonth: false });
    }
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push({ date: new Date(year, month, i), isCurrentMonth: true });
    }
    return days;
  };

  const getItemsForDate = (date) => {
    const ds = date.toDateString();
    const tasks = memberTasks.filter((t) => new Date(t.deadline).toDateString() === ds);
    const events = memberEvents.filter((e) => new Date(e.date).toDateString() === ds);
    return [...tasks.map(t => ({ ...t, _itemType: 'task' })), ...events.map(e => ({ ...e, _itemType: 'event' }))];
  };

  const handleDayClick = (date) => {
    setSelDate(date);
    setSelItems(getItemsForDate(date));
    setDetailItem(null);
  };

  const changeCalMonth = (delta) => {
    const m = new Date(calMonth);
    m.setMonth(m.getMonth() + delta);
    setCalMonth(m);
    setSelDate(null);
    setSelItems([]);
    setDetailItem(null);
  };

  const openDetail = (item) => setDetailItem(item);
  const closeDetail = () => setDetailItem(null);

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
            <img src="/images/logo-jci.png" alt="JCI" className="h-[50px] w-auto dark:hidden object-top" />
            <img src="/images/logo-jci-white.png" alt="JCI" className="h-[50px] w-auto hidden dark:block object-top" />
            <div>
              <p className="text-sm font-bold text-primary-700 dark:text-primary-400">JCI Sidi Mansour</p>
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
                  <SidebarItem item={{ title: t("nav.dashboard"), href: "/dashboard/sg", icon: LayoutDashboard }} onClick={close} />
                  <SidebarItem item={{ title: t("nav.profil"), href: "/profile", icon: UserCircle }} onClick={close} />
                  <SidebarItem item={{ title: t("nav.documents"), href: "/documents", icon: FileText }} onClick={close} />
                  <SidebarItem item={{ title: t("nav.evenements"), href: "/events", icon: Calendar }} onClick={close} />
                  <AccordionGroup
                    title={t("nav.taches")}
                    icon={ListTodo}
                    open={tasksOpen}
                    onToggle={() => setTasksOpen(!tasksOpen)}
                    onClose={close}
                    items={[{ title: t("nav.taches_normale"), href: "/tasks/normale", icon: ListTodo }]}
                  />
                </>
              )}
              {user?.role === "ConseillerMedia" && (
                <>
                  <SidebarItem item={{ title: t("nav.profil"), href: "/profile", icon: UserCircle }} onClick={close} />
                  <SidebarItem item={{ title: t("nav.actualites"), href: "/news", icon: Newspaper }} onClick={close} />
                  <SidebarItem item={{ title: t("nav.publications"), href: "/publications", icon: Megaphone }} onClick={close} />
                  <AccordionGroup
                    title={t("nav.calendrier")}
                    icon={Calendar}
                    open={calendarOpen}
                    onToggle={() => setCalendarOpen(!calendarOpen)}
                    onClose={close}
                    items={[{ title: t("nav.calendrier_media"), href: "/calendar/media", icon: Calendar }]}
                  />
                  <AccordionGroup
                    title={t("nav.taches")}
                    icon={ListTodo}
                    open={tasksOpen}
                    onToggle={() => setTasksOpen(!tasksOpen)}
                    onClose={close}
                    items={[{ title: t("nav.taches_media"), href: "/tasks/media", icon: ListTodo }]}
                  />
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
                  <AccordionGroup
                    title={t("nav.calendrier")}
                    icon={Calendar}
                    open={calendarOpen}
                    onToggle={() => setCalendarOpen(!calendarOpen)}
                    onClose={close}
                    items={[
                      { title: t("calendar.general_title"), href: "/calendar/general", icon: Calendar },
                      { title: t("nav.calendrier_media"), href: "/calendar/president/media", icon: Calendar },
                    ]}
                  />
                  <AccordionGroup
                    title={t("nav.taches")}
                    icon={ListTodo}
                    open={tasksOpen}
                    onToggle={() => setTasksOpen(!tasksOpen)}
                    onClose={close}
                    items={[
                      { title: t("nav.taches_normale"), href: "/tasks/normale", icon: ListTodo },
                      { title: t("nav.taches_media"), href: "/tasks/media", icon: ListTodo },
                    ]}
                  />
                  <AccordionGroup
                    title={t("nav.validations_entretiens")}
                    icon={CheckSquare}
                    open={validationsOpen}
                    onToggle={() => setValidationsOpen(!validationsOpen)}
                    onClose={close}
                    items={[
                      { title: t("nav.validations"), href: "/president/validations", icon: CheckSquare },
                      { title: t("nav.entretiens"), href: "/president/entretiens", icon: CheckSquare },
                    ]}
                  />
                  {presidentItems.map((item) => (
                    <SidebarItem key={item.href} item={item} onClick={close} />
                  ))}
                  {filterByRole(dashboardItems).map((item) => (
                    <SidebarItem key={item.href} item={item} onClick={close} />
                  ))}
                </>
              )}
              {["Membre", "VPFD", "VPPRE"].includes(user?.role) && (
                <>
                  <SidebarItem item={{ title: t("nav.dashboard"), href: "/dashboard", icon: LayoutDashboard }} onClick={close} />
                  <SidebarItem item={{ title: t("nav.profil"), href: "/profile", icon: UserCircle }} onClick={close} />
                  <SidebarItem item={{ title: t("nav.evenements"), href: "/events", icon: Calendar }} onClick={close} />
                  <div className="pt-3 pb-1 px-2">
                    <p className="text-xs font-semibold text-surface-400 dark:text-gray-500 uppercase tracking-wider">{t("dashboard.mes_taches")}</p>
                  </div>
                  <div className="px-2">
                    {selItems.length > 0 && (
                      <div className="mb-2 space-y-1.5 p-2 bg-primary-50 dark:bg-primary-900/20 rounded-lg border border-primary-100 dark:border-primary-800">
                        {selItems.map((item) => (
                          <button
                            key={item._id}
                            onClick={() => openDetail(item)}
                            className="w-full text-left text-xs hover:bg-primary-100 dark:hover:bg-primary-800/30 rounded p-1.5 transition-colors"
                          >
                            <p className="font-medium text-primary-700 dark:text-primary-300 truncate">
                              {item._itemType === 'event' ? '📅 ' : '📋 '}{item.titre}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5 text-surface-400 dark:text-gray-500">
                              <span className="flex items-center gap-0.5">
                                <Clock className="w-3 h-3" />
                                {new Date(item._itemType === 'event' ? item.date : item.deadline).toLocaleTimeString(lang === "ar" ? "ar-TN" : lang === "en" ? "en-US" : "fr-FR", { hour: "2-digit", minute: "2-digit" })}
                              </span>
                              <span className="flex items-center gap-0.5">
                                <Tag className="w-3 h-3" />
                                {item._itemType === 'event' ? item.type : (item.priority || item.statut)}
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                    <div className="bg-surface-50 dark:bg-gray-800/50 rounded-lg p-2">
                      <div className="flex items-center justify-between mb-1">
                        <button onClick={() => changeCalMonth(-1)} className="p-1 rounded hover:bg-surface-200 dark:hover:bg-gray-700 transition-colors">
                          <ChevronLeft className="w-3.5 h-3.5 text-surface-500" />
                        </button>
                        <span className="text-xs font-semibold text-surface-700 dark:text-gray-300">
                          {calMonth.toLocaleDateString(lang === "ar" ? "ar-TN" : lang === "en" ? "en-US" : "fr-FR", { month: "long", year: "numeric" })}
                        </span>
                        <button onClick={() => changeCalMonth(1)} className="p-1 rounded hover:bg-surface-200 dark:hover:bg-gray-700 transition-colors">
                          <ChevronRight className="w-3.5 h-3.5 text-surface-500" />
                        </button>
                      </div>
                      <div className="grid grid-cols-7 text-center mb-1">
                        {[t("sidebar.cal_day_lun"), t("sidebar.cal_day_mar"), t("sidebar.cal_day_mer"), t("sidebar.cal_day_jeu"), t("sidebar.cal_day_ven"), t("sidebar.cal_day_sam"), t("sidebar.cal_day_dim")].map((d, i) => (
                          <span key={i} className="text-[10px] font-semibold text-surface-400 dark:text-gray-500 py-0.5">{d}</span>
                        ))}
                      </div>
                      <div className="grid grid-cols-7 text-center">
                        {getDaysInMonth(calMonth).map((day, i) => {
                          const hasItems = getItemsForDate(day.date).length > 0;
                          const isToday = day.date.toDateString() === new Date().toDateString();
                          const isSelected = selDate && day.date.toDateString() === selDate.toDateString();
                          return (
                            <button
                              key={i}
                              onClick={() => handleDayClick(day.date)}
                              disabled={!day.isCurrentMonth}
                              className={`relative text-[11px] py-1 rounded transition-colors ${
                                !day.isCurrentMonth ? "text-surface-300 dark:text-gray-600" :
                                isSelected ? "bg-primary-600 text-white font-bold" :
                                isToday ? "bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 font-semibold" :
                                "text-surface-600 dark:text-gray-300 hover:bg-surface-200 dark:hover:bg-gray-700"
                              }`}
                            >
                              {day.date.getDate()}
                              {hasItems && !isSelected && (
                                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary-500 dark:bg-primary-400" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </>
              )}
              {!["President", "SecretaireGeneral", "ConseillerMedia", "Membre", "VPFD", "VPPRE"].includes(user?.role) && (
                <>
                  {navItems.map((item) => (
                    <SidebarItem key={item.href} item={item} onClick={close} />
                  ))}
                  {filterByRole(managementItems).map((item) => (
                    <SidebarItem key={item.href} item={item} onClick={close} />
                  ))}
                  <AccordionGroup
                    title={t("nav.calendrier")}
                    icon={Calendar}
                    open={calendarOpen}
                    onToggle={() => setCalendarOpen(!calendarOpen)}
                    onClose={close}
                    items={filterByRole(calendarItems)}
                  />
                  <AccordionGroup
                    title={t("nav.taches")}
                    icon={ListTodo}
                    open={tasksOpen}
                    onToggle={() => setTasksOpen(!tasksOpen)}
                    onClose={close}
                    items={filterByRole(tasksItems)}
                  />
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

      {detailItem && (
        <>
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[60]" onClick={closeDetail} />
          <div className="fixed top-0 right-0 z-[70] h-full w-[85%] md:w-[70%] lg:w-[400px] bg-white dark:bg-gray-900 shadow-2xl ltr:border-l rtl:border-r border-surface-200 dark:border-gray-700 overflow-y-auto transition-transform duration-300 ease-in-out translate-x-0">
            <div className="flex items-center justify-between px-4 py-3 border-b border-surface-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-900 z-10">
              <h3 className="text-sm font-bold text-surface-900 dark:text-gray-100 truncate">
                {detailItem._itemType === 'event' ? '📅 ' : '📋 '}{detailItem.titre}
              </h3>
              <button onClick={closeDetail} className="p-1.5 rounded-lg text-surface-400 hover:text-surface-600 hover:bg-surface-100 dark:hover:bg-gray-800 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 space-y-4 text-sm">
              {detailItem.description && (
                <div>
                  <p className="text-xs font-semibold text-surface-400 dark:text-gray-500 uppercase tracking-wider mb-1">{t("sidebar.detail_description")}</p>
                  <p className="text-surface-700 dark:text-gray-300">{detailItem.description}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                {detailItem._itemType === 'event' ? (
                  <>
                    <div>
                      <p className="text-xs font-semibold text-surface-400 dark:text-gray-500 uppercase">{t("sidebar.detail_type")}</p>
                      <p className="text-surface-700 dark:text-gray-300 font-medium">{detailItem.type}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-surface-400 dark:text-gray-500 uppercase">{t("common.date")}</p>
                      <p className="text-surface-700 dark:text-gray-300 font-medium">{new Date(detailItem.date).toLocaleDateString(lang === "ar" ? "ar-TN" : lang === "en" ? "en-US" : "fr-FR", { day: "numeric", month: "long", year: "numeric" })}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-surface-400 dark:text-gray-500 uppercase">{t("sidebar.detail_heure")}</p>
                      <p className="text-surface-700 dark:text-gray-300 font-medium">{new Date(detailItem.date).toLocaleTimeString(lang === "ar" ? "ar-TN" : lang === "en" ? "en-US" : "fr-FR", { hour: "2-digit", minute: "2-digit" })}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-surface-400 dark:text-gray-500 uppercase">{t("sidebar.detail_lieu")}</p>
                      <p className="text-surface-700 dark:text-gray-300 font-medium">{detailItem.lieu || t("sidebar.detail_non_specifie")}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-surface-400 dark:text-gray-500 uppercase">{t("sidebar.detail_statut")}</p>
                      <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded ${
                        detailItem.status === "planifiée" ? "bg-amber-100 text-amber-800" :
                        detailItem.status === "en-cours" ? "bg-blue-100 text-blue-800" :
                        detailItem.status === "terminée" ? "bg-emerald-100 text-emerald-800" :
                        detailItem.status === "annulée" ? "bg-red-100 text-red-800" :
                        "bg-gray-100 text-gray-800"
                      }`}>{detailItem.status}</span>
                    </div>
                    {detailItem.dateFin && (
                      <div>
                        <p className="text-xs font-semibold text-surface-400 dark:text-gray-500 uppercase">{t("sidebar.detail_date_fin")}</p>
                        <p className="text-surface-700 dark:text-gray-300 font-medium">{new Date(detailItem.dateFin).toLocaleDateString(lang === "ar" ? "ar-TN" : lang === "en" ? "en-US" : "fr-FR", { day: "numeric", month: "long" })}</p>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div>
                      <p className="text-xs font-semibold text-surface-400 dark:text-gray-500 uppercase">{t("sidebar.detail_deadline")}</p>
                      <p className="text-surface-700 dark:text-gray-300 font-medium">{new Date(detailItem.deadline).toLocaleDateString(lang === "ar" ? "ar-TN" : lang === "en" ? "en-US" : "fr-FR", { day: "numeric", month: "long", year: "numeric" })}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-surface-400 dark:text-gray-500 uppercase">{t("sidebar.detail_heure")}</p>
                      <p className="text-surface-700 dark:text-gray-300 font-medium">{new Date(detailItem.deadline).toLocaleTimeString(lang === "ar" ? "ar-TN" : lang === "en" ? "en-US" : "fr-FR", { hour: "2-digit", minute: "2-digit" })}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-surface-400 dark:text-gray-500 uppercase">{t("sidebar.detail_priorite")}</p>
                      <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded ${
                        detailItem.priority === "haute" || detailItem.priority === "high" ? "bg-red-100 text-red-800" :
                        detailItem.priority === "moyenne" || detailItem.priority === "medium" ? "bg-amber-100 text-amber-800" :
                        detailItem.priority === "basse" || detailItem.priority === "low" ? "bg-emerald-100 text-emerald-800" :
                        "bg-gray-100 text-gray-800"
                      }`}>{detailItem.priority || t("sidebar.detail_moyenne")}</span>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-surface-400 dark:text-gray-500 uppercase">{t("sidebar.detail_statut")}</p>
                      <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded ${
                        detailItem.statut === "terminée" ? "bg-emerald-100 text-emerald-800" :
                        detailItem.statut === "assignée" ? "bg-blue-100 text-blue-800" :
                        detailItem.statut === "en-cours" ? "bg-amber-100 text-amber-800" :
                        detailItem.statut === "créée" ? "bg-gray-100 text-gray-800" :
                        "bg-gray-100 text-gray-800"
                      }`}>{detailItem.statut || "créée"}</span>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-surface-400 dark:text-gray-500 uppercase">{t("sidebar.detail_type")}</p>
                      <p className="text-surface-700 dark:text-gray-300 font-medium">{detailItem.taskType === "media" ? t("sidebar.detail_task_media") : t("sidebar.detail_task_normale")}</p>
                    </div>
                  </>
                )}
              </div>
              {detailItem._itemType === 'event' && detailItem.ordreDuJour && (
                <div>
                  <p className="text-xs font-semibold text-surface-400 dark:text-gray-500 uppercase tracking-wider mb-1">{t("sidebar.detail_ordre_jour")}</p>
                  <p className="text-surface-700 dark:text-gray-300 whitespace-pre-wrap">{detailItem.ordreDuJour}</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>,
    document.body
  );
};

export default Sidebar;
