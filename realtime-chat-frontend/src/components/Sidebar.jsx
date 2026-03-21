import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { ChatContext } from "../context/ChatContext";

const initials = (name = "") =>
  name.trim().split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) || "?";

const fmtTime = (d) => {
  if (!d) return "";
  const dt = new Date(d), now = new Date();
  if (dt.toDateString() === now.toDateString())
    return dt.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  const y = new Date(now); y.setDate(y.getDate() - 1);
  if (dt.toDateString() === y.toDateString()) return "Yesterday";
  return dt.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
};

const Avatar = ({ name, avatar, size = 40, online }) => (
  <div style={{ position: "relative", flexShrink: 0 }}>
    {avatar ? (
      <img src={avatar} alt={name}
        style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover" }} />
    ) : (
      <div style={{
        width: size, height: size, borderRadius: "50%",
        background: "linear-gradient(135deg,#0e7490,#1d4ed8)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontWeight: 700, color: "white", fontSize: size > 38 ? 14 : 12,
      }}>
        {initials(name)}
      </div>
    )}
    {/* Online dot — always rendered, colour toggles */}
    <span style={{
      position: "absolute", bottom: 0, right: 0,
      width: size > 38 ? 11 : 9,
      height: size > 38 ? 11 : 9,
      borderRadius: "50%",
      background: online ? "#39FF14" : "rgba(255,255,255,0.18)",
      boxShadow: online ? "0 0 6px #39FF14" : "none",
      border: "2px solid #070B14",
      transition: "background .3s, box-shadow .3s",
    }} />
  </div>
);

const ContactRow = ({ contact, isActive, onClick, lastMsg, unread, online }) => {
  const [hov, setHov] = useState(false);
  const preview =
    !lastMsg ? "" :
    lastMsg.type === "image" ? "📷 Photo" :
    lastMsg.type === "voice" ? "🎙️ Voice" :
    lastMsg.type === "file"  ? `📎 ${lastMsg.fileName || "File"}` :
    (lastMsg.content || "").slice(0, 42);

  return (
    <div onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "10px 12px", margin: "0 6px 2px", borderRadius: 12,
        cursor: "pointer", transition: "all .15s",
        background: isActive
          ? "rgba(0,245,255,0.09)"
          : hov ? "rgba(0,245,255,0.04)" : "transparent",
        border: `1px solid ${isActive
          ? "rgba(0,245,255,0.25)"
          : hov ? "rgba(0,245,255,0.08)" : "transparent"}`,
      }}>
      <Avatar name={contact.name} avatar={contact.avatar} online={online} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6, marginBottom: 2 }}>
          <p style={{
            fontSize: 13.5, fontWeight: unread > 0 ? 700 : 600, margin: 0,
            color: isActive ? "#00F5FF" : "#E8EAF0",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            textShadow: isActive ? "0 0 8px rgba(0,245,255,0.4)" : "none",
          }}>{contact.name}</p>
          {lastMsg?.timestamp && (
            <span style={{
              fontSize: 10, flexShrink: 0,
              color: unread > 0 ? "#00F5FF" : "rgba(255,255,255,0.3)",
              fontWeight: unread > 0 ? 700 : 400,
            }}>
              {fmtTime(lastMsg.timestamp || lastMsg.createdAt)}
            </span>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
          <p style={{
            fontSize: 12, margin: 0,
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            color: unread > 0 ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.35)",
            fontWeight: unread > 0 ? 600 : 400,
          }}>
            {preview || <em style={{ opacity: .45 }}>Start chatting</em>}
          </p>
          {/* ── FIX: Unread badge ─────────────────────────────────────── */}
          {unread > 0 && (
            <span style={{
              minWidth: 19, height: 19, padding: "0 5px",
              borderRadius: 99, background: "#00F5FF", color: "#020d14",
              fontSize: 10, fontWeight: 800,
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 0 8px rgba(0,245,255,0.55)", flexShrink: 0,
            }}>
              {unread > 99 ? "99+" : unread}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
const Sidebar = ({ setActiveTab }) => {
  const { user, logout } = useContext(AuthContext);
  const {
    contacts, onlineUsers, selectedContact,
    messages, unreadCounts,              // ← use unreadCounts from context
    fetchMessages, selectGlobal,
  } = useContext(ChatContext);

  const [search,  setSearch]  = useState("");
  const [sfocus,  setSfocus]  = useState(false);

  const filtered = contacts.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  const getMeta = (contactId) => {
    const msgs   = messages[contactId] || [];
    const lastMsg = msgs[msgs.length - 1] || null;
    // ── FIX: use unreadCounts from context, not computed locally ─────────────
    const unread  = unreadCounts[contactId] || 0;
    return { lastMsg, unread };
  };

  return (
    <div style={{
      width: 300, height: "100%",
      display: "flex", flexDirection: "column", flexShrink: 0,
      background: "rgba(8,12,22,0.98)",
      borderRight: "1px solid rgba(255,255,255,0.06)",
    }}>

      {/* Header */}
      <div style={{ padding: "18px 14px 12px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{
              width: 30, height: 30, borderRadius: 9, fontSize: 14,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: "linear-gradient(135deg,#0e7490,#1d4ed8)",
              boxShadow: "0 0 14px rgba(0,245,255,0.25)",
            }}>💬</div>
            <span style={{
              fontWeight: 900, fontSize: 15,
              background: "linear-gradient(90deg,#00F5FF,#FFE600)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            }}>JourneyChat</span>
          </div>
          <button onClick={logout} title="Sign out"
            style={{
              background: "none", border: "none", cursor: "pointer",
              padding: "6px 8px", borderRadius: 8,
              color: "rgba(255,255,255,0.3)", fontSize: 16, transition: "all .15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.color = "#ff4757"; e.currentTarget.style.background = "rgba(255,71,87,0.1)"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.3)"; e.currentTarget.style.background = "none"; }}>
            ⏻
          </button>
        </div>

        {/* Own profile */}
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "9px 11px", borderRadius: 11,
          background: "rgba(0,245,255,0.03)", border: "1px solid rgba(0,245,255,0.08)",
        }}>
          <Avatar name={user?.name || ""} avatar={user?.avatar || ""} size={36} online={true} />
          <div style={{ minWidth: 0, flex: 1 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: "#E8EAF0", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {user?.name}
            </p>
            <p style={{ fontSize: 10, margin: 0, color: "#39FF14", textShadow: "0 0 6px #39FF14" }}>
              ● Online
            </p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div style={{ padding: "8px 12px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ position: "relative" }}>
          <span style={{
            position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)",
            color: "rgba(255,255,255,0.3)", fontSize: 12, pointerEvents: "none",
          }}>🔍</span>
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search contacts…"
            onFocus={() => setSfocus(true)} onBlur={() => setSfocus(false)}
            style={{
              width: "100%", paddingLeft: 30, paddingRight: 12, paddingTop: 8, paddingBottom: 8,
              borderRadius: 10, fontSize: 12, fontFamily: "Poppins,sans-serif",
              background: "rgba(255,255,255,0.05)",
              border: `1px solid ${sfocus ? "rgba(0,245,255,0.3)" : "rgba(255,255,255,0.07)"}`,
              color: "#E8EAF0", outline: "none", transition: "border .2s",
            }} />
        </div>
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: "auto", paddingTop: 8 }}>
        {!search && (
          <>
            <p style={{ fontSize: 9.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".12em", padding: "2px 16px 6px", color: "rgba(255,255,255,0.22)" }}>
              Channels
            </p>

            {/* Global */}
            <div onClick={() => { selectGlobal(); setActiveTab("chat"); }}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "10px 12px", margin: "0 6px 2px", borderRadius: 12,
                cursor: "pointer", transition: "all .15s",
                background: selectedContact?._id === "global" ? "rgba(0,245,255,0.09)" : "transparent",
                border: `1px solid ${selectedContact?._id === "global" ? "rgba(0,245,255,0.25)" : "transparent"}`,
              }}
              onMouseEnter={e => { if (selectedContact?._id !== "global") e.currentTarget.style.background = "rgba(0,245,255,0.04)"; }}
              onMouseLeave={e => { if (selectedContact?._id !== "global") e.currentTarget.style.background = "transparent"; }}>
              <div style={{ width: 38, height: 38, borderRadius: "50%", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, background: "rgba(0,245,255,0.08)", border: "1px solid rgba(0,245,255,0.15)" }}>🌍</div>
              <div style={{ minWidth: 0 }}>
                <p style={{ fontSize: 13.5, fontWeight: 600, margin: 0, color: selectedContact?._id === "global" ? "#00F5FF" : "#E8EAF0" }}>Global Chat</p>
                <p style={{ fontSize: 11, margin: 0, color: "rgba(255,255,255,0.35)" }}>Open to everyone</p>
              </div>
            </div>

            {/* Saved */}
            <div style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "10px 12px", margin: "0 6px 4px", borderRadius: 12,
              cursor: "pointer", transition: "all .15s",
            }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(255,230,0,0.05)"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              <div style={{ width: 38, height: 38, borderRadius: "50%", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, background: "rgba(255,230,0,0.08)", border: "1px solid rgba(255,230,0,0.15)" }}>🔖</div>
              <div>
                <p style={{ fontSize: 13.5, fontWeight: 600, margin: 0, color: "#E8EAF0" }}>Saved Messages</p>
                <p style={{ fontSize: 11, margin: 0, color: "rgba(255,255,255,0.35)" }}>Your personal notes</p>
              </div>
            </div>

            <div style={{ height: 1, margin: "4px 12px 8px", background: "rgba(255,255,255,0.05)" }} />
          </>
        )}

        <p style={{ fontSize: 9.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".12em", padding: "2px 16px 6px", color: "rgba(255,255,255,0.22)" }}>
          {search ? `Results — ${filtered.length}` : `Direct — ${contacts.length}`}
        </p>

        {filtered.length === 0 ? (
          <p style={{ fontSize: 12, padding: "20px 16px", textAlign: "center", color: "rgba(255,255,255,0.3)" }}>
            {search ? "No contacts match" : "No other users yet"}
          </p>
        ) : (
          filtered.map(c => {
            const { lastMsg, unread } = getMeta(c._id);
            // ── FIX: Read online status correctly ─────────────────────────
            const isOnline = onlineUsers.has(String(c._id));
            return (
              <ContactRow
                key={c._id}
                contact={c}
                isActive={selectedContact?._id === c._id}
                onClick={() => { fetchMessages(c); setActiveTab("chat"); }}
                lastMsg={lastMsg}
                unread={unread}
                online={isOnline}   // ← always pass boolean
              />
            );
          })
        )}
      </div>

      {/* Footer */}
      <div style={{ padding: "8px 14px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <p style={{ fontSize: 10, textAlign: "center", color: "rgba(255,255,255,0.15)", margin: 0 }}>
          🔒 End-to-end encrypted · <span style={{ color: "#00F5FF" }}>JourneyChat</span>
        </p>
      </div>
    </div>
  );
};

export default Sidebar;