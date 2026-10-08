import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useI18n } from "../contexts/I18nContext";
import { eventAPI } from "../api/axios";
import toast from "react-hot-toast";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { StatusBadge } from "../components/common/StatusBadge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Skeleton } from "../components/ui/skeleton";
import { Plus, Pencil, Trash2, Calendar, MapPin, Users, X, CheckCircle, Zap, BookOpen, Megaphone, Building, List, Upload, Image as ImageIcon } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

// Les fichiers uploadés sont servis par express.static sur /uploads, et non
// sous /api. Construire l'URL avec API_URL produisait donc un 404 sur l'image.
const MEDIA_URL = API_URL.replace(/\/api\/?$/, "");

const EventsPage = () => {
    const { user } = useAuth();
    // La gestion des événements revient au Président et au Conseiller Média.
    const canManageEvents =
      user?.role === "President" || user?.role === "ConseillerMedia";
    const { t, formatDate } = useI18n();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [pendingFile, setPendingFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);
  const [form, setForm] = useState({
    titre: "",
    type: "Action",
    description: "",
    date: "",
    lieu: "",
    maxParticipants: 0,
    ordreDuJour: "",
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async (options = {}) => {
    const silencieux = options.silencieux === true;
    if (!silencieux) setLoading(true);
    try {
      const response = await eventAPI.getAll();
      setEvents(response.data.data || []);
      return true;
    } catch (error) {
      // Sans cela, un timeout, un 401 et une coupure réseau affichent tous
      // le même "Erreur de chargement", ce qui masque la cause réelle.
      console.error("[EventsPage] chargement des evenements :", error);
      const message =
        error.translatedMessage || error.message || t('events.erreur_chargement');
      // Rafraîchissement après un enregistrement réussi : l'événement est
      // bien saved, seul l'affichage de la liste a échoué.
      toast.error(silencieux ? `${t('events.enregistre_mais_liste')} ${message}` : message);
      return false;
    } finally {
      if (!silencieux) setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      titre: "",
      type: "Action",
      description: "",
      date: "",
      lieu: "",
      maxParticipants: "",
      ordreDuJour: "",
    });
    setEditingEvent(null);
    setPendingFile(null);
    setPreviewUrl(null);
    setShowForm(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    setPendingFile(file);
    if (file && file.type.startsWith('image/')) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0] || null;
    setPendingFile(file);
    if (file && file.type.startsWith('image/')) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const hasFile = pendingFile instanceof File;
      if (hasFile) {
        const fd = new FormData();
        Object.entries(form).forEach(([k, v]) => { if (v !== "" && v !== null && v !== undefined) fd.append(k, v); });
        fd.append('image', pendingFile);
        if (editingEvent) {
          await eventAPI.update(editingEvent._id, fd);
        } else {
          await eventAPI.create(fd);
        }
      } else {
        if (editingEvent) {
          await eventAPI.update(editingEvent._id, form);
        } else {
          await eventAPI.create(form);
        }
      }
      toast.success(editingEvent ? t('events.succes_modification') : t('events.succes_creation'));
      resetForm();
      // Attendu : sinon un échec du rechargement affiche une erreur alors que
      // l'événement a bien été enregistré, et la liste reste obsolète.
      await fetchEvents({ silencieux: true });
    } catch (error) {
      console.error("[EventsPage] enregistrement de l'evenement :", error);
      toast.error(
        error.response?.data?.message ||
          error.translatedMessage ||
          error.message ||
          t('events.erreur_chargement')
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (event) => {
    setEditingEvent(event);
    setForm({
      titre: event.titre,
      type: event.type,
      description: event.description,
      date: event.date.split("T")[0],
      lieu: event.lieu,
      maxParticipants: event.maxParticipants || "",
      ordreDuJour: event.ordreDuJour || "",
    });
    setPendingFile(null);
    setPreviewUrl(null);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('events.confirmer_suppression'))) return;
    setProcessing(true);
    try {
      await eventAPI.delete(id);
      toast.success(t('events.succes_suppression'));
      fetchEvents();
    } catch (error) {
      toast.error(t('events.erreur_chargement'));
    } finally {
      setProcessing(false);
    }
  };

  const handleParticipate = async (id) => {
    setProcessing(true);
    try {
      const response = await eventAPI.participate(id);
      toast.success(response.data.message);
      fetchEvents();
    } catch (error) {
      toast.error(t('events.erreur_chargement'));
    } finally {
      setProcessing(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    setProcessing(true);
    try {
      await eventAPI.updateStatus(id, status);
      toast.success(t('events.succes_statut'));
      fetchEvents();
    } catch (error) {
      toast.error(t('events.erreur_chargement'));
    } finally {
      setProcessing(false);
    }
  };

  const getTypeIconComponent = (type) => {
    const icons = {
      Action: Zap,
      Formation: BookOpen,
      Manifestation: Megaphone,
      "Réunion": Users,
      AGP: Building,
    };
    return icons[type] || List;
  };

  const getTypeLabel = (type) => {
    if (!type) return "";
    const keys = {
      Action: "events.action",
      Formation: "events.formation",
      Manifestation: "events.manifestation",
      "Réunion": "events.reunion",
      Reunion: "events.reunion",
      AGP: "events.agp",
    };
    return keys[type] ? t(keys[type]) : type;
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
        <Card className="p-6 md:p-8 mb-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex flex-wrap justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-primary-100 flex items-center justify-center text-primary-600">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">{t('events.titre')}</h1>
                <p className="text-muted-foreground">{t('events.titre')}</p>
              </div>
            </div>
            {canManageEvents && (
              <Button onClick={() => setShowForm(true)}>
                <Plus className="w-5 h-5 mr-2" />
                {t('events.nouveau')}
              </Button>
            )}
          </div>
        </Card>

        <Dialog open={showForm} onOpenChange={(open) => { if (!open) resetForm(); }}>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingEvent ? t('events.modifier') : t('events.nouveau')}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div
                  className="border-2 border-dashed rounded-xl p-4 text-center cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                >
                  {previewUrl ? (
                    <div className="relative">
                      <img src={previewUrl} alt="Preview" className="max-h-40 mx-auto rounded-lg object-cover" />
                      <Button
                        type="button"
                        size="icon"
                        variant="destructive"
                        className="absolute top-1 right-1 h-6 w-6"
                        onClick={(e) => { e.stopPropagation(); setPendingFile(null); setPreviewUrl(null); }}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">{t('events.glisser_image')}</p>
                      <p className="text-xs text-muted-foreground mt-1">{t('events.formats_image')}</p>
                    </>
                  )}
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                </div>
                <div>
                  <Label>{t('events.titre_label')}</Label>
                  <Input
                    type="text"
                    value={form.titre}
                    onChange={(e) => setForm({ ...form, titre: e.target.value })}
                    required
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label>{t('events.type_label')}</Label>
                  <Select value={form.type} onValueChange={(val) => setForm({ ...form, type: val })}>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Action">{t('events.action')}</SelectItem>
                      <SelectItem value="Formation">{t('events.formation')}</SelectItem>
                      <SelectItem value="Manifestation">{t('events.manifestation')}</SelectItem>
                      <SelectItem value="Réunion">{t('events.reunion')}</SelectItem>
                      <SelectItem value="AGP">{t('events.agp')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{t('events.description')}</Label>
                  <Textarea
                    rows="3"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    required
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label>{t('events.date')}</Label>
                  <Input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    required
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label>{t('events.lieu')}</Label>
                  <Input
                    type="text"
                    value={form.lieu}
                    onChange={(e) => setForm({ ...form, lieu: e.target.value })}
                    required
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label>{t('events.max_participants')}</Label>
                  <Input
                    type="number"
                    value={form.maxParticipants}
                    onChange={(e) => setForm({ ...form, maxParticipants: e.target.value === "" ? "" : Number(e.target.value) })}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label>{t('events.ordre_jour')}</Label>
                  <Textarea
                    rows="3"
                    value={form.ordreDuJour}
                    onChange={(e) => setForm({ ...form, ordreDuJour: e.target.value })}
                    className="mt-1.5"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <Button type="button" variant="outline" onClick={resetForm}>
                  {t('common.annuler')}
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? t('common.chargement') : t('common.enregistrer')}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        <div className="grid gap-4">
          {events.length === 0 ? (
            <Card className="p-12 text-center animate-in fade-in duration-300">
              <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">{t('events.aucun')}</p>
            </Card>
          ) : (
            events.map((event) => {
              const TypeIcon = getTypeIconComponent(event.type);
              const isParticipant = event.participants?.some(p => p._id === user?._id);
              const imageUrl = event.image && event.image !== 'default-event.jpg'
                ? (String(event.image).startsWith('http') ? event.image : MEDIA_URL + "/" + String(event.image).replace(/^\/+/, ""))
                : null;
              return (
                <Card key={event._id} className="hover:shadow-md transition-shadow p-6 animate-in fade-in duration-300">
                  <div className="flex flex-wrap justify-between items-start gap-4">
                    <div className="flex gap-3 flex-1 min-w-0">
                      {imageUrl ? (
                        <img src={imageUrl} alt={event.titre} className="w-14 h-14 rounded-xl object-cover shrink-0" />
                      ) : (
                        <div className="w-14 h-14 rounded-xl bg-primary-100 flex items-center justify-center text-primary-600 shrink-0">
                          <TypeIcon className="w-7 h-7" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-lg font-semibold text-foreground">{event.titre}</h3>
                          <StatusBadge status={event.status} module="event" />
                        </div>
                        <p className="text-muted-foreground mt-1.5">{event.description}</p>
                        <div className="flex flex-wrap gap-4 mt-2.5 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1.5 font-medium text-primary-600">
                            <TypeIcon className="w-4 h-4" />
                            {getTypeLabel(event.type)}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4" />
                            {formatDate(event.date)}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <MapPin className="w-4 h-4" />
                            {event.lieu}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Users className="w-4 h-4" />
                            {event.participants?.length || 0} {t('events.inscrits')}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 shrink-0">
                      {event.status !== "terminee" && event.status !== "annulee" && (
                        <Button
                          size="sm"
                          variant={isParticipant ? "destructive" : undefined}
                          className={isParticipant ? "" : "bg-emerald-600 text-white hover:bg-emerald-700"}
                          disabled={processing}
                          onClick={() => handleParticipate(event._id)}
                        >
                          {isParticipant ? <X className="w-4 h-4 mr-1" /> : <CheckCircle className="w-4 h-4 mr-1" />}
                          {isParticipant ? t('events.se_desinscrire') : t('events.participer')}
                        </Button>
                      )}
                      {canManageEvents && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            className="bg-amber-500 text-white hover:bg-amber-600 border-amber-500"
                            disabled={processing}
                            onClick={() => handleEdit(event)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            disabled={processing}
                            onClick={() => handleDelete(event._id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                          <Select disabled={processing} value={event.status} onValueChange={(val) => handleStatusChange(event._id, val)}>
                            <SelectTrigger className="w-32 h-9 text-sm">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="planifiée">{t('events.planifiee')}</SelectItem>
                              <SelectItem value="en-cours">{t('events.en_cours')}</SelectItem>
                              <SelectItem value="terminée">{t('events.terminee')}</SelectItem>
                              <SelectItem value="reportée">{t('events.reportee')}</SelectItem>
                              <SelectItem value="annulée">{t('events.annulee')}</SelectItem>
                            </SelectContent>
                          </Select>
                        </>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default EventsPage;
