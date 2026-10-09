import { useCallback, useState } from "react";
import { Mail, MessageCircle, PhoneCall, Send } from "lucide-react";
import toast from "react-hot-toast";
import api from "../lib/api";
import { useApiData } from "../hooks/useApiData";
import PageHeader from "../components/PageHeader";

const initialForm = { name: "", email: "", phone: "", subject: "", message: "" };

function cleanPhone(value) {
  return String(value || "").replace(/[^\d+]/g, "");
}

export default function ContactPage() {
  const [form, setForm] = useState(initialForm);
  const loadContact = useCallback(
    () => api.get("/content/contact").then((res) => res.data.content || {}),
    [],
  );
  const { data: contact } = useApiData(loadContact, {});

  const phone = cleanPhone(contact.phone);
  const whatsapp = String(contact.whatsapp || "").replace(/\D/g, "");
  const email = String(contact.email || "").trim();
  const update = (field, value) =>
    setForm((current) => ({ ...current, [field]: value }));

  const submit = async (event) => {
    event.preventDefault();
    try {
      await api.post("/contact", form);
      toast.success("Message sent. We will be in touch.");
      setForm(initialForm);
    } catch (error) {
      toast.error(error.response?.data?.error || "We could not send your message yet.");
    }
  };

  return (
    <section className="section contact-page">
      <PageHeader
        eyebrow="Contact TiFund"
        title="We’re here to help."
        description="Choose a way to reach our team, or send us a message using the form."
      />

      <div className="contact-options">
        <article className="contact-option">
          <span className="contact-icon"><MessageCircle size={21} /></span>
          <div>
            <h2>WhatsApp</h2>
            <p>Chat with our team about your account or services.</p>
            <a
              href={whatsapp ? `https://wa.me/${whatsapp}` : "#contact-form"}
              target={whatsapp ? "_blank" : undefined}
              rel={whatsapp ? "noreferrer" : undefined}
            >
              {whatsapp ? "Start a WhatsApp chat" : "Send a message instead"}
            </a>
          </div>
        </article>
        <article className="contact-option">
          <span className="contact-icon"><PhoneCall size={21} /></span>
          <div>
            <h2>Call</h2>
            <p>Speak directly with the member support team.</p>
            <a href={phone ? `tel:${phone}` : "#contact-form"}>
              {phone || "Request a call back"}
            </a>
          </div>
        </article>
        <article className="contact-option">
          <span className="contact-icon"><Mail size={21} /></span>
          <div>
            <h2>Email</h2>
            <p>Send a written enquiry and we’ll respond as soon as possible.</p>
            <a href={email ? `mailto:${email}` : "#contact-form"}>
              {email || "Use the contact form"}
            </a>
          </div>
        </article>
      </div>

      <form id="contact-form" className="form-card contact-form" onSubmit={submit}>
        <div>
          <span className="eyebrow">Send a message</span>
          <h2>How can we help?</h2>
          <p>Complete the form and our team will get back to you.</p>
        </div>
        <div className="contact-form-fields">
          <label>
            Full name
            <input required value={form.name} onChange={(e) => update("name", e.target.value)} autoComplete="name" />
          </label>
          <label>
            Email
            <input required type="email" value={form.email} onChange={(e) => update("email", e.target.value)} autoComplete="email" />
          </label>
          <label>
            Phone (optional)
            <input type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} autoComplete="tel" />
          </label>
          <label>
            Subject (optional)
            <input value={form.subject} onChange={(e) => update("subject", e.target.value)} />
          </label>
          <label className="contact-message-field">
            Message
            <textarea required rows="5" value={form.message} onChange={(e) => update("message", e.target.value)} />
          </label>
        </div>
        <button className="button primary" type="submit">
          Send message <Send size={17} />
        </button>
      </form>
    </section>
  );
}
