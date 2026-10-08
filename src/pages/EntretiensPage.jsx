import React, { useState, useEffect, useMemo } from "react";
import { useI18n } from "../contexts/I18nContext";
import { entretienAPI, membreAPI } from "../api/axios";
import toast from "react-hot-toast";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Card } from "../components/ui/card";
import { StatusBadge } from "../components/common/StatusBadge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import { Skeleton } from "../components/ui/skeleton";
import { useAutoRefresh } from "../hooks/useAutoRefresh";
import { Pencil, Trash2, Calendar, Users, CheckCircle, MapPin, Eye, XCircle, Flag } from "lucide-react";

// Le statut de l'entretien découle de son calendrier :
//   planifié -> en cours (date de début atteinte) -> terminé (date de fin dépassée)
// Les boutons proposals dépendent de la phase ; l'acceptation et le refus
// ne deviennent possibles qu'une fois l'entretien terminé.
const EntretiensPage = () => {
  const { t, formatDateTime } = useI18n();
  const [entretiens, setEntretiens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [filter, setFilter] = useState("");
  const [showView, setShowView] = useState(false);
const [confirmAction, setConfirmAction] = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ date: "", dateFin: "", lieu: "", commentaire: "" });

  // Une seule requête alimente la liste, les groupes et les compteurs :
  // les chiffres affichés ne peuvent plus diverger des éléments listés.
  const fetchData = async (quiet = false) => {
    if (!quiet) setLoading(true);
    try {
      const res = await entretienAPI.getAll({ limit: 500 });
      setEntretiens(res.data.data || []);
    } catch {
      toast.error(t("entretiens.erreur_chargement"));
    } finally {
      if (!quiet) setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useAutoRefresh(() => fetchData(true));

  const GROUPES = [
    { key: "planifié", label: t("entretiens.planifies"), color: "info" },
    { key: "en-cours", label: t("entretiens.en_cours"), color: "warning" },
    { key: "terminé", label: t("entretiens.termines"), color: "default" },
    { key: "accepté", label: t("entretiens.acceptes"), color: "success" },
    { key: "rejeté", label: t("entretiens.rejetes"), color: "danger" },
  ];

  const stats = useMemo(() => {
    const parStatut = (s) => entretiens.filter((e) => e.status === s).length;
    return {
      total: entretiens.length,
      planifies: parStatut("planifié"),
      enCours: parStatut("en-cours"),
      termines: parStatut("terminé"),
      acceptes: parStatut("accepté"),
      rejetes: parStatut("rejeté"),
    };
  }, [entretiens]);

  const visible = filter ? entretiens.filter((e) => e.status === filter) : entretiens;

  const grouped = GROUPES.map((g) => ({
    ...g,
    items: visible.filter((e) => e.status === g.key),
  })).filter((s) => s.items.length > 0);

  // Clôture anticipée de l'entretien pendant sa fenêtre de réalisation
  const handleTerminer = async (id) => {
    setProcessing(true);
    try {
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 82d4b6f6dc74b5b05e36ebbdc5395ed46ed114c9
      await entretienAPI.terminer(id);
      toast.success(t("entretiens.termine_action"));
      fetchData();
    } catch (e) {
      toast.error(e.response?.data?.message || t("common.erreur"));
<<<<<<< HEAD
=======
=======
      const [entretiensRes, membresRes] = await Promise.all([
        entretienAPI.getAll({ status: filter }),
        isPresident ? membreAPI.getAll() : Promise.resolve({ data: { data: [] } }),
      ]);
      setEntretiens(entretiensRes.data.data || []);
      if (isPresident) setMembres(membresRes.data.data || []);
      
      const all = await entretienAPI.getAll();
      const data = all.data.data || [];
      setStats({
        total: data.length,
        demandes: data.filter(e => e.status === "demandé").length,
        enAttente: data.filter(e => e.status === "en-attente").length,
        approuves: data.filter(e => e.status === "approuvé").length,
        realises: data.filter(e => e.status === "réalisé").length,
        annules: data.filter(e => e.status === "annulé").length,
      });
    } catch (error) {
      toast.error(error.response?.data?.message || error.translatedMessage || t('entretiens.erreur_chargement'));
>>>>>>> 47883136c2fca296e3dcd5a33f1106ec0316b78a
>>>>>>> 82d4b6f6dc74b5b05e36ebbdc5395ed46ed114c9
    } finally {
      setProcessing(false);
    }
  };

  // L'acceptation transforme la personne en membre actif. Elle passe par le
  // modal de confirmation comme le refus.
  const handleAccepter = async (id) => {
    setConfirmAction({ type: "accepter", id });
  };

  // Le refus est définitif : le compte passe "banni" (connexion bloquée,
  // plus de réinscription). Le modal affiche cet avertissement avant l'envoi.
  const handleRefuser = async (id) => {
    setConfirmAction({ type: "rejeter", id });
  };

  // Exécution après validation dans le modal
  const executeConfirmAction = async () => {
    if (!confirmAction) return;
    const { type, id } = confirmAction;
    setConfirmAction(null);
    setProcessing(true);
    try {
      if (type === "accepter") {
        await entretienAPI.approve(id);
        toast.success(t("validations.succes_accepte"));
      } else {
        await entretienAPI.reject(id);
        toast.success(t("entretiens.rejete"));
      }
      fetchData();
    } catch (e) {
      toast.error(e.response?.data?.message || t("common.erreur"));
    } finally {
      setProcessing(false);
    }
  };

  // Suppression définitive du membre et de tous ses entretiens (Président)
  const handleSupprimerMembre = async (membre) => {
    if (!window.confirm(t("entretiens.supprimer_membre_confirm"))) return;
    setProcessing(true);
    try {
      await membreAPI.deletePermanent(membre._id);
      toast.success(t("entretiens.membre_supprime"));
      fetchData();
    } catch (e) {
      toast.error(e.response?.data?.message || t("common.erreur"));
    } finally {
      setProcessing(false);
    }
  };

  const resetForm = () => {
    setForm({ date: "", dateFin: "", lieu: "", commentaire: "" });
    setEditing(null);
    setShowForm(false);
  };

  const handleEdit = (item) => {
    setEditing(item);
    setForm({
      date: new Date(item.date).toISOString().slice(0, 16),
      dateFin: item.dateFin ? new Date(item.dateFin).toISOString().slice(0, 16) : "",
      lieu: item.lieu || "",
      commentaire: item.commentaire || "",
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editing) return;
    if (!form.date) { toast.error(t("validations.choisir_date")); return; }
    if (!form.dateFin) { toast.error(t("entretiens.date_fin_obligatoire")); return; }
    if (new Date(form.dateFin) <= new Date(form.date)) {
      toast.error(t("entretiens.fin_apres_debut"));
      return;
    }
    setLoading(true);
    try {
      await entretienAPI.update(editing._id, form);
      toast.success(t("entretiens.mis_a_jour"));
      resetForm();
      fetchData();
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 82d4b6f6dc74b5b05e36ebbdc5395ed46ed114c9
    } catch (err) {
      toast.error(err.response?.data?.message || t("common.erreur"));
    } finally {
      setLoading(false);
<<<<<<< HEAD
    }
  };

  // Les droits affichés dépendent exclusivement de la phase de l'entretien
  const actions = (item) => {
    if (item.status === "planifié") {
      return (
        <>
          <Button size="sm" variant="outline" disabled={processing} onClick={() => handleEdit(item)}>
            <Pencil className="w-3.5 h-3.5 mr-1.5" />
            {t("entretiens.modifier")}
          </Button>
          <Button size="sm" variant="destructive" disabled={processing} onClick={() => handleSupprimerMembre(item.membre)}>
            <Trash2 className="w-3.5 h-3.5 mr-1.5" />
            {t("common.supprimer")}
          </Button>
        </>
      );
    }
    if (item.status === "en-cours") {
      return (
        <Button size="sm" disabled={processing} onClick={() => handleTerminer(item._id)}>
          <Flag className="w-3.5 h-3.5 mr-1.5" />
          {t("entretiens.terminer")}
        </Button>
      );
    }
    if (item.status === "terminé") {
      return (
        <>
          <Button size="sm" className="bg-emerald-600 text-white hover:bg-emerald-700" disabled={processing} onClick={() => handleAccepter(item._id)}>
            <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
            {t("entretiens.accepter")}
          </Button>
          <Button size="sm" variant="destructive" disabled={processing} onClick={() => handleRefuser(item._id)}>
            <XCircle className="w-3.5 h-3.5 mr-1.5" />
            {t("entretiens.rejeter")}
          </Button>
        </>
      );
    }
    return null;
=======
    }
  };

  // Les droits affichés dépendent exclusivement de la phase de l'entretien
  const actions = (item) => {
    if (item.status === "planifié") {
      return (
        <>
          <Button size="sm" variant="outline" disabled={processing} onClick={() => handleEdit(item)}>
            <Pencil className="w-3.5 h-3.5 mr-1.5" />
            {t("entretiens.modifier")}
          </Button>
          <Button size="sm" variant="destructive" disabled={processing} onClick={() => handleSupprimerMembre(item.membre)}>
            <Trash2 className="w-3.5 h-3.5 mr-1.5" />
            {t("common.supprimer")}
          </Button>
        </>
      );
    }
    if (item.status === "en-cours") {
      return (
        <Button size="sm" disabled={processing} onClick={() => handleTerminer(item._id)}>
          <Flag className="w-3.5 h-3.5 mr-1.5" />
          {t("entretiens.terminer")}
        </Button>
      );
    }
    if (item.status === "terminé") {
      return (
        <>
          <Button size="sm" className="bg-emerald-600 text-white hover:bg-emerald-700" disabled={processing} onClick={() => handleAccepter(item._id)}>
            <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
            {t("entretiens.accepter")}
          </Button>
          <Button size="sm" variant="destructive" disabled={processing} onClick={() => handleRefuser(item._id)}>
            <XCircle className="w-3.5 h-3.5 mr-1.5" />
            {t("entretiens.rejeter")}
          </Button>
        </>
      );
    }
    return null;
=======
    } catch (error) {
      toast.error(error.response?.data?.message || error.translatedMessage || t('common.erreur'));
    }
  };

  const handleApprove = async (id) => {
    try {
      await entretienAPI.approve(id);
      toast.success(t('entretiens.approuve'));
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || error.translatedMessage || t('common.erreur'));
    }
  };

  const handleReject = async (id) => {
    try {
      await entretienAPI.reject(id);
      toast.success(t('entretiens.rejete'));
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || error.translatedMessage || t('common.erreur'));
    }
  };

  const handleRealise = async (id) => {
    const note = prompt(t('entretiens.note_prompt'));
    if (note === null) return;
    const remarques = prompt(t('entretiens.remarques_prompt'));
    try {
      await entretienAPI.realise(id, { 
        note: parseFloat(note) || 0, 
        remarques: remarques || "" 
      });
      toast.success(t('entretiens.marque_realise'));
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || error.translatedMessage || t('common.erreur'));
    }
  };

  const getStatusBadgeClass = (status) => {
    const classes = {
      "demandé": "bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-200",
      "en-attente": "bg-amber-100 text-amber-800 hover:bg-amber-100 dark:bg-amber-950 dark:text-amber-200",
      "approuvé": "bg-emerald-100 text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-200",
      "réalisé": "bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-200",
      "annulé": "bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-950 dark:text-red-200",
    };
    return classes[status] || "";
>>>>>>> 47883136c2fca296e3dcd5a33f1106ec0316b78a
>>>>>>> 82d4b6f6dc74b5b05e36ebbdc5395ed46ed114c9
  };

  if (loading) return (
    <div className="p-8 space-y-4">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-4 w-48" />
      <div className="grid gap-4 mt-8">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 w-full" />)}</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="p-6 md:p-8 mb-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <h1 className="text-3xl font-bold text-foreground">{t("entretiens.titre")}</h1>
          <p className="text-muted-foreground">{t("entretiens.sous_titre")}</p>
        </Card>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 sm:gap-4 mb-6 animate-in fade-in duration-300">
          <StatBadge label={t("common.total")} value={stats.total} color="primary" />
          <StatBadge label={t("entretiens.planifies")} value={stats.planifies} color="info" />
          <StatBadge label={t("entretiens.en_cours")} value={stats.enCours} color="warning" />
          <StatBadge label={t("entretiens.termines")} value={stats.termines} color="default" />
          <StatBadge label={t("entretiens.acceptes")} value={stats.acceptes} color="success" />
          <StatBadge label={t("entretiens.rejetes")} value={stats.rejetes} color="danger" />
        </div>

<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 82d4b6f6dc74b5b05e36ebbdc5395ed46ed114c9
        <Card className="p-4 mb-8 flex flex-wrap gap-2 animate-in fade-in duration-300">
          <Button size="sm" variant={filter === "" ? "default" : "ghost"} onClick={() => setFilter("")}>{t("common.tous")}</Button>
          {GROUPES.map((g) => (
            <Button key={g.key} size="sm" variant={filter === g.key ? "default" : "ghost"} onClick={() => setFilter(g.key)}>
              {g.label}
            </Button>
          ))}
        </Card>
<<<<<<< HEAD
=======
=======
        {isPresident && (
          <Card className="p-4 mb-8 flex flex-wrap gap-2 animate-in fade-in duration-300">
            <Button size="sm" variant={filter === "" ? "default" : "ghost"} onClick={() => setFilter("")}>{t('common.tous')}</Button>
            <Button size="sm" variant={filter === "demandé" ? "default" : "ghost"} onClick={() => setFilter("demandé")}>{t('entretiens.demandes')}</Button>
            <Button size="sm" variant={filter === "en-attente" ? "default" : "ghost"} onClick={() => setFilter("en-attente")}>{t('entretiens.en_attente')}</Button>
            <Button size="sm" variant={filter === "approuvé" ? "default" : "ghost"} onClick={() => setFilter("approuvé")}>{t('entretiens.confirme')}</Button>
            <Button size="sm" variant={filter === "réalisé" ? "default" : "ghost"} onClick={() => setFilter("réalisé")}>{t('entretiens.realises')}</Button>
            <Button size="sm" variant={filter === "annulé" ? "default" : "ghost"} onClick={() => setFilter("annulé")}>{t('entretiens.annule')}</Button>
          </Card>
        )}
>>>>>>> 47883136c2fca296e3dcd5a33f1106ec0316b78a
>>>>>>> 82d4b6f6dc74b5b05e36ebbdc5395ed46ed114c9

        <Dialog open={showForm} onOpenChange={(open) => { if (!open) resetForm(); }}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{t("entretiens.modifier")}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                {editing?.membre && (
                  <div>
                    <Label>{t("entretiens.membre")}</Label>
                    <p className="mt-1.5 font-medium">{editing.membre.prenom} {editing.membre.nom}</p>
                  </div>
                )}
                <div>
                  <Label>{t("common.date_debut")} *</Label>
                  <Input type="datetime-local" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required className="mt-1.5" />
                </div>
                <div>
                  <Label>{t("common.date_fin")} *</Label>
                  <Input type="datetime-local" value={form.dateFin} onChange={(e) => setForm({ ...form, dateFin: e.target.value })} required className="mt-1.5" />
                </div>
                <div>
                  <Label>{t("entretiens.lieu")}</Label>
                  <Input type="text" value={form.lieu} onChange={(e) => setForm({ ...form, lieu: e.target.value })} placeholder={t("entretiens.lieu_placeholder")} className="mt-1.5" />
                </div>
                <div>
                  <Label>{t("entretiens.commentaire")}</Label>
                  <Textarea rows="3" className="mt-1.5 resize-none" value={form.commentaire} onChange={(e) => setForm({ ...form, commentaire: e.target.value })} placeholder={t("entretiens.motif")} />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <Button type="button" variant="ghost" onClick={resetForm}>{t("common.annuler")}</Button>
                <Button type="submit" disabled={loading}>
                  {loading ? t("common.chargement") : t("common.enregistrer")}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={showView} onOpenChange={setShowView}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{t("common.voir")}</DialogTitle>
            </DialogHeader>
            {selected && (
              <div className="space-y-5 text-sm">
                <div>
                  <h4 className="font-semibold mb-2 text-muted-foreground">{t("entretiens.info_membre")}</h4>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">{t("entretiens.membre")}</span>
                      <span className="font-medium">{selected.membre?.prenom} {selected.membre?.nom}</span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-muted-foreground">{t("members.email")}</span>
                      <span className="font-medium truncate">{selected.membre?.email}</span>
<<<<<<< HEAD
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">{t("admin.statut")}</span>
                      <StatusBadge status={selected.membre?.status} module="membre" />
                    </div>
=======
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">{t("admin.statut")}</span>
                      <StatusBadge status={selected.membre?.status} module="membre" />
                    </div>
<<<<<<< HEAD
=======
                    {item.remarques && <p className="text-sm text-muted-foreground mt-1">{item.remarques}</p>}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {isPresident && (
                      <>
                        {item.status === "demandé" || item.status === "en-attente" ? (
                          <>
                            <Button size="sm" className="bg-emerald-600 text-white hover:bg-emerald-700" onClick={() => handleApprove(item._id)}>{t('entretiens.confirmer')}</Button>
                            <Button size="sm" variant="destructive" onClick={() => handleReject(item._id)}>{t('entretiens.rejeter')}</Button>
                          </>
                        ) : item.status === "approuvé" ? (
                          <Button size="sm" variant="outline" onClick={() => handleRealise(item._id)}>{t('entretiens.marquer_realise')}</Button>
                        ) : null}
                        <Button size="sm" variant="outline" onClick={() => handleEdit(item)}>
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(item._id)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </>
                    )}
                    {!isPresident && item.membre?._id === user?._id && item.status === "demandé" && (
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(item._id)}>{t('entretiens.annule')}</Button>
                    )}
>>>>>>> 47883136c2fca296e3dcd5a33f1106ec0316b78a
>>>>>>> 82d4b6f6dc74b5b05e36ebbdc5395ed46ed114c9
                  </div>
                </div>
                <div className="border-t border-border pt-4">
                  <h4 className="font-semibold mb-2 text-muted-foreground">{t("entretiens.info_entretien")}</h4>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">{t("entretiens.statut")}</span>
                      <StatusBadge status={selected.status} module="entretien" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">{t("common.date_debut")}</span>
                      <span className="font-medium">{formatDateTime(selected.date)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">{t("common.date_fin")}</span>
                      <span className="font-medium">
                        {selected.dateFin ? formatDateTime(selected.dateFin) : t("common.non_renseigne")}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-muted-foreground">{t("entretiens.lieu")}</span>
                      <span className="font-medium truncate">{selected.lieu || t("common.non_renseigne")}</span>
                    </div>
                    <div className="flex items-start justify-between gap-4">
                      <span className="text-muted-foreground shrink-0">{t("entretiens.commentaire")}</span>
                      <span className="font-medium text-right">{selected.commentaire || t("common.non_renseigne")}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        <div className="space-y-8 animate-in fade-in duration-300">
          {grouped.length === 0 ? (
            <Card className="p-8 text-center text-muted-foreground">{t("entretiens.aucun")}</Card>
          ) : (
            grouped.map((section) => (
              <div key={section.key} className="space-y-4">
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-semibold text-foreground">{section.label}</h2>
                  <Badge variant="outline" className="text-xs">{section.items.length}</Badge>
                  <span className="flex-1 h-px bg-border" />
                </div>
                <div className="grid gap-4">
                  {section.items.map((item) => (
                    <Card key={item._id} className="hover:shadow-md transition-shadow p-6">
                      <div className="flex flex-wrap justify-between items-start gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 flex-wrap">
                            <div className="w-9 h-9 rounded-xl bg-primary-100 flex items-center justify-center">
                              <CheckCircle className="w-5 h-5 text-primary-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-foreground">
                              {item.membre?.prenom} {item.membre?.nom || "—"}
                            </h3>
                            <StatusBadge status={item.status} module="entretien" />
                          </div>
                          <div className="flex flex-wrap gap-4 mt-3 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              {formatDateTime(item.date)}
                            </span>
                            {item.dateFin && (
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5" />
                                {formatDateTime(item.dateFin)}
                              </span>
                            )}
                            {item.lieu && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5" />
                                {item.lieu}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Users className="w-3.5 h-3.5" />
                              {t("entretiens.cree_par") + ": " + item.createdBy?.prenom + " " + item.createdBy?.nom}
                            </span>
                          </div>
                          {item.commentaire && <p className="text-muted-foreground mt-2 text-sm">{item.commentaire}</p>}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Button size="sm" variant="outline" disabled={processing} onClick={() => { setSelected(item); setShowView(true); }}>
                            <Eye className="w-3.5 h-3.5 mr-1.5" />
                            {t("common.voir")}
                          </Button>
                          {actions(item)}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Confirmation avant acceptation ou refus. Le refus est irréversible :
          le compte est banni définitivement, il ne peut plus se reconnect ni
          se réinscrire. On l'annonce explicitement pour éviter la confusion
          avec une simple décision d'entretien. */}
      <Dialog open={!!confirmAction} onOpenChange={(open) => !open && setConfirmAction(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {confirmAction?.type === "rejeter" ? (
                <>
                  <XCircle className="w-5 h-5 text-red-600" />
                  {t("entretiens.confirmer_refus_titre")}
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                  {t("entretiens.confirmer_acceptation_titre")}
                </>
              )}
            </DialogTitle>
            {confirmAction?.type === "rejeter" && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 space-y-1.5">
                <p className="text-sm text-red-800">{t("entretiens.rejeter_confirm")}</p>
              </div>
            )}
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setConfirmAction(null)} disabled={processing}>
              {t("entretiens.annuler")}
            </Button>
            <Button
              variant={confirmAction?.type === "rejeter" ? "destructive" : "default"}
              onClick={executeConfirmAction}
              disabled={processing}
            >
              {processing ? "..." : t("entretiens.confirmer")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const StatBadge = ({ label, value, color }) => {
  const colorClasses = {
    primary: "bg-primary-100 text-primary-800",
    success: "bg-emerald-100 text-emerald-800",
    warning: "bg-amber-100 text-amber-800",
    info: "bg-blue-100 text-blue-800",
    danger: "bg-rose-100 text-rose-800",
    default: "bg-muted text-foreground",
  };
  return (
    <Card className={"text-center hover:-translate-y-0.5 transition-all duration-300 p-4 " + (colorClasses[color] || colorClasses.default)}>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </Card>
  );
};

export default EntretiensPage;
