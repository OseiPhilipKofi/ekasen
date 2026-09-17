import { useCallback, useState } from "react";
import { UserRound, ShieldCheck, UploadCloud } from "lucide-react";
import toast from "react-hot-toast";
import api from "../lib/api";
import { useApiData } from "../hooks/useApiData";
import { previewImage } from "../components/GlobalImagePreview";
import PageHeader from "../components/PageHeader";

export default function AccountPage() {
  const load = useCallback(
    () => api.get("/account").then((res) => res.data.account || {}),
    [],
  );
  const { data: account, setData: setAccount } = useApiData(load, {});
  const [form, setForm] = useState({});
  const [filePreview, setFilePreview] = useState(null);

  const update = (key, value) => {
    setForm({ ...form, [key]: value });
    if (value instanceof File) {
      const reader = new FileReader();
      reader.onloadend = () => setFilePreview(reader.result);
      reader.readAsDataURL(value);
    }
  };

  const save = async (event) => {
    event.preventDefault();
    const data = new FormData();

    if (form.phone) data.append("phone", form.phone);
    if (form.profile_photo) data.append("profile_photo", form.profile_photo);

    try {
      await api.post("/account", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setAccount({ ...account, ...form });
      setFilePreview(null);
      toast.success("Contact details updated.");
    } catch (error) {
      toast.error(error.response?.data?.error || "Account update failed.");
    }
  };

  return (
    <section className="section narrow-page">
      <PageHeader
        eyebrow="Account details"
        title="Your teacher profile."
        description="Manage your contact details and profile photo. Professional identity details are read-only."
      />

      <form className="form-card account-card" onSubmit={save}>
        <div className="">
          <div
              onClick={() =>
                previewImage(
                  filePreview ||
                    (account.profile_photo_path
                      ? `/api/${account.profile_photo_path}`
                      : "/assets/avatar.png"),
                )
              }
              style={{
                width: "100px",
                height: "100px",
                minWidth: "100px",
                minHeight: "100px",
                borderRadius: "50%",
                border: "2px dashed #ccc",
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#f9f9f9",
                cursor: "pointer",
              }}
            >
              {filePreview ? (
                <img
                  src={filePreview}
                  alt="Preview"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <img
                  src={
                    account.profile_photo_path
                      ? `/api/${account.profile_photo_path}`
                      : "/assets/avatar.png"
                  }
                  alt="Current"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              )}
            </div>
        </div>

        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <strong style={{ fontSize: "1.2rem", display: "block" }}>
            {account.name || "Your name"}
          </strong>
          <p style={{ opacity: 0.7 }}>{account.email || "Your Google email"}</p>
        </div>

        <label>
          Full name
          <input
            readOnly
            value={account.name ?? ""}
            style={{ opacity: 0.6, cursor: "not-allowed" }}
          />
        </label>

        <label>
          Email
          <input
            readOnly
            type="email"
            value={account.email ?? ""}
            style={{ opacity: 0.6, cursor: "not-allowed" }}
          />
        </label>

        <label>
          Phone
          <input
            required
            value={form.phone ?? account.phone ?? ""}
            onChange={(event) => update("phone", event.target.value)}
          />
        </label>

        <label>
          School / institution
          <input
            readOnly
            value={account.school_name ?? ""}
            style={{ opacity: 0.6, cursor: "not-allowed" }}
          />
        </label>

        <label>
          Staff ID
          <input
            readOnly
            value={account.staff_id ?? ""}
            style={{ opacity: 0.6, cursor: "not-allowed" }}
          />
        </label>

        <label>
          Profile photo
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              marginBottom: "1rem",
            }}
          >
            <div
              onClick={() =>
                previewImage(
                  filePreview ||
                    (account.profile_photo_path
                      ? `/api/${account.profile_photo_path}`
                      : "/assets/avatar.png"),
                )
              }
              style={{
                width: "80px",
                height: "80px",
                minWidth: "80px",
                minHeight: "80px",
                borderRadius: "50%",
                border: "2px dashed #ccc",
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#f9f9f9",
                cursor: "pointer",
              }}
            >
              {filePreview ? (
                <img
                  src={filePreview}
                  alt="Preview"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <img
                  src={
                    account.profile_photo_path
                      ? `/api/${account.profile_photo_path}`
                      : "/assets/avatar.png"
                  }
                  alt="Current"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              )}
            </div>
            <span className="file-input">
              <UploadCloud size={17} /> Choose image
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.webp"
                onChange={(event) =>
                  update("profile_photo", event.target.files[0])
                }
              />
            </span>
          </div>
        </label>

        <dl>
          <dt>Verification</dt>
          <dd>
            <ShieldCheck size={15} /> {account.verification_status || "pending"}
          </dd>
        </dl>

        <button className="button primary">Save contact changes</button>
      </form>
    </section>
  );
}
