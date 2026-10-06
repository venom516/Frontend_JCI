import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useI18n } from "../contexts/I18nContext";
import { dashboardAPI, taskAPI } from "../api/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users, CheckCircle, Clock, CalendarDays, FileText, 
  Newspaper, Megaphone, Loader2, ListTodo, Eye
} from "lucide-react";
import toast from "react-hot-toast";

const statCards = {
  president: [
    { key: "totalMembres", labelKey: "dashboard.total_membres", icon: Users, color: "text-blue-600" },
    { key: "actifs", labelKey: "dashboard.membres_actifs", icon: CheckCircle, color: "text-emerald-600" },
    { key: "totalTasks", labelKey: "dashboard.total_taches", icon: ListTodo, color: "text-amber-600" },
    { key: "totalEvents", labelKey: "dashboard.evenements", icon: CalendarDays, color: "text-cyan-600" },
  ],
  secretaire: [
    { key: "documents", labelKey: "dashboard.documents_count", icon: FileText, color: "text-blue-600" },
    { key: "documentsPV", labelKey: "dashboard.pv", icon: FileText, color: "text-emerald-600" },
    { key: "documentsRapports", labelKey: "dashboard.rapports", icon: FileText, color: "text-amber-600" },
    { key: "documentsODJ", labelKey: "dashboard.ordres_jour", icon: FileText, color: "text-cyan-600" },
  ],
  media: [
    { key: "totalPublications", labelKey: "dashboard.publications", icon: Megaphone, color: "text-cyan-600" },
    { key: "publicationsPubliees", labelKey: "dashboard.publiees", icon: CheckCircle, color: "text-emerald-600" },
    { key: "publicationsEnAttente", labelKey: "dashboard.en_attente", icon: Clock, color: "text-amber-600" },
    { key: "totalNews", labelKey: "dashboard.actualites", icon: Newspaper, color: "text-blue-600" },
  ],
  membre: [
    { key: "tasks", labelKey: "dashboard.mes_taches", icon: ListTodo, color: "text-blue-600" },
    { key: "tasksEnCours", labelKey: "dashboard.en_cours", icon: Clock, color: "text-amber-600" },
    { key: "tasksTerminees", labelKey: "dashboard.terminees", icon: CheckCircle, color: "text-emerald-600" },
    { key: "filleulsCount", labelKey: "dashboard.filleuls_count", icon: Users, color: "text-cyan-600" },
  ],
};

export default function DashboardPage() {
  const { user, isPresident, isSecretaire, isMedia, isMember } = useAuth();
  const { t, formatDate, translateStatus } = useI18n();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await dashboardAPI.getMe();
        setData(res.data.data);
      } catch (err) {
        toast.error(err.response?.data?.message || err.translatedMessage || t("common.erreur"));
        console.error("Erreur chargement dashboard:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const role = isPresident ? "president" : isSecretaire ? "secretaire" : isMedia ? "media" : "membre";
  const stats = data?.stats || {};
  const statsConfig = statCards[role] || statCards.membre;

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {t(`dashboard.${role}`)}
        </h1>
        <p className="text-muted-foreground">
          {t("dashboard.bienvenue")} {user?.prenom} {user?.nom} !
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsConfig.map((stat) => {
          const Icon = stat.icon;
          const value = stats[stat.key];
          return (
            <Card key={stat.key}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {t(stat.labelKey)}
                </CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <div className="text-3xl font-bold">{value ?? 0}</div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Événements à venir / Tâches récentes */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t("dashboard.evenements_a_venir")}</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1,2,3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            ) : data?.upcomingEvents?.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">{t("dashboard.aucun_evenement")}</p>
            ) : (
              <div className="space-y-3">
                {data?.upcomingEvents?.slice(0, 5).map((ev) => (
                  <div key={ev._id} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <CalendarDays className="h-4 w-4 text-primary" />
                      <div>
                        <p className="text-sm font-medium">{ev.titre}</p>
                        <p className="text-xs text-muted-foreground">{formatDate?.(ev.date) || ev.date}</p>
                      </div>
                    </div>
                    <Badge variant="secondary">{translateStatus?.(ev.statut) || t("events.planifiee")}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tâches récentes pour les membres */}
        {(isMember || isPresident) && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t("dashboard.mes_taches")}</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {[1,2,3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
                </div>
              ) : data?.myTasks?.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">{t("dashboard.aucune_tache")}</p>
              ) : (
                <div className="space-y-3">
                  {data?.myTasks?.slice(0, 5).map((task) => (
                    <div key={task._id} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${
                          task.statut === "terminée" || task.statut === "terminee" ? "bg-emerald-500" :
                          task.statut === "en-cours" ? "bg-amber-500" :
                          task.statut === "assignée" || task.statut === "assignee" ? "bg-blue-500" :
                          "bg-gray-400"
                        }`} />
                        <span className="text-sm font-medium">{task.titre}</span>
                      </div>
                      <Badge variant="outline">{translateStatus?.(task.statut) || task.statut}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
