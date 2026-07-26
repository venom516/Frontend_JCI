import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { dashboardAPI } from "../api/axios";
import { Link } from "react-router-dom";
import { useI18n } from "../contexts/I18nContext";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Skeleton } from "../components/ui/skeleton";
import {
  Users, CheckCircle, ClipboardList, Calendar, Newspaper,
  FileText, Zap, Video, BarChart3, Activity, TrendingUp,
  UserPlus, MessageSquare, Megaphone
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell
} from "recharts";

const PresidentDashboard = () => {
  const { user } = useAuth();
  const { t, formatDate, translateStatus } = useI18n();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await dashboardAPI.getPresident();
        setData(response.data.data);
      } catch (error) {
        console.error("Erreur chargement dashboard:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const CHART_COLORS = ["#3A67B1", "#22C55E", "#F59E0B", "#06B6D4", "#F43F5E", "#8B5CF6"];

  if (loading) return (
    <div className="min-h-screen bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Skeleton className="h-24 rounded-2xl mb-8" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-6">
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8">
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
        </div>
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <Skeleton className="h-80 rounded-2xl" />
          <Skeleton className="h-80 rounded-2xl" />
        </div>
        <Skeleton className="h-48 rounded-2xl" />
      </div>
    </div>
  );

  const { stats, upcomingEvents, recentTasks, chartData, recentActivities } = data || {};

  const monthNames = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Aoû", "Sep", "Oct", "Nov", "Déc"];

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <Card className="p-6 md:p-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary-100 text-primary-600 flex items-center justify-center">
              <Users className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">{t("dashboard.president")}</h1>
              <p className="text-muted-foreground mt-1">{t("dashboard.bienvenue_nom", { prenom: user?.prenom, nom: user?.nom })}</p>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          <StatCard icon={<Users className="w-6 h-6" />} label={t("common.total_membres")} value={stats?.totalMembres || 0} sub={`+${stats?.nouveauxMois || 0} ${t("dashboard.ce_mois")}`} color="primary" />
          <StatCard icon={<CheckCircle className="w-6 h-6" />} label={t("common.actifs")} value={stats?.actifs || 0} color="emerald" />
          <StatCard icon={<UserPlus className="w-6 h-6" />} label={t("dashboard.nouveaux_inscrits")} value={stats?.nouveauxMois || 0} color="cyan" />
          <StatCard icon={<ClipboardList className="w-6 h-6" />} label={t("dashboard.total_taches")} value={stats?.totalTasks || 0} color="amber" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          <StatCard icon={<Calendar className="w-6 h-6" />} label={t("dashboard.total_evenements")} value={stats?.totalEvents || 0} color="cyan" />
          <StatCard icon={<Video className="w-6 h-6" />} label={t("dashboard.entretiens_programmes")} value={stats?.entretiensProgrammes || 0} color="primary" />
          <StatCard icon={<CheckCircle className="w-6 h-6" />} label={t("dashboard.entretiens_realises")} value={stats?.entretiensRealises || 0} color="emerald" />
          <StatCard icon={<FileText className="w-6 h-6" />} label={t("dashboard.entretiens_attente")} value={stats?.entretiensEnAttente || 0} color="amber" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          <StatCard icon={<Zap className="w-6 h-6" />} label={t("dashboard.total_actions")} value={stats?.totalActions || 0} color="rose" />
          <StatCard icon={<Newspaper className="w-6 h-6" />} label={t("dashboard.actualites")} value={stats?.totalNews || 0} color="rose" />
          <StatCard icon={<Megaphone className="w-6 h-6" />} label={t("dashboard.publications_media")} value={stats?.publicationsMedia || 0} color="cyan" />
          <StatCard icon={<FileText className="w-6 h-6" />} label={t("dashboard.documents")} value={stats?.documents || 0} color="primary" />
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="p-6 md:p-8 hover:shadow-md transition-shadow animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="w-6 h-6 text-primary-500" />
              <h2 className="text-xl font-bold text-foreground">{t("dashboard.evolution_inscriptions")}</h2>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={(chartData?.inscriptionEvolution || []).map(d => ({ ...d, label: monthNames[d.month - 1] }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3A67B1" radius={[4, 4, 0, 0]} name={t("dashboard.inscriptions")} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-6 md:p-8 hover:shadow-md transition-shadow animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center gap-2 mb-6">
              <BarChart3 className="w-6 h-6 text-accent-amber" />
              <h2 className="text-xl font-bold text-foreground">{t("dashboard.statistiques_mensuelles")}</h2>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={(chartData?.statistiquesMensuelles || []).map(d => ({ ...d, label: monthNames[d.month - 1] }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="members" stroke="#3A67B1" strokeWidth={2} name={t("common.total_membres")} />
                  <Line type="monotone" dataKey="events" stroke="#F59E0B" strokeWidth={2} name={t("dashboard.evenements")} />
                  <Line type="monotone" dataKey="tasks" stroke="#22C55E" strokeWidth={2} name={t("dashboard.taches")} />
                  <Line type="monotone" dataKey="interviews" stroke="#06B6D4" strokeWidth={2} name={t("entretiens.titre")} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="p-6 md:p-8 hover:shadow-md transition-shadow animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center gap-2 mb-6">
              <FileText className="w-6 h-6 text-accent-emerald" />
              <h2 className="text-xl font-bold text-foreground">{t("dashboard.repartition_membres")}</h2>
            </div>
            <div className="h-64 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={(chartData?.membreRepartition || []).filter(d => d._id).map((d, i) => ({ name: d._id || "Non renseigné", value: d.count, fill: CHART_COLORS[i % CHART_COLORS.length] }))} cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={2} dataKey="value">
                    {(chartData?.membreRepartition || []).filter(d => d._id).map((entry, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-6 md:p-8 hover:shadow-md transition-shadow animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center gap-2 mb-6">
              <Activity className="w-6 h-6 text-accent-amber" />
              <h2 className="text-xl font-bold text-foreground">{t("dashboard.activites_recentes")}</h2>
            </div>
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {recentActivities?.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">{t("dashboard.aucune_activite")}</p>
              ) : (
                recentActivities?.map((act, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-muted/20 rounded-xl ring-1 ring-border/50 animate-in fade-in slide-in-from-bottom-2 duration-300" style={{ animationDelay: (i * 50) + "ms" }}>
                    <div className={"w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 " + activityIcon(act.type).bg}>
                      {activityIcon(act.type).icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{activityText(act, t)}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(act.date)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6 md:p-8 hover:shadow-md transition-shadow animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center gap-2 mb-6">
              <Calendar className="w-6 h-6 text-primary-500" />
              <h2 className="text-xl font-bold text-foreground">{t("dashboard.evenements_a_venir")}</h2>
            </div>
            {upcomingEvents?.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">{t("dashboard.aucun_evenement")}</p>
            ) : (
              <div className="space-y-3">
                {upcomingEvents?.map((e) => (
                  <div key={e._id} className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl ring-1 ring-border">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-accent-cyan/10 text-accent-cyan flex items-center justify-center">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{e.titre}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(e.date)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card className="p-6 md:p-8 hover:shadow-md transition-shadow animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center gap-2 mb-6">
              <ClipboardList className="w-6 h-6 text-accent-amber" />
              <h2 className="text-xl font-bold text-foreground">{t("dashboard.taches_recentes")}</h2>
            </div>
            {recentTasks?.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">{t("dashboard.aucune_tache")}</p>
            ) : (
              <div className="space-y-3">
                {recentTasks?.slice(0, 5).map((task) => (
                  <div key={task._id} className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl ring-1 ring-border">
                    <div className="flex items-center gap-3">
                      <div className={"w-2 h-2 rounded-full " + getStatusDot(task.statut)} />
                      <span className="font-medium text-foreground">{task.titre}</span>
                    </div>
                    <Badge variant="secondary" className={getStatusColor(task.statut)}>{translateStatus(task.statut)}</Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <Card className="p-6 md:p-8 hover:shadow-md transition-shadow animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-center gap-2 mb-6">
            <Zap className="w-6 h-6 text-accent-emerald" />
            <h2 className="text-xl font-bold text-foreground">{t("dashboard.actions_rapides")}</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            <Link to="/tasks" className="group flex flex-col items-center gap-2 p-5 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 text-white hover:shadow-soft-lg hover:-translate-y-0.5 transition-all duration-300">
              <ClipboardList className="w-7 h-7" />
              <span className="text-sm font-semibold">{t("dashboard.creer_tache")}</span>
            </Link>
            <Link to="/events" className="group flex flex-col items-center gap-2 p-5 rounded-2xl bg-gradient-to-br from-accent-cyan to-cyan-700 text-white hover:shadow-soft-lg hover:-translate-y-0.5 transition-all duration-300">
              <Calendar className="w-7 h-7" />
              <span className="text-sm font-semibold">{t("dashboard.creer_evenement")}</span>
            </Link>
            <Link to="/documents" className="group flex flex-col items-center gap-2 p-5 rounded-2xl bg-gradient-to-br from-accent-emerald to-emerald-700 text-white hover:shadow-soft-lg hover:-translate-y-0.5 transition-all duration-300">
              <FileText className="w-7 h-7" />
              <span className="text-sm font-semibold">{t("dashboard.documents")}</span>
            </Link>
            <Link to="/profile" className="group flex flex-col items-center gap-2 p-5 rounded-2xl bg-gradient-to-br from-accent-amber to-amber-700 text-white hover:shadow-soft-lg hover:-translate-y-0.5 transition-all duration-300">
              <Users className="w-7 h-7" />
              <span className="text-sm font-semibold">{t("dashboard.mon_profil")}</span>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, color, sub }) => {
  const colorMap = {
    primary: "bg-primary-50 text-primary-700 ring-primary-200",
    emerald: "bg-accent-emerald/10 text-accent-emerald ring-accent-emerald/20",
    amber: "bg-accent-amber/10 text-accent-amber ring-accent-amber/20",
    cyan: "bg-accent-cyan/10 text-accent-cyan ring-accent-cyan/20",
    rose: "bg-accent-rose/10 text-accent-rose ring-accent-rose/20",
  };
  const iconMap = {
    primary: "text-primary-600",
    emerald: "text-accent-emerald",
    amber: "text-accent-amber",
    cyan: "text-accent-cyan",
    rose: "text-accent-rose",
  };
  return (
    <Card className={"p-5 md:p-6 ring-1 shadow-soft " + (colorMap[color] || "bg-muted/30 text-foreground ring-border") + " hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 animate-in fade-in slide-in-from-bottom-2 duration-300"}>
      <div className={"w-11 h-11 rounded-xl flex items-center justify-center mb-3 " + (iconMap[color] || "text-foreground") + " bg-white/60 backdrop-blur-sm"}>
        {icon}
      </div>
      <div className="text-2xl md:text-3xl font-bold">{value}</div>
      <div className="text-sm text-muted-foreground mt-0.5">{label}</div>
      {sub && <div className="text-xs text-accent-emerald font-medium mt-1">{sub}</div>}
    </Card>
  );
};

const getStatusColor = (statut) => {
  const colors = {
    "créée": "bg-accent text-muted-foreground",
    cree: "bg-accent text-muted-foreground",
    "assignée": "bg-primary-100 text-primary-700",
    assignee: "bg-primary-100 text-primary-700",
    "en-cours": "bg-accent-amber/10 text-accent-amber",
    "en-révision": "bg-accent-cyan/10 text-accent-cyan",
    "en-revision": "bg-accent-cyan/10 text-accent-cyan",
    "terminée": "bg-accent-emerald/10 text-accent-emerald",
    terminee: "bg-accent-emerald/10 text-accent-emerald",
    "annulée": "bg-accent-rose/10 text-accent-rose",
    annulee: "bg-accent-rose/10 text-accent-rose",
  };
  return colors[statut] || "bg-accent text-muted-foreground";
};

const getStatusDot = (statut) => {
  const dots = {
    "créée": "bg-muted-foreground",
    cree: "bg-muted-foreground",
    "assignée": "bg-primary-500",
    assignee: "bg-primary-500",
    "en-cours": "bg-accent-amber",
    "en-révision": "bg-accent-cyan",
    "en-revision": "bg-accent-cyan",
    "terminée": "bg-accent-emerald",
    terminee: "bg-accent-emerald",
    "annulée": "bg-accent-rose",
    annulee: "bg-accent-rose",
  };
  return dots[statut] || "bg-muted-foreground";
};

const activityIcon = (type) => {
  const icons = {
    membre: { icon: <UserPlus className="w-4 h-4" />, bg: "bg-primary-100 text-primary-600" },
    entretien: { icon: <Video className="w-4 h-4" />, bg: "bg-accent-amber/10 text-accent-amber" },
    evenement: { icon: <Calendar className="w-4 h-4" />, bg: "bg-accent-cyan/10 text-accent-cyan" },
    tache: { icon: <ClipboardList className="w-4 h-4" />, bg: "bg-accent-emerald/10 text-accent-emerald" },
    publication: { icon: <Megaphone className="w-4 h-4" />, bg: "bg-accent-rose/10 text-accent-rose" },
  };
  return icons[type] || { icon: <Activity className="w-4 h-4" />, bg: "bg-muted/30 text-muted-foreground" };
};

const activityText = (act, t) => {
  const actionLabels = {
    inscrit: t("dashboard.activite_inscrit"),
    'en-attente': t("dashboard.activite_entretien_attente"),
    approuvé: t("dashboard.activite_entretien_approuve"),
    approuve: t("dashboard.activite_entretien_approuve"),
    réalisé: t("dashboard.activite_entretien_realise"),
    realise: t("dashboard.activite_entretien_realise"),
    annulé: t("dashboard.activite_entretien_annule"),
    annule: t("dashboard.activite_entretien_annule"),
    'créé': t("dashboard.activite_cree"),
    cree: t("dashboard.activite_cree"),
    'créée': t("dashboard.activite_cree"),
    creee: t("dashboard.activite_cree"),
  };
  const action = actionLabels[act.action] || act.action;
  if (act.type === "membre") return `${act.data?.prenom} ${act.data?.nom} - ${action}`;
  if (act.type === "entretien" && act.data?.membre) return `${act.data.membre.prenom} ${act.data.membre.nom} - ${action}`;
  if (act.type === "evenement") return `${act.data?.titre || ""} - ${action}`;
  if (act.type === "tache") return `${act.data?.titre || ""} - ${action}`;
  if (act.type === "publication") return `${act.data?.titre || ""} - ${action}`;
  return action;
};

export default PresidentDashboard;
