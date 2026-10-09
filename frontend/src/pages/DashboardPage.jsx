import { Link } from "react-router-dom";
import { MessageSquare } from "lucide-react";
import { useCallback, useState } from "react";
import api from "../lib/api";
import { useApiData } from "../hooks/useApiData";
import PageHeader from "../components/PageHeader";
import StatCard from "../components/StatCard";
import ActivityList from "../components/ActivityList";
import PaymentWidget from "../components/PaymentWidget";
import ContactMessagesPanel from "../components/ContactMessagesPanel";

export default function DashboardPage({ user, embedded = false }) {
  const [activeTab, setActiveTab] = useState("overview");
  const load = useCallback(
    () =>
      api
        .get("/history")
        .then((res) => res.data.history || []),
    [],
  );
  const { data: history, setData: setHistory } = useApiData(load, []);
  const reload = () => load().then(setHistory);
  const successfulPayments = history.filter(
    (payment) => String(payment.status).toLowerCase() === "success",
  );
  const totalContributions = successfulPayments.reduce(
    (total, payment) => total + Number(payment.amount || 0),
    0,
  );
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const contributionsThisMonth = successfulPayments
    .filter((payment) => String(payment.created_at || "").slice(0, 7) === currentMonth)
    .reduce((total, payment) => total + Number(payment.amount || 0), 0);
  const latestPlan = successfulPayments.find((payment) => payment.plan_name)?.plan_name;
  const Wrapper = embedded ? "div" : "section";

  return (
    <Wrapper
      className={embedded ? "member-dashboard-embed dashboard" : "section dashboard"}
      id={embedded ? "my-member-dashboard" : undefined}
    >
      <PageHeader
        eyebrow={embedded ? "Your member account" : "Your account"}
        title={`Welcome, ${user?.name?.trim().split(/\s+/)[0] || "teacher"}.`}
        action={
          <Link className="button secondary" to="/account">
            Manage account
          </Link>
        }
      />

      <div className="dashboard-tabs" aria-label="Member dashboard sections">
        <button
          type="button"
          aria-pressed={activeTab === "overview"}
          className={activeTab === "overview" ? "is-active" : ""}
          onClick={() => setActiveTab("overview")}
        >
          Overview
        </button>
        <button
          type="button"
          aria-pressed={activeTab === "messages"}
          className={activeTab === "messages" ? "is-active" : ""}
          onClick={() => setActiveTab("messages")}
        >
          <MessageSquare size={16} /> Messages
        </button>
      </div>

      {activeTab === "messages" ? (
        <ContactMessagesPanel user={user} />
      ) : (
        <>
      <div className="metrics">
        <StatCard
          label="Total contributions"
          value={`GH₵ ${totalContributions.toLocaleString("en-GH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          note="Confirmed payments in this account"
        />
        <StatCard
          label="Contributions this month"
          value={`GH₵ ${contributionsThisMonth.toLocaleString("en-GH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          note="Confirmed payments this calendar month"
        />
        <StatCard
          label="Most recent plan"
          value={latestPlan || "No contributions yet"}
          note="Based on your latest confirmed payment"
        />
      </div>

      <PaymentWidget user={user} onPaid={reload} />

      <div className="table-card">
        <div className="table-heading">
          <h3>Recent activity</h3>
          <Link to="/history">View full history</Link>
        </div>
        <ActivityList rows={history} />
      </div>
        </>
      )}
    </Wrapper>
  );
}
