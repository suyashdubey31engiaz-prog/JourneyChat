import React, { useState, useContext, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { loginUser } from "../../utils/api";

/* ── Floating orbs ───────────────────────────────────────────────────────── */
const FloatingOrbs = () => (
  <div style={{ position:"absolute",inset:0,overflow:"hidden",pointerEvents:"none" }}>
    {[
      {w:200,h:200,l:"10%",t:"6%", bg:"rgba(0,245,255,0.09)", d:"0s" },
      {w:140,h:140,l:"58%",t:"10%",bg:"rgba(77,121,255,0.08)",d:"-5s"},
      {w:110,h:110,l:"18%",t:"62%",bg:"rgba(255,230,0,0.06)", d:"-9s"},
      {w:160,h:160,l:"66%",t:"55%",bg:"rgba(0,245,255,0.06)", d:"-3s"},
    ].map((o,i)=>(
      <div key={i} style={{ position:"absolute",width:o.w,height:o.h,left:o.l,top:o.t,borderRadius:"50%",background:o.bg,filter:"blur(40px)",animation:"floatOrb 18s ease-in-out infinite",animationDelay:o.d,mixBlendMode:"screen" }}/>
    ))}
  </div>
);

/* ── Device SVG ──────────────────────────────────────────────────────────── */
const DeviceIllustration = () => (
  <svg viewBox="0 0 420 290" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width:"100%",maxWidth:380,filter:"drop-shadow(0 10px 36px rgba(0,245,255,0.11))" }}>
    <rect x="60" y="132" width="196" height="122" rx="10" fill="rgba(13,25,48,0.9)" stroke="rgba(0,245,255,0.28)" strokeWidth="1.3"/>
    <rect x="68" y="140" width="180" height="106" rx="7" fill="rgba(5,12,28,0.96)"/>
    <rect x="76" y="148" width="164" height="7" rx="3" fill="rgba(0,245,255,0.1)"/>
    <rect x="76" y="159" width="104" height="4" rx="2" fill="rgba(255,255,255,0.05)"/>
    <circle cx="158" cy="204" r="21" fill="rgba(0,245,255,0.08)" stroke="rgba(0,245,255,0.3)" strokeWidth="1.2"/>
    <path d="M158 214 L158 196 M150 204 L158 196 L166 204" stroke="#00F5FF" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
    <rect x="36" y="253" width="244" height="7" rx="3.5" fill="rgba(13,25,48,0.8)" stroke="rgba(0,245,255,0.16)" strokeWidth="1"/>
    <rect x="226" y="38" width="96" height="130" rx="10" fill="rgba(13,25,48,0.9)" stroke="rgba(77,121,255,0.36)" strokeWidth="1.3"/>
    <rect x="233" y="47" width="82" height="111" rx="6" fill="rgba(5,12,28,0.96)"/>
    <rect x="240" y="55" width="68" height="7" rx="2.5" fill="rgba(77,121,255,0.13)"/>
    <circle cx="254" cy="89" r="8" fill="rgba(0,245,255,0.17)" stroke="rgba(0,245,255,0.33)" strokeWidth="1"/>
    <circle cx="274" cy="89" r="8" fill="rgba(77,121,255,0.17)" stroke="rgba(77,121,255,0.33)" strokeWidth="1"/>
    <rect x="300" y="58" width="60" height="104" rx="12" fill="rgba(13,25,48,0.9)" stroke="rgba(255,230,0,0.3)" strokeWidth="1.3"/>
    <rect x="307" y="67" width="46" height="87" rx="5" fill="rgba(5,12,28,0.96)"/>
    <circle cx="354" cy="183" r="14" fill="rgba(255,200,160,0.82)"/>
    <rect x="342" y="198" width="24" height="36" rx="6" fill="rgba(28,38,68,0.92)"/>
  </svg>
);

/* ── Eye icon ────────────────────────────────────────────────────────────── */
const EyeIcon = ({ open }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    {open ? <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></> : <><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></>}
  </svg>
);

/* ── Input ───────────────────────────────────────────────────────────────── */
function StyledInput({ label, type="text", value, onChange, placeholder, rightEl, autoComplete }) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label style={{ display:"block",fontSize:11,fontWeight:600,letterSpacing:"0.05em",marginBottom:5,color:focused?"#00F5FF":"rgba(255,255,255,0.45)",transition:"color .2s",textTransform:"uppercase" }}>{label}</label>
      <div style={{ position:"relative" }}>
        <input type={type} value={value} onChange={onChange} placeholder={placeholder} autoComplete={autoComplete}
          onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)}
          style={{ width:"100%",boxSizing:"border-box",padding:rightEl?"11px 42px 11px 14px":"11px 14px",borderRadius:10,background:focused?"rgba(0,245,255,0.03)":"rgba(255,255,255,0.03)",border:`1.5px solid ${focused?"rgba(0,245,255,0.5)":"rgba(255,255,255,0.09)"}`,boxShadow:focused?"0 0 0 3px rgba(0,245,255,0.07)":"none",color:"#E8EAF0",fontSize:13.5,fontFamily:"'Sora','Poppins',sans-serif",outline:"none",transition:"all .22s" }}/>
        {rightEl&&<div style={{ position:"absolute",right:12,top:"50%",transform:"translateY(-50%)" }}>{rightEl}</div>}
      </div>
    </div>
  );
}

/* ── Saved account chip ──────────────────────────────────────────────────── */
function AccountChip({ acc, onSwitch, onForget }) {
  const [hov, setHov] = useState(false);
  const expired = acc.expiresAt && Date.now() > acc.expiresAt;
  return (
    <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)} style={{
      display:"flex",alignItems:"center",gap:10,padding:"9px 12px",borderRadius:12,
      background:hov?"rgba(0,245,255,0.06)":"rgba(255,255,255,0.03)",
      border:`1px solid ${hov?"rgba(0,245,255,0.2)":"rgba(255,255,255,0.07)"}`,
      transition:"all .18s",cursor:"pointer",
    }} onClick={()=>onSwitch(acc)}>
      {acc.avatar
        ? <img src={acc.avatar} style={{ width:34,height:34,borderRadius:"50%",objectFit:"cover",border:"1.5px solid rgba(0,245,255,0.2)",flexShrink:0 }} alt=""/>
        : <div style={{ width:34,height:34,borderRadius:"50%",background:"linear-gradient(135deg,#0e7490,#1d4ed8)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,color:"white",fontSize:13,flexShrink:0 }}>
            {(acc.name||"?").charAt(0).toUpperCase()}
          </div>
      }
      <div style={{ flex:1,minWidth:0 }}>
        <p style={{ margin:0,fontSize:13,fontWeight:700,color:"#E8EAF0",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{acc.name}</p>
        <p style={{ margin:0,fontSize:10.5,color:expired?"#f87171":"rgba(255,255,255,0.35)" }}>
          {expired ? "Session expired — sign in again" : acc.email}
        </p>
      </div>
      <button onClick={e=>{ e.stopPropagation(); onForget(acc.email); }}
        title="Remove account"
        style={{ background:"none",border:"none",cursor:"pointer",color:"rgba(255,255,255,0.25)",fontSize:14,padding:"2px 4px",borderRadius:6,flexShrink:0,transition:"color .15s" }}
        onMouseEnter={e=>e.currentTarget.style.color="#f87171"}
        onMouseLeave={e=>e.currentTarget.style.color="rgba(255,255,255,0.25)"}>✕</button>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════ */
export default function Login() {
  const { login, savedAccounts, switchAccount, forgetAccount } = useContext(AuthContext);
  const navigate  = useNavigate();
  const location  = useLocation();
  const successMsg = location.state?.message || "";

  // Pre-fill email if redirected from account switcher
  const params    = new URLSearchParams(location.search);
  const preEmail  = params.get("email") || "";

  const [email,    setEmail]    = useState(preEmail);
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(true); // default ON
  const [loading,  setLoading]  = useState(false);
  const [err,      setErr]      = useState("");
  const [mounted,  setMounted]  = useState(false);
  const [showAccounts, setShowAccounts] = useState(savedAccounts.length > 0 && !preEmail);

  useEffect(()=>{ setTimeout(()=>setMounted(true),50); },[]);

  const submit = async (e) => {
    e.preventDefault(); setErr(""); setLoading(true);
    try {
      const res = await loginUser({ email, password, remember });
      // Pass remember flag into context so it stores the account + schedules refresh
      await login(res.data, remember);
      navigate("/dashboard");
    } catch (error) {
      setErr(error.response?.data?.msg || "Login failed. Check your credentials.");
    }
    setLoading(false);
  };

  const handleSwitch = async (acc) => {
    setLoading(true);
    await switchAccount(acc);
    setLoading(false);
    navigate("/dashboard");
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&display=swap');
        @keyframes floatOrb { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-14px)} }
        @keyframes shimmer  { 0%{background-position:0% 50%} 100%{background-position:200% 50%} }
        @keyframes slideUp  { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin     { to{transform:rotate(360deg)} }
        input::placeholder  { color:rgba(255,255,255,0.2); }
        input:-webkit-autofill{ -webkit-box-shadow:0 0 0 100px rgba(5,12,28,0.98) inset !important;-webkit-text-fill-color:#E8EAF0 !important; }
        .lp-scroll::-webkit-scrollbar{width:3px}.lp-scroll::-webkit-scrollbar-thumb{background:rgba(0,245,255,0.18);border-radius:3px}.lp-scroll::-webkit-scrollbar-track{background:transparent}
      `}</style>

      <div style={{ height:"100vh",width:"100%",display:"flex",overflow:"hidden",fontFamily:"'Sora','Poppins',sans-serif",background:"#060A13",position:"relative" }}>
        {/* Grid bg */}
        <div style={{ position:"fixed",inset:0,zIndex:0,pointerEvents:"none",backgroundImage:"linear-gradient(rgba(0,245,255,0.017) 1px,transparent 1px),linear-gradient(90deg,rgba(0,245,255,0.017) 1px,transparent 1px)",backgroundSize:"56px 56px" }}/>
        <div style={{ position:"fixed",top:0,left:0,width:420,height:420,borderRadius:"50%",background:"radial-gradient(circle,rgba(0,245,255,0.05) 0%,transparent 65%)",pointerEvents:"none",zIndex:0 }}/>
        <div style={{ position:"fixed",bottom:0,right:0,width:340,height:340,borderRadius:"50%",background:"radial-gradient(circle,rgba(77,121,255,0.06) 0%,transparent 65%)",pointerEvents:"none",zIndex:0 }}/>

        {/* ── LEFT PANEL ── */}
        <div className="lp-scroll" style={{ width:"44%",minWidth:320,height:"100vh",overflowY:"auto",display:"flex",flexDirection:"column",justifyContent:"center",padding:"1.4rem 2.6rem",position:"relative",zIndex:10,opacity:mounted?1:0,transform:mounted?"translateX(0)":"translateX(-26px)",transition:"opacity .5s ease,transform .5s ease" }}>

          {/* Logo */}
          <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:"1.2rem" }}>
            <div style={{ width:36,height:36,borderRadius:10,flexShrink:0,background:"linear-gradient(135deg,rgba(0,245,255,0.9),rgba(77,121,255,0.9))",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 0 18px rgba(0,245,255,0.32)",fontSize:17 }}>💬</div>
            <span style={{ fontSize:15.5,fontWeight:800,background:"linear-gradient(90deg,#00F5FF,#4D79FF)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text" }}>JourneyChat</span>
          </div>

          {/* ── SAVED ACCOUNTS SWITCHER ── */}
          {showAccounts && savedAccounts.length > 0 ? (
            <div style={{ animation:"slideUp .5s ease both" }}>
              <h1 style={{ fontSize:24,fontWeight:800,color:"#F0F4FF",margin:"0 0 4px",letterSpacing:"-0.5px" }}>Welcome back 👋</h1>
              <p style={{ color:"rgba(255,255,255,0.4)",fontSize:13,margin:"0 0 18px" }}>Choose an account to continue</p>

              <div style={{ display:"flex",flexDirection:"column",gap:8,marginBottom:16 }}>
                {savedAccounts.map(acc => (
                  <AccountChip key={acc.email} acc={acc} onSwitch={handleSwitch} onForget={forgetAccount}/>
                ))}
              </div>

              <button onClick={()=>setShowAccounts(false)} style={{
                width:"100%",padding:"11px",borderRadius:11,border:"1px solid rgba(255,255,255,0.1)",
                background:"rgba(255,255,255,0.04)",color:"rgba(255,255,255,0.6)",cursor:"pointer",
                fontSize:13,fontWeight:600,fontFamily:"inherit",transition:"all .2s",
              }}
              onMouseEnter={e=>{e.currentTarget.style.background="rgba(0,245,255,0.06)";e.currentTarget.style.color="#00F5FF";e.currentTarget.style.borderColor="rgba(0,245,255,0.2)";}}
              onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.04)";e.currentTarget.style.color="rgba(255,255,255,0.6)";e.currentTarget.style.borderColor="rgba(255,255,255,0.1)";}}>
                + Use a different account
              </button>
            </div>
          ) : (
            <>
              {/* Heading */}
              <div style={{ marginBottom:"1rem",animation:"slideUp .5s ease .08s both" }}>
                <h1 style={{ fontSize:26,fontWeight:800,letterSpacing:"-0.55px",color:"#F0F4FF",margin:"0 0 5px",lineHeight:1.15 }}>
                  Sign in to{" "}
                  <span style={{ background:"linear-gradient(90deg,#00F5FF,#FFE600,#4D79FF,#00F5FF)",backgroundSize:"250% 100%",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text",animation:"shimmer 4s linear infinite" }}>JourneyChat</span>
                </h1>
                <p style={{ color:"rgba(255,255,255,0.4)",fontSize:13,margin:0 }}>Your conversations, reimagined.</p>
              </div>

              {/* Back to accounts */}
              {savedAccounts.length > 0 && !preEmail && (
                <button onClick={()=>setShowAccounts(true)} style={{ display:"flex",alignItems:"center",gap:6,marginBottom:14,background:"none",border:"none",cursor:"pointer",color:"#00F5FF",fontSize:12.5,fontWeight:600,padding:0,fontFamily:"inherit" }}>
                  ← Back to saved accounts
                </button>
              )}

              {/* Alerts */}
              {successMsg && <div style={{ padding:"9px 13px",borderRadius:9,marginBottom:12,fontSize:12.5,background:"rgba(34,197,94,0.07)",border:"1px solid rgba(34,197,94,0.22)",color:"#4ade80",animation:"slideUp .35s ease both" }}>✓ {successMsg}</div>}
              {err         && <div style={{ padding:"9px 13px",borderRadius:9,marginBottom:12,fontSize:12.5,background:"rgba(239,68,68,0.07)",border:"1px solid rgba(239,68,68,0.22)",color:"#f87171",animation:"slideUp .35s ease both" }}>⚠ {err}</div>}

              {/* Form */}
              <form onSubmit={submit} style={{ display:"flex",flexDirection:"column",gap:12 }}>
                <div style={{ animation:"slideUp .5s ease .1s both" }}>
                  <StyledInput label="Email Address" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email"/>
                </div>
                <div style={{ animation:"slideUp .5s ease .16s both" }}>
                  <StyledInput label="Password" type={showPass?"text":"password"} value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" autoComplete="current-password"
                    rightEl={<button type="button" onClick={()=>setShowPass(s=>!s)} style={{ background:"none",border:"none",cursor:"pointer",color:"rgba(255,255,255,0.35)",padding:3,lineHeight:1,transition:"color .2s" }} onMouseEnter={e=>e.currentTarget.style.color="#00F5FF"} onMouseLeave={e=>e.currentTarget.style.color="rgba(255,255,255,0.35)"}><EyeIcon open={showPass}/></button>}/>
                </div>

                {/* Remember me + Forgot */}
                <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",animation:"slideUp .5s ease .2s both" }}>
                  <label style={{ display:"flex",alignItems:"center",gap:8,cursor:"pointer" }}>
                    <div onClick={()=>setRemember(r=>!r)} style={{ width:18,height:18,borderRadius:5,cursor:"pointer",flexShrink:0,background:remember?"linear-gradient(135deg,#00F5FF,#4D79FF)":"rgba(255,255,255,0.05)",border:`1.5px solid ${remember?"transparent":"rgba(255,255,255,0.12)"}`,display:"flex",alignItems:"center",justifyContent:"center",transition:"all .2s",boxShadow:remember?"0 0 9px rgba(0,245,255,0.28)":"none" }}>
                      {remember&&<svg width="9" height="9" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#020d14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                    </div>
                    <div>
                      <span style={{ fontSize:12.5,color:"rgba(255,255,255,0.6)",userSelect:"none" }}>Keep me signed in</span>
                      <p style={{ margin:0,fontSize:10,color:"rgba(255,255,255,0.28)",lineHeight:1.3 }}>You'll stay logged in for 15 days</p>
                    </div>
                  </label>
                  <a href="#" style={{ fontSize:12,color:"#00F5FF",textDecoration:"none",fontWeight:600,opacity:.8,flexShrink:0 }}>Forgot?</a>
                </div>

                {/* Submit */}
                <div style={{ animation:"slideUp .5s ease .25s both" }}>
                  <button type="submit" disabled={loading} style={{ width:"100%",padding:"12px",borderRadius:11,fontWeight:700,fontSize:14,letterSpacing:"0.02em",fontFamily:"'Sora','Poppins',sans-serif",background:loading?"rgba(0,245,255,0.08)":"linear-gradient(135deg,#00C4D0,#0055BB)",color:loading?"rgba(255,255,255,0.28)":"#fff",border:"none",cursor:loading?"not-allowed":"pointer",boxShadow:loading?"none":"0 4px 20px rgba(0,180,220,0.35), 0 0 0 1px rgba(0,245,255,0.13)",transition:"all .22s",display:"flex",alignItems:"center",justifyContent:"center",gap:8 }}
                    onMouseEnter={e=>{ if(!loading){ e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow="0 6px 26px rgba(0,180,220,0.48)"; }}}
                    onMouseLeave={e=>{ e.currentTarget.style.transform="translateY(0)"; if(!loading) e.currentTarget.style.boxShadow="0 4px 20px rgba(0,180,220,0.35), 0 0 0 1px rgba(0,245,255,0.13)"; }}>
                    {loading ? <><svg style={{ animation:"spin 1s linear infinite",width:15,height:15,flexShrink:0 }} fill="none" viewBox="0 0 24 24"><circle style={{opacity:.25}} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path style={{opacity:.75}} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Signing in…</>
                    : <>Log In <span style={{ fontSize:16 }}>→</span></>}
                  </button>
                </div>
              </form>

              {/* Social */}
              <div style={{ display:"flex",alignItems:"center",gap:11,margin:"14px 0 11px" }}>
                <div style={{ flex:1,height:1,background:"rgba(255,255,255,0.07)" }}/><span style={{ fontSize:11,color:"rgba(255,255,255,0.3)",whiteSpace:"nowrap" }}>or sign in with</span><div style={{ flex:1,height:1,background:"rgba(255,255,255,0.07)" }}/>
              </div>
              <div style={{ display:"flex",gap:9 }}>
                {[["f","Facebook","#1877F2","rgba(24,119,242,0.07)"],["𝕏","Twitter","#1DA1F2","rgba(29,161,242,0.07)"],["G","Google","#EA4335","rgba(234,67,53,0.07)"]].map(([ic,lb,col,bg])=>{
                  const [h,setH]=useState(false);
                  return <button key={lb} type="button" title={lb} onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)} style={{ display:"flex",alignItems:"center",justifyContent:"center",width:40,height:40,borderRadius:10,cursor:"pointer",background:h?bg:"rgba(255,255,255,0.04)",border:`1.5px solid ${h?col:"rgba(255,255,255,0.08)"}`,transition:"all .2s",color:h?col:"rgba(255,255,255,0.4)",fontSize:15,boxShadow:h?`0 0 12px ${col}30`:"none" }}>{ic}</button>;
                })}
              </div>

              <p style={{ marginTop:14,fontSize:13,color:"rgba(255,255,255,0.35)" }}>
                No account? <Link to="/register" style={{ color:"#00F5FF",fontWeight:700,textDecoration:"none" }}>Create one →</Link>
              </p>
              <p style={{ fontSize:10.5,color:"rgba(255,255,255,0.13)",marginTop:8 }}>🔒 End-to-end encrypted</p>
            </>
          )}
        </div>

        {/* ── RIGHT PANEL ── */}
        <div style={{ flex:1,position:"relative",zIndex:5,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"1.5rem",overflow:"hidden",opacity:mounted?1:0,transform:mounted?"translateX(0)":"translateX(34px)",transition:"opacity .6s ease .14s, transform .6s ease .14s" }}>
          <div style={{ position:"absolute",inset:"4%",borderRadius:26,background:"linear-gradient(145deg,rgba(0,245,255,0.022) 0%,rgba(77,121,255,0.038) 50%,rgba(255,230,0,0.014) 100%)",border:"1px solid rgba(0,245,255,0.065)" }}/>
          <FloatingOrbs/>

          {/* Badges */}
          <div style={{ position:"absolute",top:"10%",left:"7%",zIndex:10,padding:"6px 13px",borderRadius:99,background:"rgba(0,245,255,0.07)",border:"1px solid rgba(0,245,255,0.18)",backdropFilter:"blur(12px)",display:"flex",alignItems:"center",gap:6,animation:"floatOrb 5s ease-in-out infinite" }}>
            <div style={{ width:6,height:6,borderRadius:"50%",background:"#00F5FF",animation:"pulse 2s ease-in-out infinite",boxShadow:"0 0 6px #00F5FF" }}/>
            <span style={{ color:"#00F5FF",fontSize:11.5,fontWeight:700 }}>1,248 online</span>
          </div>
          <div style={{ position:"absolute",top:"14%",right:"7%",zIndex:10,padding:"6px 13px",borderRadius:99,background:"rgba(255,230,0,0.06)",border:"1px solid rgba(255,230,0,0.16)",backdropFilter:"blur(12px)",display:"flex",alignItems:"center",gap:6,animation:"floatOrb 6s ease-in-out infinite",animationDelay:"-3s" }}>
            <span style={{ fontSize:12 }}>💬</span><span style={{ color:"#FFE600",fontSize:11.5,fontWeight:700 }}>24M msgs today</span>
          </div>

          <div style={{ position:"relative",zIndex:10,width:"80%",maxWidth:380 }}><DeviceIllustration/></div>

          <div style={{ position:"relative",zIndex:10,textAlign:"center",marginTop:"0.9rem" }}>
            <h2 style={{ fontSize:18,fontWeight:800,color:"#F0F4FF",margin:"0 0 5px",letterSpacing:"-0.2px" }}>Connect across every device</h2>
            <p style={{ fontSize:12.5,color:"rgba(255,255,255,0.38)",margin:0,maxWidth:300,lineHeight:1.6 }}>Real-time chat, video calls &amp; whiteboards — wherever you are.</p>
          </div>

          <div style={{ display:"flex",gap:7,flexWrap:"wrap",justifyContent:"center",marginTop:"0.85rem",position:"relative",zIndex:10 }}>
            {[["💬","Private Chat"],["🌍","Global Channel"],["📹","Video Calls"],["🎨","Whiteboard"]].map(([icon,label])=>(
              <div key={label} style={{ display:"flex",alignItems:"center",gap:5,padding:"5px 11px",borderRadius:99,background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)",color:"rgba(255,255,255,0.43)",fontSize:11.5 }}>{icon} {label}</div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}