import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useI18n } from "../contexts/I18nContext";
import { eventAPI, taskAPI } from "../api/axios";
import { Skeleton } from "../components/ui/skeleton";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { ChevronLeft, ChevronRight, CalendarDays, Calendar, CheckCircle, DollarSign, ClipboardList } from "lucide-react";
import toast from "react-hot-toast";

const CalendarPage = () => {
  const { user } = useAuth();
  const { t, formatDate } = useI18n();
  const [events, setEvents] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedEvents, setSelectedEvents] = useState([]);
  const [view, setView] = useState("month");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [eventsRes, tasksRes] = await Promise.all([
        eventAPI.getAll(),
        taskAPI.getAll(),
      ]);
      setEvents(eventsRes.data.data || []);
      setTasks(tasksRes.data.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || error.translatedMessage || t('events.erreur_chargement'));
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];
    const start = firstDay.getDay();
    const totalDays = lastDay.getDate();

    for (let i = 0; i < start; i++) {
      const prevDate = new Date(year, month, -i);
      days.unshift({ date: prevDate, isCurrentMonth: false });
    }

    for (let i = 1; i <= totalDays; i++) {
      days.push({ date: new Date(year, month, i), isCurrentMonth: true });
    }

    return days;
  };

  const getEventsForDate = (date) => {
    const dateStr = date.toDateString();
    const dayEvents = events.filter(e => new Date(e.date).toDateString() === dateStr);
    const dayTasks = tasks.filter(t => new Date(t.deadline).toDateString() === dateStr);
    return [...dayEvents, ...dayTasks];
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
    const items = getEventsForDate(date);
    setSelectedEvents(items);
  };

  const changeMonth = (delta) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + delta);
    setCurrentMonth(newMonth);
    setSelectedDate(null);
    setSelectedEvents([]);
  };

  const getEventColor = (item) => {
    if (item.type === "Task Media") return "bg-emerald-100 text-primary-700 dark:text-primary-400 border-l-4 border-primary-500";
    if (item.titre) return "bg-emerald-100 text-primary-700 dark:text-primary-400 border-l-4 border-primary-500";
    return "bg-emerald-50 text-primary-600 dark:text-primary-400 border-l-4 border-primary-400";
  };

  const monthNames = [
    t('calendar.mois_janvier'), t('calendar.mois_fevrier'), t('calendar.mois_mars'), t('calendar.mois_avril'), t('calendar.mois_mai'), t('calendar.mois_juin'),
    t('calendar.mois_juillet'), t('calendar.mois_aout'), t('calendar.mois_septembre'), t('calendar.mois_octobre'), t('calendar.mois_novembre'), t('calendar.mois_decembre')
  ];

  const weekDays = [t('calendar.lun'), t('calendar.mar'), t('calendar.mer'), t('calendar.jeu'), t('calendar.ven'), t('calendar.sam'), t('calendar.dim')];

  if (loading) return (
    <div className="min-h-screen bg-muted/30">
      <div className="page-container">
        <Skeleton className="h-24 mb-8 rounded-xl" />
        <Skeleton className="h-16 mb-6 rounded-xl" />
        <Skeleton className="h-[500px] rounded-xl" />
      </div>
    </div>
  );

  const days = getDaysInMonth(currentMonth);

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="page-container">
        <Card className="p-6 md:p-8 mb-8 flex flex-wrap justify-between items-center animate-fade-in-up">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{t('calendar.titre')}</h1>
            <p className="text-muted-foreground">{t('calendar.sous_titre')}</p>
          </div>
          <div className="flex gap-2">
            {["month", "week", "day"].map((v) => (
              <Button
                key={v}
                onClick={() => setView(v)}
                variant={view === v ? "default" : "ghost"}
                size="sm"
              >
                {v === "month" ? t('calendar.mois') : v === "week" ? t('calendar.semaine') : t('calendar.jour')}
              </Button>
            ))}
          </div>
        </Card>

        <Card className="p-4 md:p-6 mb-6 animate-fade-in">
          <div className="flex justify-between items-center">
            <Button
              onClick={() => changeMonth(-1)}
              variant="ghost"
              size="icon"
            >
              <ChevronLeft className="w-5 h-5 text-muted-foreground" />
            </Button>
            <h2 className="text-2xl font-bold text-foreground">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </h2>
            <Button
              onClick={() => changeMonth(1)}
              variant="ghost"
              size="icon"
            >
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </Button>
          </div>
        </Card>

        <Card className="overflow-hidden shadow-soft-lg animate-scale-in">
          <div className="grid grid-cols-7 bg-gradient-to-r from-primary-600 to-primary-500 text-white">
            {weekDays.map((day) => (
              <div key={day} className="p-3 text-center font-semibold text-sm tracking-wide">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {days.map((day, index) => {
              const dayEvents = getEventsForDate(day.date);
              const isToday = day.date.toDateString() === new Date().toDateString();
              const isSelected = selectedDate && day.date.toDateString() === selectedDate.toDateString();

              return (
                <div
                  key={index}
                  onClick={() => handleDateClick(day.date)}
                  className={"min-h-[110px] p-2 border border-border/50 cursor-pointer transition-all duration-200 hover:bg-primary-50/50 " + (isSelected ? "bg-primary-50 ring-2 ring-primary-300 z-10 " : "") + (day.isCurrentMonth ? "bg-white dark:bg-gray-800 " : "bg-muted/30 text-muted-foreground")}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className={"text-sm font-semibold w-7 h-7 flex items-center justify-center " + (isToday ? "bg-primary-600 text-white rounded-full shadow-soft" : "")}>
                      {day.date.getDate()}
                    </span>
                    {dayEvents.length > 0 && (
                      <Badge variant="default" className="text-xs px-1.5 py-0.5">
                        {dayEvents.length}
                      </Badge>
                    )}
                  </div>
                  <div className="mt-1 space-y-1">
                    {dayEvents.slice(0, 3).map((item, i) => (
                      <div
                        key={i}
                        className={"text-xs p-1.5 rounded-lg font-medium " + getEventColor(item)}
                        title={(item.titre || item.title) + (item.location ? " (" + item.location + ")" : "")}
                      >
                        <span className="truncate block">{item.titre || item.title}</span>
                        {item.location && (
                          <span className="text-[9px] opacity-75 truncate block mt-0.5">{item.location}</span>
                        )}
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="text-xs text-muted-foreground pl-1">+{dayEvents.length - 3} autres</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {selectedDate && selectedEvents.length > 0 && (
          <Card className="p-6 md:p-8 mt-8 animate-slide-up">
            <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-primary-600" />
              {formatDate(selectedDate, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </h3>
            <div className="space-y-3">
              {selectedEvents.map((item, index) => (
                <div key={index} className={"p-4 rounded-2xl " + getEventColor(item)}>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      {item.type === "Task Media" ? (
                        <DollarSign className="w-4 h-4 text-primary-600" />
                      ) : item.titre ? (
                        <CalendarDays className="w-4 h-4 text-primary-600" />
                      ) : (
                        <ClipboardList className="w-4 h-4 text-primary-500" />
                      )}
                      <span className="font-semibold text-primary-800">{item.titre || item.title}</span>
                    </div>
                    <span className="text-xs font-medium px-2 py-1 rounded-lg bg-white/60 text-primary-700">
                      {item.type === "Task Media" ? "📱 Publication" : item.type ? item.type : item.statut ? item.statut : ""}
                    </span>
                  </div>
                  {item.description && (
                    <p className="text-sm mt-2 text-primary-600/80">{item.description}</p>
                  )}
                  {(item.location || (item.type === "Task Media" && item.location)) && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {item.location.split(', ').map((p) => (
                        <span key={p} className="text-[10px] font-bold bg-white/60 text-primary-700 px-2 py-0.5 rounded-full border border-primary-200">
                          {p}
                        </span>
                      ))}
                    </div>
                  )}
                  {item.statut && (
                    <div className="mt-2">
                      <span className={"text-xs font-medium px-2 py-1 rounded-lg " + (
                        item.statut === "terminée" ? "bg-emerald-200 text-emerald-800" :
                        item.statut === "créée" ? "bg-amber-100 text-amber-800" :
                        "bg-muted text-muted-foreground"
                      )}>
                        {item.statut}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}

        <Card className="p-4 md:p-6 mt-8 animate-fade-in">
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-sm bg-emerald-600 border border-primary-500"></div>
              <span className="text-sm text-muted-foreground">{t('calendar.evenements')} / {t('calendar.taches')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-primary-600 flex items-center justify-center">
                <span className="text-white text-xs font-bold">{t('calendar.aujourdhui_abbr')}</span>
              </div>
              <span className="text-sm text-muted-foreground">{t('calendar.aujourdhui')}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default CalendarPage;
