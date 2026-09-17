import { useCallback } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import api from "../lib/api";
import { fallbackPlans } from "../data/fallback";
import { useApiData } from "../hooks/useApiData";
import PageHeader from "../components/PageHeader";

export default function PlansPage({ user }) {
  const loadPlans = useCallback(
    () =>
      api
        .get("/plans")
        .then((res) =>
          res.data.plans?.length ? res.data.plans : fallbackPlans,
        ),
    [],
  );
  const { data: plans } = useApiData(loadPlans, fallbackPlans);

  return (
    <section className="section">
      <PageHeader
        eyebrow="Subscription plans"
        title="Choose a plan that works for you."
        description="Review transparent contribution options in Ghana cedis. Payments are completed only inside your signed-in dashboard."
      />

      <div className="plans-grid">
        {plans.map((plan, index) => (
          <article
            className={`plan-card ${index === 1 ? "featured" : ""}`}
            key={plan.id}
          >
            <div className="plan-top">
              <span>{plan.name}</span>
              {index === 1 && <b>Most popular</b>}
            </div>

            <p>{plan.description}</p>

            <strong className="price">
              GH₵ {Number(plan.amount).toLocaleString()}
              <small>/{plan.cadence?.toLowerCase()}</small>
            </strong>

            <ul>
              {(plan.benefits || []).map((benefit) => (
                <li key={benefit}>
                  <CheckCircle2 size={16} />
                  {benefit}
                </li>
              ))}
            </ul>

            <Link
              className="button primary full"
              to={user ? "/dashboard" : "/login"}
            >
              {user ? "Continue in dashboard" : "Sign in to continue"}
              <ArrowRight size={16} />
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
