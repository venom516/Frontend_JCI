// frontend/src/contexts/AuthContext.jsx

import React, { createContext, useContext, useState, useEffect } from "react";
import { authAPI } from "../api/axios";
import toast from "react-hot-toast";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem("token") || null);

  // ============================================================
  // CHARGER L'UTILISATEUR AU DÉMARRAGE
  // ============================================================
  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const response = await authAPI.getMe();
          setUser(response.data.data);
        } catch (error) {
          if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            localStorage.removeItem("token");
            setToken(null);
            setUser(null);
          }
          if (!error.response) {
            console.warn("⚠️ Connexion au serveur impossible (réseau faible)");
          }
        }
      }
      setLoading(false);
    };
    loadUser();

    const handleUnauthorized = () => {
      setToken(null);
      setUser(null);
    };
    window.addEventListener("auth:unauthorized", handleUnauthorized);
    return () => window.removeEventListener("auth:unauthorized", handleUnauthorized);
  }, [token]);

  // ============================================================
  // 1. INSCRIPTION
  // ============================================================
  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      
      return {
        success: true,
        message: response.data.message || "Inscription réussie ! Veuillez vérifier votre email.",
        data: response.data.data
      };
    } catch (error) {

      
      const message = error.response?.data?.message || "Erreur lors de l'inscription";
      return {
        success: false,
        message: message
      };
    }
  };

  // ============================================================
  // 2. CONNEXION
  // ============================================================
  const login = async (email, password) => {
    try {
      const response = await authAPI.login({ email, password });
      const { token, membre } = response.data.data;
      
      localStorage.setItem("token", token);
      setToken(token);
      setUser(membre);
      
      return {
        success: true,
        message: response.data.message || "Connexion réussie",
        data: membre
      };
    } catch (error) {
      const message = error.response?.data?.message || "Erreur de connexion";
      return {
        success: false,
        message: message
      };
    }
  };

  // ============================================================
  // 3. VÉRIFICATION EMAIL
  // ============================================================
  const verifyEmail = async (email, code) => {
    try {
      const response = await authAPI.verifyEmail({ email, code });
      return {
        success: true,
        message: response.data.message || "Email vérifié avec succès"
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Erreur de vérification"
      };
    }
  };

  // ============================================================
  // 4. DÉCONNEXION
  // ============================================================
  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  // ============================================================
  // 5. LOGIN VIA TOKEN (magic link)
  // ============================================================
  const loginWithToken = async (token) => {
    const response = await authAPI.tokenLogin({ token });
    const { token: newToken, membre } = response.data.data;
    localStorage.setItem("token", newToken);
    setToken(newToken);
    setUser(membre);
  };

  // ============================================================
  // 6. FONCTIONS DE RÔLES
  // ============================================================
  const hasRole = (role) => {
    return user?.role === role;
  };

  const hasAnyRole = (roles) => {
    if (!roles || roles.length === 0) return true;
    return roles.includes(user?.role);
  };

  // ============================================================
  // 6. RÔLES UTILISATEUR (DÉRIVÉS)
  // ============================================================
  const isPresident = user?.role === "President";
  const isSecretaire = user?.role === "SecretaireGeneral";
  const isMedia = user?.role === "ConseillerMedia";
  const isAdmin = user?.role === "Admin";
  const isMember = user?.role === "Membre" || !user?.role;
  const isAuthenticated = !!user;

  // ============================================================
  // 7. VALEURS DU CONTEXTE
  // ============================================================
  const value = {
    user,
    setUser,
    loading,
    token,
    register,
    login,
    loginWithToken,
    verifyEmail,
    logout,
    hasRole,
    hasAnyRole,
    isPresident,
    isSecretaire,
    isMedia,
    isAdmin,
    isMember,
    isAuthenticated
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// ============================================================
// HOOK PERSONNALISÉ
// ============================================================
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth doit être utilisé à l'intérieur d'un AuthProvider");
  }
  return context;
};

export default AuthContext;