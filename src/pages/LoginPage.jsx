import { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useI18n } from "../contexts/I18nContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Eye, EyeOff, LogIn, Clock } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { translateErrorMessage } from "../utils/errorHelper";
import jci from "../config/jci";
import toast from "react-hot-toast";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { t, translateError, translateMemberRole } = useI18n();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const isWarning = error && (
    error.includes("attente") ||
    error.includes("pending") ||
    error.includes("انتظار") ||
    error.toLowerCase().includes("expir") ||
    error.includes("انتهت")
  );

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (searchParams.get("expired") === "1") {
      setError(translateErrorMessage("Session expirée"));
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await login(email, password);
    if (result.success) {
      const role = result.data?.role || t('common.membre');
      const roleMessages = {
        President: t("dashboard.bienvenue") + ' ' + translateMemberRole('President') + ' !',
        SecretaireGeneral: t("dashboard.bienvenue") + ' ' + translateMemberRole('SecretaireGeneral') + ' !',
        ConseillerMedia: t("dashboard.bienvenue") + ' ' + translateMemberRole('ConseillerMedia') + ' !',
        Membre: t("dashboard.bienvenue") + ' ' + translateMemberRole('Membre') + ' !'
      };
      toast.success(roleMessages[role] || t("common.succes"));
      navigate("/dashboard");
    } else {
      const errMsg = translateError(result.message);
      setError(errMsg);
      toast.error(errMsg);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 via-primary-700 to-primary-950">
      <div className="flex min-h-[calc(100vh-64px)]">
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <img src="/images/logo-jci-white.png" alt={jci.nom} className="h-24 w-auto mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white">{t("login.titre")}</h1>
            <p className="text-white/70 text-sm">{t("login.sous_titre")}</p>
          </div>

          <Card className="!bg-transparent dark:!bg-transparent !border-transparent !shadow-none">
            <CardHeader>
              <CardTitle className="text-white">{t("login.se_connecter")}</CardTitle>
              <CardDescription className="text-white/70">{t("login.sous_titre")}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <Alert variant={isWarning ? "default" : "destructive"} className={isWarning ? "bg-amber-50 dark:bg-amber-950 border-amber-300 dark:border-amber-700" : ""}>
                    {isWarning ? <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" /> : <AlertCircle className="h-4 w-4" />}
                    <AlertDescription className={isWarning ? "text-amber-800 dark:text-amber-200 font-semibold text-base" : ""}>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white/90">{t("login.email")}</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder={t("forgot.email_placeholder")} className="bg-white/10 border-white/20 text-white placeholder:text-white/50" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-white/90">{t("login.mot_de_passe")}</Label>
                  <div className="relative">
                    <Input id="password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required placeholder={t("login.mdp_placeholder")} className="pr-10 bg-white/10 border-white/20 text-white placeholder:text-white/50" />
                    <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff className="h-4 w-4 text-white/60" /> : <Eye className="h-4 w-4 text-white/60" />}
                    </Button>
                  </div>
                </div>

                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? t("login.en_cours") : <><LogIn className="mr-2 h-4 w-4" /> {t("login.se_connecter")}</>}
                </Button>

                <div className="text-center text-sm">
                  <Link to="/forgot-password" className="text-white/80 hover:text-white hover:underline">{t("login.mot_de_passe_oublie")}</Link>
                </div>

                <div className="text-center text-sm text-white/60 pt-4 border-t border-white/20">
                  {t("login.pas_de_compte")}{" "}
                  <Link to="/register" className="text-white hover:underline font-medium">{t("login.sinscrire")}</Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
        </div>

        <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-primary dark:from-primary-800 to-primary-700 dark:to-primary-950 items-center justify-center p-12 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-white rounded-full blur-3xl" />
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent rounded-full blur-3xl" />
          </div>
          <div className="relative text-center max-w-md">
            <div className="w-32 h-32 mx-auto mb-6 rounded-3xl bg-white/10 backdrop-blur flex items-center justify-center border border-white/20">
              <img src="/images/logo-jci-white.png" alt={jci.nom} className="h-24 w-auto" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4 drop-shadow-lg">{t("login.hero_titre")}</h2>
            <p className="text-white/80 text-lg leading-relaxed">{t("login.hero_texte")}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
