import { useCallback, useState } from "react";
import { ShieldCheck, UploadCloud } from "lucide-react";
import toast from "react-hot-toast";
import api from "../lib/api";
import { useApiData } from "../hooks/useApiData";
import { previewImage } from "../components/GlobalImagePreview";
import PageHeader from "../components/PageHeader";
import ProfileAvatar, { profileImageUrl } from "../components/ProfileAvatar";
import { useAuth } from "../hooks/useAuth";

export default function AccountPage() {
  const load = useCallback(
    () => api.get("/account").then((res) => res.data.account || {}),
    [],
  );
  const { user } = useAuth();
  const { data: account, setData: setAccount } = useApiData(load, {});
  const [form, setForm] = useState({});
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const isAdmin = user?.role === "admin";

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const photoPath = filePreview || account.profile_photo_path;
  const photoUrl = profileImageUrl(photoPath);

  const choosePhoto = (event) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;
    setFile(selectedFile);
    const reader = new FileReader();
    reader.onloadend = () => setFilePreview(reader.result);
    reader.readAsDataURL(selectedFile);
  };

  const save = async (event) => {
    event.preventDefault();
    const data = new FormData();
    ["phone", "school_name", "national_id", "birth_date"].forEach((key) => {
      data.append(key, form[key] ?? account[key] ?? "");
    });
    if (isAdmin) data.append("staff_id", form.staff_id ?? account.staff_id ?? "");
    if (file) data.append("profile_photo", file);

    try {
      const response = await api.post("/account", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setAccount(response.data.account || { ...account, ...form });
      setForm({});
      setFile(null);
      setFilePreview(null);
      toast.success("Profile details updated.");
    } catch (error) {
      toast.error(error.response?.data?.error || "Profile update failed.");
    }
  };

  const openPhoto = () => {
    if (photoUrl) previewImage(photoUrl);
  };

  return (
    <section className="section narrow-page account-page">
      <PageHeader
        eyebrow="Account details"
        title="Your profile."
        description="Update your contact and teaching details. Your name and email are managed by Google sign-in."
      />

      <form className="form-card account-card" onSubmit={save}>
        <div className="account-profile">
          <ProfileAvatar src={photoPath} alt={account.name || "Profile photo"} size={112} onClick={openPhoto} />
          <div>
            <strong>{account.name || user?.name || "Your name"}</strong>
            <span>{account.email || user?.email || "Your Google email"}</span>
          </div>
        </div>

        <div className="profile-fields">
          <label>
            Full name <input readOnly value={account.name ?? user?.name ?? ""} />
            <small>Managed by your Google account.</small>
          </label>
          <label>
            Email <input readOnly type="email" value={account.email ?? user?.email ?? ""} />
            <small>Managed by your Google account.</small>
          </label>
          <label>
            Phone
            <input
              type="tel"
              value={form.phone ?? account.phone ?? ""}
              onChange={(event) => update("phone", event.target.value)}
              autoComplete="tel"
            />
          </label>
          <label>
            School / institution
            <input
              value={form.school_name ?? account.school_name ?? ""}
              onChange={(event) => update("school_name", event.target.value)}
            />
          </label>
          <label>
            National ID
            <input
              value={form.national_id ?? account.national_id ?? ""}
              onChange={(event) => update("national_id", event.target.value)}
            />
          </label>
          <label>
            Birth date
            <input
              type="date"
              value={form.birth_date ?? account.birth_date ?? ""}
              onChange={(event) => update("birth_date", event.target.value)}
            />
          </label>
          <label>
            Staff ID
            <input
              readOnly={!isAdmin}
              value={form.staff_id ?? account.staff_id ?? ""}
              onChange={(event) => update("staff_id", event.target.value)}
            />
            <small>{isAdmin ? "Administrators can manage staff IDs." : "Only an administrator can change your staff ID."}</small>
          </label>
          <label>
            Profile photo
            <span className="file-input">
              <UploadCloud size={17} /> {file?.name || "Choose an image"}
              <input type="file" accept=".jpg,.jpeg,.png,.webp" onChange={choosePhoto} />
            </span>
          </label>
        </div>

        <div className="account-status">
          <span>Verification</span>
          <strong><ShieldCheck size={16} /> {account.verification_status || "pending"}</strong>
        </div>
        <button className="button primary" type="submit">Save profile details</button>
      </form>
    </section>
  );
}
