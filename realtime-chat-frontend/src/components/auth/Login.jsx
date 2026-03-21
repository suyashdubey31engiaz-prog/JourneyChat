import React, { useState, useContext, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { loginUser } from "../../utils/api";

/* ── Particle canvas ─────────────────────────────────────────────────────── */
function Particles() {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d");
    let raf, W, H;
    const resize = () => {
      W = c.width  = window.innerWidth;
      H = c.height = window.innerHeight;
    };
    resize();
    const COLORS = ["#00F5FF","#FFE600","#4D79FF","#39FF14"];
    const pts = Array.from({ length: 65 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      r: Math.random() * 1.6 + 0.3,
      vx: (Math.random() - 0.5) * 0.35,
      vy: -(Math.random() * 0.55 + 0.12),
      c: COLORS[Math.floor(Math.random() * COLORS.length)],
      a: Math.random() * 0.55 + 0.1,
    }));
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      pts.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.y < -4) { p.y = H + 4; p.x = Math.random() * W; }
        if (p.x < -4 || p.x > W + 4) p.vx *= -1;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.c + Math.floor(p.a * 255).toString(16).padStart(2, "0");
        ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    window.addEventListener("resize", resize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);
  return (
    <canvas ref={ref} style={{
      position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, opacity: 0.45
    }} />
  );
}

/* ── Floating blobs ──────────────────────────────────────────────────────── */
const BLOBS = [
  { w:340, h:340, l:"-8%",  t:"-8%",  bg:"rgba(0,245,255,0.07)",  d:"0s"   },
  { w:220, h:220, l:"44%",  t:"20%",  bg:"rgba(255,230,0,0.05)",  d:"-8s"  },
  { w:160, h:160, l:"80%",  t:"5%",   bg:"rgba(77,121,255,0.07)", d:"-3s"  },
  { w:260, h:260, l:"3%",   b:"-6%",  bg:"rgba(0,245,255,0.05)",  d:"-12s" },
  { w:190, h:190, l:"64%",  b:"12%",  bg:"rgba(255,230,0,0.07)",  d:"-5s"  },
];
function Blobs() {
  return (
    <div style={{ position:"fixed", inset:0, zIndex:0, pointerEvents:"none", overflow:"hidden" }}>
      {BLOBS.map((b, i) => (
        <div key={i} style={{
          position:"absolute", borderRadius:"50%", mixBlendMode:"screen",
          filter:"blur(32px)", width:b.w, height:b.h,
          left:b.l, top:b.t, bottom:b.b,
          background:b.bg,
          animation:`float 20s ease-in-out infinite`,
          animationDelay:b.d,
        }} />
      ))}
    </div>
  );
}

/* ── Eye icon ────────────────────────────────────────────────────────────── */
const EyeIcon = ({ open }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    {open ? (
      <>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
        <circle cx="12" cy="12" r="3"/>
      </>
    ) : (
      <>
        <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
        <line x1="1" y1="1" x2="23" y2="23"/>
      </>
    )}
  </svg>
);

/* ── Input component ─────────────────────────────────────────────────────── */
function Input({ label, icon, type="text", value, onChange, placeholder, right }) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label style={{
        display:"flex", alignItems:"center", gap:6, fontSize:11, fontWeight:600,
        marginBottom:8, color: focused ? "#00F5FF" : "rgba(255,255,255,0.55)",
        transition:"color .2s",
      }}>
        {icon} {label}
      </label>
      <div style={{ position:"relative" }}>
        <input
          type={type} value={value} onChange={onChange} placeholder={placeholder}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          autoComplete="off"
          style={{
            width:"100%", padding: right ? "14px 48px 14px 16px" : "14px 16px",
            borderRadius:14,
            background: focused ? "rgba(0,245,255,0.04)" : "rgba(255,255,255,0.04)",
            border: `1px solid ${focused ? "rgba(0,245,255,0.5)" : "rgba(255,255,255,0.08)"}`,
            boxShadow: focused ? "0 0 0 3px rgba(0,245,255,0.1)" : "none",
            color:"#E8EAF0", fontSize:14, fontFamily:"Poppins,sans-serif",
            outline:"none", transition:"all .2s",
          }}
        />
        {right && (
          <div style={{ position:"absolute", right:14, top:"50%", transform:"translateY(-50%)" }}>
            {right}
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
export default function Login() {
  const { login }  = useContext(AuthContext);
  const navigate   = useNavigate();
  const location   = useLocation();
  const successMsg = location.state?.message || "";

  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [err,      setErr]      = useState("");

  const submit = async (e) => {
    e.preventDefault(); setErr(""); setLoading(true);
    try {
      const res = await loginUser({ email, password });
      login(res.data); navigate("/dashboard");
    } catch (error) {
      setErr(error.response?.data?.msg || "Login failed. Check your credentials.");
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight:"100vh", background:"#070B14",
      display:"flex", alignItems:"center", justifyContent:"center",
      padding:"1.5rem", position:"relative", overflow:"hidden",
    }}>
      <Particles />
      <Blobs />

      {/* Cyber grid */}
      <div style={{
        position:"fixed", inset:0, zIndex:0, pointerEvents:"none",
        backgroundImage:"linear-gradient(rgba(0,245,255,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(0,245,255,0.025) 1px,transparent 1px)",
        backgroundSize:"48px 48px", opacity:0.35,
      }} />

      {/* Card */}
      <div style={{ position:"relative", zIndex:10, width:"100%", maxWidth:440 }}>

        {/* Outer glow */}
        <div style={{
          position:"absolute", inset:-16, borderRadius:40, pointerEvents:"none",
          background:"radial-gradient(ellipse,rgba(0,245,255,0.09) 0%,transparent 70%)",
          filter:"blur(20px)",
        }} />

        <div style={{
          position:"relative",
          background:"linear-gradient(145deg,rgba(13,21,38,0.95),rgba(7,11,20,0.98))",
          border:"1px solid rgba(0,245,255,0.15)",
          borderRadius:28,
          boxShadow:"0 0 0 1px rgba(255,255,255,0.04), 0 32px 80px rgba(0,0,0,0.75)",
          backdropFilter:"blur(28px)",
          overflow:"hidden",
          animation:"scale-in 0.3s ease both",
        }}>
          {/* Top gradient strip */}
          <div style={{
            height:3,
            background:"linear-gradient(90deg,transparent,#00F5FF 30%,#FFE600 70%,transparent)",
          }} />

          <div style={{ padding:"2.5rem 2.25rem 2.25rem" }}>
            {/* Logo */}
            <div style={{ textAlign:"center", marginBottom:"2rem" }}>
              <div style={{
                display:"inline-flex", alignItems:"center", justifyContent:"center",
                width:64, height:64, borderRadius:18, marginBottom:16,
                background:"linear-gradient(135deg,#0891b2,#1d4ed8)",
                boxShadow:"0 0 32px rgba(0,245,255,0.4), 0 0 80px rgba(0,245,255,0.1)",
                fontSize:28, position:"relative",
              }}>
                💬
                <div style={{
                  position:"absolute", inset:-6, borderRadius:24,
                  border:"1px solid rgba(0,245,255,0.2)", pointerEvents:"none",
                }} />
              </div>
              <h1 style={{
                fontSize:28, fontWeight:900, letterSpacing:"-0.5px", marginBottom:6,
                background:"linear-gradient(90deg,#00F5FF,#FFE600,#4D79FF,#00F5FF)",
                backgroundSize:"300% 100%",
                WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
                backgroundClip:"text", animation:"shimmer 4s linear infinite",
              }}>
                Welcome back
              </h1>
              <p style={{ color:"rgba(255,255,255,0.45)", fontSize:13.5 }}>
                Sign in to <span style={{ color:"#00F5FF" }}>JourneyChat</span>
              </p>
            </div>

            {/* Banners */}
            {successMsg && (
              <div style={{
                display:"flex", alignItems:"center", gap:10, fontSize:13,
                padding:"12px 16px", borderRadius:12, marginBottom:16,
                background:"rgba(34,197,94,0.08)", border:"1px solid rgba(34,197,94,0.25)",
                color:"#4ade80",
              }}>
                ✓ {successMsg}
              </div>
            )}
            {err && (
              <div style={{
                display:"flex", alignItems:"center", gap:10, fontSize:13,
                padding:"12px 16px", borderRadius:12, marginBottom:16,
                background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.25)",
                color:"#f87171",
              }}>
                ⚠️ {err}
              </div>
            )}

            <form onSubmit={submit} style={{ display:"flex", flexDirection:"column", gap:16 }}>
              <Input
                label="Email address" icon="✉️"
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
              <Input
                label="Password" icon="🔒"
                type={showPass ? "text" : "password"} value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Your password"
                right={
                  <button type="button" onClick={() => setShowPass(s => !s)}
                    style={{ background:"none", border:"none", cursor:"pointer",
                      color:"rgba(255,255,255,0.4)", lineHeight:1, padding:4 }}>
                    <EyeIcon open={showPass} />
                  </button>
                }
              />

              <button type="submit" disabled={loading} style={{
                display:"flex", alignItems:"center", justifyContent:"center", gap:8,
                width:"100%", padding:"15px",
                borderRadius:14, fontWeight:700, fontSize:14,
                fontFamily:"Poppins,sans-serif",
                background: loading ? "#1a3a5c" : "linear-gradient(135deg,#00F5FF,#0077cc)",
                color: loading ? "rgba(255,255,255,0.5)" : "#020d14",
                boxShadow: loading ? "none" : "0 0 20px rgba(0,245,255,0.4), 0 4px 20px rgba(0,0,0,0.4)",
                border:"none", cursor: loading ? "not-allowed" : "pointer",
                transition:"all .2s", marginTop:4,
                position:"relative", overflow:"hidden",
              }}>
                {loading ? (
                  <>
                    <svg style={{ animation:"spin 1s linear infinite", width:16, height:16 }} fill="none" viewBox="0 0 24 24">
                      <circle style={{ opacity:.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path style={{ opacity:.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Signing in…
                  </>
                ) : "Sign In →"}
              </button>
            </form>

            {/* Divider */}
            <div style={{ display:"flex", alignItems:"center", gap:12, margin:"20px 0 16px" }}>
              <div style={{ flex:1, height:1, background:"rgba(255,255,255,0.06)" }} />
              <span style={{ fontSize:11, color:"rgba(255,255,255,0.3)" }}>or</span>
              <div style={{ flex:1, height:1, background:"rgba(255,255,255,0.06)" }} />
            </div>

            <p style={{ textAlign:"center", fontSize:13, color:"rgba(255,255,255,0.4)" }}>
              No account?{" "}
              <Link to="/register" style={{
                color:"#00F5FF", fontWeight:700, textDecoration:"none",
                textShadow:"0 0 8px rgba(0,245,255,0.4)",
              }}>
                Create one →
              </Link>
            </p>
          </div>
        </div>

        <p style={{
          textAlign:"center", fontSize:11, marginTop:14,
          color:"rgba(255,255,255,0.18)",
        }}>
          🔒 Messages encrypted end-to-end
        </p>
      </div>
    </div>
  );
}