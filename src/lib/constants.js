import {
  LayoutDashboard,
  Users,
  Calendar,
  ListTodo,
  Newspaper,
  BookOpen,
  FileText,
  MessagesSquare,
  Megaphone,
  UserCircle,
  Settings,
  ShieldCheck,
  CheckSquare,
  Phone,
  Globe,
} from "lucide-react";

export const navItems = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: null },
  { title: "Profil", href: "/profile", icon: UserCircle, roles: null },
];

export const managementItems = [
  { title: "Membres", href: "/members", icon: Users, roles: ["Admin", "President", "SecretaireGeneral", "ConseillerMedia"] },
  { title: "Tâches", href: "/tasks", icon: ListTodo, roles: null },
  { title: "Événements", href: "/events", icon: Calendar, roles: null },
  { title: "Entretiens", href: "/entretiens", icon: MessagesSquare, roles: null },
  { title: "Actualités", href: "/news", icon: Newspaper, roles: ["ConseillerMedia", "President"] },
  { title: "Publications", href: "/publications", icon: Megaphone, roles: ["ConseillerMedia", "President"] },
  { title: "Documents", href: "/documents", icon: FileText, roles: ["SecretaireGeneral", "President"] },
];

export const calendarItems = [
  { title: "Calendrier", href: "/calendar", icon: Calendar, roles: null },
  { title: "Calendrier Media", href: "/calendar/media", icon: Calendar, roles: ["ConseillerMedia", "President"] },
  { title: "Calendrier Président", href: "/calendar/president", icon: Calendar, roles: ["President"] },
];

export const presidentItems = [
  { title: "Validations", href: "/president/validations", icon: CheckSquare, roles: ["President"] },
  { title: "Contacts", href: "/president/contacts", icon: Phone, roles: ["President"] },
  { title: "Configuration", href: "/president/config", icon: Globe, roles: ["President"] },
];

export const dashboardItems = [
  { title: "Admin", href: "/dashboard/admin", icon: Settings, roles: ["Admin", "President"] },
  { title: "SG", href: "/dashboard/sg", icon: FileText, roles: ["SecretaireGeneral", "President"] },
  { title: "Media", href: "/dashboard/media", icon: Megaphone, roles: ["ConseillerMedia", "President"] },
  { title: "Président", href: "/dashboard/president", icon: ShieldCheck, roles: ["President"] },
  { title: "Membre", href: "/dashboard/membre", icon: UserCircle, roles: ["Membre"] },
];
