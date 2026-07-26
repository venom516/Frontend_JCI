import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useI18n } from "../contexts/I18nContext";
import { eventAPI } from "../api/axios";
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
import { Plus, Pencil, Trash2, Calendar, MapPin, Users, X, CheckCircle, Zap, BookOpen, Megaphone, Building, List } from "lucide-react";

const EventsPage = () => {
  const { user, isPresident } = useAuth();
  const { t, formatDate, translateStatus } = useI18n();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
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

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const response = await eventAPI.getAll();
      setEvents(response.data.data || []);
    } catch (error) {
      toast.error(t('events.erreur_chargement'));
    } finally {
      setLoading(false);
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
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingEvent) {
        await eventAPI.update(editingEvent._id, form);
        toast.success(t('events.succes_modification'));
      } else {
        await eventAPI.create(form);
        toast.success(t('events.succes_creation'));
      }
      resetForm();
      fetchEvents();
    } catch (error) {
      toast.error(error.response?.data?.message || t('events.erreur_chargement'));
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
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('events.confirmer_suppression'))) return;
    try {
      await eventAPI.delete(id);
      toast.success(t('events.succes_suppression'));
      fetchEvents();
    } catch (error) {
      toast.error(t('events.erreur_chargement'));
    }
  };

  const handleParticipate = async (id) => {
    try {
      const response = await eventAPI.participate(id);
      toast.success(response.data.message);
      fetchEvents();
    } catch (error) {
      toast.error(t('events.erreur_chargement'));
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await eventAPI.updateStatus(id, status);
      toast.success(t('events.succes_statut'));
      fetchEvents();
    } catch (error) {
      toast.error(t('events.erreur_chargement'));
    }
  };

  const getStatusBadgeClass = (status) => {
    const classes = {
      "planifiée": "bg-blue-100 text-blue-800 hover:bg-blue-100",
      "en-cours": "bg-amber-100 text-amber-800 hover:bg-amber-100",
      "terminée": "bg-emerald-100 text-emerald-800 hover:bg-emerald-100",
      "reportée": "bg-amber-100 text-amber-800 hover:bg-amber-100",
      "annulée": "bg-red-100 text-red-800 hover:bg-red-100",
    };
    return classes[status] || "";
  };

  const getTypeIconComponent = (type) => {
    const icons = {
      Action: Zap,
      Formation: BookOpen,
      Manifestation: Megaphone,
      Reunion: Users,
      AGP: Building,
    };
    return icons[type] || List;
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
            {isPresident && (
              <Button onClick={() => setShowForm(true)}>
                <Plus className="w-5 h-5 mr-2" />
                {t('events.nouveau')}
              </Button>
            )}
          </div>
        </Card>

        <Dialog open={showForm} onOpenChange={(open) => { if (!open) resetForm(); }}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingEvent ? t('events.modifier') : t('events.nouveau')}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
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
              return (
                <Card key={event._id} className="hover:shadow-md transition-shadow p-6 animate-in fade-in duration-300">
                  <div className="flex flex-wrap justify-between items-start gap-4">
                    <div className="flex gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center text-primary-600 shrink-0 mt-0.5">
                        <TypeIcon className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-lg font-semibold text-foreground">{event.titre}</h3>
                          <Badge className={getStatusBadgeClass(event.status)}>
                            {translateStatus(event.status)}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground mt-1.5">{event.description}</p>
                        <div className="flex flex-wrap gap-4 mt-2.5 text-sm text-muted-foreground">
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
                          onClick={() => handleParticipate(event._id)}
                        >
                          {isParticipant ? <X className="w-4 h-4 mr-1" /> : <CheckCircle className="w-4 h-4 mr-1" />}
                          {isParticipant ? t('events.se_desinscrire') : t('events.participer')}
                        </Button>
                      )}
                      {isPresident && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            className="bg-amber-500 text-white hover:bg-amber-600 border-amber-500"
                            onClick={() => handleEdit(event)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(event._id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                          <Select value={event.status} onValueChange={(val) => handleStatusChange(event._id, val)}>
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
