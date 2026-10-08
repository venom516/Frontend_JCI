import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useI18n } from "../contexts/I18nContext";
import { taskAPI } from "../api/axios";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import frLocale from "@fullcalendar/core/locales/fr";
import { Skeleton } from "../components/ui/skeleton";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { AlertTriangle, CalendarDays, User, X, Plus } from "lucide-react";
import toast from "react-hot-toast";

const MediaCalendarPage = () => {
  const { t, formatDate } = useI18n();
  const { user, isPresident, isMedia } = useAuth();
  const calendarRef = useRef(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState(null);

  const canManageMedia = isPresident || isMedia;

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    setError(null);
    try {

      const response = await taskAPI.getMediaCalendar();


      if (response.data && response.data.success) {
        const eventsData = response.data.data || [];
        
        const formattedEvents = eventsData.map(event => ({
          id: event.id,
        title: event.title || t('common.sans_titre'),
          start: event.start || new Date(),
          end: event.end || event.start || new Date(),
          allDay: event.allDay || false,
          color: '#059669',
          extendedProps: {
            type: event.extendedProps?.type || 'Task Media',
            statut: event.extendedProps?.statut || 'creee',
            priorite: event.extendedProps?.priorite || 'moyenne',
            description: event.extendedProps?.description || '',
            membre: event.extendedProps?.membre || t('common.non_assigne')
          }
        }));
        
        setEvents(formattedEvents);

      } else {
        setEvents([]);
        console.warn("Pas de donnees dans la reponse");
      }
    } catch (error) {
      console.error("Erreur:", error);
      setError(error.message);
      toast.error(error.response?.data?.message || error.translatedMessage || t('calendrier.erreur_chargement'));
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEventClick = (info) => {
    try {
      const event = info.event;
      setSelectedEvent({
        id: event.id,
        title: event.title,
        start: event.start,
        end: event.end,
        allDay: event.allDay,
        extendedProps: event.extendedProps || {}
      });
      setShowModal(true);
    } catch (error) {
      console.error("Erreur lors du clic:", error);
      toast.error(error.response?.data?.message || error.translatedMessage || t('calendrier.erreur_details'));
    }
  };

  const handleNotify = async (eventId) => {
    try {
      await taskAPI.notifyMediaTask(eventId);
      toast.success(t('calendrier.succes_notification'));
      fetchEvents();
    } catch (error) {
      console.error("Erreur:", error);
      toast.error(error.response?.data?.message || t('calendrier.erreur_envoi'));
    }
  };

  const handleError = (errorInfo) => {
    console.error("Erreur FullCalendar:", errorInfo);
    toast.error(t('calendrier.erreur_affichage'));
  };

  if (loading) return (
    <div className="min-h-screen bg-muted/30">
      <div className="page-container">
        <Skeleton className="h-24 mb-8 rounded-xl" />
        <Skeleton className="h-[500px] rounded-xl" />
      </div>
    </div>
  );

  if (error) {
    return (
      <div className="min-h-screen bg-muted/30">
        <div className="page-container">
          <Card className="p-12 md:p-16 text-center animate-fade-in-up">
            <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-destructive" />
            <h3 className="text-xl font-semibold text-destructive mb-2">{t('common.erreur')}</h3>
            <p className="text-muted-foreground">{error}</p>
            <Button
              onClick={() => fetchEvents()}
              className="mt-4"
            >
              {t('calendar.reessayer')}
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="page-container">
        <Card className="p-6 md:p-8 mb-8 animate-fade-in-up">
          <div className="flex flex-wrap justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-foreground">{t('calendar.titre')}</h1>
              <p className="text-muted-foreground">{t('calendar.sous_titre')}</p>
            </div>
            <div className="flex gap-3 flex-wrap">
              <Button asChild>
                <Link to="/tasks">
                  {t('calendar.liste_taches')}
                </Link>
              </Button>
              {canManageMedia && (
                <Button asChild variant="secondary">
                  <Link to="/tasks?type=media">
                    <Plus className="w-4 h-4 mr-1.5" />
                    {t('calendar.nouvelle_tache')}
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </Card>

        <Card className="p-6 shadow-soft-lg animate-fade-in">
          {events.length === 0 ? (
            <div className="text-center py-12">
              <CalendarDays className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold text-foreground mb-2">{t('calendar.aucune_tache')}</h3>
              <p className="text-muted-foreground">{t('calendar.creer_premiere_tache')}</p>
              {canManageMedia && (
                <Button asChild variant="secondary" className="mt-4">
                  <Link to="/tasks?type=media">
                    <Plus className="w-4 h-4 mr-1.5" />
                    {t('calendar.creer_tache')}
                  </Link>
                </Button>
              )}
            </div>
          ) : (
            <FullCalendar
              ref={calendarRef}
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay'
              }}
              locale={frLocale}
              initialView="dayGridMonth"
              events={events}
              eventClick={handleEventClick}
              selectable={true}
              height="auto"
              eventDidMount={(info) => {
                if (!info.event.title) {
                  info.event.setProp('title', t('common.sans_titre'));
                }
              }}
              eventContent={(eventInfo) => {
                try {
                  return (
                    <div className="p-1">
                      <div className="font-semibold text-sm truncate text-primary-700">
                        {eventInfo.event.title || t('common.sans_titre')}
                      </div>
                      {eventInfo.event.extendedProps?.membre && (
                        <div className="text-xs opacity-80 truncate text-primary-600/80">
                          {eventInfo.event.extendedProps.membre}
                        </div>
                      )}
                    </div>
                  );
                } catch (error) {
                  console.error(error);
                  return (
                    <div className="p-1">
                      <div className="font-semibold text-sm truncate text-destructive">
                        {error.message || t('calendrier.erreur_affichage')}
                      </div>
                    </div>
                  );
                }
              }}
            />
          )}
        </Card>
      </div>

      <Dialog open={showModal && !!selectedEvent} onOpenChange={setShowModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedEvent ? (selectedEvent.title || t('common.sans_titre')) : ""}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-muted-foreground" />
              <span className="font-semibold text-foreground">{t('calendar.date')}:</span>
              <span className="text-muted-foreground">
                {selectedEvent?.start ? formatDate(selectedEvent.start, { day: 'numeric', month: 'long', year: 'numeric' }) : t('common.non_renseigne')}
              </span>
            </div>

            {selectedEvent?.extendedProps?.membre && (
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="font-semibold text-foreground">{t('calendar.assigne_a')}:</span>
                <span className="text-muted-foreground">{selectedEvent.extendedProps.membre}</span>
              </div>
            )}

            {selectedEvent?.extendedProps?.priorite && (
              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground">{t('calendar.priorite')}:</span>
                <Badge variant={
                  selectedEvent.extendedProps.priorite === 'critique' ? 'destructive' :
                  selectedEvent.extendedProps.priorite === 'haute' ? 'secondary' :
                  selectedEvent.extendedProps.priorite === 'moyenne' ? 'outline' :
                  'default'
                } className="text-xs">
                  {selectedEvent.extendedProps.priorite}
                </Badge>
              </div>
            )}

            {selectedEvent?.extendedProps?.statut && (
              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground">{t('calendar.statut')}:</span>
                <Badge variant={
                  selectedEvent.extendedProps.statut === 'terminee' ? 'default' :
                  selectedEvent.extendedProps.statut === 'en-cours' ? 'secondary' :
                  'outline'
                } className="text-xs">
                  {selectedEvent.extendedProps.statut}
                </Badge>
              </div>
            )}

            {selectedEvent?.extendedProps?.description && (
              <div className="mt-3 p-4 bg-muted/30 rounded-2xl">
                <p className="font-semibold text-foreground mb-1 text-sm">{t('calendar.description')}:</p>
                <p className="text-muted-foreground text-sm">{selectedEvent.extendedProps.description}</p>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2 mt-6">
            <Button asChild className="flex-1">
              <Link to={"/tasks/" + selectedEvent?.id}>
                {t('calendar.voir_tache')}
              </Link>
            </Button>
            {canManageMedia && (
              <Button
                onClick={() => handleNotify(selectedEvent?.id)}
                variant="default"
                className="flex-1"
              >
                {t('calendar.notifier')}
              </Button>
            )}
            <Button
              onClick={() => setShowModal(false)}
              variant="ghost"
              className="flex-1"
            >
              {t('calendar.fermer')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default MediaCalendarPage;
