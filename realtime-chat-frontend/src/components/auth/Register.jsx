import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../../utils/api";

/* ── Floating shapes ──────────────────────────────────────────────── */
const FloatingShapes = () => (
  <div style={{ position:"absolute",inset:0,overflow:"hidden",pointerEvents:"none" }}>
    {[
      { w:200,h:200,l:"8%", t:"8%", bg:"rgba(0,245,255,0.09)",  d:"0s"  },
      { w:150,h:150,l:"58%",t:"10%",bg:"rgba(255,230,0,0.07)",  d:"-4s" },
      { w:170,h:170,l:"14%",t:"60%",bg:"rgba(77,121,255,0.08)", d:"-8s" },
      { w:120,h:120,l:"70%",t:"58%",bg:"rgba(0,245,255,0.06)",  d:"-12s"},
    ].map((o,i)=>(
      <div key={i} style={{
        position:"absolute",width:o.w,height:o.h,left:o.l,top:o.t,
        borderRadius:"50%",background:o.bg,filter:"blur(38px)",
        animation:`floatOrb 18s ease-in-out infinite`,animationDelay:o.d,mixBlendMode:"screen",
      }}/>
    ))}
  </div>
);

/* ── Chat preview (compact) ─────────────────────────────────────── */
const ChatPreview = () => {
  const msgs = [
    { side:"left",  text:"Just joined JourneyChat 🎉", t:"10:21 AM", a:"A" },
    { side:"right", text:"Welcome! Video call tonight?", t:"10:22 AM", a:"B" },
    { side:"left",  text:"Absolutely! Sending whiteboard link 📝", t:"10:22 AM", a:"A" },
  ];
  return (
    <div style={{ width:"100%",maxWidth:360,position:"relative",zIndex:10 }}>
      <div style={{
        background:"rgba(8,15,30,0.9)",border:"1px solid rgba(0,245,255,0.14)",
        borderRadius:20,overflow:"hidden",
        boxShadow:"0 18px 56px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.03)",
      }}>
        {/* Header */}
        <div style={{ padding:"12px 16px",background:"linear-gradient(90deg,rgba(0,245,255,0.06),rgba(77,121,255,0.06))",
          borderBottom:"1px solid rgba(255,255,255,0.05)",display:"flex",alignItems:"center",gap:9 }}>
          <div style={{ width:30,height:30,borderRadius:9,background:"linear-gradient(135deg,#00C4D0,#0055BB)",
            display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,
            boxShadow:"0 0 11px rgba(0,245,255,0.28)" }}>💬</div>
          <div>
            <div style={{ fontSize:12.5,fontWeight:700,color:"#F0F4FF" }}>Global Chat</div>
            <div style={{ display:"flex",alignItems:"center",gap:5,marginTop:1 }}>
              <div style={{ width:5,height:5,borderRadius:"50%",background:"#22c55e",boxShadow:"0 0 5px #22c55e" }}/>
              <span style={{ fontSize:10,color:"rgba(255,255,255,0.4)" }}>1,248 online</span>
            </div>
          </div>
          <div style={{ marginLeft:"auto",display:"flex",gap:5 }}>
            {["📹","🎨"].map(icon=>(
              <div key={icon} style={{ width:26,height:26,borderRadius:7,display:"flex",alignItems:"center",
                justifyContent:"center",fontSize:11,background:"rgba(255,255,255,0.05)",
                border:"1px solid rgba(255,255,255,0.07)" }}>{icon}</div>
            ))}
          </div>
        </div>
        {/* Messages */}
        <div style={{ padding:"12px 13px",display:"flex",flexDirection:"column",gap:9 }}>
          {msgs.map((m,i)=>(
            <div key={i} style={{ display:"flex",flexDirection:m.side==="right"?"row-reverse":"row",alignItems:"flex-end",gap:6 }}>
              <div style={{
                width:22,height:22,borderRadius:6,flexShrink:0,
                background:m.side==="left"
                  ?"linear-gradient(135deg,rgba(0,245,255,0.8),rgba(0,150,200,0.8))"
                  :"linear-gradient(135deg,rgba(255,230,0,0.8),rgba(255,160,0,0.8))",
                display:"flex",alignItems:"center",justifyContent:"center",
                fontSize:9,fontWeight:800,color:"#020d14",
              }}>{m.a}</div>
              <div style={{
                maxWidth:"72%",padding:"8px 11px",
                borderRadius:m.side==="right"?"13px 13px 3px 13px":"13px 13px 13px 3px",
                background:m.side==="left"?"rgba(0,245,255,0.07)":"rgba(77,121,255,0.09)",
                border:`1px solid ${m.side==="left"?"rgba(0,245,255,0.11)":"rgba(77,121,255,0.13)"}`,
              }}>
                <p style={{ margin:0,fontSize:11.5,color:"#E8EAF0",lineHeight:1.5 }}>{m.text}</p>
                <p style={{ margin:"3px 0 0",fontSize:9,color:"rgba(255,255,255,0.27)",textAlign:m.side==="right"?"left":"right" }}>{m.t}</p>
              </div>
            </div>
          ))}
        </div>
        {/* Input bar */}
        <div style={{ padding:"9px 12px",borderTop:"1px solid rgba(255,255,255,0.05)",
          display:"flex",gap:7,alignItems:"center",background:"rgba(5,10,22,0.5)" }}>
          <div style={{ flex:1,padding:"8px 12px",borderRadius:9,background:"rgba(255,255,255,0.04)",
            border:"1px solid rgba(255,255,255,0.07)",fontSize:11,color:"rgba(255,255,255,0.24)" }}>Type a message…</div>
          <div style={{ width:30,height:30,borderRadius:9,flexShrink:0,
            background:"linear-gradient(135deg,#00C4D0,#0055BB)",
            display:"flex",alignItems:"center",justifyContent:"center",
            fontSize:13,boxShadow:"0 0 9px rgba(0,245,255,0.24)" }}>→</div>
        </div>
      </div>
      {/* Floating notification badges */}
      <div style={{ position:"absolute",top:-14,right:-14,zIndex:20,
        padding:"8px 13px",borderRadius:12,background:"rgba(8,15,30,0.96)",
        border:"1px solid rgba(34,197,94,0.22)",backdropFilter:"blur(14px)",
        display:"flex",alignItems:"center",gap:6,boxShadow:"0 5px 20px rgba(0,0,0,0.38)",
        animation:"floatOrb 4.5s ease-in-out infinite" }}>
        <div style={{ width:6,height:6,borderRadius:"50%",background:"#22c55e",
          animation:"pulse 2s ease-in-out infinite",boxShadow:"0 0 5px #22c55e" }}/>
        <span style={{ fontSize:11,fontWeight:700,color:"#4ade80" }}>New message!</span>
      </div>
      <div style={{ position:"absolute",bottom:-12,left:-14,zIndex:20,
        padding:"8px 13px",borderRadius:12,background:"rgba(8,15,30,0.96)",
        border:"1px solid rgba(77,121,255,0.22)",backdropFilter:"blur(14px)",
        display:"flex",alignItems:"center",gap:6,boxShadow:"0 5px 20px rgba(0,0,0,0.38)",
        animation:"floatOrb 5s ease-in-out infinite",animationDelay:"-2s" }}>
        <span style={{ fontSize:12 }}>📹</span>
        <span style={{ fontSize:11,fontWeight:700,color:"#818cf8" }}>Video call ready</span>
      </div>
    </div>
  );
};

/* ── Eye icon ─────────────────────────────────────────────────────── */
const EyeIcon = ({ open }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    {open ? <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></> : <><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></>}
  </svg>
);

/* ── Password strength ────────────────────────────────────────────── */
function StrengthMeter({ password }) {
  if (!password) return null;
  const score = [password.length>=8,/[A-Z]/.test(password),/[0-9]/.test(password),/[^A-Za-z0-9]/.test(password)].filter(Boolean).length;
  const colors = ["","#ef4444","#f59e0b","#3b82f6","#22c55e"];
  const labels = ["","Weak","Fair","Good","Strong"];
  return (
    <div style={{ marginTop:5 }}>
      <div style={{ display:"flex",gap:3,marginBottom:3 }}>
        {[1,2,3,4].map(i=>(
          <div key={i} style={{ flex:1,height:2.5,borderRadius:99,
            background:i<=score?colors[score]:"rgba(255,255,255,0.07)",transition:"background .3s" }}/>
        ))}
      </div>
      <span style={{ fontSize:10,color:colors[score],fontWeight:600 }}>{labels[score]}</span>
    </div>
  );
}

/* ── Styled input ─────────────────────────────────────────────────── */
function StyledInput({ label, type="text", value, onChange, placeholder, rightEl, autoComplete, hint }) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label style={{
        display:"block",fontSize:11,fontWeight:600,letterSpacing:"0.05em",
        marginBottom:5,color:focused?"#00F5FF":"rgba(255,255,255,0.45)",
        transition:"color .2s",textTransform:"uppercase",
      }}>{label}</label>
      <div style={{ position:"relative" }}>
        <input type={type} value={value} onChange={onChange} placeholder={placeholder}
          autoComplete={autoComplete}
          onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)}
          style={{
            width:"100%",boxSizing:"border-box",
            padding:rightEl?"10px 42px 10px 14px":"10px 14px",
            borderRadius:10,
            background:focused?"rgba(0,245,255,0.03)":"rgba(255,255,255,0.03)",
            border:`1.5px solid ${focused?"rgba(0,245,255,0.5)":"rgba(255,255,255,0.09)"}`,
            boxShadow:focused?"0 0 0 3px rgba(0,245,255,0.06)":"none",
            color:"#E8EAF0",fontSize:13.5,fontFamily:"'Sora','Poppins',sans-serif",
            outline:"none",transition:"all .22s",
          }}/>
        {rightEl && <div style={{ position:"absolute",right:12,top:"50%",transform:"translateY(-50%)" }}>{rightEl}</div>}
      </div>
      {hint}
    </div>
  );
}

/* ── Social button ────────────────────────────────────────────────── */
function SocialBtn({ icon, label, color, hoverBg }) {
  const [hov, setHov] = useState(false);
  return (
    <button type="button" title={label}
      onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{
        display:"flex",alignItems:"center",justifyContent:"center",
        width:40,height:40,borderRadius:10,cursor:"pointer",
        background:hov?hoverBg:"rgba(255,255,255,0.04)",
        border:`1.5px solid ${hov?color:"rgba(255,255,255,0.08)"}`,
        transition:"all .2s",color:hov?color:"rgba(255,255,255,0.4)",
        fontSize:15,boxShadow:hov?`0 0 12px ${color}30`:"none",
      }}>{icon}</button>
  );
}

/* ═══════════════ MAIN ════════════════════════════════════════════════ */
export default function Register() {
  const navigate = useNavigate();
  const [name,setName]         = useState("");
  const [email,setEmail]       = useState("");
  const [password,setPassword] = useState("");
  const [confirm,setConfirm]   = useState("");
  const [showPass,setShowPass] = useState(false);
  const [showConf,setShowConf] = useState(false);
  const [loading,setLoading]   = useState(false);
  const [err,setErr]           = useState("");
  const [mounted,setMounted]   = useState(false);

  useEffect(()=>{ setTimeout(()=>setMounted(true),50); },[]);

  const submit = async (e) => {
    e.preventDefault(); setErr("");
    if (password !== confirm) { setErr("Passwords don't match."); return; }
    if (password.length < 6)  { setErr("Password must be at least 6 characters."); return; }
    setLoading(true);
    try {
      await registerUser({ name, email, password });
      navigate("/login", { state:{ message:"Account created! Sign in to continue. 🎉" } });
    } catch (error) {
      setErr(error.response?.data?.msg || "Registration failed. Please try again.");
    }
    setLoading(false);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&display=swap');
        @keyframes floatOrb  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-14px)} }
        @keyframes shimmer   { 0%{background-position:0% 50%} 100%{background-position:200% 50%} }
        @keyframes slideUp   { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin      { to{transform:rotate(360deg)} }
        @keyframes pulse     { 0%,100%{opacity:1} 50%{opacity:.5} }
        input::placeholder   { color:rgba(255,255,255,0.2); }
        input:-webkit-autofill{ -webkit-box-shadow:0 0 0 100px rgba(5,12,28,0.98) inset !important;-webkit-text-fill-color:#E8EAF0 !important; }
        .lp-scroll::-webkit-scrollbar{width:3px}
        .lp-scroll::-webkit-scrollbar-thumb{background:rgba(0,245,255,0.18);border-radius:3px}
        .lp-scroll::-webkit-scrollbar-track{background:transparent}
      `}</style>

      {/* FIXED VIEWPORT WRAPPER */}
      <div style={{
        height:"100vh",width:"100%",display:"flex",overflow:"hidden",
        fontFamily:"'Sora','Poppins',sans-serif",background:"#060A13",position:"relative",
      }}>
        {/* Grid + glows */}
        <div style={{ position:"fixed",inset:0,zIndex:0,pointerEvents:"none",
          backgroundImage:"linear-gradient(rgba(0,245,255,0.017) 1px,transparent 1px),linear-gradient(90deg,rgba(0,245,255,0.017) 1px,transparent 1px)",
          backgroundSize:"56px 56px" }}/>
        <div style={{ position:"fixed",top:0,right:0,width:400,height:400,borderRadius:"50%",
          background:"radial-gradient(circle,rgba(0,245,255,0.05) 0%,transparent 65%)",pointerEvents:"none",zIndex:0 }}/>
        <div style={{ position:"fixed",bottom:0,left:0,width:340,height:340,borderRadius:"50%",
          background:"radial-gradient(circle,rgba(255,230,0,0.045) 0%,transparent 65%)",pointerEvents:"none",zIndex:0 }}/>

        {/* ── LEFT PANEL — internal scroll when window is small ──────── */}
        <div className="lp-scroll" style={{
          width:"44%",minWidth:320,
          height:"100vh",overflowY:"auto",
          display:"flex",flexDirection:"column",justifyContent:"center",
          padding:"1.3rem 2.6rem",
          position:"relative",zIndex:10,
          opacity:mounted?1:0,
          transform:mounted?"translateX(0)":"translateX(-26px)",
          transition:"opacity .5s ease,transform .5s ease",
        }}>
          {/* Logo */}
          <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:"1rem" }}>
            <div style={{
              width:36,height:36,borderRadius:10,flexShrink:0,
              background:"linear-gradient(135deg,rgba(0,245,255,0.9),rgba(77,121,255,0.9))",
              display:"flex",alignItems:"center",justifyContent:"center",
              boxShadow:"0 0 18px rgba(0,245,255,0.32)",fontSize:17,
            }}>💬</div>
            <span style={{
              fontSize:15.5,fontWeight:800,
              background:"linear-gradient(90deg,#00F5FF,#4D79FF)",
              WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text",
            }}>JourneyChat</span>
          </div>

          {/* Heading */}
          <div style={{ marginBottom:"0.9rem",animation:"slideUp .5s ease .08s both" }}>
            <h1 style={{ fontSize:24,fontWeight:800,letterSpacing:"-0.55px",color:"#F0F4FF",margin:"0 0 4px",lineHeight:1.15 }}>
              Create your{" "}
              <span style={{
                background:"linear-gradient(90deg,#00F5FF,#FFE600,#4D79FF,#00F5FF)",
                backgroundSize:"250% 100%",
                WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text",
                animation:"shimmer 4s linear infinite",
              }}>free account</span>
            </h1>
            <p style={{ color:"rgba(255,255,255,0.4)",fontSize:13,margin:0 }}>Join thousands already chatting on JourneyChat.</p>
          </div>

          {/* Error */}
          {err && (
            <div style={{ padding:"9px 13px",borderRadius:9,marginBottom:10,fontSize:12.5,
              background:"rgba(239,68,68,0.07)",border:"1px solid rgba(239,68,68,0.22)",color:"#f87171",
              animation:"slideUp .35s ease both" }}>
              ⚠ {err}
            </div>
          )}

          {/* Form */}
          <form onSubmit={submit} style={{ display:"flex",flexDirection:"column",gap:10 }}>
            <div style={{ animation:"slideUp .5s ease .1s both" }}>
              <StyledInput label="Full Name" value={name}
                onChange={e=>setName(e.target.value)} placeholder="Alex Johnson" autoComplete="name"/>
            </div>
            <div style={{ animation:"slideUp .5s ease .15s both" }}>
              <StyledInput label="Email Address" type="email" value={email}
                onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email"/>
            </div>
            <div style={{ animation:"slideUp .5s ease .2s both" }}>
              <StyledInput label="Password" type={showPass?"text":"password"} value={password}
                onChange={e=>setPassword(e.target.value)} placeholder="Create a strong password"
                autoComplete="new-password"
                hint={<StrengthMeter password={password}/>}
                rightEl={
                  <button type="button" onClick={()=>setShowPass(s=>!s)}
                    style={{ background:"none",border:"none",cursor:"pointer",color:"rgba(255,255,255,0.35)",padding:3,lineHeight:1,transition:"color .2s" }}
                    onMouseEnter={e=>e.currentTarget.style.color="#00F5FF"}
                    onMouseLeave={e=>e.currentTarget.style.color="rgba(255,255,255,0.35)"}>
                    <EyeIcon open={showPass}/>
                  </button>
                }/>
            </div>
            <div style={{ animation:"slideUp .5s ease .25s both" }}>
              <StyledInput label="Confirm Password" type={showConf?"text":"password"} value={confirm}
                onChange={e=>setConfirm(e.target.value)} placeholder="Repeat your password"
                autoComplete="new-password"
                rightEl={
                  <button type="button" onClick={()=>setShowConf(s=>!s)}
                    style={{ background:"none",border:"none",cursor:"pointer",padding:3,lineHeight:1,transition:"color .2s",
                      color:confirm&&confirm===password?"#22c55e":"rgba(255,255,255,0.35)" }}>
                    {confirm&&confirm===password
                      ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
                      : <EyeIcon open={showConf}/>}
                  </button>
                }/>
            </div>

            {/* Terms */}
            <p style={{ fontSize:11.5,color:"rgba(255,255,255,0.28)",margin:0,lineHeight:1.55,animation:"slideUp .5s ease .28s both" }}>
              By creating an account you agree to our{" "}
              <a href="#" style={{ color:"#00F5FF",textDecoration:"none" }}>Terms</a> and{" "}
              <a href="#" style={{ color:"#00F5FF",textDecoration:"none" }}>Privacy Policy</a>.
            </p>

            {/* Button */}
            <div style={{ animation:"slideUp .5s ease .32s both" }}>
              <button type="submit" disabled={loading} style={{
                width:"100%",padding:"12px",borderRadius:11,
                fontWeight:700,fontSize:14,letterSpacing:"0.02em",
                fontFamily:"'Sora','Poppins',sans-serif",
                background:loading?"rgba(0,245,255,0.08)":"linear-gradient(135deg,#00C4D0,#0055BB)",
                color:loading?"rgba(255,255,255,0.28)":"#fff",
                border:"none",cursor:loading?"not-allowed":"pointer",
                boxShadow:loading?"none":"0 4px 20px rgba(0,180,220,0.35), 0 0 0 1px rgba(0,245,255,0.13)",
                transition:"all .22s",
                display:"flex",alignItems:"center",justifyContent:"center",gap:8,
              }}
              onMouseEnter={e=>{ if(!loading){ e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow="0 6px 26px rgba(0,180,220,0.48)"; }}}
              onMouseLeave={e=>{ e.currentTarget.style.transform="translateY(0)"; if(!loading) e.currentTarget.style.boxShadow="0 4px 20px rgba(0,180,220,0.35), 0 0 0 1px rgba(0,245,255,0.13)"; }}>
                {loading
                  ? <><svg style={{ animation:"spin 1s linear infinite",width:15,height:15,flexShrink:0 }} fill="none" viewBox="0 0 24 24"><circle style={{opacity:.25}} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path style={{opacity:.75}} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Creating Account…</>
                  : <>Create Account <span style={{ fontSize:16 }}>→</span></>}
              </button>
            </div>
          </form>

          {/* Social */}
          <div style={{ display:"flex",alignItems:"center",gap:11,margin:"12px 0 10px",animation:"slideUp .5s ease .36s both" }}>
            <div style={{ flex:1,height:1,background:"rgba(255,255,255,0.07)" }}/>
            <span style={{ fontSize:11,color:"rgba(255,255,255,0.3)",whiteSpace:"nowrap" }}>or sign up with</span>
            <div style={{ flex:1,height:1,background:"rgba(255,255,255,0.07)" }}/>
          </div>
          <div style={{ display:"flex",gap:9,animation:"slideUp .5s ease .4s both" }}>
            <SocialBtn icon="f" label="Facebook" color="#1877F2" hoverBg="rgba(24,119,242,0.07)"/>
            <SocialBtn icon="𝕏" label="Twitter" color="#1DA1F2" hoverBg="rgba(29,161,242,0.07)"/>
            <SocialBtn icon="G" label="Google" color="#EA4335" hoverBg="rgba(234,67,53,0.07)"/>
          </div>

          <p style={{ marginTop:12,fontSize:13,color:"rgba(255,255,255,0.35)",animation:"slideUp .5s ease .44s both" }}>
            Already have an account?{" "}
            <Link to="/login" style={{ color:"#FFE600",fontWeight:700,textDecoration:"none",textShadow:"0 0 8px rgba(255,230,0,0.28)" }}>
              Sign in →
            </Link>
          </p>
        </div>

        {/* ── RIGHT PANEL ─────────────────────────────────────────────── */}
        <div style={{
          flex:1,position:"relative",zIndex:5,overflow:"hidden",
          display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
          padding:"1.5rem 1.5rem",
          opacity:mounted?1:0,
          transform:mounted?"translateX(0)":"translateX(34px)",
          transition:"opacity .6s ease .14s, transform .6s ease .14s",
        }}>
          <div style={{ position:"absolute",inset:"4%",borderRadius:26,
            background:"linear-gradient(145deg,rgba(0,245,255,0.022) 0%,rgba(77,121,255,0.036) 50%,rgba(255,230,0,0.013) 100%)",
            border:"1px solid rgba(0,245,255,0.065)" }}/>
          <FloatingShapes/>

          {/* Stats row */}
          <div style={{ position:"relative",zIndex:10,display:"flex",gap:9,marginBottom:"1rem" }}>
            {[
              { icon:"🌍",val:"50K+",label:"users",   color:"rgba(0,245,255,0.07)", border:"rgba(0,245,255,0.15)" },
              { icon:"💬",val:"24M", label:"daily msgs",color:"rgba(255,230,0,0.06)",border:"rgba(255,230,0,0.14)" },
              { icon:"📹",val:"99%", label:"uptime",   color:"rgba(34,197,94,0.07)",border:"rgba(34,197,94,0.16)" },
            ].map(s=>(
              <div key={s.val} style={{ padding:"10px 14px",borderRadius:13,background:s.color,
                border:`1px solid ${s.border}`,backdropFilter:"blur(12px)",textAlign:"center" }}>
                <div style={{ fontSize:16,marginBottom:1 }}>{s.icon}</div>
                <div style={{ fontSize:16,fontWeight:800,color:"#F0F4FF",lineHeight:1 }}>{s.val}</div>
                <div style={{ fontSize:10,color:"rgba(255,255,255,0.4)",marginTop:2,whiteSpace:"nowrap" }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Chat preview */}
          <div style={{ position:"relative",zIndex:10,width:"82%",maxWidth:360 }}>
            <ChatPreview/>
          </div>

          {/* Caption */}
          <div style={{ position:"relative",zIndex:10,textAlign:"center",marginTop:"1rem" }}>
            <h2 style={{ fontSize:17,fontWeight:800,color:"#F0F4FF",margin:"0 0 5px",letterSpacing:"-0.2px" }}>
              Everything you need, all in one place
            </h2>
            <p style={{ fontSize:12.5,color:"rgba(255,255,255,0.38)",margin:0,maxWidth:300,lineHeight:1.6 }}>
              Private chats, video calls &amp; whiteboards — free forever.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}