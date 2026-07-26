import { getContrastColor } from "../../hooks/useSmartColor";

export default function SmartColor({ bgColor, children, className = "", as: Tag = "span", style = {}, ...props }) {
  const color = bgColor ? getContrastColor(bgColor) : undefined;
  return (
    <Tag
      className={className}
      style={{ ...(color ? { color } : {}), ...style }}
      {...props}
    >
      {children}
    </Tag>
  );
}
