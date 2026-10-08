import { NavLink } from "react-router-dom";

const SidebarItem = ({ item, onClick, small = false }) => {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.href}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-3 font-medium rounded-lg px-3 transition-all duration-200 ${
          small ? "text-sm py-2" : "text-sm py-2.5"
        } ${
          isActive
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-surface-700 hover:bg-surface-100 hover:text-surface-900"
        }`
      }
    >
      {Icon && <Icon className="w-4 h-4 flex-shrink-0" />}
      <span>{item.title}</span>
    </NavLink>
  );
};

export default SidebarItem;
