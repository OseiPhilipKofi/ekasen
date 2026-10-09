import { useCallback, useState } from "react";
import { Trash2, Edit3, Plus, X } from "lucide-react";
import toast from "react-hot-toast";
import api from "../lib/api";
import { fallbackPlans } from "../data/fallback";
import { useApiData } from "../hooks/useApiData";
import PageHeader from "../components/PageHeader";
import AdminNav from "../components/AdminNav";

export default function AdminPlansPage() {
  const load = useCallback(
    () =>
      api.get("/admin/plans").then((res) => res.data.plans || fallbackPlans),
    [],
  );
  const { data: plans, setData: setPlans } = useApiData(load, fallbackPlans);

  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    name: "",
    amount: "",
    cadence: "Monthly",
    description: "",
    benefits: "",
  });

  const handleEdit = (plan) => {
    setEditingId(plan.id);
    setForm({
      name: plan.name,
      amount: plan.amount,
      cadence: plan.cadence,
      description: plan.description,
      benefits: Array.isArray(plan.benefits)
        ? plan.benefits.join("\n")
        : plan.benefits,
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setForm({
      name: "",
      amount: "",
      cadence: "Monthly",
      description: "",
      benefits: "",
    });
  };

  const save = async (event) => {
    event.preventDefault();
    try {
      const payload = {
        ...form,
        benefits: form.benefits.split("\n").filter(Boolean),
      };

      if (editingId) {
        await api.put(`/admin/plans/${editingId}`, payload);
        toast.success("Plan updated successfully.");
      } else {
        await api.post("/admin/plans", payload);
        toast.success("Plan created successfully.");
      }

      setPlans(await load());
      handleCancel();
    } catch (error) {
      toast.error(error.response?.data?.error || "Plan could not be saved.");
    }
  };

  const deletePlan = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete the ${name} plan?`))
      return;
    try {
      await api.delete(`/admin/plans/${id}`);
      toast.success("Plan deleted successfully.");
      setPlans(plans.filter((p) => p.id !== id));
    } catch (error) {
      toast.error("Failed to delete plan.");
    }
  };

  return (
    <section className="section dashboard">
      <AdminNav />
      <PageHeader
        eyebrow="Admin · plans"
        title="Manage contribution plans."
        description="Create and maintain the plans shown publicly; payment is always completed inside the member dashboard."
      />

      <div className="plans-grid">
        {plans.map((plan) => (
          <article className="plan-card" key={plan.id}>
            <div className="plan-top">
              <span>{plan.name}</span>
              <b>GH₵ {Number(plan.amount).toLocaleString()}</b>
            </div>
            <p>{plan.description}</p>
            <small>{plan.cadence}</small>
            <div
              style={{
                display: "flex",
                gap: "0.5rem",
                marginTop: "1rem",
                borderTop: "1px solid var(--brand-line)",
                paddingTop: "1rem",
              }}
            >
              <button
                className="button secondary compact"
                onClick={() => handleEdit(plan)}
              >
                <Edit3 size={14} /> Edit
              </button>
              <button
                className="button danger compact"
                onClick={() => deletePlan(plan.id, plan.name)}
              >
                <Trash2 size={14} /> Delete
              </button>
            </div>
          </article>
        ))}
      </div>

      <form className="form-card admin-plan-form" onSubmit={save}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1rem",
          }}
        >
          <h3>{editingId ? "Edit Plan" : "Add a new plan"}</h3>
          {editingId && (
            <button
              type="button"
              className="btn-text"
              onClick={handleCancel}
              style={{ display: "flex", alignItems: "center", gap: "0.2rem" }}
            >
              <X size={14} /> Cancel
            </button>
          )}
        </div>

        <div
          className="form-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "1rem",
          }}
        >
          <label>
            Name
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </label>
          <label>
            Amount in GHS
            <input
              required
              type="number"
              min="1"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
            />
          </label>
        </div>

        <label>
          Cadence
          <select
            value={form.cadence}
            onChange={(e) => setForm({ ...form, cadence: e.target.value })}
          >
            <option value="Monthly">Monthly</option>
            <option value="Quarterly">Quarterly</option>
            <option value="Annual">Annual</option>
          </select>
        </label>

        <label>
          Description
          <textarea
            required
            rows="3"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </label>
        <label>
          Benefits, one per line
          <textarea
            rows="4"
            value={form.benefits}
            onChange={(e) => setForm({ ...form, benefits: e.target.value })}
          />
        </label>

        <button className="button primary">
          {editingId ? "Update Plan" : "Create Plan"}
        </button>
      </form>
    </section>
  );
}
