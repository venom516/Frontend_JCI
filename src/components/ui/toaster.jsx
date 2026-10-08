import { Toaster } from "react-hot-toast"
import { useI18n } from "../../contexts/I18nContext"

// index.css :root definit --background: hsl(0, 0%, 97%), deja wrappe.
// Ecrire hsl(var(--background)) produirait hsl(hsl(0, 0%, 97%)) : la
// declaration est rejetee et aucun style ne s'applique. On utilise donc
// var(--x) tel quel (convention racine, PARTIE 6.2).
const base = {
  background: "var(--background)",
  color: "var(--foreground)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius)",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
  padding: "12px 16px",
  fontSize: "0.875rem",
}

// Le fond d'erreur doit etre surcharge explicitement : toast.error ne
// colore que l'icone par defaut, pas l'enveloppe.
const ToasterWrapper = () => {
  const { isRTL } = useI18n()
  return (
    <Toaster
      position={isRTL ? "bottom-left" : "bottom-right"}
      toastOptions={{
        duration: 5000,
        style: base,
        success: {
          style: {
            ...base,
            background: "#ECFDF5",
            color: "#065F46",
            border: "1px solid #A7F3D0",
          },
          iconTheme: {
            primary: "#10B981",
            secondary: "#FFFFFF",
          },
        },
        error: {
          style: {
            ...base,
            background: "#FEF2F2",
            color: "#7F1D1D",
            border: "1px solid #FCA5A5",
          },
          iconTheme: {
            primary: "#DC2626",
            secondary: "#FFFFFF",
          },
        },
        loading: {
          style: base,
        },
      }}
    />
  )
}

export { ToasterWrapper as Toaster }
