import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost/api",
  headers: { Accept: "application/json" },
});

api.interceptors.request.use((config) => {
  window.dispatchEvent(new CustomEvent("app-loading", { detail: { loading: true } }));
  const session = sessionStorage.getItem("tifund_user");
  if (session)
    config.headers.Authorization = `Bearer ${JSON.parse(session).token || ""}`;
  return config;
});

api.interceptors.response.use(
  (response) => {
    window.dispatchEvent(new CustomEvent("app-loading", { detail: { loading: false } }));
    console.log(response);
    return response;
  },
  (error) => {
    console.log(error);
    window.dispatchEvent(new CustomEvent("app-loading", { detail: { loading: false } }));
    return Promise.reject(error);
  },
);

export default api;
