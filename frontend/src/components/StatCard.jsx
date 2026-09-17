export default function StatCard({ label, value, note, positive }) {
  return (
    <div className="stat-card">
      <span>{label}</span>
      <strong>{value}</strong>
      <small className={positive ? "positive" : ""}>{note}</small>
    </div>
  );
}
