import { Bell } from "lucide-react";
import { useCallback } from "react";
import api from "../lib/api";
import { useApiData } from "../hooks/useApiData";
import PageHeader from "../components/PageHeader";
export default function NotificationsPage() {
  const load = useCallback(
    () => api.get("/notifications").then((res) => res.data.notifications || []),
    [],
  );
  const { data: notifications } = useApiData(load, []);
  return (
    <section className="section">
      <PageHeader
        eyebrow="Notifications"
        title="Stay informed about your account."
        description="Important account and payment updates will appear here."
      />
      <div className="table-card">
        {notifications.length ? (
          notifications.map((item) => (
            <div className="activity-row" key={item.id}>
              <span className="activity-icon">
                <Bell size={17} />
              </span>
              <div>
                <strong>{item.title}</strong>
                <small>{item.created_at}</small>
                <p>{item.message}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <Bell size={25} />
            <p>You have no new notifications.</p>
          </div>
        )}
      </div>
    </section>
  );
}
