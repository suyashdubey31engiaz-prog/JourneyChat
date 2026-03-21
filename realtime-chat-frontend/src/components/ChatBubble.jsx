import React, { useState, useRef, useCallback, useContext } from "react";
import { ChatContext }  from "../context/ChatContext";
import { AuthContext }  from "../context/AuthContext";

// ── Time formatter ────────────────────────────────────────────────────────────
const fmt = (d) => {
  if (!d) return "";
  return new Date(d).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
};

// ── Quick reaction bar ────────────────────────────────────────────────────────
const EMOJIS = ["👍","❤️","😂","😮","😢","🙏","🔥","✨"];

const ReactionBar = ({ onReact, onClose, isMe }) => {
  const ref = useRef(null);
  React.useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [onClose]);

  return (
    <div ref={ref} style={{
      position:"absolute", bottom:"calc(100% + 6px)",
      [isMe ? "right" : "left"]: 0,
      display:"flex", alignItems:"center", gap:2,
      background:"rgba(13,21,38,0.98)", border:"1px solid rgba(255,255,255,0.1)",
      borderRadius:99, padding:"6px 10px",
      boxShadow:"0 8px 32px rgba(0,0,0,0.6)",
      backdropFilter:"blur(20px)", zIndex:100,
      animation:"scale-in 0.2s ease both",
    }}>
      {EMOJIS.map(e => (
        <button key={e} onClick={() => { onReact(e); onClose(); }}
          style={{
            background:"none", border:"none", cursor:"pointer",
            fontSize:18, width:32, height:32,
            display:"flex", alignItems:"center", justifyContent:"center",
            borderRadius:8, transition:"transform .15s",
          }}
          onMouseEnter={ev => ev.target.style.transform="scale(1.3)"}
          onMouseLeave={ev => ev.target.style.transform="scale(1)"}>
          {e}
        </button>
      ))}
    </div>
  );
};

// ── Context menu ──────────────────────────────────────────────────────────────
const ContextMenu = ({ x, y, isMe, onReply, onCopy, onDelete, onClose }) => {
  const ref = useRef(null);
  React.useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [onClose]);

  const left = Math.min(x, window.innerWidth  - 180);
  const top  = Math.min(y, window.innerHeight - 200);

  const items = [
    { icon:"↩️", label:"Reply",  action: onReply },
    { icon:"📋", label:"Copy",   action: onCopy  },
    ...(isMe ? [{ icon:"🗑️", label:"Delete", action: onDelete, danger: true }] : []),
  ];

  return (
    <div ref={ref} style={{
      position:"fixed", left, top, zIndex:999,
      background:"rgba(13,21,38,0.98)", border:"1px solid rgba(255,255,255,0.1)",
      borderRadius:14, overflow:"hidden", minWidth:160,
      boxShadow:"0 8px 32px rgba(0,0,0,0.6)", backdropFilter:"blur(20px)",
      animation:"scale-in 0.2s ease both",
    }}>
      {items.map((item, i) => (
        <button key={i} onClick={() => { item.action?.(); onClose(); }}
          style={{
            display:"flex", alignItems:"center", gap:10,
            width:"100%", padding:"11px 16px",
            background:"none", border:"none",
            borderBottom: i < items.length-1 ? "1px solid rgba(255,255,255,0.05)" : "none",
            cursor:"pointer", textAlign:"left",
            color: item.danger ? "#ff4757" : "#E8EAF0",
            fontSize:13, fontFamily:"Poppins,sans-serif",
            transition:"background .15s",
          }}
          onMouseEnter={e => e.currentTarget.style.background="rgba(255,255,255,0.05)"}
          onMouseLeave={e => e.currentTarget.style.background="none"}>
          <span style={{fontSize:15}}>{item.icon}</span>
          {item.label}
        </button>
      ))}
    </div>
  );
};

// ── Reactions display ─────────────────────────────────────────────────────────
const ReactionsRow = ({ reactions = [], myId, onReact, isMe }) => {
  if (!reactions.length) return null;
  const grouped = {};
  reactions.forEach(r => {
    const e = r.emoji;
    if (!grouped[e]) grouped[e] = { count:0, mine:false };
    grouped[e].count++;
    if (String(r.userId?._id || r.userId) === String(myId)) grouped[e].mine = true;
  });

  return (
    <div style={{
      display:"flex", flexWrap:"wrap", gap:4, marginTop:4,
      justifyContent: isMe ? "flex-end" : "flex-start",
    }}>
      {Object.entries(grouped).map(([emoji, { count, mine }]) => (
        <button key={emoji} onClick={() => onReact(emoji)}
          style={{
            display:"flex", alignItems:"center", gap:3,
            padding:"2px 7px", borderRadius:99, fontSize:12, cursor:"pointer",
            background: mine ? "rgba(0,245,255,0.12)" : "rgba(255,255,255,0.06)",
            border: `1px solid ${mine ? "rgba(0,245,255,0.35)" : "rgba(255,255,255,0.08)"}`,
            color: mine ? "#00F5FF" : "rgba(255,255,255,0.65)",
            fontFamily:"Poppins,sans-serif", transition:"all .15s",
          }}>
          <span>{emoji}</span>
          {count > 1 && <span style={{ fontWeight:700 }}>{count}</span>}
        </button>
      ))}
    </div>
  );
};

// ── Reply preview (inside bubble) ─────────────────────────────────────────────
const ReplyBox = ({ replyTo, isMe }) => {
  if (!replyTo) return null;
  const preview =
    replyTo.type==="image" ? "📷 Photo" :
    replyTo.type==="voice" ? "🎙️ Voice" :
    replyTo.type==="file"  ? "📎 File" :
    (replyTo.content||"").slice(0, 55);

  return (
    <div style={{
      display:"flex", gap:6, marginBottom:8, borderRadius:8, overflow:"hidden",
      background:"rgba(0,0,0,0.18)",
    }}>
      <div style={{
        width:3, flexShrink:0, alignSelf:"stretch",
        background: isMe ? "rgba(255,255,255,0.3)" : "#00F5FF",
      }}/>
      <div style={{ padding:"6px 8px 6px 0", minWidth:0 }}>
        <p style={{ fontSize:10, fontWeight:700, color: isMe ? "rgba(255,255,255,0.6)" : "#00F5FF", margin:"0 0 2px" }}>
          {replyTo.senderName}
        </p>
        <p style={{ fontSize:11, opacity:.7, margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
          {preview}
        </p>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// MAIN BUBBLE COMPONENT
// ══════════════════════════════════════════════════════════════════════════════
const ChatBubble = ({
  msg, isMe, isGlobal=false, senderName=null, status="sent",
  onReply, onEdit, onDelete, onReact,
}) => {
  const { user }             = useContext(AuthContext);
  const [menu,  setMenu]     = useState(null);   // { x, y }
  const [picker,setPicker]   = useState(false);
  const longRef              = useRef(null);
  const bubbleRef            = useRef(null);

  const openMenu = (x, y) => { setMenu({ x, y }); setPicker(false); };

  const onContextMenu = (e) => { e.preventDefault(); openMenu(e.clientX, e.clientY); };
  const startLong     = ()  => {
    longRef.current = setTimeout(() => {
      const r = bubbleRef.current?.getBoundingClientRect();
      if (r) openMenu(isMe ? r.left - 170 : r.right + 6, r.top);
    }, 500);
  };
  const cancelLong = () => clearTimeout(longRef.current);

  // Deleted message
  if (msg.deletedForEveryone) {
    return (
      <div style={{
        display:"flex", justifyContent: isMe ? "flex-end" : "flex-start",
        margin:"2px 0",
      }}>
        <div style={{
          padding:"7px 14px", borderRadius:14, fontSize:12, fontStyle:"italic",
          color:"rgba(255,255,255,0.35)", border:"1px solid rgba(255,255,255,0.06)",
        }}>
          🚫 This message was deleted
        </div>
      </div>
    );
  }

  // Bubble colours
  const meStyle = {
    background:"linear-gradient(135deg,#0077b6,#023e8a)",
    color:"#e0f7ff",
    borderRadius:"1.1rem 1.1rem 0.25rem 1.1rem",
    boxShadow:"0 2px 12px rgba(0,100,180,0.3)",
  };
  const themStyle = {
    background:"rgba(255,255,255,0.07)",
    border:"1px solid rgba(255,255,255,0.1)",
    color:"#E8EAF0",
    borderRadius:"1.1rem 1.1rem 1.1rem 0.25rem",
    backdropFilter:"blur(8px)",
  };

  // Read status ticks
  const Ticks = () => {
    const col = status==="read" ? "#00F5FF" : "rgba(255,255,255,0.4)";
    return (
      <span style={{ color:col, fontSize:11, marginLeft:4 }}>
        {status==="sent" ? "✓" : "✓✓"}
      </span>
    );
  };

  return (
    <>
      {menu && (
        <ContextMenu
          x={menu.x} y={menu.y} isMe={isMe}
          onReply={() => onReply?.(msg)}
          onCopy={() => navigator.clipboard?.writeText(msg.content || "")}
          onDelete={() => {
            if (window.confirm("Delete this message?")) onDelete?.(msg);
          }}
          onClose={() => setMenu(null)}
        />
      )}

      <div style={{
        display:"flex", alignItems:"flex-end", gap:6, width:"100%",
        flexDirection: isMe ? "row-reverse" : "row",
        margin:"2px 0",
      }}>
        {/* Avatar for global / received */}
        {!isMe && (
          <div style={{
            width:28, height:28, borderRadius:"50%", flexShrink:0, marginBottom:4,
            background:"linear-gradient(135deg,#0e7490,#1d4ed8)",
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:11, fontWeight:700, color:"white",
          }}>
            {(senderName || "?").charAt(0).toUpperCase()}
          </div>
        )}

        <div style={{
          display:"flex", flexDirection:"column", maxWidth:"68%",
          alignItems: isMe ? "flex-end" : "flex-start",
        }}>
          {/* Global sender name */}
          {!isMe && senderName && (
            <span style={{ fontSize:10, fontWeight:700, color:"#FFE600", paddingLeft:4, marginBottom:2 }}>
              {senderName}
            </span>
          )}

          {/* Forwarded label */}
          {msg.forwarded && (
            <span style={{ fontSize:10, color:"rgba(255,255,255,0.4)", marginBottom:2 }}>
              ↪ Forwarded
            </span>
          )}

          {/* Bubble */}
          <div
            ref={bubbleRef}
            style={{ position:"relative", ...(isMe ? meStyle : themStyle), padding:"10px 14px", cursor:"pointer" }}
            onContextMenu={onContextMenu}
            onMouseDown={startLong}
            onMouseUp={cancelLong}
            onMouseLeave={cancelLong}
            onTouchStart={startLong}
            onTouchEnd={cancelLong}
          >
            {/* Emoji picker trigger on hover */}
            <button
              onClick={() => setPicker(p => !p)}
              style={{
                position:"absolute", top:4, [isMe?"left":"right"]:4,
                background:"rgba(0,0,0,0.25)", border:"none", borderRadius:99,
                width:22, height:22, fontSize:12, cursor:"pointer",
                display:"flex", alignItems:"center", justifyContent:"center",
                opacity:0, transition:"opacity .15s",
              }}
              onMouseEnter={e => e.currentTarget.style.opacity="1"}
              onMouseLeave={e => e.currentTarget.style.opacity="0"}
            >
              🙂
            </button>
            {picker && (
              <ReactionBar
                isMe={isMe}
                onReact={(emoji) => onReact?.(msg._id, emoji)}
                onClose={() => setPicker(false)}
              />
            )}

            {/* Reply quote */}
            <ReplyBox replyTo={msg.replyTo} isMe={isMe} />

            {/* Content */}
            {msg.type === "image" && msg.fileUrl ? (
              <div style={{ margin:"-10px -14px", marginBottom:8, borderRadius:"1.1rem 1.1rem 0 0", overflow:"hidden" }}>
                <a href={msg.fileUrl} target="_blank" rel="noreferrer">
                  <img src={msg.fileUrl} alt="img" style={{ width:"100%", maxWidth:280, maxHeight:240, objectFit:"cover", display:"block" }} />
                </a>
                {msg.content && <p style={{ padding:"8px 14px 0", fontSize:13, margin:0 }}>{msg.content}</p>}
              </div>
            ) : msg.type === "file" ? (
              <a href={msg.fileUrl} target="_blank" rel="noreferrer"
                style={{ display:"flex", alignItems:"center", gap:10, textDecoration:"none", color:"inherit" }}>
                <div style={{ width:40, height:40, borderRadius:10, background:"rgba(0,0,0,0.2)",
                  display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, flexShrink:0 }}>📄</div>
                <div style={{ minWidth:0 }}>
                  <p style={{ fontSize:12, fontWeight:600, margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                    {msg.fileName || "File"}
                  </p>
                  <p style={{ fontSize:10, opacity:.6, margin:0 }}>
                    {msg.fileSize ? `${Math.round(msg.fileSize/1024)} KB` : ""}
                  </p>
                </div>
                <span style={{ fontSize:16, marginLeft:"auto" }}>↓</span>
              </a>
            ) : (
              <p style={{ margin:0, fontSize:14, lineHeight:1.55, whiteSpace:"pre-wrap", wordBreak:"break-word" }}>
                {msg.content}
              </p>
            )}

            {/* Edited label + time + status */}
            <div style={{
              display:"flex", alignItems:"center", gap:4, marginTop:5,
              justifyContent: isMe ? "flex-end" : "flex-start",
            }}>
              {msg.edited && <span style={{ fontSize:9, opacity:.45 }}>edited</span>}
              <span style={{ fontSize:10, opacity:.5 }}>{fmt(msg.timestamp || msg.createdAt)}</span>
              {isMe && <Ticks />}
            </div>
          </div>

          {/* Reactions */}
          <ReactionsRow
            reactions={msg.reactions || []}
            myId={user?._id}
            onReact={(emoji) => onReact?.(msg._id, emoji)}
            isMe={isMe}
          />
        </div>
      </div>
    </>
  );
};

export default ChatBubble;