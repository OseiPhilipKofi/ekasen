import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../lib/api";

export default function LoginPage({ onLogin }) {
  const navigate = useNavigate();

  const login = async (credential) => {
    try {
      // Force loading bar to trigger manually on submit
      window.dispatchEvent(new CustomEvent("app-loading", { detail: { loading: true } }));

      const res = await api.post("/auth/google", { credential });
      onLogin(res.data.user);

      toast.success(`Welcome, ${res.data.user.name || "member"}!`);

      // Force loading bar to complete before firing route redirection
      window.dispatchEvent(new CustomEvent("app-loading", { detail: { loading: false } }));
      navigate("/dashboard");
      // const res = await api.post("/auth/google", { credential });

      // // DIAGNOSTIC CHECK: See exactly what the backend responded with in the console
      // console.log("Backend response payload data:", res.data);
      // onLogin(res.data.user);

      // toast.success(`Welcome, ${res.data.user.name || "member"}!`);
      // navigate(res.data.user.role === "admin" ? "/admin" : "/dashboard");
    } catch (error) {
      window.dispatchEvent(new CustomEvent("app-loading", { detail: { loading: false } }));

      toast.error("Google sign-in could not be completed. " + error);
    }
  };

  return (
    <section className="auth-page">
      <div className="auth-card">
        <span className="brand-mark large">T</span>
        <span className="eyebrow">Welcome to TiFund</span>
        <h1>Sign in securely</h1>
        <p>Use your Google account to access your member space.</p>

        <GoogleLogin
          onSuccess={(response) => login(response.credential)}
          onError={() => toast.error("Google sign-in failed.")}
          useOneTap
        />
      </div>
    </section>
  );
}
