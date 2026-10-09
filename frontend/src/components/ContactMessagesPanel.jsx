import { useEffect, useState } from "react";
import { Mail, Phone } from "lucide-react";
import api from "../lib/api";

function formatDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function MessageCard({
  message,
  isOwnMessage = false,
  onToggleStatus,
  updating = false,
}) {
  const createdAt = formatDate(message.created_at);

  return (
    <article className="admin-message-card">
      <div className="admin-message-header">
        <div>
          <h4>{message.subject || "Contact enquiry"}</h4>
          <strong>
            {message.name}
            {isOwnMessage && <span className="admin-message-self">From you</span>}
          </strong>
        </div>
        <div className="admin-message-status-actions">
          <span
            className={`admin-message-status ${message.status === "unread" ? "is-unread" : ""}`}
          >
            {message.status || "unread"}
          </span>
          {onToggleStatus && (
            <button
              type="button"
              className="admin-message-toggle"
              onClick={() => onToggleStatus(message)}
              disabled={updating}
              aria-label={`Mark message ${message.status === "unread" ? "as read" : "as unread"}`}
            >
              {updating
                ? "Saving…"
                : message.status === "unread"
                  ? "Mark as read"
                  : "Mark unread"}
            </button>
          )}
        </div>
      </div>
      <div className="admin-message-contact">
        <a href={`mailto:${message.email}`}>
          <Mail size={14} /> {message.email}
        </a>
        {message.phone && (
          <a href={`tel:${String(message.phone).replace(/[^\d+]/g, "")}`}>
            <Phone size={14} /> {message.phone}
          </a>
        )}
        {createdAt && (
          <time dateTime={createdAt.toISOString()}>{createdAt.toLocaleString()}</time>
        )}
      </div>
      <p>{message.message}</p>
    </article>
  );
}

function senderKey(message) {
  if (message.sender_user_id) return `user:${message.sender_user_id}`;
  return `email:${String(message.sender_email || message.email || "").trim().toLowerCase()}`;
}

export default function ContactMessagesPanel({
  admin = false,
  user,
  onStatusChange,
}) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    api
      .get(admin ? "/admin/messages" : "/account/messages")
      .then((response) => {
        if (active) setMessages(response.data.messages || []);
      })
      .catch((requestError) => {
        if (active) {
          setError(
            requestError.response?.data?.error ||
              "Messages could not be loaded. Please try again.",
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [admin]);

  async function toggleMessageStatus(message) {
    const status = message.status === "unread" ? "read" : "unread";
    setUpdatingId(message.id);
    setActionError("");
    try {
      await api.put(`/admin/messages/${message.id}/status`, { status });
      setMessages((current) =>
        current.map((item) =>
          item.id === message.id ? { ...item, status } : item,
        ),
      );
      onStatusChange?.(status);
    } catch (requestError) {
      setActionError(
        requestError.response?.data?.error ||
          "The message status could not be updated. Please try again.",
      );
    } finally {
      setUpdatingId(null);
    }
  }

  const ownEmail = String(user?.email || "").toLowerCase();
  const groups = admin
    ? messages.reduce((collection, message) => {
        const key = senderKey(message);
        if (!collection.has(key)) {
          collection.set(key, {
            key,
            name: message.sender_name || message.name || "Unknown sender",
            email: message.sender_email || message.email || "",
            messages: [],
          });
        }
        collection.get(key).messages.push(message);
        return collection;
      }, new Map())
    : null;

  return (
    <div className="table-card admin-message-inbox">
      <div className="table-heading">
        <div>
          <h3>{admin ? "Contact messages" : "Messages you sent"}</h3>
          {!loading && !error && (
            <small>
              {messages.length} message{messages.length === 1 ? "" : "s"}
              {admin ? ` from ${groups.size} sender${groups.size === 1 ? "" : "s"}` : ""}
            </small>
          )}
        </div>
      </div>

      {actionError && <div className="admin-message-action-error" role="alert">{actionError}</div>}
      {loading ? (
        <div className="empty-state">Loading messages…</div>
      ) : error ? (
        <div className="empty-state" role="alert">{error}</div>
      ) : messages.length === 0 ? (
        <div className="empty-state">
          {admin
            ? "Contact form submissions will appear here."
            : "Messages you send through the contact form will appear here."}
        </div>
      ) : admin ? (
        <div className="admin-message-groups">
          {[...groups.values()].map((group) => {
            const isOwnGroup =
              ownEmail && group.email.toLowerCase() === ownEmail;
            return (
              <details className="admin-message-group" key={group.key}>
                <summary>
                  <span>
                    <strong>
                      {group.name}
                      {isOwnGroup && (
                        <span className="admin-message-self">You</span>
                      )}
                    </strong>
                    <small>{group.email || "No email address"} · {group.messages.length} message{group.messages.length === 1 ? "" : "s"}</small>
                  </span>
                  <span className="admin-message-group-latest">
                    Latest: {group.messages[0].subject || "Contact enquiry"}
                  </span>
                </summary>
                <div className="admin-message-list">
                  {group.messages.map((message) => (
                    <MessageCard
                      key={message.id}
                      message={message}
                      isOwnMessage={isOwnGroup}
                      onToggleStatus={toggleMessageStatus}
                      updating={updatingId === message.id}
                    />
                  ))}
                </div>
              </details>
            );
          })}
        </div>
      ) : (
        <div className="admin-message-list">
          {messages.map((message) => (
            <MessageCard key={message.id} message={message} />
          ))}
        </div>
      )}
    </div>
  );
}
