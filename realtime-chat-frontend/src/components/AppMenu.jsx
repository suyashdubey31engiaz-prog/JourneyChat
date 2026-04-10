// src/components/AppMenu.jsx
import React, { useState, useEffect, useRef, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { ThemeContext, THEMES, FONTS } from "../context/ThemeContext";
import { updateProfile, changePassword, uploadAvatar } from "../utils/api";

/* ── Icons ───────────────────────────────────────────────────────────────── */
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
  Sound:   <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>,
  Desktop: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>,
  Star:    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  Check:   <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>,
  Chev:    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>,
  Camera:  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>,
  Clock:   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  Switch:  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>,
  Font:    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>,
  Spin:    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{animation:"spin 1s linear infinite"}}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>,
};

const STATUSES = [
  { id:"online",    label:"Online",         color:"#22c55e", desc:"Active and available"      },
  { id:"away",      label:"Away",           color:"#f59e0b", desc:"Temporarily unavailable"   },
  { id:"busy",      label:"Do Not Disturb", color:"#ef4444", desc:"No notifications"          },
  { id:"invisible", label:"Invisible",      color:"rgba(255,255,255,0.28)", desc:"Appear offline" },
];

const DURATIONS = [
  { label:"30 minutes", hours:0.5 },{ label:"1 hour", hours:1 },
  { label:"2 hours", hours:2 },{ label:"4 hours", hours:4 },
  { label:"8 hours", hours:8 },{ label:"12 hours", hours:12 },
  { label:"24 hours", hours:24 },{ label:"Until I change it", hours:null },
];

/* ── Small components ────────────────────────────────────────────────────── */
const Toggle = ({ on, onChange }) => (
  <button onClick={()=>onChange(!on)} style={{ width:40,height:22,borderRadius:99,border:"none",cursor:"pointer",position:"relative",background:on?"linear-gradient(90deg,var(--t-primary),var(--t-tertiary))":"rgba(255,255,255,0.12)",transition:"background .22s",flexShrink:0,boxShadow:on?"0 0 10px var(--t-glow)":"none" }}>
    <div style={{ width:16,height:16,borderRadius:"50%",background:"#fff",position:"absolute",top:3,left:on?21:3,transition:"left .22s",boxShadow:"0 1px 4px rgba(0,0,0,0.3)" }}/>
  </button>
);

const SHead = ({ t }) => (
  <p style={{ fontSize:9.5,fontWeight:700,letterSpacing:".1em",textTransform:"uppercase",color:"var(--t-text3)",margin:"18px 0 5px",padding:"0 18px",fontFamily:"var(--t-font)" }}>{t}</p>
);

const MRow = ({ icon, label, sub, right, onClick, red }) => {
  const [h,setH]=useState(false);
  return (
    <button onClick={onClick} onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
      style={{ width:"100%",display:"flex",alignItems:"center",gap:11,padding:"10px 18px",background:h&&onClick?"rgba(255,255,255,0.04)":"none",border:"none",cursor:onClick?"pointer":"default",textAlign:"left",transition:"background .14s",fontFamily:"var(--t-font)" }}>
      <span style={{ width:30,height:30,borderRadius:9,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,background:red?"rgba(239,68,68,0.1)":h?"color-mix(in srgb,var(--t-primary) 12%,transparent)":"rgba(255,255,255,0.05)",color:red?"#f87171":h&&onClick?"var(--t-primary)":"var(--t-text2)",border:`1px solid ${red?"rgba(239,68,68,0.15)":h&&onClick?"var(--t-border2)":"var(--t-border)"}`,transition:"all .14s" }}>{icon}</span>
      <div style={{ flex:1,minWidth:0 }}>
        <p style={{ margin:0,fontSize:13,fontWeight:600,color:red?"#f87171":"var(--t-text)",lineHeight:1.25 }}>{label}</p>
        {sub&&<p style={{ margin:"2px 0 0",fontSize:11,color:"var(--t-text3)",lineHeight:1.3 }}>{sub}</p>}
      </div>
      {right&&<div style={{ flexShrink:0 }}>{right}</div>}
      {onClick&&!right&&<span style={{ color:"var(--t-text3)",flexShrink:0 }}>{I.Chev}</span>}
    </button>
  );
};

const Sub = ({ title, back, children }) => (
  <div style={{ display:"flex",flexDirection:"column",height:"100%" }}>
    <div style={{ display:"flex",alignItems:"center",gap:10,padding:"14px 18px",borderBottom:"1px solid var(--t-border)",flexShrink:0 }}>
      <button onClick={back} style={{ width:30,height:30,borderRadius:8,border:"1px solid var(--t-border)",background:"rgba(255,255,255,0.05)",color:"var(--t-text2)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,transition:"all .15s" }}
        onMouseEnter={e=>{e.currentTarget.style.borderColor="var(--t-border2)";e.currentTarget.style.color="var(--t-primary)";}}
        onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--t-border)";e.currentTarget.style.color="var(--t-text2)";}}>←</button>
      <h3 style={{ margin:0,fontSize:14.5,fontWeight:700,color:"var(--t-text)",fontFamily:"var(--t-font)" }}>{title}</h3>
    </div>
    <div style={{ flex:1,overflowY:"auto" }} className="am-sc">{children}</div>
  </div>
);

const Toast = ({ msg, type }) => msg ? (
  <div style={{ position:"fixed",bottom:24,left:"50%",transform:"translateX(-50%)",zIndex:400,padding:"11px 22px",borderRadius:12,fontSize:13,fontWeight:600,background:type==="error"?"rgba(239,68,68,0.12)":"rgba(34,197,94,0.1)",border:`1px solid ${type==="error"?"rgba(239,68,68,0.3)":"rgba(34,197,94,0.25)"}`,color:type==="error"?"#f87171":"#4ade80",backdropFilter:"blur(16px)",boxShadow:"0 8px 32px rgba(0,0,0,0.4)",animation:"toast-in .25s ease both",whiteSpace:"nowrap",fontFamily:"var(--t-font)" }}>
    {type==="error"?"⚠ ":"✓ "}{msg}
  </div>
) : null;

const FInp = ({ label, value, onChange, type="text", placeholder, disabled=false }) => (
  <div style={{ marginBottom:12 }}>
    <label style={{ display:"block",fontSize:10.5,fontWeight:700,letterSpacing:".05em",textTransform:"uppercase",color:"var(--t-text3)",marginBottom:5,fontFamily:"var(--t-font)" }}>{label}</label>
    <input type={type} value={value} onChange={onChange} placeholder={placeholder} disabled={disabled}
      style={{ width:"100%",boxSizing:"border-box",padding:"10px 13px",borderRadius:10,background:disabled?"rgba(255,255,255,0.02)":"rgba(255,255,255,0.04)",border:"1.5px solid var(--t-border)",color:disabled?"var(--t-text3)":"var(--t-text)",fontSize:13.5,outline:"none",fontFamily:"var(--t-font)",transition:"border .2s",cursor:disabled?"not-allowed":"text" }}
      onFocus={e=>{if(!disabled)e.target.style.border="1.5px solid var(--t-border2)";}}
      onBlur={e=>e.target.style.border="1.5px solid var(--t-border)"}/>
  </div>
);

const SaveBtn = ({ onClick, loading, label="Save Changes" }) => (
  <button onClick={onClick} disabled={loading}
    style={{ width:"100%",padding:"11px",borderRadius:10,border:"none",background:loading?"rgba(255,255,255,0.08)":"linear-gradient(135deg,var(--t-primary),var(--t-tertiary))",color:loading?"var(--t-text3)":"var(--t-bg)",fontWeight:700,fontSize:13.5,cursor:loading?"not-allowed":"pointer",fontFamily:"var(--t-font)",boxShadow:loading?"none":"0 4px 16px var(--t-glow)",marginTop:4,display:"flex",alignItems:"center",justifyContent:"center",gap:8,transition:"all .2s" }}>
    {loading?<>{I.Spin} Saving…</>:label}
  </button>
);

function HelpQ({ q, a }) {
  const [o,setO]=useState(false);
  return (
    <div style={{ borderBottom:"1px solid var(--t-border)",margin:"0 18px" }}>
      <button onClick={()=>setO(x=>!x)} style={{ width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"11px 0",background:"none",border:"none",cursor:"pointer",textAlign:"left",gap:10,fontFamily:"var(--t-font)" }}>
        <span style={{ fontSize:13,fontWeight:600,color:"var(--t-text2)",flex:1 }}>{q}</span>
        <span style={{ color:"var(--t-text3)",transition:"transform .2s",display:"inline-block",transform:o?"rotate(90deg)":"none" }}>{I.Chev}</span>
      </button>
      {o&&<p style={{ fontSize:12,color:"var(--t-text3)",lineHeight:1.65,margin:"0 0 11px",paddingRight:22,fontFamily:"var(--t-font)" }}>{a}</p>}
    </div>
  );
}

/* ── Theme Preview Card ───────────────────────────────────────────────────── */
const ThemeCard = ({ t, active, onSelect }) => {
  const [h, setH] = useState(false);
  return (
    <button
      onClick={() => onSelect(t.id)}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        position:"relative", borderRadius:12, overflow:"hidden",
        border:`2px solid ${active?"var(--t-primary)":h?"var(--t-border2)":"var(--t-border)"}`,
        cursor:"pointer", padding:0, background:"none",
        transition:"all .2s", transform:h&&!active?"scale(1.03)":"scale(1)",
        boxShadow:active?"0 0 18px var(--t-glow)":h?"0 4px 16px rgba(0,0,0,0.3)":"none",
        width:"100%",
      }}>
      {/* Colour preview */}
      <div style={{ height:44, background:t.preview[0], position:"relative", overflow:"hidden" }}>
        {/* Gradient sweep */}
        <div style={{ position:"absolute",inset:0,
          background:`linear-gradient(135deg,${t.preview[0]} 0%,${t.preview[1]}44 50%,${t.preview[0]} 100%)`,
          backgroundSize:"200% 200%",
          animation:active?"holographic 4s linear infinite":"none" }}/>
        {/* Accent dots */}
        <div style={{ position:"absolute",top:8,right:8,display:"flex",gap:4 }}>
          {t.preview.slice(1).map((c,i)=>(
            <div key={i} style={{ width:10,height:10,borderRadius:"50%",background:c,boxShadow:`0 0 8px ${c}` }}/>
          ))}
        </div>
        {/* Dot pattern */}
        <div style={{ position:"absolute",left:-4,bottom:-4,width:"40%",height:"150%",
          backgroundImage:`radial-gradient(circle,${t.preview[1]}66 1px,transparent 1px)`,
          backgroundSize:"7px 7px",opacity:0.25 }}/>
      </div>
      {/* Label */}
      <div style={{ padding:"7px 10px",background:t.dark?"rgba(0,0,0,0.85)":"rgba(255,255,255,0.9)",display:"flex",alignItems:"center",justifyContent:"space-between" }}>
        <div>
          <p style={{ margin:0,fontSize:11.5,fontWeight:700,color:t.dark?"#fff":t.preview[1],fontFamily:"var(--t-font)",whiteSpace:"nowrap" }}>{t.label}</p>
          <p style={{ margin:0,fontSize:9.5,color:t.dark?"rgba(255,255,255,0.4)":"rgba(0,0,0,0.4)",fontFamily:"var(--t-font)" }}>{t.desc}</p>
        </div>
        {active && <div style={{ width:16,height:16,borderRadius:"50%",background:"var(--t-primary)",display:"flex",alignItems:"center",justifyContent:"center",color:"var(--t-bg)",flexShrink:0 }}>{I.Check}</div>}
      </div>
    </button>
  );
};

/* ── Font Preview Row ─────────────────────────────────────────────────────── */
const FontRow = ({ f, active, onSelect }) => {
  const [h, setH] = useState(false);
  const FONT_MAP = {
    "poppins":'"Poppins",sans-serif',"sora":'"Sora",sans-serif',"orbitron":'"Orbitron",sans-serif',
    "space-grotesk":'"Space Grotesk",sans-serif',"dm-sans":'"DM Sans",sans-serif',"outfit":'"Outfit",sans-serif',
    "nunito":'"Nunito",sans-serif',"raleway":'"Raleway",sans-serif',"exo":'"Exo 2",sans-serif',
    "jakarta":'"Plus Jakarta Sans",sans-serif',"josefin":'"Josefin Sans",sans-serif',"cabin":'"Cabin",sans-serif',
  };
  return (
    <button onClick={()=>onSelect(f.id)} onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
      style={{ width:"100%",display:"flex",alignItems:"center",gap:12,padding:"11px 18px",background:active?"color-mix(in srgb,var(--t-primary) 8%,transparent)":h?"rgba(255,255,255,0.04)":"none",border:"none",cursor:"pointer",transition:"background .15s",textAlign:"left" }}>
      <div style={{ width:44,height:36,borderRadius:9,background:active?"color-mix(in srgb,var(--t-primary) 12%,transparent)":"rgba(255,255,255,0.05)",border:`1px solid ${active?"var(--t-border2)":"var(--t-border)"}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
        <span style={{ fontSize:17,fontWeight:700,fontFamily:FONT_MAP[f.id]||"inherit",color:active?"var(--t-primary)":"var(--t-text2)" }}>Ag</span>
      </div>
      <div style={{ flex:1,minWidth:0 }}>
        <p style={{ margin:0,fontSize:13.5,fontWeight:600,color:active?"var(--t-primary)":"var(--t-text)",fontFamily:FONT_MAP[f.id]||"inherit" }}>{f.label}</p>
        <p style={{ margin:0,fontSize:10.5,color:"var(--t-text3)",fontFamily:"var(--t-font)" }}>{f.style}</p>
      </div>
      {active && <span style={{ color:"var(--t-primary)",flexShrink:0 }}>{I.Check}</span>}
    </button>
  );
};

/* ════════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ════════════════════════════════════════════════════════════════════════════ */
export default function AppMenu({ open, onClose }) {
  const { user, updateUser, logout, setStatus: ctxSetStatus, savedAccounts, switchAccount, forgetAccount } = useContext(AuthContext);
  const { theme, setTheme, font, setFont } = useContext(ThemeContext);

  const [panel,        setPanel]        = useState("home");
  const [notif,        setNotif]        = useState({ msg:true, sound:true, desktop:false, mention:true });
  const [priv,         setPriv]         = useState({ lastSeen:true, read:true, online:true });
  const [vis,          setVis]          = useState(false);
  const [toast,        setToast]        = useState({ msg:"", type:"ok" });

  // Profile
  const [profName,     setProfName]     = useState("");
  const [profBio,      setProfBio]      = useState("");
  const [profSaving,   setProfSaving]   = useState(false);
  const [avatarBusy,   setAvatarBusy]   = useState(false);

  // Password
  const [curPass,      setCurPass]      = useState("");
  const [newPass,      setNewPass]      = useState("");
  const [confPass,     setConfPass]     = useState("");
  const [passSaving,   setPassSaving]   = useState(false);

  // Status
  const [pickedStatus,   setPickedStatus]   = useState(user?.status || "online");
  const [pickedDuration, setPickedDuration] = useState(null);
  const [statusSaving,   setStatusSaving]   = useState(false);

  const ref    = useRef(null);
  const fileRef = useRef(null);

  useEffect(()=>{ if(open){setTimeout(()=>setVis(true),10);setPanel("home");}else setVis(false); },[open]);
  useEffect(()=>{ if(user&&panel==="profile"){setProfName(user.name||"");setProfBio(user.bio||"");} },[user,panel]);
  useEffect(()=>{ if(user&&panel==="status") setPickedStatus(user.status||"online"); },[user,panel]);
  useEffect(()=>{
    if(!open)return;
    const h=(e)=>{ if(ref.current&&!ref.current.contains(e.target))onClose(); };
    setTimeout(()=>document.addEventListener("mousedown",h),60);
    return()=>document.removeEventListener("mousedown",h);
  },[open,onClose]);

  const showToast=(msg,type="ok")=>{ setToast({msg,type}); setTimeout(()=>setToast({msg:"",type:"ok"}),3200); };

  const saveProfile=async()=>{
    if(!profName.trim()){showToast("Name cannot be empty","error");return;}
    setProfSaving(true);
    try{
      const res=await updateProfile({name:profName.trim(),bio:profBio.trim()});
      updateUser(res.data.user); showToast("Profile updated");
    }catch(err){showToast(err.response?.data?.msg||"Failed to update","error");}
    setProfSaving(false);
  };

  const handleAvatar=async(e)=>{
    const file=e.target.files?.[0]; if(!file)return;
    if(!file.type.startsWith("image/")){showToast("Please select an image","error");return;}
    if(file.size>5*1024*1024){showToast("Image must be under 5MB","error");return;}
    setAvatarBusy(true);
    try{
      const fd=new FormData(); fd.append("avatar",file);
      const res=await uploadAvatar(fd);
      updateUser({avatar:res.data.avatar}); showToast("Photo updated");
    }catch(err){showToast(err.response?.data?.msg||"Upload failed","error");}
    setAvatarBusy(false); e.target.value="";
  };

  const savePassword=async()=>{
    if(!curPass||!newPass||!confPass){showToast("Please fill all fields","error");return;}
    if(newPass!==confPass){showToast("Passwords do not match","error");return;}
    if(newPass.length<6){showToast("Password must be at least 6 characters","error");return;}
    if(newPass===curPass){showToast("New password must differ","error");return;}
    setPassSaving(true);
    try{
      await changePassword({currentPassword:curPass,newPassword:newPass});
      showToast("Password updated"); setCurPass("");setNewPass("");setConfPass("");
      setTimeout(()=>setPanel("home"),1400);
    }catch(err){showToast(err.response?.data?.msg||"Failed","error");}
    setPassSaving(false);
  };

  const saveStatus=async()=>{
    setStatusSaving(true);
    if(ctxSetStatus) await ctxSetStatus(pickedStatus,pickedDuration);
    showToast(`Status: ${STATUSES.find(s=>s.id===pickedStatus)?.label}`);
    setStatusSaving(false); setTimeout(()=>setPanel("home"),900);
  };

  if(!open&&!vis)return null;
  const curSt=STATUSES.find(s=>s.id===(user?.status||"online"));
  const passScore=newPass?[newPass.length>=8,/[A-Z]/.test(newPass),/[0-9]/.test(newPass),/[^A-Za-z0-9]/.test(newPass)].filter(Boolean).length:0;
  const passColors=["","#ef4444","#f59e0b","#3b82f6","#22c55e"];

  const CUTS=[
    {k:["Ctrl","Z"],d:"Undo"},{k:["Ctrl","Y"],d:"Redo"},{k:["Enter"],d:"Send message"},
    {k:["Shift","Enter"],d:"New line"},{k:["Escape"],d:"Cancel"},{k:["Ctrl","S"],d:"Save whiteboard"},
    {k:["Ctrl","V"],d:"Paste image"},{k:["/"],d:"Focus search"},
  ];

  return (
    <>
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes toast-in{from{opacity:0;transform:translateX(-50%) translateY(12px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
        @keyframes holographic{0%{background-position:200% 200%}100%{background-position:-200% -200%}}
        .am-sc::-webkit-scrollbar{width:3px}
        .am-sc::-webkit-scrollbar-thumb{background:var(--t-scrollbar);border-radius:3px}
        .am-sc::-webkit-scrollbar-track{background:transparent}
        .avatar-wrap:hover .avatar-overlay{opacity:1!important}
      `}</style>

      {/* Backdrop */}
      <div onClick={onClose} style={{ position:"fixed",inset:0,zIndex:300,background:"rgba(0,0,0,0.55)",backdropFilter:"blur(5px)",opacity:vis?1:0,transition:"opacity .22s" }}/>

      {/* Drawer */}
      <div ref={ref} style={{
        position:"fixed",left:0,top:0,zIndex:301,
        width:"min(380px,93vw)",height:"100vh",
        background:"var(--t-bg2,rgba(8,12,22,0.99))",
        borderRight:"1px solid var(--t-border2)",
        boxShadow:`6px 0 48px rgba(0,0,0,0.75), 0 0 0 1px var(--t-border)`,
        display:"flex",flexDirection:"column",
        fontFamily:"var(--t-font)",
        opacity:vis?1:0,transform:vis?"translateX(0)":"translateX(-26px)",
        transition:"opacity .26s ease,transform .26s ease",
      }}>

        {/* ── Header ── */}
        <div style={{ padding:"14px 18px",flexShrink:0,borderBottom:"1px solid var(--t-border)",
          background:"linear-gradient(180deg,color-mix(in srgb,var(--t-primary) 5%,transparent) 0%,transparent 100%)" }}>
          <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:13 }}>
            <h2 style={{ margin:0,fontSize:16,fontWeight:800,color:"var(--t-text)",fontFamily:"var(--t-font)" }}>Menu</h2>
            <button onClick={onClose} style={{ width:28,height:28,borderRadius:7,border:"1px solid var(--t-border)",background:"rgba(255,255,255,0.04)",color:"var(--t-text2)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",transition:"all .15s" }}
              onMouseEnter={e=>{e.currentTarget.style.background="rgba(239,68,68,0.1)";e.currentTarget.style.color="#f87171";}}
              onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.04)";e.currentTarget.style.color="var(--t-text2)";}}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          {/* Profile card */}
          <div className="neon-card" style={{ display:"flex",alignItems:"center",gap:11,padding:"11px 13px",borderRadius:13 }}>
            <div style={{ position:"relative",flexShrink:0 }}>
              {user?.avatar
                ?<img src={user.avatar} style={{ width:46,height:46,borderRadius:"50%",objectFit:"cover",border:"2px solid var(--t-border2)" }} alt=""/>
                :<div style={{ width:46,height:46,borderRadius:"50%",background:"linear-gradient(135deg,var(--t-primary),var(--t-tertiary))",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,color:"var(--t-bg)",fontSize:17,border:"2px solid var(--t-border2)" }}>
                  {(user?.name||"U").charAt(0).toUpperCase()}
                </div>}
              <div style={{ position:"absolute",bottom:1,right:1,width:11,height:11,borderRadius:"50%",background:curSt?.color,border:"2px solid var(--t-bg2)",boxShadow:user?.status!=="invisible"?`0 0 5px ${curSt?.color}`:"none" }}/>
            </div>
            <div style={{ flex:1,minWidth:0 }}>
              <p style={{ margin:0,fontSize:13.5,fontWeight:700,color:"var(--t-text)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",fontFamily:"var(--t-font)" }}>{user?.name||"User"}</p>
              <p style={{ margin:"2px 0 0",fontSize:10.5,color:"var(--t-text3)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{user?.email||""}</p>
              <button onClick={()=>setPanel("status")} style={{ display:"inline-flex",alignItems:"center",gap:5,marginTop:3,background:"none",border:"none",cursor:"pointer",padding:0,fontFamily:"var(--t-font)" }}>
                <div style={{ width:7,height:7,borderRadius:"50%",background:curSt?.color,boxShadow:user?.status!=="invisible"?`0 0 4px ${curSt?.color}`:"none" }}/>
                <span style={{ fontSize:11,fontWeight:600,color:curSt?.color }}>{curSt?.label}</span>
                <span style={{ fontSize:10,color:"var(--t-text3)" }}>· Change</span>
              </button>
            </div>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="am-sc" style={{ flex:1,overflowY:"auto" }}>

          {/* HOME */}
          {panel==="home"&&<>
            <SHead t="Account"/>
            <MRow icon={I.User}    label="Edit Profile"       sub="Name, photo, bio"                          onClick={()=>setPanel("profile")}/>
            <MRow icon={I.Lock}    label="Change Password"    sub="Update credentials"                        onClick={()=>setPanel("password")}/>
            <MRow icon={I.Switch}  label="Switch Account"     sub={savedAccounts?.length>0?`${savedAccounts.length} saved`:"No saved accounts"} onClick={()=>setPanel("accounts")}/>
            <SHead t="Status"/>
            <MRow icon={<span style={{ fontSize:13 }}>●</span>} label="Set Status" sub={`Currently: ${curSt?.label}`} onClick={()=>setPanel("status")}/>
            <SHead t="Appearance"/>
            <MRow icon={I.Palette} label="Themes"             sub={`${THEMES.find(t=>t.id===theme)?.label || "Cyber Neon"} — 12 available`} onClick={()=>setPanel("themes")}/>
            <MRow icon={I.Font}    label="Fonts"              sub={`${FONTS.find(f=>f.id===font)?.label || "Poppins"} — 12 available`}       onClick={()=>setPanel("fonts")}/>
            <SHead t="Preferences"/>
            <MRow icon={I.Bell}    label="Notifications"      sub={notif.msg?"Messages, Sounds":"Muted"}      onClick={()=>setPanel("notif")}/>
            <MRow icon={I.Shield}  label="Privacy"            sub="Last seen, read receipts"                  onClick={()=>setPanel("priv")}/>
            <SHead t="General"/>
            <MRow icon={I.Key}     label="Keyboard Shortcuts" sub="Speed up your workflow"                    onClick={()=>setPanel("keys")}/>
            <MRow icon={I.Star}    label="What's New"         sub="Latest updates"                            onClick={()=>setPanel("about")}/>
            <MRow icon={I.Help}    label="Help & Support"     sub="FAQ, contact"                              onClick={()=>setPanel("help")}/>
            <MRow icon={I.Info}    label="About JourneyChat"  sub="Version 1.0.0"                             onClick={()=>setPanel("about")}/>
            <div style={{ height:1,margin:"10px 18px",background:"var(--t-border)" }}/>
            <MRow icon={I.Out}     label="Sign Out"           sub="Log out of your account"                   onClick={()=>logout(true)} red/>
            <div style={{ height:20 }}/>
          </>}

          {/* THEMES PANEL */}
          {panel==="themes"&&<Sub title="Choose Theme" back={()=>setPanel("home")}>
            <div style={{ padding:"14px 18px" }}>
              <p style={{ fontSize:12,color:"var(--t-text3)",margin:"0 0 14px",lineHeight:1.6 }}>
                Pick a visual theme for the entire app. Changes apply instantly.
              </p>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10 }}>
                {THEMES.map(t=>(
                  <ThemeCard key={t.id} t={t} active={theme===t.id} onSelect={(id)=>{ setTheme(id); showToast(`Theme: ${t.label}`); }}/>
                ))}
              </div>
            </div>
          </Sub>}

          {/* FONTS PANEL */}
          {panel==="fonts"&&<Sub title="Choose Font" back={()=>setPanel("home")}>
            <div style={{ padding:"10px 0 14px" }}>
              <p style={{ fontSize:12,color:"var(--t-text3)",margin:"0 0 8px",padding:"0 18px",lineHeight:1.6 }}>
                Changes the font used across the entire app.
              </p>
              {FONTS.map(f=>(
                <FontRow key={f.id} f={f} active={font===f.id} onSelect={(id)=>{ setFont(id); showToast(`Font: ${FONTS.find(x=>x.id===id)?.label}`); }}/>
              ))}
              <div style={{ padding:"12px 18px 0" }}>
                <div style={{ padding:"12px 14px",borderRadius:12,background:"color-mix(in srgb,var(--t-primary) 6%,transparent)",border:"1px solid var(--t-border2)" }}>
                  <p style={{ margin:0,fontSize:11,color:"var(--t-text2)",lineHeight:1.6 }}>
                    💡 Orbitron is great for Cyber Neon theme. Nunito pairs well with lighter themes. Raleway suits Rose Gold perfectly.
                  </p>
                </div>
              </div>
            </div>
          </Sub>}

          {/* STATUS PANEL */}
          {panel==="status"&&<Sub title="Set Your Status" back={()=>setPanel("home")}>
            <div style={{ padding:"16px 18px" }}>
              <p style={{ fontSize:12,color:"var(--t-text3)",margin:"0 0 14px",lineHeight:1.6 }}>
                Your status is visible to all contacts. Set a timer to auto-reset.
              </p>
              <p style={{ fontSize:10.5,fontWeight:700,letterSpacing:".08em",textTransform:"uppercase",color:"var(--t-text3)",margin:"0 0 8px" }}>Status</p>
              <div style={{ display:"flex",flexDirection:"column",gap:7,marginBottom:20 }}>
                {STATUSES.map(s=>{
                  const active=pickedStatus===s.id;
                  return (
                    <button key={s.id} onClick={()=>setPickedStatus(s.id)} style={{ display:"flex",alignItems:"center",gap:12,padding:"12px 14px",borderRadius:12,border:`1.5px solid ${active?s.color:"var(--t-border)"}`,background:active?`${s.color}11`:"rgba(255,255,255,0.03)",cursor:"pointer",transition:"all .18s",textAlign:"left",boxShadow:active&&s.id!=="invisible"?`0 0 14px ${s.color}30`:"none",fontFamily:"var(--t-font)" }}>
                      <div style={{ width:12,height:12,borderRadius:"50%",background:s.color,flexShrink:0,boxShadow:s.id!=="invisible"?`0 0 6px ${s.color}`:"none" }}/>
                      <div style={{ flex:1 }}>
                        <p style={{ margin:0,fontSize:13,fontWeight:700,color:active?s.color:"var(--t-text)" }}>{s.label}</p>
                        <p style={{ margin:0,fontSize:11,color:"var(--t-text3)" }}>{s.desc}</p>
                      </div>
                      {active&&<span style={{ color:s.color }}>{I.Check}</span>}
                    </button>
                  );
                })}
              </div>
              {pickedStatus!=="online"&&<>
                <p style={{ fontSize:10.5,fontWeight:700,letterSpacing:".08em",textTransform:"uppercase",color:"var(--t-text3)",margin:"0 0 8px",display:"flex",alignItems:"center",gap:6 }}>{I.Clock} Auto-reset after</p>
                <div style={{ display:"flex",flexWrap:"wrap",gap:7,marginBottom:20 }}>
                  {DURATIONS.map(d=>{
                    const active=pickedDuration===d.hours;
                    return <button key={d.label} onClick={()=>setPickedDuration(d.hours)} style={{ padding:"7px 13px",borderRadius:99,border:`1.5px solid ${active?"var(--t-primary)":"var(--t-border)"}`,background:active?"color-mix(in srgb,var(--t-primary) 12%,transparent)":"rgba(255,255,255,0.04)",cursor:"pointer",fontSize:12,fontWeight:600,color:active?"var(--t-primary)":"var(--t-text2)",transition:"all .16s",fontFamily:"var(--t-font)",boxShadow:active?"0 0 8px var(--t-glow)":"none" }}>{d.label}</button>;
                  })}
                </div>
              </>}
              <SaveBtn onClick={saveStatus} loading={statusSaving} label="Apply Status"/>
            </div>
          </Sub>}

          {/* ACCOUNTS */}
          {panel==="accounts"&&<Sub title="Switch Account" back={()=>setPanel("home")}>
            <div style={{ padding:"14px 18px" }}>
              {!savedAccounts||savedAccounts.length===0
                ? <div style={{ textAlign:"center",padding:"2rem 0" }}>
                    <p style={{ fontSize:14,color:"var(--t-text)",margin:"0 0 6px",fontWeight:700,fontFamily:"var(--t-font)" }}>No saved accounts</p>
                    <p style={{ fontSize:12,color:"var(--t-text3)",fontFamily:"var(--t-font)" }}>Log in with "Keep me signed in" to save accounts.</p>
                  </div>
                : <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
                    {savedAccounts.map(acc=>{
                      const expired=acc.expiresAt&&Date.now()>acc.expiresAt;
                      const isCurrent=acc.email===user?.email;
                      return (
                        <div key={acc.email} className="neon-card" style={{ display:"flex",alignItems:"center",gap:10,padding:"10px 13px",cursor:isCurrent?"default":"pointer",background:isCurrent?"color-mix(in srgb,var(--t-primary) 6%,transparent)":"var(--t-card-bg)" }}
                          onClick={()=>!isCurrent&&switchAccount&&switchAccount(acc)}>
                          {acc.avatar?<img src={acc.avatar} style={{ width:36,height:36,borderRadius:"50%",objectFit:"cover",border:"1.5px solid var(--t-border2)",flexShrink:0 }} alt=""/>
                            :<div style={{ width:36,height:36,borderRadius:"50%",background:"linear-gradient(135deg,var(--t-primary),var(--t-tertiary))",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,color:"var(--t-bg)",fontSize:13,flexShrink:0 }}>{(acc.name||"?").charAt(0).toUpperCase()}</div>}
                          <div style={{ flex:1,minWidth:0 }}>
                            <p style={{ margin:0,fontSize:13,fontWeight:700,color:isCurrent?"var(--t-primary)":"var(--t-text)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",fontFamily:"var(--t-font)" }}>{acc.name}</p>
                            <p style={{ margin:0,fontSize:10.5,color:expired?"#f87171":"var(--t-text3)",fontFamily:"var(--t-font)" }}>{expired?"Expired — sign in again":acc.email}</p>
                          </div>
                          <button onClick={e=>{e.stopPropagation();forgetAccount&&forgetAccount(acc.email);}} style={{ background:"none",border:"none",cursor:"pointer",color:"var(--t-text3)",fontSize:13,padding:"3px 5px",borderRadius:6,flexShrink:0,transition:"color .15s" }}
                            onMouseEnter={e=>e.currentTarget.style.color="#f87171"}
                            onMouseLeave={e=>e.currentTarget.style.color="var(--t-text3)"}>✕</button>
                        </div>
                      );
                    })}
                  </div>
              }
            </div>
          </Sub>}

          {/* EDIT PROFILE */}
          {panel==="profile"&&<Sub title="Edit Profile" back={()=>setPanel("home")}>
            <div style={{ padding:"18px" }}>
              <div style={{ textAlign:"center",marginBottom:18 }}>
                <div className="avatar-wrap" style={{ position:"relative",display:"inline-block",cursor:"pointer" }} onClick={()=>fileRef.current?.click()}>
                  {user?.avatar?<img src={user.avatar} style={{ width:72,height:72,borderRadius:"50%",objectFit:"cover",border:"2px solid var(--t-border2)",boxShadow:"0 0 18px var(--t-glow)" }} alt=""/>
                    :<div style={{ width:72,height:72,borderRadius:"50%",background:"linear-gradient(135deg,var(--t-primary),var(--t-tertiary))",display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,fontWeight:800,color:"var(--t-bg)",border:"2px solid var(--t-border2)" }}>{(user?.name||"U").charAt(0).toUpperCase()}</div>}
                  <div className="avatar-overlay" style={{ position:"absolute",inset:0,borderRadius:"50%",background:"rgba(0,0,0,0.55)",display:"flex",alignItems:"center",justifyContent:"center",opacity:0,transition:"opacity .2s" }}>
                    {avatarBusy?I.Spin:<span style={{ color:"#fff",fontSize:18 }}>{I.Camera}</span>}
                  </div>
                </div>
                <input ref={fileRef} type="file" accept="image/*" style={{ display:"none" }} onChange={handleAvatar}/>
                <p style={{ fontSize:11.5,color:"var(--t-primary)",margin:"8px 0 0",cursor:"pointer",fontWeight:600,fontFamily:"var(--t-font)" }} onClick={()=>fileRef.current?.click()}>{avatarBusy?"Uploading…":"Change photo"}</p>
              </div>
              <FInp label="Full Name"     value={profName} onChange={e=>setProfName(e.target.value)} placeholder={user?.name||"Your name"}/>
              <FInp label="Email Address" value={user?.email||""} onChange={()=>{}} disabled/>
              <FInp label="Bio"           value={profBio}  onChange={e=>setProfBio(e.target.value)}  placeholder="Tell people about yourself…"/>
              <SaveBtn onClick={saveProfile} loading={profSaving}/>
            </div>
          </Sub>}

          {/* CHANGE PASSWORD */}
          {panel==="password"&&<Sub title="Change Password" back={()=>setPanel("home")}>
            <div style={{ padding:"18px" }}>
              <FInp label="Current Password" value={curPass}  onChange={e=>setCurPass(e.target.value)}  type="password" placeholder="Enter current password"/>
              <FInp label="New Password"     value={newPass}  onChange={e=>setNewPass(e.target.value)}  type="password" placeholder="Min 6 chars, mix it up"/>
              <FInp label="Confirm Password" value={confPass} onChange={e=>setConfPass(e.target.value)} type="password" placeholder="Repeat new password"/>
              {newPass&&(
                <div style={{ marginBottom:14 }}>
                  <div style={{ display:"flex",gap:3,marginBottom:3 }}>
                    {[1,2,3,4].map(i=><div key={i} style={{ flex:1,height:2.5,borderRadius:99,background:i<=passScore?passColors[passScore]:"var(--t-border)",transition:"background .3s" }}/>)}
                  </div>
                  <span style={{ fontSize:10,color:passColors[passScore],fontWeight:600,fontFamily:"var(--t-font)" }}>{["","Weak","Fair","Good","Strong"][passScore]}</span>
                </div>
              )}
              <SaveBtn onClick={savePassword} loading={passSaving} label="Update Password"/>
            </div>
          </Sub>}

          {/* NOTIFICATIONS */}
          {panel==="notif"&&<Sub title="Notifications" back={()=>setPanel("home")}>
            <SHead t="Messages"/>
            <MRow icon={I.Bell}    label="Message Alerts"  sub="Notify for new messages"      right={<Toggle on={notif.msg}     onChange={v=>setNotif(p=>({...p,msg:v}))}/>}/>
            <MRow icon={I.Sound}   label="Sound"           sub="Play a sound on new message"  right={<Toggle on={notif.sound}   onChange={v=>setNotif(p=>({...p,sound:v}))}/>}/>
            <MRow icon={I.Desktop} label="Desktop Popups"  sub="System-level notifications"   right={<Toggle on={notif.desktop} onChange={v=>setNotif(p=>({...p,desktop:v}))}/>}/>
            <SHead t="Mentions"/>
            <MRow icon={I.Bell}    label="@Mention Alerts" sub="Ping when @mentioned"         right={<Toggle on={notif.mention} onChange={v=>setNotif(p=>({...p,mention:v}))}/>}/>
          </Sub>}

          {/* PRIVACY */}
          {panel==="priv"&&<Sub title="Privacy" back={()=>setPanel("home")}>
            <SHead t="Visibility"/>
            <MRow icon={I.Eye}   label="Last Seen"      sub="Show when last active"            right={<Toggle on={priv.lastSeen} onChange={v=>setPriv(p=>({...p,lastSeen:v}))}/>}/>
            <MRow icon={I.Check} label="Read Receipts"  sub="Show when messages are read"      right={<Toggle on={priv.read}     onChange={v=>setPriv(p=>({...p,read:v}))}/>}/>
            <MRow icon={I.Eye}   label="Online Status"  sub="Let others see you're online"     right={<Toggle on={priv.online}   onChange={v=>setPriv(p=>({...p,online:v}))}/>}/>
            <SHead t="Security"/>
            <MRow icon={I.Lock}  label="Active Sessions" sub="Devices logged in"               onClick={()=>{}}/>
          </Sub>}

          {/* SHORTCUTS */}
          {panel==="keys"&&<Sub title="Keyboard Shortcuts" back={()=>setPanel("home")}>
            <div style={{ padding:"10px 18px 20px" }}>
              {CUTS.map((s,i)=>(
                <div key={i} style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"9px 0",borderBottom:i<CUTS.length-1?"1px solid var(--t-border)":"none" }}>
                  <span style={{ fontSize:12.5,color:"var(--t-text2)",fontFamily:"var(--t-font)" }}>{s.d}</span>
                  <div style={{ display:"flex",gap:4 }}>{s.k.map((k,j)=><kbd key={j} style={{ padding:"3px 7px",borderRadius:5,fontSize:11,fontWeight:700,background:"color-mix(in srgb,var(--t-primary) 10%,transparent)",border:"1px solid var(--t-border2)",color:"var(--t-primary)",fontFamily:"monospace" }}>{k}</kbd>)}</div>
                </div>
              ))}
            </div>
          </Sub>}

          {/* ABOUT */}
          {panel==="about"&&<Sub title="About JourneyChat" back={()=>setPanel("home")}>
            <div style={{ padding:"22px 18px",textAlign:"center" }}>
              <div className="neon-card" style={{ width:60,height:60,borderRadius:17,fontSize:28,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 12px" }}>💬</div>
              <h3 style={{ margin:"0 0 3px",fontSize:17,fontWeight:800,color:"var(--t-text)",fontFamily:"var(--t-font)" }}>JourneyChat</h3>
              <p style={{ margin:"0 0 14px",fontSize:11.5,color:"var(--t-text3)",fontFamily:"var(--t-font)" }}>Version 1.0.0</p>
              <p className="gradient-text" style={{ fontSize:12.5,lineHeight:1.7,maxWidth:280,margin:"0 auto",fontFamily:"var(--t-font)" }}>Real-time chat with video calls, whiteboards, and sticky notes.</p>
            </div>
          </Sub>}

          {/* HELP */}
          {panel==="help"&&<Sub title="Help & Support" back={()=>setPanel("home")}>
            <div style={{ paddingTop:8 }}>
              {[
                ["How do I change the theme?","Open Menu → Themes. Choose from 12 unique visual themes. Your choice is saved automatically."],
                ["How do I change the font?","Open Menu → Fonts. Choose from 12 different fonts. They apply instantly across the whole app."],
                ["How do I start a video call?","Open a contact's chat and click the 📹 icon in the chat header."],
                ["How does 'Keep me signed in' work?","Your session stays alive for 15 days. Without it, you'll be logged out after 24 hours."],
                ["How do I use the whiteboard?","Open a private chat and click the 🎨 brush icon to open the shared real-time whiteboard."],
                ["Can I use JourneyChat on mobile?","Yes — the app is fully responsive. Open it in any mobile browser."],
              ].map(([q,a],i)=><HelpQ key={i} q={q} a={a}/>)}
              <div style={{ height:16 }}/>
            </div>
          </Sub>}

        </div>

        {/* Footer */}
        <div style={{ padding:"9px 18px",flexShrink:0,borderTop:"1px solid var(--t-border)",textAlign:"center" }}>
          <p style={{ fontSize:10,color:"var(--t-text3)",margin:0,fontFamily:"var(--t-font)" }}>🔒 End-to-end encrypted · JourneyChat v1.0.0</p>
        </div>
      </div>

      <Toast msg={toast.msg} type={toast.type}/>
    </>
  );
}