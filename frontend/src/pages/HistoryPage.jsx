import { useCallback } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import api from "../lib/api";
import { fallbackHistory } from "../data/fallback";
import { useApiData } from "../hooks/useApiData";
import PageHeader from "../components/PageHeader";
import ActivityList from "../components/ActivityList";

export default function HistoryPage() {
  const load = useCallback(
    () =>
      api
        .get("/history")
        .then((res) =>
          res.data.history?.length ? res.data.history : fallbackHistory,
        ),
    [],
  );
  const { data: history } = useApiData(load, fallbackHistory);

  return (
    <section className="section">
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          marginBottom: "1rem",
        }}
      >
        <Link
          to="/dashboard"
          className="btn-text"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
            textDecoration: "none",
            color: "inherit",
          }}
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>
      </div>

      <PageHeader
        eyebrow="Account history"
        title="Every contribution in one view."
        description="Review payments, timestamps, and account activity."
      />

      <div className="table-card">
        <ActivityList rows={history} />
      </div>
    </section>
  );
}
