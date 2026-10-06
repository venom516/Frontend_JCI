import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useI18n } from "../contexts/I18nContext";
import { entretienAPI, membreAPI } from "../api/axios";
import toast from "react-hot-toast";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Skeleton } from "../components/ui/skeleton";
import { Plus, Pencil, Trash2, Calendar, Users, CheckCircle } from "lucide-react";

const EntretiensPage = () => {
  const { t, translateStatus, formatDate, formatDateTime } = useI18n();
  const { user, isPresident } = useAuth();
  const [entretiens, setEntretiens] = useState([]);
  const [membres, setMembres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEntretien, setEditingEntretien] = useState(null);
  const [filter, setFilter] = useState("");
  const [form, setForm] = useState({
    membre: "",
    date: "",
    commentaire: "",
  });
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchData();
  }, [filter]);

  const fetchData = async () => {
    setLoading(true);
    try {
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
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({ membre: "", date: "", commentaire: "" });
    setEditingEntretien(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingEntretien) {
        await entretienAPI.update(editingEntretien._id, form);
        toast.success(t('entretiens.mis_a_jour'));
      } else {
        await entretienAPI.create(form);
        toast.success(t('entretiens.demande_envoyee'));
      }
      resetForm();
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || t('common.erreur'));
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setEditingEntretien(item);
    setForm({
      membre: item.membre._id,
      date: item.date.split("T")[0],
      commentaire: item.commentaire || "",
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('entretiens.supprimer_confirm'))) return;
    try {
      await entretienAPI.delete(id);
      toast.success(t('entretiens.supprime'));
      fetchData();
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
  };

  if (loading) return (
    <div className="p-8 space-y-4">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-4 w-48" />
      <div className="grid gap-4 mt-8">{[1,2,3].map(i => <Skeleton key={i} className="h-24 w-full" />)}</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="p-6 md:p-8 mb-8 animate-in fade-in slide-in-from-bottom-2 duration-300 flex flex-wrap justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{t('entretiens.titre')}</h1>
            <p className="text-muted-foreground">{t('entretiens.sous_titre')}</p>
          </div>
          {!isPresident && (
            <Button onClick={() => setShowForm(true)}>
              <Plus className="w-4 h-4 mr-1.5" />
              {t('entretiens.demander')}
            </Button>
          )}
        </Card>

        {stats && isPresident && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 sm:gap-4 mb-6 animate-in fade-in duration-300">
            <StatBadge label={t('common.total')} value={stats.total} color="primary" />
            <StatBadge label={t('entretiens.demandes')} value={stats.demandes} color="info" />
            <StatBadge label={t('entretiens.en_attente')} value={stats.enAttente} color="warning" />
            <StatBadge label={t('entretiens.approuves')} value={stats.approuves} color="success" />
            <StatBadge label={t('entretiens.realises')} value={stats.realises} color="info" />
            <StatBadge label={t('entretiens.annule')} value={stats.annules} color="danger" />
          </div>
        )}

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

        <Dialog open={showForm} onOpenChange={(open) => { if (!open) resetForm(); }}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingEntretien ? t('entretiens.modifier') : t('entretiens.demander')}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                {isPresident && (
                  <div>
                    <Label>{t('entretiens.membre')} *</Label>
                    <input type="hidden" value={form.membre} required />
                    <Select value={form.membre} onValueChange={(val) => setForm({ ...form, membre: val })}>
                      <SelectTrigger className="mt-1.5">
                        <SelectValue placeholder={t('entretiens.selectionner_membre')} />
                      </SelectTrigger>
                      <SelectContent>
                        {membres.map((m) => (
                          <SelectItem key={m._id} value={m._id}>
                            {m.prenom + " " + m.nom + " (" + m.email + ")"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div>
                  <Label>{t('entretiens.date')} *</Label>
                  <Input type="datetime-local" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required className="mt-1.5" />
                </div>
                <div>
                  <Label>{t('entretiens.commentaire')}</Label>
                  <Textarea rows="3" className="mt-1.5 resize-none" value={form.commentaire} onChange={(e) => setForm({ ...form, commentaire: e.target.value })} placeholder={t('entretiens.motif')} />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <Button type="button" variant="ghost" onClick={resetForm}>{t('common.annuler')}</Button>
                <Button type="submit" disabled={loading}>
                  {loading ? t('common.chargement') : t('common.enregistrer')}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        <div className="grid gap-4 animate-in fade-in duration-300">
          {entretiens.length === 0 ? (
            <Card className="p-8 text-center text-muted-foreground">{t('entretiens.aucun')}</Card>
          ) : (
            entretiens.map((item) => (
              <Card key={item._id} className="hover:shadow-md transition-shadow p-6">
                <div className="flex flex-wrap justify-between items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="w-9 h-9 rounded-xl bg-primary-100 flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-primary-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground">
                        {item.membre?.prenom + " " + item.membre?.nom}
                      </h3>
                      <Badge className={getStatusBadgeClass(item.status) + " text-xs"}>
                        {translateStatus(item.status)}
                      </Badge>
                      {item.isApprove && (
                        <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 text-xs">
                          {t('entretiens.confirme')}
                        </Badge>
                      )}
                    </div>
                    {item.commentaire && <p className="text-muted-foreground mt-2 text-sm">{item.commentaire}</p>}
                    <div className="flex flex-wrap gap-4 mt-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDateTime(item.date)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        {t('entretiens.cree_par') + ": " + item.createdBy?.prenom + " " + item.createdBy?.nom}
                      </span>
                      {item.note !== undefined && item.note !== null && (
                        <span className="font-semibold text-primary-600">{t('entretiens.note') + ": " + item.note + "/20"}</span>
                      )}
                    </div>
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
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const StatBadge = ({ label, value, color }) => {
  const colorClasses = {
    primary: "bg-primary-100 text-primary-800",
    success: "bg-emerald-100 text-emerald-800",
    warning: "bg-amber-100 text-amber-800",
    info: "bg-cyan-100 text-cyan-800",
    danger: "bg-red-100 text-red-800",
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
