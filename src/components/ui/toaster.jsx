import { Toaster } from "react-hot-toast"

// Un style racine s'applique a success, error ET loading : sans surcharge par
// type, une erreur s'affiche avec le fond neutre et n'est plus distinguable.
const base = {
  borderRadius: "var(--radius)",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
  padding: "12px 16px",
  fontSize: "0.875rem",
}

const surface = (fond, texte, bordure) => ({
  ...base,
  background: `hsl(var(${fond}))`,
  color: `hsl(var(${texte}))`,
  border: `1px solid hsl(var(${bordure}))`,
})

const ToasterWrapper = () => {
  return (
    <Toaster
      position="bottom-right"
      toastOptions={{
        duration: 5000,
        style: surface("--card", "--card-foreground", "--border"),
        success: {
          style: surface("--primary", "--primary-foreground", "--primary"),
          iconTheme: {
            primary: "hsl(var(--primary-foreground))",
            secondary: "hsl(var(--primary))",
          },
        },
        error: {
          style: surface("--destructive", "--destructive-foreground", "--destructive"),
          iconTheme: {
            primary: "hsl(var(--destructive-foreground))",
            secondary: "hsl(var(--destructive))",
          },
        },
        loading: {
          style: surface("--muted", "--foreground", "--border"),
        },
      }}
    />
  )
}

export { ToasterWrapper as Toaster }