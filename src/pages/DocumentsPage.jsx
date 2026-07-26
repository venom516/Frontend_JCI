import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useI18n } from "../contexts/I18nContext";
import { documentAPI } from "../api/axios";
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
  FileText,
  ClipboardList,
  BarChart3,
  Calendar,
  User,
  HardDrive,
  Download,
  Check,
  Archive,
  Pencil,
  Trash2,
  Lock,
  Upload,
  Loader2,
  Plus,
} from "lucide-react";

var getTypeIcon = function (type) {
  switch (type) {
    case "PV":
      return <FileText className="w-5 h-5" />;
    case "Ordre du jour":
      return <ClipboardList className="w-5 h-5" />;
    case "Rapport":
      return <BarChart3 className="w-5 h-5" />;
    default:
      return <FileText className="w-5 h-5" />;
  }
};

var DocumentsPage = function () {
  var i18n = useI18n();
  var t = i18n.t;
  var formatDate = i18n.formatDate;
  var translateStatus = i18n.translateStatus;
  var auth = useAuth();
  var user = auth.user;
  var isPresident = auth.isPresident;
  var isSecretaire = auth.isSecretaire;
  var _documentsState = useState([]);
  var documents = _documentsState[0];
  var setDocuments = _documentsState[1];
  var _loadingState = useState(true);
  var loading = _loadingState[0];
  var setLoading = _loadingState[1];
  var _showFormState = useState(false);
  var showForm = _showFormState[0];
  var setShowForm = _showFormState[1];
  var _editingDocState = useState(null);
  var editingDoc = _editingDocState[0];
  var setEditingDoc = _editingDocState[1];
  var _fileState = useState(null);
  var file = _fileState[0];
  var setFile = _fileState[1];
  var _filterState = useState("");
  var filter = _filterState[0];
  var setFilter = _filterState[1];
  var _formState = useState({
    titre: "",
    type: "PV",
    description: "",
    status: "brouillon",
  });
  var form = _formState[0];
  var setForm = _formState[1];

  useEffect(
    function () {
      fetchDocuments();
    },
    [filter]
  );

  var fetchDocuments = async function () {
    setLoading(true);
    try {
      var response = await documentAPI.getAll({ status: filter });
      setDocuments((response.data && response.data.data) || []);
    } catch (error) {
      console.error("Erreur chargement:", error);
      toast.error(t("documents.erreur_chargement"));
    } finally {
      setLoading(false);
    }
  };

  var resetForm = function () {
    setForm({ titre: "", type: "PV", description: "", status: "brouillon" });
    setFile(null);
    setEditingDoc(null);
    setShowForm(false);
  };

  var handleSubmit = async function (e) {
    e.preventDefault();
    if (!file && !editingDoc) {
      toast.error(t("common.erreur_fichier"));
      return;
    }
    setLoading(true);
    try {
      var data = new FormData();
      data.append("titre", form.titre);
      data.append("type", form.type);
      data.append("description", form.description);
      data.append("status", form.status);
      if (file) data.append("fichier", file);

      if (editingDoc) {
        await documentAPI.update(editingDoc._id, data);
        toast.success(t("documents.succes_mis_a_jour"));
      } else {
        await documentAPI.upload(data);
        toast.success(t("documents.succes_upload"));
        toast.success(t("documents.succes_notification"));
      }
      resetForm();
      fetchDocuments();
    } catch (error) {
      toast.error(
        (error.response && error.response.data && error.response.data.message) ||
          t("common.erreur")
      );
    } finally {
      setLoading(false);
    }
  };

  var handleEdit = function (doc) {
    setEditingDoc(doc);
    setForm({
      titre: doc.titre,
      type: doc.type,
      description: doc.description || "",
      status: doc.status,
    });
    setFile(null);
    setShowForm(true);
  };

  var handleDelete = async function (id) {
    if (!window.confirm(t("documents.confirmer_suppression"))) return;
    try {
      await documentAPI.delete(id);
      toast.success(t("documents.succes_supprime"));
      fetchDocuments();
    } catch (error) {
      toast.error(t("common.erreur"));
    }
  };

  var handleApprove = async function (id) {
    try {
      await documentAPI.approve(id);
      toast.success(t("documents.succes_approuve"));
      fetchDocuments();
    } catch (error) {
      toast.error(t("common.erreur"));
    }
  };

  var handleArchive = async function (id) {
    try {
      await documentAPI.archive(id);
      toast.success(t("documents.succes_archive"));
      fetchDocuments();
    } catch (error) {
      toast.error(t("common.erreur"));
    }
  };

  var handleDownload = async function (id, nom) {
    try {
      var response = await documentAPI.download(id);
      var url = window.URL.createObjectURL(new Blob([response.data]));
      var link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", nom || "document");
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success(t("documents.succes_telechargement"));
    } catch (error) {
      toast.error(t("documents.erreur_telechargement"));
    }
  };

  var getStatusColor = function (status) {
    var colors = {
      brouillon: "bg-amber-100 text-amber-700 border-amber-200",
      "en-attente": "bg-blue-100 text-blue-700 border-blue-200",
      approuv\u00e9: "bg-emerald-100 text-emerald-700 border-emerald-200",
      archiv\u00e9: "bg-blue-100 text-blue-700 border-blue-200",
    };
    return colors[status] || "";
  };

  if (loading)
    return (
      <div className="min-h-screen bg-surface-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Skeleton className="h-24 w-full mb-8 rounded-xl" />
          <Skeleton className="h-16 w-full mb-8 rounded-xl" />
          <div className="grid gap-4">
            {[1, 2, 3].map(function (i) {
              return <Skeleton key={i} className="h-28 w-full rounded-xl" />;
            })}
          </div>
        </div>
      </div>
    );

  if (!isSecretaire && !isPresident) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50">
        <Card className="p-8 text-center max-w-md animate-fade-in-up">
          <div className="w-16 h-16 rounded-2xl bg-accent-rose/10 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-accent-rose" />
          </div>
          <p className="text-accent-rose font-semibold">{t("documents.acces_reserve")}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="animate-fade-in-up p-6 md:p-8 mb-8">
          <div className="flex flex-wrap justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-primary-100 flex items-center justify-center text-primary-600">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h1 className="font-display text-2xl md:text-3xl font-bold text-surface-900">
                  {t("documents.titre")}
                </h1>
                <p className="text-surface-500">{t("documents.sous_titre")}</p>
                <p className="text-sm text-accent-emerald mt-1">
                  {t("documents.notification_email")}
                </p>
              </div>
            </div>
            <Button onClick={function () { setShowForm(true); }}>
              <Plus className="w-5 h-5 mr-2" />
              {t("documents.ajouter")}
            </Button>
          </div>
        </Card>

        <Card className="p-4 md:p-6 mb-8 animate-fade-in-up">
          <div className="flex flex-wrap gap-3">
            <Button
              variant={filter === "" ? "default" : "ghost"}
              size="sm"
              onClick={function () { setFilter(""); }}
            >
              {t("common.tous")} ({documents.length})
            </Button>
            <Button
              variant={filter === "brouillon" ? "default" : "ghost"}
              size="sm"
              onClick={function () { setFilter("brouillon"); }}
            >
              {t("documents.brouillon")}
            </Button>
            <Button
              variant={filter === "en-attente" ? "default" : "ghost"}
              size="sm"
              onClick={function () { setFilter("en-attente"); }}
            >
              {t("documents.en_attente")}
            </Button>
            <Button
              variant={filter === "approuv\u00e9" ? "default" : "ghost"}
              size="sm"
              onClick={function () { setFilter("approuv\u00e9"); }}
            >
              {t("documents.approuve")}
            </Button>
            <Button
              variant={filter === "archiv\u00e9" ? "default" : "ghost"}
              size="sm"
              onClick={function () { setFilter("archiv\u00e9"); }}
            >
              {t("documents.archive")}
            </Button>
          </div>
        </Card>

        <Dialog open={showForm} onOpenChange={function (open) { if (!open) resetForm(); }}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingDoc ? t("documents.modifier") : t("documents.ajouter")}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <Label>{t("documents.titre_label")}</Label>
                  <Input
                    type="text"
                    value={form.titre}
                    onChange={function (e) {
                      setForm({
                        titre: e.target.value,
                        type: form.type,
                        description: form.description,
                        status: form.status,
                      });
                    }}
                    required
                  />
                </div>
                <div>
                  <Label>{t("documents.type_label")}</Label>
                  <Select
                    value={form.type}
                    onValueChange={function (val) {
                      setForm({
                        titre: form.titre,
                        type: val,
                        description: form.description,
                        status: form.status,
                      });
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PV">{t("documents.pv")}</SelectItem>
                      <SelectItem value="Ordre du jour">{t("documents.ordre_jour")}</SelectItem>
                      <SelectItem value="Rapport">{t("documents.rapport")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{t("documents.description")}</Label>
                  <Textarea
                    rows="3"
                    value={form.description}
                    onChange={function (e) {
                      setForm({
                        titre: form.titre,
                        type: form.type,
                        description: e.target.value,
                        status: form.status,
                      });
                    }}
                  />
                </div>
                {!editingDoc && (
                  <div>
                    <Label>{t("documents.fichier")}</Label>
                    <div
                      className="relative border-2 border-dashed border-surface-300 rounded-2xl p-8 text-center cursor-pointer hover:border-primary-400 hover:bg-primary-50/30 transition-all duration-200"
                      onClick={function () {
                        document.getElementById("doc-file-input").click();
                      }}
                      onDragOver={function (e) {
                        e.preventDefault();
                        e.currentTarget.classList.add("border-primary-500", "bg-primary-50/50");
                      }}
                      onDragLeave={function (e) {
                        e.currentTarget.classList.remove("border-primary-500", "bg-primary-50/50");
                      }}
                      onDrop={function (e) {
                        e.preventDefault();
                        var droppedFile = e.dataTransfer.files[0];
                        if (droppedFile) {
                          setFile(droppedFile);
                        }
                        e.currentTarget.classList.remove("border-primary-500", "bg-primary-50/50");
                      }}
                    >
                      <Upload className="w-12 h-12 mx-auto mb-3 text-surface-400" />
                      <p className="text-surface-500 font-medium">
                        {file ? file.name : t("documents.dropzone_hint")}
                      </p>
                      {file && (
                        <p className="text-xs text-surface-400 mt-1">
                          {(file.size / 1024).toFixed(2)}{t("common.kilobytes")}
                        </p>
                      )}
                    </div>
                    <input
                      id="doc-file-input"
                      type="file"
                      className="hidden"
                      onChange={function (e) { setFile(e.target.files[0]); }}
                      required={!editingDoc}
                    />
                  </div>
                )}
                <div>
                  <Label>{t("documents.statut")}</Label>
                  <Select
                    value={form.status}
                    onValueChange={function (val) {
                      setForm({
                        titre: form.titre,
                        type: form.type,
                        description: form.description,
                        status: val,
                      });
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="brouillon">{t("documents.brouillon")}</SelectItem>
                      <SelectItem value="en-attente">{t("documents.en_attente")}</SelectItem>
                      <SelectItem value="approuv\u00e9">{t("documents.approuve")}</SelectItem>
                      <SelectItem value="archiv\u00e9">{t("documents.archive")}</SelectItem>
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
                  {loading ? t("common.chargement") : t("common.enregistrer")}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <div className="grid gap-4">
          {documents.length === 0 ? (
            <Card className="p-12 text-center animate-fade-in-up">
              <FileText className="w-16 h-16 mx-auto mb-4 text-surface-300" />
              <p className="text-surface-400">{t("documents.aucun")}</p>
            </Card>
          ) : (
            documents.map(function (doc) {
              return (
                <Card key={doc._id} className="p-6 animate-fade-in-up hover:shadow-md transition-all">
                  <div className="flex flex-wrap justify-between items-start gap-4">
                    <div className="flex gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center text-primary-600 shrink-0 mt-0.5">
                        {getTypeIcon(doc.type)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-display text-lg font-semibold text-surface-900">
                            {doc.titre}
                          </h3>
                          <Badge className={getStatusColor(doc.status)}>
                            {translateStatus(doc.status)}
                          </Badge>
                          <span className="text-xs text-surface-400 bg-surface-100 px-2 py-0.5 rounded-lg">
                            {t("common.version_prefix")}{doc.version || 1}
                          </span>
                        </div>
                        {doc.description && (
                          <p className="text-surface-600 mt-1.5">
                            {doc.description}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-4 mt-2.5 text-sm text-surface-500">
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4" />
                            {formatDate(doc.createdAt)}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <User className="w-4 h-4" />
                            {doc.createdBy && doc.createdBy.prenom}{" "}
                            {doc.createdBy && doc.createdBy.nom}
                          </span>
                          {doc.fichierTaille && (
                            <span className="flex items-center gap-1.5">
                              <HardDrive className="w-4 h-4" />
                              {(doc.fichierTaille / 1024).toFixed(2)}{t("common.kilobytes")}
                            </span>
                          )}
                          {doc.eventId && (
                            <span className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4" />
                            {doc.eventId && doc.eventId.titre}
                          </span>
                        )}
                      </div>
                    </div>
                    </div>
                    <div className="flex flex-wrap gap-2 shrink-0">
                      <Button
                        size="sm"
                        onClick={function () { handleDownload(doc._id, doc.fichierNom); }}
                      >
                        <Download className="w-4 h-4 mr-1" />
                        {t("common.telecharger")}
                      </Button>

                      {doc.status === "en-attente" && (isPresident || isSecretaire) && (
                        <Button
                          size="sm"
                          onClick={function () { handleApprove(doc._id); }}
                          className="bg-emerald-600 hover:bg-emerald-700"
                        >
                          <Check className="w-4 h-4 mr-1" />
                          {t("documents.approuve")}
                        </Button>
                      )}

                      {doc.status === "approuve" && (isPresident || isSecretaire) && (
                        <Button
                          size="sm"
                          onClick={function () { handleArchive(doc._id); }}
                          className="bg-cyan-600 hover:bg-cyan-700"
                        >
                          <Archive className="w-4 h-4 mr-1" />
                          {t("documents.archive")}
                        </Button>
                      )}

                      {(isPresident ||
                        isSecretaire ||
                        (doc.createdBy && doc.createdBy._id === (user && user._id))) && (
                        <Button
                          size="sm"
                          onClick={function () { handleEdit(doc); }}
                          className="bg-amber-600 hover:bg-amber-700"
                        >
                          <Pencil className="w-4 h-4 mr-1" />
                          {t("common.modifier")}
                        </Button>
                      )}

                      {(isPresident ||
                        (doc.createdBy && doc.createdBy._id === (user && user._id))) && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={function () { handleDelete(doc._id); }}
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          {t("common.supprimer")}
                        </Button>
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

export default DocumentsPage;
