import React, { useState, useEffect, useRef } from "react";
import { useI18n } from "../contexts/I18nContext";
import { useSiteConfig } from "../contexts/SiteConfigContext";
import { siteConfigAPI } from "../api/axios";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Skeleton } from "../components/ui/skeleton";
import { AlertCircle, CheckCircle, Globe, Settings, X, Upload } from "lucide-react";

const PresidentSiteConfig = () => {
  const { t } = useI18n();
  const { refresh } = useSiteConfig();
  const [slogan, setSlogan] = useState("");
  const [groupPhoto, setGroupPhoto] = useState(null);
  const [groupPhotoPreview, setGroupPhotoPreview] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const fileRef = useRef();

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const res = await siteConfigAPI.get();
      const config = res.data.data;
      setSlogan(config.slogan || "");
      setGroupPhotoPreview(config.groupPhoto || "");
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || err.translatedMessage || t("site_config.error_load") });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: "", text: "" });
    try {
      const formData = new FormData();
      formData.append("slogan", slogan);
      if (groupPhoto) formData.append("groupPhoto", groupPhoto);
      await siteConfigAPI.update(formData);
      await refresh();
      setMessage({ type: "success", text: t("site_config.success") });
      setGroupPhoto(null);
      loadConfig();
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || t("site_config.error_save") });
    } finally {
      setSaving(false);
    }
  };

  const handleRemovePhoto = async () => {
    if (!confirm(t("site_config.confirm_delete_photo"))) return;
    try {
      await siteConfigAPI.removeGroupPhoto();
      setGroupPhotoPreview("");
      setGroupPhoto(null);
      setMessage({ type: "success", text: t("site_config.photo_deleted") });
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || err.translatedMessage || t("site_config.error_delete") });
    }
  };

  if (loading) return <Skeleton className="h-96 w-full rounded-2xl" />;

  return (
    <div className="min-h-screen bg-surface-50/80">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary-100 flex items-center justify-center text-primary-600">
                <Settings className="w-6 h-6" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-surface-900">{t("site_config.title")}</CardTitle>
                <p className="text-surface-500 text-sm mt-0.5">{t("site_config.slogan")} &amp; {t("site_config.group_photo").toLowerCase()}</p>
              </div>
            </div>
          </CardHeader>
        </Card>

        {message.text && (
          <div className={"flex items-center gap-2 p-4 rounded-xl mb-6 text-sm font-medium animate-in fade-in slide-in-from-top-2 duration-200 " + (message.type === "success" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-600")}>
            {message.type === "success" ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <Card className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-primary-50/50 to-transparent border-b border-surface-100">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-primary-600" />
                <CardTitle className="text-lg font-semibold text-surface-900">{t("site_config.slogan")}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <Input
                type="text"
                value={slogan}
                onChange={(e) => setSlogan(e.target.value)}
                className="w-full"
                placeholder={t("site_config.placeholder_slogan")}
              />
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-primary-50/50 to-transparent border-b border-surface-100">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-primary-600" />
                <CardTitle className="text-lg font-semibold text-surface-900">{t("site_config.group_photo")}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              {groupPhotoPreview && (
                <div className="relative group">
                  <img src={groupPhotoPreview} alt={t("site_config.group_photo")} className="w-full max-h-64 object-cover rounded-xl ring-1 ring-surface-200" />
                  <Button type="button" variant="secondary" size="sm" onClick={handleRemovePhoto}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 backdrop-blur-sm text-rose-500 hover:bg-rose-50 shadow-sm"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}
              <Input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    setGroupPhoto(file);
                    setGroupPhotoPreview(URL.createObjectURL(file));
                  }
                }}
                className="block w-full text-sm text-surface-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
              />
            </CardContent>
          </Card>

          <Button type="submit" disabled={saving} size="lg" className="w-full py-6 text-base font-semibold bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 shadow-lg shadow-primary-200/50">
            {saving ? t("site_config.saving") : t("site_config.save")}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default PresidentSiteConfig;