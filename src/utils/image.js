const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

// Aucune image par défaut : l'image d'une actualite est toujours dynamique
// (import depuis le PC ou URL importee vers Cloudinary). Si elle n'existe pas,
// on renvoie null et la page affiche la carte sans photo.
export function resolveImage(src) {
  if (!src) return null;
  if (/^default-(news|event)\.jpg$/i.test(src)) return null;
  if (src.startsWith("data:")) return src;
  if (src.startsWith("http")) {
    if (src.includes("res.cloudinary.com")) return src;
    return `${API_URL}/images/proxy?url=${encodeURIComponent(src)}`;
  }
  return src;
}

// Si l'image ne charge pas (403, lien expire, suppression) on masque le bloc
// plutot que d'afficher une photo statique de remplacement.
export function handleImageError(e) {
  const el = e.currentTarget;
  el.onerror = null;
  el.removeAttribute("src");
  const box = el.closest("[data-img-box]");
  if (box) box.classList.add("hidden");
  else el.classList.add("hidden");
}