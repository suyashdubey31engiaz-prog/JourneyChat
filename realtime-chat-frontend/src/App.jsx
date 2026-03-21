import React, { useContext } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login     from "./components/auth/Login";
import Register  from "./components/auth/Register";
import Dashboard from "./pages/Dashboard";
import { ChatProvider } from "./context/ChatContext";
import { AuthContext }  from "./context/AuthContext";

const LoadingScreen = () => (
  <div style={{
    width:"100%", height:"100vh",
    background:"#070B14",
    display:"flex", flexDirection:"column",
    alignItems:"center", justifyContent:"center", gap:24,
  }}>
    {/* Animated logo */}
    <div style={{ position:"relative" }}>
      <div style={{
        width:72, height:72, borderRadius:22, fontSize:32,
        display:"flex", alignItems:"center", justifyContent:"center",
        background:"linear-gradient(135deg,#0891b2,#1d4ed8)",
        boxShadow:"0 0 40px rgba(0,245,255,0.5), 0 0 100px rgba(0,245,255,0.15)",
        animation:"float 4s ease-in-out infinite",
        position:"relative", zIndex:2,
      }}>💬</div>
      {/* Outer ring */}
      <div style={{
        position:"absolute", inset:-10, borderRadius:32,
        border:"1.5px solid transparent",
        borderTop:"1.5px solid rgba(0,245,255,0.6)",
        borderRight:"1.5px solid rgba(0,245,255,0.2)",
        animation:"spin 1.4s linear infinite",
      }}/>
      {/* Inner ring */}
      <div style={{
        position:"absolute", inset:-18, borderRadius:40,
        border:"1px solid transparent",
        borderTop:"1px solid rgba(255,230,0,0.4)",
        animation:"spin 2.5s linear infinite reverse",
      }}/>
    </div>

    <div style={{ textAlign:"center" }}>
      <h1 style={{
        fontSize:22, fontWeight:900, letterSpacing:"-0.3px", marginBottom:6,
        background:"linear-gradient(90deg,#00F5FF,#FFE600,#4D79FF,#00F5FF)",
        backgroundSize:"300% 100%",
        WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text",
        animation:"shimmer 4s linear infinite",
      }}>JourneyChat</h1>
      <p style={{ color:"rgba(255,255,255,0.35)", fontSize:13 }}>Loading your account…</p>
    </div>

    <div style={{ display:"flex", gap:8 }}>
      {[0,0.2,0.4].map((d,i) => (
        <div key={i} style={{
          width:7, height:7, borderRadius:"50%",
          background:"#00F5FF",
          animation:`typing 1.4s ease-in-out infinite`,
          animationDelay:`${d}s`,
        }}/>
      ))}
    </div>
  </div>
);

function App() {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <LoadingScreen />;

  return (
    <Router>
      <Routes>
        <Route path="/"          element={<Navigate to={user ? "/dashboard" : "/login"} />} />
        <Route path="/login"     element={!user ? <Login />    : <Navigate to="/dashboard" />} />
        <Route path="/register"  element={!user ? <Register /> : <Navigate to="/dashboard" />} />
        <Route path="/dashboard" element={
          user ? <ChatProvider><Dashboard /></ChatProvider> : <Navigate to="/login" />
        } />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;