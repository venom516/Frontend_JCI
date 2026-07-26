import React from "react";
import { useI18n } from "../../contexts/I18nContext";

export default function LoadingScreen({ fullScreen = true, text }) {
  const { t } = useI18n();
  const displayText = text || t("common.chargement");
  return (
    <div
      className={`${fullScreen ? "fixed inset-0 z-[9999]" : "absolute inset-0"} flex items-center justify-center bg-background/80 backdrop-blur-sm`}
    >
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-muted"></div>
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin"></div>
          <div className="absolute inset-2 rounded-full border-4 border-transparent border-b-primary animate-spin [animation-duration:1.5s]"></div>
        </div>
        <p className="text-sm font-medium text-muted-foreground animate-pulse">{displayText}</p>
      </div>
    </div>
  );
}
