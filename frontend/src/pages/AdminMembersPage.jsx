import { useCallback, useState } from "react";
import { Users, FileText, CreditCard, Trash2, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import api from "../lib/api";
import { useApiData } from "../hooks/useApiData";
import { previewImage } from "../components/GlobalImagePreview";
import PageHeader from "../components/PageHeader";
import AdminNav from "../components/AdminNav";
import ProfileAvatar from "../components/ProfileAvatar";
import AdminDocumentPreview from "../components/AdminDocumentPreview";

export default function AdminMembersPage() {
  const [filter, setFilter] = useState("all");
  const [selectedId, setSelectedId] = useState(null);
  const [teacherDetails, setTeacherDetails] = useState(null);
  const [profileForm, setProfileForm] = useState({});
  const [payments, setPayments] = useState([]);

  const load = useCallback(
    () => api.get("/admin/users").then((res) => res.data.users || []),
    [],
  );
  const { data: users, setData: setUsers } = useApiData(load, []);

  const filteredUsers = users.filter(
    (u) => filter === "all" || u.role === filter,
  );

  const selectTeacher = async (id) => {
    try {
      const [tRes, pRes] = await Promise.all([
        api.get(`/admin/teachers/${id}`),
        api.get(`/admin/payments/${id}`),
      ]);
      setTeacherDetails(tRes.data.teacher);
      setProfileForm(tRes.data.teacher);
      setPayments(pRes.data.payments || []);
      setSelectedId(id);
    } catch (error) {
      toast.error("Could not fetch teacher details.");
    }
  };

  const saveProfile = async (event) => {
    event.preventDefault();
    try {
      const response = await api.put(`/admin/teachers/${selectedId}`, {
        phone: profileForm.phone || "",
        school_name: profileForm.school_name || "",
        staff_id: profileForm.staff_id || "",
        national_id: profileForm.national_id || "",
        birth_date: profileForm.birth_date || "",
        status: profileForm.status,
      });
      const updated = { ...teacherDetails, ...profileForm };
      setTeacherDetails(updated);
      setUsers((current) => current.map((entry) => entry.id === selectedId ? { ...entry, ...updated } : entry));
      toast.success(response.data.message || "Profile details updated.");
    } catch (error) {
      toast.error(error.response?.data?.error || "Profile update failed.");
    }
  };

  const deleteTeacher = async (id, name) => {
    if (
      !window.confirm(
        `Are you sure you want to permanently remove ${name} from the system?`,
      )
    )
      return;
    try {
      await api.delete(`/admin/teachers/${id}`);
      toast.success("Teacher removed successfully.");
      setUsers(users.filter((u) => u.id !== id));
      if (selectedId === id) {
        setSelectedId(null);
        setTeacherDetails(null);
      }
    } catch (error) {
      toast.error("Failed to remove teacher.");
    }
  };

  return (
    <section className="section dashboard">
      <AdminNav />
      <PageHeader
        eyebrow="Admin · users"
        title="Account Management"
        description="Manage all user accounts, roles, and system access."
      />

      {!selectedId ? (
        <>
          <div
            className="filter-bar"
            style={{ marginBottom: "1rem", display: "flex", gap: "0.5rem" }}
          >
            <button
              onClick={() => setFilter("all")}
              className={filter === "all" ? "btn active" : "btn"}
            >
              All
            </button>
            <button
              onClick={() => setFilter("teacher")}
              className={filter === "teacher" ? "btn active" : "btn"}
            >
              Teachers
            </button>
            <button
              onClick={() => setFilter("admin")}
              className={filter === "admin" ? "btn active" : "btn"}
            >
              Admins
            </button>
          </div>

          <div className="table-card">
            {filteredUsers.length ? (
              filteredUsers.map((user) => (
                <div
                  className="activity-row"
                  key={user.id}
                  style={{ cursor: "pointer" }}
                  onClick={() => selectTeacher(user.id)}
                >
                  <ProfileAvatar src={user.profile_photo_path} alt={user.name} size={42} />
                  <div style={{ flex: 1 }}>
                    <strong>{user.name}</strong>
                    <small>
                      {user.email} · Role: {user.role} · Status: {user.status}
                    </small>
                  </div>
                  {user.role === "teacher" && (
                    <b style={{ fontSize: "0.8rem", opacity: 0.7 }}>
                      {user.verification_status || "pending"}
                    </b>
                  )}
                </div>
              ))
            ) : (
              <div className="empty-state">No user accounts found.</div>
            )}
          </div>
        </>
      ) : (
        <div className="teacher-detail-view">
          <button
            className="button secondary compact"
            onClick={() => setSelectedId(null)}
            style={{
              marginBottom: "1rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <ArrowLeft size={16} /> Back to list
          </button>

          {teacherDetails && (
            <div className="detail-grid">
              <div
                className="profile-card form-card"
                style={{ textAlign: "center", }}
              >
                <ProfileAvatar
                  src={teacherDetails.profile_photo_path}
                  alt={teacherDetails.name}
                  size={120}
                  onClick={() => {
                    const imageUrl = profileImageUrl(teacherDetails.profile_photo_path);
                    if (imageUrl) previewImage(imageUrl);
                  }}
                />
                <div style={{ textAlign: "center", }} >
                <h3 style={{padding: '0', margin: '0'}}>{teacherDetails.name}</h3>
                <p style={{padding: '0', margin: '0'}}>{teacherDetails.email}</p>
                </div>
                <div
                  className="status-badge"
                  style={{
                    padding: "0.2rem 0.8rem",
                    borderRadius: "1rem",
                    background:
                      teacherDetails.status === "active"
                        ? "var(--brand-success-bg)"
                        : "var(--brand-danger-bg)",
                    color:
                      teacherDetails.status === "active"
                        ? "var(--brand-success-ink)"
                        : "var(--brand-danger-ink)",
                    fontSize: "0.8rem",
                    fontWeight: "bold",
                    display: "inline-block",
                    // marginBottom: "1rem",
                  }}
                >
                  {teacherDetails.status.toUpperCase()}
                </div>
                <div
                  style={{
                    textAlign: "left",
                    fontSize: "0.9rem",
                    borderTop: "1px solid var(--brand-line)",
                    // paddingTop: "1rem",
                  }}
                >
                  <p>
                    <strong>Phone:</strong> {teacherDetails.phone || "N/A"}
                  </p>
                  <p>
                    <strong>School:</strong>{" "}
                    {teacherDetails.school_name || "N/A"}
                  </p>
                  <p>
                    <strong>Staff ID:</strong>{" "}
                    {teacherDetails.staff_id || "N/A"}
                  </p>
                  <p>
                    <strong>National ID:</strong>{" "}
                    {teacherDetails.national_id || "N/A"}
                  </p>
                </div>
                {teacherDetails.role === "teacher" && (
                  <button
                    className="button danger full"
                    style={{ marginTop: "1.5rem" }}
                    onClick={() => deleteTeacher(teacherDetails.id, teacherDetails.name)}
                  >
                    Remove Teacher
                  </button>
                )}
              </div>

              <div className="details-main">
                <form className="form-card member-profile-editor" onSubmit={saveProfile}>
                  <h3>Editable profile details</h3>
                  <div className="profile-fields">
                    <label>Phone<input value={profileForm.phone || ""} onChange={(event) => setProfileForm({ ...profileForm, phone: event.target.value })} /></label>
                    <label>School / institution<input value={profileForm.school_name || ""} onChange={(event) => setProfileForm({ ...profileForm, school_name: event.target.value })} /></label>
                    <label>Staff ID<input value={profileForm.staff_id || ""} onChange={(event) => setProfileForm({ ...profileForm, staff_id: event.target.value })} /></label>
                    <label>National ID<input value={profileForm.national_id || ""} onChange={(event) => setProfileForm({ ...profileForm, national_id: event.target.value })} /></label>
                    <label>Birth date<input type="date" value={profileForm.birth_date || ""} onChange={(event) => setProfileForm({ ...profileForm, birth_date: event.target.value })} /></label>
                    <label>Account status<select value={profileForm.status || "active"} onChange={(event) => setProfileForm({ ...profileForm, status: event.target.value })}><option value="active">Active</option><option value="pending">Pending</option><option value="suspended">Suspended</option></select></label>
                  </div>
                  <button className="button primary" type="submit">Save user details</button>
                </form>
                <div className="table-card">
                  <div className="table-heading">
                    <h3
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                      }}
                    >
                      <FileText size={18} /> Identity Documents
                    </h3>
                  </div>


                  {teacherDetails.documents?.length ? (
                    <span className={`activity-row`} style={{flexWrap:'wrap'}}>
                      {teacherDetails.documents.map((doc) => (
                      <div
                        className="activity-row"
                        key={doc.id}
                        style={{flexDirection: 'column', justifyContent: "space-between"}}
                      >
                          <div
                            style={{ display: "grid", placeItems: "center", width: "80%", maxWidth: "300px" }}
                          >
                            <AdminDocumentPreview teacherId={teacherDetails.id} document={doc} />
                          </div>
                        <span style ={{ display: 'flex', flexDirection:'column', justifyContent: 'center', alignItems: 'center'}}>
                          <span>
                            {doc.document_type}
                            {/* ({doc.original_name}) */}
                          </span>
                        </span>
                      </div>
                      ))}

                    </span>
                  ) : (
                    <div className="empty-state">No documents uploaded.</div>
                  )}
                </div>

                <div className="table-card" style={{ marginTop: "2rem" }}>
                  <div className="table-heading">
                    <h3
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                      }}
                    >
                      <CreditCard size={18} /> Payment History
                    </h3>
                  </div>
                  {payments.length ? (
                    payments.map((p, i) => (
                      <div
                        className="activity-row"
                        key={i}
                        style={{ justifyContent: "space-between" }}
                      >
                        <div>
                          <strong>{p.reference}</strong>
                          <small style={{ marginLeft: "0.5rem" }}>
                            {new Date(p.created_at).toLocaleDateString()}
                          </small>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "1rem",
                          }}
                        >
                          <b
                            style={{
                              color:
                                p.status === "success" ? "var(--brand-success-ink)" : "var(--brand-danger-ink)",
                            }}
                          >
                            {p.status}
                          </b>
                          <strong>
                            GH₵ {Number(p.amount).toLocaleString()}
                          </strong>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="empty-state">
                      No payments found for this teacher.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
