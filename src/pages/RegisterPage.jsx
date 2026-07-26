import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useI18n } from "../contexts/I18nContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import jci from "../config/jci";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";

const RegisterPage = () => {
  const heroRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [form, setForm] = useState({
    nom: "", prenom: "", email: "", password: "",
    confirmPassword: "", telephone: "", adresse: "", situationProfessionnelle: "Autre",
    societe: "", dateNaissance: "", urlFacebook: "", urlLinkedIn: "",
    langues: "", competences: "", hobbies: "", pointsForts: "",
    association: "", connaissanceZone: "", connaissanceJCI: "",
    pointsDeveloppement: "", parrain: ""
  });
  const { t: gt, translateError } = useI18n();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const formatPhone = (val) => {
    const digits = val.replace(/\D/g, "").slice(0, 8);
    if (digits.length <= 2) return digits;
    if (digits.length <= 5) return digits.slice(0, 2) + " " + digits.slice(2);
    return digits.slice(0, 2) + " " + digits.slice(2, 5) + " " + digits.slice(5);
  };

  const clearError = (name) => {
    if (errors[name]) {
      const next = { ...errors };
      delete next[name];
      setErrors(next);
    }
  };

  const handleChange = (e) => {
    clearError(e.target.name);
    if (e.target.name === "telephone") {
      setForm({ ...form, telephone: formatPhone(e.target.value) });
    } else {
      setForm({ ...form, [e.target.name]: e.target.value });
    }
  };

  const validate = () => {
    const errs = {};
    const req = gt("register.requis");
    if (!form.nom) errs.nom = req;
    if (!form.prenom) errs.prenom = req;
    if (!form.email) errs.email = req;
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = gt("register.validation_email_invalide");
    if (!form.adresse) errs.adresse = req;
    if (!form.telephone) errs.telephone = req;
    else {
      const digits = form.telephone.replace(/\D/g, "");
      if (digits.length !== 8) errs.telephone = gt("register.validation_tel");
    }
    if (!form.situationProfessionnelle) errs.situationProfessionnelle = req;
    if (!form.dateNaissance) errs.dateNaissance = req;
    else {
      const [y, m, d] = form.dateNaissance.split('-').map(Number);
      const date = new Date(y, m - 1, d);
      if (date.getDate() !== d || date.getMonth() !== m - 1 || date.getFullYear() !== y || date > new Date()) {
        errs.dateNaissance = gt("register.validation_date_naissance");
      } else {
        const today = new Date();
        let age = today.getFullYear() - y;
        const monthDiff = today.getMonth() - (m - 1);
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < d)) age--;
        if (age < 18) errs.dateNaissance = gt("register.validation_age_min");
        else if (age > 40) errs.dateNaissance = gt("register.validation_age_max");
      }
    }
    if (form.urlFacebook && form.urlFacebook.startsWith("http")) {
      try { new URL(form.urlFacebook); } catch { errs.urlFacebook = gt("register.validation_facebook"); }
    }
    if (!form.password) errs.password = req;
    else if (form.password.length < 6) errs.password = gt("register.validation_mdp_longueur");
    if (!form.confirmPassword) errs.confirmPassword = req;
    else if (form.password !== form.confirmPassword) errs.confirmPassword = gt("register.validation_mdp_correspondance");
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const inputCls = (name) =>
    errors[name] ? "ring-2 ring-red-400 border-red-400" : "";

  const errMsg = (name) =>
    errors[name] ? <p className="text-xs text-red-500 mt-1">{errors[name]}</p> : null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const { confirmPassword, ...data } = form;
      if (data.telephone) data.telephone = data.telephone.replace(/\s/g, "");
      if (!data.parrain) delete data.parrain;
      const result = await register(data);
      if (result && result.success) {
        toast.success(gt("register.succes_inscription"));
        setForm({
          nom: "", prenom: "", email: "", password: "",
          confirmPassword: "", telephone: "", adresse: "", situationProfessionnelle: "Autre",
          societe: "", dateNaissance: "", urlFacebook: "", urlLinkedIn: "",
          langues: "", competences: "", hobbies: "", pointsForts: "",
          association: "", connaissanceZone: "", connaissanceJCI: "",
          pointsDeveloppement: "", parrain: ""
        });
        setErrors({});
      } else {
        const msg = translateError(result?.message) || gt("register.erreur_inscription");
        toast.error(msg);
      }
    } catch (error) {
      const msg = translateError(error.response?.data?.message) || error.response?.data?.errors?.[0] || gt("register.erreur_inscription");
      toast.error(msg);
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 via-primary-700 to-primary-950">
      <div className="flex min-h-screen">
        <div ref={heroRef} className="hidden lg:flex w-1/2 ios-hero bg-gradient-to-br from-primary dark:from-primary-800 to-primary-700 dark:to-primary-950 items-center justify-center p-12 relative"
        onMouseMove={(e) => {
          const r = heroRef.current.getBoundingClientRect();
          setMousePos({
            x: (e.clientX - r.left - r.width / 2) / r.width,
            y: (e.clientY - r.top - r.height / 2) / r.height
          });
        }}
        onMouseLeave={() => setMousePos({ x: 0, y: 0 })}
      >
        <div className="absolute inset-0 opacity-20"
          style={{
            transform: "translate(" + (mousePos.x * -30) + "px, " + (mousePos.y * -30) + "px)",
            transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
          }}
        >
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white rounded-full blur-3xl animate-pulse-soft" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent-gold dark:bg-amber-700 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: '1s' }} />
        </div>
        <div className="relative text-center max-w-md animate-fade-in-up"
          style={{
            transform: "perspective(800px) rotateY(" + (mousePos.x * 8) + "deg) rotateX(" + (mousePos.y * -8) + "deg)",
            transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
          }}
        >
          <div className="w-32 h-32 mx-auto mb-6 rounded-3xl bg-white/10 backdrop-blur-2xl flex items-center justify-center border border-white/20 shadow-soft-lg">
            <img src="/images/logo-jci-white.png" alt={jci.nom} className="h-24 w-auto" />
          </div>
          <h2 className="text-3xl font-bold text-white drop-shadow-lg">{gt("register.hero_titre")}</h2>
          <p className="text-white/70 text-sm mb-4">{gt("register.hero_cta")}</p>
          <p className="text-white/80 text-lg leading-relaxed drop-shadow">
            {gt("register.hero_texte")}
          </p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 md:p-8 relative overflow-hidden">
        <div className="w-full max-w-3xl animate-fade-in-up">
          <div className="text-center mb-10">
            <img src="/images/logo-jci-white.png" alt={jci.nom} className="h-24 w-auto mx-auto mb-6" />
            <h1 className="text-4xl font-bold text-white drop-shadow-lg">{gt("register.titre")}</h1>
            <p className="text-white/70 mt-2">{gt("register.sous_titre")}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <p className="text-sm font-semibold text-white/80 mb-4">{gt("register.obligatoire")}</p>

            <Label className="text-white/90">{gt("register.nom_prenom")}</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <Input name="nom" type="text" className={inputCls("nom")} value={form.nom} onChange={handleChange} placeholder={gt("register.nom")} />
                {errMsg("nom")}
              </div>
              <div>
                <Input name="prenom" type="text" className={inputCls("prenom")} value={form.prenom} onChange={handleChange} placeholder={gt("register.prenom")} />
                {errMsg("prenom")}
              </div>
            </div>

            <div>
              <Label className="text-white/90">{gt("register.email")}</Label>
              <Input name="email" type="email" className={inputCls("email")} value={form.email} onChange={handleChange} />
              {errMsg("email")}
            </div>

            <div>
              <Label className="text-white/90">{gt("register.adresse")}</Label>
              <Input name="adresse" type="text" className={inputCls("adresse")} value={form.adresse} onChange={(e) => { clearError("adresse"); setForm({ ...form, adresse: e.target.value }); }} />
              {errMsg("adresse")}
            </div>

            <div>
              <Label className="text-white/90">{gt("register.tel")}</Label>
              <Input name="telephone" type="text" className={inputCls("telephone")} value={form.telephone} onChange={handleChange} inputMode="numeric" maxLength={10} placeholder={gt("register.tel_placeholder")} />
              {errMsg("telephone")}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <Label className="text-white/90">{gt("register.profession")}</Label>
                <select name="situationProfessionnelle" className={"flex h-10 w-full rounded-md border border-white/20 bg-white/10 backdrop-blur px-3 py-2 text-base text-white shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-white/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40 disabled:cursor-not-allowed disabled:opacity-50 " + inputCls("situationProfessionnelle")} value={form.situationProfessionnelle} onChange={handleChange}>
                  <option value="" className="text-gray-800">{gt("register.profession_default")}</option>
                  <option value="Étudiant" className="text-gray-800">{gt("register.etudiant")}</option>
                  <option value="Professionnel" className="text-gray-800">{gt("register.professionnel")}</option>
                  <option value="Autre" className="text-gray-800">{gt("register.autre")}</option>
                </select>
                {errMsg("situationProfessionnelle")}
              </div>
              <div>
                <Label className="text-white/90">{gt("register.societe")}</Label>
                <Input name="societe" type="text" value={form.societe} onChange={handleChange} placeholder={gt("register.societe")} />
              </div>
            </div>

            <div>
              <Label className="text-white/90">{gt("register.date_naissance")}</Label>
              <Input name="dateNaissance" type="date" className={"text-white " + inputCls("dateNaissance")} value={form.dateNaissance} onChange={handleChange} />
              {errMsg("dateNaissance")}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <Label className="text-white/90">{gt("register.facebook")}</Label>
                <Input name="urlFacebook" type="url" className={inputCls("urlFacebook")} value={form.urlFacebook} onChange={handleChange} placeholder={gt("register.facebook_placeholder")} />
                {errMsg("urlFacebook")}
              </div>
              <div>
                <Label className="text-white/90">{gt("register.linkedin")}</Label>
                <Input name="urlLinkedIn" type="url" className={inputCls("urlLinkedIn")} value={form.urlLinkedIn} onChange={handleChange} placeholder={gt("register.linkedin_placeholder")} />
                {errMsg("urlLinkedIn")}
              </div>
            </div>

            <div>
              <Label className="text-white/90">{gt("register.parrain")}</Label>
              <Input name="parrain" type="text" value={form.parrain} onChange={handleChange} placeholder={gt("register.parrain_placeholder")} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <Label className="text-white/90">{gt("register.langues")}</Label>
                <Input name="langues" type="text" value={form.langues} onChange={handleChange} placeholder={gt("register.langues")} />
              </div>
              <div>
                <Label className="text-white/90">{gt("register.competences")}</Label>
                <Input name="competences" type="text" value={form.competences} onChange={handleChange} placeholder={gt("register.competences")} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <Label className="text-white/90">{gt("register.hobbies")}</Label>
                <Input name="hobbies" type="text" value={form.hobbies} onChange={handleChange} placeholder={gt("register.hobbies")} />
              </div>
              <div>
                <Label className="text-white/90">{gt("register.points_forts")}</Label>
                <Input name="pointsForts" type="text" value={form.pointsForts} onChange={handleChange} placeholder={gt("register.points_forts")} />
              </div>
            </div>

            <div>
              <Label className="text-white/90">{gt("register.association")}</Label>
              <Input name="association" type="text" value={form.association} onChange={handleChange} placeholder={gt("register.association")} />
            </div>

            <div>
              <Label className="text-white/90">{gt("register.connaissance_zone")}</Label>
              <Textarea name="connaissanceZone" rows="3" className="resize-none" value={form.connaissanceZone} onChange={handleChange} placeholder={gt("register.connaissance_zone")} />
            </div>

            <div>
              <Label className="text-white/90">{gt("register.connaissance_jci")}</Label>
              <Textarea name="connaissanceJCI" rows="3" className="resize-none" value={form.connaissanceJCI} onChange={handleChange} placeholder={gt("register.connaissance_jci")} />
            </div>

            <div>
              <Label className="text-white/90">{gt("register.points_developpement")}</Label>
              <Textarea name="pointsDeveloppement" rows="3" className="resize-none" value={form.pointsDeveloppement} onChange={handleChange} placeholder={gt("register.points_developpement")} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <Label className="text-white/90">{gt("register.mot_de_passe")}</Label>
                <div className="relative">
                  <Input name="password" type={showPassword ? "text" : "password"} className={"pr-10 text-white " + inputCls("password")}
                    value={form.password} onChange={handleChange} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/60 hover:text-white">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {showPassword
                        ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        : <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></>
                      }
                    </svg>
                  </button>
                </div>
                {errMsg("password")}
              </div>
              <div>
                <Label className="text-white/90">{gt("register.confirmer_mdp")}</Label>
                <div className="relative">
                  <Input name="confirmPassword" type={showConfirmPassword ? "text" : "password"} className={"pr-10 text-white " + inputCls("confirmPassword")}
                    value={form.confirmPassword} onChange={handleChange} />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/60 hover:text-white">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {showConfirmPassword
                        ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        : <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></>
                      }
                    </svg>
                  </button>
                </div>
                {errMsg("confirmPassword")}
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading && (
                <Loader2 className="animate-spin -ml-1 h-4 w-4" />
              )}
              {loading ? gt("register.en_cours") : gt("register.inscription")}
            </Button>
          </form>
        </div>
      </div>
    </div>
  </div>
  );
};

export default RegisterPage;
