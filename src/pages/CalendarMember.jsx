import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useI18n } from "../contexts/I18nContext";
import { eventAPI, taskAPI } from "../api/axios";
import { Skeleton } from "../components/ui/skeleton";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Separator } from "../components/ui/separator";
import {
  CalendarDays, ListTodo, User, Calendar, Clock,
  ChevronLeft, ChevronRight, Eye, X
} from "lucide-react";
import toast from "react-hot-toast";

const statusColors = {
"créée": "bg-slate-100 text-slate-700 dark:bg-slate-950 dark:text-slate-200",
    "assignée": "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-200",
    "en-cours": "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-200",
    "en-révision": "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-200",
    "terminée": "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200",
    "annulée": "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-200",
    };

const CalendarMember = () => {
  const { user } = useAuth();
  const { t, formatDate } = useI18n();
  const isVPFD = user?.role === "VPFD";
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [events, setEvents] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedTask, setSelectedTask] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = {};
      if (isVPFD) {
        params.taskType = "media";
      }
      const [tasksRes, eventsRes] = await Promise.all([
        taskAPI.getAll(params),
        eventAPI.getAll(),
      ]);
      setTasks(tasksRes.data.data || []);
      setEvents(eventsRes.data.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || error.translatedMessage || t("events.erreur_chargement"));
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
      days.push(null);
    }
    for (let i = 1; i <= totalDays; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const getTasksForDate = (date) => {
    if (!date) return [];
    return tasks.filter((task) => {
      if (!task.deadline) return false;
      const taskDate = new Date(task.deadline);
      return (
        taskDate.getDate() === date.getDate() &&
        taskDate.getMonth() === date.getMonth() &&
        taskDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const getEventsForDate = (date) => {
    if (!date) return [];
    return events.filter((evt) => {
      if (!evt.date) return false;
      const evtDate = new Date(evt.date);
      return (
        evtDate.getDate() === date.getDate() &&
        evtDate.getMonth() === date.getMonth() &&
        evtDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const monthName = currentMonth.toLocaleDateString("fr-FR", {
    month: "long",
    year: "numeric",
  });

  const days = getDaysInMonth(currentMonth);
  const weekDays = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

  const openTaskDetails = (task) => {
    setSelectedTask(task);
    setShowTaskModal(true);
  };

  const statusBadge = (statut) => {
    const color = statusColors[statut] || "bg-slate-100 text-slate-700";
    return <Badge className={color + " text-xs"}>{statut}</Badge>;
  };

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="page-container min-h-screen bg-surface-50/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <Card className="animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-14 h-14 rounded-2xl bg-accent-cyan/10 text-accent-cyan flex items-center justify-center">
                <CalendarDays className="w-7 h-7" />
              </div>
              <div>
                <h1 className="section-title font-display text-3xl font-bold text-surface-900">
                  {t("nav.calendrier")}
                </h1>
                <p className="section-subtitle text-surface-500 mt-1">
                  {isVPFD ? t("nav.calendrier_membre") : t("nav.calendrier")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-6">
              <Button variant="outline" size="sm" onClick={prevMonth}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <h2 className="text-lg font-semibold capitalize">{monthName}</h2>
              <Button variant="outline" size="sm" onClick={nextMonth}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden">
              {weekDays.map((day) => (
                <div key={day} className="bg-muted/50 p-2 text-center text-xs font-medium text-muted-foreground">
                  {day}
                </div>
              ))}
              {days.map((date, idx) => {
                if (!date) {
                  return <div key={`empty-${idx}`} className="bg-card p-2 min-h-[80px]" />;
                }
                const dayTasks = getTasksForDate(date);
                const dayEvents = getEventsForDate(date);
                const today = new Date();
                const isToday =
                  date.getDate() === today.getDate() &&
                  date.getMonth() === today.getMonth() &&
                  date.getFullYear() === today.getFullYear();
                return (
                  <div
                    key={date.toISOString()}
                    className={`bg-card p-1.5 min-h-[80px] border-t border-l first:border-l-0 hover:bg-accent/50 transition-colors cursor-pointer ${
                      isToday ? "ring-2 ring-primary ring-inset" : ""
                    }`}
                  >
                    <div className={`text-xs font-medium mb-1 ${isToday ? "text-primary" : "text-muted-foreground"}`}>
                      {date.getDate()}
                    </div>
                    {dayTasks.slice(0, 2).map((task) => (
                      <div
                        key={task._id}
                        className="text-[10px] bg-blue-100 text-blue-800 rounded px-1 py-0.5 mb-0.5 truncate"
                      >
                        {task.titre}
                      </div>
                    ))}
                    {dayEvents.slice(0, 1).map((evt) => (
                      <div
                        key={evt._id}
                        className="text-[10px] bg-emerald-100 text-emerald-800 rounded px-1 py-0.5 mb-0.5 truncate"
                      >
                        {evt.titre || evt.title}
                      </div>
                    ))}
                    {dayTasks.length + dayEvents.length > 3 && (
                      <div className="text-[10px] text-muted-foreground">+{dayTasks.length + dayEvents.length - 3}</div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <ListTodo className="w-5 h-5" />
              {t("nav.taches")} ({tasks.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {tasks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <ListTodo className="w-12 h-12 mx-auto mb-3 opacity-40" />
                <p>Aucune tâche</p>
              </div>
            ) : (
              <div className="space-y-2">
                {tasks.map((task) => (
                  <div
                    key={task._id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm truncate">{task.titre}</span>
                        {statusBadge(task.statut)}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        {task.deadline && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDate(task.deadline)}
                          </span>
                        )}
                        {task.createdBy && (
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {t("tasks.assigner_par")}: {task.createdBy.prenom} {task.createdBy.nom}
                          </span>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="ml-3 flex-shrink-0"
                      onClick={() => openTaskDetails(task)}
                    >
                      <Eye className="w-3.5 h-3.5 mr-1" />
                      Détails
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={showTaskModal} onOpenChange={setShowTaskModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ListTodo className="w-5 h-5" />
              {selectedTask?.titre}
            </DialogTitle>
          </DialogHeader>
          {selectedTask && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge className={statusColors[selectedTask.statut] || ""}>
                  {selectedTask.statut}
                </Badge>
                <Badge variant="outline">{selectedTask.priority || "moyenne"}</Badge>
                {selectedTask.taskType === "media" && (
                  <Badge variant="secondary">Media</Badge>
                )}
              </div>

              {selectedTask.description && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Description</p>
                  <p className="text-sm">{selectedTask.description}</p>
                </div>
              )}

              <Separator />

              <div className="grid grid-cols-2 gap-4 text-sm">
                {selectedTask.deadline && (
                  <div>
                    <p className="text-muted-foreground">Date limite</p>
                    <p className="font-medium">{formatDate(selectedTask.deadline)}</p>
                  </div>
                )}
                {selectedTask.membre && (
                  <div>
                    <p className="text-muted-foreground">Assigné à</p>
                    <p className="font-medium">
                      {selectedTask.membre.prenom} {selectedTask.membre.nom}
                    </p>
                  </div>
                )}
                {selectedTask.createdBy && (
                  <div>
                    <p className="text-muted-foreground">Assigné par</p>
                    <p className="font-medium">
                      {selectedTask.createdBy.prenom} {selectedTask.createdBy.nom}
                    </p>
                  </div>
                )}
                {selectedTask.type && (
                  <div>
                    <p className="text-muted-foreground">Type</p>
                    <p className="font-medium">{selectedTask.type}</p>
                  </div>
                )}
              </div>

              {selectedTask.comments && selectedTask.comments.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">
                      Commentaires ({selectedTask.comments.length})
                    </p>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {selectedTask.comments.map((comment, idx) => (
                        <div key={idx} className="text-sm p-2 bg-muted/50 rounded">
                          <p className="font-medium text-xs">
                            {comment.author?.prenom} {comment.author?.nom}
                          </p>
                          <p>{comment.content}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CalendarMember;
