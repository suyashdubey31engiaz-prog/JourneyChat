import React, { useState, useContext } from "react";
import Sidebar      from "../components/Sidebar";
import ChatWindow   from "../components/chat/ChatWindow";
import VideoCall    from "../components/VideoCall";
import Whiteboard   from "../components/Whiteboard";
import IncomingCall from "../components/IncomingCall";
import { ChatContext } from "../context/ChatContext";
import { AuthContext } from "../context/AuthContext";

// ── Welcome screen ─────────────────────────────────────────────────────────
const WelcomeScreen = ({ user }) => (
  <div style={{
    flex:1, display:"flex", flexDirection:"column",
    alignItems:"center", justifyContent:"center",
    textAlign:"center", padding:"2rem",
  }}>
    {/* Glowing orb */}
    <div style={{ position:"relative", marginBottom:28 }}>
      <div style={{
        width:88, height:88, borderRadius:28, fontSize:38,
        display:"flex", alignItems:"center", justifyContent:"center",
        background:"linear-gradient(135deg,rgba(0,245,255,0.1),rgba(77,121,255,0.1))",
        border:"1px solid rgba(0,245,255,0.2)",
        boxShadow:"0 0 30px rgba(0,245,255,0.12)",
        animation:"float 4s ease-in-out infinite",
      }}>💬</div>
      <div style={{
        position:"absolute", inset:-8, borderRadius:36,
        border:"1px solid rgba(0,245,255,0.1)",
        animation:"spin 8s linear infinite",
      }}/>
    </div>

    <h2 style={{
      fontSize:26, fontWeight:900, marginBottom:10, letterSpacing:"-0.4px",
      background:"linear-gradient(90deg,#00F5FF,#FFE600,#4D79FF,#00F5FF)",
      backgroundSize:"250% 100%",
      WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text",
      animation:"shimmer 4s linear infinite",
    }}>
      Welcome, {user?.name?.split(" ")[0]}!
    </h2>
    <p style={{ fontSize:14, color:"rgba(255,255,255,0.45)", maxWidth:380, lineHeight:1.7, marginBottom:28 }}>
      Select a contact to start a private conversation, or join Global Chat to talk with everyone.
    </p>

    {/* Feature pills */}
    <div style={{ display:"flex", flexWrap:"wrap", justifyContent:"center", gap:8 }}>
      {[["💬","Private chat"],["🌍","Global channel"],["📹","Video calls"],["🎨","Whiteboard"]].map(([icon,label])=>(
        <div key={label} style={{
          display:"flex", alignItems:"center", gap:6,
          padding:"8px 14px", borderRadius:99,
          background:"rgba(255,255,255,0.04)",
          border:"1px solid rgba(255,255,255,0.07)",
          color:"rgba(255,255,255,0.55)", fontSize:13,
        }}>{icon} {label}</div>
      ))}
    </div>
  </div>
);

const Dashboard = () => {
  const { selectedContact, isCallActive, callContact } = useContext(ChatContext);
  const { user } = useContext(AuthContext);
  const [activeTab,     setActiveTab]     = useState("chat");
  const [mobileSidebar, setMobileSidebar] = useState(false);

  const inCall = isCallActive || callContact;

  const renderMain = () => {
    if (inCall) return <VideoCall />;
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
            <Sidebar setActiveTab={setActiveTab} />
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
          <div style={{ position:"fixed", left:0, top:0, height:"100%", zIndex:40, animation:"slide-left 0.3s ease both" }}>
            <Sidebar setActiveTab={t => { setActiveTab(t); setMobileSidebar(false); }} />
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
          // Only show on mobile — inline doesn't support @media so we use a class trick
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