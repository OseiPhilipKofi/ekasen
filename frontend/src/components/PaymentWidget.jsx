import { useCallback, useState } from "react";
import PaystackPop from "@paystack/inline-js";
import toast from "react-hot-toast";
import api from "../lib/api";
import { fallbackPlans } from "../data/fallback";
import { useApiData } from "../hooks/useApiData";

export default function PaymentWidget({ user, onPaid }) {
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
  const [planId, setPlanId] = useState("");

  const selected = plans.find((plan) => String(plan.id) === String(planId));

  const pay = () => {
    if (!selected) {
      return toast.error("Select a contribution plan first.");
    }

    const key = import.meta.env.VITE_PAYSTACK_KEY;
    if (!key) {
      return toast.error("Paystack is not configured yet.");
    }

    new PaystackPop().newTransaction({
      key,
      email: user.email,
      amount: Number(selected.amount) * 100,
      currency: "GHS",
      metadata: {
        plan_id: selected.id,
        user_email: user.email,
      },
      onSuccess: async (transaction) => {
        try {
          await api.post("/payments/verify", {
            reference: transaction.reference,
            amount: selected.amount,
            plan_id: selected.id,
            status: "success",
            email: user.email,
          });
          toast.success("Payment confirmed and saved.");
          onPaid?.();
        } catch {
          toast.error("Payment succeeded but could not be saved.");
        }
      },
      onCancel: () => toast("Payment cancelled"),
    });
  };

  return (
    <div className="payment-widget">
      <h3>Make a contribution</h3>
      <p>
        Pay securely in Ghana cedis with Paystack from your member dashboard.
      </p>

      <div className="payment-controls">
        <select
          value={planId}
          onChange={(event) => setPlanId(event.target.value)}
        >
          <option value="">Choose a plan</option>
          {plans.map((plan) => (
            <option key={plan.id} value={plan.id}>
              {plan.name} · GH₵ {Number(plan.amount).toLocaleString()} /{" "}
              {plan.cadence?.toLowerCase()}
            </option>
          ))}
        </select>

        <button className="button primary" onClick={pay}>
          Pay with Paystack
        </button>
      </div>
    </div>
  );
}
