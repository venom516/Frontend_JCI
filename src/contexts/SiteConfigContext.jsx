import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { siteConfigAPI } from "../api/axios";

const SiteConfigContext = createContext();

export const useSiteConfig = () => useContext(SiteConfigContext);

export const SiteConfigProvider = ({ children }) => {
  const [config, setConfig] = useState({ slogan: "One Team, One Impact", groupPhoto: "" });
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await siteConfigAPI.get();
      setConfig(res.data.data);
    } catch {
      setConfig({ slogan: "One Team, One Impact", groupPhoto: "" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  return (
    <SiteConfigContext.Provider value={{ config, loading, refresh }}>
      {children}
    </SiteConfigContext.Provider>
  );
};
