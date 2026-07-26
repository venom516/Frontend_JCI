import React, { useState, useEffect } from "react";
import { useI18n } from "../contexts/I18nContext";
import { formationAPI } from "../api/axios";
import { Skeleton } from "../components/ui/skeleton";
import { Card } from "../components/ui/card";
import { AlertCircle, Calendar, RefreshCw } from "lucide-react";
const FormationsPage = () => {
  const { t, lang } = useI18n();
  const [formations, setFormations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(false);
        const res = await formationAPI.getAll();
        setFormations(res.data?.data || []);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return "\u2014";
    return new Date(dateStr).toLocaleDateString(
      lang === "ar" ? "ar-TN" : "fr-FR",
      { day: "numeric", month: "long", year: "numeric" }
    );
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="page-container">
        <div className="max-w-4xl mx-auto">
          <div className="card-glass p-0 overflow-hidden animate-fade-in-up">
            <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-surface-900 p-8 md:p-12 text-white text-center">
              <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight">
                {t("formations.titre")}
              </h1>
              <p className="text-xl font-light text-white/90 mt-2">
                {t("formations.description")}
              </p>
            </div>

            <div className="p-6 md:p-8">
              {loading && (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Card key={i} className="p-6">
                      <Skeleton className="h-6 w-1/2 mb-4" />
                      <Skeleton className="h-4 w-3/4 mb-2" />
                      <div className="flex gap-4 mt-4">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-40" />
                      </div>
                    </Card>
                  ))}
                </div>
              )}
              {error && (
                <div className="text-center py-8">
                  <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                  <p className="text-center text-red-500 py-8">
                    {t("formations.erreur")}
                  </p>
                  <button onClick={() => window.location.reload()} className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium">
                    <RefreshCw className="w-4 h-4" />
                    {t("home.reesayer")}
                  </button>
                </div>
              )}
              {!loading && !error && formations.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  {t("formations.aucune")}
                </p>
              )}
              {!loading && !error && formations.length > 0 && (
                <div className="grid gap-4">
                  {formations.map((f) => (
                    <Card
                      key={f._id}
                      className="p-6"
                    >
                      <h3 className="font-display font-semibold text-foreground text-lg">
                        {f.titre}
                      </h3>
                      {f.description && (
                        <p className="mt-2 text-muted-foreground">{f.description}</p>
                      )}
                      <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
                        {f.formateur && (
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            {t("formations.formateur")}: {f.formateur}
                          </span>
                        )}
                        {f.dateDebut && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {t("formations.date_debut")}: {formatDate(f.dateDebut)}
                          </span>
                        )}
                        {f.dateFin && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {t("formations.date_fin")}: {formatDate(f.dateFin)}
                          </span>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormationsPage;
