import { useState, useEffect } from "react";

export default function TopLoadingBar() {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleLoading = (e) => {
      const { loading } = e.detail;
      if (loading) {
        setIsVisible(true);
        setProgress(10); // Start at 10%
      } else {
        setProgress(100); // Fill up
        setTimeout(() => {
          setIsVisible(false);
          setProgress(0);
        }, 300);
      }
    };

    window.addEventListener("app-loading", handleLoading);
    return () => window.removeEventListener("app-loading", handleLoading);
  }, []);

  useEffect(() => {
    let interval;
    if (isVisible && progress < 90) {
      interval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 5, 90));
      }, 200);
    }
    return () => clearInterval(interval);
  }, [isVisible, progress]);

  if (!isVisible) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "2px",
        zIndex: 9999,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          width: `${progress}%`,
          height: "100%",
          backgroundColor: "var(--brand-primary)",
          transition: "width 0.3s ease-out",
          boxShadow: "0 0 10px var(--brand-primary)",
        }}
      />
    </div>
  );
}
