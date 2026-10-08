import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useI18n } from "../contexts/I18nContext";
import { newsAPI } from "../api/axios";
import { Skeleton } from "../components/ui/skeleton";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { StatusBadge } from "../components/common/StatusBadge";
import { Input } from "../components/ui/input";
import { ArrowLeft, Clock, User, MessageCircle, Pencil, Trash2, Send, Loader2 } from "lucide-react";
import { resolveImage, handleImageError } from "../utils/image";
import { subscribeNewsChanged } from "../utils/newsEvents";
import toast from "react-hot-toast";

const NewsDetailPage = () => {
  const { t, formatDate, formatDateTime } = useI18n();
  const { id } = useParams();
  const navigate = useNavigate();
  const { isPresident, isMedia } = useAuth();
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState([]);
  const [commentContent, setCommentContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Rafraichissement automatique : une modification d'une actualite (texte,
  // statut ou image importee / URL collee) est repercu sans rechargement.
  useEffect(() => {
    fetchNews();
    const unsubscribe = subscribeNewsChanged(() => fetchNews({ silent: true }));
    return unsubscribe;
  }, [id]);

  const fetchNews = async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);
    try {
      const response = await newsAPI.getPublicById(id);
      const data = response.data.data || response.data;
      setNews(data);
      setComments(data.comments || []);
    } catch (error) {
<<<<<<< HEAD
      if (!silent) {
        console.error("Erreur:", error);
        toast.error(t('news.non_trouvee'));
        navigate("/");
      }
=======
      console.error("Erreur:", error);
      toast.error(error.response?.data?.message || error.translatedMessage || t('news.non_trouvee'));
      navigate("/");
>>>>>>> 47883136c2fca296e3dcd5a33f1106ec0316b78a
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentContent.trim()) {
      toast.error(t('news.commentaire_requis'));
      return;
    }

    setSubmitting(true);
    try {
      const response = await newsAPI.addComment(id, commentContent);
      setComments(response.data.data.comments || []);
      setCommentContent("");
      toast.success(t('news.commentaire_ajoute'));
    } catch (error) {
      console.error("Erreur:", error);
      toast.error(error.response?.data?.message || t('common.erreur'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(t('news.supprimer_confirm'))) return;
    try {
      await newsAPI.delete(id);
      toast.success(t('news.succes_supprimer'));
      navigate("/");
    } catch (error) {
      toast.error(error.response?.data?.message || error.translatedMessage || t('news.erreur'));
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-muted/30">
      <div className="page-container">
        <div className="max-w-4xl mx-auto">
          <Skeleton className="h-6 w-40 mb-4" />
          <Skeleton className="h-96 rounded-xl" />
          <div className="mt-8 space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-64 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
  if (!news) return null;

  const title = news.title || news.titre || t('common.sans_titre');
  const content = news.content || news.contenu || "";
  const category = news.category || "General";
  const status = news.status || "brouillon";
  const image = news.image || news.photo || null;
  const imageSrc = image ? resolveImage(image) : null;
  const date = news.createdAt || news.date || news.publishedAt || new Date();
  const author = news.author || news.createdBy || null;

  const canManage = isPresident || isMedia;

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="page-container">
        <div className="max-w-4xl mx-auto">
          <Link to="/" className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-4 text-sm font-medium transition-colors">
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            {t('common.retour_accueil')}
          </Link>

          <Card className="overflow-hidden shadow-soft-lg animate-fade-in-up">
            {imageSrc && (
              <div className="relative h-72 overflow-hidden" data-img-box>
                <img 
                  src={imageSrc} 
                  alt={title} 
                  className="w-full h-full object-cover"
                  onError={handleImageError}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-surface-900/50 to-transparent"></div>
              </div>
            )}

            <div className="p-6 md:p-8">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <Badge variant="default" className="text-xs">{category}</Badge>
                <StatusBadge status={status} module="news" />
                <span className="text-muted-foreground text-sm flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {formatDateTime(date)}
                </span>
              </div>

              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4 leading-tight">
                {title}
              </h1>

              {author && (
                <div className="flex items-center gap-2 mb-6 text-muted-foreground">
                  <User className="w-4 h-4" />
                  <span className="text-sm">{t('news.par')} <span className="font-semibold text-foreground">
                    {author.nom ? author.prenom + " " + author.nom : author}
                  </span></span>
                </div>
              )}

              <div className="prose max-w-none">
                <p className="text-foreground leading-relaxed whitespace-pre-wrap text-lg">
                  {content}
                </p>
              </div>

              {canManage && (
                <div className="mt-8 pt-6 border-t border-border flex gap-3">
                  <Button asChild variant="secondary">
                    <Link to={"/news/edit/" + news._id}>
                      <Pencil className="w-4 h-4 mr-1.5" />
                      {t('common.modifier')}
                    </Link>
                  </Button>
                  <Button
                    onClick={handleDelete}
                    variant="destructive"
                  >
                    <Trash2 className="w-4 h-4 mr-1.5" />
                    {t('common.supprimer')}
                  </Button>
                </div>
              )}

              <div className="mt-8 pt-6 border-t border-border">
                <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-primary-600" />
                  {t('news.commentaire')} ({comments.length})
                </h3>

                <form onSubmit={handleCommentSubmit} className="mb-6">
                  <div className="flex gap-3">
                    <Input
                      type="text"
                      className="flex-1"
                      placeholder={t('news.commentaire_placeholder')}
                      value={commentContent}
                      onChange={(e) => setCommentContent(e.target.value)}
                      disabled={submitting}
                    />
                    <Button
                      type="submit"
                      disabled={submitting || !commentContent.trim()}
                    >
                      {submitting ? (
                        <Loader2 className="animate-spin h-4 w-4" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                      {t('news.envoyer')}
                    </Button>
                  </div>
                </form>

                {comments.length === 0 ? (
                  <p className="text-muted-foreground text-center py-6">{t('news.aucun_commentaire')}</p>
                ) : (
                  <div className="space-y-3">
                    {comments.map((comment, index) => (
                      <Card key={index} className="p-4 bg-muted/30">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center">
                            <span className="text-xs font-semibold text-primary-700">
                              {(comment.author?.prenom?.[0]?.toUpperCase() || "") + (comment.author?.nom?.[0]?.toUpperCase() || "")}
                            </span>
                          </div>
                          <span className="font-semibold text-foreground text-sm">
                            {comment.author?.nom ? comment.author.prenom + " " + comment.author.nom : t('news.anonyme')}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(comment.date || comment.createdAt)}
                          </span>
                        </div>
                        <p className="text-muted-foreground text-sm ml-9">{comment.content}</p>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default NewsDetailPage;
