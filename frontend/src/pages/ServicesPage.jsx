import { useCallback } from "react";
import { ArrowRight, BadgeCheck } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../lib/api";
import { useApiData } from "../hooks/useApiData";
import PageHeader from "../components/PageHeader";

function parseServices(value) {
  if (Array.isArray(value)) return value;
  if (typeof value !== "string") return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function ServicesPage() {
  const load = useCallback(
    () =>
      api
        .get("/content/services")
        .then((response) => parseServices(response.data.content?.services)),
    [],
  );
  const { data: services } = useApiData(load, []);

  return (
    <section className="section services-page">
      <PageHeader
        eyebrow="Our services"
        title="Practical support for your financial future."
        description="Explore the services available to TiFund members and teachers."
      />
      {services.length ? (
        <div className="service-grid">
          {services.map((service, index) => (
            <article className="service-card" key={`${service.title}-${index}`}>
              <span className="service-icon"><BadgeCheck size={22} /></span>
              <h2>{service.title}</h2>
              <p>{service.description}</p>
              <Link to="/contact" className="service-link">
                Ask us about this <ArrowRight size={16} />
              </Link>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-state">Our services are being updated. Please check back soon.</div>
      )}
    </section>
  );
}
