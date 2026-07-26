import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useI18n } from "../contexts/I18nContext";
import { publicationAPI } from "../api/axios";
import toast from "react-hot-toast";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Skeleton } from "../components/ui/skeleton";
import {
  Plus,
  Eye,
  Heart,
  Share2,
  FileText,
  Loader2,
  Image,
  Video,
  Smartphone,
  Inbox,
} from "lucide-react";

var API_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace("/api", "")
  : "http://localhost:5000";

var statusBadgeClass = {
  "\u00e9cr\u00e9\u00e9e": "bg-blue-100 text-blue-700 border-blue-200",
  "en-attente": "bg-amber-100 text-amber-700 border-amber-200",
  "publi\u00e9e": "bg-emerald-100 text-emerald-700 border-emerald-200",
  "archiv\u00e9e": "bg-rose-100 text-rose-700 border-rose-200",
};

var typeIconComponents = {
  Photo: <Image className="w-3 h-3" />,
  "Vid\u00e9o": <Video className="w-3 h-3" />,
  Story: <Smartphone className="w-3 h-3" />,
};



var PublicationsPage = function () {
  var auth = useAuth();
  var user = auth.user;
  var isMedia = auth.isMedia;
  var isPresident = auth.isPresident;
  var i18n = useI18n();
  var t = i18n.t;
  var _publicationsState = useState([]);
  var publications = _publicationsState[0];
  var setPublications = _publicationsState[1];
  var _loadingState = useState(true);
  var loading = _loadingState[0];
  var setLoading = _loadingState[1];
  var _showModalState = useState(false);
  var showModal = _showModalState[0];
  var setShowModal = _showModalState[1];
  var _editItemState = useState(null);
  var editItem = _editItemState[0];
  var setEditItem = _editItemState[1];
  var _formState = useState({
    titre: "",
    caption: "",
    type: "Photo",
    fichier: null,
    date: "",
  });
  var form = _formState[0];
  var setForm = _formState[1];
  var _submittingState = useState(false);
  var submitting = _submittingState[0];
  var setSubmitting = _submittingState[1];

  var fetchPublications = async function () {
    try {
      var res = await publicationAPI.getAll({ limit: 50 });
      setPublications((res.data && res.data.data) || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(function () {
    fetchPublications();
  }, []);



  var openCreate = function () {
    setEditItem(null);
    setForm({
      titre: "",
      caption: "",
      type: "Photo",
      fichier: null,
      date: "",
    });
    setShowModal(true);
  };

  var openEdit = function (pub) {
    setEditItem(pub);
    setForm({
      titre: pub.titre,
      caption: pub.caption || "",
      type: pub.type,
      fichier: null,
      date: pub.date ? pub.date.split("T")[0] : "",
    });
    setShowModal(true);
  };

  var handleSubmit = async function (e) {
    e.preventDefault();
    if (!form.titre) return toast.error(t("publications.titre_requis"));
    if (!editItem && !form.fichier)
      return toast.error(t("publications.erreur_fichier"));
    setSubmitting(true);
    try {
      var fd = new FormData();
      fd.append("titre", form.titre);
      fd.append("caption", form.caption);
      fd.append("type", form.type);
      if (form.date) fd.append("date", form.date);
      if (form.fichier) fd.append("fichier", form.fichier);

      if (editItem) {
        await publicationAPI.update(editItem._id, fd);
        toast.success(t("publications.succes_modifier"));
      } else {
        await publicationAPI.create(fd);
        toast.success(t("publications.succes_creer"));
      }
      setShowModal(false);
      setLoading(true);
      fetchPublications();
    } catch (err) {
      toast.error(
        (err.response && err.response.data && err.response.data.message) ||
          t("publications.erreur")
      );
    } finally {
      setSubmitting(false);
    }
  };

  var handlePublish = async function (id) {
    try {
      await publicationAPI.publish(id);
      toast.success(t("publications.succes_publier"));
      setLoading(true);
      fetchPublications();
    } catch (err) {
      toast.error(
        (err.response && err.response.data && err.response.data.message) ||
          t("publications.erreur")
      );
    }
  };

  var handleArchive = async function (id) {
    try {
      await publicationAPI.archive(id);
      toast.success(t("publications.succes_archiver"));
      setLoading(true);
      fetchPublications();
    } catch (err) {
      toast.error(
        (err.response && err.response.data && err.response.data.message) ||
          t("publications.erreur")
      );
    }
  };

  var handleDelete = async function (id) {
    if (!window.confirm(t("publications.supprimer_confirm"))) return;
    try {
      await publicationAPI.delete(id);
      toast.success(t("publications.succes_supprimer"));
      setLoading(true);
      fetchPublications();
    } catch (err) {
      toast.error(
        (err.response && err.response.data && err.response.data.message) ||
          t("publications.erreur")
      );
    }
  };

  var stats = {
    total: publications.length,
    cr\u00e9es: publications.filter(function (p) {
      return p.status === "\u00e9cr\u00e9\u00e9e" || p.status === "en-attente";
    }).length,
    publi\u00e9es: publications.filter(function (p) {
      return p.status === "publi\u00e9e";
    }).length,
    archiv\u00e9es: publications.filter(function (p) {
      return p.status === "archiv\u00e9e";
    }).length,
  };



  if (!isMedia && !isPresident) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50/80">
        <Card className="p-8 text-center animate-fade-in-up">
          <h2 className="font-display text-xl font-semibold text-accent-rose mb-2">
            {t("publications.acces_refuse")}
          </h2>
          <p className="text-surface-500">{t("publications.acces_texte")}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-50/80 pb-12">
      <div className="page-container max-w-6xl">
        <Card className="card-glass p-6 md:p-8 mb-6 animate-fade-in-up">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="font-display text-3xl font-bold text-surface-900">
                {t("publications.titre")}
              </h1>
              <p className="text-surface-500 mt-1">
                {t("publications.sous_titre")}
              </p>
            </div>
            <Button onClick={openCreate} className="shrink-0">
              <Plus className="w-4 h-4 mr-2" />
              {t("publications.nouvelle")}
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
            {[
              { label: t("publications.stat_total"), value: stats.total, color: "text-primary-600" },
              { label: t("publications.stat_creees"), value: stats.cr\u00e9es, color: "text-amber-600" },
              { label: t("publications.publiee"), value: stats.publi\u00e9es, color: "text-emerald-600" },
              { label: t("publications.stat_archivees"), value: stats.archiv\u00e9es, color: "text-rose-600" },
            ].map(function (s) {
              return (
                <Card key={s.label} className="bg-white/60 p-3 text-center backdrop-blur-sm border-white/40">
                  <div className={"text-2xl font-bold font-display " + s.color}>
                    {s.value}
                  </div>
                  <div className="text-xs text-surface-500 mt-0.5">{s.label}</div>
                </Card>
              );
            })}
          </div>
        </Card>



        <>
            {loading ? (
              <div className="grid md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map(function (i) {
                  return (
                    <Card key={i} className="card-glass p-5">
                      <div className="flex gap-4">
                        <Skeleton className="w-20 h-20 rounded-xl" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-3 w-1/2" />
                          <Skeleton className="h-3 w-1/3" />
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            ) : publications.length === 0 ? (
              <Card className="card-glass p-12 text-center animate-fade-in-up">
                <Inbox className="w-12 h-12 mx-auto mb-4 text-surface-400" />
                <p className="text-surface-500 text-lg">{t("publications.aucune")}</p>
                <Button onClick={openCreate} className="mt-4">
                  {t("publications.nouvelle")}
                </Button>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {publications.map(function (pub) {
                  return (
                    <Card key={pub._id} className="card-glass p-5 hover:shadow-lg transition-all animate-fade-in-up">
                      <div className="flex gap-4">
                        <div className="w-20 h-20 rounded-xl overflow-hidden bg-surface-100 shrink-0 flex items-center justify-center">
                          {pub.fichier &&
                          pub.fichier.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                            <img
                              src={pub.fichier.startsWith("http") ? pub.fichier : API_URL + pub.fichier}
                              alt={pub.titre}
                              className="w-full h-full object-cover"
                            />
                          ) : pub.fichier &&
                            pub.fichier.match(/\.(mp4|mov|webm)$/i) ? (
                            <Video className="w-6 h-6 text-surface-400" />
                          ) : (
                            <FileText className="w-6 h-6 text-surface-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-display font-semibold text-surface-900 truncate">
                              {pub.titre}
                            </h3>
                            <Badge
                              className={
                                "shrink-0 " +
                                (statusBadgeClass[pub.status] || "bg-blue-100 text-blue-700")
                              }
                            >
                              {t(
                                "publications." +
                                  (pub.status === "\u00e9cr\u00e9\u00e9e"
                                    ? "stat_creees"
                                    : pub.status === "archiv\u00e9e"
                                    ? "stat_archivees"
                                    : pub.status === "publi\u00e9e"
                                    ? "publiee"
                                    : pub.status === "en-attente"
                                    ? "en_attente"
                                    : pub.status)
                              ) || pub.status}
                            </Badge>
                          </div>
                          {pub.caption && (
                            <p className="text-sm text-surface-500 mt-1 line-clamp-2">
                              {pub.caption}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-2 text-xs text-surface-400">
                            <span className="flex items-center gap-1">
                              {typeIconComponents[pub.type] || <FileText className="w-3 h-3" />}{" "}
                              {pub.type}
                            </span>
                            <span>\u2022</span>
                            <span>
                              {new Date(pub.date || pub.createdAt).toLocaleDateString()}
                            </span>
                          </div>

                          {pub.stats &&
                            (pub.stats.views || pub.stats.likes) && (
                              <div className="flex gap-3 mt-2 text-xs text-surface-400">
                                {pub.stats.views > 0 && (
                                  <span className="flex items-center gap-1">
                                    <Eye className="w-3 h-3" /> {pub.stats.views}
                                  </span>
                                )}
                                {pub.stats.likes > 0 && (
                                  <span className="flex items-center gap-1">
                                    <Heart className="w-3 h-3" /> {pub.stats.likes}
                                  </span>
                                )}
                                {pub.stats.shares > 0 && (
                                  <span className="flex items-center gap-1">
                                    <Share2 className="w-3 h-3" /> {pub.stats.shares}
                                  </span>
                                )}
                              </div>
                            )}
                          <div className="flex gap-1.5 mt-3 flex-wrap">
                            {pub.status !== "publi\u00e9e" && (
                              <Button
                                size="sm"
                                onClick={function () { handlePublish(pub._id); }}
                                className="bg-emerald-600 hover:bg-emerald-700 text-xs px-3 py-1.5"
                              >
                                {t("publications.publier")}
                              </Button>
                            )}
                            {pub.status !== "archiv\u00e9e" && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={function () { handleArchive(pub._id); }}
                                className="text-xs px-3 py-1.5"
                              >
                                {t("publications.archiver")}
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={function () { openEdit(pub); }}
                              className="text-xs px-3 py-1.5"
                            >
                              {t("common.modifier")}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={function () { handleDelete(pub._id); }}
                              className="text-xs px-3 py-1.5 text-red-500 hover:bg-red-50 hover:text-red-600"
                            >
                              {t("common.supprimer")}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </>

        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editItem
                  ? t("publications.modifier_titre")
                  : t("publications.nouvelle")}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>
                  {t("publications.titre_label")} *
                </Label>
                <Input
                  value={form.titre}
                  onChange={function (e) {
                    setForm(function (f) {
                      return { titre: e.target.value, caption: f.caption, type: f.type, fichier: f.fichier, date: f.date };
                    });
                  }}
                  required
                />
              </div>
              <div>
                <Label>{t("publications.contenu")}</Label>
                <Textarea
                  className="resize-none"
                  rows={3}
                  value={form.caption}
                  onChange={function (e) {
                    setForm(function (f) {
                      return { titre: f.titre, caption: e.target.value, type: f.type, fichier: f.fichier, date: f.date };
                    });
                  }}
                />
              </div>
              <div>
                <Label>{t("publications.type_label")}</Label>
                <Select
                  value={form.type}
                  onValueChange={function (val) {
                    setForm(function (f) {
                      return { titre: f.titre, caption: f.caption, type: val, fichier: f.fichier, date: f.date };
                    });
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Photo">{t("publications.type_photo")}</SelectItem>
                    <SelectItem value="Story">{t("publications.type_story")}</SelectItem>
                    <SelectItem value="Vid\u00e9o">{t("publications.type_video")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{t("publications.image")}</Label>
                <Input
                  type="file"
                  className="file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                  onChange={function (e) {
                    setForm(function (f) {
                      return { titre: f.titre, caption: f.caption, type: f.type, fichier: e.target.files[0], date: f.date };
                    });
                  }}
                  accept="image/*,video/*,.pdf,.doc,.docx"
                />
                {editItem && !form.fichier && (
                  <p className="text-xs text-surface-400 mt-1">
                    {t("publications.fichier_actuel_hint")}
                  </p>
                )}
              </div>
              <div>
                <Label>{t("publications.date_publication")}</Label>
                <Input
                  type="date"
                  value={form.date}
                  onChange={function (e) {
                    setForm(function (f) {
                      return { titre: f.titre, caption: f.caption, type: f.type, fichier: f.fichier, date: e.target.value };
                    });
                  }}
                />
                <p className="text-xs text-surface-400 mt-1">
                  {t("publications.date_futur_hint")}
                </p>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={submitting}>
                  {submitting && (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  )}
                  {submitting
                    ? t("publications.chargement")
                    : editItem
                    ? t("site_config.save")
                    : t("publications.nouvelle")}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={function () { setShowModal(false); }}
                >
                  {t("common.annuler")}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default PublicationsPage;
