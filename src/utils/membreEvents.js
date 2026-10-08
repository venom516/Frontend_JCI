// ============================================================
// BUS D'EVENEMENTS "MEMBRES MODIFIES"
// ============================================================
// Memes principes que utils/newsEvents.js, avec deux complements :
//
// 1. Multi-onglets : un membre peut etre ajoute depuis un autre onglet
//    (formulaire d'inscription public) alors que la page Membres est
//    ouverte. Un CustomEvent ne traverse pas les onglets, on utilise donc
//    en plus un signal localStorage : l'evenement "storage" n'est declenche
//    que dans les AUTRES onglets, ce qui est exactement ce qu'on cherche.
//
// 2. Rafraichissement immediat plutot que d'attendre le polling de 30 s
//    de useAutoRefresh. Le polling reste en filet de securite.
// ============================================================

export const MEMBRES_CHANGED_EVENT = "jci:membres-changed";

const CROSS_TAB_KEY = "jci:membres-changed-ping";

export function notifyMembresChanged() {
  window.dispatchEvent(new CustomEvent(MEMBRES_CHANGED_EVENT));
  try {
    // L'evenement "storage" ne se declenche que si la valeur CHANGE. Date.now()
    // seul ne suffit pas : deux modifications dans la meme milliseconde
    // partageraient la meme valeur et la seconde serait perdue. Le melange
    // horodatage + aleatoire rend la valeur unique sans dependre d'un etat de
    // module (donc robuste meme si le module est charge en double).
    localStorage.setItem(CROSS_TAB_KEY, `${Date.now()}-${Math.random()}`);
  } catch (e) {
    // localStorage indisponible (mode prive) : l'evenement local suffit.
  }
}

export function subscribeMembresChanged(callback) {
  const onStorage = (e) => {
    if (e.key === CROSS_TAB_KEY) callback();
  };

  window.addEventListener(MEMBRES_CHANGED_EVENT, callback);
  window.addEventListener("storage", onStorage);

  return () => {
    window.removeEventListener(MEMBRES_CHANGED_EVENT, callback);
    window.removeEventListener("storage", onStorage);
  };
}