import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useI18n } from "../contexts/I18nContext";
import { newsAPI } from "../api/axios";
import { Skeleton } from "../components/ui/skeleton";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import toast from "react-hot-toast";
import { Calendar, ArrowRight, Newspaper, AlertCircle, RefreshCw } from "lucide-react";
const API_URL = import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000";

const ActualitesPage = () => {
  const { t, formatDate } = useI18n();
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNews = useCallback(async () => {
    try {
      const response = await newsAPI.getPublic({ limit: 100 });
      const data = response.data?.data || response.data || [];
      setNews(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(err.message || t("home.erreur_chargement"));
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  const sortedNews = [...news].sort((a, b) => {
    const dateA = new Date(a.date || a.createdAt || a.publishedAt || 0);
    const dateB = new Date(b.date || b.createdAt || b.publishedAt || 0);
    return dateB - dateA;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-muted/30 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="text-center mb-16">
            <Skeleton className="h-10 w-64 mx-auto mb-4" />
            <Skeleton className="h-6 w-96 mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <div className="p-6">
                  <Skeleton className="h-4 w-20 mb-3" />
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-muted/30 to-primary-50">
        <div className="text-center p-10 bg-white dark:bg-gray-800 rounded-2xl shadow-soft ring-1 ring-rose-100/50 dark:ring-rose-900/50 max-w-md">
          <div className="w-16 h-16 bg-rose-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <AlertCircle className="w-8 h-8 text-rose-500 dark:text-rose-400" />
          </div>
          <h2 className="text-2xl font-display font-bold text-rose-600 dark:text-rose-400 mb-2">{t('home.erreur_chargement')}</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button onClick={() => { setError(null); setLoading(true); fetchNews(); }} className="font-sans">
            <RefreshCw className="w-4 h-4 mr-2" />
            {t('home.reesayer')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-muted/30 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="text-center mb-16">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-blue-800 dark:text-blue-300 mb-4">
            {t('home.actualites')}
          </h1>
          <p className="text-lg text-blue-500 dark:text-blue-300 font-normal max-w-2xl mx-auto">
            {t('home.actualites_texte')}
          </p>
        </div>

        {sortedNews.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl shadow-lg ring-1 ring-gray-200 dark:ring-gray-700">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Newspaper className="w-12 h-12 text-blue-400 dark:text-blue-300" />
            </div>
            <h3 className="text-xl font-bold text-blue-800 dark:text-blue-300 mb-2">{t('home.aucune_actualite')}</h3>
            <p className="text-blue-600 dark:text-blue-400 font-normal">{t('home.premiere_actualite')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {sortedNews.map((item) => {
              const title = item.titre || item.title || t('common.sans_titre');
              const content = item.contenu || item.content || "";
              const date = item.date || item.createdAt || item.publishedAt;
              const image = item.image || item.photo || null;
              const id = item._id || item.id;

              return (
                <Card key={id} className="group overflow-hidden">
                  {image && (
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={image.startsWith("http") ? image : API_URL + image}
                        alt={title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      {item.category && (
                        <Badge variant="secondary" className="text-xs">
                          {item.category}
                        </Badge>
                      )}
                      <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        {formatDate(date, {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                    <h3 className="font-display text-lg font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-300">
                      {title}
                    </h3>
                    <div className="bg-muted/30 rounded-xl p-4 mb-4 border border-surface-100">
                      <p className="text-muted-foreground text-sm leading-relaxed line-clamp-4">
                        {content.length > 200 ? content.substring(0, 200) + "..." : content}
                      </p>
                    </div>
                    <Link
                      to={`/news/${id}`}
                      className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors duration-300 group/link"
                    >
                      {t('home.lire_suite')}
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActualitesPage;
