import { Link } from "react-router-dom";
import { CreditCard, ArrowRight } from "lucide-react";
import PageHeader from "../components/PageHeader";
export default function PaymentsPage() {
  return (
    <section className="section">
      <PageHeader
        eyebrow="Payments"
        title="Manage your contributions."
        description="Payments are processed securely in Ghana cedis through Paystack."
        action={
          <Link className="button primary" to="/plans">
            New payment <ArrowRight size={17} />
          </Link>
        }
      />
      <div className="story-grid">
        <article>
          <CreditCard />
          <h3>Paystack only</h3>
          <p>
            Choose a TiFund plan and complete payment using the secure Paystack
            popup.
          </p>
        </article>
        <article>
          <h3>Receipts and timestamps</h3>
          <p>
            Your successful payments are saved to your account history with
            their reference and date.
          </p>
        </article>
        <article>
          <h3>Need help?</h3>
          <p>
            Contact support if a payment is successful but not visible after a
            few minutes.
          </p>
        </article>
      </div>
    </section>
  );
}
