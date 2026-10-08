import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useI18n } from "../contexts/I18nContext";
import { dashboardAPI, eventAPI } from "../api/axios";
import { useAutoRefresh } from "../hooks/useAutoRefresh";
import { Skeleton } from "../components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Link } from "react-router-dom";
import { FileText, ClipboardList, BarChart3, ListChecks, Calendar, Zap, Upload, Eye } from "lucide-react";

const SGDashboard = () => {
  const { t, formatDate, translateStatus } = useI18n();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [upcomingEvents, setUpcomingEvents] = useState([]);

  const fetchData = async (quiet = false) => {
      try {
        const response = await dashboardAPI.getSG();
        setData(response.data.data);
      } catch (error) {
        console.error("Erreur chargement dashboard:", error);
      } finally {
        if (!quiet) setLoading(false);
      }
    };

  // Les événements sont chargés séparément : l'endpoint du dashboard SG ne les
  // retourne pas. Le filtre "à venir" est refait ici car le serveur ne filtre
  // sur la date que pour le rôle Membre.
  const fetchEvents = async () => {
      try {
        const res = await eventAPI.getAll();
        const all = res.data.data || [];
        // Comparaison au début de la journée : un événement programmé
        // aujourd'hui vaut 00:00, il serait exclu si on le comparait à
        // l'heure courante.
        const debutDuJour = new Date();
        debutDuJour.setHours(0, 0, 0, 0);
        setUpcomingEvents(
          all
            .filter((e) => e.date && new Date(e.date) >= debutDuJour && e.status !== "annulée")
            .sort((a, b) => new Date(a.date) - new Date(b.date))
        );
      } catch (error) {
        console.error("Erreur chargement événements:", error);
        setUpcomingEvents([]);
      }
    };

  useEffect(() => {
    fetchData();
    fetchEvents();
  }, []);

  useAutoRefresh(() => fetchData(true));

  if (loading) return <Skeleton className="h-96 w-full" />;

  const { stats, recentDocuments } = data || {};

  return (
    <div className="page-container min-h-screen bg-surface-50/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="mb-8 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-accent-cyan/10 text-accent-cyan flex items-center justify-center">
                <FileText className="w-7 h-7" />
              </div>
              <div>
                <h1 className="section-title font-display text-3xl font-bold text-surface-900">{t("dashboard.secretaire")}</h1>
                <p className="section-subtitle text-surface-500 mt-1">{t("dashboard.bienvenue")}, {user?.prenom} {user?.nom} !</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8">
          <StatCard icon={<FileText className="w-6 h-6" />} label={t("dashboard.documents_count")} value={stats?.documents || 0} color="primary" />
          <StatCard icon={<FileText className="w-6 h-6" />} label={t("dashboard.pv")} value={stats?.documentsPV || 0} color="emerald" />
          <StatCard icon={<BarChart3 className="w-6 h-6" />} label={t("dashboard.rapports")} value={stats?.documentsRapports || 0} color="amber" />
          <StatCard icon={<ListChecks className="w-6 h-6" />} label={t("dashboard.ordres_jour")} value={stats?.documentsODJ || 0} color="cyan" />
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="p-6 md:p-8 card-hover">
            <div className="flex items-center justify-between gap-2 mb-6">
              <div className="flex items-center gap-2">
                <Calendar className="w-6 h-6 text-accent-cyan" />
                <CardTitle className="section-title font-display text-xl font-bold text-surface-800">{t("dashboard.evenements_a_venir")}</CardTitle>
              </div>
              <Link to="/events" className="text-xs font-medium text-primary-600 hover:text-primary-700 hover:underline">
                {t("dashboard.voir_toutes")}
              </Link>
            </div>
            {upcomingEvents.length === 0 ? (
              <p className="text-surface-400 text-center py-8 italic">{t("dashboard.aucun_evenement")}</p>
            ) : (
              <div className="space-y-3">
                {upcomingEvents.slice(0, 5).map((e) => (
                  <div key={e._id} className="flex items-start justify-between gap-3 p-4 bg-surface-50/80 rounded-2xl ring-1 ring-surface-200/50 animate-fade-in-up">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-accent-cyan/10 text-accent-cyan flex items-center justify-center shrink-0">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-surface-800 truncate">{e.titre}</p>
                        <p className="text-xs text-surface-400">
                          {e.date ? formatDate(e.date) : ""}
                          {e.lieu ? ` · ${e.lieu}` : ""}
                        </p>
                      </div>
                    </div>
                    <Badge className={"text-xs px-3 py-1 rounded-xl shrink-0 " + getEventStatusColor(e.status)}>
                      {translateStatus(e.status)}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card className="p-6 md:p-8 card-hover">
            <div className="flex items-center gap-2 mb-6">
              <FileText className="w-6 h-6 text-primary-500" />
              <CardTitle className="section-title font-display text-xl font-bold text-surface-800">{t("dashboard.derniers_documents")}</CardTitle>
            </div>
            {recentDocuments?.length === 0 ? (
              <p className="text-surface-400 text-center py-8">{t("dashboard.aucun_document")}</p>
            ) : (
              <div className="space-y-3">
                {recentDocuments?.slice(0, 5).map((d) => (
                  <div key={d._id} className="flex items-center justify-between p-4 bg-surface-50/80 rounded-2xl ring-1 ring-surface-200/50 animate-fade-in-up">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center">
                        <FileText className="w-5 h-5" />
                      </div>
                      <span className="font-medium text-surface-700">{d.titre}</span>
                    </div>
                    <Badge className={"text-xs px-3 py-1 rounded-xl " + getDocStatusColor(d.status)}>{translateStatus(d.status)}</Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <Card className="p-6 md:p-8 card-hover animate-slide-up">
          <div className="flex items-center gap-2 mb-6">
            <Zap className="w-6 h-6 text-accent-emerald" />
            <CardTitle className="section-title font-display text-xl font-bold text-surface-800">{t("dashboard.actions_rapides")}</CardTitle>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            <Link to="/documents" className="group flex flex-col items-center gap-2 p-5 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 text-white hover:shadow-soft-lg hover:-translate-y-0.5 transition-all duration-300">
              <Upload className="w-7 h-7" />
              <span className="text-sm font-semibold">{t("dashboard.upload_document")}</span>
            </Link>
            <Link to="/documents" className="group flex flex-col items-center gap-2 p-5 rounded-2xl bg-gradient-to-br from-accent-emerald to-emerald-700 text-white hover:shadow-soft-lg hover:-translate-y-0.5 transition-all duration-300">
              <FileText className="w-7 h-7" />
              <span className="text-sm font-semibold">{t("dashboard.voir_pv")}</span>
            </Link>
            <Link to="/entretiens" className="group flex flex-col items-center gap-2 p-5 rounded-2xl bg-gradient-to-br from-accent-cyan to-cyan-700 text-white hover:shadow-soft-lg hover:-translate-y-0.5 transition-all duration-300">
              <Calendar className="w-7 h-7" />
              <span className="text-sm font-semibold">{t("dashboard.entretiens")}</span>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, color }) => {
  const colorMap = {
    primary: "bg-primary-50 text-primary-700 ring-primary-200",
    emerald: "bg-accent-emerald/10 text-accent-emerald ring-accent-emerald/20",
    amber: "bg-accent-amber/10 text-accent-amber ring-accent-amber/20",
    cyan: "bg-accent-cyan/10 text-accent-cyan ring-accent-cyan/20",
  };
  const iconMap = {
    primary: "text-primary-600",
    emerald: "text-accent-emerald",
    amber: "text-accent-amber",
    cyan: "text-accent-cyan",
  };
  return (
    <div className={"stat-card p-5 md:p-6 rounded-2xl ring-1 shadow-soft " + (colorMap[color] || "bg-surface-50 text-surface-700 ring-surface-200") + " hover:shadow-soft-lg hover:-translate-y-0.5 transition-all duration-300 animate-fade-in-up"}>
      <div className={"w-11 h-11 rounded-xl flex items-center justify-center mb-3 " + (iconMap[color]) + " bg-white/60 backdrop-blur-sm"}>
        {icon}
      </div>
      <div className="stat-value text-2xl md:text-3xl font-bold font-display">{value}</div>
      <div className="stat-label text-sm text-surface-500 mt-0.5">{label}</div>
    </div>
  );
};

const getEventStatusColor = (status) => {
  const colors = {
    "planifiée": "bg-accent-cyan/10 text-accent-cyan",
    "en-cours": "bg-accent-emerald/10 text-accent-emerald",
    "terminée": "bg-surface-100 text-surface-600",
    "reportée": "bg-accent-amber/10 text-accent-amber",
    "annulée": "bg-accent-rose/10 text-accent-rose",
  };
  return colors[status] || "bg-surface-100 text-surface-600";
};

const getDocStatusColor = (status) => {
  const colors = {
    brouillon: "bg-surface-100 text-surface-600",
    "en-attente": "bg-accent-amber/10 text-accent-amber",
    approuve: "bg-accent-emerald/10 text-accent-emerald",
    archive: "bg-accent-cyan/10 text-accent-cyan",
    supprime: "bg-accent-rose/10 text-accent-rose",
  };
  return colors[status] || "bg-surface-100 text-surface-600";
};

export default SGDashboard;