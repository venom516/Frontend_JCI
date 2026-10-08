import React, { useState, useEffect, useCallback } from "react";
import { useI18n } from "../contexts/I18nContext";
import { taskAPI, eventAPI } from "../api/axios";
import { Skeleton } from "../components/ui/skeleton";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { ChevronLeft, ChevronRight, CalendarDays, Calendar, CheckCircle, Clock, ListTodo, Target, Zap, BookOpen, Megaphone, Users, Building, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

const weekDays = ["calendar.lun", "calendar.mar", "calendar.mer", "calendar.jeu", "calendar.ven", "calendar.sam", "calendar.dim"];

const monthNames = ["calendar.mois_janvier", "calendar.mois_fevrier", "calendar.mois_mars", "calendar.mois_avril", "calendar.mois_mai", "calendar.mois_juin", "calendar.mois_juillet", "calendar.mois_aout", "calendar.mois_septembre", "calendar.mois_octobre", "calendar.mois_novembre", "calendar.mois_decembre"];

const TasksEventsPage = () => {
  const { t, formatDate, translateStatus } = useI18n();
  const [tasks, setTasks] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [taskFilter, setTaskFilter] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [tasksRes, eventsRes] = await Promise.all([
        taskAPI.getAll(),
        eventAPI.getAll(),
      ]);
      setTasks(tasksRes.data.data || []);
      setEvents(eventsRes.data.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || error.translatedMessage || t("common.erreur"));
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

  const getItemsForDate = (date) => {
    const dateStr = date.toDateString();
    const dayEvents = events.filter(e => new Date(e.date).toDateString() === dateStr);
    const dayTasks = tasks.filter(t => t.deadline && new Date(t.deadline).toDateString() === dateStr);
    return [...dayEvents, ...dayTasks];
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
    setSelectedItems(getItemsForDate(date));
  };

  const changeMonth = (delta) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + delta);
    setCurrentMonth(newMonth);
    setSelectedDate(null);
    setSelectedItems([]);
  };

  const getItemBadge = (item) => {
    if (item.statut && ["créée", "creee", "assignée", "assignee", "en-cours", "en_cours", "terminée", "terminee"].includes(item.statut)) {
      return { color: "bg-primary-100 text-primary-700 border-l-4 border-primary-500", icon: ListTodo };
    }
    const eventIcons = {
      Action: { color: "bg-amber-100 text-amber-700 border-l-4 border-amber-500", icon: Zap },
      Formation: { color: "bg-emerald-100 text-emerald-700 border-l-4 border-emerald-500", icon: BookOpen },
      Manifestation: { color: "bg-violet-100 text-violet-700 border-l-4 border-violet-500", icon: Megaphone },
      Réunion: { color: "bg-cyan-100 text-cyan-700 border-l-4 border-cyan-500", icon: Users },
      AGP: { color: "bg-rose-100 text-rose-700 border-l-4 border-rose-500", icon: Building },
    };
    return eventIcons[item.type] || { color: "bg-surface-100 text-surface-700 border-l-4 border-surface-400", icon: CalendarDays };
  };

  const filteredTasks = taskFilter
    ? tasks.filter(t => {
        const status = (t.statut || "").toLowerCase().replace(/é/g, "e");
        const filter = taskFilter.replace(/é/g, "e");
        return status === filter;
      })
    : tasks;

  if (loading) return (
    <div className="min-h-screen bg-surface-50/80">
      <div className="page-container">
        <Skeleton className="h-24 mb-8 rounded-2xl" />
        <Skeleton className="h-16 mb-6 rounded-2xl" />
        <Skeleton className="h-[500px] rounded-2xl" />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-surface-50/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <Card className="mb-2">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary-100 flex items-center justify-center text-primary-600">
                <CalendarDays className="w-6 h-6" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-surface-900">{t("tasks.titre")} & {t("events.titre")}</CardTitle>
                <p className="text-surface-500 text-sm">{t("calendar.sous_titre")}</p>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card className="p-4 md:p-6">
          <div className="flex justify-between items-center">
            <Button onClick={() => changeMonth(-1)} variant="ghost" size="icon">
              <ChevronLeft className="w-5 h-5 text-surface-500" />
            </Button>
            <h2 className="text-xl md:text-2xl font-bold text-surface-900">
              {t(monthNames[currentMonth.getMonth()])} {currentMonth.getFullYear()}
            </h2>
            <Button onClick={() => changeMonth(1)} variant="ghost" size="icon">
              <ChevronRight className="w-5 h-5 text-surface-500" />
            </Button>
          </div>
        </Card>

        <Card className="overflow-hidden shadow-soft-lg">
          <div className="grid grid-cols-7 bg-gradient-to-r from-primary-600 to-primary-500 text-white">
            {weekDays.map((day) => (
              <div key={day} className="p-3 text-center font-semibold text-sm tracking-wide">
                {t(day)}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {(() => {
              const days = getDaysInMonth(currentMonth);
              return days.map((day, index) => {
                const dayItems = getItemsForDate(day.date);
                const isToday = day.date.toDateString() === new Date().toDateString();
                const isSelected = selectedDate && day.date.toDateString() === selectedDate.toDateString();

                return (
                  <div
                    key={index}
                    onClick={() => handleDateClick(day.date)}
                    className={"min-h-[100px] p-1.5 border border-surface-200/50 cursor-pointer transition-all duration-200 hover:bg-primary-50/60 " + (isSelected ? "bg-primary-50 ring-2 ring-primary-300 z-10 " : "") + (day.isCurrentMonth ? "bg-white dark:bg-gray-800 " : "bg-surface-50/50 text-surface-400")}
                  >
                    <div className="flex justify-between items-start mb-1 px-0.5">
                      <span className={"text-xs font-semibold w-6 h-6 flex items-center justify-center " + (isToday ? "bg-primary-600 text-white rounded-full shadow-soft" : "")}>
                        {day.date.getDate()}
                      </span>
                      {dayItems.length > 0 && (
                        <Badge variant="default" className="text-[10px] px-1 py-0.5 h-4 min-w-4 flex items-center justify-center">
                          {dayItems.length}
                        </Badge>
                      )}
                    </div>
                    <div className="space-y-0.5">
                      {dayItems.slice(0, 2).map((item, i) => {
                        const badge = getItemBadge(item);
                        return (
                          <div key={i} className={"text-[10px] p-1 rounded leading-tight truncate " + badge.color}>
                            {item.titre || item.title}
                          </div>
                        );
                      })}
                      {dayItems.length > 2 && (
                        <div className="text-[10px] text-surface-400 pl-1">+{dayItems.length - 2} autres</div>
                      )}
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </Card>

        {selectedDate && selectedItems.length > 0 && (
          <Card className="p-4 md:p-6 animate-slide-up">
            <h3 className="text-lg font-bold text-surface-900 mb-4 flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-primary-600" />
              {formatDate(selectedDate, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </h3>
            <div className="space-y-2">
              {selectedItems.map((item, index) => {
                const badge = getItemBadge(item);
                const Icon = badge.icon;
                const isEvent = item.date && !item.deadline;
                return (
                  <div key={index} className={"p-3 rounded-xl flex items-start gap-3 " + badge.color}>
                    <div className="w-8 h-8 rounded-lg bg-white/60 flex items-center justify-center shrink-0 mt-0.5">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm text-surface-900">{item.titre || item.title}</span>
                        <Badge className="text-[10px] px-1.5 py-0.5 bg-white/60 text-surface-700">
                          {isEvent ? (item.type || t("events.titre")) : translateStatus(item.statut)}
                        </Badge>
                      </div>
                      {item.description && <p className="text-xs text-surface-600 mt-1 line-clamp-2">{item.description}</p>}
                      <div className="flex flex-wrap gap-3 mt-1.5 text-[11px] text-surface-500">
                        {isEvent && item.date && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(item.date)}
                          </span>
                        )}
                        {!isEvent && item.deadline && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {t("tasks.deadline")}: {formatDate(item.deadline)}
                          </span>
                        )}
                        {isEvent && item.lieu && (
                          <span>{item.lieu}</span>
                        )}
                        {isEvent && item.participants && (
                          <span>{item.participants.length || 0} participant(s)</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-4 md:p-6">
            <div className="flex items-center gap-2 mb-4">
              <ListTodo className="w-5 h-5 text-primary-600" />
              <CardTitle className="text-lg font-semibold text-surface-900">{t("tasks.titre")}</CardTitle>
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              <Button size="sm" variant={taskFilter === "" ? "default" : "outline"} onClick={() => setTaskFilter("")}>{t("common.tous")}</Button>
              <Button size="sm" variant={taskFilter === "créée" ? "default" : "outline"} onClick={() => setTaskFilter("créée")}>{t("tasks.creee")}</Button>
              <Button size="sm" variant={taskFilter === "en-cours" ? "default" : "outline"} onClick={() => setTaskFilter("en-cours")}>{t("tasks.en_cours")}</Button>
              <Button size="sm" variant={taskFilter === "terminée" ? "default" : "outline"} onClick={() => setTaskFilter("terminée")}>{t("tasks.terminee")}</Button>
            </div>
            {filteredTasks.length === 0 ? (
              <div className="text-center py-8 text-surface-400">
                <CheckCircle className="w-12 h-12 mx-auto mb-2 text-surface-300" />
                <p className="text-sm">{t("tasks.aucune")}</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredTasks.map((task) => (
                  <div key={task._id} className="flex items-start gap-3 p-3 rounded-xl bg-surface-50/80 ring-1 ring-surface-200/50 hover:shadow-soft transition-all">
                    <div className={"w-2 h-2 rounded-full mt-2 shrink-0 " + (
                      ["terminée", "terminee"].includes(task.statut) ? "bg-emerald-500" :
                      ["en-cours", "en_cours"].includes(task.statut) ? "bg-amber-500" :
                      "bg-primary-400"
                    )} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-surface-800">{task.titre}</p>
                      <div className="flex flex-wrap gap-2 mt-1 text-xs text-surface-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {task.deadline ? formatDate(task.deadline) : t("common.non_renseigne")}
                        </span>
                        <Badge className="text-[10px] px-1.5 py-0.5 bg-white text-surface-600 ring-1 ring-surface-200">{translateStatus(task.statut)}</Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card className="p-4 md:p-6">
            <div className="flex items-center gap-2 mb-4">
              <CalendarDays className="w-5 h-5 text-primary-600" />
              <CardTitle className="text-lg font-semibold text-surface-900">{t("events.titre")}</CardTitle>
            </div>
            {events.length === 0 ? (
              <div className="text-center py-8 text-surface-400">
                <CalendarDays className="w-12 h-12 mx-auto mb-2 text-surface-300" />
                <p className="text-sm">{t("events.aucun")}</p>
              </div>
            ) : (
              <div className="space-y-2">
                {events.map((event) => {
                  const badge = getItemBadge(event);
                  const Icon = badge.icon;
                  return (
                    <div key={event._id} className="flex items-start gap-3 p-3 rounded-xl bg-surface-50/80 ring-1 ring-surface-200/50 hover:shadow-soft transition-all">
                      <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shrink-0 text-surface-500 ring-1 ring-surface-200">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-surface-800">{event.titre}</p>
                        <div className="flex flex-wrap gap-2 mt-1 text-xs text-surface-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(event.date)}
                          </span>
                          {event.lieu && <span>{event.lieu}</span>}
                          <Badge className={"text-[10px] px-1.5 py-0.5 " + (
                            event.type === "Action" ? "bg-amber-100 text-amber-700" :
                            event.type === "Formation" ? "bg-emerald-100 text-emerald-700" :
                            event.type === "Manifestation" ? "bg-violet-100 text-violet-700" :
                            event.type === "Réunion" ? "bg-cyan-100 text-cyan-700" :
                            "bg-surface-100 text-surface-600"
                          )}>{event.type}</Badge>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TasksEventsPage;