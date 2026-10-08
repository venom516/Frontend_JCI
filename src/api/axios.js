// frontend/src/api/axios.js

import axios from "axios";
import { translateErrorMessage } from "../utils/errorHelper";

// ============================================================
// CONFIGURATION
// ============================================================
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

// Timeout adaptatif : commence à 15s, monte jusqu'à 60s si réseau lent
let currentTimeout = 15000;

// Les uploads de fichiers passent par Cloudinary : la liaison est lente
// (~9 s par Mo). Le timeout adaptatif de 15s annulait les fichiers de plus
// de ~2 Mo, ce qui produisait « Request aborted » côté serveur.
const UPLOAD_TIMEOUT = 10 * 60 * 1000;

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: currentTimeout,
});

// ============================================================
// INTERCEPTEUR - Ajouter le token et horodater la requête
// ============================================================
axiosInstance.interceptors.request.use(
  (config) => {
    // Un FormData (upload de fichier) impose son propre Content-Type
    // multipart/form-data avec la boundary générée par le navigateur.
    // Sans cette suppression, le Content-Type "application/json" défini
    // plus haut est conservé, le FormData est sérialisé en JSON et le
    // fichier arrive côté serveur comme un objet vide {}.
    const estFormData =
      typeof FormData !== "undefined" && config.data instanceof FormData;
    if (estFormData) {
      delete config.headers["Content-Type"];
    }
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    config.timeout = estFormData ? UPLOAD_TIMEOUT : currentTimeout;
    config._startTime = Date.now();
    return config;
  },
  (error) => Promise.reject(error)
);

// ============================================================
// INTERCEPTEUR - Gérer les erreurs + timeout adaptatif
// ============================================================

<<<<<<< HEAD
// 403 qui signent une session terminée (le compte n'existe plus pour l'auth middleware).
// Un 403 de permission ("Seul le Président peut...") ne doit PAS déconnecter : c'est un
// refus normal, pas une session morte.
const SESSION_TERMINEE = [
=======
// Un compte banni/suspende/archive renvoie 403, pas 401 : sans ces messages la
// session reste "vivante" cote front alors que le backend refuse tout (§2.9).
const MESSAGES_SESSION_TERMINEE = [
>>>>>>> 47883136c2fca296e3dcd5a33f1106ec0316b78a
  "Votre compte a été banni",
  "Votre compte est suspendu",
  "Votre compte a été archivé",
];

<<<<<<< HEAD
const terminerSession = () => {
  const publicPages = ["/", "/home", "/about", "/contact", "/login", "/register", "/forgot-password", "/verify-email", "/actualites"];
  if (publicPages.includes(window.location.pathname)) return;
=======
// Comparaison par prefixe : une liste de chemins exacts oublie /news/:id et
// /actualites/:id, qui sont publiques et ne doivent pas purger la session.
const ROUTES_PUBLIQUES = [
  "/",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
  "/about",
  "/contact",
  "/formations",
  "/actualites",
  "/news",
  "/membres/inscription",
];

const estPagePublique = (pathname) =>
  ROUTES_PUBLIQUES.some(
    (route) =>
      route === "/"
        ? pathname === "/"
        : pathname === route || pathname.startsWith(route + "/")
  );

const terminerSession = () => {
>>>>>>> 47883136c2fca296e3dcd5a33f1106ec0316b78a
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.dispatchEvent(new CustomEvent("auth:unauthorized"));
};

axiosInstance.interceptors.response.use(
  (response) => {
    const elapsed = Date.now() - (response.config._startTime || 0);
    if (elapsed < 8000 && currentTimeout > 15000) {
      currentTimeout = Math.max(15000, currentTimeout - 5000);
    }
    return response;
  },
  (error) => {
    if (error.code === "ECONNABORTED" || (error.message && error.message.includes("timeout"))) {
      currentTimeout = Math.min(60000, currentTimeout + 10000);
    }

    const status = error.response?.status;
    const rawMsg = error.response?.data?.message || error.message;
    const detail = error.response?.data?.error;
    error.translatedMessage = translateErrorMessage(rawMsg);
    
    if (!error.response) {
      const networkMsg = "Connexion au serveur impossible. Vérifiez votre connexion internet.";
      error.translatedMessage = networkMsg;
    }

<<<<<<< HEAD
    if (error.response?.status === 401) {
      terminerSession();
    }

    // Un compte archivé / banni / suspendu reçoit 403, pas 401 : sans ce cas,
    // le token reste dans le navigateur et chaque appel échoue en boucle.
    if (error.response?.status === 403 && SESSION_TERMINEE.includes(rawMsg)) {
=======
    const sessionTerminee =
      status === 401 || (status === 403 && MESSAGES_SESSION_TERMINEE.includes(rawMsg));

    // 403 ordinaire = refus de permission : on garde la session.
    if (sessionTerminee && !estPagePublique(window.location.pathname)) {
>>>>>>> 47883136c2fca296e3dcd5a33f1106ec0316b78a
      terminerSession();
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;

// ============================================================
// API AUTH
// ============================================================
export const authAPI = {
  register: (data) => axiosInstance.post("/auth/register", data),
  login: (data) => axiosInstance.post("/auth/login", data),
  getMe: () => axiosInstance.get("/auth/me"),
  verifyEmail: (data) => axiosInstance.post("/auth/verify-email", data),
  verifyEmailByToken: (data) => axiosInstance.post("/auth/verify-email-token", data),
  logout: () => axiosInstance.post("/auth/logout"),
  forgotPassword: (data) => axiosInstance.post("/auth/forgot-password", data),
  verifyResetCode: (data) => axiosInstance.post("/auth/verify-reset-code", data),
  resetPassword: (data) => axiosInstance.post("/auth/reset-password", data),
  sendVerification: (data) => axiosInstance.post("/auth/send-verification", data),
  tokenLogin: (data) => axiosInstance.post("/auth/token-login", data),
  memberTokenLogin: (data) => axiosInstance.post("/auth/member-token-login", data),
};

// ============================================================
// API MEMBRES
// ============================================================
export const membreAPI = {
  getAll: (params) => axiosInstance.get("/membres", { params }),
  create: (data) => axiosInstance.post("/membres", data),
  getById: (id) => axiosInstance.get(`/membres/${id}`),
  update: (id, data) => axiosInstance.put(`/membres/${id}`, data),
  validate: (id, action) => axiosInstance.put(`/membres/${id}/validate`, { action }),
  suspendre: (id) => axiosInstance.put(`/membres/${id}/suspendre`),
  reactiver: (id) => axiosInstance.put(`/membres/${id}/reactiver`),
  bannir: (id) => axiosInstance.put(`/membres/${id}/bannir`),
  delete: (id) => axiosInstance.delete(`/membres/${id}`),
  deletePermanent: (id) => axiosInstance.delete(`/membres/${id}/permanent`),
  getStats: () => axiosInstance.get("/membres/stats"),
  getPublicStats: () => axiosInstance.get("/membres/stats/public"),
  getByRole: (role) => axiosInstance.get(`/membres/roles/${role}`),
  getByStatus: (status) => axiosInstance.get(`/membres/statuts/${status}`),
  getBureau: (config) => axiosInstance.get('/membres/bureau', config),
  getAllRoles: () => axiosInstance.get('/membres/roles-list'),
  createRole: (name) => axiosInstance.post('/membres/roles', { name }),
  renameRole: (oldName, newName) => axiosInstance.put('/membres/roles/rename', { oldName, newName }),
  deleteRole: (role) => axiosInstance.delete(`/membres/roles/${role}`),
  acceptMember: (id, data) => axiosInstance.put(`/membres/${id}/accept`, data),
  rejectMember: (id) => axiosInstance.put(`/membres/${id}/reject`),
};

// ============================================================
// API TASKS - VERSION FINALE
// ============================================================
export const taskAPI = {
  getAll: (params) => axiosInstance.get("/tasks", { params }),
  getStats: () => axiosInstance.get("/tasks/stats"),
  getById: (id) => axiosInstance.get(`/tasks/${id}`),
  create: (data) => axiosInstance.post("/tasks", data),
  createMedia: (data) => axiosInstance.post("/tasks/media", data),
  update: (id, data) => axiosInstance.put(`/tasks/${id}`, data),
  updateStatus: (id, statut) => axiosInstance.put(`/tasks/${id}/status`, { statut }),
  delete: (id) => axiosInstance.delete(`/tasks/${id}`),
  addComment: (id, content) => axiosInstance.post(`/tasks/${id}/comments`, { content }),
  getCalendar: (params) => axiosInstance.get("/tasks/calendar", { params }),
  getMediaCalendar: (params) => axiosInstance.get("/tasks/media-calendar", { params }),
  notifyMediaTask: (id) => axiosInstance.post(`/tasks/${id}/notify`),
  getCount: () => axiosInstance.get("/tasks/count"),
};

// ============================================================
// API NEWS
// ============================================================
export const newsAPI = {
  getAll: (params) => axiosInstance.get("/news", { params }),
  getPublic: (params) => axiosInstance.get("/news/public", { params }),
  getPublicById: (id) => axiosInstance.get(`/news/public/${id}`),
  getById: (id) => axiosInstance.get(`/news/${id}`),
  create: (data) => axiosInstance.post("/news", data),
  update: (id, data) => axiosInstance.put(`/news/${id}`, data),
  delete: (id) => axiosInstance.delete(`/news/${id}`),
  publish: (id) => axiosInstance.put(`/news/${id}/publish`),
  archive: (id) => axiosInstance.put(`/news/${id}/archive`),
  like: (id) => axiosInstance.post(`/news/${id}/like`),
  addComment: (id, content) => axiosInstance.post(`/news/${id}/comments`, { content }),
};

// ============================================================
// API EVENTS
// ============================================================
export const eventAPI = {
  getAll: (params) => axiosInstance.get("/events", { params }),
  getStats: () => axiosInstance.get("/events/stats"),
  getById: (id) => axiosInstance.get(`/events/${id}`),
  create: (data) => axiosInstance.post("/events", data),
  update: (id, data) => axiosInstance.put(`/events/${id}`, data),
  delete: (id) => axiosInstance.delete(`/events/${id}`),
  participate: (id) => axiosInstance.post(`/events/${id}/participate`),
  updateStatus: (id, status) => axiosInstance.put(`/events/${id}/status`, { status }),
  getCount: (params) => axiosInstance.get("/events/count", { params }),
};

// ============================================================
// API DOCUMENTS
// ============================================================
export const documentAPI = {
  getAll: (params) => axiosInstance.get("/documents", { params }),
  getById: (id) => axiosInstance.get(`/documents/${id}`),
upload: (data, config) => axiosInstance.post("/documents", data, config),
    update: (id, data, config) => axiosInstance.put(`/documents/${id}`, data, config),
  delete: (id) => axiosInstance.delete(`/documents/${id}`),
  approve: (id) => axiosInstance.put(`/documents/${id}/approve`),
  archive: (id) => axiosInstance.put(`/documents/${id}/archive`),
  soumettre: (id) => axiosInstance.put(`/documents/${id}/soumettre`),
  rejeter: (id) => axiosInstance.put(`/documents/${id}/rejeter`),
  download: (id) => axiosInstance.get(`/documents/${id}/download`, {
    responseType: 'blob',
  }),
};

// ============================================================
// API ENTRETIENS
// ============================================================
export const entretienAPI = {
  getAll: (params) => axiosInstance.get("/entretiens", { params }),
  getStats: () => axiosInstance.get("/entretiens/stats"),
  getById: (id) => axiosInstance.get(`/entretiens/${id}`),
  create: (data) => axiosInstance.post("/entretiens", data),
  update: (id, data) => axiosInstance.put(`/entretiens/${id}`, data),
  delete: (id) => axiosInstance.delete(`/entretiens/${id}`),
  approve: (id) => axiosInstance.put(`/entretiens/${id}/approve`),
  reject: (id) => axiosInstance.put(`/entretiens/${id}/reject`),
  terminer: (id) => axiosInstance.put(`/entretiens/${id}/terminer`),
};

// ============================================================
// API PUBLICATIONS
// ============================================================
export const publicationAPI = {
  getAll: (params) => axiosInstance.get("/publications", { params }),
  getStats: () => axiosInstance.get("/publications/stats"),
  getById: (id) => axiosInstance.get(`/publications/${id}`),
  create: (data) => axiosInstance.post("/publications", data, {
    headers: { "Content-Type": undefined },
  }),
  update: (id, data) => axiosInstance.put(`/publications/${id}`, data, {
    headers: { "Content-Type": undefined },
  }),
  delete: (id) => axiosInstance.delete(`/publications/${id}`),
  publish: (id) => axiosInstance.put(`/publications/${id}/publish`),
  archive: (id) => axiosInstance.put(`/publications/${id}/archive`),
  soumettre: (id) => axiosInstance.put(`/publications/${id}/soumettre`),
  rejeter: (id) => axiosInstance.put(`/publications/${id}/rejeter`),
  updateStats: (id, data) => axiosInstance.put(`/publications/${id}/stats`, data),
  publishDirect: (data) => axiosInstance.post("/publications/publish-direct", data, {
    headers: { "Content-Type": undefined },
  }),
};

// ============================================================
// API DASHBOARD
// ============================================================
export const dashboardAPI = {
  getMe: () => axiosInstance.get("/dashboard/me"),
  getPresident: () => axiosInstance.get("/dashboard/president"),
  getSG: () => axiosInstance.get("/dashboard/sg"),
  getMedia: () => axiosInstance.get("/dashboard/media"),
  getMembre: () => axiosInstance.get("/dashboard/membre"),
};

// ============================================================
// API CONTACT
// ============================================================
export const contactAPI = {
  submit: (data) => axiosInstance.post("/contact", data),
  getAll: () => axiosInstance.get("/contact"),
  markAsRead: (id) => axiosInstance.put(`/contact/${id}/read`),
  delete: (id) => axiosInstance.delete(`/contact/${id}`),
};

export const siteConfigAPI = {
  get: () => axiosInstance.get("/site-config"),
update: (data) => axiosInstance.put("/site-config", data),
  removeGroupPhoto: () => axiosInstance.delete("/site-config/group-photo"),
};

export const calendarAPI = {
  getGeneral: (params) => axiosInstance.get("/calendar/general", { params }),
  createGeneral: (data) => axiosInstance.post("/calendar/general", data),
  updateGeneral: (id, data) => axiosInstance.put("/calendar/general/" + id, data),
  deleteGeneral: (id) => axiosInstance.delete("/calendar/general/" + id),
  getMedia: (params) => axiosInstance.get("/calendar/media", { params }),
  createMedia: (data) => axiosInstance.post("/calendar/media", data),
  updateMedia: (id, data) => axiosInstance.put("/calendar/media/" + id, data),
  deleteMedia: (id) => axiosInstance.delete("/calendar/media/" + id),
};