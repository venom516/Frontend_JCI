import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useI18n } from "../contexts/I18nContext";
import { dashboardAPI } from "../api/axios";
import { useAutoRefresh } from "../hooks/useAutoRefresh";
import { Skeleton } from "../components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Link } from "react-router-dom";
import { Newspaper, CheckCircle, Clock, FileText, Pencil, Upload, Calendar, Zap, Eye } from "lucide-react";

const MediaDashboard = () => {
  const { t, translateStatus } = useI18n();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async (quiet = false) => {
      try {
        const response = await dashboardAPI.getMedia();
        setData(response.data.data);
      } catch (error) {
        console.error("Erreur chargement dashboard:", error);
      } finally {
        if (!quiet) setLoading(false);
      }
    };

  useEffect(() => {
    fetchData();
  }, []);

  useAutoRefresh(() => fetchData(true));

  if (loading) return <Skeleton className="h-96 w-full" />;

  const { stats, recentPublications, pendingNews } = data || {};

  return (
    <div className="page-container min-h-screen bg-surface-50/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="mb-8 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-accent-rose/10 text-accent-rose flex items-center justify-center">
                <Newspaper className="w-7 h-7" />
              </div>
              <div>
                <h1 className="section-title font-display text-3xl font-bold text-surface-900">{t("dashboard.media")}</h1>
                <p className="section-subtitle text-surface-500 mt-1">{t("dashboard.bienvenue")}, {user?.prenom} {user?.nom} !</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8">
          <StatCard icon={<Newspaper className="w-6 h-6" />} label={t("dashboard.publications")} value={stats?.totalPublications || 0} color="rose" />
          <StatCard icon={<CheckCircle className="w-6 h-6" />} label={t("dashboard.publiees")} value={stats?.publicationsPubliees || 0} color="emerald" />
          <StatCard icon={<Clock className="w-6 h-6" />} label={t("dashboard.en_attente")} value={stats?.publicationsEnAttente || 0} color="amber" />
          <StatCard icon={<Newspaper className="w-6 h-6" />} label={t("dashboard.actualites")} value={stats?.totalNews || 0} color="primary" />
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="p-6 md:p-8 card-hover">
            <div className="flex items-center gap-2 mb-6">
              <Newspaper className="w-6 h-6 text-accent-rose" />
              <CardTitle className="section-title font-display text-xl font-bold text-surface-800">{t("dashboard.dernieres_publications")}</CardTitle>
            </div>
            {recentPublications?.length === 0 ? (
              <p className="text-surface-400 text-center py-8">{t("dashboard.aucune_publication")}</p>
            ) : (
              <div className="space-y-3">
                {recentPublications?.slice(0, 5).map((p) => (
                  <div key={p._id} className="flex items-center justify-between p-4 bg-surface-50/80 rounded-2xl ring-1 ring-surface-200/50 animate-fade-in-up">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-accent-rose/10 text-accent-rose flex items-center justify-center">
                        <FileText className="w-5 h-5" />
                      </div>
                      <span className="font-medium text-surface-700">{p.titre}</span>
                    </div>
                    <Badge className={"text-xs px-3 py-1 rounded-xl " + getPubStatusColor(p.status)}>{translateStatus(p.status)}</Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card className="p-6 md:p-8 card-hover">
            <div className="flex items-center gap-2 mb-6">
              <Clock className="w-6 h-6 text-accent-amber" />
              <CardTitle className="section-title font-display text-xl font-bold text-surface-800">{t("dashboard.actualites_brouillon")}</CardTitle>
            </div>
            {pendingNews?.length === 0 ? (
              <p className="text-surface-400 text-center py-8">{t("dashboard.aucune_actualite")}</p>
            ) : (
              <div className="space-y-3">
                {pendingNews?.map((n) => (
                  <div key={n._id} className="flex items-center justify-between p-4 bg-surface-50/80 rounded-2xl ring-1 ring-surface-200/50 animate-fade-in-up">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-accent-amber/10 text-accent-amber flex items-center justify-center">
                        <Clock className="w-5 h-5" />
                      </div>
                      <span className="font-medium text-surface-700">{n.titre}</span>
                    </div>
                    <Link to="/news">
                      <Button variant="ghost" size="sm" className="text-primary-600 hover:bg-primary-50">
                        <Pencil className="w-4 h-4 mr-1" />
                        {t("common.modifier")}
                      </Button>
                    </Link>
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            <Link to="/news" className="group flex flex-col items-center gap-2 p-5 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 text-white hover:shadow-soft-lg hover:-translate-y-0.5 transition-all duration-300">
              <Newspaper className="w-7 h-7" />
              <span className="text-sm font-semibold">{t("dashboard.nouvelle_actualite")}</span>
            </Link>
            <Link to="/publications" className="group flex flex-col items-center gap-2 p-5 rounded-2xl bg-gradient-to-br from-accent-emerald to-emerald-700 text-white hover:shadow-soft-lg hover:-translate-y-0.5 transition-all duration-300">
              <Upload className="w-7 h-7" />
              <span className="text-sm font-semibold">{t("dashboard.nouvelle_publication")}</span>
            </Link>
            <Link to="/tasks" className="group flex flex-col items-center gap-2 p-5 rounded-2xl bg-gradient-to-br from-accent-cyan to-cyan-700 text-white hover:shadow-soft-lg hover:-translate-y-0.5 transition-all duration-300">
              <FileText className="w-7 h-7" />
              <span className="text-sm font-semibold">{t("dashboard.taches_media")}</span>
            </Link>
            <Link to="/calendar" className="group flex flex-col items-center gap-2 p-5 rounded-2xl bg-gradient-to-br from-accent-amber to-amber-700 text-white hover:shadow-soft-lg hover:-translate-y-0.5 transition-all duration-300">
              <Calendar className="w-7 h-7" />
              <span className="text-sm font-semibold">{t("dashboard.calendrier")}</span>
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
    rose: "bg-accent-rose/10 text-accent-rose ring-accent-rose/20",
  };
  const iconMap = {
    primary: "text-primary-600",
    emerald: "text-accent-emerald",
    amber: "text-accent-amber",
    rose: "text-accent-rose",
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

const getPubStatusColor = (status) => {
  const colors = {
    cree: "bg-surface-100 text-surface-600",
    "en-attente": "bg-accent-amber/10 text-accent-amber",
    publiee: "bg-accent-emerald/10 text-accent-emerald",
    archivee: "bg-accent-cyan/10 text-accent-cyan",
    supprimee: "bg-accent-rose/10 text-accent-rose",
  };
  return colors[status] || "bg-surface-100 text-surface-600";
};

export default MediaDashboard;