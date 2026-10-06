import React, { useState, useEffect } from "react";
import { useI18n } from "../contexts/I18nContext";
import { contactAPI } from "../api/axios";
import toast from "react-hot-toast";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Skeleton } from "../components/ui/skeleton";
import { Mail, CheckCircle, Trash2, MailOpen } from "lucide-react";

const PresidentContacts = () => {
  const { t, formatDateTime } = useI18n();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => { fetchContacts(); }, []);

  const fetchContacts = async () => {
    try {
      const res = await contactAPI.getAll();
      setContacts(res.data.data || []);
    } catch (error) { toast.error(error.response?.data?.message || error.translatedMessage || t('president.erreur_chargement_messages')); }
    finally { setLoading(false); }
  };

  const handleMarkRead = async (id) => {
    try {
      await contactAPI.markAsRead(id);
      setContacts(contacts.map(c => c._id === id ? { ...c, lu: true } : c));
      toast.success(t('president.marque_lu'));
    } catch (error) { toast.error(error.response?.data?.message || error.translatedMessage || t('common.erreur')); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('president.supprimer_message'))) return;
    try {
      await contactAPI.delete(id);
      setContacts(contacts.filter(c => c._id !== id));
      if (selected === id) setSelected(null);
      toast.success(t('president.message_supprime'));
    } catch (error) { toast.error(error.response?.data?.message || error.translatedMessage || t('common.erreur')); }
  };

  if (loading) return <Skeleton className="h-96 w-full" />;

  const unread = contacts.filter(c => !c.lu).length;

  return (
    <div className="p-6">
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <Mail className="w-6 h-6 text-primary-600" />
            <div>
              <CardTitle className="text-2xl font-bold text-surface-900 font-display">{t('president.contacts_titre')}</CardTitle>
              <p className="text-surface-500">{unread} {t('president.non_lus')} {contacts.length} {t('common.total')}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {contacts.length === 0 ? (
        <Card className="p-12 text-center">
          <Mail className="w-16 h-16 mx-auto text-surface-300 mb-4" />
          <p className="text-surface-400 text-lg">{t('president.aucun_message')}</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {contacts.map((c) => (
            <Card key={c._id} className={"p-4 cursor-pointer transition-all " + (!c.lu ? "ring-2 ring-primary-200 bg-primary-50/30" : "")} onClick={() => setSelected(selected === c._id ? null : c._id)}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {!c.lu && <span className="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0" />}
                    <h3 className={"font-semibold truncate " + (!c.lu ? "text-surface-900" : "text-surface-700")}>{c.nom}</h3>
                  </div>
                  <p className="text-sm text-surface-500 truncate">{c.email}</p>
                  <p className="text-sm text-surface-600 mt-1 line-clamp-2">{c.message}</p>
                  <p className="text-xs text-surface-400 mt-1">{formatDateTime(c.createdAt)}</p>
                </div>
                <div className="flex gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                  {!c.lu && (
                    <Button size="sm" variant="ghost" onClick={() => handleMarkRead(c._id)} title={t('president.marquer_lu')}>
                      <CheckCircle className="w-4 h-4 text-primary-600" />
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => handleDelete(c._id)} title={t('common.supprimer')}>
                    <Trash2 className="w-4 h-4 text-rose-500" />
                  </Button>
                </div>
              </div>
              {selected === c._id && (
                <div className="mt-4 pt-4 border-t border-surface-200">
                  <p className="text-surface-700 whitespace-pre-wrap">{c.message}</p>
                  <div className="flex gap-2 mt-4">
                    {!c.lu && <Button size="sm" onClick={() => handleMarkRead(c._id)}>{t('president.marquer_lu')}</Button>}
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(c._id)}>{t('common.supprimer')}</Button>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PresidentContacts;