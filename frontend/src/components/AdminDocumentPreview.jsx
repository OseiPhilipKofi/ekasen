import { useEffect, useState } from "react";
import { FileText } from "lucide-react";
import toast from "react-hot-toast";
import api from "../lib/api";
import { previewImage } from "./GlobalImagePreview";

export default function AdminDocumentPreview({ teacherId, document }) {
  const [file, setFile] = useState(null);

  useEffect(() => {
    let active = true;
    let objectUrl;
    setFile(null);

    api
      .get(`/admin/teachers/${teacherId}/documents/${document.id}`, {
        responseType: "blob",
      })
      .then((response) => {
        if (!active) return;
        objectUrl = URL.createObjectURL(response.data);
        setFile({ url: objectUrl, mimeType: response.headers["content-type"] || "" });
      })
      .catch(() => {
        if (active) toast.error(`Could not load ${document.document_type} document.`);
      });

    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [document.document_type, document.id, teacherId]);

  if (!file) {
    return (
      <span className="profile-avatar-placeholder" role="img" aria-label="Loading document">
        <FileText aria-hidden="true" size={32} />
      </span>
    );
  }

  if (file.mimeType.startsWith("image/")) {
    return (
      <img
        className="profile-avatar"
        src={file.url}
        alt={document.original_name || document.document_type}
        onClick={() => previewImage(file.url)}
        style={{ width: "100%", height: "220px", borderRadius: "12px", cursor: "zoom-in" }}
      />
    );
  }

  return (
    <a
      className="button secondary compact"
      href={file.url}
      target="_blank"
      rel="noreferrer"
    >
      <FileText size={16} /> View PDF
    </a>
  );
}
