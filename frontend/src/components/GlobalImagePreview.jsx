import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function GlobalImagePreview() {
  const [image, setImage] = useState(null);

  useEffect(() => {
    const handlePreview = (e) => {
      setImage(e.detail.src);
    };
    window.addEventListener("preview-image", handlePreview);
    return () => window.removeEventListener("preview-image", handlePreview);
  }, []);

  if (!image) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setImage(null)}
        className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/90 p-4 cursor-zoom-out"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "rgba(0,0,0,0.9)",
          zIndex: 1000,
          padding: "1rem",
        }}
      >
        <button
          onClick={() => setImage(null)}
          className="absolute top-6 right-6 text-white p-2 rounded-full hover:bg-white/10 transition-colors"
          style={{
            position: "absolute",
            top: "1.5rem",
            right: "1.5rem",
            color: "white",
            padding: "0.5rem",
            borderRadius: "50%",
            border: "none",
            background: "none",
            cursor: "pointer",
          }}
        >
          <X size={32} />
        </button>

        <motion.img
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          src={image}
          alt="Full screen preview"
          style={{
            maxWidth: "90vw",
            maxHeight: "90vh",
            objectFit: "contain",
            borderRadius: "0.5rem",
            boxShadow: "0 20px 25px -5px rgba(0,0,0,0.5)",
          }}
        />
      </motion.div>
    </AnimatePresence>
  );
}

export const previewImage = (src) => {
  window.dispatchEvent(new CustomEvent("preview-image", { detail: { src } }));
};
