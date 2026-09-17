import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function RouteLoader() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.dispatchEvent(new CustomEvent("app-loading", { detail: { loading: true } }));

    // We simulate a small delay to ensure the bar is visible and feels natural
    const timer = setTimeout(() => {
      window.dispatchEvent(new CustomEvent("app-loading", { detail: { loading: false } }));
    }, 100);

    return () => clearTimeout(timer);
  }, [pathname]);

  return null;
}
