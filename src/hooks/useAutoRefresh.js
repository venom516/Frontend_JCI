import { useEffect, useRef } from "react";

export function useAutoRefresh(refresh, { interval = 30000, enabled = true } = {}) {
  const refreshRef = useRef(refresh);
  refreshRef.current = refresh;
  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;

  useEffect(() => {
    if (!enabledRef.current) return undefined;

    const doRefresh = () => {
      if (enabledRef.current && document.visibilityState === "visible") {
        refreshRef.current?.();
      }
    };

    const onFocus = () => doRefresh();
    const onVisibility = () => {
      if (document.visibilityState === "visible") doRefresh();
    };

    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);
    const timer = setInterval(doRefresh, interval);

    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
      clearInterval(timer);
    };
  }, [interval, enabled]);
}