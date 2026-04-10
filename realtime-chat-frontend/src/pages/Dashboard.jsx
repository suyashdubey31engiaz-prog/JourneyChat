// src/pages/Dashboard.jsx
import React, { useState, useContext } from "react";
import Sidebar      from "../components/Sidebar";
import ChatWindow   from "../components/chat/ChatWindow";
import VideoCall    from "../components/VideoCall";
import Whiteboard   from "../components/Whiteboard";
import StickyNotes  from "../components/StickyNotes";
import IncomingCall from "../components/IncomingCall";
import { ChatContext } from "../context/ChatContext";
import { AuthContext }  from "../context/AuthContext";

const CardFan = () => (
  <div style={{ position:"relative", width:220, height:140, marginBottom:32, marginTop:8 }}>
    <div style={{
      position:"absolute", width:180, height:110, borderRadius:18,
      background:"linear-gradient(135deg,rgba(139,92,246,0.18),rgba(139,92,246,0.06))",
      border:"1.5px solid rgba(139,92,246,0.3)",
      boxShadow:"0 0 20px rgba(139,92,246,0.15)",
      transform:"rotate(-10deg) translateY(14px) translateX(-10px)",
      left:0, top:0, zIndex:1, overflow:"hidden",
    }}>
      <div style={{ position:"absolute",right:-6,bottom:-6,width:"50%",height:"120%",
        backgroundImage:"radial-gradient(circle,rgba(139,92,246,0.5) 1.2px,transparent 1.2px)",
        backgroundSize:"9px 9px",opacity:0.15 }}/>
    </div>
    <div style={{
      position:"absolute", width:180, height:110, borderRadius:18,
      background:"linear-gradient(135deg,rgba(255,230,0,0.15),rgba(255,179,0,0.06))",
      border:"1.5px solid rgba(255,230,0,0.35)",
      boxShadow:"0 0 22px rgba(255,230,0,0.15)",
      transform:"rotate(-4deg) translateY(8px) translateX(16px)",
      left:0, top:0, zIndex:2, overflow:"hidden",
    }}>
      <div style={{ position:"absolute",right:-6,bottom:-6,width:"50%",height:"120%",
        backgroundImage:"radial-gradient(circle,rgba(255,230,0,0.6) 1.2px,transparent 1.2px)",
        backgroundSize:"9px 9px",opacity:0.15 }}/>
      <div style={{ position:"absolute",bottom:14,left:12,display:"flex",gap:5,opacity:0.4 }}>
        {[0,1,2,3].map(g=><div key={g} style={{ display:"flex",gap:2 }}>
          {[0,1,2,3].map(d=><div key={d} style={{ width:3,height:3,borderRadius:"50%",background:"#FFE600" }}/>)}
        </div>)}
      </div>
    </div>
    <div style={{
      position:"absolute", width:182, height:112, borderRadius:18,
      background:"linear-gradient(135deg,rgba(0,245,255,0.12),rgba(0,180,220,0.06))",
      border:"1.5px solid rgba(0,245,255,0.4)",
      boxShadow:"0 0 28px rgba(0,245,255,0.18), 0 8px 32px rgba(0,0,0,0.3)",
      transform:"rotate(3deg) translateY(0px) translateX(30px)",
      left:0, top:0, zIndex:3, overflow:"hidden",
    }}>
      <div style={{ position:"absolute",inset:0,
        background:"linear-gradient(125deg,transparent 30%,rgba(255,255,255,0.07) 50%,transparent 70%)",
        backgroundSize:"300% 300%",animation:"holographic 4s linear infinite",pointerEvents:"none" }}/>
      <div style={{ position:"absolute",right:-6,bottom:-6,width:"50%",height:"120%",
        backgroundImage:"radial-gradient(circle,rgba(0,245,255,0.6) 1.2px,transparent 1.2px)",
        backgroundSize:"9px 9px",opacity:0.18 }}/>
      <div style={{ position:"absolute",top:10,left:12,opacity:0.7 }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00F5FF" strokeWidth="2">
          <path d="M9 17c2-2 2-6 0-8M12 19.5c3.3-3.3 3.3-9.7 0-13M6 14.5c1-1 1-4 0-5"/>
        </svg>
      </div>
      <div style={{ position:"absolute",top:8,right:12,display:"flex",alignItems:"center" }}>
        <div style={{ width:20,height:20,borderRadius:"50%",background:"rgba(0,245,255,0.6)",marginRight:-6 }}/>
        <div style={{ width:20,height:20,borderRadius:"50%",background:"rgba(255,230,0,0.5)" }}/>
      </div>
      <div style={{ position:"absolute",bottom:14,left:12,display:"flex",gap:5,opacity:0.6 }}>
        {[0,1,2,3].map(g=><div key={g} style={{ display:"flex",gap:2 }}>
          {[0,1,2,3].map(d=><div key={d} style={{ width:3,height:3,borderRadius:"50%",background:"#00F5FF" }}/>)}
        </div>)}
      </div>
    </div>
  </div>
);

const FEATURES = [
  { icon:"💬", label:"Private Chat",  desc:"End-to-end encrypted",  bg:"rgba(0,245,255,0.07)",   border:"rgba(0,245,255,0.22)"   },
  { icon:"🌍", label:"Global Chat",   desc:"Talk with everyone",     bg:"rgba(255,230,0,0.07)",   border:"rgba(255,230,0,0.22)"   },
  { icon:"📹", label:"Video Calls",   desc:"HD real-time calls",     bg:"rgba(139,92,246,0.08)",  border:"rgba(139,92,246,0.25)"  },
  { icon:"🎨", label:"Whiteboard",    desc:"Collaborate visually",   bg:"rgba(34,197,94,0.07)",   border:"rgba(34,197,94,0.22)"   },
  { icon:"📌", label:"Sticky Notes",  desc:"Personal notes & ideas", bg:"rgba(249,115,22,0.07)",  border:"rgba(249,115,22,0.22)"  },
  { icon:"🎮", label:"Tic-Tac-Toe",  desc:"Play with contacts",      bg:"rgba(251,113,133,0.07)", border:"rgba(251,113,133,0.22)" },
];

const WelcomeScreen = ({ user }) => (
  <div style={{ flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",textAlign:"center",padding:"2rem",overflowY:"auto" }}>
    <CardFan />
    <h2 className="gradient-text" style={{ fontSize:26,fontWeight:900,marginBottom:8,letterSpacing:"-0.4px",fontFamily:"var(--t-font)" }}>
      Welcome, {user?.name?.split(" ")[0]}!
    </h2>
    <p style={{ fontSize:13,color:"var(--t-text2)",maxWidth:360,lineHeight:1.7,marginBottom:28,fontFamily:"var(--t-font)" }}>
      Select a contact to start chatting, or explore the features below.
    </p>
    <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,maxWidth:440,width:"100%" }}>
      {FEATURES.map((f,i)=>(
        <div key={f.label} style={{
          position:"relative",padding:"14px 16px",borderRadius:16,overflow:"hidden",
          background:f.bg,border:`1px solid ${f.border}`,
          transition:"all 0.22s cubic-bezier(.34,1.56,.64,1)",
          animation:`slide-up 0.4s ease ${i*0.06}s both`,
          fontFamily:"var(--t-font)",
        }}>
          <div style={{ position:"absolute",right:-4,bottom:-4,width:"40%",height:"110%",
            backgroundImage:`radial-gradient(circle,${f.border} 1.2px,transparent 1.2px)`,
            backgroundSize:"8px 8px",opacity:0.5,pointerEvents:"none" }}/>
          <div style={{ position:"relative",zIndex:1,display:"flex",alignItems:"center",gap:10 }}>
            <span style={{ fontSize:22,flexShrink:0 }}>{f.icon}</span>
            <div>
              <p style={{ margin:0,fontSize:12.5,fontWeight:700,color:"var(--t-text)" }}>{f.label}</p>
              <p style={{ margin:0,fontSize:11,color:"var(--t-text3)" }}>{f.desc}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const Dashboard = () => {
  const { selectedContact, isCallActive, callContact } = useContext(ChatContext);
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState("chat");
  const [mobileSidebar, setMobileSidebar] = useState(false);
  const inCall = isCallActive || callContact;

  const renderMain = () => {
    if (inCall) return <VideoCall />;
    if (activeTab === "stickynotes") return <StickyNotes />;
    if (!selectedContact) return <WelcomeScreen user={user} />;
    if (selectedContact._id === "global")
      return <ChatWindow contact={selectedContact} isGlobal setActiveTab={setActiveTab} />;
    if (activeTab === "whiteboard")
      return <Whiteboard contact={selectedContact} setActiveTab={setActiveTab} />;
    return <ChatWindow contact={selectedContact} setActiveTab={setActiveTab} isGlobal={false} />;
  };

  return (
    <div className="dashboard-bg" style={{ height:"100vh",width:"100%",display:"flex",overflow:"hidden",position:"relative" }}>
      <div style={{position:"fixed",top:0,left:0,width:400,height:400,background:"radial-gradient(circle,var(--t-card-glow) 0%,transparent 70%)",pointerEvents:"none",zIndex:0,opacity:0.6}}/>
      <div style={{position:"fixed",bottom:0,right:0,width:360,height:360,background:"radial-gradient(circle,var(--t-glow2) 0%,transparent 70%)",pointerEvents:"none",zIndex:0,opacity:0.4}}/>
      {!inCall && (
        <div style={{ display:"flex",position:"relative",zIndex:10,flexShrink:0 }}>
          <div className="hidden md:flex" style={{ height:"100vh" }}>
            <Sidebar setActiveTab={setActiveTab} activeTab={activeTab} />
          </div>
        </div>
      )}
      {mobileSidebar && !inCall && (
        <>
          <div onClick={()=>setMobileSidebar(false)} style={{ position:"fixed",inset:0,zIndex:30,background:"rgba(0,0,0,0.65)",backdropFilter:"blur(4px)" }}/>
          <div style={{ position:"fixed",left:0,top:0,height:"100%",zIndex:40 }}>
            <Sidebar setActiveTab={t=>{setActiveTab(t);setMobileSidebar(false);}} activeTab={activeTab} />
          </div>
        </>
      )}
      <main style={{ flex:1,height:"100%",display:"flex",flexDirection:"column",padding:12,minWidth:0,position:"relative",zIndex:10 }}>
        {!inCall && (
          <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10,padding:"0 4px" }} className="flex md:hidden">
            <button onClick={()=>setMobileSidebar(true)} style={{ padding:"8px 12px",borderRadius:12,background:"rgba(255,255,255,0.06)",border:"1px solid var(--t-border)",color:"var(--t-text)",fontSize:16,cursor:"pointer" }}>☰</button>
            <span className="gradient-text" style={{ fontWeight:900,fontSize:15,fontFamily:"var(--t-font)" }}>JourneyChat</span>
            <div style={{ width:40 }}/>
          </div>
        )}
        <IncomingCall />
        <div style={{ flex:1,minHeight:0,display:"flex" }}>{renderMain()}</div>
      </main>
    </div>
  );
};

export default Dashboard;