import { useState } from "react";
import { UserRound } from "lucide-react";

export function profileImageUrl(path) {
  if (!path) return null;
  if (/^[a-z][a-z0-9+.-]*:/i.test(path)) return path;

  const apiBaseUrl = import.meta.env.VITE_API_URL || "http://localhost/api";
  const apiOrigin = new URL(apiBaseUrl, window.location.origin).origin;
  return new URL(path.replace(/^\/+/, ""), `${apiOrigin}/`).toString();
}

export default function ProfileAvatar({
  src,
  alt = "Profile image",
  size = 72,
  onClick,
  square = false,
  fallbackIcon: FallbackIcon = UserRound,
}) {
  const imageUrl = profileImageUrl(src);
  const [failedUrl, setFailedUrl] = useState(null);
  const dimension = typeof size === "number" ? `${size}px` : size;

  if (!imageUrl || failedUrl === imageUrl) {
    return (
      <span
        className="profile-avatar-placeholder"
        aria-label={alt}
        role="img"
        onClick={onClick}
        style={{ width: dimension, height: dimension, borderRadius: square ? "16px" : "50%" }}
      >
        <FallbackIcon aria-hidden="true" size={typeof size === "number" ? Math.max(22, size * 0.42) : 32} />
      </span>
    );
  }

  return (
    <img
      className="profile-avatar"
      src={imageUrl}
      alt={alt}
      onError={() => setFailedUrl(imageUrl)}
      onClick={onClick}
      style={{ width: dimension, height: dimension, borderRadius: square ? "16px" : "50%" }}
    />
  );
}
