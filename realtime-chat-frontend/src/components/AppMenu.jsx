// src/components/AppMenu.jsx
import React, { useState, useEffect, useRef, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { updateProfile, changePassword, uploadAvatar } from "../utils/api";

/* ── Icons ────────────────────────────────────────────────────────────────── */
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
  Spin:    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{animation:"spin 1s linear infinite"}}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>,
};

/* ── Status definitions ───────────────────────────────────────────────────── */
const STATUSES = [
  { id:"online",    label:"Online",         color:"#22c55e", desc:"Active and available"              },
  { id:"away",      label:"Away",           color:"#f59e0b", desc:"Temporarily unavailable"           },
  { id:"busy",      label:"Do Not Disturb", color:"#ef4444", desc:"No notifications"                  },
  { id:"invisible", label:"Invisible",      color:"rgba(255,255,255,0.28)", desc:"Appear offline"     },
];

// Duration options for status auto-reset
const DURATIONS = [
  { label:"30 minutes",  hours: 0.5  },
  { label:"1 hour",      hours: 1    },
  { label:"2 hours",     hours: 2    },
  { label:"4 hours",     hours: 4    },
  { label:"8 hours",     hours: 8    },
  { label:"12 hours",    hours: 12   },
  { label:"24 hours",    hours: 24   },
  { label:"Until I change it", hours: null },
];

/* ── Toggle ───────────────────────────────────────────────────────────────── */
const Toggle = ({ on, onChange }) => (
  <button onClick={()=>onChange(!on)} style={{ width:40,height:22,borderRadius:99,border:"none",cursor:"pointer",position:"relative",background:on?"linear-gradient(90deg,#00C4D0,#0055BB)":"rgba(255,255,255,0.12)",transition:"background .22s",flexShrink:0,boxShadow:on?"0 0 10px rgba(0,200,220,0.35)":"none" }}>
    <div style={{ width:16,height:16,borderRadius:"50%",background:"#fff",position:"absolute",top:3,left:on?21:3,transition:"left .22s",boxShadow:"0 1px 4px rgba(0,0,0,0.3)" }}/>
  </button>
);

/* ── Section heading ──────────────────────────────────────────────────────── */
const SHead = ({ t }) => (
  <p style={{ fontSize:9.5,fontWeight:700,letterSpacing:".1em",textTransform:"uppercase",color:"rgba(255,255,255,0.25)",margin:"18px 0 5px",padding:"0 18px" }}>{t}</p>
);

/* ── Menu row ─────────────────────────────────────────────────────────────── */
const MRow = ({ icon, label, sub, right, onClick, red }) => {
  const [h,setH]=useState(false);
  return (
    <button onClick={onClick} onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)} style={{ width:"100%",display:"flex",alignItems:"center",gap:11,padding:"10px 18px",background:h&&onClick?"rgba(255,255,255,0.04)":"none",border:"none",cursor:onClick?"pointer":"default",textAlign:"left",transition:"background .14s" }}>
      <span style={{ width:30,height:30,borderRadius:9,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,background:red?"rgba(239,68,68,0.1)":h?"rgba(0,245,255,0.08)":"rgba(255,255,255,0.05)",color:red?"#f87171":h&&onClick?"#00F5FF":"rgba(255,255,255,0.5)",border:`1px solid ${red?"rgba(239,68,68,0.15)":h&&onClick?"rgba(0,245,255,0.18)":"rgba(255,255,255,0.07)"}`,transition:"all .14s" }}>{icon}</span>
      <div style={{ flex:1,minWidth:0 }}>
        <p style={{ margin:0,fontSize:13,fontWeight:600,color:red?"#f87171":"rgba(255,255,255,0.85)",lineHeight:1.25 }}>{label}</p>
        {sub&&<p style={{ margin:"2px 0 0",fontSize:11,color:"rgba(255,255,255,0.32)",lineHeight:1.3 }}>{sub}</p>}
      </div>
      {right&&<div style={{ flexShrink:0 }}>{right}</div>}
      {onClick&&!right&&<span style={{ color:"rgba(255,255,255,0.2)",flexShrink:0 }}>{I.Chev}</span>}
    </button>
  );
};

/* ── Sub-panel ─────────────────────────────────────────────────────────────── */
const Sub = ({ title, back, children }) => (
  <div style={{ display:"flex",flexDirection:"column",height:"100%" }}>
    <div style={{ display:"flex",alignItems:"center",gap:10,padding:"14px 18px",borderBottom:"1px solid rgba(255,255,255,0.06)",flexShrink:0 }}>
      <button onClick={back} style={{ width:30,height:30,borderRadius:8,border:"1px solid rgba(255,255,255,0.1)",background:"rgba(255,255,255,0.05)",color:"rgba(255,255,255,0.55)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,transition:"all .15s" }}
        onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(0,245,255,0.3)";e.currentTarget.style.color="#00F5FF";}}
        onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(255,255,255,0.1)";e.currentTarget.style.color="rgba(255,255,255,0.55)";}}>←</button>
      <h3 style={{ margin:0,fontSize:14.5,fontWeight:700,color:"#F0F4FF" }}>{title}</h3>
    </div>
    <div style={{ flex:1,overflowY:"auto" }} className="am-sc">{children}</div>
  </div>
);

/* ── Toast ────────────────────────────────────────────────────────────────── */
const Toast = ({ msg, type }) => msg ? (
  <div style={{ position:"fixed",bottom:24,left:"50%",transform:"translateX(-50%)",zIndex:400,padding:"11px 22px",borderRadius:12,fontSize:13,fontWeight:600,background:type==="error"?"rgba(239,68,68,0.12)":"rgba(34,197,94,0.1)",border:`1px solid ${type==="error"?"rgba(239,68,68,0.3)":"rgba(34,197,94,0.25)"}`,color:type==="error"?"#f87171":"#4ade80",backdropFilter:"blur(16px)",boxShadow:"0 8px 32px rgba(0,0,0,0.4)",animation:"toastIn .25s ease both",whiteSpace:"nowrap" }}>
    {type==="error"?"⚠ ":"✓ "}{msg}
  </div>
) : null;

/* ── Form input ───────────────────────────────────────────────────────────── */
const FInp = ({ label, value, onChange, type="text", placeholder, disabled=false }) => (
  <div style={{ marginBottom:12 }}>
    <label style={{ display:"block",fontSize:10.5,fontWeight:700,letterSpacing:".05em",textTransform:"uppercase",color:"rgba(255,255,255,0.4)",marginBottom:5 }}>{label}</label>
    <input type={type} value={value} onChange={onChange} placeholder={placeholder} disabled={disabled} style={{ width:"100%",boxSizing:"border-box",padding:"10px 13px",borderRadius:10,background:disabled?"rgba(255,255,255,0.02)":"rgba(255,255,255,0.04)",border:"1.5px solid rgba(255,255,255,0.09)",color:disabled?"rgba(255,255,255,0.3)":"#E8EAF0",fontSize:13.5,outline:"none",fontFamily:"inherit",transition:"border .2s",cursor:disabled?"not-allowed":"text" }}
    onFocus={e=>{ if(!disabled)e.target.style.border="1.5px solid rgba(0,245,255,0.42)"; }}
    onBlur={e=>e.target.style.border="1.5px solid rgba(255,255,255,0.09)"}/>
  </div>
);

/* ── Save button ──────────────────────────────────────────────────────────── */
const SaveBtn = ({ onClick, loading, label="Save Changes" }) => (
  <button onClick={onClick} disabled={loading} style={{ width:"100%",padding:"11px",borderRadius:10,border:"none",background:loading?"rgba(0,245,255,0.08)":"linear-gradient(135deg,#00C4D0,#0055BB)",color:loading?"rgba(255,255,255,0.35)":"#fff",fontWeight:700,fontSize:13.5,cursor:loading?"not-allowed":"pointer",fontFamily:"inherit",boxShadow:loading?"none":"0 4px 16px rgba(0,180,220,0.32)",marginTop:4,display:"flex",alignItems:"center",justifyContent:"center",gap:8,transition:"all .2s" }}>
    {loading?<>{I.Spin} Saving…</>:label}
  </button>
);

/* ── Help accordion ───────────────────────────────────────────────────────── */
function HelpQ({ q, a }) {
  const [o,setO]=useState(false);
  return (
    <div style={{ borderBottom:"1px solid rgba(255,255,255,0.05)",margin:"0 18px" }}>
      <button onClick={()=>setO(x=>!x)} style={{ width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"11px 0",background:"none",border:"none",cursor:"pointer",textAlign:"left",gap:10 }}>
        <span style={{ fontSize:13,fontWeight:600,color:"rgba(255,255,255,0.72)",flex:1 }}>{q}</span>
        <span style={{ color:"rgba(255,255,255,0.3)",transition:"transform .2s",display:"inline-block",transform:o?"rotate(90deg)":"none" }}>{I.Chev}</span>
      </button>
      {o&&<p style={{ fontSize:12,color:"rgba(255,255,255,0.42)",lineHeight:1.65,margin:"0 0 11px",paddingRight:22 }}>{a}</p>}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   MAIN
   ════════════════════════════════════════════════════════════════════════════ */
export default function AppMenu({ open, onClose }) {
  const { user, updateUser, refreshUser, logout, setStatus: ctxSetStatus, savedAccounts, switchAccount, forgetAccount } = useContext(AuthContext);

  const [panel,   setPanel]   = useState("home");
  const [notif,   setNotif]   = useState({ msg:true, sound:true, desktop:false, mention:true });
  const [priv,    setPriv]    = useState({ lastSeen:true, read:true, online:true });
  const [vis,     setVis]     = useState(false);
  const [toast,   setToast]   = useState({ msg:"", type:"ok" });

  // Profile form
  const [profName,    setProfName]    = useState("");
  const [profBio,     setProfBio]     = useState("");
  const [profSaving,  setProfSaving]  = useState(false);
  const [avatarBusy,  setAvatarBusy]  = useState(false);

  // Password form
  const [curPass,    setCurPass]    = useState("");
  const [newPass,    setNewPass]    = useState("");
  const [confPass,   setConfPass]   = useState("");
  const [passSaving, setPassSaving] = useState(false);

  // Status panel
  const [pickedStatus,   setPickedStatus]   = useState(user?.status || "online");
  const [pickedDuration, setPickedDuration] = useState(null); // hours or null
  const [statusSaving,   setStatusSaving]   = useState(false);

  const ref     = useRef(null);
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

  // ── Save profile ────────────────────────────────────────────────────────────
  const saveProfile=async()=>{
    if(!profName.trim()){showToast("Name cannot be empty","error");return;}
    setProfSaving(true);
    try{
      const res=await updateProfile({name:profName.trim(),bio:profBio.trim()});
      updateUser(res.data.user);
      showToast("Profile updated successfully");
    }catch(err){showToast(err.response?.data?.msg||"Failed to update","error");}
    setProfSaving(false);
  };

  // ── Upload avatar ───────────────────────────────────────────────────────────
  const handleAvatar=async(e)=>{
    const file=e.target.files?.[0]; if(!file)return;
    if(!file.type.startsWith("image/")){showToast("Please select an image","error");return;}
    if(file.size>5*1024*1024){showToast("Image must be under 5MB","error");return;}
    setAvatarBusy(true);
    try{
      const fd=new FormData(); fd.append("avatar",file);
      const res=await uploadAvatar(fd);
      updateUser({avatar:res.data.avatar});
      showToast("Photo updated");
    }catch(err){showToast(err.response?.data?.msg||"Upload failed","error");}
    setAvatarBusy(false);
    e.target.value="";
  };

  // ── Change password ─────────────────────────────────────────────────────────
  const savePassword=async()=>{
    if(!curPass||!newPass||!confPass){showToast("Please fill all fields","error");return;}
    if(newPass!==confPass){showToast("New passwords do not match","error");return;}
    if(newPass.length<6){showToast("Password must be at least 6 characters","error");return;}
    if(newPass===curPass){showToast("New password must differ from current","error");return;}
    setPassSaving(true);
    try{
      const {changePassword}=await import("../utils/api");
      await changePassword({currentPassword:curPass,newPassword:newPass});
      showToast("Password updated");
      setCurPass("");setNewPass("");setConfPass("");
      setTimeout(()=>setPanel("home"),1400);
    }catch(err){showToast(err.response?.data?.msg||"Failed to change password","error");}
    setPassSaving(false);
  };

  // ── Save status (with duration) ─────────────────────────────────────────────
  const saveStatus=async()=>{
    setStatusSaving(true);
    await ctxSetStatus(pickedStatus, pickedDuration);
    showToast(`Status set to ${STATUSES.find(s=>s.id===pickedStatus)?.label}${pickedDuration?` for ${pickedDuration}h`:""}`);
    setStatusSaving(false);
    setTimeout(()=>setPanel("home"),1000);
  };

  if(!open&&!vis)return null;
  const curStatus=STATUSES.find(s=>s.id===(user?.status||"online"));

  const passScore=newPass?[newPass.length>=8,/[A-Z]/.test(newPass),/[0-9]/.test(newPass),/[^A-Za-z0-9]/.test(newPass)].filter(Boolean).length:0;
  const passColors=["","#ef4444","#f59e0b","#3b82f6","#22c55e"];

  const CUTS=[
    {k:["Ctrl","Z"],d:"Undo"},{k:["Ctrl","Y"],d:"Redo"},
    {k:["Enter"],d:"Send message"},{k:["Shift","Enter"],d:"New line"},
    {k:["Escape"],d:"Cancel"},{k:["Ctrl","S"],d:"Save whiteboard"},
    {k:["Ctrl","V"],d:"Paste image"},{k:["/"],d:"Focus search"},
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&display=swap');
        @keyframes toastIn{from{opacity:0;transform:translateX(-50%) translateY(12px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        .am-sc::-webkit-scrollbar{width:3px}.am-sc::-webkit-scrollbar-thumb{background:rgba(0,245,255,0.14);border-radius:3px}.am-sc::-webkit-scrollbar-track{background:transparent}
        .avatar-wrap:hover .avatar-overlay{opacity:1!important}
      `}</style>

      {/* Backdrop */}
      <div onClick={onClose} style={{ position:"fixed",inset:0,zIndex:300,background:"rgba(0,0,0,0.5)",backdropFilter:"blur(4px)",opacity:vis?1:0,transition:"opacity .22s" }}/>

      {/* Drawer */}
      <div ref={ref} style={{ position:"fixed",left:0,top:0,zIndex:301,width:"min(370px,92vw)",height:"100vh",background:"rgba(8,12,22,0.99)",borderRight:"1px solid rgba(0,245,255,0.09)",boxShadow:"6px 0 48px rgba(0,0,0,0.75)",display:"flex",flexDirection:"column",fontFamily:"'Sora','Poppins',sans-serif",opacity:vis?1:0,transform:vis?"translateX(0)":"translateX(-26px)",transition:"opacity .26s ease,transform .26s ease" }}>

        {/* Top bar */}
        <div style={{ padding:"14px 18px",flexShrink:0,borderBottom:"1px solid rgba(255,255,255,0.06)",background:"linear-gradient(180deg,rgba(0,245,255,0.035) 0%,transparent 100%)" }}>
          <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:13 }}>
            <h2 style={{ margin:0,fontSize:16,fontWeight:800,color:"#F0F4FF" }}>Menu</h2>
            <button onClick={onClose} style={{ width:28,height:28,borderRadius:7,border:"1px solid rgba(255,255,255,0.09)",background:"rgba(255,255,255,0.04)",color:"rgba(255,255,255,0.45)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",transition:"all .15s" }}
              onMouseEnter={e=>{e.currentTarget.style.background="rgba(239,68,68,0.1)";e.currentTarget.style.color="#f87171";}}
              onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.04)";e.currentTarget.style.color="rgba(255,255,255,0.45)";}}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          {/* Profile card */}
          <div style={{ display:"flex",alignItems:"center",gap:11,padding:"11px 13px",borderRadius:13,background:"rgba(0,245,255,0.04)",border:"1px solid rgba(0,245,255,0.1)" }}>
            <div style={{ position:"relative",flexShrink:0 }}>
              {user?.avatar?<img src={user.avatar} style={{ width:46,height:46,borderRadius:"50%",objectFit:"cover",border:"2px solid rgba(0,245,255,0.22)" }} alt=""/>
                :<div style={{ width:46,height:46,borderRadius:"50%",background:"linear-gradient(135deg,#0e7490,#1d4ed8)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,color:"white",fontSize:17,border:"2px solid rgba(0,245,255,0.22)" }}>{(user?.name||"U").charAt(0).toUpperCase()}</div>}
              {/* Status dot */}
              <div style={{ position:"absolute",bottom:1,right:1,width:11,height:11,borderRadius:"50%",background:curStatus?.color,border:"2px solid rgba(8,12,22,0.99)",boxShadow:user?.status!=="invisible"?`0 0 5px ${curStatus?.color}`:"none" }}/>
            </div>
            <div style={{ flex:1,minWidth:0 }}>
              <p style={{ margin:0,fontSize:13.5,fontWeight:700,color:"#F0F4FF",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{user?.name||"User"}</p>
              <p style={{ margin:"2px 0 0",fontSize:10.5,color:"rgba(255,255,255,0.38)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{user?.email||""}</p>
              <button onClick={()=>setPanel("status")} style={{ display:"inline-flex",alignItems:"center",gap:5,marginTop:4,background:"none",border:"none",cursor:"pointer",padding:0,fontFamily:"inherit" }}>
                <div style={{ width:7,height:7,borderRadius:"50%",background:curStatus?.color,boxShadow:user?.status!=="invisible"?`0 0 4px ${curStatus?.color}`:"none" }}/>
                <span style={{ fontSize:11,fontWeight:600,color:curStatus?.color }}>{curStatus?.label}</span>
                <span style={{ fontSize:10,color:"rgba(255,255,255,0.3)" }}>· Change</span>
              </button>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="am-sc" style={{ flex:1,overflowY:"auto" }}>

          {/* ── HOME ── */}
          {panel==="home"&&<>
            <SHead t="Account"/>
            <MRow icon={I.User}    label="Edit Profile"       sub="Name, photo, bio"          onClick={()=>setPanel("profile")}/>
            <MRow icon={I.Lock}    label="Change Password"    sub="Update credentials"        onClick={()=>setPanel("password")}/>
            <MRow icon={I.Switch}  label="Switch Account"     sub={savedAccounts.length>0?`${savedAccounts.length} saved account${savedAccounts.length>1?"s":""}`:"No saved accounts"} onClick={()=>setPanel("accounts")}/>
            <SHead t="Status"/>
            <MRow icon={<span style={{ fontSize:13 }}>●</span>} label="Set Status" sub={`Currently: ${curStatus?.label}`} onClick={()=>setPanel("status")}/>
            <SHead t="Preferences"/>
            <MRow icon={I.Bell}    label="Notifications"      sub={notif.msg?"Messages, Sounds":"Muted"}  onClick={()=>setPanel("notif")}/>
            <MRow icon={I.Shield}  label="Privacy"            sub="Last seen, read receipts"  onClick={()=>setPanel("priv")}/>
            <MRow icon={I.Palette} label="Appearance"         sub="Theme, bubbles"            onClick={()=>setPanel("appear")}/>
            <SHead t="General"/>
            <MRow icon={I.Key}     label="Keyboard Shortcuts" sub="Speed up your workflow"    onClick={()=>setPanel("keys")}/>
            <MRow icon={I.Star}    label="What's New"         sub="Latest updates"            onClick={()=>setPanel("about")}/>
            <MRow icon={I.Help}    label="Help & Support"     sub="FAQ, contact"              onClick={()=>setPanel("help")}/>
            <MRow icon={I.Info}    label="About JourneyChat"  sub="Version 1.0.0"             onClick={()=>setPanel("about")}/>
            <div style={{ height:1,margin:"10px 18px",background:"rgba(255,255,255,0.06)" }}/>
            <MRow icon={I.Out}     label="Sign Out"           sub="Log out of your account"   onClick={()=>logout(true)} red/>
            <div style={{ height:20 }}/>
          </>}

          {/* ── STATUS PANEL (fully functional) ── */}
          {panel==="status"&&<Sub title="Set Your Status" back={()=>setPanel("home")}>
            <div style={{ padding:"16px 18px" }}>
              <p style={{ fontSize:12,color:"rgba(255,255,255,0.4)",margin:"0 0 14px",lineHeight:1.6 }}>
                Your status is visible to all your contacts. You can set it to auto-reset after a chosen time.
              </p>

              {/* Status options */}
              <p style={{ fontSize:10.5,fontWeight:700,letterSpacing:".08em",textTransform:"uppercase",color:"rgba(255,255,255,0.3)",margin:"0 0 8px" }}>Status</p>
              <div style={{ display:"flex",flexDirection:"column",gap:7,marginBottom:20 }}>
                {STATUSES.map(s=>{
                  const active=pickedStatus===s.id;
                  return (
                    <button key={s.id} onClick={()=>setPickedStatus(s.id)} style={{ display:"flex",alignItems:"center",gap:12,padding:"12px 14px",borderRadius:12,border:`1.5px solid ${active?s.color:"rgba(255,255,255,0.08)"}`,background:active?`${s.color}11`:"rgba(255,255,255,0.03)",cursor:"pointer",transition:"all .18s",textAlign:"left",boxShadow:active&&s.id!=="invisible"?`0 0 14px ${s.color}30`:"none" }}>
                      <div style={{ width:12,height:12,borderRadius:"50%",background:s.color,flexShrink:0,boxShadow:s.id!=="invisible"?`0 0 6px ${s.color}`:"none" }}/>
                      <div style={{ flex:1 }}>
                        <p style={{ margin:0,fontSize:13,fontWeight:700,color:active?s.color:"#E8EAF0" }}>{s.label}</p>
                        <p style={{ margin:0,fontSize:11,color:"rgba(255,255,255,0.35)" }}>{s.desc}</p>
                      </div>
                      {active&&<span style={{ color:s.color,flexShrink:0 }}>{I.Check}</span>}
                    </button>
                  );
                })}
              </div>

              {/* Duration picker */}
              {pickedStatus!=="online"&&(
                <>
                  <p style={{ fontSize:10.5,fontWeight:700,letterSpacing:".08em",textTransform:"uppercase",color:"rgba(255,255,255,0.3)",margin:"0 0 8px",display:"flex",alignItems:"center",gap:6 }}>{I.Clock} Auto-reset after</p>
                  <div style={{ display:"flex",flexWrap:"wrap",gap:7,marginBottom:20 }}>
                    {DURATIONS.map(d=>{
                      const active=pickedDuration===d.hours;
                      return (
                        <button key={d.label} onClick={()=>setPickedDuration(d.hours)} style={{ padding:"7px 13px",borderRadius:99,border:`1.5px solid ${active?"#00F5FF":"rgba(255,255,255,0.1)"}`,background:active?"rgba(0,245,255,0.1)":"rgba(255,255,255,0.04)",cursor:"pointer",fontSize:12,fontWeight:600,color:active?"#00F5FF":"rgba(255,255,255,0.5)",transition:"all .16s",fontFamily:"inherit",boxShadow:active?"0 0 8px rgba(0,245,255,0.2)":"none" }}>
                          {d.label}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}

              {/* Current status info */}
              {user?.statusExpiry&&(
                <div style={{ padding:"10px 13px",borderRadius:10,background:"rgba(255,230,0,0.06)",border:"1px solid rgba(255,230,0,0.18)",marginBottom:14 }}>
                  <p style={{ margin:0,fontSize:11.5,color:"#FFE600",fontWeight:600 }}>{I.Clock} Current status auto-resets at</p>
                  <p style={{ margin:"3px 0 0",fontSize:11,color:"rgba(255,255,255,0.45)" }}>
                    {new Date(user.statusExpiry).toLocaleString("en-IN",{hour:"2-digit",minute:"2-digit",day:"numeric",month:"short"})}
                  </p>
                </div>
              )}

              <SaveBtn onClick={saveStatus} loading={statusSaving} label="Apply Status"/>
            </div>
          </Sub>}

          {/* ── ACCOUNTS SWITCHER ── */}
          {panel==="accounts"&&<Sub title="Switch Account" back={()=>setPanel("home")}>
            <div style={{ padding:"14px 18px" }}>
              {savedAccounts.length===0
                ? <div style={{ textAlign:"center",padding:"2rem 0" }}>
                    <p style={{ fontSize:14,color:"#F0F4FF",margin:"0 0 6px",fontWeight:700 }}>No saved accounts</p>
                    <p style={{ fontSize:12,color:"rgba(255,255,255,0.35)" }}>Log in with "Keep me signed in" to save accounts here.</p>
                  </div>
                : <>
                    <p style={{ fontSize:12,color:"rgba(255,255,255,0.38)",marginBottom:12,lineHeight:1.6 }}>
                      Tap an account to switch instantly. Accounts with expired sessions will go to the login page.
                    </p>
                    <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
                      {savedAccounts.map(acc=>{
                        const expired=acc.expiresAt&&Date.now()>acc.expiresAt;
                        const isCurrent=acc.email===user?.email;
                        return (
                          <div key={acc.email} style={{ display:"flex",alignItems:"center",gap:10,padding:"10px 13px",borderRadius:12,background:isCurrent?"rgba(0,245,255,0.06)":"rgba(255,255,255,0.03)",border:`1px solid ${isCurrent?"rgba(0,245,255,0.22)":"rgba(255,255,255,0.07)"}`,cursor:isCurrent?"default":"pointer",transition:"all .18s" }}
                            onClick={()=>!isCurrent&&switchAccount(acc)}
                            onMouseEnter={e=>{ if(!isCurrent)e.currentTarget.style.background="rgba(0,245,255,0.05)"; }}
                            onMouseLeave={e=>{ if(!isCurrent)e.currentTarget.style.background="rgba(255,255,255,0.03)"; }}>
                            {acc.avatar?<img src={acc.avatar} style={{ width:36,height:36,borderRadius:"50%",objectFit:"cover",border:"1.5px solid rgba(0,245,255,0.2)",flexShrink:0 }} alt=""/>
                              :<div style={{ width:36,height:36,borderRadius:"50%",background:"linear-gradient(135deg,#0e7490,#1d4ed8)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,color:"white",fontSize:13,flexShrink:0 }}>{(acc.name||"?").charAt(0).toUpperCase()}</div>}
                            <div style={{ flex:1,minWidth:0 }}>
                              <p style={{ margin:0,fontSize:13,fontWeight:700,color:isCurrent?"#00F5FF":"#E8EAF0",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>
                                {acc.name} {isCurrent&&<span style={{ fontSize:10,color:"rgba(0,245,255,0.6)",fontWeight:400 }}>· current</span>}
                              </p>
                              <p style={{ margin:0,fontSize:10.5,color:expired?"#f87171":"rgba(255,255,255,0.35)" }}>
                                {expired?"Expired — click to sign in again":acc.email}
                              </p>
                            </div>
                            <button onClick={e=>{e.stopPropagation();forgetAccount(acc.email);}} title="Remove" style={{ background:"none",border:"none",cursor:"pointer",color:"rgba(255,255,255,0.22)",fontSize:13,padding:"3px 5px",borderRadius:6,flexShrink:0,transition:"color .15s" }}
                              onMouseEnter={e=>e.currentTarget.style.color="#f87171"}
                              onMouseLeave={e=>e.currentTarget.style.color="rgba(255,255,255,0.22)"}>✕</button>
                          </div>
                        );
                      })}
                    </div>
                  </>
              }
            </div>
          </Sub>}

          {/* ── EDIT PROFILE ── */}
          {panel==="profile"&&<Sub title="Edit Profile" back={()=>setPanel("home")}>
            <div style={{ padding:"18px" }}>
              <div style={{ textAlign:"center",marginBottom:18 }}>
                <div className="avatar-wrap" style={{ position:"relative",display:"inline-block",cursor:"pointer" }} onClick={()=>fileRef.current?.click()}>
                  {user?.avatar?<img src={user.avatar} style={{ width:72,height:72,borderRadius:"50%",objectFit:"cover",border:"2px solid rgba(0,245,255,0.3)",boxShadow:"0 0 18px rgba(0,245,255,0.2)" }} alt=""/>
                    :<div style={{ width:72,height:72,borderRadius:"50%",background:"linear-gradient(135deg,#0e7490,#1d4ed8)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,fontWeight:800,color:"white",border:"2px solid rgba(0,245,255,0.28)" }}>{(user?.name||"U").charAt(0).toUpperCase()}</div>}
                  <div className="avatar-overlay" style={{ position:"absolute",inset:0,borderRadius:"50%",background:"rgba(0,0,0,0.55)",display:"flex",alignItems:"center",justifyContent:"center",opacity:0,transition:"opacity .2s" }}>
                    {avatarBusy?I.Spin:<span style={{ color:"#fff",fontSize:18 }}>{I.Camera}</span>}
                  </div>
                </div>
                <input ref={fileRef} type="file" accept="image/*" style={{ display:"none" }} onChange={handleAvatar}/>
                <p style={{ fontSize:11.5,color:"#00F5FF",margin:"8px 0 0",cursor:"pointer",fontWeight:600 }} onClick={()=>fileRef.current?.click()}>{avatarBusy?"Uploading…":"Change photo"}</p>
              </div>
              <FInp label="Full Name"     value={profName} onChange={e=>setProfName(e.target.value)} placeholder={user?.name||"Your name"}/>
              <FInp label="Email Address" value={user?.email||""} onChange={()=>{}} disabled placeholder={user?.email||""}/>
              <FInp label="Bio"           value={profBio}  onChange={e=>setProfBio(e.target.value)}  placeholder="Tell people about yourself…"/>
              <SaveBtn onClick={saveProfile} loading={profSaving}/>
            </div>
          </Sub>}

          {/* ── CHANGE PASSWORD ── */}
          {panel==="password"&&<Sub title="Change Password" back={()=>setPanel("home")}>
            <div style={{ padding:"18px" }}>
              <FInp label="Current Password" value={curPass}  onChange={e=>setCurPass(e.target.value)}  type="password" placeholder="Enter current password"/>
              <FInp label="New Password"     value={newPass}  onChange={e=>setNewPass(e.target.value)}  type="password" placeholder="Min 6 chars, mix it up"/>
              <FInp label="Confirm Password" value={confPass} onChange={e=>setConfPass(e.target.value)} type="password" placeholder="Repeat new password"/>
              {newPass&&(
                <div style={{ marginBottom:14 }}>
                  <div style={{ display:"flex",gap:3,marginBottom:3 }}>
                    {[1,2,3,4].map(i=><div key={i} style={{ flex:1,height:2.5,borderRadius:99,background:i<=passScore?passColors[passScore]:"rgba(255,255,255,0.07)",transition:"background .3s" }}/>)}
                  </div>
                  <span style={{ fontSize:10,color:passColors[passScore],fontWeight:600 }}>{["","Weak","Fair","Good","Strong"][passScore]}</span>
                </div>
              )}
              <SaveBtn onClick={savePassword} loading={passSaving} label="Update Password"/>
            </div>
          </Sub>}

          {/* ── NOTIFICATIONS ── */}
          {panel==="notif"&&<Sub title="Notifications" back={()=>setPanel("home")}>
            <SHead t="Messages"/>
            <MRow icon={I.Bell}    label="Message Alerts"  sub="Notify for new messages"     right={<Toggle on={notif.msg}     onChange={v=>setNotif(p=>({...p,msg:v}))}/>}/>
            <MRow icon={I.Sound}   label="Sound"           sub="Play a sound on new message" right={<Toggle on={notif.sound}   onChange={v=>setNotif(p=>({...p,sound:v}))}/>}/>
            <MRow icon={I.Desktop} label="Desktop Popups"  sub="System-level notifications"  right={<Toggle on={notif.desktop} onChange={v=>setNotif(p=>({...p,desktop:v}))}/>}/>
            <SHead t="Mentions"/>
            <MRow icon={I.Bell}    label="@Mention Alerts" sub="Ping when @mentioned"        right={<Toggle on={notif.mention} onChange={v=>setNotif(p=>({...p,mention:v}))}/>}/>
          </Sub>}

          {/* ── PRIVACY ── */}
          {panel==="priv"&&<Sub title="Privacy" back={()=>setPanel("home")}>
            <SHead t="Visibility"/>
            <MRow icon={I.Eye}   label="Last Seen"      sub="Show when last active"           right={<Toggle on={priv.lastSeen} onChange={v=>setPriv(p=>({...p,lastSeen:v}))}/>}/>
            <MRow icon={I.Check} label="Read Receipts"  sub="Show when messages are read"    right={<Toggle on={priv.read}     onChange={v=>setPriv(p=>({...p,read:v}))}/>}/>
            <MRow icon={I.Eye}   label="Online Status"  sub="Let others see you're online"    right={<Toggle on={priv.online}   onChange={v=>setPriv(p=>({...p,online:v}))}/>}/>
            <SHead t="Security"/>
            <MRow icon={I.Lock}  label="Active Sessions" sub="Devices logged in"              onClick={()=>{}}/>
          </Sub>}

          {/* ── APPEARANCE ── */}
          {panel==="appear"&&<Sub title="Appearance" back={()=>setPanel("home")}>
            <SHead t="Theme"/>
            <div style={{ padding:"0 18px 14px" }}>
              {[{id:"dark",l:"Dark",s:"Recommended"},{id:"amoled",l:"AMOLED",s:"Pure black"}].map(t=>(
                <div key={t.id} style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 13px",borderRadius:11,marginBottom:7,background:"rgba(255,255,255,0.03)",border:`1.5px solid ${t.id==="dark"?"#00F5FF":"rgba(255,255,255,0.08)"}`,cursor:"pointer" }}>
                  <div><p style={{ margin:0,fontSize:13,fontWeight:600,color:"#F0F4FF" }}>{t.l}</p><p style={{ margin:"2px 0 0",fontSize:11,color:"rgba(255,255,255,0.35)" }}>{t.s}</p></div>
                  {t.id==="dark"&&<div style={{ width:18,height:18,borderRadius:"50%",background:"#00F5FF",boxShadow:"0 0 8px #00F5FF",display:"flex",alignItems:"center",justifyContent:"center",color:"#020d14" }}>{I.Check}</div>}
                </div>
              ))}
            </div>
          </Sub>}

          {/* ── SHORTCUTS ── */}
          {panel==="keys"&&<Sub title="Keyboard Shortcuts" back={()=>setPanel("home")}>
            <div style={{ padding:"10px 18px 20px" }}>
              {CUTS.map((s,i)=>(
                <div key={i} style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"9px 0",borderBottom:i<CUTS.length-1?"1px solid rgba(255,255,255,0.05)":"none" }}>
                  <span style={{ fontSize:12.5,color:"rgba(255,255,255,0.58)" }}>{s.d}</span>
                  <div style={{ display:"flex",gap:4 }}>{s.k.map((k,j)=><kbd key={j} style={{ padding:"3px 7px",borderRadius:5,fontSize:11,fontWeight:700,background:"rgba(0,245,255,0.08)",border:"1px solid rgba(0,245,255,0.2)",color:"#00F5FF",fontFamily:"monospace" }}>{k}</kbd>)}</div>
                </div>
              ))}
            </div>
          </Sub>}

          {/* ── ABOUT ── */}
          {panel==="about"&&<Sub title="About JourneyChat" back={()=>setPanel("home")}>
            <div style={{ padding:"22px 18px",textAlign:"center" }}>
              <div style={{ width:60,height:60,borderRadius:17,fontSize:28,display:"flex",alignItems:"center",justifyContent:"center",background:"linear-gradient(135deg,rgba(0,245,255,0.12),rgba(77,121,255,0.12))",border:"1px solid rgba(0,245,255,0.2)",margin:"0 auto 12px" }}>💬</div>
              <h3 style={{ margin:"0 0 3px",fontSize:17,fontWeight:800,color:"#F0F4FF" }}>JourneyChat</h3>
              <p style={{ margin:"0 0 14px",fontSize:11.5,color:"rgba(255,255,255,0.38)" }}>Version 1.0.0</p>
              <p style={{ fontSize:12.5,color:"rgba(255,255,255,0.42)",lineHeight:1.7,maxWidth:280,margin:"0 auto" }}>Real-time chat with video calls, whiteboards, and sticky notes. Built with React, Node.js &amp; Socket.IO.</p>
            </div>
          </Sub>}

          {/* ── HELP ── */}
          {panel==="help"&&<Sub title="Help & Support" back={()=>setPanel("home")}>
            <div style={{ paddingTop:8 }}>
              {[["How do I start a video call?","Open a contact's chat and click the 📹 video icon in the chat header."],["How does 'Keep me signed in' work?","Your session stays alive for 15 days. Without it, you'll be logged out after 24 hours."],["How do I switch accounts?","Go to Menu → Switch Account. You can store multiple accounts and tap to switch instantly."],["How do I change my status?","Go to Menu → Set Status. Pick Online, Away, Busy, or Invisible, and optionally set a timer to auto-reset."],["How do I use the whiteboard?","Open a private chat and click the 🎨 brush icon to open the shared real-time whiteboard."],["Can I use JourneyChat on mobile?","Yes — the app is fully responsive. Open it in any mobile browser."]].map(([q,a],i)=><HelpQ key={i} q={q} a={a}/>)}
              <div style={{ height:16 }}/>
            </div>
          </Sub>}

        </div>

        {/* Footer */}
        <div style={{ padding:"9px 18px",flexShrink:0,borderTop:"1px solid rgba(255,255,255,0.05)",textAlign:"center" }}>
          <p style={{ fontSize:10,color:"rgba(255,255,255,0.17)",margin:0 }}>🔒 End-to-end encrypted · JourneyChat v1.0.0</p>
        </div>
      </div>

      <Toast msg={toast.msg} type={toast.type}/>
    </>
  );
}