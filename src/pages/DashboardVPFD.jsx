import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useI18n } from "../contexts/I18nContext";
import { formationAPI, entretienAPI, membreAPI } from "../api/axios";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Skeleton } from "../components/ui/skeleton";
import { Badge } from "../components/ui/badge";
import toast from "react-hot-toast";
import { GraduationCap, Calendar, Users, Plus, Pencil, Trash2, CheckSquare, Clock, MapPin } from "lucide-react";

const DashboardVPFD = () => {
  const { t, formatDate } = useI18n();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [formations, setFormations] = useState([]);
  const [formationCount, setFormationCount] = useState(0);
  const [entretiens, setEntretiens] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formTitre, setFormTitre] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formDateDebut, setFormDateDebut] = useState("");
  const [formDateFin, setFormDateFin] = useState("");
  const [formFormateur, setFormFormateur] = useState("");

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [countRes, formationsRes, entretiensRes] = await Promise.all([
        formationAPI.getCount(),
        formationAPI.getAll(),
        entretienAPI.getAll({ limit: 10 }),
      ]);
      setFormationCount(countRes.data.data.count);
      setFormations(formationsRes.data.data || []);
      setEntretiens(entretiensRes.data.data || []);
    } catch (e) { toast.error(e.response?.data?.message || e.translatedMessage || t('common.erreur')); }
    finally { setLoading(false); }
  };

  const openAddForm = () => {
    setEditId(null);
    setFormTitre("");
    setFormDescription("");
    setFormDateDebut("");
    setFormDateFin("");
    setFormFormateur("");
    setShowForm(true);
  };

  const openEditForm = (f) => {
    setEditId(f._id);
    setFormTitre(f.titre);
    setFormDescription(f.description || "");
    setFormDateDebut(f.dateDebut ? new Date(f.dateDebut).toISOString().slice(0, 16) : "");
    setFormDateFin(f.dateFin ? new Date(f.dateFin).toISOString().slice(0, 16) : "");
    setFormFormateur(f.formateur || "");
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!formTitre) { toast.error(t('formations.titre_requis')); return; }
    try {
      const payload = { titre: formTitre, description: formDescription, dateDebut: formDateDebut, dateFin: formDateFin, formateur: formFormateur };
      if (editId) {
        await formationAPI.update(editId, payload);
        toast.success(t('formations.modifiee'));
      } else {
        await formationAPI.create(payload);
        toast.success(t('formations.creee'));
      }
      setShowForm(false);
      fetchData();
    } catch (e) { toast.error(e.response?.data?.message || t('common.erreur')); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('formations.confirmer_suppression'))) return;
    try {
      await formationAPI.delete(id);
      toast.success(t('formations.supprimee'));
      fetchData();
    } catch (e) { toast.error(e.response?.data?.message || e.translatedMessage || t('common.erreur')); }
  };

  const statusBadge = (status) => {
    const classes = { "demandé": "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200", "en-attente": "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200", "approuvé": "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200", "réalisé": "bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-200", "annulé": "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200" };
    return classes[status] || "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
  };

  if (loading) return <Skeleton className="h-96 w-full" />;

  return (
    <div className="min-h-screen bg-surface-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-primary-100 flex items-center justify-center text-primary-600">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-surface-900">{t('members.role_vpfd')}</h1>
            <p className="text-surface-500">{t('dashboard.vpfd_sous_titre')}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Card className="text-center p-4 bg-primary-100 text-primary-800">
            <div className="text-2xl font-bold">{formationCount}</div>
            <div className="text-xs text-muted-foreground">{t('dashboard.formations_realisees')}</div>
          </Card>
          <Card className="text-center p-4 bg-emerald-100 text-emerald-800">
            <div className="text-2xl font-bold">{entretiens.filter(e => e.status === "approuvé" || e.status === "réalisé").length}</div>
            <div className="text-xs text-muted-foreground">{t('dashboard.entretiens_realises')}</div>
          </Card>
          <Card className="text-center p-4 bg-amber-100 text-amber-800">
            <div className="text-2xl font-bold">{entretiens.filter(e => e.status === "demandé" || e.status === "en-attente").length}</div>
            <div className="text-xs text-muted-foreground">{t('dashboard.entretiens_prevus')}</div>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-surface-900">{t('dashboard.gestion_formations')}</CardTitle>
              <Button size="sm" onClick={openAddForm}><Plus className="w-4 h-4 mr-1.5" /> {t('formations.ajouter')}</Button>
            </div>
          </CardHeader>
          <CardContent>
            {showForm && (
              <div className="mb-6 p-4 border border-surface-200 rounded-xl bg-surface-50">
                <h3 className="font-semibold text-surface-900 mb-4">{editId ? t('formations.modifier') : t('formations.nouvelle')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><Label>{t('formations.titre')} *</Label><Input value={formTitre} onChange={e => setFormTitre(e.target.value)} /></div>
                  <div><Label>{t('formations.formateur')}</Label><Input value={formFormateur} onChange={e => setFormFormateur(e.target.value)} /></div>
                  <div><Label>{t('formations.date_debut')}</Label><Input type="datetime-local" value={formDateDebut} onChange={e => setFormDateDebut(e.target.value)} /></div>
                  <div><Label>{t('formations.date_fin')}</Label><Input type="datetime-local" value={formDateFin} onChange={e => setFormDateFin(e.target.value)} /></div>
                  <div className="md:col-span-2"><Label>{t('formations.description')}</Label><Input value={formDescription} onChange={e => setFormDescription(e.target.value)} /></div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button onClick={handleSave}>{t('common.enregistrer')}</Button>
                  <Button variant="outline" onClick={() => setShowForm(false)}>{t('common.annuler')}</Button>
                </div>
              </div>
            )}
            {formations.length === 0 ? (
              <p className="text-surface-400 text-center py-8">{t('formations.aucune')}</p>
            ) : (
              <div className="space-y-3">
                {formations.map(f => (
                  <div key={f._id} className="flex items-center justify-between p-3 rounded-xl bg-surface-50 border border-surface-200">
                    <div>
                      <p className="font-medium text-surface-900">{f.titre}</p>
                      <p className="text-xs text-surface-500">{f.formateur && `${t('formations.formateur')}: ${f.formateur}`}{f.dateDebut && ` | ${new Date(f.dateDebut).toLocaleDateString('fr-TN')}`}</p>
                    </div>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" onClick={() => openEditForm(f)}><Pencil className="w-4 h-4" /></Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDelete(f._id)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-surface-900">{t('dashboard.entretiens_recents')}</CardTitle>
          </CardHeader>
          <CardContent>
            {entretiens.length === 0 ? (
              <p className="text-surface-400 text-center py-8">{t('president.aucun_entretien')}</p>
            ) : (
              <div className="space-y-3">
                {entretiens.slice(0, 10).map(e => (
                  <div key={e._id} className="flex items-center justify-between p-3 rounded-xl bg-surface-50 border border-surface-200">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold text-xs">
                        {(e.membre?.prenom?.[0] || "").toUpperCase()}{(e.membre?.nom?.[0] || "").toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-surface-900 text-sm">{e.membre?.prenom} {e.membre?.nom}</p>
                        <p className="text-xs text-surface-500 flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {new Date(e.date).toLocaleDateString('fr-TN')} <Clock className="w-3 h-3 ml-1" /> {new Date(e.date).toLocaleTimeString('fr-TN', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                    <Badge className={"text-xs " + statusBadge(e.status)}>{e.status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardVPFD;
