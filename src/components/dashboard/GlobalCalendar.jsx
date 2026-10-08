import { useState, useEffect, useMemo } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import frLocale from "@fullcalendar/core/locales/fr";
import arLocale from "@fullcalendar/core/locales/ar";
import { eventAPI, taskAPI } from "../../api/axios";
import { useI18n } from "../../contexts/I18nContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CalendarDays, ClipboardList, Clock, Flag, MapPin, UserPlus, Users } from "lucide-react";
import { Link } from "react-router-dom";

const PRIORITY_COLORS = {
  basse: "#10B981",
  moyenne: "#3B82F6",
  haute: "#F59E0B",
  critique: "#EF4444",
};

const DetailRow = ({ icon, label, value }) => {
  if (!value) return null;
  return (
    <div className="flex items-start gap-2 text-sm">
      {icon}
      <span className="font-semibold flex-shrink-0">{label}</span>
      <span className="text-muted-foreground break-words">{value}</span>
    </div>
  );
};

/**
 * Calendrier global : affiche tous les événements ET toutes les tâches
 * de l'association sur un même calendrier. Un clic ouvre le détail.
 */
export default function GlobalCalendar() {
  const { t, lang, formatDateTime, translateStatus } = useI18n();
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [evRes, taskRes] = await Promise.all([eventAPI.getAll(), taskAPI.getAll()]);
        const events = (evRes.data?.data || []).map((e) => ({
          id: "event-" + e._id,
          title: e.titre,
          start: e.date,
          end: e.dateFin || e.date,
          allDay: true,
          backgroundColor: "#06B6D4",
          borderColor: "#06B6D4",
          extendedProps: { kind: "evenement", raw: e },
        }));
        const tasks = (taskRes.data?.data || []).map((task) => ({
          id: "task-" + task._id,
          title: task.titre,
          start: task.deadline,
          allDay: true,
          backgroundColor: PRIORITY_COLORS[task.priority] || "#F59E0B",
          borderColor: PRIORITY_COLORS[task.priority] || "#F59E0B",
          extendedProps: { kind: "tache", raw: task },
        }));
        setItems([...events, ...tasks]);
      } catch (err) {
        console.error("Erreur chargement calendrier global:", err);
        setItems([]);
      }
    };
    load();
  }, []);

  const filtered = useMemo(
    () => (filter === "all" ? items : items.filter((i) => i.extendedProps.kind === filter)),
    [items, filter]
  );

  const counts = useMemo(
    () => ({
      evenements: items.filter((i) => i.extendedProps.kind === "evenement").length,
      taches: items.filter((i) => i.extendedProps.kind === "tache").length,
    }),
    [items]
  );

  const raw = selected?.raw || {};
  const isEvent = selected?.kind === "evenement";
  const fullName = (p) => (p ? `${p.prenom || ""} ${p.nom || ""}`.trim() : "");

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-primary" />
              {t("dashboard.calendrier_global")}
            </CardTitle>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => setFilter("all")} variant={filter === "all" ? "default" : "ghost"} size="sm">
                {t("dashboard.filtre_tout")} ({counts.evenements + counts.taches})
              </Button>
              <Button onClick={() => setFilter("evenement")} variant={filter === "evenement" ? "default" : "ghost"} size="sm">
                {t("dashboard.filtre_evenements")} ({counts.evenements})
              </Button>
              <Button onClick={() => setFilter("tache")} variant={filter === "tache" ? "default" : "ghost"} size="sm">
                {t("dashboard.filtre_taches")} ({counts.taches})
              </Button>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            {t("dashboard.calendrier_sous_titre")} — {t("dashboard.clic_pour_details")}
          </p>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-12">
              {t("dashboard.aucun_element_calendrier")}
            </p>
          ) : (
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              headerToolbar={{ left: "prev,next today", center: "title", right: "dayGridMonth,timeGridWeek,timeGridDay" }}
              locale={lang === "ar" ? arLocale : frLocale}
              direction={lang === "ar" ? "rtl" : "ltr"}
              initialView="dayGridMonth"
              events={filtered}
              eventClick={(info) => {
                setSelected({ ...info.event.extendedProps, title: info.event.title, start: info.event.start });
                setOpen(true);
              }}
              height="auto"
            />
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        {selected && (
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {isEvent ? <CalendarDays className="h-5 w-5 text-cyan-600" /> : <ClipboardList className="h-5 w-5 text-amber-600" />}
                {selected.title}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {isEvent ? t("dashboard.detail_evenement") : t("dashboard.detail_tache")}
                </Badge>
                {!isEvent && raw.statut && (
                  <Badge variant="secondary" className="text-xs">
                    {translateStatus?.(raw.statut) || raw.statut}
                  </Badge>
                )}
              </div>

              <DetailRow icon={<Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />} label={t("dashboard.date_debut")} value={selected.start ? formatDateTime(selected.start) : ""} />
              {raw.dateFin && <DetailRow icon={<Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />} label={t("dashboard.date_fin")} value={formatDateTime(raw.dateFin)} />}
              {isEvent && <DetailRow icon={<MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />} label={t("dashboard.lieu")} value={raw.lieu} />}
              {isEvent && <DetailRow icon={<CalendarDays className="h-4 w-4 text-muted-foreground flex-shrink-0" />} label={t("dashboard.type")} value={raw.type} />}
              {!isEvent && <DetailRow icon={<Flag className="h-4 w-4 text-muted-foreground flex-shrink-0" />} label={t("dashboard.priorite")} value={raw.priority} />}
              {!isEvent && <DetailRow icon={<Users className="h-4 w-4 text-muted-foreground flex-shrink-0" />} label={t("dashboard.assigne_a")} value={fullName(raw.membre)} />}
              {isEvent && Array.isArray(raw.participants) && raw.participants.length > 0 && (
                <DetailRow icon={<Users className="h-4 w-4 text-muted-foreground flex-shrink-0" />} label={t("dashboard.participants")} value={raw.participants.map(fullName).filter(Boolean).join(", ")} />
              )}

              {raw.description && (
                <div className="pt-2 border-t">
                  <p className="font-semibold text-sm mb-1">{t("dashboard.description")}</p>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{raw.description}</p>
                </div>
              )}
              {isEvent && raw.ordreDuJour && (
                <div className="pt-2 border-t">
                  <p className="font-semibold text-sm mb-1">{t("dashboard.ordre_du_jour")}</p>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{raw.ordreDuJour}</p>
                </div>
              )}

              {raw.createdBy && (
                <DetailRow icon={<UserPlus className="h-4 w-4 text-muted-foreground flex-shrink-0" />} label={t("dashboard.cree_par")} value={fullName(raw.createdBy)} />
              )}
            </div>

            <div className="flex gap-2 mt-6">
              <Button asChild className="flex-1">
                <Link to={isEvent ? "/events" : "/tasks"}>{t("common.voir")}</Link>
              </Button>
              <Button onClick={() => setOpen(false)} variant="ghost" className="flex-1">
                {t("common.fermer")}
              </Button>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </>
  );
}
