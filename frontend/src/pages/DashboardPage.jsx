import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useCallback } from "react";
import api from "../lib/api";
import { fallbackHistory } from "../data/fallback";
import { useApiData } from "../hooks/useApiData";
import PageHeader from "../components/PageHeader";
import StatCard from "../components/StatCard";
import ActivityList from "../components/ActivityList";
import PaymentWidget from "../components/PaymentWidget";

export default function DashboardPage({ user }) {
  const load = useCallback(
    () =>
      api
        .get(`/history?email=${encodeURIComponent(user?.email || "")}`)
        .then((res) =>
          res.data.history?.length ? res.data.history : fallbackHistory,
        ),
    [user?.email],
  );
  const { data: history, setData: setHistory } = useApiData(
    load,
    fallbackHistory,
  );
  const reload = () => load().then(setHistory);

  return (
    <section className="section dashboard">
      <PageHeader
        eyebrow="Member dashboard"
        title={`Good to see you, ${user?.name?.split(" ")[0] || "teacher"}.`}
        action={
          <Link className="button secondary" to="/account">
            Manage account
          </Link>
        }
      />

      <div className="metrics">
        <StatCard
          label="Total balance"
          value="GH₵ 24,580.00"
          note="+12.8% this year"
          positive
        />
        <StatCard
          label="This month"
          value="GH₵ 300.00"
          note="Next payment · 28 Sep"
        />
        <StatCard
          label="Plan"
          value="Growth Builder"
          note="Active since Jan 2026"
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
    </section>
  );
}
