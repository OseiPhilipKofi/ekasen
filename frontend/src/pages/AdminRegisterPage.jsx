import { useState } from "react";
import { UploadCloud, FileText, Image as ImageIcon } from "lucide-react";
import toast from "react-hot-toast";
import api from "../lib/api";
import { previewImage } from "../components/GlobalImagePreview";
import PageHeader from "../components/PageHeader";
import AdminNav from "../components/AdminNav";

const initial = {
  name: "",
  email: "",
  phone: "",
  school_name: "",
  staff_id: "",
  national_id: "",
  birth_date: "",
  profile_photo: null,
  ghana_card: null,
  birth_certificate: null,
  teacher_certificate: null,
};

export default function AdminRegisterPage() {
  const [form, setForm] = useState(initial);
  const [previews, setPreviews] = useState({});

  const update = (key, value) => {
    setForm({ ...form, [key]: value });

    if (value instanceof File) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews((prev) => ({ ...prev, [key]: reader.result }));
      };
      reader.readAsDataURL(value);
    }
  };

  const submit = async (event) => {
    event.preventDefault();
    const data = new FormData();
    Object.entries(form).forEach(
      ([key, value]) => value && data.append(key, value),
    );
    try {
      await api.post("/admin/teachers/register", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Teacher registered successfully.");
      setForm(initial);
      setPreviews({});
    } catch (error) {
      toast.error(
        error.response?.data?.error || "Teacher registration failed.",
      );
    }
  };

  return (
    <section className="section dashboard">
      <AdminNav />
      <PageHeader
        eyebrow="Admin · registration"
        title="Register a teacher member."
        description="The admin creates the teacher record and attaches validated identity evidence before investor enrollment."
      />
      <form className="form-card" onSubmit={submit}>
        <div
          className="form-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "1rem",
          }}
        >
          <label>
            Full name
            <input
              required
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
            />
          </label>
          <label>
            Email
            <input
              required
              type="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
            />
          </label>
          <label>
            Phone
            <input
              required
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
            />
          </label>
          <label>
            School / institution
            <input
              required
              value={form.school_name}
              onChange={(e) => update("school_name", e.target.value)}
            />
          </label>
          <label>
            Staff ID
            <input
              required
              value={form.staff_id}
              onChange={(e) => update("staff_id", e.target.value)}
            />
          </label>
          <label>
            National ID Number
            <input
              value={form.national_id}
              onChange={(e) => update("national_id", e.target.value)}
            />
          </label>
          <label>
            Birth Date
            <input
              type="date"
              value={form.birth_date}
              onChange={(e) => update("birth_date", e.target.value)}
            />
          </label>
        </div>

        <div className="upload-section" style={{ marginTop: "1.5rem" }}>
          <h3 style={{ fontSize: "1rem", marginBottom: "1rem", opacity: 0.8 }}>
            Verification Documents
          </h3>
          {[
            {
              key: "profile_photo",
              label: "Profile photo",
              icon: <ImageIcon size={16} />,
              isImage: true,
            },
            {
              key: "ghana_card",
              label: "Ghana Card / national ID",
              icon: <FileText size={16} />,
              isImage: true,
            },
            {
              key: "birth_certificate",
              label: "Birth certificate",
              icon: <FileText size={16} />,
              isImage: true,
            },
            {
              key: "teacher_certificate",
              label: "Teacher certificate",
              icon: <FileText size={16} />,
              isImage: true,
            },
          ].map((field) => (
            <div
              key={field.key}
              style={{
                marginBottom: "1.5rem",
                display: "flex",
                alignItems: "flex-start",
                gap: "1rem",
              }}
            >
              <div
                onClick={() =>
                  previews[field.key] && previewImage(previews[field.key])
                }
                className="preview-box mt-4"
                style={{
                  width: "80px",
                  height: "80px",
                  minWidth: "80px",
                  minHeight: "80px",
                  borderRadius: "0.5rem",
                  overflow: "hidden",
                  border: "1px solid var(--brand-line)",
                  background: "var(--brand-card-tint)",
                  cursor: previews[field.key] ? "pointer" : "default",
                  flexShrink: 0,
                  marginTop: "1rem",
                }}
              >
                {previews[field.key] ? (
                  field.isImage ? (
                    <img
                      src={previews[field.key]}
                      alt="Preview"
                      style={{ width: "100%", height: "100%", objectFit: "cover", }} />
                  ) : (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", fontSize: "0.7rem", textAlign: "center", padding: "2px",
                      }}
                    >
                      PDF
                    </div>
                  )
                ) : (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", opacity: 0.3,
                    }} >
                    {field.icon}
                  </div>
                )}
              </div>
              <label style={{ flex: 1 }}>
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    marginBottom: "0.5rem",
                    fontWeight: "bold",
                  }}
                >
                  {field.icon} {field.label}
                </span>
                <span className="file-input">
                  <UploadCloud size={17} /> Choose file
                  <input
                    required={field.key !== "profile_photo"}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => update(field.key, e.target.files[0])}
                  />
                </span>
              </label>
            </div>
          ))}
        </div>

        <button className="button primary">Register teacher</button>
      </form>
    </section>
  );
}
