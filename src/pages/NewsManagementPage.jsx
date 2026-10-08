import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import { newsAPI } from "../api/axios";
import toast from "react-hot-toast";
import { useI18n } from "../contexts/I18nContext";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { StatusBadge } from "../components/common/StatusBadge";
import { resolveImage } from "../utils/image";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Skeleton } from "../components/ui/skeleton";
import { Plus, Ban, FileText, Check, Pencil, Trash2, Loader2, X, Upload } from "lucide-react";
import { notifyNewsChanged } from "../utils/newsEvents";

var NewsManagementPage = function () {
  var auth = useAuth();
  var isPresident = auth.isPresident;
  var isMedia = auth.isMedia;
  var i18n = useI18n();
  var t = i18n.t;
  var formatDate = i18n.formatDate;
  var _newsState = useState([]);
  var news = _newsState[0];
  var setNews = _newsState[1];
  var _loadingState = useState(true);
  var loading = _loadingState[0];
  var setLoading = _loadingState[1];
  var _showFormState = useState(false);
  var showForm = _showFormState[0];
  var setShowForm = _showFormState[1];
  var _editingNewsState = useState(null);
  var editingNews = _editingNewsState[0];
  var setEditingNews = _editingNewsState[1];
  var _formState = useState({
    titre: "",
    contenu: "",
    category: "General",
    image: "",
    status: "brouillon",
  });
  var form = _formState[0];
  var setForm = _formState[1];
<<<<<<< HEAD
  var _processingState = useState(false);
  var processing = _processingState[0];
  var setProcessing = _processingState[1];
  var _pendingFileState = useState(null);
  var pendingFile = _pendingFileState[0];
  var setPendingFile = _pendingFileState[1];
  var _previewUrlState = useState(null);
  var [choix, setChoix] = useState("url");
  var previewUrl = _previewUrlState[0];
  var setPreviewUrl = _previewUrlState[1];
  var fileInputRef = useRef(null);
=======
  // Le serveur plafonne a 20 par page et renvoie page/totalPages : sans etat
  // local, tout ce qui est au-dela de la premiere page reste inatteignable.
  var _pageState = useState(1);
  var page = _pageState[0];
  var setPage = _pageState[1];
  var _totalPagesState = useState(1);
  var totalPages = _totalPagesState[0];
  var setTotalPages = _totalPagesState[1];
>>>>>>> 47883136c2fca296e3dcd5a33f1106ec0316b78a

  var canManage = isPresident || isMedia;

  useEffect(function () {
    fetchNews(1);
  }, []);

  var fetchNews = async function (pageNumber) {
    var courante = pageNumber || 1;
    setLoading(true);
    try {
      var response = await newsAPI.getAll({ page: courante, limit: 20 });
      setNews((response.data && response.data.data) || []);
      setTotalPages((response.data && response.data.totalPages) || 1);
      setPage((response.data && response.data.page) || courante);
    } catch (error) {
      console.error(t("common.erreur"), error);
      toast.error(error.response?.data?.message || error.translatedMessage || t("home.erreur_chargement"));
    } finally {
      setLoading(false);
    }
  };

  var resetForm = function () {
    setForm({
      titre: "",
      contenu: "",
      category: "General",
      image: "",
      status: "brouillon",
    });
    setEditingNews(null);
    setPendingFile(null);
    setPreviewUrl(null);
    setShowForm(false);
  };

  var handleFileChange = function (e) {
    var file = e.target.files && e.target.files[0] ? e.target.files[0] : null;
    setPendingFile(file);
    if (file && file.type.startsWith("image/")) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl(null);
    }
  };

  var handleDrop = function (e) {
    e.preventDefault();
    var file = e.dataTransfer.files && e.dataTransfer.files[0] ? e.dataTransfer.files[0] : null;
    setPendingFile(file);
    if (file && file.type.startsWith("image/")) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl(null);
    }
  };

  var handleSubmit = async function (e) {
    e.preventDefault();
    setLoading(true);

    try {
      var hasFile = pendingFile instanceof File;
      var hasUrl = form.image && form.image.trim() !== "";
      if (hasFile) {
        var fd = new FormData();
        Object.entries(form).forEach(function (entry) {
          var k = entry[0];
          var v = entry[1];
          if (editingNews && k === "status") return;
          if (v !== "" && v !== null && v !== undefined && k !== "image") fd.append(k, v);
        });
        fd.append("image", pendingFile);
        if (editingNews) {
          await newsAPI.update(editingNews._id, fd);
        } else {
          await newsAPI.create(fd);
        }
      } else if (editingNews) {
      const formSansStatut2 = {};
      Object.entries(form).forEach(function (entry) {
        var k = entry[0]; var v = entry[1];
        if (k === "status") return;
        formSansStatut2[k] = v;
      });
      await newsAPI.update(editingNews._id, formSansStatut2);
} else {
        await newsAPI.create(form);
      }
      toast.success(editingNews ? t("news.succes_modifier") : t("news.succes_creer"));
      notifyNewsChanged();
      resetForm();
      fetchNews(page);
    } catch (error) {
      console.error("Erreur:", error);
      toast.error(
        (error.response && error.response.data && error.response.data.message) ||
        t("common.erreur")
      );
    } finally {
      setLoading(false);
    }
  };

  var handleEdit = function (item) {
    setEditingNews(item);
    // Une image de remplacement (default-news.jpg) n'est pas une vraie URL :
    // on la laisse vide pour ne pas l'envoyer comme source a retraiter.
    const storedImage = item.image || "";
    const isPlaceholder = !storedImage || /^default-(news|event)\.jpg$/i.test(storedImage);
    setForm({
      titre: item.titre || "",
      contenu: item.contenu || "",
      category: item.category || "General",
      image: isPlaceholder ? "" : storedImage,
      status: item.status || "brouillon",
    });
    const img = isPlaceholder ? "" : storedImage;
    if (img && img.startsWith("http")) {
      setPreviewUrl(resolveImage ? resolveImage(img) : img);
    } else if (img) {
      const API_URL = import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5001";
      setPreviewUrl(API_URL + img);
    } else {
      setPreviewUrl(null);
    }
    setPendingFile(null);
    setShowForm(true);
  };

  var handleDelete = async function (id) {
    if (!window.confirm(t("news.supprimer_confirm"))) return;
    try {
      await newsAPI.delete(id);
      toast.success(t("news.succes_supprimer"));
<<<<<<< HEAD
      notifyNewsChanged();
      fetchNews();
=======
      fetchNews(page);
>>>>>>> 47883136c2fca296e3dcd5a33f1106ec0316b78a
    } catch (error) {
      toast.error(error.response?.data?.message || error.translatedMessage || t("common.erreur"));
    }
  };

  var handlePublish = async function (id) {
    if (processing) return;
    setProcessing(true);
    try {
      await newsAPI.publish(id);
      toast.success(t("news.succes_publier"));
<<<<<<< HEAD
      notifyNewsChanged();
      fetchNews();
    } catch (error) {
      toast.error(error.response?.data?.message || t("common.erreur"));
    } finally {
      setProcessing(false);
=======
      fetchNews(page);
    } catch (error) {
      toast.error(error.response?.data?.message || error.translatedMessage || t("common.erreur"));
>>>>>>> 47883136c2fca296e3dcd5a33f1106ec0316b78a
    }
  };

  var categories = [
    "General",
    "Evenement",
    "Formation",
    "Entrepreneuriat",
    "Communaute",
    "Projet",
    "Partenaire",
  ];

  if (!canManage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50/80">
        <Card className="p-8 text-center animate-fade-in-up">
          <Ban className="w-16 h-16 mx-auto mb-4 text-accent-rose" />
          <h2 className="font-display text-2xl font-bold text-accent-rose mb-2">
            {t("news.acces_refuse")}
          </h2>
          <p className="text-surface-500">{t("news.acces_texte")}</p>
        </Card>
      </div>
    );
  }

  if (loading)
    return (
      <div className="min-h-screen bg-surface-50/80">
        <div className="page-container">
          <Skeleton className="h-24 w-full mb-8 rounded-xl" />
          <Skeleton className="h-96 w-full rounded-xl" />
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-surface-50/80">
      <div className="page-container">
        <Card className="card-glass p-6 md:p-8 mb-8 flex flex-wrap justify-between items-center animate-fade-in-up">
          <div>
            <h1 className="font-display text-3xl font-bold text-surface-900">
              {t("news.gestion_titre")}
            </h1>
            <p className="text-surface-500">{t("news.sous_titre")}</p>
          </div>
          <Button
            onClick={function () {
              resetForm();
              setShowForm(true);
            }}
          >
            <Plus className="w-4 h-4 mr-1.5" />
            {t("news.nouvelle")}
          </Button>
        </Card>

        <Dialog open={showForm} onOpenChange={function (open) { if (!open) resetForm(); }}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingNews ? t("news.modifier") : t("news.nouvelle")}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <Label>{t("news.titre_label")}</Label>
                  <Input
                    type="text"
                    value={form.titre}
                    onChange={function (e) {
                      setForm({
                        titre: e.target.value,
                        contenu: form.contenu,
                        category: form.category,
                        image: form.image,
                        status: form.status,
                      });
                    }}
                    required
                  />
                </div>
                <div>
                  <Label>{t("news.contenu")}</Label>
                  <Textarea
                    rows="5"
                    className="resize-none"
                    value={form.contenu}
                    onChange={function (e) {
                      setForm({
                        titre: form.titre,
                        contenu: e.target.value,
                        category: form.category,
                        image: form.image,
                        status: form.status,
                      });
                    }}
                    required
                  />
                </div>
                <div>
                  <Label>{t("news.categorie")}</Label>
                  <Select
                    value={form.category}
                    onValueChange={function (val) {
                      setForm({
                        titre: form.titre,
                        contenu: form.contenu,
                        category: val,
                        image: form.image,
                        status: form.status,
                      });
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(function (cat) {
                        return (
                          <SelectItem key={cat} value={cat}>
                            {t("news.categorie_" + cat.toLowerCase())}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{t("news.image")}</Label>
                  <Select
                    value={choix}
                    onValueChange={function (val) {
                      setChoix(val);
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem key={"url"} value={"url"}>
                        URL
                      </SelectItem>
                      <SelectItem key={"image"} value={"image"}>
                        Image
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {choix === "image" ? (
                  <div
                    className="border-2 border-dashed rounded-xl p-4 text-center cursor-pointer hover:border-primary/50 transition-colors mt-1.5"
                    onClick={function () { fileInputRef.current && fileInputRef.current.click(); }}
                    onDragOver={function (e) { e.preventDefault(); }}
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
                          onClick={function (e) { e.stopPropagation(); setPendingFile(null); setPreviewUrl(null); }}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">{t("news.glisser_image")}</p>
                        <p className="text-xs text-muted-foreground mt-1">{t("news.formats_image")}</p>
                      </>
                    )}
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                  </div>)
                  :<Input
                    type="url"
                    value={form.image}
                    onChange={function (e) {
                      setForm({
                        titre: form.titre,
                        contenu: form.contenu,
                        category: form.category,
                        image: e.target.value,
                        status: form.status,
                      });
                    }}
                    placeholder={t("news.image_placeholder") || "https://..."}
                    className="mt-2"
                  />}
                </div>
<div>
                  <Label>{t("news.statut_label")}</Label>
                  <Input value={form.status} disabled readOnly className="mt-2 bg-muted/50" />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={resetForm}>
                  {t("common.annuler")}
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                  {loading ? t("news.chargement") : t("common.enregistrer")}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <Card className="overflow-hidden shadow-lg animate-fade-in">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-primary-600 to-primary-500 text-white">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    {t("news.titre")}
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    {t("news.table_categorie")}
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    {t("news.table_statut")}
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    {t("news.table_date")}
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold">
                    {t("news.table_actions")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {news.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-12 text-surface-400">
                      <FileText className="w-12 h-12 mx-auto mb-3 text-surface-300" />
                      {t("news.aucune")}
                    </td>
                  </tr>
                ) : (
                  news.map(function (item, index) {
                    var title = item.title || item.titre || t("news.sans_titre");
                    var category = item.category || "General";
                    var status = item.status || "brouillon";
                    var date = item.createdAt || item.date || new Date();
                    var id = item._id || item.id;

                    return (
                      <tr
                        key={id}
                        className={
                          (index % 2 === 0 ? "bg-surface-50/30" : "bg-white dark:bg-gray-800") +
                          " hover:bg-primary-50/30 transition-colors"
                        }
                      >
                        <td className="px-4 py-3 text-sm font-medium text-surface-800">
                          {title}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <Badge className="bg-primary-100 text-primary-700 dark:text-primary-400 text-xs">
                            {t("news.categorie_" + (category || "General").toLowerCase())}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <StatusBadge status={status} module="news" />
                        </td>
                        <td className="px-4 py-3 text-sm text-surface-500">
                          {formatDate(date)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex justify-center gap-1.5">
                            {status === "brouillon" && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={function () { handlePublish(id); }}
                                title={t("news.publier")}
                                disabled={processing}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white h-8 w-8 p-0"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={function () { handleEdit(item); }}
                              title={t("common.modifier")}
                              className="h-8 w-8 p-0"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={function () { handleDelete(id); }}
                              title={t("common.supprimer")}
                              className="h-8 w-8 p-0"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4">
            <span className="text-sm text-surface-500">
              {page} / {totalPages}
            </span>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={function () { fetchNews(page - 1); }}
              >
                {t("common.precedent")}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={function () { fetchNews(page + 1); }}
              >
                {t("common.suivant")}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsManagementPage;
