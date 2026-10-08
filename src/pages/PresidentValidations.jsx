import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useI18n } from "../contexts/I18nContext";
import { membreAPI, entretienAPI } from "../api/axios";
import toast from "react-hot-toast";
import { Card, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Skeleton } from "../components/ui/skeleton";
<<<<<<< HEAD
import { useAutoRefresh } from "../hooks/useAutoRefresh";
import { CheckSquare, Calendar, MapPin, Trash2, CheckCircle, UserCheck } from "lucide-react";
=======
import { CheckCircle, Calendar, Clock, MapPin, Trash2, Pencil, CheckSquare, XCircle, UserX } from "lucide-react";
>>>>>>> 47883136c2fca296e3dcd5a33f1106ec0316b78a

// Une personne reste sur cette page tant qu'aucun entretien
// n'a été planifié pour elle : dès l'enregistrement de l'entretien,
// elle quitte cette liste et apparaît dans l'interface Entretien.
const PresidentValidations = () => {
  const { t, formatDate } = useI18n();
  const [searchParams] = useSearchParams();
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [planningId, setPlanningId] = useState(null);
  const [plan, setPlan] = useState({ date: "", dateFin: "", lieu: "", commentaire: "" });

  const fetchPending = async (quiet = false) => {
    if (!quiet) setLoading(true);
    try {
      const [membresRes, entretiensRes] = await Promise.all([
        membreAPI.getAll({ status: "en-attente,non-validé" }),
        entretienAPI
          .getAll({ status: "planifié,en-cours,terminé", limit: 500 })
          .catch(() => ({ data: { data: [] } })),
      ]);

      const avecEntretien = new Set(
        (entretiensRes.data?.data || [])
          .map((e) => e.membre?._id || e.membre)
          .filter(Boolean)
      );

      setPending(
        (membresRes.data.data || []).filter(
          (m) => m.isEmailVerified && !avecEntretien.has(m._id)
        )
      );
    } catch {
      toast.error(t("validations.erreur_chargement"));
    } finally {
      if (!quiet) setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

<<<<<<< HEAD
  useAutoRefresh(() => fetchPending(true));

  // Ouverture directe du formulaire via le lien reçu par email
  useEffect(() => {
    if (loading) return;
    const membreId = searchParams.get("membreId");
    if (membreId && pending.some((m) => m._id === membreId) && planningId !== membreId) {
      setPlanningId(membreId);
      setPlan({ date: "", dateFin: "", lieu: "", commentaire: "" });
    }
  }, [loading, pending, planningId]);

  const ouvrirPlanification = (id) => {
    setPlanningId(planningId === id ? null : id);
    setPlan({ date: "", dateFin: "", lieu: "", commentaire: "" });
=======
  const fetchPending = async () => {
    setLoading(true);
    try {
      const res = await membreAPI.getAll({ status: "en-attente,non-validé" });
      setPending(res.data.data || []);
    } catch (error) { toast.error(error.response?.data?.message || error.translatedMessage || t('validations.erreur_chargement')); }
    finally { setLoading(false); }
>>>>>>> 47883136c2fca296e3dcd5a33f1106ec0316b78a
  };

  const enregistrerEntretien = async (membre) => {
    if (!plan.date) {
      toast.error(t("validations.choisir_date"));
      return;
    }
    if (!plan.dateFin) {
      toast.error(t("entretiens.date_fin_obligatoire"));
      return;
    }
    if (new Date(plan.dateFin) <= new Date(plan.date)) {
      toast.error(t("entretiens.fin_apres_debut"));
      return;
    }
    setProcessing(true);
    try {
      await entretienAPI.create({
        membre: membre._id,
        date: plan.date,
        dateFin: plan.dateFin,
        lieu: plan.lieu,
        commentaire: plan.commentaire,
      });
<<<<<<< HEAD
      toast.success(t("president.entretien_cree"));
      setPlanningId(null);
      setPlan({ date: "", dateFin: "", lieu: "", commentaire: "" });
=======
    } catch (error) { toast.error(error.response?.data?.message || error.translatedMessage || t('validations.erreur_chargement')); }
    finally { setLoading(false); }
  };

  const handleAccepter = async (id) => {
    setProcessing(true);
    try {
      await membreAPI.validerInscription(id);
      toast.success(t('validations.acceptee'));
      setSelected(null);
>>>>>>> 47883136c2fca296e3dcd5a33f1106ec0316b78a
      fetchPending();
    } catch (e) {
      toast.error(e.response?.data?.message || t("common.erreur"));
    } finally {
      setProcessing(false);
    }
  };

  // Suppression définitive de l'inscription : la personne peut se réinscrire
  const supprimerInscription = async (membre) => {
    if (!window.confirm(t("entretiens.supprimer_personne_confirm"))) return;
    setProcessing(true);
    try {
      await membreAPI.deletePermanent(membre._id);
      toast.success(t("entretiens.membre_supprime"));
      setPlanningId(null);
      fetchPending();
    } catch (e) {
<<<<<<< HEAD
      toast.error(e.response?.data?.message || t("common.erreur"));
    } finally {
      setProcessing(false);
    }
=======
      toast.error(e.response?.data?.message || t('common.erreur'));
    } finally { setProcessing(false); }
  };

  const handleSupprimer = async (m) => {
    if (!window.confirm(t('validations.confirmer_suppression', { prenom: m.prenom, nom: m.nom }))) return;
    setProcessing(true);
    try {
      await membreAPI.delete(m._id);
      toast.success(t('common.supprime'));
      fetchPending();
    } catch (e) {
      toast.error(e.response?.data?.message || t('common.erreur'));
    } finally { setProcessing(false); }
  };

  const openEditForm = (e) => {
    setEditId(e._id);
    setFormDate(new Date(e.date).toISOString().slice(0, 16));
    setFormMembre(e.membre?._id || "");
    setFormLieu(e.lieu || "");
    setFormCommentaire(e.commentaire || "");
    setFormLien(e.lien || "");
    setFormStatus(e.status || "demandé");
    setShowForm(true);
  };

  const handleSaveEntretien = async () => {
    if (!formDate) { toast.error(t('validations.choisir_date')); return; }
    setFormLoading(true);
    try {
      const payload = { date: formDate, commentaire: formCommentaire, lieu: formLieu, lien: formLien };
      if (editId) {
        await entretienAPI.update(editId, payload);
        if (formStatus === "approuvé") await entretienAPI.approve(editId).catch((err) => { toast.error(err.response?.data?.message || err.translatedMessage || t('common.erreur')); });
        else if (formStatus === "annulé") await entretienAPI.reject(editId).catch((err) => { toast.error(err.response?.data?.message || err.translatedMessage || t('common.erreur')); });
        toast.success(t('president.entretien_modifie'));
      } else {
        await entretienAPI.create({ ...payload, membre: formMembre });
        toast.success(t('president.entretien_cree'));
      }
      setShowForm(false);
      fetchEntretiens();
      fetchPending();
    } catch (e) {
      toast.error(e.response?.data?.message || t('common.erreur'));
    } finally { setFormLoading(false); }
  };

  const handleDeleteEntretien = async (id) => {
    if (!window.confirm(t('president.confirmer_suppression_entretien'))) return;
    setProcessing(true);
    try {
      await entretienAPI.delete(id);
      toast.success(t('president.entretien_supprime'));
      fetchEntretiens();
    } catch (e) {
      toast.error(e.response?.data?.message || t('common.erreur'));
    } finally { setProcessing(false); }
  };

  const handleApprove = async (id) => {
    setProcessing(true);
    try {
      await entretienAPI.approve(id);
      toast.success(t('entretiens.approuve'));
      fetchEntretiens();
      fetchPending();
    } catch (e) {
      toast.error(e.response?.data?.message || t('common.erreur'));
    } finally { setProcessing(false); }
  };

  const handleReject = async (id) => {
    setProcessing(true);
    try {
      await entretienAPI.reject(id);
      toast.success(t('entretiens.rejete'));
      fetchEntretiens();
      fetchPending();
    } catch (e) {
      toast.error(e.response?.data?.message || t('common.erreur'));
    } finally { setProcessing(false); }
  };

  const handleRealise = async (id) => {
    const note = prompt(t('entretiens.note_prompt'));
    if (note === null) return;
    const remarques = prompt(t('entretiens.remarques_prompt'));
    setProcessing(true);
    try {
      await entretienAPI.realise(id, { note: parseFloat(note) || 0, remarques: remarques || "" });
      toast.success(t('entretiens.marque_realise'));
      fetchEntretiens();
    } catch (e) {
      toast.error(e.response?.data?.message || e.translatedMessage || t('common.erreur'));
    } finally { setProcessing(false); }
>>>>>>> 47883136c2fca296e3dcd5a33f1106ec0316b78a
  };

  if (loading) return <Skeleton className="h-96 w-full" />;

<<<<<<< HEAD
=======
  const statusFilters = [
    { key: "", label: t('common.tous') },
    { key: "demandé", label: t('entretiens.demandes') },
    { key: "en-attente", label: t('entretiens.en_attente') },
    { key: "approuvé", label: t('entretiens.approuves') },
    { key: "réalisé", label: t('entretiens.realises') },
    { key: "annulé", label: t('entretiens.annule') },
  ];

  const formatDateDisplay = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('fr-TN', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const formatTimeDisplay = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('fr-TN', { hour: '2-digit', minute: '2-digit' });
  };

  const statusBadge = (status) => {
    const classes = {
      "demandé": "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200",
      "en-attente": "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200",
      "approuvé": "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200",
      "réalisé": "bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-200",
      "annulé": "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200",
    };
    return classes[status] || "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
  };

>>>>>>> 47883136c2fca296e3dcd5a33f1106ec0316b78a
  return (
    <div className="min-h-screen bg-surface-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-primary-100 flex items-center justify-center text-primary-600">
                <CheckSquare className="w-6 h-6" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-surface-900">Validation</CardTitle>
                <p className="text-sm text-surface-500">{t("entretiens.a_planifier")} : {pending.length}</p>
              </div>
            </div>
          </CardHeader>
        </Card>

        {pending.length === 0 ? (
          <Card className="p-12 text-center">
            <CheckCircle className="w-16 h-16 mx-auto text-surface-300 mb-4" />
            <p className="text-surface-400 text-lg">{t("president.aucune_validation")}</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {pending.map((m) => (
              <Card key={m._id} className="p-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-14 h-14 rounded-2xl bg-primary-100 flex items-center justify-center text-primary-700 font-semibold overflow-hidden shrink-0">
                      {m.photo ? (
                        <img src={m.photo} alt={m.prenom} className="w-full h-full object-cover" />
                      ) : (
                        (m.prenom?.[0] || "").toUpperCase() + (m.nom?.[0] || "").toUpperCase()
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-surface-900">{m.prenom} {m.nom}</h3>
                      <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-surface-500">
                        <span className="truncate">{m.email}</span>
                        <Badge className="bg-amber-100 text-amber-800">{t("entretiens.a_planifier")}</Badge>
                      </div>
                      <p className="text-xs text-surface-400 mt-1">
                        {t("dashboard.date_inscription")} : {formatDate(m.createdAt)}
                      </p>
                    </div>
                  </div>

<<<<<<< HEAD
                  {planningId !== m._id && (
                    <div className="flex flex-wrap gap-2 shrink-0">
                      <Button size="sm" variant="outline" onClick={() => ouvrirPlanification(m._id)} disabled={processing}>
                        <Calendar className="w-3.5 h-3.5 mr-1" /> {t("president.planifier_entretien")}
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => supprimerInscription(m)} disabled={processing}>
                        <Trash2 className="w-3.5 h-3.5 mr-1" /> {t("common.supprimer")}
                      </Button>
=======
        {tab === "entretiens" && (
          <>
            {stats && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 mb-6">
                <StatBadge label={t('common.total')} value={stats.total} color="primary" />
                <StatBadge label={t('entretiens.demandes')} value={stats.demandes} color="warning" />
                <StatBadge label={t('entretiens.en_attente')} value={stats.enAttente} color="info" />
                <StatBadge label={t('entretiens.approuves')} value={stats.approuves} color="success" />
                <StatBadge label={t('entretiens.realises')} value={stats.realises} color="info" />
                <StatBadge label={t('entretiens.annule')} value={stats.annules} color="danger" />
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="flex flex-wrap gap-2">
                {statusFilters.map((f) => (
                  <Button key={f.key} size="sm" variant={filterStatus === f.key ? "default" : "ghost"} onClick={() => { setFilterStatus(f.key); }}>
                    {f.label}
                  </Button>
                ))}
              </div>
            </div>

            {showForm && (
              <Card className="p-5 mb-4">
                <h3 className="font-semibold text-surface-900 mb-4">
                  {editId ? t('president.modifier_entretien') : t('president.ajouter_entretien')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <Label>{t('president.membre_label')}</Label>
                    <Select value={formMembre} onValueChange={setFormMembre} disabled={!!editId}>
                      <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                      <SelectContent>
                        {membres.map((m) => (
                          <SelectItem key={m._id} value={m._id}>{m.prenom} {m.nom}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {formMembre && !editId && (
                      <div className="text-xs text-surface-500 mt-1">
                        {(() => { const m = membres.find(m => m._id === formMembre); return m ? `${m.email}${m.telephone ? ` | ${m.telephone}` : ""}` : ""; })()}
                      </div>
                    )}
                  </div>
                  <div>
                    <Label>{t('president.date_entretien')} *</Label>
                    <Input type="datetime-local" value={formDate} onChange={(e) => setFormDate(e.target.value)} />
                  </div>
                  <div>
                    <Label>{t('entretiens.lieu')}</Label>
                    <Input type="text" value={formLieu} onChange={(e) => setFormLieu(e.target.value)} placeholder={t('entretiens.lieu_placeholder')} />
                  </div>
                  <div>
                    <Label>{t('president.commentaire')}</Label>
                    <Input type="text" value={formCommentaire} onChange={(e) => setFormCommentaire(e.target.value)} placeholder={t('president.commentaire_placeholder')} />
                  </div>
                  <div>
                    <Label>Lien (URL)</Label>
                    <Input type="url" value={formLien} onChange={(e) => setFormLien(e.target.value)} placeholder="https://meet.google.com/..." />
                  </div>
                  {editId && (
                    <div>
                      <Label>{t('president.decision_titre')}</Label>
                      <Select value={formStatus} onValueChange={setFormStatus}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="demandé">⏳ {t('president.entretiens_titre')}</SelectItem>
                          <SelectItem value="approuvé">✅ {t('president.accepter_membre')}</SelectItem>
                          <SelectItem value="annulé">❌ {t('president.refuser_membre')}</SelectItem>
                        </SelectContent>
                      </Select>
>>>>>>> 47883136c2fca296e3dcd5a33f1106ec0316b78a
                    </div>
                  )}
                </div>

                {planningId === m._id && (
                  <div className="mt-4 pt-4 border-t border-surface-100">
                    <p className="text-sm font-semibold text-surface-700 mb-3 flex items-center gap-2">
                      <UserCheck className="w-4 h-4" />
                      {t("validations.planifier_entretien_membre")}
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">{t("common.date_debut")} *</Label>
                        <Input type="datetime-local" value={plan.date} onChange={(e) => setPlan({ ...plan, date: e.target.value })} />
                      </div>
                      <div>
                        <Label className="text-xs">{t("common.date_fin")} *</Label>
                        <Input type="datetime-local" value={plan.dateFin} onChange={(e) => setPlan({ ...plan, dateFin: e.target.value })} />
                      </div>
                      <div>
                        <Label className="text-xs">{t("entretiens.lieu")}</Label>
                        <Input value={plan.lieu} onChange={(e) => setPlan({ ...plan, lieu: e.target.value })} placeholder="—" />
                      </div>
                      <div>
                        <Label className="text-xs">{t("entretiens.commentaire")}</Label>
                        <Input value={plan.commentaire} onChange={(e) => setPlan({ ...plan, commentaire: e.target.value })} placeholder="—" />
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <Button size="sm" onClick={() => enregistrerEntretien(m)} disabled={processing}>
                        <CheckCircle className="w-3.5 h-3.5 mr-1" /> {t("president.ajouter_entretien")}
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setPlanningId(null)} disabled={processing}>
                        {t("common.annuler")}
                      </Button>
                    </div>
                    <p className="text-xs text-surface-400 mt-2 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {t("entretiens.sous_titre")}
                    </p>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PresidentValidations;
