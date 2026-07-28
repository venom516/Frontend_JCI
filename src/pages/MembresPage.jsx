import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useI18n } from "../contexts/I18nContext";
import { membreAPI, entretienAPI } from "../api/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  Search, X, Users, UserPlus, Pencil, Trash2, Eye, Shield, 
  AlertCircle, CheckCircle, Clock, Ban, RefreshCw, Plus
} from "lucide-react";
import toast from "react-hot-toast";

const UNIQUE_ROLES = ["President", "Conseiller Juridique", "ConseillerMedia", "Conseiller IT", "Conseiller 100% Efficacité", "PPI", "Directeur Exécutif"];

export default function MembresPage() {
  const { t, formatDate } = useI18n();
  const { user, isPresident } = useAuth();
  const isUserManager = isPresident || user?.role === "SecretaireGeneral";
  const [membres, setMembres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedMembre, setSelectedMembre] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [stats, setStats] = useState({ total: 0, actifs: 0, enAttente: 0, suspendus: 0 });
  const [roles, setRoles] = useState([]);
  const [entretiens, setEntretiens] = useState([]);

  useEffect(() => { fetchMembres(); fetchStats(); fetchRoles(); fetchEntretiens(); }, []);


  const fetchMembres = async () => {
    setLoading(true);
    try { const r = await membreAPI.getAll(); setMembres(r.data.data || []); }
    catch (e) { toast.error(t("members.erreur_chargement")); }
    finally { setLoading(false); }
  };

  const isVPFDorSG = user?.role === "VPFD" || user?.role === "SecretaireGeneral" || isPresident;
  const canViewStats = isPresident || user?.role === "SecretaireGeneral";

  const fetchStats = async () => {
    if (!canViewStats) return;
    try { const r = await membreAPI.getStats(); setStats(r.data.data || {}); }
    catch (e) { console.error("Erreur stats:", e); }
  };

  const fetchRoles = async () => {
    try { const r = await membreAPI.getAllRoles(); setRoles(r.data.data || []); }
    catch (e) { console.error(e); }
  };

  const fetchEntretiens = async () => {
    try { const r = await entretienAPI.getAll({ limit: 1000 }); setEntretiens(r.data.data || []); }
    catch (e) { console.error(e); }
  };

  const getEntretienStatus = (membreId) => {
    const e = entretiens.find(en => en.membre?._id === membreId || en.membre === membreId);
    if (!e) return null;
    return e.status;
  };

  const getEntretienStatusLabel = (s) => ({
    demandé: t('entretiens.demande'), 'en-attente': t('entretiens.en_attente'), approuvé: t('entretiens.approuves'),
    réalisé: t('entretiens.realise'), annulé: t('entretiens.annule'), refusé: t('members.refuse')
  })[s] || s;

  const getEntretienBadge = (s) => ({
    demandé: 'secondary', 'en-attente': 'secondary', approuvé: 'default',
    réalisé: 'default', annulé: 'outline', refusé: 'destructive'
  })[s] || 'secondary';

  const handleValidate = async (id, action) => {
    try { await membreAPI.validate(id, action); toast.success(t("members.succes_validation")); fetchMembres(); fetchStats(); }
    catch (e) { toast.error(t("members.erreur_validation")); }
  };

  const handleSuspendre = async (id) => {
    if (!window.confirm(t("members.confirmer_suspension"))) return;
    try { await membreAPI.suspendre(id); toast.success(t("members.succes_suspendu")); fetchMembres(); fetchStats(); }
    catch (e) { toast.error(t("common.erreur")); }
  };

  const handleReactiver = async (id) => {
    if (!window.confirm(t("members.confirmer_reactivation"))) return;
    try { await membreAPI.reactiver(id); toast.success(t("members.succes_reactive")); fetchMembres(); fetchStats(); }
    catch (e) { toast.error(t("common.erreur")); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t("members.confirmer_suppression_definitive"))) return;
    try { await membreAPI.delete(id); toast.success(t("members.succes_supprime")); fetchMembres(); fetchStats(); }
    catch (e) { toast.error(e.translatedMessage || t("members.erreur_validation")); }
  };

  const handleView = (m) => { setSelectedMembre(m); setShowModal(true); };

  const handleEdit = (m) => {
    setSelectedMembre(m);
    setEditForm({
      nom: m.nom || "", prenom: m.prenom || "", email: m.email || "",
      telephone: m.telephone || "", adresse: m.adresse || "",
      situationProfessionnelle: m.situationProfessionnelle || "Autre",
      role: m.role || "Membre", status: m.status || "actif", photo: m.photo || ""
    });
    setPhotoPreview(m.photo || null);
    setShowEditModal(true);
  };

  const handleAddRole = async () => {
    const name = prompt(t('admin.nouveau_role'));
    if (!name || name.trim().length < 2) return;
    try {
      await membreAPI.createRole(name.trim());
      toast.success(t('admin.succes_role_cree', { name: name.trim() }));
      fetchRoles();
    } catch (e) { toast.error(e.response?.data?.message || t('admin.erreur_creation_role')); }
  };

  const handleRenameRole = async (oldName) => {
    const newName = prompt(t('admin.nouveau_nom_pour', { name: oldName }), oldName);
    if (!newName || newName.trim() === oldName) return;
    try {
      await membreAPI.renameRole(oldName, newName.trim());
      toast.success(t('admin.succes_role_renomme', { oldName, newName: newName.trim() }));
      fetchRoles();
      fetchMembres();
    } catch (e) { toast.error(e.response?.data?.message || t('admin.erreur_renommage')); }
  };

  const handleDeleteRole = async (roleName) => {
    if (!window.confirm(t('admin.confirmer_supprimer_role', { roleName }))) return;
    try {
      const res = await membreAPI.deleteRole(roleName);
      toast.success(res.data?.message || t('admin.succes_role_supprime', { roleName }));
      fetchRoles();
      fetchMembres();
    } catch (e) { toast.error(e.response?.data?.message || t('admin.erreur_suppression_role')); }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const p = { ...editForm };
      if (!isPresident) { delete p.role; delete p.status; }
      // Vérifier unicité du rôle côté frontend
      if (p.role && p.role !== selectedMembre.role && UNIQUE_ROLES.includes(p.role)) {
        const alreadyAssigned = membres.some(m => m._id !== selectedMembre._id && m.role === p.role && m.status !== 'refusé');
        if (alreadyAssigned) {
          toast.error("Ce rôle est déjà attribué à un autre membre.");
          return;
        }
      }
      await membreAPI.update(selectedMembre._id, p);
      toast.success(t("members.succes_mis_a_jour"));
      setShowEditModal(false); setPhotoPreview(null); fetchMembres();
    } catch (e) { toast.error(t("members.erreur_mise_a_jour")); }
  };

  const getStatusBadge = (s) => ({
    actif: "default", en_attente: "secondary", "en-attente": "secondary",
    "non-valide": "destructive", suspendu: "destructive", banni: "destructive",
    refusé: "outline"
  })[s] || "secondary";

  const getRoleLabel = (r) => ({
    President: t("members.role_president"), SecretaireGeneral: t("members.role_sg"),
    ConseillerMedia: t("members.role_media"),
    "Conseiller Juridique": t("members.role_conseiller"),
    "Sénateur": t("members.role_senateur"), "Past President": t("members.role_past_president"), PPI: t("members.role_ppi"),
    VPPRE: t("members.role_vppre"), VPFD: t("members.role_vpfd"),
    Tresorie: t("members.role_tresorie"),
    Membre: t("members.role_membre")
  })[r] || r;

  const getStatusLabel = (s) => ({
    actif: t("members.actif"), en_attente: t("members.en_attente"),
    "en-attente": t("members.en_attente"), "non-valide": t("members.non_valide"),
    suspendu: t("members.suspendu"), banni: t("members.banni"),
    refusé: t("members.refuse")
  })[s] || s;

  const getSituationLabel = (s) => ({ Etudiant: t("members.etudiant"), Professionnel: t("members.professionnel"), Autre: t("members.autre") })[s] || s;

  const statCards = [
    { key: "total", label: t("members.total"), color: "text-primary", icon: Users },
    { key: "actifs", label: t("members.actifs"), color: "text-emerald-600", icon: CheckCircle },
    { key: "enAttente", label: t("members.en_attente"), color: "text-amber-600", icon: Clock },
    { key: "suspendus", label: t("members.suspendus"), color: "text-rose-600", icon: Ban },
    { key: "refuses", label: t("members.refuses"), color: "text-gray-500", icon: X },
  ];

  const filteredMembres = membres.filter(m => {
    const nameMatch = (m.prenom + " " + m.nom + " " + m.email).toLowerCase().includes(search.toLowerCase());
    return nameMatch && (filterRole === "all" || m.role === filterRole) && (filterStatus === "all" || m.status === filterStatus);
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("members.titre")}</h1>
          <p className="text-muted-foreground text-sm">{t("members.liste")}</p>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        {statCards.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.key}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle>
                <Icon className={"h-4 w-4 " + s.color} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats[s.key] ?? 0}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filtres */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input type="text" placeholder={t("members.rechercher")} value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
            </div>
            <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)} className="flex h-10 w-full sm:w-[180px] rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option value="all">{t("members.tous_roles")}</option>
              {["President","Conseiller Juridique","Sénateur","PP","Past President","PPI","SecretaireGeneral","ConseillerMedia","Membre"].map(r => (
                <option key={r} value={r}>{getRoleLabel(r)}</option>
              ))}
            </select>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="flex h-10 w-full sm:w-[160px] rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option value="all">{t("members.tous_statuts")}</option>
              <option value="actif">{t("members.actif")}</option>
              <option value="en_attente">{t("members.en_attente")}</option>
              <option value="suspendu">{t("members.suspendu")}</option>
              <option value="refusé">{t("members.refuse")}</option>
            </select>
            <Button variant="ghost" size="sm" onClick={() => { setSearch(""); setFilterRole("all"); setFilterStatus("all"); }}>
              <RefreshCw className="mr-2 h-4 w-4" /> {t("common.reinitialiser")}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Liste membres */}
      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <Card key={i}><CardContent className="p-4"><div className="h-12 bg-muted animate-pulse rounded" /></CardContent></Card>)}</div>
      ) : filteredMembres.length === 0 ? (
        <Card><CardContent className="py-16 text-center text-muted-foreground"><Users className="h-12 w-12 mx-auto mb-4 opacity-30" /><p>{t("members.aucun")}</p></CardContent></Card>
      ) : (
        <div className="space-y-2">
          {filteredMembres.map((m) => {
            const initials = (m.prenom?.[0] || "").toUpperCase() + (m.nom?.[0] || "").toUpperCase();
            return (
              <Card key={m._id} className="hover:bg-accent/50 transition-colors">
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={m.photo} />
                      <AvatarFallback className="text-xs bg-primary/10 text-primary">{initials}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium text-sm truncate">{m.prenom} {m.nom}</span>
                        <Badge variant="outline" className="text-xs">{getRoleLabel(m.role)}</Badge>
                        <Badge variant={getStatusBadge(m.status)} className="text-xs">{getStatusLabel(m.status)}</Badge>
                        {getEntretienStatus(m._id) && (
                          <Badge variant={getEntretienBadge(getEntretienStatus(m._id))} className="text-xs">
                            {t("Entretien")}: {getEntretienStatusLabel(getEntretienStatus(m._id))}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">{m.email} {m.telephone ? <>&middot; {m.telephone}</> : ""} &middot; {m.role}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleView(m)} title={t("common.voir")}><Eye className="h-4 w-4" /></Button>
                      {isUserManager && (
                        <>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleEdit(m)} title={t("common.modifier")}><Pencil className="h-4 w-4" /></Button>
                          {m.status === "actif" ? (
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-amber-600" onClick={() => handleSuspendre(m._id)} title={t("members.suspendre")}><Ban className="h-4 w-4" /></Button>
                          ) : m.status === "suspendu" ? (
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-emerald-600" onClick={() => handleReactiver(m._id)} title={t("members.reactiver")}><RefreshCw className="h-4 w-4" /></Button>
                          ) : null}
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive" onClick={() => handleDelete(m._id)} title={t("common.supprimer")}><Trash2 className="h-4 w-4" /></Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Gestion des rôles */}
      {isPresident && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{t("admin.gestion_roles")}</CardTitle>
                <p className="text-sm text-muted-foreground">{t("admin.gestion_roles_sous_titre")}</p>
              </div>
              <Button variant="outline" size="sm" onClick={handleAddRole} className="flex items-center gap-2">
                <Plus className="w-4 h-4" /> {t("admin.nouveau_role")}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {roles.map(r => (
                <div key={r.name} className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-accent ring-1 ring-border hover:ring-primary-200 transition-all">
                  <span className="font-medium text-sm">{r.name}</span>
                  <span className="text-xs text-muted-foreground">({r.count})</span>
                  <button onClick={() => handleRenameRole(r.name)} className="text-primary-600 hover:text-primary-800 ml-1 transition-colors" title={t("common.renommer")}>
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDeleteRole(r.name)} className="text-destructive hover:text-destructive/80 transition-colors" title={t("common.supprimer")}>
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modal d�tails */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        {selectedMembre && (
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("members.voir_profil")}</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col items-center mb-4">
              <Avatar className="h-20 w-20 mb-3 ring-2 ring-primary/20">
                <AvatarImage src={selectedMembre.photo} />
                <AvatarFallback className="text-lg bg-primary/10 text-primary">
                  {(selectedMembre.prenom?.[0] || "").toUpperCase()}{(selectedMembre.nom?.[0] || "").toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <h3 className="text-lg font-semibold">{selectedMembre.prenom} {selectedMembre.nom}</h3>
              <div className="flex gap-2 mt-1">
                <Badge variant="outline">{getRoleLabel(selectedMembre.role)}</Badge>
                <Badge variant={getStatusBadge(selectedMembre.status)}>{getStatusLabel(selectedMembre.status)}</Badge>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="font-semibold text-muted-foreground">{t("members.email")}</span><p>{selectedMembre.email}</p></div>
              <div><span className="font-semibold text-muted-foreground">{t("members.telephone")}</span><p>{selectedMembre.telephone || t("common.non_renseigne")}</p></div>
              <div><span className="font-semibold text-muted-foreground">{t("members.adresse")}</span><p>{selectedMembre.adresse || t("common.non_renseigne")}</p></div>
              <div><span className="font-semibold text-muted-foreground">{t("members.profession")}</span><p>{getSituationLabel(selectedMembre.situationProfessionnelle) || t("common.non_renseigne")}</p></div>
              <div><span className="font-semibold text-muted-foreground">{t("members.date_naissance")}</span><p>{selectedMembre.dateNaissance ? formatDate(selectedMembre.dateNaissance) : t("common.non_renseigne")}</p></div>
              <div><span className="font-semibold text-muted-foreground">{t("members.inscrit_le")}</span><p>{formatDate(selectedMembre.createdAt)}</p></div>
            </div>
          </DialogContent>
        )}
      </Dialog>

      {/* Modal �dition */}
      <Dialog open={showEditModal} onOpenChange={(o) => { if (!o) { setShowEditModal(false); setPhotoPreview(null); } }}>
        {editForm && selectedMembre && (
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{t("common.modifier")} {selectedMembre.prenom} {selectedMembre.nom}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="flex flex-col items-center mb-2">
                <div className="relative cursor-pointer" onClick={() => document.getElementById("membre-photo-input").click()}>
                  <Avatar className="h-20 w-20 ring-2 ring-primary/20">
                    <AvatarImage src={photoPreview} />
                    <AvatarFallback className="text-lg bg-primary/10 text-primary">
                      {(editForm.prenom?.[0] || "").toUpperCase()}{(editForm.nom?.[0] || "").toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <Plus className="h-6 w-6 text-white" />
                  </div>
                </div>
                <input type="file" id="membre-photo-input" className="hidden" accept="image/*" onChange={(e) => {
                  const f = e.target.files?.[0]; if (!f) return;
                  const r = new FileReader(); r.onload = (ev) => { setEditForm(p => ({ ...p, photo: ev.target.result })); setPhotoPreview(ev.target.result); }; r.readAsDataURL(f);
                }} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1"><Label>{t("members.nom")}</Label><Input value={editForm.nom} onChange={(e) => setEditForm(p => ({ ...p, nom: e.target.value }))} required /></div>
                <div className="space-y-1"><Label>{t("members.prenom")}</Label><Input value={editForm.prenom} onChange={(e) => setEditForm(p => ({ ...p, prenom: e.target.value }))} required /></div>
              </div>
              <div className="space-y-1"><Label>{t("members.email")}</Label><Input type="email" value={editForm.email} onChange={(e) => setEditForm(p => ({ ...p, email: e.target.value }))} required /></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1"><Label>{t("members.telephone")}</Label><Input value={editForm.telephone} onChange={(e) => setEditForm(p => ({ ...p, telephone: e.target.value }))} /></div>
                <div className="space-y-1"><Label>{t("members.adresse")}</Label><Input value={editForm.adresse} onChange={(e) => setEditForm(p => ({ ...p, adresse: e.target.value }))} /></div>
              </div>
              {isPresident && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label>{t("members.role")}</Label>
                    <select value={editForm.role} onChange={(e) => setEditForm(p => ({ ...p, role: e.target.value }))} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                      {(roles.length > 0 ? roles : [{name:"Membre"},{name:"President"},{name:"SecretaireGeneral"},{name:"ConseillerMedia"}]).map(r => (
                        <option key={r.name || r} value={r.name || r}>{getRoleLabel(r.name || r)}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <Label>{t("members.statut")}</Label>
                    <select value={editForm.status} onChange={(e) => setEditForm(p => ({ ...p, status: e.target.value }))} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                      <option value="actif">{t("members.actif")}</option>
                      <option value="en_attente">{t("members.en_attente")}</option>
                      <option value="suspendu">{t("members.suspendu")}</option>
                      <option value="refusé">{t("members.refuse")}</option>
                    </select>
                  </div>
                </div>
              )}
              <DialogFooter className="gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => { setShowEditModal(false); setPhotoPreview(null); }}>{t("common.annuler")}</Button>
                <Button type="submit">{t("common.enregistrer")}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
