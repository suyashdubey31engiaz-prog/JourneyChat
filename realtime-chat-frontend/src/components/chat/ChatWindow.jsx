import React, { useState, useContext, useEffect, useRef, useCallback } from "react";
import ChatBubble    from "../ChatBubble";
import DateSeparator from "./DateSeparator";
import ReplyBar      from "./ReplyBar";
import VoiceRecorder from "./VoiceRecorder";
import { ChatContext } from "../../context/ChatContext";
import { AuthContext } from "../../context/AuthContext";

const TYPING_TIMEOUT = 1500;

// ── Typing dots ───────────────────────────────────────────────────────────────
const TypingDots = ({ name }) => (
  <div style={{ display:"flex", alignItems:"flex-end", gap:8, margin:"4px 0" }}>
    <div style={{
      width:28, height:28, borderRadius:"50%", flexShrink:0,
      background:"linear-gradient(135deg,#0e7490,#1d4ed8)",
      display:"flex", alignItems:"center", justifyContent:"center",
      fontSize:11, fontWeight:700, color:"white",
    }}>
      {name?.charAt(0).toUpperCase()}
    </div>
    <div style={{
      display:"flex", alignItems:"center", gap:5,
      padding:"10px 14px", borderRadius:"1rem 1rem 1rem 0.25rem",
      background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.08)",
    }}>
      {[0, 0.2, 0.4].map((d, i) => (
        <div key={i} style={{
          width:7, height:7, borderRadius:"50%", background:"#00F5FF",
          animation:"typing 1.4s ease-in-out infinite",
          animationDelay:`${d}s`,
        }}/>
      ))}
    </div>
  </div>
);

// ── Group messages by date ────────────────────────────────────────────────────
const groupByDate = (msgs) => {
  const out = []; let last = null;
  msgs.forEach(m => {
    const d = new Date(m.timestamp || m.createdAt).toDateString();
    if (d !== last) { out.push({ type:"date", date: m.timestamp || m.createdAt }); last = d; }
    out.push({ type:"msg", msg:m });
  });
  return out;
};

// ── SVG Icons ─────────────────────────────────────────────────────────────────
const Icon = {
  Video: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="23 7 16 12 23 17 23 7"/>
      <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
    </svg>
  ),
  Phone: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.44 2 2 0 0 1 3.58 1.27h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.96a16 16 0 0 0 6.13 6.13l1.06-1.06a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
    </svg>
  ),
  Brush: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L3 14.67V21h6.33l10.06-10.06a5.5 5.5 0 0 0 0-7.78z"/>
      <line x1="17.5" y1="7.5" x2="9" y2="16"/>
    </svg>
  ),
  Search: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  ),
  Send: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M2 21L23 12 2 3v7l15 2-15 2z"/>
    </svg>
  ),
  Mic: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
      <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
      <line x1="12" y1="19" x2="12" y2="23"/>
      <line x1="8" y1="23" x2="16" y2="23"/>
    </svg>
  ),
  Clip: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
    </svg>
  ),
  X: () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  Down: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <polyline points="6 9 12 15 18 9"/>
    </svg>
  ),
};

// ══════════════════════════════════════════════════════════════════════════════
const ChatWindow = ({ contact, setActiveTab, isGlobal }) => {
  const {
    messages, globalMessages,
    sendMessage, sendGlobalMessage, deleteMessage,
    startCall,                        // accepts (contact, callType)
    typingUsers, onlineUsers,
    emitTyping, emitStopTyping,
  } = useContext(ChatContext);
  const { user } = useContext(AuthContext);

  const [input,       setInput]       = useState("");
  const [replyTo,     setReplyTo]     = useState(null);
  const [editingMsg,  setEditingMsg]  = useState(null);
  const [showAttach,  setShowAttach]  = useState(false);
  const [showVoice,   setShowVoice]   = useState(false);
  const [showScroll,  setShowScroll]  = useState(false);
  const [showSearch,  setShowSearch]  = useState(false);
  const [searchQ,     setSearchQ]     = useState("");
  const [uploading,   setUploading]   = useState(false);
  const [localMsgs,   setLocalMsgs]   = useState({});

  const scrollRef  = useRef(null);
  const bottomRef  = useRef(null);
  const typingRef  = useRef(null);
  const inputRef   = useRef(null);
  const imgRef     = useRef(null);
  const fileRef    = useRef(null);

  const rawMsgs       = isGlobal ? globalMessages : (messages[contact?._id] || []);
  const isOtherTyping = !isGlobal && contact && typingUsers?.has?.(contact._id);
  const isOnline      = !isGlobal && contact && onlineUsers?.has?.(String(contact._id));

  const allMsgs  = rawMsgs.map(m => ({ ...m, ...(localMsgs[m._id] || {}) }));
  const filtered = searchQ ? allMsgs.filter(m => m.content?.toLowerCase().includes(searchQ.toLowerCase())) : allMsgs;
  const grouped  = groupByDate(filtered);

  useEffect(() => {
    const el = scrollRef.current; if (!el) return;
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 130)
      bottomRef.current?.scrollIntoView({ behavior:"smooth" });
  }, [allMsgs, isOtherTyping]);

  const handleScroll = () => {
    const el = scrollRef.current; if (!el) return;
    setShowScroll(el.scrollHeight - el.scrollTop - el.clientHeight > 280);
  };

  const handleSend = () => {
    const text = input.trim(); if (!text) return;
    if (editingMsg) {
      setLocalMsgs(p => ({ ...p, [editingMsg._id]: { ...p[editingMsg._id], content:text, edited:true } }));
      setEditingMsg(null);
    } else {
      isGlobal ? sendGlobalMessage(text) : sendMessage(contact._id, text);
    }
    setInput(""); setReplyTo(null);
    clearTimeout(typingRef.current);
    if (!isGlobal && contact) emitStopTyping?.(contact._id);
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
    if (e.key === "Escape") { setReplyTo(null); setEditingMsg(null); setInput(""); }
  };

  const handleChange = (e) => {
    setInput(e.target.value);
    if (!isGlobal && contact) {
      emitTyping?.(contact._id);
      clearTimeout(typingRef.current);
      typingRef.current = setTimeout(() => emitStopTyping?.(contact._id), TYPING_TIMEOUT);
    }
  };

  const handleReact = useCallback((msgId, emoji) => {
    setLocalMsgs(prev => {
      const existing = prev[msgId]?.reactions || rawMsgs.find(m=>m._id===msgId)?.reactions || [];
      const myIdx    = existing.findIndex(r => String(r.userId?._id||r.userId) === String(user._id) && r.emoji===emoji);
      const reactions = myIdx >= 0
        ? existing.filter((_,i)=>i!==myIdx)
        : [...existing.filter(r=>String(r.userId?._id||r.userId)!==String(user._id)), { emoji, userId:user._id }];
      return { ...prev, [msgId]: { ...(prev[msgId]||{}), reactions } };
    });
  }, [rawMsgs, user]);

  const handleDelete = useCallback((msg) => {
    if (String(msg.sender?._id||msg.sender) === String(user._id))
      deleteMessage(msg._id, contact._id);
  }, [contact, user, deleteMessage]);

  useEffect(() => {
    if (editingMsg) { setInput(editingMsg.content||""); inputRef.current?.focus(); }
  }, [editingMsg]);

  const isMine = (msg) => {
    if (isGlobal) return msg.senderName === user.name;
    const sid = String(msg.sender?._id || msg.sender || "");
    const mid = String(user._id || "");
    return sid === mid && sid !== "";
  };

  const AttachMenu = () => (
    <div style={{
      position:"absolute", bottom:"calc(100% + 8px)", left:0, zIndex:50,
      background:"rgba(13,21,38,0.98)", border:"1px solid rgba(255,255,255,0.1)",
      borderRadius:14, overflow:"hidden", minWidth:180,
      boxShadow:"0 8px 32px rgba(0,0,0,0.5)", backdropFilter:"blur(20px)",
    }}>
      {[
        { icon:"🖼️", label:"Photo / Video", onClick:() => { imgRef.current?.click(); setShowAttach(false); } },
        { icon:"📄", label:"Document",      onClick:() => { fileRef.current?.click(); setShowAttach(false); } },
      ].map((item,i) => (
        <button key={i} onClick={item.onClick}
          style={{
            display:"flex", alignItems:"center", gap:10,
            width:"100%", padding:"12px 16px",
            background:"none", border:"none",
            borderBottom: i===0 ? "1px solid rgba(255,255,255,0.06)" : "none",
            cursor:"pointer", color:"#E8EAF0", fontSize:13,
            fontFamily:"Poppins,sans-serif", transition:"background .15s",
          }}
          onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.06)"}
          onMouseLeave={e=>e.currentTarget.style.background="none"}>
          <span style={{ fontSize:17 }}>{item.icon}</span>{item.label}
        </button>
      ))}
    </div>
  );

  const iconBtn = (active, accentHover="#00F5FF") => ({
    background: active ? "rgba(0,245,255,0.1)" : "none",
    border: "none", borderRadius:10,
    padding:"8px 9px", cursor:"pointer",
    color: active ? "#00F5FF" : "rgba(255,255,255,0.4)",
    display:"flex", alignItems:"center", justifyContent:"center",
    transition:"all .15s",
  });

  const mkIconBtn = (onClick, active, hoverColor="#00F5FF", title) => ({
    style: iconBtn(active),
    onClick,
    title,
    onMouseEnter: (e) => {
      e.currentTarget.style.color = hoverColor;
      e.currentTarget.style.background = `rgba(${hoverColor === "#FFE600" ? "255,230,0" : "0,245,255"},0.08)`;
    },
    onMouseLeave: (e) => {
      e.currentTarget.style.color = active ? hoverColor : "rgba(255,255,255,0.4)";
      e.currentTarget.style.background = active ? `rgba(${hoverColor === "#FFE600" ? "255,230,0" : "0,245,255"},0.1)` : "none";
    },
  });

  if (!contact) return null;

  return (
    <div style={{
      display:"flex", flexDirection:"column", height:"100%", width:"100%",
      background:"rgba(7,11,20,0.97)", borderRadius:14, overflow:"hidden",
      position:"relative",
    }}>

      {/* ── Header ── */}
      <div style={{
        display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"12px 16px", flexShrink:0,
        background:"rgba(10,14,26,0.99)", borderBottom:"1px solid rgba(255,255,255,0.06)",
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ position:"relative" }}>
            <div style={{
              width:40, height:40, borderRadius:"50%",
              background: isGlobal ? "rgba(0,245,255,0.1)" : "linear-gradient(135deg,#0e7490,#1d4ed8)",
              border: isGlobal ? "1px solid rgba(0,245,255,0.2)" : "none",
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize: isGlobal ? 18 : 15, fontWeight:700, color:"white",
            }}>
              {isGlobal ? "🌍" : (contact.name||"?").charAt(0).toUpperCase()}
            </div>
            {!isGlobal && (
              <span style={{
                position:"absolute", bottom:0, right:0,
                width:10, height:10, borderRadius:"50%",
                background: isOnline ? "#39FF14" : "rgba(255,255,255,0.2)",
                boxShadow: isOnline ? "0 0 6px #39FF14" : "none",
                border:"2px solid #070B14",
                transition:"background .3s",
              }}/>
            )}
          </div>
          <div>
            <p style={{ fontSize:14, fontWeight:700, color:"#E8EAF0", margin:0 }}>{contact.name}</p>
            <p style={{ fontSize:11, margin:0, color: isOnline&&!isGlobal ? "#39FF14" : "rgba(255,255,255,0.35)" }}>
              {isGlobal ? "Public · everyone"
                : isOtherTyping ? <span style={{ color:"#00F5FF" }}>typing…</span>
                : isOnline ? "● Online" : "● Offline"}
            </p>
          </div>
        </div>

        {/* ── Header action buttons ── */}
        <div style={{ display:"flex", alignItems:"center", gap:2 }}>
          {!isGlobal && (
            <>
              {/* ── AUDIO CALL BUTTON ── */}
              <button
                {...mkIconBtn(() => startCall(contact, "audio"), false, "#39FF14", "Audio call")}
                style={{
                  ...iconBtn(false),
                  marginRight:2,
                }}>
                <Icon.Phone />
              </button>

              {/* ── VIDEO CALL BUTTON ── */}
              <button
                {...mkIconBtn(() => startCall(contact, "video"), false, "#00F5FF", "Video call")}>
                <Icon.Video />
              </button>

              <button
                {...mkIconBtn(() => setActiveTab?.("whiteboard"), false, "#FFE600", "Whiteboard")}>
                <Icon.Brush />
              </button>
            </>
          )}
          <button
            {...mkIconBtn(() => { setShowSearch(s=>!s); setSearchQ(""); }, showSearch, "#00F5FF", "Search")}>
            <Icon.Search />
          </button>
        </div>
      </div>

      {/* ── Search bar ── */}
      {showSearch && (
        <div style={{
          display:"flex", alignItems:"center", gap:8, padding:"8px 14px",
          background:"rgba(10,14,26,0.95)", borderBottom:"1px solid rgba(255,255,255,0.06)",
        }}>
          <Icon.Search/>
          <input autoFocus value={searchQ} onChange={e=>setSearchQ(e.target.value)}
            placeholder="Search messages…"
            style={{ flex:1, background:"none", border:"none", outline:"none",
              color:"#E8EAF0", fontSize:13, fontFamily:"Poppins,sans-serif" }}/>
          {searchQ && (
            <button onClick={()=>setSearchQ("")}
              style={{ background:"none", border:"none", cursor:"pointer", color:"rgba(255,255,255,0.4)" }}>
              <Icon.X/>
            </button>
          )}
        </div>
      )}

      {/* ── Messages ── */}
      <div ref={scrollRef} onScroll={handleScroll}
        style={{
          flex:1, overflowY:"auto", padding:"12px 16px",
          display:"flex", flexDirection:"column", gap:2,
          backgroundImage:"radial-gradient(circle at 15% 85%,rgba(0,245,255,0.015) 0%,transparent 45%),radial-gradient(circle at 85% 15%,rgba(255,230,0,0.015) 0%,transparent 45%)",
        }}>

        {allMsgs.length === 0 && !searchQ && (
          <div style={{
            display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
            height:"100%", opacity:.4, textAlign:"center", gap:12,
          }}>
            <div style={{ fontSize:48 }}>💬</div>
            <p style={{ fontSize:13, color:"rgba(255,255,255,0.6)", margin:0 }}>
              {isGlobal ? "Be the first to say something!" : `Say hi to ${contact.name}!`}
            </p>
          </div>
        )}

        {grouped.map((item, idx) =>
          item.type === "date"
            ? <DateSeparator key={`d-${idx}`} date={item.date} />
            : (
              <ChatBubble
                key={item.msg._id || idx}
                msg={item.msg}
                isMe={isMine(item.msg)}
                isGlobal={isGlobal}
                senderName={isGlobal ? item.msg.senderName : null}
                status={item.msg.readBy?.length > 1 ? "read" : item.msg._id ? "delivered" : "sent"}
                onReply={msg => { setReplyTo({ ...msg, senderName: isGlobal ? msg.senderName : contact.name }); inputRef.current?.focus(); }}
                onEdit={msg => setEditingMsg(msg)}
                onDelete={handleDelete}
                onReact={handleReact}
              />
            )
        )}

        {isOtherTyping && <TypingDots name={contact.name} />}
        {uploading && (
          <div style={{ display:"flex", alignItems:"center", gap:8, fontSize:12, color:"#00F5FF", padding:"4px 0" }}>
            <div style={{ width:14, height:14, border:"2px solid #00F5FF", borderTop:"2px solid transparent",
              borderRadius:"50%", animation:"spin 1s linear infinite" }}/>
            Uploading…
          </div>
        )}
        <div ref={bottomRef}/>
      </div>

      {/* Scroll FAB */}
      {showScroll && (
        <button onClick={() => bottomRef.current?.scrollIntoView({ behavior:"smooth" })}
          style={{
            position:"absolute", right:16, bottom:90, width:36, height:36,
            borderRadius:"50%", border:"1px solid rgba(0,245,255,0.25)",
            background:"rgba(13,21,38,0.95)", color:"#00F5FF",
            display:"flex", alignItems:"center", justifyContent:"center",
            cursor:"pointer", boxShadow:"0 4px 16px rgba(0,0,0,0.4)",
            zIndex:10,
          }}>
          <Icon.Down/>
        </button>
      )}

      {/* Reply bar */}
      {replyTo && !editingMsg && <ReplyBar replyTo={replyTo} onCancel={() => setReplyTo(null)} />}

      {/* Edit bar */}
      {editingMsg && (
        <div style={{
          display:"flex", alignItems:"center", gap:10, padding:"10px 14px",
          background:"rgba(255,230,0,0.04)", borderTop:"1px solid rgba(255,230,0,0.15)",
        }}>
          <div style={{ width:3, alignSelf:"stretch", borderRadius:99, background:"#FFE600" }}/>
          <div style={{ flex:1, minWidth:0 }}>
            <p style={{ fontSize:11, fontWeight:700, color:"#FFE600", margin:"0 0 2px" }}>Editing</p>
            <p style={{ fontSize:12, color:"rgba(255,255,255,0.5)", margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
              {editingMsg.content}
            </p>
          </div>
          <button onClick={() => { setEditingMsg(null); setInput(""); }}
            style={{ background:"none", border:"none", cursor:"pointer", color:"rgba(255,255,255,0.4)", padding:4 }}>
            <Icon.X/>
          </button>
        </div>
      )}

      {/* Voice recorder */}
      {showVoice && (
        <VoiceRecorder
          onSend={(blob, dur) => { setShowVoice(false); console.log("Voice:", dur+"s"); }}
          onCancel={() => setShowVoice(false)}
        />
      )}

      {/* ── Input bar ── */}
      {!showVoice && (
        <div style={{
          flexShrink:0, padding:"10px 12px",
          background:"rgba(10,14,26,0.99)", borderTop:"1px solid rgba(255,255,255,0.06)",
          position:"relative",
        }}>
          {showAttach && <AttachMenu />}
          <div style={{ display:"flex", alignItems:"flex-end", gap:8 }}>
            <button
              {...mkIconBtn(() => setShowAttach(s=>!s), showAttach, "#00F5FF", "Attach file")}
              style={{ ...iconBtn(showAttach), flexShrink:0, padding:"10px" }}>
              <Icon.Clip/>
            </button>

            <textarea
              ref={inputRef}
              rows={1}
              value={input}
              onChange={handleChange}
              onKeyDown={handleKey}
              placeholder={
                editingMsg ? "Edit your message…"
                : isGlobal  ? "Say something to everyone…"
                : `Message ${contact.name}…`
              }
              style={{
                flex:1, resize:"none", outline:"none",
                padding:"11px 14px", borderRadius:14, maxHeight:120, overflowY:"auto",
                background:"rgba(255,255,255,0.05)",
                border:"1px solid rgba(255,255,255,0.09)",
                color:"#E8EAF0", fontSize:14, fontFamily:"Poppins,sans-serif",
                lineHeight:1.5, transition:"border .2s",
              }}
              onFocus={e=>e.target.style.borderColor="rgba(0,245,255,0.4)"}
              onBlur={e=>e.target.style.borderColor="rgba(255,255,255,0.09)"}
            />

            {input.trim() ? (
              <button onClick={handleSend}
                style={{
                  width:44, height:44, borderRadius:"50%", flexShrink:0,
                  background:"linear-gradient(135deg,#00F5FF,#0077cc)",
                  border:"none", cursor:"pointer",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  color:"#020d14",
                  boxShadow:"0 0 16px rgba(0,245,255,0.4)",
                  transition:"all .15s",
                }}
                onMouseEnter={e=>e.currentTarget.style.transform="scale(1.08)"}
                onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}>
                <Icon.Send/>
              </button>
            ) : (
              <button onClick={() => setShowVoice(true)}
                style={{
                  width:44, height:44, borderRadius:"50%", flexShrink:0,
                  background:"rgba(255,255,255,0.06)",
                  border:"1px solid rgba(255,255,255,0.1)",
                  cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
                  color:"rgba(255,255,255,0.45)", transition:"all .15s",
                }}
                onMouseEnter={e=>{ e.currentTarget.style.color="#00F5FF"; e.currentTarget.style.borderColor="rgba(0,245,255,0.3)"; }}
                onMouseLeave={e=>{ e.currentTarget.style.color="rgba(255,255,255,0.45)"; e.currentTarget.style.borderColor="rgba(255,255,255,0.1)"; }}>
                <Icon.Mic/>
              </button>
            )}
          </div>

          <p style={{ fontSize:10, marginTop:6, paddingLeft:4, color:"rgba(255,255,255,0.2)" }}>
            Enter send · Shift+Enter newline · Esc cancel
          </p>
        </div>
      )}

      <input ref={imgRef}  type="file" accept="image/*,video/*" style={{ display:"none" }}
        onChange={() => { setUploading(true); setTimeout(()=>setUploading(false),2000); }} />
      <input ref={fileRef} type="file" accept=".pdf,.doc,.docx,.txt,.zip,.rar" style={{ display:"none" }}
        onChange={() => { setUploading(true); setTimeout(()=>setUploading(false),2000); }} />
    </div>
  );
};

export default ChatWindow;