import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useI18n } from "../contexts/I18nContext";
import { membreAPI } from "../api/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Camera, Save, RotateCcw, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const { t, formatDate, translateMemberRole, translateMemberStatus } = useI18n();
  const [loading, setLoading] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [originalEmail, setOriginalEmail] = useState("");
  const [photoPreview, setPhotoPreview] = useState(user?.photo || null);

  const [form, setForm] = useState({
    nom: "", prenom: "", email: "", telephone: "", adresse: "",
    situationProfessionnelle: "Autre", urlFacebook: "", urlLinkedIn: "",
    langues: "", competences: "", pointsForts: "", dateNaissance: "",
    societe: "", hobbies: "", association: "", connaissanceZone: "",
    connaissanceJCI: "", pointsDeveloppement: "", password: "", passwordConfirm: ""
  });

  useEffect(() => {
    if (user) {
      setForm({
        nom: user.nom || "", prenom: user.prenom || "", email: user.email || "",
        telephone: user.telephone || "", adresse: user.adresse || "",
        situationProfessionnelle: user.situationProfessionnelle || "Autre",
        urlFacebook: user.urlFacebook || "", urlLinkedIn: user.urlLinkedIn || "",
        langues: user.langues || "", competences: user.competences || "",
        pointsForts: user.pointsForts || "",
        dateNaissance: user.dateNaissance ? user.dateNaissance.split("T")[0] : "",
        societe: user.societe || "", hobbies: user.hobbies || "",
        association: user.association || "", connaissanceZone: user.connaissanceZone || "",
        connaissanceJCI: user.connaissanceJCI || "",
        pointsDeveloppement: user.pointsDeveloppement || "",
        password: "", passwordConfirm: ""
      });
      setOriginalEmail(user.email || "");
      if (user.photo) setPhotoPreview(user.photo);
    }
  }, [user]);

  const processImage = (file) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const size = Math.min(img.width, img.height);
        const offsetX = (img.width - size) / 2;
        const offsetY = (img.height - size) / 2;
        const canvas = document.createElement("canvas");
        const maxDim = 500;
        const finalSize = Math.min(size, maxDim);
        canvas.width = finalSize;
        canvas.height = finalSize;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, offsetX, offsetY, size, size, 0, 0, finalSize, finalSize);
        resolve(canvas.toDataURL("image/jpeg", 0.9));
      };
      img.onerror = () => reject(new Error("Image invalide"));
      const reader = new FileReader();
      reader.onload = (e) => { img.src = e.target.result; };
      reader.readAsDataURL(file);
    });
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) { toast.error(t("profile.erreur_image")); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error(t("profile.erreur_taille")); return; }
    setPhotoUploading(true);
    try {
      const processed = await processImage(file);
      setPhotoPreview(processed);
      toast.success(t("profile.photo_prete"));
    } catch (error) {
      toast.error(error.response?.data?.message || error.translatedMessage || t("profile.erreur_image"));
    } finally {
      setPhotoUploading(false);
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { toast.error(t("profile.validation_email_invalide")); setLoading(false); return; }
      if (form.password) {
        if (form.password.length < 6) { toast.error(t("profile.validation_mdp_longueur")); setLoading(false); return; }
        if (!/[A-Z]/.test(form.password)) { toast.error(t("profile.validation_mdp_majuscule")); setLoading(false); return; }
        if (!/[a-z]/.test(form.password)) { toast.error(t("profile.validation_mdp_minuscule")); setLoading(false); return; }
        if (!/[0-9]/.test(form.password)) { toast.error(t("profile.validation_mdp_chiffre")); setLoading(false); return; }
        if (form.password !== form.passwordConfirm) { toast.error(t("profile.validation_mdp_correspondance")); setLoading(false); return; }
      }
      if (form.telephone) {
        const cleaned = form.telephone.replace(/[\s\-\(\)\.\+]/g, "");
        if (!/^[0-9]{8}$/.test(cleaned)) { toast.error(t("profile.validation_tel")); setLoading(false); return; }
      }
      if (form.dateNaissance && !/^\d{4}-\d{2}-\d{2}$/.test(form.dateNaissance)) { toast.error(t("profile.validation_date")); setLoading(false); return; }

      const data = { ...form };
      if (!data.password) { delete data.password; delete data.passwordConfirm; }
      if (photoPreview && photoPreview.startsWith("data:")) data.photo = photoPreview;
      const res = await membreAPI.update(user?._id, data);
      const updatedUser = res.data?.data || res.data?.membre || res.data;
      if (updatedUser && typeof updatedUser === "object" && updatedUser._id) {
        setUser({ ...updatedUser });
        window.dispatchEvent(new CustomEvent("profile-photo-updated", { detail: { photo: updatedUser.photo } }));
      }
      toast.success(t("profile.succes_mise_a_jour"));
    } catch (error) {
      toast.error(error.response?.data?.message || t("profile.erreur_mise_a_jour"));
    } finally { setLoading(false); }
  };

  if (!user) return null;

  const initials = ((user.prenom?.[0] || "") + (user.nom?.[0] || "")).toUpperCase();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-5">
            <div className="relative group">
              <Avatar className="h-24 w-24 ring-4 ring-primary/20 shadow-lg">
                <AvatarImage src={photoPreview} className="object-cover" />
                <AvatarFallback className="text-2xl bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-semibold">{initials}</AvatarFallback>
              </Avatar>
              <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 rounded-full cursor-pointer transition-all duration-200 hover:scale-105">
                {photoUploading ? (
                  <Loader2 className="h-7 w-7 text-white animate-spin" />
                ) : (
                  <Camera className="h-7 w-7 text-white" />
                )}
                <input type="file" accept="image/jpeg,image/jpg,image/png,image/webp" className="hidden" onChange={handlePhotoChange} disabled={photoUploading} />
              </label>
            </div>
            <div>
              <CardTitle className="text-xl">{user.prenom} {user.nom}</CardTitle>
              <p className="text-sm text-muted-foreground">{translateMemberRole(user?.role)}</p>
              <Badge variant={user?.status === "actif" ? "default" : "secondary"} className="mt-1">
                {translateMemberStatus(user?.status)}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <h3 className="font-semibold mb-4">{t("profile.infos_personnelles")}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t("profile.nom")} *</Label>
                  <Input name="nom" value={form.nom} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                  <Label>{t("profile.prenom")} *</Label>
                  <Input name="prenom" value={form.prenom} onChange={handleChange} required />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label>
                    {t("profile.email")} *
                    {form.email !== originalEmail && <span className="text-xs text-amber-600 ml-2">({t("profile.email_confirmation")})</span>}
                  </Label>
                  <Input name="email" type="email" value={form.email} onChange={handleChange} className={form.email !== originalEmail ? "border-amber-400" : ""} required />
                </div>
                <div className="space-y-2">
                  <Label>{t("profile.telephone")}</Label>
                  <Input name="telephone" value={form.telephone} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label>{t("profile.adresse")}</Label>
                  <Input name="adresse" value={form.adresse} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label>{t("profile.situation")}</Label>
                  <select name="situationProfessionnelle" value={form.situationProfessionnelle} onChange={handleChange} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    <option value="Etudiant">{t("profile.etudiant")}</option>
                    <option value="Professionnel">{t("profile.professionnel")}</option>
                    <option value="Autre">{t("profile.autre")}</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>{t("profile.facebook")}</Label>
                  <Input name="urlFacebook" value={form.urlFacebook} onChange={handleChange} placeholder={t("profile.placeholder_facebook")} />
                </div>
                <div className="space-y-2">
                  <Label>{t("profile.linkedin")}</Label>
                  <Input name="urlLinkedIn" value={form.urlLinkedIn} onChange={handleChange} placeholder={t("profile.placeholder_linkedin")} />
                </div>
                <div className="space-y-2">
                  <Label>{t("profile.langage")}</Label>
                  <Input name="langues" value={form.langues} onChange={handleChange} placeholder={t("profile.placeholder_langues")} />
                </div>
                <div className="space-y-2">
                  <Label>{t("profile.competences")}</Label>
                  <Input name="competences" value={form.competences} onChange={handleChange} placeholder={t("profile.placeholder_competences")} />
                </div>
                <div className="space-y-2">
                  <Label>{t("profile.date_naissance")}</Label>
                  <Input name="dateNaissance" type="date" value={form.dateNaissance} onChange={handleChange} />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label>{t("profile.points_forts")}</Label>
                  <Textarea name="pointsForts" value={form.pointsForts} onChange={handleChange} placeholder={t("profile.placeholder_points_forts")} rows={3} />
                </div>
                <div className="space-y-2">
                  <Label>{t("profile.societe")}</Label>
                  <Input name="societe" value={form.societe} onChange={handleChange} placeholder={t("profile.placeholder_societe")} />
                </div>
                <div className="space-y-2">
                  <Label>{t("profile.hobbies")}</Label>
                  <Input name="hobbies" value={form.hobbies} onChange={handleChange} placeholder={t("profile.placeholder_hobbies")} />
                </div>
                <div className="space-y-2">
                  <Label>{t("profile.association")}</Label>
                  <Input name="association" value={form.association} onChange={handleChange} placeholder={t("profile.placeholder_association")} />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label>{t("profile.connaissance_zone")}</Label>
                  <Textarea name="connaissanceZone" value={form.connaissanceZone} onChange={handleChange} placeholder={t("profile.placeholder_connaissance_zone")} rows={2} />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label>{t("profile.connaissance_jci")}</Label>
                  <Textarea name="connaissanceJCI" value={form.connaissanceJCI} onChange={handleChange} placeholder={t("profile.placeholder_connaissance_jci")} rows={2} />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label>{t("profile.points_developpement")}</Label>
                  <Textarea name="pointsDeveloppement" value={form.pointsDeveloppement} onChange={handleChange} placeholder={t("profile.placeholder_points_developpement")} rows={2} />
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold mb-4">{t("profile.securite")}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t("profile.nouveau_mdp")}</Label>
                  <Input name="password" type="password" value={form.password} onChange={handleChange} placeholder={t("profile.placeholder_mdp")} />
                </div>
                <div className="space-y-2">
                  <Label>{t("profile.confirmer_mdp")}</Label>
                  <Input name="passwordConfirm" type="password" value={form.passwordConfirm} onChange={handleChange} placeholder={t("profile.confirmer_mdp")} />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => window.location.reload()}>
                <RotateCcw className="mr-2 h-4 w-4" /> {t("profile.annuler")}
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                {loading ? t("profile.enregistrement") : t("profile.enregistrer")}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">{t("profile.infos_compte")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <p><span className="font-medium">{t("profile.role")}</span> {translateMemberRole(user?.role)}</p>
            <p><span className="font-medium">{t("profile.statut")}</span> {translateMemberStatus(user?.status)}</p>
            <p><span className="font-medium">{t("profile.date_naissance")}</span> {user?.dateNaissance ? formatDate(user.dateNaissance) : "-"}</p>
            {user?.mandatAnnee && ['President', 'PPI', 'PP'].includes(user?.role) && (
              <p><span className="font-medium">{t("profile.mandat_annee")}</span> {user.mandatAnnee}</p>
            )}
            <p><span className="font-medium">{t("profile.inscrit_le")}</span> {formatDate(user?.createdAt)}</p>
            <p><span className="font-medium">{t("profile.derniere_connexion")}</span> {user?.lastLogin ? formatDate(user.lastLogin) : t("profile.jamais")}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
