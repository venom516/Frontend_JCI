import React from "react";
import { useI18n } from "../contexts/I18nContext";
import { useSiteConfig } from "../contexts/SiteConfigContext";
import jci from "../config/jci";
import { Card } from "../components/ui/card";
import { Mail, Phone, MapPin, Sparkles, Eye } from "lucide-react";
const API_URL = import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000";

const IconFacebook = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
  </svg>
);

const IconInstagram = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
);

const IconLinkedin = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

const AboutPage = () => {
  const { t } = useI18n();
  const { config: siteConfig } = useSiteConfig();
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="page-container">
        <div className="max-w-4xl mx-auto">
          {siteConfig.groupPhoto && (
            <div className="mb-8 rounded-2xl overflow-hidden shadow-soft-lg animate-fade-in-up">
              <img src={siteConfig.groupPhoto.startsWith('http') ? siteConfig.groupPhoto : API_URL + siteConfig.groupPhoto} alt="Photo de groupe JCI Sidi Mansour" className="w-full object-cover max-h-96" />
            </div>
          )}
          <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl p-0 overflow-hidden animate-fade-in-up shadow-soft-lg">
            <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 p-8 md:p-12 text-white text-center font-sans">
              <h1 className="font-sans text-4xl md:text-5xl font-bold tracking-tight text-white">{jci.nom}</h1>
              <p className="text-xl font-light text-white mt-2 font-sans">{siteConfig.slogan || jci.slogan}</p>
            </div>

            <div className="p-6 md:p-8 text-white font-sans">
              <div className="space-y-6">
                <p className="text-lg leading-relaxed text-white/90 font-sans">{t("about.description")}</p>

                <div className="grid md:grid-cols-2 gap-4 mt-6">
                  <div className="p-6 bg-white/10 backdrop-blur-sm border-l-4 border-white/30 rounded-2xl font-sans">
                    <h3 className="font-sans font-semibold text-white text-lg flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-white/90 flex-shrink-0" />
                      {t("about.mission")}
                    </h3>
                    <p className="mt-2 text-white/80 font-sans">{t("about.mission_texte")}</p>
                  </div>

                  <div className="p-6 bg-white/10 backdrop-blur-sm border-l-4 border-white/30 rounded-2xl font-sans">
                    <h3 className="font-sans font-semibold text-white text-lg flex items-center gap-2">
                      <Eye className="w-5 h-5 text-white/90 flex-shrink-0" />
                      {t("about.vision")}
                    </h3>
                    <p className="mt-2 text-white/80 font-sans">{t("about.vision_texte")}</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-3 mt-4">
                  <Card className="p-4 rounded-2xl font-sans">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center flex-shrink-0">
                        <Mail className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider font-sans">{t("contact.email_info")}</p>
                        <a href={jci.email_contact_lien} className="text-foreground hover:text-primary-600 dark:hover:text-primary-400 transition-colors text-sm font-sans">{jci.email}</a>
                      </div>
                    </div>
                  </Card>
                  <Card className="p-4 rounded-2xl font-sans">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center flex-shrink-0">
                        <Phone className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider font-sans">{t("contact.telephone_info")}</p>
                        <span className="text-foreground text-sm font-sans">{jci.telephone}</span>
                      </div>
                    </div>
                  </Card>
                  <Card className="p-4 rounded-2xl font-sans">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider font-sans">{t("contact.adresse_info")}</p>
                        <span className="text-foreground text-sm font-sans">{jci.adresse}</span>
                      </div>
                    </div>
                  </Card>
                  <Card className="p-4 rounded-2xl font-sans">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center flex-shrink-0">
                        <IconFacebook className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider font-sans">{t("contact.facebook_info")}</p>
                        <a href={jci.facebook} target="_blank" rel="noopener noreferrer" className="text-foreground hover:text-primary-600 dark:hover:text-primary-400 transition-colors text-sm font-sans">{jci.facebook_nom}</a>
                      </div>
                    </div>
                  </Card>
                  <Card className="p-4 rounded-2xl font-sans">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center flex-shrink-0">
                        <IconInstagram className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider font-sans">{t("contact.instagram_info")}</p>
                        <a href={jci.instagram} target="_blank" rel="noopener noreferrer" className="text-foreground hover:text-primary-600 dark:hover:text-primary-400 transition-colors text-sm font-sans">{jci.instagram_nom}</a>
                      </div>
                    </div>
                  </Card>
                  <Card className="p-4 rounded-2xl font-sans">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center flex-shrink-0">
                        <IconLinkedin className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider font-sans">{t("contact.linkedin_info")}</p>
                        <a href={jci.linkedin} target="_blank" rel="noopener noreferrer" className="text-foreground hover:text-primary-600 dark:hover:text-primary-400 transition-colors text-sm font-sans">{jci.linkedin_nom}</a>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
