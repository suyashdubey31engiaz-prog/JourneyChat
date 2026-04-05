import React, { useState, useEffect, useRef } from "react";

// ── Color palette for notes ───────────────────────────────────────────────────
const NOTE_COLORS = [
  { id:"cyan",   bg:"rgba(0,245,255,0.08)",   border:"rgba(0,245,255,0.25)",   accent:"#00F5FF",   label:"Cyan"   },
  { id:"yellow", bg:"rgba(255,230,0,0.08)",   border:"rgba(255,230,0,0.25)",   accent:"#FFE600",   label:"Yellow" },
  { id:"purple", bg:"rgba(139,92,246,0.1)",   border:"rgba(139,92,246,0.28)",  accent:"#a78bfa",   label:"Purple" },
  { id:"green",  bg:"rgba(34,197,94,0.08)",   border:"rgba(34,197,94,0.25)",   accent:"#4ade80",   label:"Green"  },
  { id:"coral",  bg:"rgba(251,113,133,0.09)", border:"rgba(251,113,133,0.28)", accent:"#fb7185",   label:"Coral"  },
  { id:"blue",   bg:"rgba(59,130,246,0.09)",  border:"rgba(59,130,246,0.28)",  accent:"#60a5fa",   label:"Blue"   },
  { id:"orange", bg:"rgba(249,115,22,0.09)",  border:"rgba(249,115,22,0.25)",  accent:"#fb923c",   label:"Orange" },
  { id:"teal",   bg:"rgba(20,184,166,0.09)",  border:"rgba(20,184,166,0.28)",  accent:"#2dd4bf",   label:"Teal"   },
];

const NOTE_ICONS = ["📌","💡","🎯","✅","⭐","🔥","🧠","💬","📝","🚀","❤️","🎨","📚","🔑","🎵","💎"];

const getColor = (id) => NOTE_COLORS.find(c => c.id === id) || NOTE_COLORS[0];

const uid = () => Math.random().toString(36).slice(2,10);

const fmtDate = (ts) => {
  const d = new Date(ts), now = new Date();
  if (d.toDateString() === now.toDateString()) return d.toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"});
  return d.toLocaleDateString("en-IN",{day:"numeric",month:"short"});
};

// ── Single note card ──────────────────────────────────────────────────────────
const NoteCard = ({ note, onEdit, onDelete, onColorChange, onIconChange }) => {
  const [hov, setHov]         = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const col = getColor(note.color);

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => { setHov(false); setShowPicker(false); }}
      style={{
        position: "relative",
        background: col.bg,
        border: `1.5px solid ${hov ? col.accent : col.border}`,
        borderRadius: 18,
        padding: "16px 18px",
        transition: "all .2s",
        boxShadow: hov
          ? `0 8px 32px rgba(0,0,0,0.35), 0 0 0 1px ${col.accent}22`
          : "0 2px 12px rgba(0,0,0,0.2)",
        transform: hov ? "translateY(-3px)" : "translateY(0)",
        cursor: "default",
        minHeight: 120,
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      {/* Top row: icon + color picker + actions */}
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between" }}>
        {/* Icon picker trigger */}
        <button
          onClick={() => setShowPicker(p => !p)}
          title="Change icon/color"
          style={{
            background:"none", border:"none", cursor:"pointer",
            fontSize:20, lineHeight:1, padding:0,
            filter: hov ? "none" : "opacity(0.85)",
            transition:"transform .15s",
            transform: showPicker ? "scale(1.15)" : "scale(1)",
          }}
        >{note.icon}</button>

        {/* Action buttons — show on hover */}
        <div style={{
          display:"flex", gap:4,
          opacity: hov ? 1 : 0, transition:"opacity .15s",
        }}>
          <button onClick={() => onEdit(note)} title="Edit note"
            style={{
              width:26, height:26, borderRadius:7, border:"none", cursor:"pointer",
              background:"rgba(255,255,255,0.07)", color:"rgba(255,255,255,0.55)",
              fontSize:12, display:"flex", alignItems:"center", justifyContent:"center",
              transition:"all .15s",
            }}
            onMouseEnter={e=>{ e.currentTarget.style.background=`rgba(${col.accent==="#00F5FF"?"0,245,255":"255,255,255"},0.14)`; e.currentTarget.style.color=col.accent; }}
            onMouseLeave={e=>{ e.currentTarget.style.background="rgba(255,255,255,0.07)"; e.currentTarget.style.color="rgba(255,255,255,0.55)"; }}>
            ✏️
          </button>
          <button onClick={() => onDelete(note.id)} title="Delete note"
            style={{
              width:26, height:26, borderRadius:7, border:"none", cursor:"pointer",
              background:"rgba(255,255,255,0.07)", color:"rgba(255,255,255,0.55)",
              fontSize:11, display:"flex", alignItems:"center", justifyContent:"center",
              transition:"all .15s",
            }}
            onMouseEnter={e=>{ e.currentTarget.style.background="rgba(251,113,133,0.15)"; e.currentTarget.style.color="#fb7185"; }}
            onMouseLeave={e=>{ e.currentTarget.style.background="rgba(255,255,255,0.07)"; e.currentTarget.style.color="rgba(255,255,255,0.55)"; }}>
            🗑️
          </button>
        </div>
      </div>

      {/* Color + icon picker popover */}
      {showPicker && (
        <div style={{
          position:"absolute", top:52, left:0, zIndex:50,
          background:"rgba(10,16,30,0.98)", border:"1px solid rgba(255,255,255,0.1)",
          borderRadius:16, padding:"12px 14px",
          boxShadow:"0 16px 48px rgba(0,0,0,0.6)",
          backdropFilter:"blur(20px)", minWidth:220,
        }}>
          <p style={{ fontSize:10, fontWeight:700, color:"rgba(255,255,255,0.35)", margin:"0 0 8px", textTransform:"uppercase", letterSpacing:".08em" }}>Color</p>
          <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:12 }}>
            {NOTE_COLORS.map(c => (
              <button key={c.id} onClick={() => { onColorChange(note.id, c.id); setShowPicker(false); }}
                title={c.label}
                style={{
                  width:22, height:22, borderRadius:6, border:`2px solid ${note.color===c.id?c.accent:"transparent"}`,
                  background:c.bg, cursor:"pointer", transition:"all .15s",
                  boxShadow:note.color===c.id?`0 0 8px ${c.accent}55`:"none",
                }}/>
            ))}
          </div>
          <p style={{ fontSize:10, fontWeight:700, color:"rgba(255,255,255,0.35)", margin:"0 0 8px", textTransform:"uppercase", letterSpacing:".08em" }}>Icon</p>
          <div style={{ display:"flex", flexWrap:"wrap", gap:4 }}>
            {NOTE_ICONS.map(ic => (
              <button key={ic} onClick={() => { onIconChange(note.id, ic); setShowPicker(false); }}
                style={{
                  width:28, height:28, borderRadius:7, border:`1px solid ${note.icon===ic?"rgba(255,255,255,0.25)":"transparent"}`,
                  background: note.icon===ic ? "rgba(255,255,255,0.08)" : "none",
                  cursor:"pointer", fontSize:16, display:"flex", alignItems:"center", justifyContent:"center",
                  transition:"all .15s",
                }}>{ic}</button>
            ))}
          </div>
        </div>
      )}

      {/* Title */}
      {note.title && (
        <p style={{
          margin:0, fontSize:14, fontWeight:700, color:"#F0F4FF",
          lineHeight:1.3, letterSpacing:"-0.1px",
        }}>{note.title}</p>
      )}

      {/* Body */}
      {note.body && (
        <p style={{
          margin:0, fontSize:12.5, color:"rgba(255,255,255,0.6)",
          lineHeight:1.6, flex:1,
          whiteSpace:"pre-wrap", wordBreak:"break-word",
        }}>{note.body}</p>
      )}

      {/* Footer: accent bar + timestamp */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginTop:"auto" }}>
        <div style={{ width:28, height:2.5, borderRadius:99, background:col.accent, opacity:0.6 }}/>
        <span style={{ fontSize:10, color:"rgba(255,255,255,0.25)" }}>{fmtDate(note.updatedAt)}</span>
      </div>
    </div>
  );
};

// ── Note editor modal ─────────────────────────────────────────────────────────
const NoteEditor = ({ initial, onSave, onClose }) => {
  const [title, setTitle]     = useState(initial?.title || "");
  const [body,  setBody]      = useState(initial?.body  || "");
  const [color, setColor]     = useState(initial?.color || "cyan");
  const [icon,  setIcon]      = useState(initial?.icon  || "📌");
  const bodyRef = useRef(null);
  const col = getColor(color);

  useEffect(() => { bodyRef.current?.focus(); }, []);

  const save = () => {
    if (!title.trim() && !body.trim()) return;
    onSave({ title:title.trim(), body:body.trim(), color, icon });
  };

  return (
    <div style={{
      position:"fixed", inset:0, zIndex:200,
      background:"rgba(0,0,0,0.65)", backdropFilter:"blur(8px)",
      display:"flex", alignItems:"center", justifyContent:"center",
    }} onClick={e=>{ if(e.target===e.currentTarget) onClose(); }}>
      <div style={{
        width:"100%", maxWidth:480,
        background:"rgba(10,16,30,0.99)",
        border:`1.5px solid ${col.border}`,
        borderRadius:24,
        boxShadow:`0 0 60px ${col.accent}22, 0 32px 80px rgba(0,0,0,0.7)`,
        overflow:"hidden",
        animation:"scaleIn .2s ease both",
      }}>
        {/* Colored top strip */}
        <div style={{ height:3, background:`linear-gradient(90deg,transparent,${col.accent},transparent)` }}/>

        <div style={{ padding:"22px 24px" }}>
          {/* Icon + color row */}
          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:16 }}>
            <div style={{ display:"flex", gap:6, flexWrap:"wrap", flex:1 }}>
              {NOTE_COLORS.map(c=>(
                <button key={c.id} onClick={()=>setColor(c.id)}
                  style={{
                    width:20, height:20, borderRadius:5,
                    border:`2px solid ${color===c.id?c.accent:"transparent"}`,
                    background:c.bg, cursor:"pointer", transition:"all .15s",
                    boxShadow:color===c.id?`0 0 6px ${c.accent}55`:"none",
                  }}/>
              ))}
            </div>
            <div style={{ display:"flex", gap:3, flexWrap:"wrap", maxWidth:140 }}>
              {NOTE_ICONS.slice(0,8).map(ic=>(
                <button key={ic} onClick={()=>setIcon(ic)}
                  style={{
                    width:26,height:26,borderRadius:6,
                    border:`1px solid ${icon===ic?"rgba(255,255,255,0.25)":"transparent"}`,
                    background:icon===ic?"rgba(255,255,255,0.08)":"none",
                    cursor:"pointer",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center",
                  }}>{ic}</button>
              ))}
            </div>
          </div>

          {/* Title input */}
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
            <span style={{ fontSize:22 }}>{icon}</span>
            <input
              value={title} onChange={e=>setTitle(e.target.value)}
              placeholder="Note title…"
              onKeyDown={e=>{ if(e.key==="Enter"){ e.preventDefault(); bodyRef.current?.focus(); } if(e.key==="Escape") onClose(); }}
              style={{
                flex:1, background:"none", border:"none", outline:"none",
                fontSize:17, fontWeight:700, color:"#F0F4FF",
                fontFamily:"'Sora','Poppins',sans-serif",
              }}/>
          </div>

          {/* Body textarea */}
          <textarea
            ref={bodyRef}
            value={body} onChange={e=>setBody(e.target.value)}
            placeholder="Write your note here…"
            rows={5}
            style={{
              width:"100%", boxSizing:"border-box",
              background:"rgba(255,255,255,0.03)",
              border:`1px solid rgba(255,255,255,0.08)`,
              borderRadius:12, padding:"12px 14px",
              color:"rgba(255,255,255,0.75)", fontSize:13.5,
              fontFamily:"'Sora','Poppins',sans-serif", lineHeight:1.7,
              outline:"none", resize:"vertical", transition:"border .2s",
            }}
            onFocus={e=>e.target.style.border=`1px solid ${col.border}`}
            onBlur={e=>e.target.style.border="1px solid rgba(255,255,255,0.08)"}
          />

          {/* Buttons */}
          <div style={{ display:"flex", gap:10, marginTop:16, justifyContent:"flex-end" }}>
            <button onClick={onClose} style={{
              padding:"9px 18px", borderRadius:10, border:"1px solid rgba(255,255,255,0.1)",
              background:"none", color:"rgba(255,255,255,0.4)", cursor:"pointer",
              fontSize:13, fontFamily:"'Sora','Poppins',sans-serif", transition:"all .15s",
            }}
            onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,255,255,0.05)";e.currentTarget.style.color="rgba(255,255,255,0.7)";}}
            onMouseLeave={e=>{e.currentTarget.style.background="none";e.currentTarget.style.color="rgba(255,255,255,0.4)";}}>
              Cancel
            </button>
            <button onClick={save} style={{
              padding:"9px 22px", borderRadius:10, border:"none",
              background:`linear-gradient(135deg,${col.accent}CC,${col.accent}88)`,
              color:"#020d14", cursor:"pointer",
              fontSize:13, fontWeight:700, fontFamily:"'Sora','Poppins',sans-serif",
              boxShadow:`0 0 16px ${col.accent}44`,
              transition:"all .15s",
            }}>
              {initial ? "Save Changes" : "Add Note"} ✓
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// MAIN STICKY NOTES COMPONENT
// ══════════════════════════════════════════════════════════════════════════════
export default function StickyNotes() {
  const [notes,      setNotes]      = useState(() => {
    try { return JSON.parse(localStorage.getItem("jc-stickynotes") || "[]"); }
    catch { return []; }
  });
  const [editing,    setEditing]    = useState(null);  // note or "new"
  const [filter,     setFilter]     = useState("all"); // "all" | colorId
  const [sortBy,     setSortBy]     = useState("updated"); // "updated" | "created" | "color"
  const [searchQ,    setSearchQ]    = useState("");

  // Persist
  useEffect(() => {
    localStorage.setItem("jc-stickynotes", JSON.stringify(notes));
  }, [notes]);

  const save = (data) => {
    if (editing === "new") {
      setNotes(p => [{
        id: uid(), ...data,
        createdAt: Date.now(), updatedAt: Date.now(),
      }, ...p]);
    } else {
      setNotes(p => p.map(n => n.id === editing.id
        ? { ...n, ...data, updatedAt: Date.now() }
        : n
      ));
    }
    setEditing(null);
  };

  const del = (id) => setNotes(p => p.filter(n => n.id !== id));

  const changeColor = (id, color) => setNotes(p => p.map(n => n.id===id ? { ...n, color, updatedAt:Date.now() } : n));
  const changeIcon  = (id, icon)  => setNotes(p => p.map(n => n.id===id ? { ...n, icon,  updatedAt:Date.now() } : n));

  const visible = notes
    .filter(n => filter === "all" || n.color === filter)
    .filter(n => !searchQ || n.title.toLowerCase().includes(searchQ.toLowerCase()) || n.body.toLowerCase().includes(searchQ.toLowerCase()))
    .sort((a,b) => sortBy === "color" ? a.color.localeCompare(b.color) : b[sortBy==="created"?"createdAt":"updatedAt"] - a[sortBy==="created"?"createdAt":"updatedAt"]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&display=swap');
        @keyframes scaleIn { from{opacity:0;transform:scale(0.93)} to{opacity:1;transform:scale(1)} }
        @keyframes fadeSlide { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        .sn-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(240px,1fr)); gap:14px; }
        .sn-scroll::-webkit-scrollbar{width:4px}
        .sn-scroll::-webkit-scrollbar-thumb{background:rgba(0,245,255,0.15);border-radius:4px}
        .sn-scroll::-webkit-scrollbar-track{background:transparent}
      `}</style>

      <div style={{
        height:"100%", display:"flex", flexDirection:"column",
        background:"rgba(7,11,20,0.97)", borderRadius:14, overflow:"hidden",
        fontFamily:"'Sora','Poppins',sans-serif",
      }}>
        {/* ── Header ────────────────────────────────────────────────── */}
        <div style={{
          padding:"16px 20px 12px", flexShrink:0,
          background:"rgba(10,14,26,0.99)",
          borderBottom:"1px solid rgba(255,255,255,0.06)",
        }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
            <div>
              <h2 style={{ margin:0, fontSize:18, fontWeight:800, color:"#F0F4FF", letterSpacing:"-0.3px" }}>
                📌 Sticky Notes
              </h2>
              <p style={{ margin:"2px 0 0", fontSize:12, color:"rgba(255,255,255,0.35)" }}>
                {notes.length} note{notes.length!==1?"s":""} · personal &amp; private
              </p>
            </div>
            <button onClick={() => setEditing("new")} style={{
              display:"flex", alignItems:"center", gap:7,
              padding:"9px 16px", borderRadius:11, border:"none",
              background:"linear-gradient(135deg,#00C4D0,#0055BB)",
              color:"#fff", cursor:"pointer", fontSize:13, fontWeight:700,
              fontFamily:"inherit",
              boxShadow:"0 4px 18px rgba(0,180,220,0.35)",
              transition:"all .18s",
            }}
            onMouseEnter={e=>{ e.currentTarget.style.transform="translateY(-1px)"; e.currentTarget.style.boxShadow="0 6px 24px rgba(0,180,220,0.5)"; }}
            onMouseLeave={e=>{ e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow="0 4px 18px rgba(0,180,220,0.35)"; }}>
              + New Note
            </button>
          </div>

          {/* Search + sort row */}
          <div style={{ display:"flex", gap:8, alignItems:"center" }}>
            <div style={{ position:"relative", flex:1 }}>
              <span style={{ position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",fontSize:12,color:"rgba(255,255,255,0.28)",pointerEvents:"none" }}>🔍</span>
              <input
                value={searchQ} onChange={e=>setSearchQ(e.target.value)}
                placeholder="Search notes…"
                style={{
                  width:"100%",boxSizing:"border-box",
                  paddingLeft:30,paddingRight:10,paddingTop:7,paddingBottom:7,
                  borderRadius:9, background:"rgba(255,255,255,0.05)",
                  border:"1px solid rgba(255,255,255,0.08)",
                  color:"#E8EAF0", fontSize:12.5, fontFamily:"inherit",
                  outline:"none",
                }}
                onFocus={e=>e.target.style.border="1px solid rgba(0,245,255,0.3)"}
                onBlur={e=>e.target.style.border="1px solid rgba(255,255,255,0.08)"}/>
            </div>
            <select value={sortBy} onChange={e=>setSortBy(e.target.value)}
              style={{
                padding:"7px 10px", borderRadius:9,
                background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.08)",
                color:"rgba(255,255,255,0.6)", fontSize:12, cursor:"pointer",
                fontFamily:"inherit", outline:"none",
              }}>
              <option value="updated">Recently edited</option>
              <option value="created">Date created</option>
              <option value="color">By color</option>
            </select>
          </div>

          {/* Color filter pills */}
          <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginTop:10 }}>
            <button onClick={()=>setFilter("all")} style={{
              padding:"4px 12px", borderRadius:99, border:"none", cursor:"pointer",
              background: filter==="all" ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.05)",
              color: filter==="all" ? "#F0F4FF" : "rgba(255,255,255,0.4)",
              fontSize:11.5, fontWeight:600, fontFamily:"inherit", transition:"all .15s",
            }}>All</button>
            {NOTE_COLORS.map(c=>(
              <button key={c.id} onClick={()=>setFilter(f=>f===c.id?"all":c.id)} style={{
                padding:"4px 12px", borderRadius:99, border:`1px solid ${filter===c.id?c.accent:c.border}`,
                cursor:"pointer", background: filter===c.id ? c.bg : "transparent",
                color: filter===c.id ? c.accent : "rgba(255,255,255,0.4)",
                fontSize:11.5, fontWeight:600, fontFamily:"inherit", transition:"all .15s",
              }}>{c.label}</button>
            ))}
          </div>
        </div>

        {/* ── Notes grid ─────────────────────────────────────────────── */}
        <div className="sn-scroll" style={{ flex:1, overflowY:"auto", padding:"16px 18px" }}>
          {visible.length === 0 ? (
            <div style={{ textAlign:"center", paddingTop:"3rem", animation:"fadeSlide .4s ease both" }}>
              <div style={{ fontSize:48, marginBottom:14 }}>📝</div>
              <p style={{ fontSize:15, fontWeight:700, color:"#F0F4FF", margin:"0 0 6px" }}>
                {notes.length === 0 ? "No notes yet" : "No notes match"}
              </p>
              <p style={{ fontSize:13, color:"rgba(255,255,255,0.35)", margin:"0 0 20px" }}>
                {notes.length === 0
                  ? "Create your first sticky note to get started"
                  : "Try a different search or color filter"}
              </p>
              {notes.length === 0 && (
                <button onClick={()=>setEditing("new")} style={{
                  padding:"10px 22px", borderRadius:11, border:"none",
                  background:"linear-gradient(135deg,#00C4D0,#0055BB)",
                  color:"#fff", cursor:"pointer", fontSize:13, fontWeight:700,
                  fontFamily:"inherit", boxShadow:"0 4px 18px rgba(0,180,220,0.35)",
                }}>+ Create Note</button>
              )}
            </div>
          ) : (
            <div className="sn-grid">
              {visible.map((note, i) => (
                <div key={note.id} style={{ animation:`fadeSlide .3s ease ${i*0.04}s both` }}>
                  <NoteCard
                    note={note}
                    onEdit={setEditing}
                    onDelete={del}
                    onColorChange={changeColor}
                    onIconChange={changeIcon}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Stats bar ──────────────────────────────────────────────── */}
        <div style={{
          padding:"8px 20px", flexShrink:0,
          borderTop:"1px solid rgba(255,255,255,0.05)",
          display:"flex", alignItems:"center", gap:12,
        }}>
          {NOTE_COLORS.map(c => {
            const count = notes.filter(n=>n.color===c.id).length;
            if (!count) return null;
            return (
              <div key={c.id} style={{ display:"flex", alignItems:"center", gap:4 }}>
                <div style={{ width:8,height:8,borderRadius:"50%",background:c.accent }}/>
                <span style={{ fontSize:10.5,color:"rgba(255,255,255,0.3)" }}>{count}</span>
              </div>
            );
          })}
          <span style={{ marginLeft:"auto", fontSize:10, color:"rgba(255,255,255,0.2)" }}>
            Saved locally · private to you
          </span>
        </div>
      </div>

      {/* ── Editor modal ────────────────────────────────────────────── */}
      {editing && (
        <NoteEditor
          initial={editing === "new" ? null : editing}
          onSave={save}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  );
}