import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { newsAPI } from "../api/axios";
import toast from "react-hot-toast";
import { useI18n } from "../contexts/I18nContext";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Skeleton } from "../components/ui/skeleton";
import { Plus, Ban, FileText, Check, Pencil, Trash2, Loader2 } from "lucide-react";

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
  // Le serveur plafonne a 20 par page et renvoie page/totalPages : sans etat
  // local, tout ce qui est au-dela de la premiere page reste inatteignable.
  var _pageState = useState(1);
  var page = _pageState[0];
  var setPage = _pageState[1];
  var _totalPagesState = useState(1);
  var totalPages = _totalPagesState[0];
  var setTotalPages = _totalPagesState[1];

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
    setShowForm(false);
  };

  var handleSubmit = async function (e) {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingNews) {
        await newsAPI.update(editingNews._id, form);
        toast.success(t("news.succes_modifier"));
      } else {
        await newsAPI.create(form);
        toast.success(t("news.succes_creer"));
      }
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
    setForm({
      titre: item.titre || "",
      contenu: item.contenu || "",
      category: item.category || "General",
      image: item.image || "",
      status: item.status || "brouillon",
    });
    setShowForm(true);
  };

  var handleDelete = async function (id) {
    if (!window.confirm(t("news.supprimer_confirm"))) return;
    try {
      await newsAPI.delete(id);
      toast.success(t("news.succes_supprimer"));
      fetchNews(page);
    } catch (error) {
      toast.error(error.response?.data?.message || error.translatedMessage || t("common.erreur"));
    }
  };

  var handlePublish = async function (id) {
    try {
      await newsAPI.publish(id);
      toast.success(t("news.succes_publier"));
      fetchNews(page);
    } catch (error) {
      toast.error(error.response?.data?.message || error.translatedMessage || t("common.erreur"));
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
                  <Input
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
                    placeholder={t("news.image_placeholder")}
                  />
                </div>
                <div>
                  <Label>{t("news.statut_label")}</Label>
                  <Select
                    value={form.status}
                    onValueChange={function (val) {
                      setForm({
                        titre: form.titre,
                        contenu: form.contenu,
                        category: form.category,
                        image: form.image,
                        status: val,
                      });
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="publi\u00e9e">{t("news.publiee")}</SelectItem>
                      <SelectItem value="brouillon">{t("news.brouillon")}</SelectItem>
                    </SelectContent>
                  </Select>
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
                          <Badge
                            className={
                              "text-xs " +
                              (status === "publi\u00e9e"
                                ? "bg-emerald-100 text-emerald-700 dark:text-emerald-300"
                                : "bg-amber-100 text-amber-700 dark:text-amber-300")
                            }
                          >
                            {status === "publi\u00e9e"
                              ? t("news.publiee")
                              : t("news.brouillon")}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-sm text-surface-500">
                          {formatDate(date)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex justify-center gap-1.5">
                            {status !== "publi\u00e9e" && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={function () { handlePublish(id); }}
                                title={t("news.publier")}
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
