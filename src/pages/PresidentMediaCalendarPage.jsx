import React, { useState, useEffect, useRef } from "react";
import { useI18n } from "../contexts/I18nContext";
import { calendarAPI } from "../api/axios";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";
import frLocale from "@fullcalendar/core/locales/fr";
import LoadingScreen from "../components/common/LoadingScreen";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../components/ui/dialog";
import { Badge } from "../components/ui/badge";
import { Plus, Trash2, Pencil, X, Search, ChevronLeft, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";

const MEDIA_CONFIG = {
  facebook: { labelKey: "media.type_facebook", color: "#1877F2" },
  instagram: { labelKey: "media.type_instagram", color: "#E4405F" },
  linkedin: { labelKey: "media.type_linkedin", color: "#0A66C2" },
  youtube: { labelKey: "media.type_youtube", color: "#FF0000" },
  story: { labelKey: "media.type_story", color: "#8B5CF6" },
  reel: { labelKey: "media.type_reel", color: "#F97316" },
  photo: { labelKey: "media.type_photo", color: "#10B981" },
  video: { labelKey: "media.type_video", color: "#6B7280" },
  communication: { labelKey: "media.type_communication", color: "#06B6D4" },
  design_graphique: { labelKey: "media.type_design_graphique", color: "#EC4899" },
  campagne: { labelKey: "media.type_campagne", color: "#8B5CF6" },
};

const STATUS_OPTIONS = ["planifié", "en-cours", "terminé", "annulé"];

const versInputLocal = (d) => {
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
};

const maintenantLocal = () => versInputLocal(new Date());

const plusUneMinute = (v) => {
  if (!v) return "";
  const [datePart, timePart] = String(v).split("T");
  const [y, m, d] = datePart.split("-").map(Number);
  const [hh, mm] = (timePart || "00:00").split(":").map(Number);
  return versInputLocal(new Date(y, m - 1, d, hh, mm + 1));
};

const prochaineMinute = () => plusUneMinute(maintenantLocal());

const maintenantMoinsTolerance = () => versInputLocal(new Date(Date.now() - 60000));

const aLaMinute = (d) => Math.floor(new Date(d).getTime() / 60000);

const depasseDansLePasse = (nouveau, ancien) => {
  const n = new Date(nouveau);
  if (Number.isNaN(n.getTime())) return false;
  if (n.getTime() >= Date.now() - 60000) return false;
  if (!ancien) return true;
  return aLaMinute(n) !== aLaMinute(ancien);
};

const messageErreur = (err, t) => err.response?.data?.message || err.translatedMessage || t("common.erreur");

const normaliserStart = (start, secours) => {
  if (!start) return secours !== undefined ? secours : maintenantLocal();
  if (typeof start === "string" && !start.includes("T")) {
    const [y, m, j] = start.split("-").map(Number);
    if (!y || !m || !j) return secours !== undefined ? secours : prochaineMinute();
    return versInputLocal(new Date(y, m - 1, j));
  }
  const d = new Date(start);
  if (Number.isNaN(d.getTime())) return secours !== undefined ? secours : prochaineMinute();
  return versInputLocal(d);
};

const debutDepuisClic = (start) => {
  const maintenant = new Date();
  const jour = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const aujourdhui = new Date(maintenant.getFullYear(), maintenant.getMonth(), maintenant.getDate());
  if (jour < aujourdhui) return null;
  if (jour.getTime() === aujourdhui.getTime()) return prochaineMinute();
  return versInputLocal(start);
};

export default function PresidentMediaCalendarPage() {
  const { t } = useI18n();
  const calendarRef = useRef(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [editId, setEditId] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [currentView, setCurrentView] = useState("dayGridMonth");
  const [dateMin, setDateMin] = useState("");
  const [dateInitiale, setDateInitiale] = useState("");
  const [form, setForm] = useState({
    title: "", description: "", mediaType: "facebook", startDate: "", endDate: "",
    color: MEDIA_CONFIG.facebook.color, lieu: "", status: "planifié"
  });

  useEffect(() => { fetchEvents(); }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await calendarAPI.getMedia();
      setEvents(res.data.data || []);
    } catch (error) { toast.error(error.response?.data?.message || error.translatedMessage || t("common.erreur")); }
    finally { setLoading(false); }
  };

  const openCreate = (start) => {
    setEditId(null);
    setDateMin(maintenantLocal());
    setDateInitiale("");
    setSelectedEvent(null);
    setForm({
      title: "", description: "", mediaType: "facebook", startDate: normaliserStart(start), endDate: "",
      color: MEDIA_CONFIG.facebook.color, lieu: "", status: "planifié"
    });
    setShowDetail(false);
    setShowForm(true);
  };

  const openEdit = (event) => {
    setEditId(event._id);
    setDateMin("");
    setDateInitiale(normaliserStart(event.startDate, ""));
    setSelectedEvent(null);
    setForm({
      title: event.title || "",
      description: event.description || "",
      mediaType: event.mediaType || "facebook",
      startDate: event.startDate ? normaliserStart(event.startDate, "") : "",
      endDate: event.endDate ? normaliserStart(event.endDate, "") : "",
      color: event.color || MEDIA_CONFIG[event.mediaType]?.color || MEDIA_CONFIG.facebook.color,
      lieu: event.lieu || "",
      status: event.status || "planifié",
    });
    setShowDetail(false);
    setShowForm(true);
  };

  const openDetail = (event) => {
    setSelectedEvent(event);
    setShowDetail(true);
  };

  const minStart = editId ? (form.startDate !== dateInitiale ? maintenantMoinsTolerance() : "") : (dateMin || "");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.startDate) { toast.error(t("calendar.toast_title_required")); return; }
    if (form.startDate !== dateInitiale && form.startDate && form.startDate < maintenantMoinsTolerance()) { toast.error(t(editId ? "calendar.deplacement_passe_interdit" : "calendar.date_passee_interdite")); return; }
    if (form.endDate && form.startDate && (editId ? form.endDate < form.startDate : form.endDate <= form.startDate)) { toast.error(t("calendar.date_fin_avant_debut")); return; }
    setProcessing(true);
    try {
      if (editId) {
        await calendarAPI.updateMedia(editId, form);
        toast.success(t("media.toast_updated"));
      } else {
        await calendarAPI.createMedia(form);
        toast.success(t("media.toast_created"));
      }
      setShowForm(false);
      fetchEvents();
<<<<<<< HEAD
    } catch { toast.error(t("common.erreur")); }
    finally { setProcessing(false); }
<<<<<<< HEAD
=======
=======
    } catch (error) { toast.error(error.response?.data?.message || error.translatedMessage || t("common.erreur")); }
>>>>>>> 47883136c2fca296e3dcd5a33f1106ec0316b78a
>>>>>>> 82d4b6f6dc74b5b05e36ebbdc5395ed46ed114c9
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t("media.confirm_delete"))) return;
    setProcessing(true);
    try {
      await calendarAPI.deleteMedia(id);
      toast.success(t("media.toast_deleted"));
      setShowDetail(false);
      fetchEvents();
<<<<<<< HEAD
    } catch { toast.error(t("common.erreur")); }
    finally { setProcessing(false); }
<<<<<<< HEAD
=======
=======
    } catch (error) { toast.error(error.response?.data?.message || error.translatedMessage || t("common.erreur")); }
>>>>>>> 47883136c2fca296e3dcd5a33f1106ec0316b78a
>>>>>>> 82d4b6f6dc74b5b05e36ebbdc5395ed46ed114c9
  };

  const handleDateSelect = (info) => {
    const debut = debutDepuisClic(info.start);
    if (!debut) return;
    openCreate(debut);
  };
  const handleEventClick = (info) => openDetail(info.event.extendedProps._raw || info.event);

  const handleEventDrop = async (info) => {
    const raw = info.event.extendedProps._raw;
    if (depasseDansLePasse(info.event.start, raw.startDate)) {
      info.revert();
      toast.error(t("calendar.deplacement_passe_interdit"));
      return;
    }
    try {
      await calendarAPI.updateMedia(raw._id, {
        startDate: info.event.start?.toISOString(),
        endDate: info.event.end?.toISOString(),
      });
      toast.success(t("calendar.toast_date_updated"));
      fetchEvents();
<<<<<<< HEAD
    } catch (err) { toast.error(messageErreur(err, t)); }
=======
<<<<<<< HEAD
    } catch (err) { toast.error(messageErreur(err, t)); }
=======
    } catch (error) { toast.error(error.response?.data?.message || error.translatedMessage || t("common.erreur")); }
>>>>>>> 47883136c2fca296e3dcd5a33f1106ec0316b78a
>>>>>>> 82d4b6f6dc74b5b05e36ebbdc5395ed46ed114c9
  };

  const handleEventResize = async (info) => {
    const raw = info.event.extendedProps._raw;
    if (depasseDansLePasse(info.event.start, raw.startDate)) {
      info.revert();
      toast.error(t("calendar.deplacement_passe_interdit"));
      return;
    }
    if (info.event.start && info.event.end && new Date(info.event.end) <= new Date(info.event.start)) {
      info.revert();
      toast.error(t("calendar.date_fin_avant_debut"));
      return;
    }
    try {
      await calendarAPI.updateMedia(raw._id, {
        startDate: info.event.start?.toISOString(),
        endDate: info.event.end?.toISOString(),
      });
      toast.success(t("calendar.toast_duration_updated"));
      fetchEvents();
<<<<<<< HEAD
    } catch (err) { toast.error(messageErreur(err, t)); }
=======
<<<<<<< HEAD
    } catch (err) { toast.error(messageErreur(err, t)); }
=======
    } catch (error) { toast.error(error.response?.data?.message || error.translatedMessage || t("common.erreur")); }
>>>>>>> 47883136c2fca296e3dcd5a33f1106ec0316b78a
>>>>>>> 82d4b6f6dc74b5b05e36ebbdc5395ed46ed114c9
  };

  const handleViewChange = (view) => {
    setCurrentView(view);
    const api = calendarRef.current?.getApi();
    if (api) api.changeView(view);
  };

  const handlePrev = () => { const api = calendarRef.current?.getApi(); if (api) api.prev(); };
  const handleNext = () => { const api = calendarRef.current?.getApi(); if (api) api.next(); };
  const handleToday = () => { const api = calendarRef.current?.getApi(); if (api) api.today(); };

  const calendarEvents = events
    .filter(e => !search || e.title.toLowerCase().includes(search.toLowerCase()))
    .filter(e => !typeFilter || e.mediaType === typeFilter)
    .map(e => ({
      id: e._id,
      title: e.title,
      start: e.startDate,
      end: e.endDate || e.startDate,
      backgroundColor: e.color || MEDIA_CONFIG[e.mediaType]?.color || MEDIA_CONFIG.facebook.color,
      borderColor: e.color || MEDIA_CONFIG[e.mediaType]?.color || MEDIA_CONFIG.facebook.color,
      extendedProps: { _raw: e },
    }));

  const statusBadgeVariant = (s) => {
    if (s === "annulé") return "destructive";
    if (s === "en-cours") return "default";
    if (s === "terminé") return "outline";
    return "secondary";
  };

  if (loading) return <LoadingScreen fullScreen={false} text={t("common.chargement")} />;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">{t("media.title")}</h1>
        <Button size="sm" onClick={() => openCreate("")}>
          <Plus className="w-4 h-4 mr-1.5" /> {t("calendar.ajouter")}
        </Button>
      </div>

      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" onClick={handlePrev}><ChevronLeft className="w-4 h-4" /></Button>
            <Button variant="outline" size="sm" onClick={handleToday}>{t("calendar.aujourdhui")}</Button>
            <Button variant="outline" size="icon" onClick={handleNext}><ChevronRight className="w-4 h-4" /></Button>
          </div>

          <div className="flex items-center gap-1 ml-2">
            <Button variant={currentView === "timeGridDay" ? "default" : "outline"} size="sm" onClick={() => handleViewChange("timeGridDay")}>{t("calendar.jour")}</Button>
            <Button variant={currentView === "timeGridWeek" ? "default" : "outline"} size="sm" onClick={() => handleViewChange("timeGridWeek")}>{t("calendar.semaine")}</Button>
            <Button variant={currentView === "dayGridMonth" ? "default" : "outline"} size="sm" onClick={() => handleViewChange("dayGridMonth")}>{t("calendar.mois")}</Button>
            <Button variant={currentView === "listMonth" ? "default" : "outline"} size="sm" onClick={() => handleViewChange("listMonth")}>{t("calendar.agenda")}</Button>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input className="w-48 pl-8 h-9" placeholder={t("common.rechercher") + "..."} value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-44 h-9"><SelectValue placeholder={t("media.plateforme")} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">{t("common.tous")}</SelectItem>
                {Object.entries(MEDIA_CONFIG).map(([k, v]) => (
                  <SelectItem key={k} value={k}>
                    <span className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: v.color }} />
                      {t(v.labelKey)}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={false}
          locales={[frLocale]}
          locale="fr"
          events={calendarEvents}
          selectable={true}
          editable={true}
          select={handleDateSelect}
          eventClick={handleEventClick}
          eventDrop={handleEventDrop}
          eventResize={handleEventResize}
          height="auto"
          slotMinTime="06:00:00"
          slotMaxTime="22:00:00"
          nowIndicator={true}
        />
      </Card>

      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
        {Object.entries(MEDIA_CONFIG).map(([k, v]) => (
          <span key={k} className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: v.color }} />
            {t(v.labelKey)}
          </span>
        ))}
      </div>

      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: selectedEvent?.color || MEDIA_CONFIG[selectedEvent?.mediaType]?.color }} />
              {selectedEvent?.title}
            </DialogTitle>
            <DialogDescription>{t("media.details_title")}</DialogDescription>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-3">
              {selectedEvent.description && (
                <div><Label>{t("common.description")}</Label><p className="text-sm mt-0.5">{selectedEvent.description}</p></div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div><Label>{t("media.plateforme")}</Label><p className="text-sm mt-0.5 font-medium">{t(MEDIA_CONFIG[selectedEvent.mediaType]?.labelKey) || selectedEvent.mediaType}</p></div>
                {selectedEvent.lieu && <div><Label>{t("common.lieu")}</Label><p className="text-sm mt-0.5">{selectedEvent.lieu}</p></div>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>{t("common.date_debut")}</Label><p className="text-sm mt-0.5">{new Date(selectedEvent.startDate).toLocaleDateString("fr-FR", { dateStyle: "long" })} {new Date(selectedEvent.startDate).toLocaleTimeString("fr-FR", { timeStyle: "short" })}</p></div>
                {selectedEvent.endDate && <div><Label>{t("common.date_fin")}</Label><p className="text-sm mt-0.5">{new Date(selectedEvent.endDate).toLocaleDateString("fr-FR", { dateStyle: "long" })} {new Date(selectedEvent.endDate).toLocaleTimeString("fr-FR", { timeStyle: "short" })}</p></div>}
              </div>
              {selectedEvent.status && (
                <div><Label>{t("common.statut")}</Label><div className="mt-0.5"><Badge variant={statusBadgeVariant(selectedEvent.status)}>{selectedEvent.status}</Badge></div></div>
              )}
              <div className="flex gap-2 pt-2">
                <Button size="sm" variant="outline" onClick={() => { setShowDetail(false); openEdit(selectedEvent); }}>
                  <Pencil className="w-4 h-4 mr-1" /> {t("common.modifier")}
                </Button>
                <Button size="sm" variant="destructive" disabled={processing} onClick={() => handleDelete(selectedEvent._id)}>
                  <Trash2 className="w-4 h-4 mr-1" /> {t("common.supprimer")}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setShowDetail(false)} className="ml-auto">
                  <X className="w-4 h-4 mr-1" /> {t("common.fermer")}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editId ? t("media.form_edit_title") : t("media.form_add_title")}</DialogTitle>
            <DialogDescription>{editId ? t("calendar.form_edit_desc") : t("calendar.form_add_desc")}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><Label>{t("common.titre")} *</Label><Input value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} required /></div>
            <div><Label>{t("common.description")}</Label><Textarea value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>{t("media.plateforme")}</Label>
                <Select value={form.mediaType} onValueChange={(v) => setForm({...form, mediaType: v, color: MEDIA_CONFIG[v]?.color || form.color})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(MEDIA_CONFIG).map(([k, v]) => (
                      <SelectItem key={k} value={k}>
                        <span className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: v.color }} />
                          {t(v.labelKey)}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div><Label>{t("common.couleur")}</Label><Input type="color" value={form.color} onChange={(e) => setForm({...form, color: e.target.value})} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>{t("common.date_debut")} *</Label><Input type="datetime-local" value={form.startDate} min={minStart || undefined} onChange={(e) => setForm({...form, startDate: e.target.value})} required /></div>
              <div><Label>{t("common.date_fin")}</Label><Input type="datetime-local" value={form.endDate} min={form.startDate ? plusUneMinute(form.startDate) : (minStart || undefined)} onChange={(e) => setForm({...form, endDate: e.target.value})} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>{t("common.lieu")}</Label><Input value={form.lieu} onChange={(e) => setForm({...form, lieu: e.target.value})} placeholder={t("calendar.lieu_placeholder")} /></div>
              <div><Label>{t("common.statut")}</Label>
                <Select value={form.status} onValueChange={(v) => setForm({...form, status: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map(s => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button type="submit" disabled={processing}>{editId ? t("common.modifier") : t("common.creer")}</Button>
              {editId && <Button type="button" variant="destructive" disabled={processing} onClick={() => handleDelete(editId)}><Trash2 className="w-4 h-4 mr-1" /> {t("common.supprimer")}</Button>}
              <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>{t("common.annuler")}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
