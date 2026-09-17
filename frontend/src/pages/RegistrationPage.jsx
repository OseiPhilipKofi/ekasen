import { useState } from "react";
import { UploadCloud, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";
import api from "../lib/api";
import PageHeader from "../components/PageHeader";
export default function RegistrationPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    ghana_card: null,
    birth_certificate: null,
    teacher_certificate: null,
  });
  const update = (key, value) => setForm({ ...form, [key]: value });
  const submit = async (e) => {
    e.preventDefault();
    localStorage.setItem(
      "tifund_registration",
      JSON.stringify({
        ...form,
        ghana_card: form.ghana_card?.name,
        birth_certificate: form.birth_certificate?.name,
        teacher_certificate: form.teacher_certificate?.name,
      }),
    );
    try {
      await api.post("/registration", {
        name: form.name,
        email: form.email,
        phone: form.phone,
      });
      toast.success(
        "Registration details saved. Continue with a plan to complete your account.",
      );
    } catch {
      toast.success(
        "Details saved locally. Continue with a plan when the API is available.",
      );
    }
  };
  return (
    <section className="section narrow-page">
      <PageHeader
        eyebrow="Teacher registration"
        title="Create your TiFund profile."
        description="Provide your account details and identity evidence. Your registration is kept locally until you complete the next step."
      />
      <form className="form-card" onSubmit={submit}>
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
          Phone number
          <input
            required
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
          />
        </label>
        {[
          ["ghana_card", "Ghana Card / national ID"],
          ["birth_certificate", "Birth certificate"],
          ["teacher_certificate", "Teacher certificate"],
        ].map(([key, label]) => (
          <label key={key}>
            {label}
            <span className="file-input">
              <UploadCloud size={17} /> Choose file
              <input
                required
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => update(key, e.target.files[0])}
              />
            </span>
          </label>
        ))}
        <button className="button primary">
          Save registration <ArrowRight size={17} />
        </button>
      </form>
    </section>
  );
}
