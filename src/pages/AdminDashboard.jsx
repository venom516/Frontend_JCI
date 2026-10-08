import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";
import axiosInstance, { membreAPI } from "../api/axios";
import toast from "react-hot-toast";
import { useI18n } from "../contexts/I18nContext";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Skeleton } from "../components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 82d4b6f6dc74b5b05e36ebbdc5395ed46ed114c9
import { useAutoRefresh } from "../hooks/useAutoRefresh";
import { Users, CheckCircle, Clock, AlertCircle, Plus, Pencil, Trash2, X, Camera } from "lucide-react";
=======
import { Users, CheckCircle, Clock, AlertCircle, Plus, Pencil, Trash2, X, Camera, Search } from "lucide-react";
>>>>>>> 47883136c2fca296e3dcd5a33f1106ec0316b78a

const AdminDashboard = () => {
  const { user } = useAuth();
  const { t, formatDate, translateMemberStatus, translateMemberRole } = useI18n();
  const [membres, setMembres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedMembre, setSelectedMembre] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editForm, setEditForm] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [stats, setStats] = useState({
    total: 0, actifs: 0, enAttente: 0, suspendus: 0
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({
    nom: "", prenom: "", email: "", password: "",
    telephone: "", adresse: "", situationProfessionnelle: "Autre", role: "Membre", photo: ""
  });
  const [addPhotoPreview, setAddPhotoPreview] = useState(null);
  const [roles, setRoles] = useState([]);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [renameRoleData, setRenameRoleData] = useState(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchMembres();
    fetchStats();
    fetchRoles();
  }, []);

  useEffect(() => { fetchMembres(); }, [filterStatus]);

  useAutoRefresh(() => {
    fetchMembres();
    fetchStats();
  });

  const fetchMembres = async () => {
    try {
      const response = await membreAPI.getAll({ limit: 100, archived: filterStatus === "archived" ? true : undefined });
      setMembres(response.data.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || error.translatedMessage || t('admin.erreur_chargement'));
    }
  };

  const fetchStats = async () => {
    try {
      const response = await membreAPI.getStats();
      setStats(response.data.data || {});
    } catch (error) {
      toast.error(error.response?.data?.message || error.translatedMessage || t('admin.erreur_chargement'));
      console.error("Erreur stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await membreAPI.getAllRoles();
      setRoles(response.data.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || error.translatedMessage || t('admin.erreur_chargement'));
      console.error("Erreur chargement roles:", error);
    }
  };

  const withProcessing = (fn) => async (...args) => {
    setProcessing(true);
    try { await fn(...args); } finally { setProcessing(false); }
  };

  const handleAddRole = withProcessing(async () => {
    const name = prompt(t('admin.nouveau_role'));
    if (!name || name.trim().length < 2) {
      toast.error(t('admin.erreur_nom_role'));
      return;
    }
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 82d4b6f6dc74b5b05e36ebbdc5395ed46ed114c9
    await membreAPI.create({ nom: "Nouveau", prenom: "Membre", email: "role-" + Date.now() + "@temp.jci.tn", password: "Temp@123456", role: name.trim(), status: "actif" });
    toast.success(t('admin.succes_role_cree', { name: name.trim() }));
    fetchRoles();
  });
<<<<<<< HEAD
=======
=======
    try {
      await membreAPI.create({ nom: "Nouveau", prenom: "Membre", email: "role-" + Date.now() + "@temp.jci.tn", password: "Temp@123456", role: name.trim(), status: "actif" });
      toast.success(t('admin.succes_role_cree', { name: name.trim() }));
      fetchRoles();
    } catch (error) {
      toast.error(error.response?.data?.message || error.translatedMessage || t('admin.erreur_creation_role'));
    }
  };
>>>>>>> 47883136c2fca296e3dcd5a33f1106ec0316b78a
>>>>>>> 82d4b6f6dc74b5b05e36ebbdc5395ed46ed114c9

  const handleRenameRole = withProcessing(async (oldName) => {
    const newName = prompt(t('admin.nouveau_nom_pour', { name: oldName }), oldName);
    if (!newName || newName.trim() === oldName) return;
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 82d4b6f6dc74b5b05e36ebbdc5395ed46ed114c9
    await membreAPI.renameRole(oldName, newName.trim());
    toast.success(t('admin.succes_role_renomme', { oldName: oldName, newName: newName.trim() }));
    fetchRoles();
    fetchMembres();
  });
<<<<<<< HEAD

  const handleDeleteRole = withProcessing(async (roleName) => {
    if (!window.confirm(t('admin.confirmer_supprimer_role', { roleName: roleName }))) return;
=======
=======
    try {
      await membreAPI.renameRole(oldName, newName.trim());
      toast.success(t('admin.succes_role_renomme', { oldName: oldName, newName: newName.trim() }));
      fetchRoles();
      fetchMembres();
    } catch (error) {
      toast.error(error.response?.data?.message || error.translatedMessage || t('admin.erreur_renommage'));
    }
  };
>>>>>>> 47883136c2fca296e3dcd5a33f1106ec0316b78a

  const handleDeleteRole = withProcessing(async (roleName) => {
    if (!window.confirm(t('admin.confirmer_supprimer_role', { roleName: roleName }))) return;
<<<<<<< HEAD
>>>>>>> 82d4b6f6dc74b5b05e36ebbdc5395ed46ed114c9
    const res = await membreAPI.deleteRole(roleName);
    toast.success(res.data.message || t('admin.succes_role_supprime', { roleName: roleName }));
    fetchRoles();
    fetchMembres();
  });
<<<<<<< HEAD
=======
=======
    try {
      const res = await membreAPI.deleteRole(roleName);
      toast.success(res.data.message || t('admin.succes_role_supprime', { roleName: roleName }));
      fetchRoles();
      fetchMembres();
    } catch (error) {
      toast.error(error.response?.data?.message || error.translatedMessage || t('admin.erreur_suppression_role'));
    }
  };
>>>>>>> 47883136c2fca296e3dcd5a33f1106ec0316b78a
>>>>>>> 82d4b6f6dc74b5b05e36ebbdc5395ed46ed114c9

  const handlePhotoChange = (e, isEdit = false) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      if (isEdit) {
        setEditForm(prev => ({ ...prev, photo: reader.result }));
        setPhotoPreview(reader.result);
      } else {
        setAddForm(prev => ({ ...prev, photo: reader.result }));
        setAddPhotoPreview(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleValidate = withProcessing(async (id, action) => {
    await membreAPI.validate(id, action);
    toast.success(t('admin.succes_membre_valide', { action: action === 'validate' ? 'valide' : 'rejete' }));
    fetchMembres();
    fetchStats();
  });

  const handleSuspendre = withProcessing(async (id) => {
    if (!window.confirm(t('admin.confirmer_suspendre'))) return;
    await membreAPI.suspendre(id);
    toast.success(t('admin.succes_membre_suspendu'));
    fetchMembres();
    fetchStats();
  });

  const handleReactiver = withProcessing(async (id) => {
    if (!window.confirm(t('admin.confirmer_reactiver'))) return;
    await membreAPI.reactiver(id);
    toast.success(t('admin.succes_membre_reactive'));
    fetchMembres();
    fetchStats();
  });

  const handleDelete = withProcessing(async (id) => {
    if (!window.confirm(t('admin.confirmer_supprimer'))) return;
    await membreAPI.delete(id);
    toast.success(t('admin.succes_membre_supprime'));
    fetchMembres();
    fetchStats();
  });

  const handleView = (membre) => {
    setSelectedMembre(membre);
    setShowModal(true);
  };

  // Un compte archivé ou refusé est consultable uniquement :
  // seul le bouton "Voir" reste disponible sur sa ligne
  const estLectureSeule = (membre) => Boolean(membre.archiver) || membre.status === "refusé";

  // Statut affiché : un refus reste "Refusé", un compte supprimé reste "Archivé"
  const getStatutAffiche = (membre) => (membre.status === "refusé" ? "refusé" : membre.archiver ? "archivé" : membre.status);

  const handleEdit = (membre) => {
    setSelectedMembre(membre);
    setEditForm({
      nom: membre.nom || "",
      prenom: membre.prenom || "",
      email: membre.email || "",
      telephone: membre.telephone || "",
      adresse: membre.adresse || "",
      situationProfessionnelle: membre.situationProfessionnelle || "Autre",
      role: membre.role || "Membre",
      status: membre.status || "actif",
      photo: membre.photo || ""
    });
    setPhotoPreview(membre.photo || null);
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editForm || !selectedMembre) return;
    setProcessing(true);
    try {
      await membreAPI.update(selectedMembre._id, editForm);
      toast.success(t('admin.succes_profil_mis_a_jour'));
      setShowEditModal(false);
      setEditForm(null);
      setPhotoPreview(null);
      fetchMembres();
    } catch (error) {
<<<<<<< HEAD
      toast.error(t('admin.erreur_mise_a_jour'));
    } finally { setProcessing(false); }
<<<<<<< HEAD
=======
=======
      toast.error(error.response?.data?.message || error.translatedMessage || t('admin.erreur_mise_a_jour'));
    }
>>>>>>> 47883136c2fca296e3dcd5a33f1106ec0316b78a
>>>>>>> 82d4b6f6dc74b5b05e36ebbdc5395ed46ed114c9
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!addForm.nom || !addForm.prenom || !addForm.email) {
      toast.error(t('admin.erreur_champs_requis'));
      return;
    }
    setProcessing(true);
    try {
      await axiosInstance.post("/membres", addForm);
      toast.success(t('admin.succes_membre_ajoute'));
      setShowAddModal(false);
      setAddForm({
        nom: "", prenom: "", email: "", password: "",
        telephone: "", adresse: "", situationProfessionnelle: "Autre", role: "Membre", photo: ""
      });
      setAddPhotoPreview(null);
      fetchMembres();
      fetchStats();
    } catch (error) {
      toast.error(error.response?.data?.message || t('admin.erreur_ajout'));
    } finally { setProcessing(false); }
  };

  const getStatusBadge = (status) => {
    // Cles = enum exact de Membre.status (accents et tirets compris).
    const colors = {
<<<<<<< HEAD
      actif: "bg-emerald-100 text-emerald-700",
      en_attente: "bg-amber-100 text-amber-700",
      "en-attente": "bg-amber-100 text-amber-700",
      suspendu: "bg-blue-100 text-blue-700",
      banni: "bg-red-100 text-red-700",
      "non-valide": "bg-accent text-muted-foreground",
      "refusé": "bg-orange-100 text-orange-700",
      "archivé": "bg-gray-100 text-gray-500",
<<<<<<< HEAD
=======
=======
      "non-inscrit": "bg-accent text-muted-foreground",
      "en-attente": "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-200",
      actif: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200",
      "non-validé": "bg-accent text-muted-foreground",
      suspendu: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-200",
      banni: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-200",
      refusé: "bg-gray-100 text-gray-600 dark:bg-gray-900 dark:text-gray-300",
      inactif: "bg-accent text-muted-foreground",
>>>>>>> 47883136c2fca296e3dcd5a33f1106ec0316b78a
>>>>>>> 82d4b6f6dc74b5b05e36ebbdc5395ed46ed114c9
    };
    return colors[status] || "bg-accent text-muted-foreground";
  };

  const getRoleBadge = (role) => {
    const colors = {
      President: "bg-primary-100 text-primary-700",
      SecretaireGeneral: "bg-primary-100 text-primary-700",
      ConseillerMedia: "bg-primary-100 text-primary-700",
      Admin: "bg-primary-100 text-primary-700",
      VPPRE: "bg-primary-100 text-primary-700",
      VPFD: "bg-primary-100 text-primary-700",
      PP: "bg-primary-100 text-primary-700",
      Tresorie: "bg-primary-100 text-primary-700",
      Membre: "bg-primary-50 text-primary-600",
    };
    return colors[role] || "bg-accent text-muted-foreground";
  };

  const filteredMembres = membres.filter(m => {
    const matchSearch =
      m.nom?.toLowerCase().includes(search.toLowerCase()) ||
      m.prenom?.toLowerCase().includes(search.toLowerCase()) ||
      m.email?.toLowerCase().includes(search.toLowerCase());
    const matchRole = filterRole === "all" || m.role === filterRole;
    const matchStatus = filterStatus === "all" || filterStatus === "archived" || m.status === filterStatus;
    return matchSearch && matchRole && matchStatus;
  });

  const renderAvatar = (m, size = "w-10 h-10") => {
    const textSize = size.includes("w-16") ? "text-xl" : "text-sm";
    return (
      <Avatar className={size + " ring-2 ring-primary-200"}>
        <AvatarImage src={m.photo} alt={(m.prenom || "") + " " + (m.nom || "")} className="object-cover" />
        <AvatarFallback className={"bg-gradient-to-br from-primary-400 to-accent-cyan text-white font-bold " + textSize}>
          {(m.prenom?.[0] || "").toUpperCase()}{(m.nom?.[0] || "").toUpperCase()}
        </AvatarFallback>
      </Avatar>
    );
  };

  const StatCard = ({ label, value, color, icon }) => (
    <Card className="p-6 hover:shadow-md transition-shadow animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-3xl font-bold mt-1 text-foreground">{value}</p>
        </div>
        <div className={"w-14 h-14 rounded-2xl flex items-center justify-center " + color}>
          {icon}
        </div>
      </div>
    </Card>
  );

  if (loading) return (
    <div className="min-h-screen bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-12 w-40 rounded-2xl" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
        </div>
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{t('admin.titre')}</h1>
            <p className="text-muted-foreground mt-1">{t('admin.sous_titre')}</p>
          </div>
          <Button onClick={() => setShowAddModal(true)} className="flex items-center gap-2" disabled={processing}>
            <Plus className="w-5 h-5" />
            {t('admin.ajouter_membre')}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard label={t('common.total_membres')} value={stats.total || 0}
            color="bg-primary-50 text-primary-600"
            icon={<Users className="w-7 h-7" />} />
          <StatCard label={t('common.actifs')} value={stats.actifs || 0}
            color="bg-accent-emerald/10 text-accent-emerald"
            icon={<CheckCircle className="w-7 h-7" />} />
          <StatCard label={t('common.en_attente')} value={stats.enAttente || 0}
            color="bg-accent-amber/10 text-accent-amber"
            icon={<Clock className="w-7 h-7" />} />
          <StatCard label={t('common.suspendus')} value={stats.suspendus || 0}
            color="bg-accent-rose/10 text-accent-rose"
            icon={<AlertCircle className="w-7 h-7" />} />
          <StatCard label={t('members.supprimes')} value={stats.supprimes || 0}
            color="bg-gray-100 text-gray-500"
            icon={<Trash2 className="w-7 h-7" />} />
        </div>

        <Card className="p-6">
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder={t('common.rechercher')}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterRole} onValueChange={setFilterRole}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('admin.tous_roles')}</SelectItem>
                {roles.map(r => (
                  <SelectItem key={r.name} value={r.name}>{r.name} ({r.count})</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('admin.tous_statuts')}</SelectItem>
                <SelectItem value="actif">{t('admin.actif')}</SelectItem>
                <SelectItem value="en-attente">{t('admin.en_attente')}</SelectItem>
                <SelectItem value="suspendu">{t('admin.suspendu')}</SelectItem>
                <SelectItem value="banni">{t('admin.banni')}</SelectItem>
<<<<<<< HEAD
                <SelectItem value="non-valide">{t('admin.non_valide')}</SelectItem>
                <SelectItem value="archived">{t('members.supprimes')}</SelectItem>
<<<<<<< HEAD
=======
=======
                <SelectItem value="non-validé">{t('admin.non_valide')}</SelectItem>
>>>>>>> 47883136c2fca296e3dcd5a33f1106ec0316b78a
>>>>>>> 82d4b6f6dc74b5b05e36ebbdc5395ed46ed114c9
              </SelectContent>
            </Select>
          </div>

          <div className="overflow-x-auto -mx-6">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-6 text-sm font-semibold text-muted-foreground uppercase tracking-wider">{t('admin.membre')}</th>
                  <th className="text-left py-3 px-6 text-sm font-semibold text-muted-foreground uppercase tracking-wider">{t('admin.email')}</th>
                  <th className="text-left py-3 px-6 text-sm font-semibold text-muted-foreground uppercase tracking-wider">{t('admin.role')}</th>
                  <th className="text-left py-3 px-6 text-sm font-semibold text-muted-foreground uppercase tracking-wider">{t('admin.statut')}</th>
                  <th className="text-left py-3 px-6 text-sm font-semibold text-muted-foreground uppercase tracking-wider">{t('admin.inscription')}</th>
                  <th className="text-right py-3 px-6 text-sm font-semibold text-muted-foreground uppercase tracking-wider">{t('admin.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredMembres.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-12 text-muted-foreground">
                      <Users className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
                      {t('admin.aucun_membre')}
                    </td>
                  </tr>
                ) : (
                  filteredMembres.map((m) => (
                    <tr key={m._id} className="border-b border-border hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-6">
                        <div className="flex items-center gap-3">
                          {renderAvatar(m)}
                          <div>
                            <p className="font-medium text-foreground">{m.prenom} {m.nom}</p>
                            <p className="text-xs text-muted-foreground">{m.telephone || t('common.non_renseigne')}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-6 text-sm text-muted-foreground">{m.email}</td>
                      <td className="py-3 px-6">
                        <Badge variant="secondary" className={getRoleBadge(m.role)}>
                          {translateMemberRole(m.role)}
                        </Badge>
                      </td>
                      <td className="py-3 px-6">
              <Badge variant="secondary" className={getStatusBadge(getStatutAffiche(m))}>
                {translateMemberStatus(getStatutAffiche(m))}
                          </Badge>
                      </td>
                      <td className="py-3 px-6 text-sm text-muted-foreground">
                        {formatDate(m.createdAt)}
                      </td>
                      <td className="py-3 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button variant="ghost" size="sm" onClick={() => handleView(m)} disabled={processing}>
                            {t('common.voir')}
                          </Button>
                          {!estLectureSeule(m) && (
                            <>
                              <Button variant="ghost" size="sm" onClick={() => handleEdit(m)} className="text-primary-600 hover:bg-primary-50" disabled={processing}>
                                {t('common.modifier')}
                              </Button>
                              {m.status === "actif" ? (
                                <Button variant="ghost" size="sm" onClick={() => handleSuspendre(m._id)} className="text-accent-amber hover:bg-accent-amber/10" disabled={processing}>
                                  {t('common.suspendre')}
                                </Button>
                              ) : (m.status === "suspendu" || m.status === "banni") ? (
                                <Button variant="ghost" size="sm" onClick={() => handleReactiver(m._id)} className="text-accent-emerald hover:bg-accent-emerald/10" disabled={processing}>
                                  {t('common.reactiver')}
                                </Button>
                              ) : null}
                              <Button variant="ghost" size="sm" onClick={() => handleDelete(m._id)} className="text-accent-rose hover:bg-accent-rose/10" disabled={processing}>
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="p-6 mt-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
            <div>
              <h2 className="text-xl font-bold text-foreground">{t('admin.gestion_roles')}</h2>
              <p className="text-sm text-muted-foreground">{t('admin.gestion_roles_sous_titre')}</p>
            </div>
            <Button variant="outline" onClick={handleAddRole} className="flex items-center gap-2" disabled={processing}>
              <Plus className="w-4 h-4" />
              {t('admin.nouveau_role')}
            </Button>
          </div>
          <div className="border-t border-border mb-4" />
          <div className="flex flex-wrap gap-3">
            {roles.filter(r => r.name !== 'Admin').map(r => (
              <div key={r.name}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-accent ring-1 ring-border hover:ring-primary-200 transition-all">
                <span className="font-medium text-sm text-foreground">{r.name}</span>
                <span className="text-xs text-muted-foreground">({r.count})</span>
                <button onClick={() => handleRenameRole(r.name)}
                  className="text-primary-600 hover:text-primary-800 ml-1 transition-colors disabled:opacity-50" disabled={processing} title={t('common.renommer')}>
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => handleDeleteRole(r.name)}
                  className="text-accent-rose hover:text-accent-rose/80 transition-colors disabled:opacity-50" disabled={processing} title={t('common.supprimer')}>
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-lg">
          {selectedMembre && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-4">
                  {renderAvatar(selectedMembre, "w-16 h-16")}
                  <div>
                    <DialogTitle>{selectedMembre.prenom + " " + selectedMembre.nom}</DialogTitle>
                    <Badge variant="secondary" className={"mt-1 " + getRoleBadge(selectedMembre.role)}>
                      {translateMemberRole(selectedMembre.role)}
                    </Badge>
                  </div>
                </div>
              </DialogHeader>
              <div className="border-t border-border mb-4" />
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-xl ring-1 ring-border">
                  <span className="text-sm font-semibold text-muted-foreground">{t('admin.email')}</span>
                  <span className="text-sm text-foreground">{selectedMembre.email}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-xl ring-1 ring-border">
                  <span className="text-sm font-semibold text-muted-foreground">{t('admin.telephone')}</span>
                  <span className="text-sm text-foreground">{selectedMembre.telephone || t('common.non_renseigne')}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-xl ring-1 ring-border">
                  <span className="text-sm font-semibold text-muted-foreground">{t('admin.statut')}</span>
                  <Badge variant="secondary" className={getStatusBadge(getStatutAffiche(selectedMembre))}>{translateMemberStatus(getStatutAffiche(selectedMembre))}</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-xl ring-1 ring-border">
                  <span className="text-sm font-semibold text-muted-foreground">{t('admin.inscrit_le')}</span>
                  <span className="text-sm text-foreground">{formatDate(selectedMembre.createdAt)}</span>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showEditModal} onOpenChange={(open) => { setShowEditModal(open); if (!open) setPhotoPreview(null); }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          {editForm && selectedMembre && (
            <>
              <DialogHeader>
                <DialogTitle>{t('admin.modifier_membre') + " " + selectedMembre.prenom + " " + selectedMembre.nom}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div className="flex flex-col items-center mb-4">
                  <div className="relative group cursor-pointer" onClick={() => document.getElementById('edit-photo-input').click()}>
                    {photoPreview ? (
                      <img src={photoPreview} alt={t('common.photo')} className="w-24 h-24 rounded-full object-cover ring-2 ring-primary-200" />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-400 to-accent-cyan flex items-center justify-center text-white font-bold text-2xl ring-2 ring-primary-200">
                        {(editForm.prenom?.[0] || "").toUpperCase()}{(editForm.nom?.[0] || "").toUpperCase()}
                      </div>
                    )}
                    <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <input id="edit-photo-input" type="file" accept="image/*" className="hidden" onChange={(e) => handlePhotoChange(e, true)} />
                  <p className="text-xs text-muted-foreground mt-2">{t('admin.changer_photo')}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="block text-sm font-semibold mb-1">{t('admin.nom')}</Label>
                    <Input value={editForm.nom} onChange={e => setEditForm({ ...editForm, nom: e.target.value })} required />
                  </div>
                  <div>
                    <Label className="block text-sm font-semibold mb-1">{t('admin.prenom')}</Label>
                    <Input value={editForm.prenom} onChange={e => setEditForm({ ...editForm, prenom: e.target.value })} required />
                  </div>
                </div>
                <div>
                  <Label className="block text-sm font-semibold mb-1">{t('admin.email')}</Label>
                  <Input type="email" value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })} required />
                </div>
                <div>
                  <Label className="block text-sm font-semibold mb-1">{t('admin.telephone')}</Label>
                  <Input value={editForm.telephone} onChange={e => setEditForm({ ...editForm, telephone: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="block text-sm font-semibold mb-1">{t('admin.table_role')}</Label>
                    <Select value={editForm.role} onValueChange={(value) => setEditForm({ ...editForm, role: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map(r => (
                          <SelectItem key={r.name} value={r.name}>{r.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="block text-sm font-semibold mb-1">{t('admin.table_statut')}</Label>
                    <Select value={editForm.status} onValueChange={(value) => setEditForm({ ...editForm, status: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="actif">{t('common.actifs')}</SelectItem>
                        <SelectItem value="suspendu">{t('common.suspendus')}</SelectItem>
                        <SelectItem value="banni">{t('common.bannis')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={processing}>
                  {t('admin.enregistrer')}
                </Button>
              </form>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showAddModal} onOpenChange={(open) => { setShowAddModal(open); if (!open) setAddPhotoPreview(null); }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('admin.ajouter_membre')}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddSubmit} className="space-y-4">
            <div className="flex flex-col items-center mb-4">
              <div className="relative group cursor-pointer" onClick={() => document.getElementById('add-photo-input').click()}>
                {addPhotoPreview ? (
                  <img src={addPhotoPreview} alt={t('common.photo')} className="w-24 h-24 rounded-full object-cover ring-2 ring-primary-200" />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-accent flex items-center justify-center text-muted-foreground ring-2 ring-border">
                    <Plus className="w-10 h-10" />
                  </div>
                )}
                <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="w-8 h-8 text-white" />
                </div>
              </div>
              <input id="add-photo-input" type="file" accept="image/*" className="hidden" onChange={(e) => handlePhotoChange(e, false)} />
              <p className="text-xs text-muted-foreground mt-2">{t('admin.ajouter_photo')}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="block text-sm font-semibold mb-1">{t('admin.nom')}</Label>
                <Input value={addForm.nom} onChange={e => setAddForm({ ...addForm, nom: e.target.value })} required />
              </div>
              <div>
                <Label className="block text-sm font-semibold mb-1">{t('admin.prenom')}</Label>
                <Input value={addForm.prenom} onChange={e => setAddForm({ ...addForm, prenom: e.target.value })} required />
              </div>
            </div>
            <div>
              <Label className="block text-sm font-semibold mb-1">{t('admin.email')}</Label>
              <Input type="email" value={addForm.email} onChange={e => setAddForm({ ...addForm, email: e.target.value })} required />
            </div>
            <div>
              <Label className="block text-sm font-semibold mb-1">{t('admin.telephone')}</Label>
              <Input value={addForm.telephone} onChange={e => setAddForm({ ...addForm, telephone: e.target.value })} />
            </div>
            <div>
              <Label className="block text-sm font-semibold mb-1">{t('admin.mot_de_passe')}</Label>
              <Input value={addForm.password} onChange={e => setAddForm({ ...addForm, password: e.target.value })} />
              <p className="text-xs text-muted-foreground mt-1">{t('admin.mdp_default')}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="block text-sm font-semibold mb-1">{t('admin.table_role')}</Label>
                <Select value={addForm.role} onValueChange={(value) => setAddForm({ ...addForm, role: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map(r => (
                      <SelectItem key={r.name} value={r.name}>{r.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="block text-sm font-semibold mb-1">{t('admin.table_statut')}</Label>
                <Select value={addForm.status} onValueChange={(value) => setAddForm({ ...addForm, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="actif">{t('common.actifs')}</SelectItem>
                    <SelectItem value="en-attente">{t('common.en_attente')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="block text-sm font-semibold mb-1">{t('admin.profession')}</Label>
              <Select value={addForm.situationProfessionnelle} onValueChange={(value) => setAddForm({ ...addForm, situationProfessionnelle: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Professionnel">{t('members.professionnel')}</SelectItem>
                  <SelectItem value="Etudiant">{t('members.etudiant')}</SelectItem>
                  <SelectItem value="Autre">{t('members.autre')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full" disabled={processing}>
              {t('admin.ajouter')}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default AdminDashboard;
