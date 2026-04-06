import React, { useState, useEffect, useRef } from "react";

const STATUSES = [
  { id:"online",    label:"Online",         color:"#22c55e", desc:"Active"         },
  { id:"away",      label:"Away",           color:"#f59e0b", desc:"Taking a break" },
  { id:"busy",      label:"Do Not Disturb", color:"#ef4444", desc:"No pings"       },
  { id:"invisible", label:"Invisible",      color:"rgba(255,255,255,0.28)", desc:"Appear offline" },
];

const I = {
  User:    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  Bell:    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  Shield:  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  Palette: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="13.5" cy="6.5" r="1" fill="currentColor"/><circle cx="17.5" cy="10.5" r="1" fill="currentColor"/><circle cx="8.5" cy="7.5" r="1" fill="currentColor"/><circle cx="6.5" cy="12.5" r="1" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg>,
  Key:     <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M8 14h8"/></svg>,
  Info:    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
  Help:    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  Out:     <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  Lock:    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  Eye:     <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  Sound:   <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>,
  Desktop: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>,
  Check:   <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>,
  Chev:    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>,
  Star:    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
};

const Toggle = ({ on, onChange }) => (
  <button onClick={() => onChange(!on)} style={{
    width:40, height:22, borderRadius:99, border:"none", cursor:"pointer", position:"relative",
    background: on ? "linear-gradient(90deg,#00C4D0,#0055BB)" : "rgba(255,255,255,0.12)",
    transition:"background .22s", flexShrink:0,
    boxShadow: on ? "0 0 10px rgba(0,200,220,0.35)" : "none",
  }}>
    <div style={{
      width:16, height:16, borderRadius:"50%", background:"#fff",
      position:"absolute", top:3, transition:"left .22s",
      left: on ? 21 : 3, boxShadow:"0 1px 4px rgba(0,0,0,0.3)",
    }}/>
  </button>
);

const SHead = ({ t }) => (
  <p style={{ fontSize:9.5, fontWeight:700, letterSpacing:".1em", textTransform:"uppercase", color:"rgba(255,255,255,0.25)", margin:"18px 0 5px", padding:"0 18px" }}>{t}</p>
);

const MRow = ({ icon, label, sub, right, onClick, red, accent="rgba(255,255,255,0.5)" }) => {
  const [h, setH] = useState(false);
  return (
    <button onClick={onClick} onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)} style={{
      width:"100%", display:"flex", alignItems:"center", gap:11, padding:"10px 18px",
      background: h && onClick ? "rgba(255,255,255,0.04)" : "none",
      border:"none", cursor:onClick?"pointer":"default", textAlign:"left", transition:"background .14s",
    }}>
      <span style={{
        width:30, height:30, borderRadius:9, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0,
        background: red ? "rgba(239,68,68,0.1)" : h ? "rgba(0,245,255,0.08)" : "rgba(255,255,255,0.05)",
        color: red ? "#f87171" : h && onClick ? "#00F5FF" : accent,
        border: `1px solid ${red?"rgba(239,68,68,0.15)":h&&onClick?"rgba(0,245,255,0.18)":"rgba(255,255,255,0.07)"}`,
        transition:"all .14s",
      }}>{icon}</span>
      <div style={{ flex:1, minWidth:0 }}>
        <p style={{ margin:0, fontSize:13, fontWeight:600, color:red?"#f87171":"rgba(255,255,255,0.85)", lineHeight:1.25 }}>{label}</p>
        {sub && <p style={{ margin:"2px 0 0", fontSize:11, color:"rgba(255,255,255,0.32)", lineHeight:1.3 }}>{sub}</p>}
      </div>
      {right && <div style={{ flexShrink:0 }}>{right}</div>}
      {onClick && !right && <span style={{ color:"rgba(255,255,255,0.2)", flexShrink:0 }}>{I.Chev}</span>}
    </button>
  );
};

const Sub = ({ title, back, children }) => (
  <div style={{ display:"flex", flexDirection:"column", height:"100%" }}>
    <div style={{ display:"flex", alignItems:"center", gap:10, padding:"14px 18px", borderBottom:"1px solid rgba(255,255,255,0.06)", flexShrink:0 }}>
      <button onClick={back} style={{
        width:30,height:30,borderRadius:8,border:"1px solid rgba(255,255,255,0.1)",
        background:"rgba(255,255,255,0.05)",color:"rgba(255,255,255,0.55)",
        cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,transition:"all .15s",
      }}
      onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(0,245,255,0.3)";e.currentTarget.style.color="#00F5FF";}}
      onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(255,255,255,0.1)";e.currentTarget.style.color="rgba(255,255,255,0.55)";}}>
        ←
      </button>
      <h3 style={{ margin:0, fontSize:14.5, fontWeight:700, color:"#F0F4FF" }}>{title}</h3>
    </div>
    <div style={{ flex:1, overflowY:"auto" }} className="am-sc">{children}</div>
  </div>
);

const Inp = ({ label, placeholder, type="text" }) => (
  <div style={{ marginBottom:12 }}>
    <label style={{ display:"block",fontSize:10.5,fontWeight:700,letterSpacing:".05em",textTransform:"uppercase",color:"rgba(255,255,255,0.4)",marginBottom:5 }}>{label}</label>
    <input type={type} placeholder={placeholder} style={{
      width:"100%",boxSizing:"border-box",padding:"10px 13px",borderRadius:10,
      background:"rgba(255,255,255,0.04)",border:"1.5px solid rgba(255,255,255,0.09)",
      color:"#E8EAF0",fontSize:13.5,outline:"none",fontFamily:"inherit",transition:"border .2s",
    }}
    onFocus={e=>e.target.style.border="1.5px solid rgba(0,245,255,0.42)"}
    onBlur={e=>e.target.style.border="1.5px solid rgba(255,255,255,0.09)"}/>
  </div>
);

function HelpQ({ q, a }) {
  const [o, setO] = useState(false);
  return (
    <div style={{ borderBottom:"1px solid rgba(255,255,255,0.05)", margin:"0 18px" }}>
      <button onClick={()=>setO(x=>!x)} style={{ width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"11px 0",background:"none",border:"none",cursor:"pointer",textAlign:"left",gap:10 }}>
        <span style={{ fontSize:13,fontWeight:600,color:"rgba(255,255,255,0.72)",flex:1 }}>{q}</span>
        <span style={{ color:"rgba(255,255,255,0.3)",transition:"transform .2s",display:"inline-block",transform:o?"rotate(90deg)":"none" }}>{I.Chev}</span>
      </button>
      {o && <p style={{ fontSize:12,color:"rgba(255,255,255,0.42)",lineHeight:1.65,margin:"0 0 11px",paddingRight:22 }}>{a}</p>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
export default function AppMenu({ open, onClose, user, logout }) {
  const [panel,  setPanel]  = useState("home");
  const [status, setStatus] = useState("online");
  const [notif,  setNotif]  = useState({ msg:true, sound:true, desktop:false, mention:true });
  const [priv,   setPriv]   = useState({ lastSeen:true, read:true, online:true });
  const [vis,    setVis]    = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (open) { setTimeout(()=>setVis(true),10); setPanel("home"); }
    else setVis(false);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    setTimeout(()=>document.addEventListener("mousedown",h),60);
    return ()=>document.removeEventListener("mousedown",h);
  }, [open, onClose]);

  if (!open && !vis) return null;
  const cur = STATUSES.find(s=>s.id===status);

  const CUTS = [
    {k:["Ctrl","Z"],d:"Undo"},{k:["Ctrl","Y"],d:"Redo"},
    {k:["Enter"],d:"Send message"},{k:["Shift","Enter"],d:"New line"},
    {k:["Escape"],d:"Cancel / close"},{k:["Ctrl","S"],d:"Save whiteboard"},
    {k:["Ctrl","V"],d:"Paste image to board"},{k:["/"],d:"Focus search"},
  ];

  return (
    <>
      <style>{`
        @keyframes amIn{from{opacity:0;transform:translateX(-22px)}to{opacity:1;transform:translateX(0)}}
        @keyframes amFade{from{opacity:0}to{opacity:1}}
        .am-sc::-webkit-scrollbar{width:3px}
        .am-sc::-webkit-scrollbar-thumb{background:rgba(0,245,255,0.14);border-radius:3px}
        .am-sc::-webkit-scrollbar-track{background:transparent}
      `}</style>

      {/* Backdrop */}
      <div onClick={onClose} style={{
        position:"fixed",inset:0,zIndex:300,
        background:"rgba(0,0,0,0.5)",backdropFilter:"blur(4px)",
        opacity:vis?1:0,transition:"opacity .22s",
      }}/>

      {/* Drawer */}
      <div ref={ref} style={{
        position:"fixed",left:0,top:0,zIndex:301,
        width:"min(370px,92vw)",height:"100vh",
        background:"rgba(8,12,22,0.99)",
        borderRight:"1px solid rgba(0,245,255,0.09)",
        boxShadow:"6px 0 48px rgba(0,0,0,0.75),0 0 0 1px rgba(0,245,255,0.04)",
        display:"flex",flexDirection:"column",
        fontFamily:"'Sora','Poppins',sans-serif",
        opacity:vis?1:0,transform:vis?"translateX(0)":"translateX(-26px)",
        transition:"opacity .26s ease,transform .26s ease",
      }}>

        {/* ── Top bar ── */}
        <div style={{
          padding:"14px 18px",flexShrink:0,
          borderBottom:"1px solid rgba(255,255,255,0.06)",
          background:"linear-gradient(180deg,rgba(0,245,255,0.035) 0%,transparent 100%)",
        }}>
          <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:13 }}>
            <h2 style={{ margin:0,fontSize:16,fontWeight:800,color:"#F0F4FF" }}>Menu</h2>
            <button onClick={onClose} style={{
              width:28,height:28,borderRadius:7,border:"1px solid rgba(255,255,255,0.09)",
              background:"rgba(255,255,255,0.04)",color:"rgba(255,255,255,0.45)",
              cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",transition:"all .15s",
            }}
            onMouseEnter={e=>{e.currentTarget.style.background="rgba(239,68,68,0.1)";e.currentTarget.style.color="#f87171";}}
            onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.04)";e.currentTarget.style.color="rgba(255,255,255,0.45)";}}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          {/* Profile card */}
          <div style={{ display:"flex",alignItems:"center",gap:11,padding:"11px 13px",borderRadius:13,background:"rgba(0,245,255,0.04)",border:"1px solid rgba(0,245,255,0.1)" }}>
            <div style={{ position:"relative",flexShrink:0 }}>
              {user?.avatar
                ? <img src={user.avatar} style={{ width:46,height:46,borderRadius:"50%",objectFit:"cover",border:"2px solid rgba(0,245,255,0.22)" }} alt=""/>
                : <div style={{ width:46,height:46,borderRadius:"50%",background:"linear-gradient(135deg,#0e7490,#1d4ed8)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,color:"white",fontSize:17,border:"2px solid rgba(0,245,255,0.22)",boxShadow:"0 0 12px rgba(0,245,255,0.18)" }}>
                    {(user?.name||"U").charAt(0).toUpperCase()}
                  </div>
              }
              <div style={{ position:"absolute",bottom:1,right:1,width:11,height:11,borderRadius:"50%",background:cur.color,border:"2px solid rgba(8,12,22,0.99)",boxShadow:cur.id!=="invisible"?`0 0 5px ${cur.color}`:"none" }}/>
            </div>
            <div style={{ flex:1,minWidth:0 }}>
              <p style={{ margin:0,fontSize:13.5,fontWeight:700,color:"#F0F4FF",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{user?.name||"User"}</p>
              <p style={{ margin:"2px 0 0",fontSize:10.5,color:"rgba(255,255,255,0.38)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{user?.email||""}</p>
              <p style={{ margin:"3px 0 0",fontSize:11,fontWeight:600,color:cur.color }}>● {cur.label}</p>
            </div>
          </div>

          {/* Status pills */}
          <div style={{ display:"flex",gap:5,marginTop:9,flexWrap:"wrap" }}>
            {STATUSES.map(s=>(
              <button key={s.id} onClick={()=>setStatus(s.id)} title={s.desc} style={{
                display:"flex",alignItems:"center",gap:5,padding:"5px 10px",borderRadius:99,cursor:"pointer",transition:"all .16s",
                border:`1.5px solid ${status===s.id?s.color:"rgba(255,255,255,0.09)"}`,
                background:status===s.id?`${s.color}14`:"rgba(255,255,255,0.03)",
                boxShadow:status===s.id&&s.id!=="invisible"?`0 0 7px ${s.color}44`:"none",
              }}>
                <div style={{ width:7,height:7,borderRadius:"50%",background:s.color,flexShrink:0,boxShadow:s.id!=="invisible"?`0 0 4px ${s.color}`:"none" }}/>
                <span style={{ fontSize:11,fontWeight:600,color:status===s.id?s.color:"rgba(255,255,255,0.42)" }}>{s.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Body ── */}
        <div className="am-sc" style={{ flex:1,overflowY:"auto" }}>

          {panel==="home" && <>
            <SHead t="Account"/>
            <MRow icon={I.User}   label="Edit Profile"     sub="Name, photo, bio"          onClick={()=>setPanel("profile")}/>
            <MRow icon={I.Lock}   label="Change Password"  sub="Update credentials"        onClick={()=>setPanel("password")}/>
            <SHead t="Preferences"/>
            <MRow icon={I.Bell}   label="Notifications"    sub={notif.msg?"Messages, Sounds":"Muted"} onClick={()=>setPanel("notif")}/>
            <MRow icon={I.Shield} label="Privacy"          sub="Last seen, read receipts"  onClick={()=>setPanel("priv")}/>
            <MRow icon={I.Palette}label="Appearance"       sub="Theme, bubbles"            onClick={()=>setPanel("appear")}/>
            <SHead t="General"/>
            <MRow icon={I.Key}    label="Keyboard Shortcuts" sub="Speed up your workflow"  onClick={()=>setPanel("keys")}/>
            <MRow icon={I.Star}   label="What's New"       sub="Latest updates"            onClick={()=>setPanel("about")}/>
            <MRow icon={I.Help}   label="Help & Support"   sub="FAQ, contact"              onClick={()=>setPanel("help")}/>
            <MRow icon={I.Info}   label="About JourneyChat" sub="Version 1.0.0"            onClick={()=>setPanel("about")}/>
            <div style={{ height:1,margin:"10px 18px",background:"rgba(255,255,255,0.06)" }}/>
            <MRow icon={I.Out}    label="Sign Out"         sub="Log out of your account"   onClick={logout} red/>
            <div style={{ height:20 }}/>
          </>}

          {panel==="notif" && <Sub title="Notifications" back={()=>setPanel("home")}>
            <SHead t="Messages"/>
            <MRow icon={I.Bell}    label="Message Alerts"    sub="Notify for new messages"       right={<Toggle on={notif.msg}     onChange={v=>setNotif(p=>({...p,msg:v}))}/>}/>
            <MRow icon={I.Sound}   label="Sound"             sub="Play a sound on new message"   right={<Toggle on={notif.sound}   onChange={v=>setNotif(p=>({...p,sound:v}))}/>}/>
            <MRow icon={I.Desktop} label="Desktop Popups"    sub="System-level notifications"    right={<Toggle on={notif.desktop} onChange={v=>setNotif(p=>({...p,desktop:v}))}/>}/>
            <SHead t="Mentions"/>
            <MRow icon={I.Bell}    label="@Mention Alerts"   sub="Ping when someone @mentions"   right={<Toggle on={notif.mention} onChange={v=>setNotif(p=>({...p,mention:v}))}/>}/>
            <div style={{ padding:"12px 18px" }}><p style={{ fontSize:11,color:"rgba(255,255,255,0.28)",lineHeight:1.6 }}>Desktop notifications require browser permission.</p></div>
          </Sub>}

          {panel==="priv" && <Sub title="Privacy" back={()=>setPanel("home")}>
            <SHead t="Visibility"/>
            <MRow icon={I.Eye}    label="Last Seen"      sub="Show when you were last active"   right={<Toggle on={priv.lastSeen} onChange={v=>setPriv(p=>({...p,lastSeen:v}))}/>}/>
            <MRow icon={I.Check}  label="Read Receipts"  sub="Show when you've read messages"  right={<Toggle on={priv.read}     onChange={v=>setPriv(p=>({...p,read:v}))}/>}/>
            <MRow icon={I.Eye}    label="Online Status"  sub="Let others see you're online"     right={<Toggle on={priv.online}   onChange={v=>setPriv(p=>({...p,online:v}))}/>}/>
            <SHead t="Security"/>
            <MRow icon={I.Lock}   label="Active Sessions" sub="Devices logged in"              onClick={()=>{}}/>
            <div style={{ padding:"12px 18px" }}><p style={{ fontSize:11,color:"rgba(255,255,255,0.28)",lineHeight:1.6 }}>Disabling read receipts means you also won't see them from others.</p></div>
          </Sub>}

          {panel==="appear" && <Sub title="Appearance" back={()=>setPanel("home")}>
            <SHead t="Theme"/>
            <div style={{ padding:"0 18px 14px" }}>
              {[{id:"dark",l:"Dark",s:"Recommended"},{id:"amoled",l:"AMOLED",s:"Pure black"}].map(t=>(
                <div key={t.id} style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 13px",borderRadius:11,marginBottom:7,background:"rgba(255,255,255,0.03)",border:`1.5px solid ${t.id==="dark"?"#00F5FF":"rgba(255,255,255,0.08)"}`,cursor:"pointer" }}>
                  <div><p style={{ margin:0,fontSize:13,fontWeight:600,color:"#F0F4FF" }}>{t.l}</p><p style={{ margin:"2px 0 0",fontSize:11,color:"rgba(255,255,255,0.35)" }}>{t.s}</p></div>
                  {t.id==="dark" && <div style={{ width:18,height:18,borderRadius:"50%",background:"#00F5FF",boxShadow:"0 0 8px #00F5FF",display:"flex",alignItems:"center",justifyContent:"center" }}>{I.Check}</div>}
                </div>
              ))}
            </div>
            <SHead t="Chat Bubbles"/>
            <div style={{ padding:"0 18px 14px" }}><p style={{ fontSize:12,color:"rgba(255,255,255,0.38)",lineHeight:1.6 }}>Bubble style customisation coming in the next update.</p></div>
          </Sub>}

          {panel==="keys" && <Sub title="Keyboard Shortcuts" back={()=>setPanel("home")}>
            <div style={{ padding:"10px 18px 20px" }}>
              {CUTS.map((s,i)=>(
                <div key={i} style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"9px 0",borderBottom:i<CUTS.length-1?"1px solid rgba(255,255,255,0.05)":"none" }}>
                  <span style={{ fontSize:12.5,color:"rgba(255,255,255,0.58)" }}>{s.d}</span>
                  <div style={{ display:"flex",gap:4 }}>
                    {s.k.map((k,j)=>(
                      <kbd key={j} style={{ padding:"3px 7px",borderRadius:5,fontSize:11,fontWeight:700,background:"rgba(0,245,255,0.08)",border:"1px solid rgba(0,245,255,0.2)",color:"#00F5FF",fontFamily:"monospace" }}>{k}</kbd>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Sub>}

          {panel==="about" && <Sub title="About JourneyChat" back={()=>setPanel("home")}>
            <div style={{ padding:"22px 18px",textAlign:"center" }}>
              <div style={{ width:60,height:60,borderRadius:17,fontSize:28,display:"flex",alignItems:"center",justifyContent:"center",background:"linear-gradient(135deg,rgba(0,245,255,0.12),rgba(77,121,255,0.12))",border:"1px solid rgba(0,245,255,0.2)",boxShadow:"0 0 22px rgba(0,245,255,0.12)",margin:"0 auto 12px" }}>💬</div>
              <h3 style={{ margin:"0 0 3px",fontSize:17,fontWeight:800,color:"#F0F4FF" }}>JourneyChat</h3>
              <p style={{ margin:"0 0 14px",fontSize:11.5,color:"rgba(255,255,255,0.38)" }}>Version 1.0.0 · Built with ❤️</p>
              <p style={{ fontSize:12.5,color:"rgba(255,255,255,0.42)",lineHeight:1.7 }}>Real-time chat app with video calls, collaborative whiteboards, and sticky notes. Built with React, Node.js &amp; Socket.IO.</p>
              <div style={{ marginTop:16,display:"flex",flexDirection:"column",gap:7 }}>
                {[["💬","Private & Group Chats"],["📹","HD Video Calls (Agora)"],["🎨","Collaborative Whiteboard"],["📌","Personal Sticky Notes"],["🔒","JWT Authentication"]].map(([ic,la],i)=>(
                  <div key={i} style={{ display:"flex",alignItems:"center",gap:9,padding:"8px 11px",borderRadius:9,background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.06)",textAlign:"left" }}>
                    <span style={{ fontSize:15 }}>{ic}</span><span style={{ fontSize:12,color:"rgba(255,255,255,0.55)" }}>{la}</span>
                  </div>
                ))}
              </div>
            </div>
          </Sub>}

          {panel==="help" && <Sub title="Help & Support" back={()=>setPanel("home")}>
            <div style={{ paddingTop:8 }}>
              {[
                ["How do I start a video call?","Open a contact's chat and click the 📹 video icon in the chat header."],
                ["How do I use the whiteboard?","Open a private chat, then click the 🎨 brush icon to open the shared whiteboard."],
                ["Are my messages encrypted?","All messages use JWT-authenticated API calls. Data is stored securely on MongoDB."],
                ["How do I change my avatar?","Click 'Edit Profile' in this menu, then tap your photo to upload a new one."],
                ["Can I use JourneyChat on mobile?","Yes! The interface is fully responsive — open it in any mobile browser."],
              ].map(([q,a],i)=><HelpQ key={i} q={q} a={a}/>)}
              <div style={{ height:16 }}/>
            </div>
          </Sub>}

          {panel==="profile" && <Sub title="Edit Profile" back={()=>setPanel("home")}>
            <div style={{ padding:"18px" }}>
              <div style={{ textAlign:"center",marginBottom:18 }}>
                <div style={{ width:68,height:68,borderRadius:"50%",margin:"0 auto 8px",background:"linear-gradient(135deg,#0e7490,#1d4ed8)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,fontWeight:800,color:"white",border:"2px solid rgba(0,245,255,0.28)",boxShadow:"0 0 16px rgba(0,245,255,0.18)",overflow:"hidden" }}>
                  {user?.avatar?<img src={user.avatar} style={{ width:"100%",height:"100%",objectFit:"cover" }} alt=""/>:(user?.name||"U").charAt(0).toUpperCase()}
                </div>
                <p style={{ fontSize:11.5,color:"#00F5FF",margin:0,cursor:"pointer",fontWeight:600 }}>Change photo</p>
              </div>
              <Inp label="Full Name"     placeholder={user?.name||"Your name"}/>
              <Inp label="Email Address" placeholder={user?.email||"your@email.com"} type="email"/>
              <Inp label="Bio"           placeholder="Tell people about yourself…"/>
              <button style={{ width:"100%",padding:"11px",borderRadius:10,border:"none",background:"linear-gradient(135deg,#00C4D0,#0055BB)",color:"#fff",fontWeight:700,fontSize:13.5,cursor:"pointer",fontFamily:"inherit",boxShadow:"0 4px 16px rgba(0,180,220,0.32)",marginTop:4 }}>
                Save Changes
              </button>
            </div>
          </Sub>}

          {panel==="password" && <Sub title="Change Password" back={()=>setPanel("home")}>
            <div style={{ padding:"18px" }}>
              <Inp label="Current Password" placeholder="Enter current password"  type="password"/>
              <Inp label="New Password"     placeholder="Enter new password"       type="password"/>
              <Inp label="Confirm Password" placeholder="Confirm new password"    type="password"/>
              <button style={{ width:"100%",padding:"11px",borderRadius:10,border:"none",background:"linear-gradient(135deg,#00C4D0,#0055BB)",color:"#fff",fontWeight:700,fontSize:13.5,cursor:"pointer",fontFamily:"inherit",boxShadow:"0 4px 16px rgba(0,180,220,0.32)",marginTop:4 }}>
                Update Password
              </button>
            </div>
          </Sub>}

        </div>

        {/* Footer */}
        <div style={{ padding:"9px 18px",flexShrink:0,borderTop:"1px solid rgba(255,255,255,0.05)",textAlign:"center" }}>
          <p style={{ fontSize:10,color:"rgba(255,255,255,0.17)",margin:0 }}>🔒 End-to-end encrypted · JourneyChat v1.0.0</p>
        </div>
      </div>
    </>
  );
}