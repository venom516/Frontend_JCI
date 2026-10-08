import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useI18n } from "../contexts/I18nContext";
import { eventAPI, taskAPI } from "../api/axios";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Skeleton } from "../components/ui/skeleton";
import { Badge } from "../components/ui/badge";
import { Handshake, Globe, Target, Users, Calendar, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

const DashboardVPPRE = () => {
  const { t } = useI18n();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [eventCount, setEventCount] = useState(0);
  const [tasks, setTasks] = useState([]);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [eventsRes, tasksRes] = await Promise.all([
        eventAPI.getAll({ limit: 5 }).catch(() => ({ data: { data: [] } })),
        taskAPI.getAll({ limit: 5 }).catch(() => ({ data: { data: [] } })),
      ]);
      setEvents(eventsRes.data.data || []);
      setEventCount(eventsRes.data.data?.length || 0);
      setTasks(tasksRes.data.data || []);
    } catch (error) { toast.error(error.response?.data?.message || error.translatedMessage || t('common.erreur')); }
    finally { setLoading(false); }
  };

  if (loading) return <Skeleton className="h-96 w-full" />;

  return (
    <div className="min-h-screen bg-surface-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-primary-100 flex items-center justify-center text-primary-600">
            <Handshake className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-surface-900">{t('members.role_vppre')}</h1>
            <p className="text-surface-500">{t('dashboard.vppre_sous_titre')}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="text-center p-4 bg-primary-100 text-primary-800">
            <div className="text-2xl font-bold">{events.filter(e => new Date(e.date) > new Date()).length}</div>
            <div className="text-xs text-muted-foreground">{t('dashboard.projets_actifs')}</div>
          </Card>
          <Card className="text-center p-4 bg-emerald-100 text-emerald-800">
            <div className="text-2xl font-bold">{eventCount}</div>
            <div className="text-xs text-muted-foreground">{t('dashboard.evenements_prevus')}</div>
          </Card>
          <Card className="text-center p-4 bg-amber-100 text-amber-800">
            <div className="text-2xl font-bold">{tasks.filter(t => t.status !== "terminé" && t.status !== "completed").length}</div>
            <div className="text-xs text-muted-foreground">{t('dashboard.taches_en_cours')}</div>
          </Card>
          <Card className="text-center p-4 bg-cyan-100 text-cyan-800">
            <div className="text-2xl font-bold">{tasks.filter(t => t.status === "terminé" || t.status === "completed").length}</div>
            <div className="text-xs text-muted-foreground">{t('dashboard.taches_terminees')}</div>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-surface-900">{t('dashboard.projets_commissions')}</CardTitle>
          </CardHeader>
          <CardContent>
            {events.length === 0 ? (
              <p className="text-surface-400 text-center py-8">{t('dashboard.aucun_projet')}</p>
            ) : (
              <div className="space-y-3">
                {events.map(e => (
                  <div key={e._id} className="flex items-center justify-between p-3 rounded-xl bg-surface-50 border border-surface-200">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center">
                        <Target className="w-4 h-4 text-primary-600" />
                      </div>
                      <div>
                        <p className="font-medium text-surface-900 text-sm">{e.titre}</p>
                        <p className="text-xs text-surface-500"><Calendar className="w-3 h-3 inline mr-1" />{new Date(e.date).toLocaleDateString('fr-TN')}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-surface-400" />
                  </div>
                ))}
              </div>
            )}
            <div className="mt-4 text-center">
              <Link to="/events" className="text-sm text-primary-600 hover:underline">{t('dashboard.voir_tous_projets')}</Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-surface-900">{t('dashboard.relations_exterieures')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="p-4 rounded-xl bg-surface-50 border border-surface-200 text-center">
                <Users className="w-8 h-8 mx-auto text-primary-600 mb-2" />
                <p className="text-sm font-medium text-surface-900">{t('dashboard.partenaires')}</p>
              </div>
              <div className="p-4 rounded-xl bg-surface-50 border border-surface-200 text-center">
                <Globe className="w-8 h-8 mx-auto text-emerald-600 mb-2" />
                <p className="text-sm font-medium text-surface-900">{t('dashboard.sponsors')}</p>
              </div>
              <div className="p-4 rounded-xl bg-surface-50 border border-surface-200 text-center">
                <Handshake className="w-8 h-8 mx-auto text-amber-600 mb-2" />
                <p className="text-sm font-medium text-surface-900">{t('dashboard.medias')}</p>
              </div>
            </div>
            <p className="text-sm text-surface-500 text-center">{t('dashboard.relations_description')}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardVPPRE;
