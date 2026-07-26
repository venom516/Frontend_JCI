import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { taskAPI } from "../api/axios";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import frLocale from "@fullcalendar/core/locales/fr";
import arLocale from "@fullcalendar/core/locales/ar";
import { Skeleton } from "../components/ui/skeleton";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { AlertTriangle, CalendarDays, User, Plus, List } from "lucide-react";
import toast from "react-hot-toast";
import { useI18n } from "../contexts/I18nContext";

const PresidentCalendarPage = () => {
  const { t, lang, formatDate, formatDateTime, translateStatus } = useI18n();
  const calendarRef = useRef(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, [filterType]);

  const fetchEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (filterType !== 'all') {
        params.type = filterType;
      }

      const response = await taskAPI.getCalendar(params);


      if (response.data && response.data.success) {
        const eventsData = response.data.data || [];
        
        const formattedEvents = eventsData.map(event => ({
          id: event.id,
          title: event.title || t('calendrier.sans_titre'),
          start: event.start || new Date(),
          end: event.end || event.start || new Date(),
          allDay: event.allDay || false,
          color: event.extendedProps?.type === 'Task Media' ? '#059669' : '#10B981',
          extendedProps: {
            type: event.extendedProps?.type || 'Task Normale',
            statut: event.extendedProps?.statut || 'creee',
            priorite: event.extendedProps?.priorite || 'moyenne',
            description: event.extendedProps?.description || '',
            membre: event.extendedProps?.membre || t('calendrier.non_assigne')
          }
        }));
        
        setEvents(formattedEvents);

      } else {
        setEvents([]);
      }
    } catch (error) {
      console.error("Erreur:", error);
      setError(error.message);
      toast.error(t('home.erreur_chargement'));
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
      console.error("Erreur:", error);
      toast.error(t('common.erreur'));
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-muted/30">
      <div className="page-container">
        <Skeleton className="h-24 mb-8 rounded-xl" />
        <Skeleton className="h-12 mb-8 rounded-xl" />
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
            <h3 className="text-xl font-semibold text-destructive mb-2">{t('home.erreur_chargement')}</h3>
            <p className="text-muted-foreground">{error}</p>
            <Button
              onClick={() => fetchEvents()}
              className="mt-4"
            >
              {t('home.reesayer')}
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
              <h1 className="text-3xl font-bold text-foreground">{t('president.calendrier_titre')}</h1>
              <p className="text-muted-foreground">{t('calendrier.sous_titre')}</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                onClick={() => setFilterType('all')}
                variant={filterType === 'all' ? "default" : "ghost"}
                size="sm"
              >
                {t('common.tous')}
              </Button>
              <Button
                onClick={() => setFilterType('Task Normale')}
                variant={filterType === 'Task Normale' ? "default" : "ghost"}
                size="sm"
              >
                {t('calendrier.normales')}
              </Button>
              <Button
                onClick={() => setFilterType('Task Media')}
                variant={filterType === 'Task Media' ? "secondary" : "ghost"}
                size="sm"
              >
                {t('calendrier.media')}
              </Button>
              <Button asChild variant="default" size="sm">
                <Link to="/tasks">
                  <List className="w-4 h-4 mr-1.5" />
                  {t('calendrier.liste')}
                </Link>
              </Button>
            </div>
          </div>
        </Card>

        <Card className="p-4 md:p-6 mb-8 animate-fade-in">
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm" style={{ background: '#10B981' }}></div>
              <span className="text-sm text-muted-foreground">{t('calendrier.priorite_basse')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm" style={{ background: '#3B82F6' }}></div>
              <span className="text-sm text-muted-foreground">{t('calendrier.priorite_moyenne')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm" style={{ background: '#F59E0B' }}></div>
              <span className="text-sm text-muted-foreground">{t('calendrier.priorite_haute')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm" style={{ background: '#EF4444' }}></div>
              <span className="text-sm text-muted-foreground">{t('calendrier.priorite_critique')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm" style={{ background: '#059669' }}></div>
              <span className="text-sm text-muted-foreground">{t('calendrier.tache_media')}</span>
            </div>
          </div>
        </Card>

        <Card className="p-6 shadow-soft-lg animate-scale-in">
          {events.length === 0 ? (
            <div className="text-center py-12">
              <CalendarDays className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold text-foreground mb-2">{t('calendrier.aucune_tache')}</h3>
              <p className="text-muted-foreground">{t('calendrier.creer_pour_voir')}</p>
              <Button asChild className="mt-4">
                <Link to="/tasks">
                  <Plus className="w-4 h-4 mr-1.5" />
                  {t('calendrier.creer_tache')}
                </Link>
              </Button>
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
              locale={lang === 'ar' ? arLocale : frLocale}
              direction={lang === 'ar' ? 'rtl' : 'ltr'}
              initialView="dayGridMonth"
              events={events}
              eventClick={handleEventClick}
              selectable={true}
              height="auto"
              eventContent={(eventInfo) => {
                try {
                  const isMedia = eventInfo.event.extendedProps?.type === 'Task Media';
                  return (
                    <div className={"p-1 rounded " + (isMedia ? "border-l-4 border-primary-500 bg-emerald-100" : "")}>
                      <div className="font-semibold text-sm truncate text-primary-700">
                        {eventInfo.event.title || t('calendrier.sans_titre')}
                      </div>
                      {eventInfo.event.extendedProps?.membre && (
                        <div className="text-xs opacity-80 truncate text-primary-600/80">
                          {eventInfo.event.extendedProps.membre}
                        </div>
                      )}
                    </div>
                  );
                } catch (error) {
                  return (
                    <div className="p-1 text-destructive text-xs">
                      {t('common.erreur')}
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
              {selectedEvent ? (selectedEvent.title || t('calendrier.sans_titre')) : ""}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground">{t('calendrier.type_label')}</span>
              <Badge variant={
                selectedEvent?.extendedProps?.type === 'Task Media' 
                  ? 'outline' 
                  : 'default'
              } className="text-xs">
                {selectedEvent?.extendedProps?.type === 'Task Media' 
                  ? t('calendrier.media') 
                  : t('calendrier.normales')}
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-muted-foreground" />
              <span className="font-semibold text-foreground">{t('calendrier.date_label')}</span>
              <span className="text-muted-foreground">
                {selectedEvent?.start ? formatDate(selectedEvent.start, {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                }) : ''}
              </span>
            </div>

            {selectedEvent?.extendedProps?.membre && (
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="font-semibold text-foreground">{t('calendrier.assigne_a')}</span>
                <span className="text-muted-foreground">{selectedEvent.extendedProps.membre}</span>
              </div>
            )}

            {selectedEvent?.extendedProps?.priorite && (
              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground">{t('calendrier.priorite_label')}</span>
                <Badge variant={
                  selectedEvent.extendedProps.priorite === 'critique' ? 'destructive' :
                  selectedEvent.extendedProps.priorite === 'haute' ? 'secondary' :
                  selectedEvent.extendedProps.priorite === 'moyenne' ? 'outline' :
                  'default'
                } className="text-xs">
                  {selectedEvent.extendedProps.priorite === 'critique' ? t('calendrier.priorite_critique') :
                   selectedEvent.extendedProps.priorite === 'haute' ? t('tasks.haute') :
                   selectedEvent.extendedProps.priorite === 'moyenne' ? t('tasks.moyenne') :
                   selectedEvent.extendedProps.priorite === 'basse' ? t('tasks.basse') :
                   selectedEvent.extendedProps.priorite}
                </Badge>
              </div>
            )}

            {selectedEvent?.extendedProps?.statut && (
              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground">{t('calendrier.statut_label')}</span>
                <Badge variant={
                  selectedEvent.extendedProps.statut === 'terminee' ? 'default' :
                  selectedEvent.extendedProps.statut === 'en-cours' ? 'secondary' :
                  'outline'
                } className="text-xs">
                  {translateStatus(selectedEvent.extendedProps.statut)}
                </Badge>
              </div>
            )}
          </div>

          <div className="flex gap-2 mt-6">
            <Button asChild className="flex-1">
              <Link to={"/tasks/" + selectedEvent?.id}>
                {t('common.voir')}
              </Link>
            </Button>
            <Button
              onClick={() => setShowModal(false)}
              variant="ghost"
              className="flex-1"
            >
              {t('calendrier.fermer')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PresidentCalendarPage;
