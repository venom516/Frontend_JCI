export const NEWS_CHANGED_EVENT = "jci:news-changed";

export function notifyNewsChanged() {
  window.dispatchEvent(new CustomEvent(NEWS_CHANGED_EVENT));
}

export function subscribeNewsChanged(callback) {
  window.addEventListener(NEWS_CHANGED_EVENT, callback);
  return () => window.removeEventListener(NEWS_CHANGED_EVENT, callback);
}