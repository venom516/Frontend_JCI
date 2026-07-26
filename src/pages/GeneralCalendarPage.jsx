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

const TYPE_CONFIG = {
  event: { labelKey: "calendar.type_event", color: "#3b82f6" },
  task: { labelKey: "calendar.type_task", color: "#f59e0b" },
  urgent: { labelKey: "calendar.type_urgent", color: "#ef4444" },
  formation: { labelKey: "calendar.type_formation", color: "#10b981" },
};

const STATUS_OPTIONS = ["planifié", "en-cours", "terminé", "annulé"];
const PRIORITY_OPTIONS = ["basse", "moyenne", "haute", "urgente"];

export default function GeneralCalendarPage() {
  const { t } = useI18n();
  const calendarRef = useRef(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [editId, setEditId] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [currentView, setCurrentView] = useState("dayGridMonth");
  const [form, setForm] = useState({
    title: "", description: "", type: "event", startDate: "", endDate: "",
    color: TYPE_CONFIG.event.color, lieu: "", status: "planifié", priority: "moyenne"
  });

  useEffect(() => { fetchEvents(); }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await calendarAPI.getGeneral();
      setEvents(res.data.data || []);
    } catch { toast.error(t("common.erreur")); }
    finally { setLoading(false); }
  };

  const openCreate = (start) => {
    setEditId(null);
    setSelectedEvent(null);
    setForm({
      title: "", description: "", type: "event", startDate: start || "", endDate: "",
      color: TYPE_CONFIG.event.color, lieu: "", status: "planifié", priority: "moyenne"
    });
    setShowDetail(false);
    setShowForm(true);
  };

  const openEdit = (event) => {
    setEditId(event._id);
    setSelectedEvent(null);
    setForm({
      title: event.title || "",
      description: event.description || "",
      type: event.type || "event",
      startDate: event.startDate ? new Date(event.startDate).toISOString().slice(0, 16) : "",
      endDate: event.endDate ? new Date(event.endDate).toISOString().slice(0, 16) : "",
      color: event.color || TYPE_CONFIG[event.type]?.color || TYPE_CONFIG.event.color,
      lieu: event.lieu || "",
      status: event.status || "planifié",
      priority: event.priority || "moyenne",
    });
    setShowDetail(false);
    setShowForm(true);
  };

  const openDetail = (event) => {
    setSelectedEvent(event);
    setShowDetail(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.startDate) { toast.error(t("calendar.toast_title_required")); return; }
    try {
      if (editId) {
        await calendarAPI.updateGeneral(editId, form);
        toast.success(t("calendar.toast_updated"));
      } else {
        await calendarAPI.createGeneral(form);
        toast.success(t("calendar.toast_created"));
      }
      setShowForm(false);
      fetchEvents();
    } catch { toast.error(t("common.erreur")); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t("calendar.confirm_delete"))) return;
    try {
      await calendarAPI.deleteGeneral(id);
      toast.success(t("calendar.toast_deleted"));
      setShowDetail(false);
      fetchEvents();
    } catch { toast.error(t("common.erreur")); }
  };

  const handleDateSelect = (info) => openCreate(info.startStr);
  const handleEventClick = (info) => openDetail(info.event.extendedProps._raw || info.event);

  const handleEventDrop = async (info) => {
    try {
      const raw = info.event.extendedProps._raw;
      await calendarAPI.updateGeneral(raw._id, {
        startDate: info.event.start?.toISOString(),
        endDate: info.event.end?.toISOString(),
      });
      toast.success(t("calendar.toast_date_updated"));
      fetchEvents();
    } catch { toast.error(t("common.erreur")); }
  };

  const handleEventResize = async (info) => {
    try {
      const raw = info.event.extendedProps._raw;
      await calendarAPI.updateGeneral(raw._id, {
        startDate: info.event.start?.toISOString(),
        endDate: info.event.end?.toISOString(),
      });
      toast.success(t("calendar.toast_duration_updated"));
      fetchEvents();
    } catch { toast.error(t("common.erreur")); }
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
    .filter(e => !typeFilter || e.type === typeFilter)
    .map(e => ({
      id: e._id,
      title: e.title,
      start: e.startDate,
      end: e.endDate || e.startDate,
      backgroundColor: e.color || TYPE_CONFIG[e.type]?.color || TYPE_CONFIG.event.color,
      borderColor: e.color || TYPE_CONFIG[e.type]?.color || TYPE_CONFIG.event.color,
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
        <h1 className="text-2xl font-bold">{t("calendar.general_title")}</h1>
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
              <SelectTrigger className="w-36 h-9"><SelectValue placeholder={t("common.type")} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">{t("common.tous")}</SelectItem>
                {Object.entries(TYPE_CONFIG).map(([k, v]) => (
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
        {Object.entries(TYPE_CONFIG).map(([k, v]) => (
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
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: selectedEvent?.color || TYPE_CONFIG[selectedEvent?.type]?.color }} />
              {selectedEvent?.title}
            </DialogTitle>
            <DialogDescription>{t("calendar.details_title")}</DialogDescription>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-3">
              {selectedEvent.description && (
                <div><Label>{t("common.description")}</Label><p className="text-sm mt-0.5">{selectedEvent.description}</p></div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div><Label>{t("common.type")}</Label><p className="text-sm mt-0.5 font-medium">{t(TYPE_CONFIG[selectedEvent.type]?.labelKey) || selectedEvent.type}</p></div>
                {selectedEvent.lieu && <div><Label>{t("common.lieu")}</Label><p className="text-sm mt-0.5">{selectedEvent.lieu}</p></div>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>{t("common.date_debut")}</Label><p className="text-sm mt-0.5">{new Date(selectedEvent.startDate).toLocaleDateString("fr-FR", { dateStyle: "long" })} {new Date(selectedEvent.startDate).toLocaleTimeString("fr-FR", { timeStyle: "short" })}</p></div>
                {selectedEvent.endDate && <div><Label>{t("common.date_fin")}</Label><p className="text-sm mt-0.5">{new Date(selectedEvent.endDate).toLocaleDateString("fr-FR", { dateStyle: "long" })} {new Date(selectedEvent.endDate).toLocaleTimeString("fr-FR", { timeStyle: "short" })}</p></div>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                {selectedEvent.status && (
                  <div><Label>{t("common.statut")}</Label><div className="mt-0.5"><Badge variant={statusBadgeVariant(selectedEvent.status)}>{selectedEvent.status}</Badge></div></div>
                )}
                {selectedEvent.priority && <div><Label>{t("common.priorite")}</Label><p className="text-sm mt-0.5 capitalize">{selectedEvent.priority}</p></div>}
              </div>
              <div className="flex gap-2 pt-2">
                <Button size="sm" variant="outline" onClick={() => { setShowDetail(false); openEdit(selectedEvent); }}>
                  <Pencil className="w-4 h-4 mr-1" /> {t("common.modifier")}
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(selectedEvent._id)}>
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
            <DialogTitle>{editId ? t("calendar.form_edit_title") : t("calendar.form_add_title")}</DialogTitle>
            <DialogDescription>{editId ? t("calendar.form_edit_desc") : t("calendar.form_add_desc")}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><Label>{t("common.titre")} *</Label><Input value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} required /></div>
            <div><Label>{t("common.description")}</Label><Textarea value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>{t("common.type")}</Label>
                <Select value={form.type} onValueChange={(v) => setForm({...form, type: v, color: TYPE_CONFIG[v]?.color || form.color})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(TYPE_CONFIG).map(([k, v]) => (
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
              <div><Label>{t("common.date_debut")} *</Label><Input type="datetime-local" value={form.startDate} onChange={(e) => setForm({...form, startDate: e.target.value})} required /></div>
              <div><Label>{t("common.date_fin")}</Label><Input type="datetime-local" value={form.endDate} onChange={(e) => setForm({...form, endDate: e.target.value})} /></div>
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
            <div className="grid grid-cols-2 gap-3">
              <div><Label>{t("common.priorite")}</Label>
                <Select value={form.priority} onValueChange={(v) => setForm({...form, priority: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PRIORITY_OPTIONS.map(p => <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button type="submit">{editId ? t("common.modifier") : t("common.creer")}</Button>
              {editId && <Button type="button" variant="destructive" onClick={() => handleDelete(editId)}><Trash2 className="w-4 h-4 mr-1" /> {t("common.supprimer")}</Button>}
              <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>{t("common.annuler")}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
