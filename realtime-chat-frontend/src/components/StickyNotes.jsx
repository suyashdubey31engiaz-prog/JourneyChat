import React, { useState, useEffect, useRef, useCallback } from "react";

const COLORS = [
  { id:"cyan",   bg:"rgba(0,245,255,0.07)",   border:"rgba(0,245,255,0.22)",   accent:"#00F5FF", glow:"rgba(0,245,255,0.25)",   label:"Cyan"   },
  { id:"yellow", bg:"rgba(255,230,0,0.07)",   border:"rgba(255,230,0,0.22)",   accent:"#FFE600", glow:"rgba(255,230,0,0.25)",   label:"Yellow" },
  { id:"purple", bg:"rgba(139,92,246,0.09)",  border:"rgba(139,92,246,0.26)",  accent:"#a78bfa", glow:"rgba(139,92,246,0.25)",  label:"Purple" },
  { id:"green",  bg:"rgba(34,197,94,0.07)",   border:"rgba(34,197,94,0.22)",   accent:"#4ade80", glow:"rgba(34,197,94,0.25)",   label:"Green"  },
  { id:"coral",  bg:"rgba(251,113,133,0.08)", border:"rgba(251,113,133,0.25)", accent:"#fb7185", glow:"rgba(251,113,133,0.25)", label:"Coral"  },
  { id:"blue",   bg:"rgba(59,130,246,0.08)",  border:"rgba(59,130,246,0.25)",  accent:"#60a5fa", glow:"rgba(59,130,246,0.25)",  label:"Blue"   },
  { id:"orange", bg:"rgba(249,115,22,0.08)",  border:"rgba(249,115,22,0.22)",  accent:"#fb923c", glow:"rgba(249,115,22,0.25)",  label:"Orange" },
  { id:"teal",   bg:"rgba(20,184,166,0.08)",  border:"rgba(20,184,166,0.25)",  accent:"#2dd4bf", glow:"rgba(20,184,166,0.25)",  label:"Teal"   },
];

const ICONS = ["📌","💡","🎯","✅","⭐","🔥","🧠","💬","📝","🚀","❤️","🎨","📚","🔑","🎵","💎","🌟","⚡","🎭","🏆"];
const uid   = () => Math.random().toString(36).slice(2,10);
const getC  = (id) => COLORS.find(c=>c.id===id)||COLORS[0];
const fmt   = (ts) => { const d=new Date(ts),n=new Date(); return d.toDateString()===n.toDateString()?d.toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"}):d.toLocaleDateString("en-IN",{day:"numeric",month:"short"}); };

// ── Sparkle cursor effect ──────────────────────────────────────────────────────
function useCursorSparkles(containerRef) {
  const sparkRef = useRef([]);
  const rafRef   = useRef(null);

  const spawnSparkle = useCallback((x, y) => {
    const el = document.createElement("div");
    const sz = Math.random()*6+3;
    const colors = ["#00F5FF","#FFE600","#a78bfa","#4ade80","#fb7185","#fb923c"];
    const col = colors[Math.floor(Math.random()*colors.length)];
    const vx = (Math.random()-0.5)*3;
    const vy = -(Math.random()*3+1);
    el.style.cssText = `position:fixed;left:${x}px;top:${y}px;width:${sz}px;height:${sz}px;border-radius:50%;background:${col};pointer-events:none;z-index:9999;box-shadow:0 0 ${sz*2}px ${col};transform:translate(-50%,-50%);transition:none;`;
    document.body.appendChild(el);
    let life = 0;
    const step = () => {
      life++;
      const alpha = Math.max(0, 1 - life/28);
      el.style.transform = `translate(calc(-50% + ${vx*life}px), calc(-50% + ${vy*life + 0.08*life*life}px)) scale(${alpha})`;
      el.style.opacity = alpha;
      if (life < 28) requestAnimationFrame(step);
      else el.remove();
    };
    requestAnimationFrame(step);
  }, []);

  const onMove = useCallback((e) => {
    if (Math.random() > 0.25) return; // throttle
    spawnSparkle(e.clientX, e.clientY);
  }, [spawnSparkle]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener("mousemove", onMove);
    return () => el.removeEventListener("mousemove", onMove);
  }, [containerRef, onMove]);
}

// ── Single card ────────────────────────────────────────────────────────────────
const NoteCard = ({ note, onEdit, onDelete, onColor, onIcon }) => {
  const [hov, setHov]     = useState(false);
  const [pick, setPick]   = useState(false);
  const col = getC(note.color);

  return (
    <div
      onMouseEnter={()=>setHov(true)}
      onMouseLeave={()=>{ setHov(false); setPick(false); }}
      style={{
        position:"relative", borderRadius:18,
        background:col.bg,
        border:`1.5px solid ${hov?col.accent:col.border}`,
        padding:"15px 17px",
        transition:"transform .22s cubic-bezier(.34,1.56,.64,1), box-shadow .22s ease, border-color .22s",
        transform: hov ? "translateY(-6px) scale(1.025)" : "translateY(0) scale(1)",
        boxShadow: hov ? `0 16px 40px rgba(0,0,0,0.4), 0 0 0 1px ${col.accent}22, 0 0 28px ${col.glow}` : "0 2px 12px rgba(0,0,0,0.22)",
        minHeight:110, display:"flex", flexDirection:"column", gap:7, cursor:"default",
        willChange:"transform",
      }}>

      {/* Top row */}
      <div style={{ display:"flex",alignItems:"flex-start",justifyContent:"space-between" }}>
        <button onClick={()=>setPick(p=>!p)} style={{ background:"none",border:"none",cursor:"pointer",fontSize:21,lineHeight:1,padding:0,transition:"transform .15s",transform:pick?"scale(1.2)":"scale(1)" }}
          title="Change icon / color">{note.icon}</button>
        <div style={{ display:"flex",gap:4,opacity:hov?1:0,transition:"opacity .15s" }}>
          <button onClick={()=>onEdit(note)} title="Edit"
            style={{ width:26,height:26,borderRadius:7,border:"none",cursor:"pointer",background:"rgba(255,255,255,0.08)",color:"rgba(255,255,255,0.5)",fontSize:12,display:"flex",alignItems:"center",justifyContent:"center",transition:"all .15s" }}
            onMouseEnter={e=>{e.currentTarget.style.background=`${col.accent}22`;e.currentTarget.style.color=col.accent;}}
            onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.08)";e.currentTarget.style.color="rgba(255,255,255,0.5)";}}>✏️</button>
          <button onClick={()=>onDelete(note.id)} title="Delete"
            style={{ width:26,height:26,borderRadius:7,border:"none",cursor:"pointer",background:"rgba(255,255,255,0.08)",color:"rgba(255,255,255,0.5)",fontSize:11,display:"flex",alignItems:"center",justifyContent:"center",transition:"all .15s" }}
            onMouseEnter={e=>{e.currentTarget.style.background="rgba(251,113,133,0.15)";e.currentTarget.style.color="#fb7185";}}
            onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.08)";e.currentTarget.style.color="rgba(255,255,255,0.5)";}}>🗑️</button>
        </div>
      </div>

      {/* Picker popover */}
      {pick && (
        <div style={{ position:"absolute",top:52,left:0,zIndex:50,background:"rgba(10,16,30,0.98)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:16,padding:"11px 13px",boxShadow:"0 16px 48px rgba(0,0,0,0.65)",backdropFilter:"blur(20px)",minWidth:215 }}>
          <p style={{ fontSize:9.5,fontWeight:700,color:"rgba(255,255,255,0.32)",margin:"0 0 7px",textTransform:"uppercase",letterSpacing:".08em" }}>Color</p>
          <div style={{ display:"flex",flexWrap:"wrap",gap:5,marginBottom:11 }}>
            {COLORS.map(c=>(
              <button key={c.id} onClick={()=>{onColor(note.id,c.id);}} title={c.label} style={{ width:20,height:20,borderRadius:5,border:`2px solid ${note.color===c.id?c.accent:"transparent"}`,background:c.bg,cursor:"pointer",transition:"all .14s",boxShadow:note.color===c.id?`0 0 7px ${c.accent}55`:"none" }}/>
            ))}
          </div>
          <p style={{ fontSize:9.5,fontWeight:700,color:"rgba(255,255,255,0.32)",margin:"0 0 7px",textTransform:"uppercase",letterSpacing:".08em" }}>Icon</p>
          <div style={{ display:"flex",flexWrap:"wrap",gap:3 }}>
            {ICONS.map(ic=>(
              <button key={ic} onClick={()=>{onIcon(note.id,ic);setPick(false);}} style={{ width:28,height:28,borderRadius:7,border:`1px solid ${note.icon===ic?"rgba(255,255,255,0.25)":"transparent"}`,background:note.icon===ic?"rgba(255,255,255,0.09)":"none",cursor:"pointer",fontSize:15,display:"flex",alignItems:"center",justifyContent:"center",transition:"all .14s" }}>{ic}</button>
            ))}
          </div>
        </div>
      )}

      {note.title && <p style={{ margin:0,fontSize:13.5,fontWeight:700,color:"#F0F4FF",lineHeight:1.3,letterSpacing:"-0.1px" }}>{note.title}</p>}
      {note.body  && <p style={{ margin:0,fontSize:12,color:"rgba(255,255,255,0.58)",lineHeight:1.65,flex:1,whiteSpace:"pre-wrap",wordBreak:"break-word" }}>{note.body}</p>}

      {/* Footer bar */}
      <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:"auto",paddingTop:4 }}>
        <div style={{ width:hov?40:24,height:2.5,borderRadius:99,background:`linear-gradient(90deg,${col.accent},transparent)`,opacity:0.7,transition:"width .25s ease" }}/>
        <span style={{ fontSize:9.5,color:"rgba(255,255,255,0.22)" }}>{fmt(note.updatedAt)}</span>
      </div>
    </div>
  );
};

// ── Note editor ────────────────────────────────────────────────────────────────
const Editor = ({ initial, onSave, onClose }) => {
  const [title,setTitle]=useState(initial?.title||"");
  const [body, setBody] =useState(initial?.body||"");
  const [color,setColor]=useState(initial?.color||"cyan");
  const [icon, setIcon] =useState(initial?.icon||"📌");
  const ta = useRef(null);
  const col = getC(color);
  useEffect(()=>{ ta.current?.focus(); },[]);

  return (
    <div style={{ position:"fixed",inset:0,zIndex:200,background:"rgba(0,0,0,0.65)",backdropFilter:"blur(8px)",display:"flex",alignItems:"center",justifyContent:"center",padding:"1rem" }}
      onClick={e=>{ if(e.target===e.currentTarget) onClose(); }}>
      <div style={{ width:"100%",maxWidth:460,background:"rgba(10,16,30,0.99)",border:`1.5px solid ${col.border}`,borderRadius:22,boxShadow:`0 0 60px ${col.accent}20,0 32px 80px rgba(0,0,0,0.7)`,overflow:"hidden",animation:"edIn .22s ease both" }}>
        <div style={{ height:3,background:`linear-gradient(90deg,transparent,${col.accent},transparent)` }}/>
        <div style={{ padding:"20px 22px" }}>
          {/* Color + icon row */}
          <div style={{ display:"flex",alignItems:"center",gap:11,marginBottom:14 }}>
            <div style={{ display:"flex",gap:5,flexWrap:"wrap",flex:1 }}>
              {COLORS.map(c=>(
                <button key={c.id} onClick={()=>setColor(c.id)} style={{ width:19,height:19,borderRadius:5,border:`2px solid ${color===c.id?c.accent:"transparent"}`,background:c.bg,cursor:"pointer",transition:"all .14s",boxShadow:color===c.id?`0 0 6px ${c.accent}55`:"none" }}/>
              ))}
            </div>
            <div style={{ display:"flex",gap:3,flexWrap:"wrap",maxWidth:150 }}>
              {ICONS.slice(0,10).map(ic=>(
                <button key={ic} onClick={()=>setIcon(ic)} style={{ width:26,height:26,borderRadius:6,border:`1px solid ${icon===ic?"rgba(255,255,255,0.25)":"transparent"}`,background:icon===ic?"rgba(255,255,255,0.09)":"none",cursor:"pointer",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center" }}>{ic}</button>
              ))}
            </div>
          </div>
          {/* Title */}
          <div style={{ display:"flex",alignItems:"center",gap:9,marginBottom:10 }}>
            <span style={{ fontSize:22 }}>{icon}</span>
            <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Note title…"
              onKeyDown={e=>{ if(e.key==="Enter"){e.preventDefault();ta.current?.focus();} if(e.key==="Escape")onClose(); }}
              style={{ flex:1,background:"none",border:"none",outline:"none",fontSize:16,fontWeight:700,color:"#F0F4FF",fontFamily:"inherit" }}/>
          </div>
          {/* Body */}
          <textarea ref={ta} value={body} onChange={e=>setBody(e.target.value)} placeholder="Write your note here…" rows={5}
            style={{ width:"100%",boxSizing:"border-box",background:"rgba(255,255,255,0.03)",border:`1px solid rgba(255,255,255,0.08)`,borderRadius:11,padding:"11px 13px",color:"rgba(255,255,255,0.72)",fontSize:13,fontFamily:"inherit",lineHeight:1.7,outline:"none",resize:"vertical",transition:"border .2s" }}
            onFocus={e=>e.target.style.border=`1px solid ${col.border}`}
            onBlur={e=>e.target.style.border="1px solid rgba(255,255,255,0.08)"}/>
          {/* Buttons */}
          <div style={{ display:"flex",gap:9,marginTop:14,justifyContent:"flex-end" }}>
            <button onClick={onClose} style={{ padding:"9px 17px",borderRadius:9,border:"1px solid rgba(255,255,255,0.1)",background:"none",color:"rgba(255,255,255,0.38)",cursor:"pointer",fontSize:13,fontFamily:"inherit",transition:"all .15s" }}
              onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,255,255,0.06)";e.currentTarget.style.color="rgba(255,255,255,0.65)";}}
              onMouseLeave={e=>{e.currentTarget.style.background="none";e.currentTarget.style.color="rgba(255,255,255,0.38)";}}>Cancel</button>
            <button onClick={()=>{ if(!title.trim()&&!body.trim())return; onSave({title:title.trim(),body:body.trim(),color,icon}); }}
              style={{ padding:"9px 20px",borderRadius:9,border:"none",background:`linear-gradient(135deg,${col.accent}CC,${col.accent}88)`,color:"#020d14",cursor:"pointer",fontSize:13,fontWeight:700,fontFamily:"inherit",boxShadow:`0 0 14px ${col.accent}44`,transition:"all .15s" }}>
              {initial?"Save Changes":"Add Note"} ✓
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
export default function StickyNotes() {
  const [notes,setNotes]=useState(()=>{ try{return JSON.parse(localStorage.getItem("jc-sn")||"[]");}catch{return[];} });
  const [edit, setEdit] =useState(null);
  const [filter,setFilter]=useState("all");
  const [sort,  setSort]  =useState("updated");
  const [q,     setQ]     =useState("");
  const [vis,   setVis]   =useState(false);
  const cRef = useRef(null);

  useCursorSparkles(cRef);

  useEffect(()=>{ localStorage.setItem("jc-sn",JSON.stringify(notes)); },[notes]);
  useEffect(()=>{ setTimeout(()=>setVis(true),30); },[]);

  const save = (data) => {
    if (edit==="new") setNotes(p=>[{id:uid(),...data,createdAt:Date.now(),updatedAt:Date.now()},...p]);
    else setNotes(p=>p.map(n=>n.id===edit.id?{...n,...data,updatedAt:Date.now()}:n));
    setEdit(null);
  };

  const del   = (id)       => setNotes(p=>p.filter(n=>n.id!==id));
  const clr   = (id,color) => setNotes(p=>p.map(n=>n.id===id?{...n,color,updatedAt:Date.now()}:n));
  const icn   = (id,icon)  => setNotes(p=>p.map(n=>n.id===id?{...n,icon, updatedAt:Date.now()}:n));

  const visible = notes
    .filter(n=>filter==="all"||n.color===filter)
    .filter(n=>!q||(n.title+n.body).toLowerCase().includes(q.toLowerCase()))
    .sort((a,b)=>sort==="color"?a.color.localeCompare(b.color):b[sort==="created"?"createdAt":"updatedAt"]-a[sort==="created"?"createdAt":"updatedAt"]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&display=swap');
        @keyframes snIn    { from{opacity:0;transform:scale(0.94) translateY(10px)} to{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes edIn    { from{opacity:0;transform:scale(0.93)} to{opacity:1;transform:scale(1)} }
        @keyframes cardIn  { from{opacity:0;transform:translateY(14px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes float   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        .sn-sc::-webkit-scrollbar{width:3px}.sn-sc::-webkit-scrollbar-thumb{background:rgba(0,245,255,0.15);border-radius:3px}.sn-sc::-webkit-scrollbar-track{background:transparent}
        /* ── Responsive grid ── */
        .sn-grid{display:grid;gap:13px;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));}
        @media(max-width:640px){
          .sn-grid{grid-template-columns:1fr 1fr;}
          .sn-head{flex-direction:column;gap:10px;}
          .sn-head h2{font-size:16px;}
          .sn-filters{flex-wrap:wrap;}
        }
        @media(max-width:420px){
          .sn-grid{grid-template-columns:1fr;}
        }
      `}</style>

      <div ref={cRef} style={{
        height:"100%",display:"flex",flexDirection:"column",
        background:"rgba(7,11,20,0.97)",borderRadius:14,overflow:"hidden",
        fontFamily:"'Sora','Poppins',sans-serif",
        opacity:vis?1:0,transform:vis?"scale(1)":"scale(0.97)",
        transition:"opacity .35s ease,transform .35s cubic-bezier(.34,1.26,.64,1)",
      }}>

        {/* ── Header ── */}
        <div style={{ padding:"15px 18px 11px",flexShrink:0,background:"rgba(10,14,26,0.99)",borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
          <div className="sn-head" style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:11 }}>
            <div>
              <h2 style={{ margin:0,fontSize:17,fontWeight:800,color:"#F0F4FF",letterSpacing:"-0.2px",display:"flex",alignItems:"center",gap:8 }}>
                <span style={{ animation:"float 3s ease-in-out infinite",display:"inline-block" }}>📌</span> Sticky Notes
              </h2>
              <p style={{ margin:"2px 0 0",fontSize:11.5,color:"rgba(255,255,255,0.32)" }}>{notes.length} note{notes.length!==1?"s":""} · stored locally</p>
            </div>
            <button onClick={()=>setEdit("new")} style={{
              display:"flex",alignItems:"center",gap:7,padding:"9px 15px",borderRadius:11,border:"none",
              background:"linear-gradient(135deg,#00C4D0,#0055BB)",color:"#fff",cursor:"pointer",
              fontSize:13,fontWeight:700,fontFamily:"inherit",boxShadow:"0 4px 18px rgba(0,180,220,0.32)",
              transition:"all .18s",flexShrink:0,
            }}
            onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="0 6px 24px rgba(0,180,220,0.48)";}}
            onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="0 4px 18px rgba(0,180,220,0.32)";}}>
              + New Note
            </button>
          </div>

          {/* Search + sort */}
          <div style={{ display:"flex",gap:8,marginBottom:10 }}>
            <div style={{ position:"relative",flex:1 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.28)" strokeWidth="2" style={{ position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",pointerEvents:"none" }}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search notes…"
                style={{ width:"100%",boxSizing:"border-box",paddingLeft:30,paddingRight:10,paddingTop:7,paddingBottom:7,borderRadius:9,background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)",color:"#E8EAF0",fontSize:12.5,fontFamily:"inherit",outline:"none" }}
                onFocus={e=>e.target.style.border="1px solid rgba(0,245,255,0.3)"} onBlur={e=>e.target.style.border="1px solid rgba(255,255,255,0.08)"}/>
            </div>
            <select value={sort} onChange={e=>setSort(e.target.value)} style={{ padding:"7px 9px",borderRadius:9,background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)",color:"rgba(255,255,255,0.55)",fontSize:11.5,cursor:"pointer",fontFamily:"inherit",outline:"none" }}>
              <option value="updated">Recently edited</option>
              <option value="created">Date created</option>
              <option value="color">By color</option>
            </select>
          </div>

          {/* Color filters */}
          <div className="sn-filters" style={{ display:"flex",gap:5,flexWrap:"wrap" }}>
            <button onClick={()=>setFilter("all")} style={{ padding:"4px 11px",borderRadius:99,border:"none",cursor:"pointer",background:filter==="all"?"rgba(255,255,255,0.13)":"rgba(255,255,255,0.05)",color:filter==="all"?"#F0F4FF":"rgba(255,255,255,0.38)",fontSize:11,fontWeight:600,fontFamily:"inherit",transition:"all .15s" }}>All</button>
            {COLORS.map(c=>(
              <button key={c.id} onClick={()=>setFilter(f=>f===c.id?"all":c.id)} style={{ padding:"4px 11px",borderRadius:99,border:`1px solid ${filter===c.id?c.accent:c.border}`,cursor:"pointer",background:filter===c.id?c.bg:"transparent",color:filter===c.id?c.accent:"rgba(255,255,255,0.38)",fontSize:11,fontWeight:600,fontFamily:"inherit",transition:"all .15s" }}>{c.label}</button>
            ))}
          </div>
        </div>

        {/* ── Grid ── */}
        <div className="sn-sc" style={{ flex:1,overflowY:"auto",padding:"15px 16px" }}>
          {visible.length===0 ? (
            <div style={{ textAlign:"center",paddingTop:"3rem",animation:"snIn .4s ease both" }}>
              <div style={{ fontSize:44,marginBottom:12,animation:"float 3s ease-in-out infinite" }}>📝</div>
              <p style={{ fontSize:14,fontWeight:700,color:"#F0F4FF",margin:"0 0 5px" }}>{notes.length===0?"No notes yet":"No notes match"}</p>
              <p style={{ fontSize:12.5,color:"rgba(255,255,255,0.32)",margin:"0 0 18px" }}>{notes.length===0?"Create your first sticky note":"Try a different filter"}</p>
              {notes.length===0&&<button onClick={()=>setEdit("new")} style={{ padding:"10px 22px",borderRadius:11,border:"none",background:"linear-gradient(135deg,#00C4D0,#0055BB)",color:"#fff",cursor:"pointer",fontSize:13,fontWeight:700,fontFamily:"inherit",boxShadow:"0 4px 18px rgba(0,180,220,0.32)" }}>+ Create Note</button>}
            </div>
          ) : (
            <div className="sn-grid">
              {visible.map((note,i)=>(
                <div key={note.id} style={{ animation:`cardIn .3s ease ${i*0.04}s both` }}>
                  <NoteCard note={note} onEdit={setEdit} onDelete={del} onColor={clr} onIcon={icn}/>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Stats bar ── */}
        <div style={{ padding:"7px 18px",flexShrink:0,borderTop:"1px solid rgba(255,255,255,0.05)",display:"flex",alignItems:"center",gap:10,flexWrap:"wrap" }}>
          {COLORS.map(c=>{ const cnt=notes.filter(n=>n.color===c.id).length; if(!cnt)return null; return (
            <div key={c.id} style={{ display:"flex",alignItems:"center",gap:4 }}>
              <div style={{ width:7,height:7,borderRadius:"50%",background:c.accent,boxShadow:`0 0 4px ${c.accent}` }}/>
              <span style={{ fontSize:10,color:"rgba(255,255,255,0.28)" }}>{cnt}</span>
            </div>
          );})}
          <span style={{ marginLeft:"auto",fontSize:10,color:"rgba(255,255,255,0.18)" }}>Saved to browser · private to you</span>
        </div>
      </div>

      {edit&&<Editor initial={edit==="new"?null:edit} onSave={save} onClose={()=>setEdit(null)}/>}
    </>
  );
}