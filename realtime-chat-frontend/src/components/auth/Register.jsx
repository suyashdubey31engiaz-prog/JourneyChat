// src/components/auth/Register.jsx
import React, { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ThemeContext } from "../../context/ThemeContext";
import { registerUser } from "../../utils/api";

// ── Eye icon ───────────────────────────────────────────────────────────────────
const EyeIcon = ({ open }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    {open ? <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></> : <><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></>}
  </svg>
);

// ── Strength meter ──────────────────────────────────────────────────────────────
const StrengthMeter = ({ password }) => {
  if (!password) return null;
  const score  = [password.length >= 8, /[A-Z]/.test(password), /[0-9]/.test(password), /[^A-Za-z0-9]/.test(password)].filter(Boolean).length;
  const colors = ["", "#ef4444", "#f59e0b", "#3b82f6", "#22c55e"];
  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  return (
    <div style={{ marginTop: 5 }}>
      <div style={{ display: "flex", gap: 3, marginBottom: 3 }}>
        {[1,2,3,4].map(i => (
          <div key={i} style={{ flex: 1, height: 2.5, borderRadius: 99, background: i <= score ? colors[score] : "var(--t-border)", transition: "background .3s" }} />
        ))}
      </div>
      <span style={{ fontSize: 10, color: colors[score], fontWeight: 600 }}>{labels[score]}</span>
    </div>
  );
};

// ── Theme-aware input ──────────────────────────────────────────────────────────
function ThemeInput({ label, type = "text", value, onChange, placeholder, rightEl, autoComplete, hint }) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", marginBottom: 6, color: focused ? "var(--t-primary)" : "var(--t-text3)", transition: "color .2s" }}>{label}</label>
      <div style={{ position: "relative" }}>
        <input type={type} value={value} onChange={onChange} placeholder={placeholder} autoComplete={autoComplete}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          style={{ width: "100%", boxSizing: "border-box", padding: rightEl ? "10px 42px 10px 14px" : "10px 14px", borderRadius: 11, background: focused ? "color-mix(in srgb,var(--t-primary) 4%,transparent)" : "rgba(255,255,255,0.04)", border: `1.5px solid ${focused ? "var(--t-border2)" : "var(--t-border)"}`, boxShadow: focused ? "0 0 0 3px var(--t-card-glow)" : "none", color: "var(--t-text)", fontSize: 13.5, fontFamily: "var(--t-font,'Sora','Poppins',sans-serif)", outline: "none", transition: "all .22s" }} />
        {rightEl && <div style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)" }}>{rightEl}</div>}
      </div>
      {hint}
    </div>
  );
}

// ── Confirm match indicator ────────────────────────────────────────────────────
const MatchDot = ({ pass, conf }) => {
  if (!conf) return null;
  const ok = pass === conf;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 4 }}>
      <div style={{ width: 7, height: 7, borderRadius: "50%", background: ok ? "#22c55e" : "#ef4444", boxShadow: ok ? "0 0 5px #22c55e" : "0 0 5px #ef4444", transition: "all .2s" }} />
      <span style={{ fontSize: 10, color: ok ? "#22c55e" : "#f87171", fontWeight: 600 }}>{ok ? "Passwords match" : "Passwords don't match"}</span>
    </div>
  );
};

// ── Chat preview ───────────────────────────────────────────────────────────────
const ChatPreview = () => {
  const msgs = [
    { side: "left",  text: "Just joined JourneyChat 🎉", t: "10:21 AM", a: "A" },
    { side: "right", text: "Welcome! Video call tonight?", t: "10:22 AM", a: "B" },
    { side: "left",  text: "Absolutely! Sending whiteboard link 📝", t: "10:22 AM", a: "A" },
  ];
  return (
    <div style={{ width: "100%", maxWidth: 360, position: "relative", zIndex: 10 }}>
      <div style={{
        background: "var(--t-card-bg)", border: "1px solid var(--t-card-border)",
        borderRadius: 20, overflow: "hidden",
        boxShadow: "0 18px 56px rgba(0,0,0,0.5), 0 0 28px var(--t-card-glow)",
      }}>
        {/* Header */}
        <div style={{ padding: "12px 16px", background: "linear-gradient(90deg,color-mix(in srgb,var(--t-primary) 8%,transparent),color-mix(in srgb,var(--t-tertiary) 8%,transparent))", borderBottom: "1px solid var(--t-border)", display: "flex", alignItems: "center", gap: 9 }}>
          <div style={{ width: 30, height: 30, borderRadius: 9, background: "linear-gradient(135deg,var(--t-primary),var(--t-tertiary))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, boxShadow: "0 0 12px var(--t-glow)" }}>💬</div>
          <div>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--t-text)" }}>Global Chat</div>
            <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 1 }}>
              <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 5px #22c55e" }} />
              <span style={{ fontSize: 10, color: "var(--t-text3)" }}>1,248 online</span>
            </div>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", gap: 5 }}>
            {["📹", "🎨"].map(icon => (
              <div key={icon} style={{ width: 26, height: 26, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, background: "rgba(255,255,255,0.05)", border: "1px solid var(--t-border)" }}>{icon}</div>
            ))}
          </div>
        </div>

        {/* Messages */}
        <div style={{ padding: "12px 13px", display: "flex", flexDirection: "column", gap: 9 }}>
          {msgs.map((m, i) => (
            <div key={i} style={{ display: "flex", flexDirection: m.side === "right" ? "row-reverse" : "row", alignItems: "flex-end", gap: 6 }}>
              <div style={{ width: 22, height: 22, borderRadius: 6, flexShrink: 0, background: m.side === "left" ? "linear-gradient(135deg,var(--t-primary),var(--t-tertiary))" : "linear-gradient(135deg,var(--t-secondary),var(--t-grad2))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 800, color: "var(--t-bg)" }}>{m.a}</div>
              <div style={{ maxWidth: "72%", padding: "8px 11px", borderRadius: m.side === "right" ? "13px 13px 3px 13px" : "13px 13px 13px 3px", background: m.side === "left" ? "color-mix(in srgb,var(--t-primary) 9%,transparent)" : "color-mix(in srgb,var(--t-tertiary) 10%,transparent)", border: `1px solid ${m.side === "left" ? "var(--t-border2)" : "color-mix(in srgb,var(--t-tertiary) 20%,transparent)"}` }}>
                <p style={{ margin: 0, fontSize: 11.5, color: "var(--t-text)", lineHeight: 1.5 }}>{m.text}</p>
                <p style={{ margin: "3px 0 0", fontSize: 9, color: "var(--t-text3)", textAlign: m.side === "right" ? "left" : "right" }}>{m.t}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Input bar */}
        <div style={{ padding: "9px 12px", borderTop: "1px solid var(--t-border)", display: "flex", gap: 7, alignItems: "center", background: "rgba(0,0,0,0.15)" }}>
          <div style={{ flex: 1, padding: "8px 12px", borderRadius: 9, background: "rgba(255,255,255,0.04)", border: "1px solid var(--t-border)", fontSize: 11, color: "var(--t-text3)" }}>Type a message…</div>
          <div style={{ width: 30, height: 30, borderRadius: 9, flexShrink: 0, background: "linear-gradient(135deg,var(--t-primary),var(--t-tertiary))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, boxShadow: "0 0 10px var(--t-glow)", color: "var(--t-bg)", fontWeight: 700 }}>→</div>
        </div>
      </div>

      {/* Floating notification */}
      <div style={{ position: "absolute", top: -14, right: -14, zIndex: 20, padding: "8px 13px", borderRadius: 12, background: "var(--t-card-bg)", border: "1px solid rgba(34,197,94,0.25)", backdropFilter: "blur(14px)", display: "flex", alignItems: "center", gap: 6, boxShadow: "0 5px 20px rgba(0,0,0,0.35)", animation: "regFloat 4.5s ease-in-out infinite" }}>
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", animation: "regPulse 2s ease-in-out infinite", boxShadow: "0 0 5px #22c55e" }} />
        <span style={{ fontSize: 11, fontWeight: 700, color: "#4ade80" }}>New message!</span>
      </div>
      <div style={{ position: "absolute", bottom: -12, left: -14, zIndex: 20, padding: "8px 13px", borderRadius: 12, background: "var(--t-card-bg)", border: "1px solid color-mix(in srgb,var(--t-tertiary) 30%,transparent)", backdropFilter: "blur(14px)", display: "flex", alignItems: "center", gap: 6, boxShadow: "0 5px 20px rgba(0,0,0,0.35)", animation: "regFloat 5s ease-in-out infinite", animationDelay: "-2s" }}>
        <span style={{ fontSize: 12 }}>📹</span>
        <span style={{ fontSize: 11, fontWeight: 700, color: "var(--t-tertiary)" }}>Video call ready</span>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
export default function Register() {
  const { theme, activeParticles } = useContext(ThemeContext);
  const navigate = useNavigate();

  const [name,     setName]     = useState("");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [confirm,  setConfirm]  = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConf, setShowConf] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [err,      setErr]      = useState("");
  const [mounted,  setMounted]  = useState(false);

  useEffect(() => { setTimeout(() => setMounted(true), 50); }, []);

  const submit = async (e) => {
    e.preventDefault(); setErr("");
    if (password !== confirm) { setErr("Passwords don't match."); return; }
    if (password.length < 6)  { setErr("Password must be at least 6 characters."); return; }
    setLoading(true);
    try {
      await registerUser({ name, email, password });
      navigate("/login", { state: { message: "Account created! Sign in to continue. 🎉" } });
    } catch (error) {
      setErr(error.response?.data?.msg || "Registration failed. Please try again.");
    }
    setLoading(false);
  };

  return (
    <>
      <style>{`
        @keyframes regHolo  { 0%{background-position:200% 200%} 100%{background-position:-200% -200%} }
        @keyframes regFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        @keyframes regSlide { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes regSpin  { to{transform:rotate(360deg)} }
        @keyframes regPulse { 0%,100%{opacity:1} 50%{opacity:.45} }
        .reg-scroll::-webkit-scrollbar{width:3px}
        .reg-scroll::-webkit-scrollbar-thumb{background:var(--t-scrollbar,#1a3a5c);border-radius:3px}
        .reg-scroll::-webkit-scrollbar-track{background:transparent}
        input::placeholder{color:var(--t-text3)!important}
        input:-webkit-autofill{-webkit-box-shadow:0 0 0 100px var(--t-bg2,#0D1526) inset!important;-webkit-text-fill-color:var(--t-text,#E8EAF0)!important}
      `}</style>

      <div style={{ height: "100vh", width: "100%", display: "flex", overflow: "hidden", fontFamily: "var(--t-font,'Sora','Poppins',sans-serif)", background: "var(--t-bg,#060A13)", position: "relative" }}>

        {/* Cyber grid */}
        <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", backgroundImage: "linear-gradient(color-mix(in srgb,var(--t-primary) 2%,transparent) 1px,transparent 1px),linear-gradient(90deg,color-mix(in srgb,var(--t-primary) 2%,transparent) 1px,transparent 1px)", backgroundSize: "56px 56px" }} />
        <div style={{ position: "fixed", top: 0, right: 0, width: 380, height: 380, borderRadius: "50%", background: "radial-gradient(circle,var(--t-card-glow) 0%,transparent 65%)", pointerEvents: "none", zIndex: 0 }} />
        <div style={{ position: "fixed", bottom: 0, left: 0, width: 320, height: 320, borderRadius: "50%", background: "radial-gradient(circle,var(--t-glow2) 0%,transparent 65%)", pointerEvents: "none", zIndex: 0, opacity: 0.6 }} />

        {/* ── LEFT PANEL ─────────────────────────────────────────────── */}
        <div className="reg-scroll" style={{ width: "45%", minWidth: 320, height: "100vh", overflowY: "auto", display: "flex", flexDirection: "column", justifyContent: "center", padding: "1.4rem 2.8rem", position: "relative", zIndex: 10, opacity: mounted ? 1 : 0, transform: mounted ? "translateX(0)" : "translateX(-28px)", transition: "opacity .55s ease, transform .55s ease" }}>

          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "1.2rem" }}>
            <div style={{ width: 38, height: 38, borderRadius: 11, flexShrink: 0, background: "linear-gradient(135deg,var(--t-primary),var(--t-tertiary))", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 20px var(--t-glow)", fontSize: 18 }}>💬</div>
            <span style={{ fontSize: 16, fontWeight: 800, background: "linear-gradient(90deg,var(--t-grad1),var(--t-grad2),var(--t-grad3))", backgroundSize: "250% 100%", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", animation: "regHolo 6s linear infinite" }}>JourneyChat</span>
          </div>

          <div style={{ marginBottom: "1rem", animation: "regSlide .5s ease .08s both" }}>
            <h1 style={{ fontSize: 25, fontWeight: 900, letterSpacing: "-0.5px", color: "var(--t-text)", margin: "0 0 5px", lineHeight: 1.15 }}>Create your account</h1>
            <p style={{ color: "var(--t-text3)", fontSize: 13, margin: 0 }}>Join thousands already chatting.</p>
          </div>

          {err && (
            <div style={{ padding: "9px 13px", borderRadius: 9, marginBottom: 12, fontSize: 12.5, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", color: "#f87171", animation: "regSlide .35s ease both" }}>⚠ {err}</div>
          )}

          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ animation: "regSlide .5s ease .1s both" }}>
              <ThemeInput label="Full Name" type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Suyash Dubey" autoComplete="name" />
            </div>
            <div style={{ animation: "regSlide .5s ease .14s both" }}>
              <ThemeInput label="Email Address" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" />
            </div>
            <div style={{ animation: "regSlide .5s ease .18s both" }}>
              <ThemeInput label="Password" type={showPass ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="Min 6 chars" autoComplete="new-password"
                hint={<StrengthMeter password={password} />}
                rightEl={<button type="button" onClick={() => setShowPass(s => !s)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--t-text3)", padding: 3, lineHeight: 1, transition: "color .2s" }} onMouseEnter={e => e.currentTarget.style.color = "var(--t-primary)"} onMouseLeave={e => e.currentTarget.style.color = "var(--t-text3)"}><EyeIcon open={showPass} /></button>}
              />
            </div>
            <div style={{ animation: "regSlide .5s ease .22s both" }}>
              <ThemeInput label="Confirm Password" type={showConf ? "text" : "password"} value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Repeat password" autoComplete="new-password"
                hint={<MatchDot pass={password} conf={confirm} />}
                rightEl={<button type="button" onClick={() => setShowConf(s => !s)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--t-text3)", padding: 3, lineHeight: 1, transition: "color .2s" }} onMouseEnter={e => e.currentTarget.style.color = "var(--t-primary)"} onMouseLeave={e => e.currentTarget.style.color = "var(--t-text3)"}><EyeIcon open={showConf} /></button>}
              />
            </div>

            <div style={{ animation: "regSlide .5s ease .26s both" }}>
              <button type="submit" disabled={loading} style={{
                width: "100%", padding: "12px", borderRadius: 12,
                fontWeight: 700, fontSize: 14, fontFamily: "var(--t-font)",
                background: loading ? "rgba(255,255,255,0.06)" : "linear-gradient(135deg,var(--t-primary),var(--t-tertiary))",
                color: loading ? "var(--t-text3)" : "var(--t-bg)",
                border: "none", cursor: loading ? "not-allowed" : "pointer",
                boxShadow: loading ? "none" : "0 4px 20px var(--t-glow), 0 0 0 1px var(--t-border2)",
                transition: "all .22s", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              }}
              onMouseEnter={e => { if (!loading) { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 7px 28px var(--t-glow)"; } }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; if (!loading) e.currentTarget.style.boxShadow = "0 4px 20px var(--t-glow), 0 0 0 1px var(--t-border2)"; }}>
                {loading
                  ? <><svg style={{ animation: "regSpin 1s linear infinite", width: 15, height: 15 }} fill="none" viewBox="0 0 24 24"><circle style={{ opacity: .25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path style={{ opacity: .75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Creating account…</>
                  : <>Create Account <span style={{ fontSize: 16 }}>→</span></>
                }
              </button>
            </div>
          </form>

          {/* Social */}
          <div style={{ display: "flex", alignItems: "center", gap: 11, margin: "14px 0 11px" }}>
            <div style={{ flex: 1, height: 1, background: "var(--t-border)" }} />
            <span style={{ fontSize: 11, color: "var(--t-text3)", whiteSpace: "nowrap" }}>or sign up with</span>
            <div style={{ flex: 1, height: 1, background: "var(--t-border)" }} />
          </div>
          <div style={{ display: "flex", gap: 9 }}>
            {[["f","Facebook","#1877F2"],["𝕏","Twitter","#1DA1F2"],["G","Google","#EA4335"]].map(([ic, lb, col]) => {
              const [h, setH] = useState(false);
              return <button key={lb} type="button" title={lb} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)} style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 40, height: 40, borderRadius: 10, cursor: "pointer", background: h ? `${col}12` : "rgba(255,255,255,0.04)", border: `1.5px solid ${h ? col : "var(--t-border)"}`, transition: "all .2s", color: h ? col : "var(--t-text3)", fontSize: 15, boxShadow: h ? `0 0 14px ${col}33` : "none" }}>{ic}</button>;
            })}
          </div>

          <p style={{ marginTop: 14, fontSize: 13, color: "var(--t-text3)" }}>
            Already have an account? <Link to="/login" style={{ color: "var(--t-primary)", fontWeight: 700, textDecoration: "none" }}>Sign in →</Link>
          </p>
          <p style={{ fontSize: 10.5, color: "color-mix(in srgb,var(--t-text3) 50%,transparent)", marginTop: 8 }}>🔒 End-to-end encrypted · By continuing you agree to our Terms</p>
        </div>

        {/* ── RIGHT PANEL ────────────────────────────────────────────── */}
        <div style={{ flex: 1, position: "relative", zIndex: 5, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "1.5rem", overflow: "hidden", opacity: mounted ? 1 : 0, transform: mounted ? "translateX(0)" : "translateX(36px)", transition: "opacity .65s ease .15s, transform .65s ease .15s" }}>
          {/* Inner frame */}
          <div style={{ position: "absolute", inset: "4%", borderRadius: 28, background: "linear-gradient(145deg,color-mix(in srgb,var(--t-primary) 3%,transparent) 0%,color-mix(in srgb,var(--t-tertiary) 4%,transparent) 50%,color-mix(in srgb,var(--t-secondary) 2%,transparent) 100%)", border: "1px solid var(--t-border)" }} />

          {/* Ambient orbs */}
          {[
            { w: 170, h: 170, l: "8%",  t: "10%", color: "var(--t-glow)",  delay: "0s"   },
            { w: 120, h: 120, l: "60%", t: "8%",  color: "var(--t-glow2)", delay: "-7s"  },
            { w: 150, h: 150, l: "55%", t: "58%", color: "var(--t-glow)",  delay: "-4s"  },
          ].map((o, i) => (
            <div key={i} style={{ position: "absolute", width: o.w, height: o.h, left: o.l, top: o.t, borderRadius: "50%", background: `radial-gradient(circle,${o.color} 0%,transparent 70%)`, filter: "blur(35px)", animation: "regFloat 18s ease-in-out infinite", animationDelay: o.delay, pointerEvents: "none", zIndex: 1 }} />
          ))}

          {/* Badge */}
          <div style={{ position: "absolute", top: "10%", right: "8%", zIndex: 10, padding: "6px 14px", borderRadius: 99, background: "color-mix(in srgb,var(--t-primary) 8%,transparent)", border: "1px solid var(--t-border2)", backdropFilter: "blur(12px)", display: "flex", alignItems: "center", gap: 6, animation: "regFloat 5s ease-in-out infinite" }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--t-primary)", animation: "regPulse 2s ease-in-out infinite", boxShadow: "0 0 6px var(--t-primary)" }} />
            <span style={{ color: "var(--t-primary)", fontSize: 11.5, fontWeight: 700 }}>Free forever</span>
          </div>

          {/* Chat preview */}
          <div style={{ position: "relative", zIndex: 10, width: "80%", maxWidth: 360 }}>
            <ChatPreview />
          </div>

          <div style={{ position: "relative", zIndex: 10, textAlign: "center", marginTop: "1rem" }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: "var(--t-text)", margin: "0 0 5px" }}>Everything you need</h2>
            <p style={{ fontSize: 12.5, color: "var(--t-text3)", margin: 0, maxWidth: 280, lineHeight: 1.65 }}>
              Private chats, video calls, whiteboards, sticky notes &amp; more.
            </p>
          </div>

          {/* Feature checklist */}
          <div style={{ display: "flex", flexDirection: "column", gap: 7, marginTop: "0.9rem", position: "relative", zIndex: 10 }}>
            {[["💬","End-to-end encrypted private chats"],["📹","HD video calls via Agora"],["🎨","Real-time collaborative whiteboard"],["📌","Personal sticky notes"],].map(([icon, text]) => (
              <div key={text} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 18, height: 18, borderRadius: 5, background: "color-mix(in srgb,var(--t-primary) 12%,transparent)", border: "1px solid var(--t-border2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg width="9" height="9" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="var(--t-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </div>
                <span style={{ fontSize: 11.5, color: "var(--t-text2)" }}>{icon} {text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}