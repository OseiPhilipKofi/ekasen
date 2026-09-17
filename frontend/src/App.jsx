import { useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./hooks/useAuth";
import GlobalImagePreview from "./components/GlobalImagePreview";
import ScrollToTop from "./components/ScrollToTop";
import TopLoadingBar from "./components/TopLoadingBar";
import RouteLoader from "./components/RouteLoader";
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import LoginPage from "./pages/LoginPage";
import PlansPage from "./pages/PlansPage";
import RegistrationPage from "./pages/RegistrationPage";
import DashboardPage from "./pages/DashboardPage";
import HistoryPage from "./pages/HistoryPage";
import PaymentsPage from "./pages/PaymentsPage";
import NotificationsPage from "./pages/NotificationsPage";
import AdminPage from "./pages/AdminPage";
import AccountPage from "./pages/AccountPage";
import AdminMembersPage from "./pages/AdminMembersPage";
import AdminRegisterPage from "./pages/AdminRegisterPage";
import AdminPaymentsPage from "./pages/AdminPaymentsPage";
import AdminActivityPage from "./pages/AdminActivityPage";
import AdminContentPage from "./pages/AdminContentPage";
import AdminPlansPage from "./pages/AdminPlansPage";

export default function App() {
  const { user, signIn, signOut } = useAuth();
  return (
    <Layout user={user} onLogout={signOut}>
      <TopLoadingBar />
      <RouteLoader />
      <ScrollToTop />
      <GlobalImagePreview />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/login" element={<LoginPage onLogin={signIn} />} />
        <Route path="/register" element={<RegistrationPage />} />
        <Route path="/plans" element={<PlansPage user={user} />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute user={user}>
              <DashboardPage user={user} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/history"
          element={
            <ProtectedRoute user={user}>
              <HistoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/payments"
          element={
            <ProtectedRoute user={user}>
              <PaymentsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute user={user}>
              <NotificationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/account"
          element={
            <ProtectedRoute user={user}>
              <AccountPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute user={user} admin>
              <AdminPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/members"
          element={
            <ProtectedRoute user={user} admin>
              <AdminMembersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/register"
          element={
            <ProtectedRoute user={user} admin>
              <AdminRegisterPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/payments"
          element={
            <ProtectedRoute user={user} admin>
              <AdminPaymentsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/activity"
          element={
            <ProtectedRoute user={user} admin>
              <AdminActivityPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/content"
          element={
            <ProtectedRoute user={user} admin>
              <AdminContentPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/plans"
          element={
            <ProtectedRoute user={user} admin>
              <AdminPlansPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<HomePage />} />
      </Routes>
    </Layout>
  );
}
