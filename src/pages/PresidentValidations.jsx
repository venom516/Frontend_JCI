import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useI18n } from "../contexts/I18nContext";
import { membreAPI, entretienAPI } from "../api/axios";
import toast from "react-hot-toast";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "../components/ui/select";
import { Skeleton } from "../components/ui/skeleton";
import { CheckCircle, Calendar, Clock, MapPin, Trash2, Pencil, CheckSquare, XCircle, Plus } from "lucide-react";

const StatBadge = ({ label, value, color }) => {
  const colors = {
    primary: "bg-primary-100 text-primary-800",
    success: "bg-emerald-100 text-emerald-800",
    warning: "bg-amber-100 text-amber-800",
    info: "bg-cyan-100 text-cyan-800",
    danger: "bg-red-100 text-red-800",
  };
  return (
    <Card className={"text-center p-4 " + (colors[color] || colors.primary)}>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </Card>
  );
};

const PresidentValidations = ({ defaultTab = "membres" }) => {
  const { t } = useI18n();
  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState(searchParams.get("tab") || defaultTab);
  const [pending, setPending] = useState([]);
  const [entretiens, setEntretiens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [dateEntretien, setDateEntretien] = useState("");
  const [lieuEntretien, setLieuEntretien] = useState("");
  const [commentaire, setCommentaire] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [filterStatus, setFilterStatus] = useState("");
  const [stats, setStats] = useState(null);
  const [formDate, setFormDate] = useState("");
  const [formMembre, setFormMembre] = useState("");
  const [formLieu, setFormLieu] = useState("");
  const [formCommentaire, setFormCommentaire] = useState("");
  const [formLien, setFormLien] = useState("");
  const [formStatus, setFormStatus] = useState("demandé");
  const [membres, setMembres] = useState([]);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    if (tab === "membres") fetchPending();
    else fetchEntretiens();
  }, [tab]);

  const fetchPending = async () => {
    setLoading(true);
    try {
      const res = await membreAPI.getAll({ status: "en-attente,non-validé" });
      setPending(res.data.data || []);
    } catch { toast.error(t('validations.erreur_chargement')); }
    finally { setLoading(false); }
  };

  const fetchEntretiens = async () => {
    setLoading(true);
    try {
      const params = { limit: 100 };
      if (filterStatus) params.status = filterStatus;
      const res = await entretienAPI.getAll(params);
      setEntretiens(res.data.data || []);
      const membresRes = await membreAPI.getAll({ status: "en-attente" });
      setMembres(membresRes.data.data || []);
      const all = await entretienAPI.getAll({ limit: 500 });
      const data = all.data.data || [];
      setStats({
        total: data.length,
        demandes: data.filter(e => e.status === "demandé").length,
        enAttente: data.filter(e => e.status === "en-attente").length,
        approuves: data.filter(e => e.status === "approuvé").length,
        realises: data.filter(e => e.status === "réalisé").length,
        annules: data.filter(e => e.status === "annulé").length,
      });
    } catch { toast.error(t('validations.erreur_chargement')); }
    finally { setLoading(false); }
  };

  const handleProgrammer = async (id) => {
    if (!dateEntretien) { toast.error(t('validations.choisir_date')); return; }
    try {
      await membreAPI.acceptMember(id, { dateEntretien, commentaire, lieu: lieuEntretien });
      toast.success(t('president.email_entretien_envoye'));
      setSelected(null);
      setDateEntretien("");
      setLieuEntretien("");
      setCommentaire("");
      fetchPending();
      fetchEntretiens();
    } catch (e) {
      toast.error(e.response?.data?.message || t('common.erreur'));
    }
  };

  const openAddForm = () => {
    setEditId(null);
    setFormDate("");
    setFormMembre("");
    setFormLieu("");
    setFormCommentaire("");
    setFormLien("");
    setFormStatus("demandé");
    setShowForm(true);
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
        if (formStatus === "approuvé") await entretienAPI.approve(editId).catch(() => {});
        else if (formStatus === "annulé") await entretienAPI.reject(editId).catch(() => {});
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
    try {
      await entretienAPI.delete(id);
      toast.success(t('president.entretien_supprime'));
      fetchEntretiens();
    } catch (e) {
      toast.error(e.response?.data?.message || t('common.erreur'));
    }
  };

  const handleApprove = async (id) => {
    try {
      await entretienAPI.approve(id);
      toast.success(t('entretiens.approuve'));
      fetchEntretiens();
      fetchPending();
    } catch (e) {
      toast.error(e.response?.data?.message || t('common.erreur'));
    }
  };

  const handleReject = async (id) => {
    try {
      await entretienAPI.reject(id);
      toast.success(t('entretiens.rejete'));
      fetchEntretiens();
      fetchPending();
    } catch (e) {
      toast.error(e.response?.data?.message || t('common.erreur'));
    }
  };

  const handleRealise = async (id) => {
    const note = prompt(t('entretiens.note_prompt'));
    if (note === null) return;
    const remarques = prompt(t('entretiens.remarques_prompt'));
    try {
      await entretienAPI.realise(id, { note: parseFloat(note) || 0, remarques: remarques || "" });
      toast.success(t('entretiens.marque_realise'));
      fetchEntretiens();
    } catch (e) {
      toast.error(t('common.erreur'));
    }
  };

  if (loading) return <Skeleton className="h-96 w-full" />;

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
      "demandé": "bg-amber-100 text-amber-800",
      "en-attente": "bg-blue-100 text-blue-800",
      "approuvé": "bg-emerald-100 text-emerald-800",
      "réalisé": "bg-cyan-100 text-cyan-800",
      "annulé": "bg-red-100 text-red-800",
    };
    return classes[status] || "bg-gray-100 text-gray-800";
  };

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
                <CardTitle className="text-2xl font-bold text-surface-900">{t('nav.validations_entretiens')}</CardTitle>
                <p className="text-surface-500">{pending.length} {t('president.inscriptions_attente')}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 border-b border-surface-200">
              {[{ key: "membres", label: t('president.validations_titre'), count: pending.length }, { key: "entretiens", label: t('president.entretiens_titre'), count: entretiens.length }].map((tb) => (
                <Button key={tb.key} onClick={() => setTab(tb.key)}
                  variant={tab === tb.key ? "default" : "ghost"}
                  className={"border-b-2 -mb-px rounded-none " + (tab === tb.key ? "text-primary-600 border-primary-600" : "text-surface-500 border-transparent hover:text-surface-700")}>
                  {tb.label} ({tb.count})
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {tab === "membres" && (
          <>
            {pending.length === 0 ? (
              <Card className="p-12 text-center">
                <CheckCircle className="w-16 h-16 mx-auto text-surface-300 mb-4" />
                <p className="text-surface-400 text-lg">{t('president.aucune_validation')}</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {pending.map((m) => (
                  <Card key={m._id} className="p-5">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold">
                            {(m.prenom?.[0] || "").toUpperCase()}{(m.nom?.[0] || "").toUpperCase()}
                          </div>
                          <div>
                            <h3 className="font-semibold text-surface-900">{m.prenom} {m.nom}</h3>
                            <p className="text-sm text-surface-500">{m.email}</p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-x-6 gap-y-1 mt-2 text-sm text-surface-600">
                          <span>{t('validations.tel')}: {m.telephone || t('common.non_renseigne')}</span>
                          <span>{t('validations.situation')}: {m.situationProfessionnelle || t('common.non_renseigne')}</span>
                        </div>
                      </div>
                      <Button size="sm" onClick={() => setSelected(selected === m._id ? null : m._id)}>
                        {selected === m._id ? t('common.fermer') : t('president.programmer')}
                      </Button>
                    </div>
                    {selected === m._id && (
                      <div className="mt-4 pt-4 border-t border-surface-200">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <Label>{t('president.date_entretien')} *</Label>
                            <Input type="datetime-local" value={dateEntretien} onChange={(e) => setDateEntretien(e.target.value)} required />
                          </div>
                          <div>
                            <Label>{t('entretiens.lieu')}</Label>
                            <Input type="text" placeholder={t('entretiens.lieu_placeholder')} value={lieuEntretien} onChange={(e) => setLieuEntretien(e.target.value)} />
                          </div>
                          <div>
                            <Label>{t('president.commentaire')}</Label>
                            <Input type="text" placeholder={t('president.commentaire_placeholder')} value={commentaire} onChange={(e) => setCommentaire(e.target.value)} />
                          </div>
                        </div>
                        <div className="flex gap-2 mt-4">
                          <Button onClick={() => handleProgrammer(m._id)}>{t('common.enregistrer')}</Button>
                          <Button variant="outline" onClick={() => { setSelected(null); setDateEntretien(""); setLieuEntretien(""); setCommentaire(""); }}>{t('common.annuler')}</Button>
                        </div>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </>
        )}

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
              <Button size="sm" onClick={openAddForm}>
                <Plus className="w-4 h-4 mr-1.5" /> {t('president.ajouter_entretien')}
              </Button>
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
                    </div>
                  )}
                </div>
                <div className="flex gap-2 mt-4">
                  <Button onClick={handleSaveEntretien} disabled={formLoading}>
                    {formLoading ? t('common.chargement') : t('common.enregistrer')}
                  </Button>
                  <Button variant="outline" onClick={() => setShowForm(false)}>{t('common.annuler')}</Button>
                </div>
              </Card>
            )}

            {entretiens.length === 0 ? (
              <Card className="p-12 text-center">
                <Calendar className="w-16 h-16 mx-auto text-surface-300 mb-4" />
                <p className="text-surface-400 text-lg">{t('president.aucun_entretien')}</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {entretiens.map((e) => (
                  <Card key={e._id} className="p-5">
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={"w-2.5 h-2.5 rounded-full shrink-0 " + (e.status === "approuvé" || e.status === "réalisé" ? "bg-emerald-500" : e.status === "annulé" ? "bg-red-500" : "bg-amber-500")} />
                          <h3 className="font-semibold text-surface-900">{e.membre?.prenom} {e.membre?.nom || "—"}</h3>
                          <Badge className={"text-xs " + statusBadge(e.status)}>{e.status}</Badge>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 mt-3 text-sm text-surface-600">
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 shrink-0 text-surface-400" />
                            {formatDateDisplay(e.date)}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 shrink-0 text-surface-400" />
                            {formatTimeDisplay(e.date)}
                          </span>
                          {e.lieu && (
                            <span className="flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 shrink-0 text-surface-400" />
                              {e.lieu}
                            </span>
                          )}
                          {e.commentaire && (
                            <span className="flex items-center gap-1.5 sm:col-span-2">
                              <span className="text-surface-400">💬</span>
                              {e.commentaire}
                            </span>
                          )}
                        </div>
                        {e.lien && (
                          <a href={e.lien} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 mt-2 text-xs text-primary-600 hover:underline">
                            🔗 {t('president.lien_entretien')}
                          </a>
                        )}
                        {e.remarques && (
                          <p className="text-sm text-surface-500 mt-2 italic">{t('entretiens.remarques')}: {e.remarques}</p>
                        )}
                        {e.note !== undefined && e.note !== null && (
                          <p className="text-sm font-semibold text-primary-600 mt-1">{t('entretiens.note')}: {e.note}/20</p>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2 shrink-0">
                        {e.status === "demandé" || e.status === "en-attente" ? (
                          <>
                            <Button size="sm" className="bg-emerald-600 text-white hover:bg-emerald-700" onClick={() => handleApprove(e._id)}>
                              <CheckCircle className="w-3.5 h-3.5 mr-1" /> {t('entretiens.confirmer')}
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleReject(e._id)}>
                              <XCircle className="w-3.5 h-3.5 mr-1" /> {t('entretiens.rejeter')}
                            </Button>
                          </>
                        ) : e.status === "approuvé" ? (
                          <Button size="sm" variant="outline" onClick={() => handleRealise(e._id)}>
                            {t('entretiens.marquer_realise')}
                          </Button>
                        ) : null}
                        {e.status !== "approuvé" && e.status !== "réalisé" && (
                          <>
                            <Button size="sm" variant="outline" onClick={() => openEditForm(e)}>
                              <Pencil className="w-3.5 h-3.5" />
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleDeleteEntretien(e._id)}>
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PresidentValidations;
