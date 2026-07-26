import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useI18n } from "../contexts/I18nContext";
import { dashboardAPI, newsAPI, taskAPI, eventAPI, formationAPI } from "../api/axios";
import { Skeleton } from "../components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { ClipboardList, CheckCircle, Calendar, Users, Mail, Pencil, Newspaper, RefreshCw, Eye, Clock, GraduationCap, Target, ChevronRight, Award, Star, Shield } from "lucide-react";

const roleConfig = {
  Membre: { title: "dashboard.membre", icon: Users, badge: "bg-primary-500 to-accent-cyan" },
  PP: { title: "dashboard.past_president", icon: Award, badge: "bg-accent-amber to-accent-amber/80" },
  "Past President": { title: "dashboard.past_president", icon: Award, badge: "bg-accent-amber to-accent-amber/80" },
  PPI: { title: "dashboard.ppi", icon: Star, badge: "bg-accent-emerald to-accent-emerald/80" },
  Sénateur: { title: "dashboard.senateur", icon: Shield, badge: "bg-accent-cyan to-accent-cyan/80" },
};

const MembreDashboard = () => {
  const { t, formatDate, formatDateTime } = useI18n();
  const { user } = useAuth();
  const role = user?.role || "Membre";
  const config = roleConfig[role] || roleConfig.Membre;
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [recentNews, setRecentNews] = useState([]);
  const [profileData, setProfileData] = useState(null);
  const [upcomingTasks, setUpcomingTasks] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [upcomingFormations, setUpcomingFormations] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await dashboardAPI.getMembre();
      setProfileData(response.data.data);

      const newsRes = await newsAPI.getPublic({ limit: 5 });
      setRecentNews(newsRes.data.data || []);

      const [tasksRes, eventsRes, formationsRes] = await Promise.all([
        taskAPI.getAll({ limit: 5, sort: 'deadline' }).catch(() => ({ data: { data: [] } })),
        eventAPI.getAll({ limit: 5 }).catch(() => ({ data: { data: [] } })),
        formationAPI.getAll({ limit: 5 }).catch(() => ({ data: { data: [] } }))
      ]);
      setUpcomingTasks(tasksRes.data.data || []);
      setUpcomingEvents(eventsRes.data.data || []);
      setUpcomingFormations(formationsRes.data.data || []);

    } catch (error) {
      console.error("Erreur chargement dashboard:", error);
      toast.error(t("home.erreur_chargement"));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  if (loading) return <Skeleton className="h-96 w-full" />;

  return (
    <div className="page-container min-h-screen bg-surface-50/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="mb-8 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
          <CardContent className="pt-6">
            <div className="flex flex-wrap justify-between items-center gap-4">
              <div className="flex items-center gap-4 md:gap-6">
                <div className={"w-16 h-16 rounded-2xl bg-gradient-to-br flex items-center justify-center text-white text-xl font-bold overflow-hidden ring-2 ring-primary-200 " + config.badge}>
                  {user?.photo ? (
                    <img src={user.photo} alt={t("common.photo")} className="w-full h-full object-cover" />
                  ) : (
                    <span>{(user?.prenom?.[0] || "").toUpperCase()}{(user?.nom?.[0] || "").toUpperCase()}</span>
                  )}
                </div>
                <div>
                  <h1 className="section-title font-display text-3xl font-bold text-surface-900">{t(config.title)}</h1>
                  <p className="section-subtitle text-surface-600">
                    {t("dashboard.bienvenue")}, <span className="font-semibold text-primary-600">{user?.prenom} {user?.nom}</span> !
                  </p>
                  <p className="text-xs text-surface-400 mt-1 flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5" />
                    {user?.email}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                onClick={handleRefresh}
                disabled={refreshing}
                className="bg-surface-100 hover:bg-surface-200 text-surface-600 px-4 py-2.5 rounded-2xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-soft flex items-center gap-2 disabled:opacity-50"
              >
                <RefreshCw className={"w-5 h-5 " + (refreshing ? "animate-spin" : "")} />
                {refreshing ? t("common.chargement") : t("dashboard.rafraichir")}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8">
          <StatCard
            icon={<ClipboardList className="w-6 h-6" />}
            label={t("dashboard.mes_taches")}
            value={profileData?.stats?.tasks || 0}
            color="primary"
          />
          <StatCard
            icon={<CheckCircle className="w-6 h-6" />}
            label={t("dashboard.terminees")}
            value={profileData?.stats?.tasksTerminees || 0}
            color="emerald"
          />
          <StatCard
            icon={<Calendar className="w-6 h-6" />}
            label={t("dashboard.evenements_a_venir")}
            value={profileData?.stats?.eventsParticipation || 0}
            color="cyan"
          />
          <StatCard
            icon={<Users className="w-6 h-6" />}
            label={t("dashboard.filleuls")}
            value={profileData?.stats?.filleulsCount || 0}
            color="amber"
          />
        </div>

        <Card className="p-6 md:p-8 card-hover mb-8">
          <div className="flex items-center gap-2 mb-6">
            <Calendar className="w-6 h-6 text-accent-cyan" />
            <CardTitle className="section-title font-display text-xl font-bold text-surface-800">{t("dashboard.calendrier")}</CardTitle>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Target className="w-4 h-4 text-primary-500" />
                <h3 className="font-semibold text-surface-700 text-sm uppercase tracking-wide">{t("dashboard.taches_a_venir")}</h3>
              </div>
              {upcomingTasks.length === 0 ? (
                <p className="text-sm text-surface-400 italic">{t("dashboard.aucune_tache")}</p>
              ) : (
                <div className="space-y-2">
                  {upcomingTasks.slice(0, 3).map(t => (
                    <div key={t._id} className="flex items-start gap-2 p-2 rounded-lg bg-surface-50/80">
                      <Clock className="w-4 h-4 text-accent-amber mt-0.5 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-surface-800 truncate">{t.titre || t.title}</p>
                        <p className="text-xs text-surface-500">{t.deadline ? formatDate(t.deadline) : ''}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-4 h-4 text-accent-emerald" />
                <h3 className="font-semibold text-surface-700 text-sm uppercase tracking-wide">{t("dashboard.evenements")}</h3>
              </div>
              {upcomingEvents.length === 0 ? (
                <p className="text-sm text-surface-400 italic">{t("dashboard.aucun_evenement")}</p>
              ) : (
                <div className="space-y-2">
                  {upcomingEvents.slice(0, 3).map(e => (
                    <div key={e._id} className="flex items-start gap-2 p-2 rounded-lg bg-surface-50/80">
                      <Calendar className="w-4 h-4 text-accent-cyan mt-0.5 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-surface-800 truncate">{e.titre || e.title}</p>
                        <p className="text-xs text-surface-500">{e.date ? formatDate(e.date) : ''}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-3">
                <GraduationCap className="w-4 h-4 text-accent-amber" />
                <h3 className="font-semibold text-surface-700 text-sm uppercase tracking-wide">{t("dashboard.formations")}</h3>
              </div>
              {upcomingFormations.length === 0 ? (
                <p className="text-sm text-surface-400 italic">{t("dashboard.aucune_formation")}</p>
              ) : (
                <div className="space-y-2">
                  {upcomingFormations.slice(0, 3).map(f => (
                    <div key={f._id} className="flex items-start gap-2 p-2 rounded-lg bg-surface-50/80">
                      <GraduationCap className="w-4 h-4 text-accent-amber mt-0.5 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-surface-800 truncate">{f.titre || f.title}</p>
                        <p className="text-xs text-surface-500">{f.date ? formatDate(f.date) : ''}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Card>

        <Card className="p-6 md:p-8 card-hover mb-8">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <Newspaper className="w-6 h-6 text-primary-500" />
              <CardTitle className="section-title font-display text-xl font-bold text-surface-800">
                {t("dashboard.dernieres_actualites")}
              </CardTitle>
              <span className="text-sm font-normal text-surface-400">({recentNews.length || 0})</span>
            </div>
            <Link to="/news">
              <Button variant="ghost" size="sm" className="text-primary-600 hover:bg-primary-50 px-3 py-1.5 rounded-xl text-sm transition-all flex items-center gap-1">
                {t("dashboard.voir_toutes")}
                <Eye className="w-4 h-4" />
              </Button>
            </Link>
          </div>
          {recentNews.length === 0 ? (
            <div className="text-center py-10 text-surface-400">
              <Newspaper className="w-16 h-16 mx-auto mb-3 text-surface-300" />
              <p>{t("dashboard.aucune_actualite")}</p>
              <p className="text-sm">{t("dashboard.revenez_plus_tard")}</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {recentNews.map((news) => (
                <div
                  key={news._id}
                  className="bg-surface-50/80 rounded-2xl p-5 ring-1 ring-surface-200/50 hover:shadow-soft-lg hover:-translate-y-0.5 transition-all duration-300 cursor-pointer animate-fade-in-up"
                  onClick={() => window.location.href = "/news/" + news._id}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center flex-shrink-0">
                      <Newspaper className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-surface-800 line-clamp-2">{news.titre || news.title}</h3>
                      <p className="text-sm text-surface-500 line-clamp-2 mt-1">{news.contenu || news.content || "..."}</p>
                      <div className="flex items-center gap-2 mt-3">
                        <span className="text-xs text-surface-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(news.createdAt || news.date)}
                        </span>
                        {news.category && (
                          <Badge className="text-xs px-2 py-0.5 rounded-full bg-primary-100 text-primary-700">{news.category}</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-6 md:p-8 card-hover">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <Users className="w-6 h-6 text-accent-cyan" />
              <CardTitle className="section-title font-display text-xl font-bold text-surface-800">{t("dashboard.mon_profil")}</CardTitle>
            </div>
            <Link to="/profile">
              <Button variant="ghost" size="sm" className="text-primary-600 hover:bg-primary-50 px-3 py-1.5 rounded-xl text-sm transition-all flex items-center gap-1">
                <Pencil className="w-4 h-4" />
                {t("common.modifier")}
              </Button>
            </Link>
          </div>
          <div className="grid md:grid-cols-2 gap-4 md:gap-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-surface-50/80 rounded-2xl ring-1 ring-surface-200/50">
                <span className="text-surface-500 text-sm">{t("dashboard.nom_complet")}</span>
                <span className="font-medium text-surface-800 text-sm">{user?.prenom} {user?.nom}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-surface-50/80 rounded-2xl ring-1 ring-surface-200/50">
                <span className="text-surface-500 text-sm">{t("members.email")}</span>
                <span className="font-medium text-surface-800 text-sm">{user?.email}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-surface-50/80 rounded-2xl ring-1 ring-surface-200/50">
                <span className="text-surface-500 text-sm">{t("members.role")}</span>
                <Badge className="px-3 py-1 rounded-xl text-xs font-semibold bg-primary-100 text-primary-700">{user?.role || t("common.membre")}</Badge>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-surface-50/80 rounded-2xl ring-1 ring-surface-200/50">
                <span className="text-surface-500 text-sm">{t("members.telephone")}</span>
                <span className="font-medium text-surface-800 text-sm">{user?.telephone || t("common.non_renseigne")}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-surface-50/80 rounded-2xl ring-1 ring-surface-200/50">
                <span className="text-surface-500 text-sm">{t("members.statut")}</span>
                <Badge className={"px-3 py-1 rounded-xl text-xs font-semibold " + (user?.status === "actif" ? "bg-accent-emerald/10 text-accent-emerald" : "bg-accent-amber/10 text-accent-amber")}>
                  {user?.status === "actif" ? t("members.actifs") : t("members.en_attente")}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-4 bg-surface-50/80 rounded-2xl ring-1 ring-surface-200/50">
                <span className="text-surface-500 text-sm">{t("dashboard.date_inscription")}</span>
                <span className="font-medium text-surface-800 text-sm">{user?.createdAt ? formatDate(user.createdAt) : t("common.non_renseigne")}</span>
              </div>
            </div>
          </div>
        </Card>

        <div className="mt-8 text-center text-xs text-surface-400">
          <p>{t("dashboard.derniere_mise_a_jour")}: {formatDateTime(new Date())}</p>
          <p className="mt-1">{t("dashboard.footer_plateforme")}</p>
        </div>
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

export default MembreDashboard;