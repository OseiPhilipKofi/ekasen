import { useCallback } from "react";
import { FileText, ShieldCheck, Users, ChevronDown } from "lucide-react";
import api from "../lib/api";
import { useApiData } from "../hooks/useApiData";
import ProfileAvatar from "../components/ProfileAvatar";

export default function AboutPage() {
  const loadWorkers = useCallback(
    () =>
      api.get("/content/home").then((res) => {
        const content = res.data.content || {};
        try {
          return typeof content.workers === "string"
            ? JSON.parse(content.workers)
            : content.workers || [];
        } catch {
          return [];
        }
      }),
    [],
  );
  const { data: workers } = useApiData(loadWorkers, []);

  return (
    <section className="section narrow-page">
      <span className="eyebrow">Our purpose</span>
      <h1>Helping teachers turn consistency into confidence.</h1>
      <p className="lead">
        TeacherInvestmentFund is a Kumasi-based savings and investment platform
        built around the people who shape Ghana’s future.
      </p>

      <div className="story-grid">
        <article>
          <FileText />
          <h3>Clear records</h3>
          <p>
            Your account history, payment receipts, and registration details
            stay organized in one place.
          </p>
        </article>
        <article>
          <ShieldCheck />
          <h3>Responsible by design</h3>
          <p>
            We use secure sign-in and protected APIs to keep member information
            private.
          </p>
        </article>
        <article>
          <Users />
          <h3>People first</h3>
          <p>
            Simple language, practical plans, and helpful support for every
            teacher.
          </p>
        </article>
      </div>

      {workers.length > 0 && (
        <div className="worker-section" style={{ marginTop: "3rem" }}>
          <div
            className="section-heading"
            style={{ textAlign: "center", marginBottom: "2rem" }}
          >
            <h2>Our Dedicated Team</h2>
            <p>The professionals ensuring your investments grow securely.</p>
          </div>
          <div
            className="worker-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "2rem",
            }}
          >
            {workers.map((w, i) => (
              <div
                key={i}
                className="worker-card"
                style={{
                  textAlign: "center",
                  padding: "1rem",
                  borderRadius: "1rem",
                  border: "1px solid var(--brand-line)",
                  background: "var(--brand-card-tint)",
                }}
              >
                <ProfileAvatar
                  src={w.img}
                  alt={w.name}
                  size={100}
                />
                <strong>{w.name}</strong>
                <p style={{ fontSize: "0.9rem", opacity: 0.7 }}>{w.role}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="info-callout">
        <strong>
          Built for Ghana, not a replacement for statutory pensions.
        </strong>
        <p>
          TiFund is designed as an optional savings and investment record for
          teachers. Members should continue to use official SSNIT and employer
          pension channels for statutory benefits and independent financial
          advice.
        </p>
      </div>

      <div className="faq">
        <details open>
          <summary>
            Who can join TiFund? <ChevronDown />
          </summary>
          <p>
            Teachers and education professionals in Ghana who can provide valid
            identity and teaching credentials.
          </p>
        </details>
        <details>
          <summary>
            Where is TiFund based? <ChevronDown />
          </summary>
          <p>
            Our institution is based in Kumasi, Ghana and serves members across
            the country.
          </p>
        </details>
        <details>
          <summary>
            How are contributions tracked? <ChevronDown />
          </summary>
          <p>
            Successful Paystack payments are recorded with their reference,
            amount, status, and timestamp for your dashboard history.
          </p>
        </details>
      </div>
    </section>
  );
}
