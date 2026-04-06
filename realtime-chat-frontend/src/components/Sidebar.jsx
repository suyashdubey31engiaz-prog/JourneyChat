import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { ChatContext } from "../context/ChatContext";
import AppMenu from "./AppMenu";

const initials = (name="") => name.trim().split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2)||"?";
const fmtTime = (d) => {
  if (!d) return "";
  const dt=new Date(d),now=new Date();
  if (dt.toDateString()===now.toDateString()) return dt.toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"});
  const y=new Date(now); y.setDate(y.getDate()-1);
  if (dt.toDateString()===y.toDateString()) return "Yesterday";
  return dt.toLocaleDateString("en-IN",{day:"numeric",month:"short"});
};

const Avatar = ({ name, avatar, size=40, online }) => (
  <div style={{ position:"relative", flexShrink:0 }}>
    {avatar ? <img src={avatar} alt={name} style={{ width:size,height:size,borderRadius:"50%",objectFit:"cover" }}/>
      : <div style={{ width:size,height:size,borderRadius:"50%",background:"linear-gradient(135deg,#0e7490,#1d4ed8)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,color:"white",fontSize:size>38?14:12 }}>{initials(name)}</div>}
    <span style={{ position:"absolute",bottom:0,right:0,width:size>38?11:9,height:size>38?11:9,borderRadius:"50%",background:online?"#39FF14":"rgba(255,255,255,0.18)",boxShadow:online?"0 0 6px #39FF14":"none",border:"2px solid #070B14",transition:"background .3s,box-shadow .3s" }}/>
  </div>
);

const ContactRow = ({ contact, isActive, onClick, lastMsg, unread, online }) => {
  const [hov,setHov]=useState(false);
  const preview=!lastMsg?"":lastMsg.type==="image"?"📷 Photo":lastMsg.type==="voice"?"🎙️ Voice":lastMsg.type==="file"?`📎 ${lastMsg.fileName||"File"}`:(lastMsg.content||"").slice(0,42);
  return (
    <div onClick={onClick} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)} style={{ display:"flex",alignItems:"center",gap:10,padding:"10px 12px",margin:"0 6px 2px",borderRadius:12,cursor:"pointer",transition:"all .15s",background:isActive?"rgba(0,245,255,0.09)":hov?"rgba(0,245,255,0.04)":"transparent",border:`1px solid ${isActive?"rgba(0,245,255,0.25)":hov?"rgba(0,245,255,0.08)":"transparent"}` }}>
      <Avatar name={contact.name} avatar={contact.avatar} online={online}/>
      <div style={{ flex:1,minWidth:0 }}>
        <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",gap:6,marginBottom:2 }}>
          <p style={{ fontSize:13.5,fontWeight:unread>0?700:600,margin:0,color:isActive?"#00F5FF":"#E8EAF0",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",textShadow:isActive?"0 0 8px rgba(0,245,255,0.4)":"none" }}>{contact.name}</p>
          {lastMsg?.timestamp&&<span style={{ fontSize:10,flexShrink:0,color:unread>0?"#00F5FF":"rgba(255,255,255,0.3)",fontWeight:unread>0?700:400 }}>{fmtTime(lastMsg.timestamp||lastMsg.createdAt)}</span>}
        </div>
        <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",gap:6 }}>
          <p style={{ fontSize:12,margin:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",color:unread>0?"rgba(255,255,255,0.7)":"rgba(255,255,255,0.35)",fontWeight:unread>0?600:400 }}>{preview||<em style={{ opacity:.45 }}>Start chatting</em>}</p>
          {unread>0&&<span style={{ minWidth:19,height:19,padding:"0 5px",borderRadius:99,background:"#00F5FF",color:"#020d14",fontSize:10,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 0 8px rgba(0,245,255,0.55)",flexShrink:0 }}>{unread>99?"99+":unread}</span>}
        </div>
      </div>
    </div>
  );
};

const FeatureRow = ({ icon, label, sub, color, bg, border, onClick, isActive }) => {
  const [hov,setHov]=useState(false);
  return (
    <div onClick={onClick} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)} style={{ display:"flex",alignItems:"center",gap:10,padding:"9px 12px",margin:"0 6px 3px",borderRadius:12,cursor:"pointer",transition:"all .18s",background:isActive||hov?bg:"transparent",border:`1px solid ${isActive?color:hov?border:"transparent"}`,boxShadow:isActive?`0 0 14px ${color}22`:"none" }}>
      <div style={{ width:36,height:36,borderRadius:10,fontSize:16,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,background:isActive||hov?bg:"rgba(255,255,255,0.04)",border:`1px solid ${isActive?color:border}`,boxShadow:isActive?`0 0 10px ${color}33`:"none",transition:"all .18s" }}>{icon}</div>
      <div style={{ minWidth:0 }}>
        <p style={{ fontSize:13.5,fontWeight:600,margin:0,color:isActive?color:"#E8EAF0",textShadow:isActive?`0 0 8px ${color}55`:"none",transition:"all .18s" }}>{label}</p>
        <p style={{ fontSize:11,margin:0,color:"rgba(255,255,255,0.32)" }}>{sub}</p>
      </div>
    </div>
  );
};

export default function Sidebar({ setActiveTab, activeTab }) {
  const { user, logout } = useContext(AuthContext);
  const { contacts, onlineUsers, selectedContact, messages, unreadCounts, fetchMessages, selectGlobal } = useContext(ChatContext);
  const [search,setSearch]=useState(""); const [sfocus,setSfocus]=useState(false); const [menuOpen,setMenuOpen]=useState(false);
  const filtered=contacts.filter(c=>c.name.toLowerCase().includes(search.toLowerCase())||c.email.toLowerCase().includes(search.toLowerCase()));
  const getMeta=(id)=>({ lastMsg:(messages[id]||[]).slice(-1)[0]||null, unread:unreadCounts[id]||0 });

  return (
    <>
      <style>{`.sb-sc::-webkit-scrollbar{width:3px}.sb-sc::-webkit-scrollbar-thumb{background:rgba(0,245,255,0.15);border-radius:3px}.sb-sc::-webkit-scrollbar-track{background:transparent}`}</style>
      <AppMenu open={menuOpen} onClose={()=>setMenuOpen(false)} user={user} logout={logout}/>
      <div style={{ width:295,height:"100%",display:"flex",flexDirection:"column",flexShrink:0,background:"rgba(8,12,22,0.98)",borderRight:"1px solid rgba(255,255,255,0.06)" }}>

        {/* Header */}
        <div style={{ padding:"13px 14px 11px",borderBottom:"1px solid rgba(255,255,255,0.06)",flexShrink:0 }}>
          <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10 }}>
            {/* ── HAMBURGER → opens AppMenu ── */}
            <button onClick={()=>setMenuOpen(true)} title="Menu"
              style={{ display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"center",gap:4.5,width:36,height:36,borderRadius:10,border:"none",background:"rgba(255,255,255,0.05)",cursor:"pointer",transition:"all .18s",flexShrink:0 }}
              onMouseEnter={e=>{e.currentTarget.style.background="rgba(0,245,255,0.1)";e.currentTarget.style.boxShadow="0 0 14px rgba(0,245,255,0.18)";}}
              onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.05)";e.currentTarget.style.boxShadow="none";}}>
              <span style={{ width:17,height:2,borderRadius:99,background:"rgba(255,255,255,0.55)",display:"block",transition:"all .2s" }}/>
              <span style={{ width:12,height:2,borderRadius:99,background:"rgba(255,255,255,0.4)",display:"block",transition:"all .2s" }}/>
              <span style={{ width:17,height:2,borderRadius:99,background:"rgba(255,255,255,0.55)",display:"block",transition:"all .2s" }}/>
            </button>
            {/* Logo */}
            <div style={{ display:"flex",alignItems:"center",gap:7 }}>
              <div style={{ width:27,height:27,borderRadius:8,fontSize:13,display:"flex",alignItems:"center",justifyContent:"center",background:"linear-gradient(135deg,#0e7490,#1d4ed8)",boxShadow:"0 0 12px rgba(0,245,255,0.25)" }}>💬</div>
              <span style={{ fontWeight:900,fontSize:14.5,background:"linear-gradient(90deg,#00F5FF,#FFE600)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text" }}>JourneyChat</span>
            </div>
            {/* Compose */}
            <button title="New conversation" style={{ width:36,height:36,borderRadius:10,border:"1px solid rgba(255,255,255,0.08)",background:"rgba(255,255,255,0.04)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",transition:"all .18s",fontSize:15,color:"rgba(255,255,255,0.38)" }}
              onMouseEnter={e=>{e.currentTarget.style.background="rgba(0,245,255,0.08)";e.currentTarget.style.borderColor="rgba(0,245,255,0.22)";e.currentTarget.style.color="#00F5FF";}}
              onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.04)";e.currentTarget.style.borderColor="rgba(255,255,255,0.08)";e.currentTarget.style.color="rgba(255,255,255,0.38)";}}>✏️</button>
          </div>
          {/* Profile pill */}
          <div onClick={()=>setMenuOpen(true)} style={{ display:"flex",alignItems:"center",gap:10,padding:"8px 11px",borderRadius:11,background:"rgba(0,245,255,0.03)",border:"1px solid rgba(0,245,255,0.08)",cursor:"pointer",transition:"all .18s" }}
            onMouseEnter={e=>{e.currentTarget.style.background="rgba(0,245,255,0.06)";e.currentTarget.style.borderColor="rgba(0,245,255,0.18)";}}
            onMouseLeave={e=>{e.currentTarget.style.background="rgba(0,245,255,0.03)";e.currentTarget.style.borderColor="rgba(0,245,255,0.08)";}}>
            <Avatar name={user?.name||""} avatar={user?.avatar||""} size={33} online={true}/>
            <div style={{ minWidth:0,flex:1 }}>
              <p style={{ fontSize:13,fontWeight:700,color:"#E8EAF0",margin:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{user?.name}</p>
              <p style={{ fontSize:10,margin:0,color:"#39FF14",textShadow:"0 0 6px #39FF14" }}>● Online</p>
            </div>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="2" strokeLinecap="round" style={{ flexShrink:0 }}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
          </div>
        </div>

        {/* Search */}
        <div style={{ padding:"8px 12px",borderBottom:"1px solid rgba(255,255,255,0.05)",flexShrink:0 }}>
          <div style={{ position:"relative" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.28)" strokeWidth="2" style={{ position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",pointerEvents:"none" }}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search contacts…" onFocus={()=>setSfocus(true)} onBlur={()=>setSfocus(false)} style={{ width:"100%",boxSizing:"border-box",paddingLeft:30,paddingRight:12,paddingTop:8,paddingBottom:8,borderRadius:10,fontSize:12,fontFamily:"'Sora','Poppins',sans-serif",background:"rgba(255,255,255,0.05)",border:`1px solid ${sfocus?"rgba(0,245,255,0.3)":"rgba(255,255,255,0.07)"}`,color:"#E8EAF0",outline:"none",transition:"border .2s" }}/>
          </div>
        </div>

        {/* List */}
        <div className="sb-sc" style={{ flex:1,overflowY:"auto",paddingTop:8 }}>
          {!search&&<>
            <p style={{ fontSize:9.5,fontWeight:700,textTransform:"uppercase",letterSpacing:".12em",padding:"2px 16px 6px",color:"rgba(255,255,255,0.22)" }}>Features</p>
            <FeatureRow icon="🌍" label="Global Chat"  sub="Open to everyone"       color="#00F5FF" bg="rgba(0,245,255,0.06)"  border="rgba(0,245,255,0.15)"  isActive={selectedContact?._id==="global"&&activeTab==="chat"} onClick={()=>{selectGlobal();setActiveTab("chat");}}/>
            <FeatureRow icon="📌" label="Sticky Notes" sub="Personal notes & ideas" color="#fb923c" bg="rgba(249,115,22,0.07)" border="rgba(249,115,22,0.18)" isActive={activeTab==="stickynotes"} onClick={()=>setActiveTab("stickynotes")}/>
            <div style={{ height:1,margin:"6px 12px 8px",background:"rgba(255,255,255,0.05)" }}/>
          </>}
          <p style={{ fontSize:9.5,fontWeight:700,textTransform:"uppercase",letterSpacing:".12em",padding:"2px 16px 6px",color:"rgba(255,255,255,0.22)" }}>{search?`Results — ${filtered.length}`:`Direct — ${contacts.length}`}</p>
          {filtered.length===0
            ? <p style={{ fontSize:12,padding:"20px 16px",textAlign:"center",color:"rgba(255,255,255,0.3)" }}>{search?"No contacts match":"No other users yet"}</p>
            : filtered.map(c=>{ const {lastMsg,unread}=getMeta(c._id); return <ContactRow key={c._id} contact={c} isActive={selectedContact?._id===c._id&&activeTab!=="stickynotes"} onClick={()=>{fetchMessages(c);setActiveTab("chat");}} lastMsg={lastMsg} unread={unread} online={onlineUsers.has(String(c._id))}/>; })
          }
        </div>

        {/* Footer */}
        <div style={{ padding:"8px 14px",borderTop:"1px solid rgba(255,255,255,0.05)",flexShrink:0 }}>
          <p style={{ fontSize:10,textAlign:"center",color:"rgba(255,255,255,0.15)",margin:0 }}>🔒 End-to-end encrypted · <span style={{ color:"#00F5FF" }}>JourneyChat</span></p>
        </div>
      </div>
    </>
  );
}