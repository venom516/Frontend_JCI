import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useI18n } from "../contexts/I18nContext";
import { taskAPI, membreAPI } from "../api/axios";
import toast from "react-hot-toast";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Label } from "../components/ui/label";
import { Skeleton } from "../components/ui/skeleton";
import { Plus, Pencil, Trash2, ClipboardList, ListTodo, Video } from "lucide-react";

const TasksPage = () => {
  const { user, isPresident, isMedia } = useAuth();
  const { t, translateStatus, formatDate } = useI18n();
  const isMediaView = window.location.pathname.includes("/media");
  const taskType = isMediaView ? "media" : "normal";

  const [tasks, setTasks] = useState([]);
  const [membres, setMembres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [filter, setFilter] = useState("");
  const [form, setForm] = useState({
    titre: "",
    description: "",
    deadline: "",
    membre: "",
    priorite: "moyenne",
    statut: "créée",
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = { statut: filter, taskType };
      const [tasksRes, membresRes] = await Promise.all([
        taskAPI.getAll(params),
        isPresident ? membreAPI.getAll() : Promise.resolve({ data: { data: [] } }),
      ]);
      setTasks(tasksRes.data.data || []);
      if (isPresident) setMembres(membresRes.data.data || []);
    } catch (error) {
      toast.error(t('common.chargement'));
    } finally {
      setLoading(false);
    }
  }, [filter, taskType, isPresident, t]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const resetForm = () => {
    setForm({
      titre: "",
      description: "",
      deadline: "",
      membre: "",
      priorite: "moyenne",
      statut: "créée",
    });
    setEditingTask(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!form.deadline) {
        toast.error(t('common.chargement'));
        setLoading(false);
        return;
      }

      const taskData = {
        titre: form.titre.trim(),
        description: form.description.trim() || "",
        deadline: new Date(form.deadline).toISOString(),
        membre: form.membre || null,
        priority: form.priorite,
        statut: form.statut,
      };

      if (editingTask) {
        await taskAPI.update(editingTask._id, taskData);
        toast.success(t('tasks.modifier'));
      } else {
        taskData.taskType = taskType;
        if (taskType === "media") {
          await taskAPI.createMedia(taskData);
        } else {
          await taskAPI.create(taskData);
        }
        toast.success(t('tasks.creee'));
      }
      resetForm();
      fetchData();
    } catch (error) {
      const data = error.response?.data;
      const validationMsg = data?.errors?.join(' | ');
      const errorMsg = validationMsg || data?.message || data?.error || t('common.chargement');
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setForm({
      titre: task.titre,
      description: task.description || "",
      deadline: task.deadline ? new Date(task.deadline).toISOString().slice(0, 16) : "",
      membre: task.membre?._id || "",
      priorite: task.priorite || "moyenne",
      statut: task.statut || "créée",
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('tasks.confirmer_suppression'))) return;
    try {
      await taskAPI.delete(id);
      toast.success(t('common.supprimer'));
      fetchData();
    } catch (error) {
      toast.error(t('common.chargement'));
    }
  };

  if (loading) return (
    <div className="p-8 space-y-4">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-4 w-48" />
      <div className="grid gap-4 mt-8">
        {[1,2,3].map(i => <Skeleton key={i} className="h-24 w-full" />)}
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <Card className="p-6">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              {isMediaView ? <Video className="w-6 h-6" /> : <ListTodo className="w-6 h-6" />}
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">
                {isMediaView ? t('tasks.media') : t('tasks.normale')}
              </h1>
              <p className="text-sm text-muted-foreground">{t('tasks.sous_titre')}</p>
            </div>
          </div>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="w-5 h-5 mr-2" />
            {isMediaView ? t('tasks.nouvelle_media') : t('tasks.nouvelle')}
          </Button>
        </div>
      </Card>

      <Card className="p-4 space-y-4">
        <div className="flex flex-wrap gap-2">
          {["", "créée", "assignée", "en-cours", "terminée"].map((f) => (
            <Button
              key={f}
              variant={filter === f ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(f)}
            >
              {f === "" ? t('common.tous') : t('tasks.' + f.replace(/é/g, "e").replace("en-cours", "en_cours"))}
            </Button>
          ))}
        </div>
      </Card>

      <Dialog open={showForm} onOpenChange={(open) => { if (!open) resetForm(); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingTask ? t('tasks.modifier') : t('tasks.nouvelle')}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>{t('tasks.titre_label')}</Label>
                <Input value={form.titre} onChange={(e) => setForm({ ...form, titre: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>{t('tasks.description')}</Label>
                <Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>{t('tasks.deadline')}</Label>
                <Input type="datetime-local" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} required />
              </div>
              {isPresident && (
                <div className="space-y-2">
                  <Label>{t('tasks.assigner')}</Label>
                  <Select value={form.membre} onValueChange={(v) => setForm({ ...form, membre: v })}>
                    <SelectTrigger><SelectValue placeholder={t('tasks.assigner')} /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">{t('tasks.assigner')}</SelectItem>
                      {membres.map((m) => (
                        <SelectItem key={m._id} value={m._id}>{m.prenom} {m.nom}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="space-y-2">
                <Label>{t('tasks.priorite')}</Label>
                <Select value={form.priorite} onValueChange={(v) => setForm({ ...form, priorite: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basse">{t('tasks.basse')}</SelectItem>
                    <SelectItem value="moyenne">{t('tasks.moyenne')}</SelectItem>
                    <SelectItem value="haute">{t('tasks.haute')}</SelectItem>
                    <SelectItem value="critique">{t('tasks.critique')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t('tasks.statut')}</Label>
                <Select value={form.statut} onValueChange={(v) => setForm({ ...form, statut: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="créée">{t('tasks.creee')}</SelectItem>
                    <SelectItem value="assignée">{t('tasks.assignee')}</SelectItem>
                    <SelectItem value="en-cours">{t('tasks.en_cours')}</SelectItem>
                    <SelectItem value="en-révision">{t('tasks.en_revision')}</SelectItem>
                    <SelectItem value="terminée">{t('tasks.terminee')}</SelectItem>
                    <SelectItem value="annulée">{t('tasks.annulee')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={resetForm}>{t('common.annuler')}</Button>
              <Button type="submit" disabled={loading}>{loading ? t('common.chargement') : t('common.enregistrer')}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Card>
        {tasks.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <ClipboardList className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
            {t('tasks.aucune')}
          </div>
        ) : (
          <div className="divide-y">
            {tasks.map((task) => (
              <div key={task._id} className="p-4 md:p-5 hover:bg-accent/50 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="flex-1 space-y-2">
                    <h3 className="font-medium">{task.titre}</h3>
                    <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground">
                      <span>{t('tasks.priorite')}: <span className="font-medium">{translateStatus(task.priorite) || task.priorite}</span></span>
                      <span>{t('tasks.statut')}: <span className="font-medium">{translateStatus(task.statut)}</span></span>
                      <span>{t('tasks.deadline')}: {task.deadline ? formatDate(task.deadline) : t('common.non_renseigne')}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {t('tasks.assigner')}: {task.membre ? (task.membre.prenom + ' ' + task.membre.nom) : t('common.non_renseigne')}
                    </div>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(task)} title={t('common.modifier')}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    {(isPresident || task.createdBy?._id === user?._id) && (
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(task._id)} title={t('common.supprimer')}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default TasksPage;
