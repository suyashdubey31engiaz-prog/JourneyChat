// src/components/auth/Login.jsx
import React, { useState, useContext, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext }  from "../../context/AuthContext";
import { ThemeContext } from "../../context/ThemeContext";
import { loginUser }    from "../../utils/api";

// ── Eye toggle ─────────────────────────────────────────────────────────────────
const EyeIcon = ({ open }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    {open
      ? <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
      : <><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></>
    }
  </svg>
);

// ── Theme-aware input ──────────────────────────────────────────────────────────
function ThemeInput({ label, type = "text", value, onChange, placeholder, rightEl, autoComplete }) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label style={{
        display: "block", fontSize: 11, fontWeight: 700, letterSpacing: ".06em",
        textTransform: "uppercase", marginBottom: 6,
        color: focused ? "var(--t-primary)" : "var(--t-text3)",
        transition: "color .2s",
      }}>{label}</label>
      <div style={{ position: "relative" }}>
        <input
          type={type} value={value} onChange={onChange}
          placeholder={placeholder} autoComplete={autoComplete}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          style={{
            width: "100%", boxSizing: "border-box",
            padding: rightEl ? "11px 42px 11px 14px" : "11px 14px",
            borderRadius: 11,
            background: focused ? "color-mix(in srgb, var(--t-primary) 4%, transparent)" : "rgba(255,255,255,0.04)",
            border: `1.5px solid ${focused ? "var(--t-border2)" : "var(--t-border)"}`,
            boxShadow: focused ? "0 0 0 3px var(--t-card-glow)" : "none",
            color: "var(--t-text)", fontSize: 13.5,
            fontFamily: "var(--t-font, 'Sora','Poppins',sans-serif)",
            outline: "none", transition: "all .22s",
          }}
        />
        {rightEl && (
          <div style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)" }}>
            {rightEl}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Saved account chip ────────────────────────────────────────────────────────
function AccountChip({ acc, onSwitch, onForget }) {
  const [hov, setHov] = useState(false);
  const expired = acc.expiresAt && Date.now() > acc.expiresAt;
  return (
    <div
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      onClick={() => onSwitch(acc)}
      style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "10px 13px", borderRadius: 13,
        background: hov ? "color-mix(in srgb,var(--t-primary) 8%,transparent)" : "rgba(255,255,255,0.03)",
        border: `1px solid ${hov ? "var(--t-border2)" : "var(--t-border)"}`,
        transition: "all .18s", cursor: "pointer",
        boxShadow: hov ? "0 4px 16px rgba(0,0,0,0.3)" : "none",
      }}>
      {acc.avatar
        ? <img src={acc.avatar} style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover", border: "1.5px solid var(--t-border2)", flexShrink: 0 }} alt="" />
        : <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,var(--t-primary),var(--t-tertiary))", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "var(--t-bg)", fontSize: 13, flexShrink: 0 }}>
            {(acc.name || "?").charAt(0).toUpperCase()}
          </div>
      }
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "var(--t-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{acc.name}</p>
        <p style={{ margin: 0, fontSize: 10.5, color: expired ? "#f87171" : "var(--t-text3)" }}>
          {expired ? "Session expired — sign in again" : acc.email}
        </p>
      </div>
      <button
        onClick={e => { e.stopPropagation(); onForget(acc.email); }}
        title="Remove account"
        style={{ background: "none", border: "none", cursor: "pointer", color: "var(--t-text3)", fontSize: 14, padding: "2px 5px", borderRadius: 6, flexShrink: 0, transition: "color .15s" }}
        onMouseEnter={e => e.currentTarget.style.color = "#f87171"}
        onMouseLeave={e => e.currentTarget.style.color = "var(--t-text3)"}>✕</button>
    </div>
  );
}

// ── Neon card fan (credit-card aesthetic) ─────────────────────────────────────
const CardFan = () => (
  <div style={{ position: "relative", width: 230, height: 150, marginBottom: 32, flexShrink: 0 }}>
    {/* Card 1 — back-left */}
    <div style={{
      position: "absolute", width: 186, height: 115, borderRadius: 20,
      background: "linear-gradient(135deg, rgba(139,92,246,0.22), rgba(139,92,246,0.08))",
      border: "1.5px solid rgba(139,92,246,0.4)",
      boxShadow: "0 4px 24px rgba(139,92,246,0.2)",
      transform: "rotate(-11deg) translateY(14px) translateX(-12px)",
      left: 0, top: 0, zIndex: 1, overflow: "hidden",
    }}>
      <div style={{ position: "absolute", right: -8, bottom: -8, width: "55%", height: "130%", backgroundImage: "radial-gradient(circle,rgba(139,92,246,0.55) 1.2px,transparent 1.2px)", backgroundSize: "9px 9px", opacity: 0.2 }} />
    </div>

    {/* Card 2 — mid */}
    <div style={{
      position: "absolute", width: 186, height: 115, borderRadius: 20,
      background: "linear-gradient(135deg, rgba(255,230,0,0.18), rgba(255,179,0,0.07))",
      border: "1.5px solid rgba(255,230,0,0.4)",
      boxShadow: "0 4px 24px rgba(255,230,0,0.18)",
      transform: "rotate(-4deg) translateY(8px) translateX(18px)",
      left: 0, top: 0, zIndex: 2, overflow: "hidden",
    }}>
      <div style={{ position: "absolute", right: -8, bottom: -8, width: "55%", height: "130%", backgroundImage: "radial-gradient(circle,rgba(255,230,0,0.65) 1.2px,transparent 1.2px)", backgroundSize: "9px 9px", opacity: 0.18 }} />
      <div style={{ position: "absolute", bottom: 14, left: 13, display: "flex", gap: 5, opacity: 0.5 }}>
        {[0,1,2,3].map(g => (
          <div key={g} style={{ display: "flex", gap: 2 }}>
            {[0,1,2,3].map(d => <div key={d} style={{ width: 3, height: 3, borderRadius: "50%", background: "#FFE600" }} />)}
          </div>
        ))}
      </div>
    </div>

    {/* Card 3 — front */}
    <div style={{
      position: "absolute", width: 188, height: 117, borderRadius: 20,
      background: "linear-gradient(135deg, var(--t-card-bg), rgba(0,0,0,0.6))",
      border: "1.5px solid var(--t-border2)",
      boxShadow: "0 0 32px var(--t-glow), 0 8px 32px rgba(0,0,0,0.4)",
      transform: "rotate(3deg) translateY(0px) translateX(34px)",
      left: 0, top: 0, zIndex: 3, overflow: "hidden",
    }}>
      {/* Holographic shimmer */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(125deg,transparent 30%,rgba(255,255,255,0.07) 50%,transparent 70%)", backgroundSize: "300% 300%", animation: "loginHolo 5s linear infinite", pointerEvents: "none" }} />
      <div style={{ position: "absolute", right: -8, bottom: -8, width: "55%", height: "130%", backgroundImage: "radial-gradient(circle,var(--t-primary) 1.2px,transparent 1.2px)", backgroundSize: "9px 9px", opacity: 0.2 }} />
      {/* NFC icon */}
      <div style={{ position: "absolute", top: 10, left: 12, opacity: 0.75 }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--t-primary)" strokeWidth="2">
          <path d="M9 17c2-2 2-6 0-8M12 19.5c3.3-3.3 3.3-9.7 0-13M6 14.5c1-1 1-4 0-5" />
        </svg>
      </div>
      {/* Mastercard circles */}
      <div style={{ position: "absolute", top: 8, right: 12, display: "flex", alignItems: "center" }}>
        <div style={{ width: 20, height: 20, borderRadius: "50%", background: "var(--t-primary)", opacity: 0.6, marginRight: -7 }} />
        <div style={{ width: 20, height: 20, borderRadius: "50%", background: "var(--t-secondary)", opacity: 0.55 }} />
      </div>
      {/* Card number dots */}
      <div style={{ position: "absolute", bottom: 14, left: 13, display: "flex", gap: 5, opacity: 0.65 }}>
        {[0,1,2,3].map(g => (
          <div key={g} style={{ display: "flex", gap: 2 }}>
            {[0,1,2,3].map(d => <div key={d} style={{ width: 3, height: 3, borderRadius: "50%", background: "var(--t-primary)" }} />)}
          </div>
        ))}
      </div>
    </div>
  </div>
);

// ── Feature badge pills ───────────────────────────────────────────────────────
const FEATS = [["💬","Private Chat"],["🌍","Global"],["📹","Video Calls"],["🎨","Whiteboard"]];

// ════════════════════════════════════════════════════════════════════════════════
export default function Login() {
  const { login, savedAccounts, switchAccount, forgetAccount } = useContext(AuthContext);
  const { theme, activeParticles } = useContext(ThemeContext);
  const navigate   = useNavigate();
  const location   = useLocation();
  const successMsg = location.state?.message || "";
  const params     = new URLSearchParams(location.search);
  const preEmail   = params.get("email") || "";

  const [email,        setEmail]        = useState(preEmail);
  const [password,     setPassword]     = useState("");
  const [showPass,     setShowPass]     = useState(false);
  const [remember,     setRemember]     = useState(true);
  const [loading,      setLoading]      = useState(false);
  const [err,          setErr]          = useState("");
  const [mounted,      setMounted]      = useState(false);
  const [showAccounts, setShowAccounts] = useState((savedAccounts?.length ?? 0) > 0 && !preEmail);

  useEffect(() => { setTimeout(() => setMounted(true), 50); }, []);

  const submit = async (e) => {
    e.preventDefault(); setErr(""); setLoading(true);
    try {
      const res = await loginUser({ email, password, remember });
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
        @keyframes loginHolo{0%{background-position:200% 200%}100%{background-position:-200% -200%}}
        @keyframes loginSlideUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
        @keyframes loginSpin{to{transform:rotate(360deg)}}
        @keyframes loginFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}
        @keyframes loginPulse{0%,100%{opacity:1}50%{opacity:.45}}
        .login-scroll::-webkit-scrollbar{width:3px}
        .login-scroll::-webkit-scrollbar-thumb{background:var(--t-scrollbar,#1a3a5c);border-radius:3px}
        .login-scroll::-webkit-scrollbar-track{background:transparent}
        input::placeholder{color:var(--t-text3)!important}
        input:-webkit-autofill{-webkit-box-shadow:0 0 0 100px var(--t-bg2,#0D1526) inset!important;-webkit-text-fill-color:var(--t-text,#E8EAF0)!important}
      `}</style>

      <div style={{
        height: "100vh", width: "100%", display: "flex", overflow: "hidden",
        fontFamily: "var(--t-font,'Sora','Poppins',sans-serif)",
        background: "var(--t-bg, #060A13)", position: "relative",
      }}>
        {/* Cyber grid background */}
        <div style={{
          position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
          backgroundImage: "linear-gradient(color-mix(in srgb,var(--t-primary) 2%,transparent) 1px,transparent 1px),linear-gradient(90deg,color-mix(in srgb,var(--t-primary) 2%,transparent) 1px,transparent 1px)",
          backgroundSize: "56px 56px",
        }} />

        {/* Ambient corner glows */}
        <div style={{ position: "fixed", top: 0, left: 0, width: 380, height: 380, borderRadius: "50%", background: "radial-gradient(circle,var(--t-card-glow) 0%,transparent 65%)", pointerEvents: "none", zIndex: 0 }} />
        <div style={{ position: "fixed", bottom: 0, right: 0, width: 320, height: 320, borderRadius: "50%", background: "radial-gradient(circle,var(--t-glow2) 0%,transparent 65%)", pointerEvents: "none", zIndex: 0, opacity: 0.6 }} />

        {/* ── LEFT PANEL ─────────────────────────────────────────────────── */}
        <div className="login-scroll" style={{
          width: "45%", minWidth: 320, height: "100vh", overflowY: "auto",
          display: "flex", flexDirection: "column", justifyContent: "center",
          padding: "1.5rem 2.8rem", position: "relative", zIndex: 10,
          opacity: mounted ? 1 : 0,
          transform: mounted ? "translateX(0)" : "translateX(-28px)",
          transition: "opacity .55s ease, transform .55s ease",
        }}>

          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "1.3rem" }}>
            <div style={{
              width: 38, height: 38, borderRadius: 11, flexShrink: 0,
              background: "linear-gradient(135deg,var(--t-primary),var(--t-tertiary))",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 0 20px var(--t-glow)", fontSize: 18,
            }}>💬</div>
            <span style={{
              fontSize: 16, fontWeight: 800,
              background: "linear-gradient(90deg,var(--t-grad1),var(--t-grad2),var(--t-grad3))",
              backgroundSize: "250% 100%",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
              animation: "loginHolo 6s linear infinite",
            }}>JourneyChat</span>
          </div>

          {showAccounts && (savedAccounts?.length ?? 0) > 0 ? (
            /* ── Saved accounts view ── */
            <div style={{ animation: "loginSlideUp .5s ease both" }}>
              <h1 style={{ fontSize: 25, fontWeight: 900, color: "var(--t-text)", margin: "0 0 4px", letterSpacing: "-0.5px" }}>Welcome back 👋</h1>
              <p style={{ color: "var(--t-text3)", fontSize: 13, margin: "0 0 18px" }}>Choose an account to continue</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
                {savedAccounts.map(acc => (
                  <AccountChip key={acc.email} acc={acc} onSwitch={handleSwitch} onForget={forgetAccount} />
                ))}
              </div>
              <button onClick={() => setShowAccounts(false)} style={{
                width: "100%", padding: "11px", borderRadius: 12,
                border: "1px solid var(--t-border)", background: "rgba(255,255,255,0.04)",
                color: "var(--t-text2)", cursor: "pointer", fontSize: 13,
                fontWeight: 600, fontFamily: "var(--t-font)", transition: "all .2s",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--t-border2)"; e.currentTarget.style.color = "var(--t-primary)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--t-border)";  e.currentTarget.style.color = "var(--t-text2)"; }}>
                + Use a different account
              </button>
            </div>
          ) : (
            <>
              {savedAccounts?.length > 0 && !preEmail && (
                <button onClick={() => setShowAccounts(true)} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 14, background: "none", border: "none", cursor: "pointer", color: "var(--t-primary)", fontSize: 12.5, fontWeight: 600, padding: 0, fontFamily: "var(--t-font)" }}>
                  ← Saved accounts
                </button>
              )}

              <div style={{ marginBottom: "1.1rem", animation: "loginSlideUp .5s ease .08s both" }}>
                <h1 style={{ fontSize: 26, fontWeight: 900, letterSpacing: "-0.5px", color: "var(--t-text)", margin: "0 0 5px", lineHeight: 1.15 }}>
                  Sign in to{" "}
                  <span style={{
                    background: "linear-gradient(90deg,var(--t-grad1),var(--t-grad2),var(--t-grad3),var(--t-grad1))",
                    backgroundSize: "250% 100%",
                    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                    animation: "loginHolo 4s linear infinite",
                  }}>JourneyChat</span>
                </h1>
                <p style={{ color: "var(--t-text3)", fontSize: 13, margin: 0 }}>Your conversations, reimagined.</p>
              </div>

              {/* Alerts */}
              {successMsg && (
                <div style={{ padding: "9px 13px", borderRadius: 9, marginBottom: 12, fontSize: 12.5, background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.25)", color: "#4ade80", animation: "loginSlideUp .35s ease both" }}>
                  ✓ {successMsg}
                </div>
              )}
              {err && (
                <div style={{ padding: "9px 13px", borderRadius: 9, marginBottom: 12, fontSize: 12.5, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", color: "#f87171", animation: "loginSlideUp .35s ease both" }}>
                  ⚠ {err}
                </div>
              )}

              <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 13 }}>
                <div style={{ animation: "loginSlideUp .5s ease .1s both" }}>
                  <ThemeInput label="Email Address" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" />
                </div>

                <div style={{ animation: "loginSlideUp .5s ease .16s both" }}>
                  <ThemeInput label="Password" type={showPass ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" autoComplete="current-password"
                    rightEl={
                      <button type="button" onClick={() => setShowPass(s => !s)}
                        style={{ background: "none", border: "none", cursor: "pointer", color: "var(--t-text3)", padding: 3, lineHeight: 1, transition: "color .2s" }}
                        onMouseEnter={e => e.currentTarget.style.color = "var(--t-primary)"}
                        onMouseLeave={e => e.currentTarget.style.color = "var(--t-text3)"}>
                        <EyeIcon open={showPass} />
                      </button>
                    }
                  />
                </div>

                {/* Remember + Forgot */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", animation: "loginSlideUp .5s ease .2s both" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 9, cursor: "pointer" }}>
                    <div
                      onClick={() => setRemember(r => !r)}
                      style={{
                        width: 18, height: 18, borderRadius: 5, flexShrink: 0, cursor: "pointer",
                        background: remember ? "linear-gradient(135deg,var(--t-primary),var(--t-tertiary))" : "rgba(255,255,255,0.05)",
                        border: `1.5px solid ${remember ? "transparent" : "var(--t-border)"}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        transition: "all .2s", boxShadow: remember ? "0 0 10px var(--t-glow)" : "none",
                      }}>
                      {remember && <svg width="9" height="9" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="var(--t-bg)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                    </div>
                    <div>
                      <span style={{ fontSize: 12.5, color: "var(--t-text2)", userSelect: "none" }}>Keep me signed in</span>
                      <p style={{ margin: 0, fontSize: 10, color: "var(--t-text3)", lineHeight: 1.3 }}>Stays logged in for 15 days</p>
                    </div>
                  </label>
                  <a href="#" style={{ fontSize: 12, color: "var(--t-primary)", textDecoration: "none", fontWeight: 600, flexShrink: 0, opacity: 0.85 }}>Forgot?</a>
                </div>

                {/* Submit */}
                <div style={{ animation: "loginSlideUp .5s ease .25s both" }}>
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
                      ? <><svg style={{ animation: "loginSpin 1s linear infinite", width: 15, height: 15 }} fill="none" viewBox="0 0 24 24"><circle style={{ opacity: .25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path style={{ opacity: .75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Signing in…</>
                      : <>Log In <span style={{ fontSize: 16 }}>→</span></>
                    }
                  </button>
                </div>
              </form>

              {/* Divider + Social */}
              <div style={{ display: "flex", alignItems: "center", gap: 11, margin: "14px 0 11px" }}>
                <div style={{ flex: 1, height: 1, background: "var(--t-border)" }} />
                <span style={{ fontSize: 11, color: "var(--t-text3)", whiteSpace: "nowrap" }}>or sign in with</span>
                <div style={{ flex: 1, height: 1, background: "var(--t-border)" }} />
              </div>
              <div style={{ display: "flex", gap: 9 }}>
                {[["f","Facebook","#1877F2"],["𝕏","Twitter","#1DA1F2"],["G","Google","#EA4335"]].map(([ic, lb, col]) => {
                  const [h, setH] = useState(false);
                  return (
                    <button key={lb} type="button" title={lb}
                      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
                      style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 40, height: 40, borderRadius: 10, cursor: "pointer", background: h ? `${col}12` : "rgba(255,255,255,0.04)", border: `1.5px solid ${h ? col : "var(--t-border)"}`, transition: "all .2s", color: h ? col : "var(--t-text3)", fontSize: 15, boxShadow: h ? `0 0 14px ${col}33` : "none" }}>
                      {ic}
                    </button>
                  );
                })}
              </div>

              <p style={{ marginTop: 14, fontSize: 13, color: "var(--t-text3)" }}>
                No account? <Link to="/register" style={{ color: "var(--t-primary)", fontWeight: 700, textDecoration: "none" }}>Create one →</Link>
              </p>
              <p style={{ fontSize: 10.5, color: "color-mix(in srgb,var(--t-text3) 50%,transparent)", marginTop: 8 }}>🔒 End-to-end encrypted</p>
            </>
          )}
        </div>

        {/* ── RIGHT PANEL ───────────────────────────────────────────────── */}
        <div style={{
          flex: 1, position: "relative", zIndex: 5,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          padding: "1.5rem", overflow: "hidden",
          opacity: mounted ? 1 : 0,
          transform: mounted ? "translateX(0)" : "translateX(36px)",
          transition: "opacity .65s ease .15s, transform .65s ease .15s",
        }}>
          {/* Inner frame */}
          <div style={{
            position: "absolute", inset: "4%", borderRadius: 28,
            background: "linear-gradient(145deg,color-mix(in srgb,var(--t-primary) 3%,transparent) 0%,color-mix(in srgb,var(--t-tertiary) 4%,transparent) 50%,color-mix(in srgb,var(--t-secondary) 2%,transparent) 100%)",
            border: "1px solid var(--t-border)",
          }} />

          {/* Floating ambient orbs */}
          {[
            { w: 180, h: 180, l: "12%", t: "8%",  color: "var(--t-glow)",  delay: "0s"  },
            { w: 130, h: 130, l: "55%", t: "11%", color: "var(--t-glow2)", delay: "-6s" },
            { w: 100, h: 100, l: "20%", t: "60%", color: "var(--t-glow)",  delay: "-11s" },
            { w: 150, h: 150, l: "60%", t: "55%", color: "var(--t-glow2)", delay: "-4s" },
          ].map((o, i) => (
            <div key={i} style={{ position: "absolute", width: o.w, height: o.h, left: o.l, top: o.t, borderRadius: "50%", background: `radial-gradient(circle,${o.color} 0%,transparent 70%)`, filter: "blur(35px)", animation: "loginFloat 18s ease-in-out infinite", animationDelay: o.delay, pointerEvents: "none", zIndex: 1 }} />
          ))}

          {/* Floating stat badges */}
          <div style={{ position: "absolute", top: "10%", left: "8%", zIndex: 10, padding: "6px 14px", borderRadius: 99, background: "color-mix(in srgb,var(--t-primary) 8%,transparent)", border: "1px solid var(--t-border2)", backdropFilter: "blur(12px)", display: "flex", alignItems: "center", gap: 6, animation: "loginFloat 5s ease-in-out infinite" }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--t-primary)", animation: "loginPulse 2s ease-in-out infinite", boxShadow: "0 0 6px var(--t-primary)" }} />
            <span style={{ color: "var(--t-primary)", fontSize: 11.5, fontWeight: 700 }}>1,248 online</span>
          </div>
          <div style={{ position: "absolute", top: "15%", right: "8%", zIndex: 10, padding: "6px 14px", borderRadius: 99, background: "color-mix(in srgb,var(--t-secondary) 8%,transparent)", border: "1px solid color-mix(in srgb,var(--t-secondary) 35%,transparent)", backdropFilter: "blur(12px)", display: "flex", alignItems: "center", gap: 6, animation: "loginFloat 6s ease-in-out infinite", animationDelay: "-3s" }}>
            <span style={{ fontSize: 12 }}>💬</span>
            <span style={{ color: "var(--t-secondary)", fontSize: 11.5, fontWeight: 700 }}>24M msgs/day</span>
          </div>

          {/* Card fan — centerpiece */}
          <div style={{ position: "relative", zIndex: 10 }}>
            <CardFan />
          </div>

          {/* Tagline */}
          <div style={{ position: "relative", zIndex: 10, textAlign: "center", marginTop: "0.8rem" }}>
            <h2 style={{ fontSize: 19, fontWeight: 800, color: "var(--t-text)", margin: "0 0 6px", letterSpacing: "-0.2px" }}>
              Connect across every device
            </h2>
            <p style={{ fontSize: 12.5, color: "var(--t-text3)", margin: 0, maxWidth: 300, lineHeight: 1.65 }}>
              Real-time chat, video calls &amp; whiteboards — wherever you are.
            </p>
          </div>

          {/* Feature pills */}
          <div style={{ display: "flex", gap: 7, flexWrap: "wrap", justifyContent: "center", marginTop: "0.9rem", position: "relative", zIndex: 10 }}>
            {FEATS.map(([icon, label]) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 12px", borderRadius: 99, background: "color-mix(in srgb,var(--t-primary) 6%,transparent)", border: "1px solid var(--t-border)", color: "var(--t-text2)", fontSize: 11.5 }}>
                {icon} {label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}