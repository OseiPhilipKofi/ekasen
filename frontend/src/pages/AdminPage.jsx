import { useCallback } from "react";
import { Users, MessageSquare, WalletCards } from "lucide-react";
import api from "../lib/api";
import { useApiData } from "../hooks/useApiData";
import PageHeader from "../components/PageHeader";
import StatCard from "../components/StatCard";
import AdminNav from "../components/AdminNav";

export default function AdminPage() {
  const load = useCallback(
    () => api.get("/admin/teachers").then((res) => res.data.teachers || []),
    [],
  );
  const loadSummary = useCallback(
    () => api.get("/admin/summary").then((res) => res.data.summary || {}),
    [],
  );
  const { data: teachers } = useApiData(load, []);
  const { data: summary } = useApiData(loadSummary, {});

  return (
    <section className="section dashboard">
      <AdminNav />
      <PageHeader
        eyebrow="Administration"
        title="Manage TiFund from one place."
        description="Review teachers, messages, content, notifications, and cashflow."
      />

      <div className="metrics">
        <StatCard
          label="Registered teachers"
          value={summary.teachers ?? (teachers.length || "—")}
          note="Verified member records"
        />
        <StatCard
          label="Pending messages"
          value={summary.messages ?? "—"}
          note="Review inbox"
        />
        <StatCard
          label="Cashflow this month"
          value={
            summary.cashflow !== undefined
              ? `GH₵ ${Number(summary.cashflow).toLocaleString()}`
              : "GH₵ —"
          }
          note="Successful Paystack payments"
        />
      </div>

      <div className="table-card">
        <div className="table-heading">
          <h3>Registered teachers</h3>
        </div>
        {teachers.length ? (
          teachers.map((teacher) => (
            <div className="activity-row" key={teacher.id}>
              <span className="activity-icon">
                <Users size={17} />
              </span>
              <div>
                <strong>{teacher.name}</strong>
                <small>
                  {teacher.email} · {teacher.status}
                </small>
              </div>
              <b style={{ fontSize: "0.8rem", opacity: 0.7 }}>
                {teacher.verification_status || "pending"}
              </b>
            </div>
          ))
        ) : (
          <div className="empty-state">
            Teacher records will appear here after they sign in.
          </div>
        )}
      </div>

      <div className="story-grid admin-tools">
        <article>
          <MessageSquare />
          <h3>Contact inbox</h3>
          <p>
            Review and manage messages submitted from the public contact page.
          </p>
        </article>
        <article>
          <WalletCards />
          <h3>Cashflow</h3>
          <p>
            Track successful Paystack payments and contribution performance.
          </p>
        </article>
        <article>
          <Users />
          <h3>Teacher CRUD</h3>
          <p>
            Update, suspend, or remove teacher accounts with protected admin
            access.
          </p>
        </article>
      </div>
    </section>
  );
}
