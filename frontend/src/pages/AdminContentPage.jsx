import { useState, useEffect } from "react";
import {
  Bell,
  Send,
  Layout,
  Image,
  MessageCircle,
  Users,
  Edit3,
  Trash2,
  Plus,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../lib/api";
import { previewImage } from "../components/GlobalImagePreview";
import PageHeader from "../components/PageHeader";
import AdminNav from "../components/AdminNav";

export default function AdminContentPage() {
  const [activeTab, setActiveTab] = useState("hero");
  const [content, setContent] = useState({});
  const [teachers, setTeachers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [notice, setNotice] = useState({ user_id: "", title: "", message: "" });

  const [editingIndex, setEditingIndex] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editFile, setEditFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    try {
      const [cRes, uRes, nRes] = await Promise.all([
        api.get("/admin/content"),
        api.get("/admin/users"),
        api.get("/admin/notifications"),
      ]);

      const data = cRes.data.content || [];
      const map = {};
      data.forEach((item) => {
        map[item.content_key] = item.content_value;
      });
      setContent(map);
      setTeachers(uRes.data.users || []);
      setNotifications(nRes.data.notifications || []);
    } catch (e) {
      toast.error("Failed to load content studio data.");
    }
  };

  const saveGlobalContent = async (event) => {
    event.preventDefault();
    try {
      await api.put("/admin/content", { page_key: "home", content: content });
      toast.success("Hero content updated.");
    } catch {
      toast.error("Content could not be saved.");
    }
  };

  const sendNotification = async (event) => {
    event.preventDefault();
    try {
      await api.post("/admin/notifications", notice);
      toast.success("Notification sent successfully.");
      setNotice({ user_id: "", title: "", message: "" });
      const res = await api.get("/admin/notifications");
      setNotifications(res.data.notifications || []);
    } catch {
      toast.error("Failed to send notification.");
    }
  };

  const deleteNotification = async (id) => {
    if (!window.confirm("Delete this notification record?")) return;
    try {
      await api.delete(`/admin/notifications/${id}`);
      toast.success("Notification removed.");
      const res = await api.get("/admin/notifications");
      setNotifications(res.data.notifications || []);
    } catch {
      toast.error("Failed to delete notification.");
    }
  };

  const updateValue = (key, val) => {
    setContent({ ...content, [key]: val });
  };

  const startEditing = (key, index = null) => {
    const list =
      typeof content[key] === "string"
        ? JSON.parse(content[key])
        : content[key] || [];
    setEditingIndex(index);
    setEditFile(null);
    setFilePreview(null);
    if (index !== null && list[index]) {
      setEditForm(list[index]);
    } else {
      const defaults = {
        carousel: { image: "", title: "", desc: "" },
        workers: { name: "", role: "", img: "" },
        faq: { q: "", a: "" },
      };
      setEditForm(defaults[key] || {});
    }
  };

  const saveItem = async (key) => {
    const list =
      typeof content[key] === "string"
        ? JSON.parse(content[key])
        : content[key] || [];
    const updatedList = [...list];

    let finalItem = { ...editForm };

    if (editFile) {
      try {
        const formData = new FormData();
        formData.append("asset", editFile);
        const uploadRes = await api.post("/admin/upload-cms", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        const imagePath = uploadRes.data.path;
        const imageKey = key === "carousel" ? "image" : "img";
        finalItem[imageKey] = imagePath;
      } catch (e) {
        toast.error("Failed to upload image.");
        return;
      }
    }

    if (editingIndex !== null) {
      updatedList[editingIndex] = finalItem;
    } else {
      updatedList.push(finalItem);
    }

    const newContent = { ...content, [key]: JSON.stringify(updatedList) };
    try {
      await api.put("/admin/content", {
        page_key: "home",
        content: newContent,
      });
      setContent(newContent);
      setEditingIndex(null);
      setEditForm({});
      setEditFile(null);
      setFilePreview(null);
      toast.success("Item saved successfully.");
    } catch {
      toast.error("Failed to save item.");
    }
  };

  const deleteItem = async (key, index) => {
    if (!window.confirm("Delete this item?")) return;
    const list =
      typeof content[key] === "string"
        ? JSON.parse(content[key])
        : content[key] || [];
    const updatedList = list.filter((_, i) => i !== index);
    const newContent = { ...content, [key]: JSON.stringify(updatedList) };
    try {
      await api.put("/admin/content", {
        page_key: "home",
        content: newContent,
      });
      setContent(newContent);
      toast.success("Item removed.");
    } catch {
      toast.error("Failed to remove item.");
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setEditFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setFilePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const contentTabs = [
    {
      id: "hero",
      label: "Hero",
      icon: <Layout size={16} />,
      keys: ["hero_title", "hero_text", "stats"],
    },
    {
      id: "carousel",
      label: "Carousel",
      icon: <Image size={16} />,
      keys: ["carousel"],
    },
    {
      id: "workers",
      label: "Workers",
      icon: <Users size={16} />,
      keys: ["workers"],
    },
    {
      id: "faq",
      label: "FAQ",
      icon: <MessageCircle size={16} />,
      keys: ["faq"],
    },
  ];

  return (
    <section className="section dashboard">
      <AdminNav />
      <PageHeader
        eyebrow="Admin · content studio"
        title="Manage public page sections."
        description="Update homepage assets, team lists, and system-wide notifications."
      />

      <div
        className="content-tabs"
        style={{ display: "flex", gap: "0.5rem", marginBottom: "2rem" }}
      >
        {contentTabs.map((tab) => (
          <button
            type="button"
            className={activeTab === tab.id ? "active" : ""}
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setEditingIndex(null);
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.6rem 1.2rem",
            }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
        <button
          type="button"
          className={activeTab === "notifications" ? "active" : ""}
          onClick={() => {
            setActiveTab("notifications");
            setEditingIndex(null);
          }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.6rem 1.2rem",
          }}
        >
          <Bell size={16} /> Notifications
        </button>
      </div>

      {activeTab === "hero" ? (
        <form
          className="form-card"
          onSubmit={saveGlobalContent}
          style={{ maxWidth: "100%" }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1.5rem",
            }}
          >
            <h3 style={{ margin: 0 }}>Editing Hero Section</h3>
            <span style={{ fontSize: "0.8rem", opacity: 0.6 }}>
              Main landing page text
            </span>
          </div>
          {contentTabs[0].keys.map((key) => (
            <label
              key={key}
              style={{ display: "block", marginBottom: "1.5rem" }}
            >
              <span
                style={{
                  fontWeight: "bold",
                  display: "block",
                  marginBottom: "0.5rem",
                }}
              >
                {key.replace("_", " ").toUpperCase()}
              </span>
              {key === "hero_text" ? (
                <textarea
                  rows="4"
                  style={{
                    width: "100%",
                    padding: "0.6rem",
                    borderRadius: "0.4rem",
                    border: "1px solid #ddd",
                  }}
                  value={content[key] || ""}
                  onChange={(event) => updateValue(key, event.target.value)}
                />
              ) : (
                <input
                  style={{
                    width: "100%",
                    padding: "0.6rem",
                    borderRadius: "0.4rem",
                    border: "1px solid #ddd",
                  }}
                  value={content[key] || ""}
                  onChange={(event) => updateValue(key, event.target.value)}
                />
              )}
            </label>
          ))}
          <button className="button primary" style={{ width: "200px" }}>
            Save Changes
          </button>
        </form>
      ) : activeTab === "notifications" ? (
        <div className= {"ContentWrapper"}
          // style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "2rem", }}
        >
          <form
            className="form-card"
            onSubmit={sendNotification}
            style={{ height: "fit-content" }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                marginBottom: "1.5rem",
              }}
            >
              <Bell size={20} />
              <h3 style={{ margin: 0 }}>Send Notification</h3>
            </div>
            <label>
              Select Teacher
              <select
                required
                value={notice.user_id}
                onChange={(e) =>
                  setNotice({ ...notice, user_id: e.target.value })
                }
                style={{
                  width: "100%",
                  padding: "0.6rem",
                  borderRadius: "0.4rem",
                  border: "1px solid #ddd",
                }}
              >
                <option value="">-- Choose a teacher --</option>
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.email})
                  </option>
                ))}
              </select>
            </label>
            <label>
              Notification Title
              <input
                required
                value={notice.title}
                onChange={(e) =>
                  setNotice({ ...notice, title: e.target.value })
                }
                style={{
                  width: "100%",
                  padding: "0.6rem",
                  borderRadius: "0.4rem",
                  border: "1px solid #ddd",
                }}
              />
            </label>
            <label>
              Message
              <textarea
                required
                rows="5"
                value={notice.message}
                onChange={(e) =>
                  setNotice({ ...notice, message: e.target.value })
                }
                style={{
                  width: "100%",
                  padding: "0.6rem",
                  borderRadius: "0.4rem",
                  border: "1px solid #ddd",
                }}
              />
            </label>
            <button
              className="button primary"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
              }}
            >
              <Send size={16} /> Send Notification
            </button>
          </form>

          <div className="table-card">
            <div className="table-heading">
              <h3>Notification History</h3>
            </div>
            {notifications.length ? (
              notifications.map((n, i) => (
                <div
                  className="activity-row"
                  key={n.id}
                  style={{ justifyContent: "space-between" }}
                >
                  <div style={{ flex: 1 }}>
                    <strong>{n.title}</strong>
                    <small style={{ marginLeft: "0.5rem" }}>
                      To: {n.email} ·{" "}
                      {new Date(n.created_at).toLocaleDateString()}
                    </small>
                    <p
                      style={{
                        margin: "0.2rem 0 0 0",
                        fontSize: "0.85rem",
                        opacity: 0.8,
                      }}
                    >
                      {n.message}
                    </p>
                  </div>
                  <button
                    className="button danger compact"
                    onClick={() => deleteNotification(n.id)}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            ) : (
              <div className="empty-state">No notifications sent yet.</div>
            )}
          </div>
        </div>
      ) : (
        <div className={"ContentWrapper"} style={{ gap: "2rem" }}>
          <div
            className="list-pane"
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            {/* <button className="button primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }} onClick={() => startEditing(activeTab)}>
              <Plus size={16} /> Add New {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
            </button> */}
            <div className="table-card" style={{ padding: "0" }}>
              {(() => {
                const key = activeTab;
                const list =
                  typeof content[key] === "string"
                    ? JSON.parse(content[key])
                    : content[key] || [];
                return list.length ? (
                  list.map((item, i) => (
                    <div
                      key={i}
                      className="activity-row"
                      style={{
                        borderBottom: "1px solid #eee",
                        cursor: "pointer",
                        padding: "1rem",
                      }}
                      onClick={() => startEditing(key, i)}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "1rem",
                          marginBottom: "1rem",
                        }}
                      >
                        <div
                          onClick={() =>
                            previewImage(
                              item.image || item.img
                                ? `/api/${item.image || item.img}`
                                : null,
                            )
                          }
                          style={{
                            width: "80px",
                            height: "80px",
                            minWidth: "80px",
                            minHeight: "80px",
                            borderRadius: "50%",
                            border: "2px dashed #ccc",
                            overflow: "hidden",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: "#f9f9f9",
                            cursor: "pointer",
                          }}
                        >
                          {(
                            item.image || item.img
                              ? `/api/${item.image || item.img}`
                              : null
                          ) ? (
                            <img
                              src={
                                item.image || item.img
                                  ? `/api/${item.image || item.img}`
                                  : null
                              }
                              alt="Preview"
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                              }}
                            />
                          ) : (
                            <Image size={24} style={{ opacity: 0.3 }} />
                          )}
                        </div>
                      </div>
                      <div style={{ flex: 1 }}>
                        <strong style={{ textTransform: "capitalize" }}>
                          {item.title || item.name || item.q}
                        </strong>
                        <small style={{ display: "block", opacity: 0.6 }}>
                          {item.desc ||
                            item.role ||
                            item.a?.substring(0, 30) + "..."}
                        </small>
                      </div>
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button
                          className="button secondary compact"
                          onClick={(e) => {
                            e.stopPropagation();
                            startEditing(key, i);
                          }}
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          className="button danger compact"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteItem(key, i);
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-state">No items found.</div>
                );
              })()}
            </div>
          </div>

          <div className="edit-pane">
            {(editingIndex !== null ||
              (editingIndex === null &&
                /* Logic to show "Add New" form */ true)) && (
              <form
                className="form-card"
                onSubmit={(e) => {
                  e.preventDefault();
                  saveItem(activeTab);
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "1.5rem",
                  }}
                >
                  <h3 style={{ margin: 0 }}>
                    {editingIndex !== null ? "Edit Item" : "Add New Item"}
                  </h3>
                  {editingIndex !== null && (
                    <button
                      type="button"
                      className="btn-text"
                      onClick={() => {
                        setEditingIndex(null);
                        setEditForm({});
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.3rem",
                      }}
                    >
                      <X size={14} /> Cancel
                    </button>
                  )}
                </div>

                {activeTab === "carousel" && (
                  <>
                    <label>
                      Carousel Image
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "1rem",
                          marginBottom: "1rem",
                        }}
                      >
                        <div
                          onClick={() =>
                            previewImage(
                              filePreview ||
                                (editForm.image || editForm.img
                                  ? `/api/${editForm.image || editForm.img}`
                                  : null),
                            )
                          }
                          style={{
                            width: "80px",
                            height: "80px",
                            minWidth: "80px",
                            minHeight: "80px",
                            borderRadius: "50%",
                            border: "2px dashed #ccc",
                            overflow: "hidden",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: "#f9f9f9",
                            cursor: "pointer",
                          }}
                        >
                          {filePreview ? (
                            <img
                              src={filePreview}
                              alt="Preview"
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                              }}
                            />
                          ) : (
                            <Image size={24} style={{ opacity: 0.3 }} />
                          )}
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          style={{ fontSize: "0.8rem" }}
                        />
                      </div>
                    </label>
                    <label>
                      Title
                      <input
                        required
                        value={editForm.title || ""}
                        onChange={(e) =>
                          setEditForm({ ...editForm, title: e.target.value })
                        }
                      />
                    </label>
                    <label>
                      Description
                      <textarea
                        rows="3"
                        value={editForm.desc || ""}
                        onChange={(e) =>
                          setEditForm({ ...editForm, desc: e.target.value })
                        }
                      />
                    </label>
                  </>
                )}

                {activeTab === "workers" && (
                  <>
                    <label>
                      Full Name
                      <input
                        required
                        value={editForm.name || ""}
                        onChange={(e) =>
                          setEditForm({ ...editForm, name: e.target.value })
                        }
                      />
                    </label>
                    <label>
                      Role/Position
                      <input
                        required
                        value={editForm.role || ""}
                        onChange={(e) =>
                          setEditForm({ ...editForm, role: e.target.value })
                        }
                      />
                    </label>
                    <label>
                      Worker Photo
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "1rem",
                          marginBottom: "1rem",
                        }}
                      >
                        <div
                          onClick={() =>
                            previewImage(
                              filePreview ||
                                (editForm.image || editForm.img
                                  ? `/api/${editForm.image || editForm.img}`
                                  : null),
                            )
                          }
                          style={{
                            width: "80px",
                            height: "80px",
                            minWidth: "80px",
                            minHeight: "80px",
                            borderRadius: "50%",
                            border: "2px dashed #ccc",
                            overflow: "hidden",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: "#f9f9f9",
                            cursor: "pointer",
                          }}
                        >
                          {filePreview ? (
                            <img
                              src={filePreview}
                              alt="Preview"
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                              }}
                            />
                          ) : (
                            <Image size={24} style={{ opacity: 0.3 }} />
                          )}
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          style={{ fontSize: "0.8rem" }}
                        />
                      </div>
                    </label>
                  </>
                )}

                {activeTab === "faq" && (
                  <>
                    <label>
                      Question
                      <input
                        required
                        value={editForm.q || ""}
                        onChange={(e) =>
                          setEditForm({ ...editForm, q: e.target.value })
                        }
                      />
                    </label>
                    <label>
                      Answer
                      <textarea
                        required
                        rows="5"
                        value={editForm.a || ""}
                        onChange={(e) =>
                          setEditForm({ ...editForm, a: e.target.value })
                        }
                      />
                    </label>
                  </>
                )}

                <button className="button primary">
                  {editingIndex !== null ? "Update Item" : "Create Item"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
