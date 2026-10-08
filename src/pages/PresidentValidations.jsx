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
import { useAutoRefresh } from "../hooks/useAutoRefresh";
import { CheckSquare, Calendar, MapPin, Trash2, CheckCircle, UserCheck } from "lucide-react";

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
      toast.success(t("president.entretien_cree"));
      setPlanningId(null);
      setPlan({ date: "", dateFin: "", lieu: "", commentaire: "" });
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
      toast.error(e.response?.data?.message || t("common.erreur"));
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <Skeleton className="h-96 w-full" />;

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

                  {planningId !== m._id && (
                    <div className="flex flex-wrap gap-2 shrink-0">
                      <Button size="sm" variant="outline" onClick={() => ouvrirPlanification(m._id)} disabled={processing}>
                        <Calendar className="w-3.5 h-3.5 mr-1" /> {t("president.planifier_entretien")}
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => supprimerInscription(m)} disabled={processing}>
                        <Trash2 className="w-3.5 h-3.5 mr-1" /> {t("common.supprimer")}
                      </Button>
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
