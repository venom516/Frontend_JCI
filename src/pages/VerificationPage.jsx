import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { authAPI } from "../api/axios";
import { useI18n } from "../contexts/I18nContext";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Loader2, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
const VerificationPage = () => {
  const { t } = useI18n();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setStatus("invalid");
      return;
    }
    authAPI.verifyEmailByToken({ token })
      .then(() => setStatus("success"))
      .catch(() => setStatus("error"));
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="flex items-center justify-center pt-32">
        <Card className="max-w-md mx-4 p-8 text-center">
        {status === "loading" && (
          <>
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
            <h2 className="text-xl font-semibold">{t('verification.verification')}</h2>
          </>
        )}
        {status === "success" && (
          <>
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="text-xl font-semibold mb-2">{t('verification.succes')}</h2>
            <p className="text-muted-foreground mb-6">{t('verification.succes')}</p>
            <Link to="/login"><Button>{t('verification.retour')}</Button></Link>
          </>
        )}
        {status === "error" && (
          <>
            <div className="w-16 h-16 rounded-full bg-rose-100 flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8 text-rose-600" />
            </div>
            <h2 className="text-xl font-semibold mb-2">{t('verification.lien_invalide')}</h2>
            <p className="text-muted-foreground mb-6">{t('verification.lien_invalide')}</p>
            <Link to="/login"><Button>{t('verification.retour')}</Button></Link>
          </>
        )}
        {status === "invalid" && (
          <>
            <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-amber-600" />
            </div>
            <h2 className="text-xl font-semibold mb-2">{t('error.aucun_token')}</h2>
            <p className="text-muted-foreground mb-6">{t('error.aucun_token_trouve')}</p>
            <Link to="/login"><Button>{t('nav.connexion')}</Button></Link>
          </>
        )}
      </Card>
    </div>
    </div>
  );
};

export default VerificationPage;
