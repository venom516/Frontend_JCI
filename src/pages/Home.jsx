import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useI18n } from "../contexts/I18nContext";
import { newsAPI, membreAPI, eventAPI } from "../api/axios";
import { useSiteConfig } from "../contexts/SiteConfigContext";
import jci from "../config/jci";
import { Skeleton } from "../components/ui/skeleton";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import Footer from "../components/layout/Footer";
import {
  Users, CalendarDays, Rocket, GraduationCap, CheckCircle, Eye,
  MapPin, Phone, Mail, Globe, ArrowRight, Calendar,
  Newspaper, AlertTriangle, Sparkles
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000";

const HeroBackground = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">

    <svg className="absolute top-0 left-0 w-full h-full opacity-[0.03]" viewBox="0 0 1440 900" preserveAspectRatio="none">
      <defs>
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />
    </svg>
    <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-primary-500/10 blur-3xl" />
    <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-accent-cyan/10 blur-3xl" />
    <div className="absolute top-1/3 left-1/4 w-64 h-64 rounded-full bg-accent-amber/5 blur-3xl" />
    <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 1440 120" fill="none" preserveAspectRatio="none">
      <path d="M0 120L60 108C120 96 240 72 360 60C480 48 600 48 720 54C840 60 960 72 1080 78C1200 84 1320 84 1380 84L1440 84V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="currentColor" className="text-surface-50" />
    </svg>
  </div>
);

const SocialFollowSection = ({ jci, t }) => {
  return (
    <section className="py-20 md:py-24 bg-white/80 dark:bg-gray-900/95 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-blue-800 dark:text-blue-300 dark:text-blue-300 mb-4">{t('home.suivez_facebook')}</h2>
        <p className="text-lg mb-12 text-blue-600 dark:text-blue-400 leading-relaxed font-normal max-w-2xl mx-auto">
          {t('home.facebook_texte')}
        </p>

        <div className="flex items-center justify-center gap-8 md:gap-12 mb-14">
          <a href={jci.facebook} target="_blank" rel="noopener noreferrer"
            className="group w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-white dark:bg-gray-800 shadow-lg ring-1 ring-gray-200 dark:ring-gray-700 flex items-center justify-center hover:scale-110 hover:shadow-xl transition-all duration-300">
            <svg className="w-10 h-10 md:w-12 md:h-12 text-[#1877F2] group-hover:scale-110 transition-transform duration-300" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" /></svg>
          </a>
          <a href={jci.youtube} target="_blank" rel="noopener noreferrer"
            className="group w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-white dark:bg-gray-800 shadow-lg ring-1 ring-gray-200 dark:ring-gray-700 flex items-center justify-center hover:scale-110 hover:shadow-xl transition-all duration-300">
            <svg className="w-10 h-10 md:w-12 md:h-12 text-[#FF0000] group-hover:scale-110 transition-transform duration-300" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
          </a>
          <a href={jci.instagram} target="_blank" rel="noopener noreferrer"
            className="group w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-white dark:bg-gray-800 shadow-lg ring-1 ring-gray-200 dark:ring-gray-700 flex items-center justify-center hover:scale-110 hover:shadow-xl transition-all duration-300">
            <svg className="w-10 h-10 md:w-12 md:h-12 text-[#E4405F] group-hover:scale-110 transition-transform duration-300" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
            </svg>
          </a>
          <a href={jci.linkedin} target="_blank" rel="noopener noreferrer"
            className="group w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-white dark:bg-gray-800 shadow-lg ring-1 ring-gray-200 dark:ring-gray-700 flex items-center justify-center hover:scale-110 hover:shadow-xl transition-all duration-300">
            <svg className="w-10 h-10 md:w-12 md:h-12 text-[#0A66C2] group-hover:scale-110 transition-transform duration-300" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
          </a>
        </div>


      </div>
    </section>
  );
};

const Home = () => {
  const { user } = useAuth();
  const { t, formatDate, translateMemberRole } = useI18n();
  const { config: siteConfig } = useSiteConfig();
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [logoError, setLogoError] = useState(false);
  const [stats, setStats] = useState({ membres: 0, evenements: 0, action: 0, formations: 0 });
  const [statsLoading, setStatsLoading] = useState(true);
  const [members, setMembers] = useState([]);
  const [membersLoading, setMembersLoading] = useState(false);

  const fetchNews = useCallback(async () => {
    try {
      const response = await newsAPI.getPublic({ limit: 6 });
      const data = response.data?.data || response.data || [];
      setNews(Array.isArray(data) ? data : []);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const calls = [
          membreAPI.getPublicStats(),
          eventAPI.getCount(),
          eventAPI.getCount({ type: 'Action' }),
          eventAPI.getCount({ type: 'Formation' }),
        ];
        const [membresRes, eventsRes, actionsRes, formationsRes] = await Promise.allSettled(calls);
        const membres = membresRes.value?.data?.data?.actifs || 0;
        const evenements = eventsRes.value?.data?.data?.count || 0;
        const action = actionsRes.value?.data?.data?.count || 0;
        const formations = formationsRes.value?.data?.data?.count || 0;
        setStats({ membres, evenements, action, formations });
      } catch (e) {
        console.warn("Stats fetch failed", e);
      } finally {
        setStatsLoading(false);
      }
    };
    fetchStats();
  }, []);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await membreAPI.getBureau({ timeout: 10000 });
        const data = response.data?.data || [];
        const order = { President: 1, 'Conseiller Juridique': 2, 'Past President Immédiat': 3, VPPRE: 4, VPFD: 5, Tresorie: 6, SecretaireGeneral: 7 };
        data.sort((a, b) => (order[a.role] || 9) - (order[b.role] || 9));
        setMembers(data);
      } catch (_) {
        setMembers([]);
      } finally {
        setMembersLoading(false);
      }
    };
    fetchMembers();
  }, []);

  const newsCards = useMemo(() => {
    if (!news || news.length === 0) return null;
    return news.map((item) => {
      const title = item.titre || item.title || t('common.sans_titre');
      const content = item.contenu || item.content || "";
      const date = item.date || item.createdAt || item.publishedAt || new Date();
      const image = item.image || item.photo || null;
      const id = item._id || item.id;

      return (
        <Card key={id} className="group card-hover overflow-hidden">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-3">
              {item.category && (
                <Badge variant="default" className="text-xs">
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
            <h3 className="text-lg font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-300">
              {title}
            </h3>
            {image && (
              <div className="mb-4 rounded-xl overflow-hidden">
                <img src={image} alt={title} className="w-full h-48 object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
              </div>
            )}
            <div className="bg-muted/30 rounded-xl p-4 mb-4 border border-border">
              <p className="text-muted-foreground text-sm leading-relaxed line-clamp-4">
                {content.length > 200 ? content.substring(0, 200) + "..." : content}
              </p>
            </div>
            <Link
              to={"/news/" + id}
              className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors duration-300 group/link"
            >
              {t('home.lire_suite')}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </Card>
      );
    });
  }, [news]);

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-900/20 to-blue-800/20 backdrop-blur font-sans">
        <div className="flex items-center justify-center pt-32">
          <Card className="text-center p-10 ring-1 ring-rose-100/50 rounded-2xl max-w-md">
            <div className="w-16 h-16 bg-rose-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <AlertTriangle className="w-8 h-8 text-rose-500 dark:text-rose-400" />
            </div>
            <h2 className="text-2xl font-bold text-rose-600 dark:text-rose-400 mb-2">{t('home.erreur_chargement')}</h2>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button
              onClick={() => { setError(null); setLoading(true); fetchNews(); }}
            >
              {t('home.reesayer')}
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900/20 to-blue-800/20 backdrop-blur font-sans">
      <Skeleton className="h-screen w-full" />
      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-40 rounded-2xl" />)}
        </div>
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-64 rounded-2xl" />)}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900/20 to-blue-800/20 backdrop-blur font-sans">
      <section className="relative h-screen">
        <div className="relative top-0 left-0 right-0 h-[100%]">
          {siteConfig.groupPhoto ? (
            <>
              <img
                src={
                  siteConfig.groupPhoto.startsWith("http")
                    ? siteConfig.groupPhoto
                    : API_URL + siteConfig.groupPhoto
                }
                alt="Photo de groupe JCI Sidi Mansour"
                className="w-full h-full object-cover object-top"
                loading="eager"
              />

              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(to bottom, transparent 0%, rgb(30 58 138)  95%)",
                }}
              >
                <div className="relative z-10 pt-6 md:pt-10 pb-2 md:pb-4">
                  <div className="animate-fade-in-up w-full max-w-5xl mx-auto text-center flex flex-col space-y-[5vh] px-4 md:mt-[150px]" style={{ marginTop: 100 }}>
                    {!logoError ? (
                      <center>
                        <img
                          src="/images/logo-jci-white.png"
                          alt="JCI"
                          className="h-30 sm:h-30 md:h-[26rem] lg:h-[30.8rem] lg:w-[30.8rem] mb-[-110px] sm:mb-[-130px] md:mb-[-130px] lg:mb-[-150px]"
                          loading="lazy"
                          onError={() => setLogoError(true)}
                        />
                      </center>
                    ) : (
                      <div className="text-3xl md:text-5xl font-bold text-white">JCI</div>
                    )}
                    <h1 className="text-3xl md:text-5xl lg:text-8xl font-bold text-white drop-shadow-2xl">
                      JCI Sidi Mansour
                    </h1>
                    <p className="text-2xl md:text-4xl font-normal text-blue-200 drop-shadow-2xl">
                      {siteConfig.slogan || t('home.hero_sous_titre')}
                    </p>
                    <div className="mt-8">
                      <Button asChild size="lg" className="text-lg px-10 py-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-300">
                        <Link to="/register" className="inline-flex items-center gap-2">
                          {t('home.rejoignez_nous')}
                          <ArrowRight className="w-5 h-5" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="w-full h-full bg-primary-700" />
          )}
        </div>
      </section>
      <section className="relative bg-gradient-to-b from-blue-900/100 via-blue-800/70 to-white/80 backdrop-blur pb-12 md:pb-16">
        <div className="h-[5vh] md:h-[6vh]" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {[
              { value: stats.membres, label: t('home.stats_membres'), icon: <Users className="w-8 h-8" /> },
              { value: stats.evenements, label: t('home.stats_evenements'), icon: <CalendarDays className="w-8 h-8" /> },
              { value: stats.action, label: t('home.stats_action'), icon: <Rocket className="w-8 h-8" /> },
              { value: stats.formations, label: t('home.stats_formations'), icon: <GraduationCap className="w-8 h-8" /> },
            ].map((stat, i) => (
              <div
                key={stat.label}
                className="bg-white dark:bg-gray-800 rounded-2xl text-center p-5 md:p-7 animate-fade-in-up shadow-lg ring-1 ring-gray-200 dark:ring-gray-700"
                style={{ animationDelay: (i * 0.1) + "s" }}
              >
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300">
                  {stat.icon}
                </div>
                <div className="text-4xl md:text-5xl font-bold text-blue-600 dark:text-blue-300 mb-1">
                  {statsLoading ? (
                    <span className="inline-block w-16 h-8 bg-blue-200/50 rounded-lg animate-pulse" />
                  ) : (
                    <>{stat.value}+</>
                  )}
                </div>
                <div className="text-blue-600 dark:text-blue-400 text-sm font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="py-20 md:py-28 bg-white/80 dark:bg-gray-900/95">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-blue-800 dark:text-blue-300 mb-3">
              JCI Sidi Mansour
            </h2>
            <p className="text-blue-600 dark:text-blue-400 font-normal text-lg">
              {t('home.a_propos')}
            </p>
            <div className="grid md:grid-cols-2 gap-8 mt-12">
              <Card className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg ring-1 ring-gray-200 dark:ring-gray-700 p-8 text-left">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 rounded-xl flex items-center justify-center mb-4">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-blue-800 dark:text-blue-300 dark:text-blue-300 text-xl mb-3">{t('home.notre_mission')}</h3>
                <p className="text-blue-600 dark:text-blue-400 leading-relaxed font-normal">{t('about.mission_texte')}</p>
              </Card>
              <Card className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg ring-1 ring-gray-200 dark:ring-gray-700 p-8 text-left">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 rounded-xl flex items-center justify-center mb-4">
                  <Eye className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-blue-800 dark:text-blue-300 dark:text-blue-300 text-xl mb-3">{t('home.notre_vision')}</h3>
                <p className="text-blue-600 dark:text-blue-400 leading-relaxed font-normal">{t('about.vision_texte')}</p>
              </Card>
            </div>
            <Link to="/about" className="inline-flex items-center gap-2 mt-10 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 border border-blue-300 hover:border-blue-500 px-6 py-3 rounded-xl font-normal transition-all duration-300">
              {t('home.en_savoir_plus')}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
      <section className="py-20 md:py-28 bg-white/80 dark:bg-gray-900/95">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-blue-800 dark:text-blue-300">{t('home.bureau')} {new Date().getFullYear()}</h2>
          </div>
          <div className="flex flex-wrap justify-center gap-4 md:gap-6 mb-6">
            {["Conseiller Juridique", "President", "Past President Immédiat"].map(role => {
              const m = members.find(mm => mm.role === role);
              const isPresident = role === "President";
              const nonAttribue = !m;
              return (
                <div key={role} className={"group flex flex-col items-center animate-fade-in-up bg-white dark:bg-gray-800 rounded-2xl ring-1 ring-gray-200 dark:ring-gray-700 shadow-lg p-4 md:p-5 transition-all duration-300 hover:shadow-xl " + (isPresident ? "w-64 md:w-72 ring-2 ring-blue-400 shadow-xl shadow-blue-500/20 scale-105 md:scale-110" : "w-44 md:w-52")}>
                  <div className={"rounded-2xl flex items-center justify-center text-white font-bold mx-auto mb-3 overflow-hidden bg-gradient-to-br " + (nonAttribue ? "from-gray-300 to-gray-400" : "from-blue-500 to-blue-700") + " " + (isPresident ? "w-40 h-40 md:w-44 md:h-44 text-5xl shadow-lg shadow-blue-500/30" : "w-28 h-28 md:w-32 md:h-32 text-3xl")}>
                    {nonAttribue ? (
                      <Users className="w-10 h-10 md:w-12 md:h-12 text-white/60" />
                    ) : m.photo ? (
                      <img src={m.photo} alt={m.prenom + " " + m.nom} className="w-full h-full object-cover" />
                    ) : (
                      <span>{(m.prenom?.[0] || "").toUpperCase()}{(m.nom?.[0] || "").toUpperCase()}</span>
                    )}
                  </div>
                  <div className="flex flex-col w-full text-center">
                    <h3 className={"font-bold leading-tight " + (nonAttribue ? "text-gray-400 dark:text-gray-500 text-sm" : isPresident ? "text-blue-800 dark:text-blue-300 text-base md:text-lg" : "text-blue-800 dark:text-blue-300 text-sm md:text-base")}>
                      {nonAttribue ? t('home.poste_non_attribue') : m.prenom + " " + m.nom}
                    </h3>
                    <p className={"mt-1 font-medium " + (isPresident ? "text-sm md:text-base text-blue-600 dark:text-blue-400" : "text-xs md:text-sm text-blue-600 dark:text-blue-400")}>
                      {translateMemberRole(role)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex flex-wrap justify-center gap-4 md:gap-8">
            {["VPPRE", "VPFD", "Tresorie", "SecretaireGeneral"].map(role => {
              const m = members.find(mm => mm.role === role);
              const nonAttribue = !m;
              return (
                <div key={role} className="group flex flex-col items-center animate-fade-in-up bg-white dark:bg-gray-800 rounded-2xl ring-1 ring-gray-200 dark:ring-gray-700 shadow-lg p-4 md:p-5 w-44 md:w-52 transition-all duration-300 hover:shadow-xl">
                  <div className={"w-28 h-28 md:w-32 md:h-32 rounded-2xl flex items-center justify-center text-white text-3xl font-bold mx-auto mb-3 overflow-hidden bg-gradient-to-br " + (nonAttribue ? "from-gray-300 to-gray-400" : "from-blue-500 to-blue-700")}>
                    {nonAttribue ? (
                      <Users className="w-10 h-10 text-white/60" />
                    ) : m.photo ? (
                      <img src={m.photo} alt={m.prenom + " " + m.nom} className="w-full h-full object-cover" />
                    ) : (
                      <span>{(m.prenom?.[0] || "").toUpperCase()}{(m.nom?.[0] || "").toUpperCase()}</span>
                    )}
                  </div>
                  <div className="flex flex-col w-full text-center">
                    <h3 className={"font-bold leading-tight " + (nonAttribue ? "text-gray-400 dark:text-gray-500 text-sm" : "text-blue-800 dark:text-blue-300 text-sm md:text-base")}>
                      {nonAttribue ? t('home.poste_non_attribue') : m.prenom + " " + m.nom}
                    </h3>
                    <p className="text-xs md:text-sm text-blue-600 dark:text-blue-400 mt-1 font-medium">
                      {translateMemberRole(role)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
      <section className="py-20 md:py-28 bg-white/80 dark:bg-gray-900/95">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-blue-800 dark:text-blue-300 flex items-center gap-2">
                <Sparkles className="w-7 h-7 text-blue-500 dark:text-blue-300" />
                {t('home.actualites')}
              </h2>
              <p className="text-blue-500 dark:text-blue-300 font-normal mt-1">{t('home.actualites_texte')}</p>
            </div>
            <Link to="/actualites" className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 font-normal">
              {t('home.voir_toutes')}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {!newsCards ? (
            <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl shadow-lg ring-1 ring-gray-200 dark:ring-gray-700">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Newspaper className="w-12 h-12 text-blue-600 dark:text-blue-300" />
              </div>
              <h3 className="text-xl font-bold text-blue-800 dark:text-blue-300 mb-2">{t('home.aucune_actualite')}</h3>
              <p className="text-blue-600 dark:text-blue-400 font-normal">{t('home.premiere_actualite')}</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {newsCards}
            </div>
          )}
        </div>
      </section>

      <section className="py-20 md:py-28 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-blue-800 dark:text-blue-300">{t('home.nous_contacter')}</h2>
            <p className="text-blue-500 dark:text-blue-300 font-normal mt-1">{t('home.contact_texte')}</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <MapPin className="w-6 h-6" />, title: t('home.adresse'), value: jci.adresse },
              { icon: <Phone className="w-6 h-6" />, title: t('home.telephone'), value: jci.telephone_display, href: jci.telephone_lien },
              { icon: <Mail className="w-6 h-6" />, title: t('home.email'), value: jci.email, href: "mailto:" + jci.email },
              { icon: <Globe className="w-6 h-6" />, title: t('home.site_web'), value: jci.site_web, href: jci.site_web_url },
            ].map((item) => (
              <Card key={item.title} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg ring-1 ring-gray-200 dark:ring-gray-700 text-center p-8">
                <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 rounded-2xl flex items-center justify-center mx-auto mb-5">
                  {item.icon}
                </div>
                <h3 className="font-bold text-blue-800 dark:text-blue-300 mb-2">{item.title}</h3>
                {item.href ? (
                  <a href={item.href} className="text-blue-600 dark:text-blue-400 text-sm hover:text-blue-800 dark:hover:text-blue-200 transition-colors font-normal">
                    {item.value}
                  </a>
                ) : (
                  <p className="text-blue-600 dark:text-blue-400 text-sm font-normal">{item.value}</p>
                )}
              </Card>
            ))}
          </div>
          <div className="mt-12 rounded-2xl overflow-hidden shadow-lg ring-1 ring-gray-200 dark:ring-gray-700">
            <iframe
              src={jci.maps}
              width="100%"
              height="400"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title={t('home.map_title')}
              className="w-full"
            />
          </div>
        </div>
      </section>

      <SocialFollowSection jci={jci} t={t} />

      <section className="py-20 md:py-28 bg-blue-50 dark:bg-blue-950 overflow-hidden relative">
        <div className="absolute inset-0 opacity-[0.04]">
          <svg className="w-full h-full" viewBox="0 0 1440 900" preserveAspectRatio="none">
            <defs>
              <pattern id="grid4" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid4)" />
          </svg>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-blue-800 dark:text-blue-300 mb-4">{t('home.cta_titre')}</h2>
            <p className="text-lg mb-10 text-blue-600 leading-relaxed font-normal">
              {t('home.cta_texte')}
            </p>
            {!user ? (
              <Button asChild size="lg" className="text-lg">
                <Link to="/register" className="inline-flex items-center">
                  {t('home.inscrire_maintenant')}
                </Link>
              </Button>
            ) : (
              <Button asChild size="lg" className="text-lg">
                <Link to="/dashboard" className="inline-flex items-center">
                  {t('home.acceder_tableau_bord')}
                </Link>
              </Button>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
