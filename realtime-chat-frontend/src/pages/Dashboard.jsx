import React, { useState, useContext } from "react";
import Sidebar      from "../components/Sidebar";
import ChatWindow   from "../components/chat/ChatWindow";
import VideoCall    from "../components/VideoCall";
import Whiteboard   from "../components/Whiteboard";
import StickyNotes  from "../components/StickyNotes";
import IncomingCall from "../components/IncomingCall";
import { ChatContext } from "../context/ChatContext";
import { AuthContext }  from "../context/AuthContext";

// ── Welcome screen ─────────────────────────────────────────────────────────
const WelcomeScreen = ({ user }) => (
  <div style={{
    flex:1, display:"flex", flexDirection:"column",
    alignItems:"center", justifyContent:"center",
    textAlign:"center", padding:"2rem",
  }}>
    {/* Glowing orb */}
    <div style={{ position:"relative", marginBottom:24 }}>
      <div style={{
        width:84, height:84, borderRadius:26, fontSize:36,
        display:"flex", alignItems:"center", justifyContent:"center",
        background:"linear-gradient(135deg,rgba(0,245,255,0.1),rgba(77,121,255,0.1))",
        border:"1px solid rgba(0,245,255,0.2)",
        boxShadow:"0 0 28px rgba(0,245,255,0.12)",
        animation:"float 4s ease-in-out infinite",
      }}>💬</div>
      <div style={{
        position:"absolute", inset:-8, borderRadius:34,
        border:"1px solid rgba(0,245,255,0.1)",
        animation:"spin 8s linear infinite",
      }}/>
    </div>

    <h2 style={{
      fontSize:24, fontWeight:900, marginBottom:8, letterSpacing:"-0.4px",
      background:"linear-gradient(90deg,#00F5FF,#FFE600,#4D79FF,#00F5FF)",
      backgroundSize:"250% 100%",
      WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text",
      animation:"shimmer 4s linear infinite",
    }}>
      Welcome, {user?.name?.split(" ")[0]}!
    </h2>
    <p style={{ fontSize:13, color:"rgba(255,255,255,0.4)", maxWidth:360, lineHeight:1.7, marginBottom:24 }}>
      Select a contact to start a private conversation, or explore the features below.
    </p>

    {/* Feature cards — inspired by colorful card grid references */}
    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, maxWidth:420, width:"100%" }}>
      {[
        { icon:"💬", label:"Private Chat",    desc:"End-to-end encrypted",  color:"#00F5FF", bg:"rgba(0,245,255,0.07)",  border:"rgba(0,245,255,0.18)"  },
        { icon:"🌍", label:"Global Channel",  desc:"Talk with everyone",     color:"#FFE600", bg:"rgba(255,230,0,0.07)",  border:"rgba(255,230,0,0.18)"  },
        { icon:"📹", label:"Video Calls",     desc:"HD real-time calls",     color:"#a78bfa", bg:"rgba(139,92,246,0.07)", border:"rgba(139,92,246,0.2)"  },
        { icon:"🎨", label:"Whiteboard",      desc:"Collaborate visually",   color:"#4ade80", bg:"rgba(34,197,94,0.07)",  border:"rgba(34,197,94,0.18)"  },
        { icon:"📌", label:"Sticky Notes",    desc:"Personal notes & ideas", color:"#fb923c", bg:"rgba(249,115,22,0.07)", border:"rgba(249,115,22,0.18)" },
        { icon:"❎", label:"Tic-Tac-Toe",    desc:"Play with contacts",     color:"#fb7185", bg:"rgba(251,113,133,0.07)",border:"rgba(251,113,133,0.2)" },
      ].map(f=>(
        <div key={f.label} style={{
          padding:"14px 16px", borderRadius:14,
          background:f.bg, border:`1px solid ${f.border}`,
          display:"flex", alignItems:"center", gap:11,
          textAlign:"left",
        }}>
          <span style={{ fontSize:22, flexShrink:0 }}>{f.icon}</span>
          <div>
            <p style={{ margin:0, fontSize:12.5, fontWeight:700, color:"#E8EAF0" }}>{f.label}</p>
            <p style={{ margin:0, fontSize:11, color:"rgba(255,255,255,0.35)" }}>{f.desc}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// ══════════════════════════════════════════════════════════════════════════════
const Dashboard = () => {
  const { selectedContact, isCallActive, callContact } = useContext(ChatContext);
  const { user } = useContext(AuthContext);
  const [activeTab,     setActiveTab]     = useState("chat");
  const [mobileSidebar, setMobileSidebar] = useState(false);

  const inCall = isCallActive || callContact;

  const renderMain = () => {
    if (inCall) return <VideoCall />;

    // Sticky notes is global — not contact-dependent
    if (activeTab === "stickynotes") return <StickyNotes />;

    if (!selectedContact) return <WelcomeScreen user={user} />;

    if (selectedContact._id === "global")
      return <ChatWindow contact={selectedContact} isGlobal setActiveTab={setActiveTab} />;

    if (activeTab === "whiteboard")
      return <Whiteboard contact={selectedContact} setActiveTab={setActiveTab} />;

    return <ChatWindow contact={selectedContact} setActiveTab={setActiveTab} isGlobal={false} />;
  };

  return (
    <div style={{
      height:"100vh", width:"100%", display:"flex", overflow:"hidden",
      background:"#070B14", position:"relative",
      backgroundImage:"linear-gradient(rgba(0,245,255,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(0,245,255,0.02) 1px,transparent 1px)",
      backgroundSize:"48px 48px",
    }}>
      {/* Ambient glows */}
      <div style={{position:"fixed",top:0,left:0,width:400,height:400,
        background:"radial-gradient(circle,rgba(0,245,255,0.04) 0%,transparent 70%)",pointerEvents:"none",zIndex:0}}/>
      <div style={{position:"fixed",bottom:0,right:0,width:360,height:360,
        background:"radial-gradient(circle,rgba(255,230,0,0.03) 0%,transparent 70%)",pointerEvents:"none",zIndex:0}}/>

      {/* Desktop sidebar */}
      {!inCall && (
        <div style={{ display:"flex", position:"relative", zIndex:10, flexShrink:0 }}>
          <div className="hidden md:flex" style={{ height:"100vh" }}>
            <Sidebar setActiveTab={setActiveTab} activeTab={activeTab} />
          </div>
        </div>
      )}

      {/* Mobile sidebar overlay */}
      {mobileSidebar && !inCall && (
        <>
          <div onClick={() => setMobileSidebar(false)} style={{
            position:"fixed", inset:0, zIndex:30,
            background:"rgba(0,0,0,0.65)", backdropFilter:"blur(4px)",
          }}/>
          <div style={{ position:"fixed", left:0, top:0, height:"100%", zIndex:40 }}>
            <Sidebar setActiveTab={t => { setActiveTab(t); setMobileSidebar(false); }} activeTab={activeTab} />
          </div>
        </>
      )}

      {/* Main */}
      <main style={{ flex:1, height:"100%", display:"flex", flexDirection:"column", padding:12, minWidth:0, position:"relative", zIndex:10 }}>
        {/* Mobile top bar */}
        {!inCall && (
          <div style={{
            display:"flex", alignItems:"center", justifyContent:"space-between",
            marginBottom:10, padding:"0 4px",
          }}
          className="flex md:hidden">
            <button onClick={() => setMobileSidebar(true)} style={{
              padding:"8px 12px", borderRadius:12,
              background:"rgba(255,255,255,0.06)",
              border:"1px solid rgba(255,255,255,0.08)",
              color:"#E8EAF0", fontSize:16, cursor:"pointer",
            }}>☰</button>
            <span style={{
              fontWeight:900, fontSize:15,
              background:"linear-gradient(90deg,#00F5FF,#FFE600)",
              WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text",
            }}>JourneyChat</span>
            <div style={{ width:40 }}/>
          </div>
        )}

        <IncomingCall />

        <div style={{ flex:1, minHeight:0, display:"flex" }}>
          {renderMain()}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;