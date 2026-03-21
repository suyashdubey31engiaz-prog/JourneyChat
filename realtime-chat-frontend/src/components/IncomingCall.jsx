import React, { useContext, useEffect, useRef } from "react";
import { ChatContext } from "../context/ChatContext";

const IncomingCall = () => {
  const { incomingCall, acceptCall, rejectCall } = useContext(ChatContext);
  const audioRef = useRef(null);

  // ── Ring tone via Web Audio ───────────────────────────────────────────────
  useEffect(() => {
    if (!incomingCall) return;
    let ctx, interval;
    const ring = () => {
      try {
        ctx = new (window.AudioContext || window.webkitAudioContext)();
        const o1 = ctx.createOscillator();
        const o2 = ctx.createOscillator();
        const g  = ctx.createGain();
        o1.connect(g); o2.connect(g); g.connect(ctx.destination);
        o1.frequency.value = 960; o2.frequency.value = 1280;
        g.gain.setValueAtTime(0, ctx.currentTime);
        g.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 0.05);
        g.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 0.3);
        g.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.38);
        o1.start(); o2.start();
        o1.stop(ctx.currentTime + 0.4); o2.stop(ctx.currentTime + 0.4);
      } catch {}
    };
    ring();
    interval = setInterval(ring, 1400);
    return () => { clearInterval(interval); ctx?.close().catch(()=>{}); };
  }, [incomingCall]);

  if (!incomingCall) return null;

  const name   = incomingCall.from?.name || "Someone";
  const avatar = incomingCall.from?.avatar;
  const letter = name.charAt(0).toUpperCase();
  const isVideo = incomingCall.callType !== "audio";

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      display: "flex", alignItems: "center", justifyContent: "center",
      background: "rgba(5,8,16,0.88)",
      backdropFilter: "blur(18px)",
      animation: "fade-in 0.3s ease both",
      fontFamily: "Poppins,sans-serif",
    }}>
      <div style={{
        width: "100%", maxWidth: 360, padding: "36px 28px 32px",
        background: "linear-gradient(145deg,rgba(10,16,32,0.98),rgba(6,10,22,0.99))",
        border: "1px solid rgba(0,245,255,0.15)",
        borderRadius: 28,
        boxShadow: "0 0 80px rgba(0,245,255,0.08), 0 32px 80px rgba(0,0,0,0.8)",
        display: "flex", flexDirection: "column", alignItems: "center", gap: 0,
        animation: "scale-in 0.25s ease both",
      }}>

        {/* Type badge */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 5,
          padding: "5px 14px", borderRadius: 99, marginBottom: 24,
          background: "rgba(0,245,255,0.06)",
          border: "1px solid rgba(0,245,255,0.15)",
          fontSize: 11, fontWeight: 700, color: "#00F5FF",
          textTransform: "uppercase", letterSpacing: ".09em",
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: "50%",
            background: "#00F5FF", boxShadow: "0 0 6px #00F5FF",
            animation: "pulse-glow 1.5s ease-in-out infinite",
          }}/>
          Incoming {isVideo ? "Video" : "Voice"} Call
        </div>

        {/* Avatar with rings */}
        <div style={{ position: "relative", marginBottom: 22 }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{
              position: "absolute",
              inset: -(i * 16),
              borderRadius: "50%",
              border: `1.5px solid rgba(0,245,255,${0.2 - i * 0.04})`,
              animation: `ring 1.6s ease-out ${i * 0.35}s infinite`,
            }} />
          ))}
          {avatar ? (
            <img src={avatar} alt={name}
              style={{ width: 96, height: 96, borderRadius: "50%", objectFit: "cover", position: "relative", zIndex: 5 }} />
          ) : (
            <div style={{
              width: 96, height: 96, borderRadius: "50%",
              background: "linear-gradient(135deg,#0e7490,#1d4ed8)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 38, fontWeight: 900, color: "white",
              boxShadow: "0 0 0 3px #070B14, 0 0 0 5px rgba(0,245,255,0.4), 0 0 30px rgba(0,245,255,0.2)",
              position: "relative", zIndex: 5,
            }}>
              {letter}
            </div>
          )}
        </div>

        {/* Name */}
        <h2 style={{ fontSize: 24, fontWeight: 800, color: "#E8EAF0", margin: "0 0 4px", textAlign: "center" }}>
          {name}
        </h2>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", margin: "0 0 36px" }}>
          is calling you…
        </p>

        {/* Buttons */}
        <div style={{ display: "flex", justifyContent: "center", gap: 48, width: "100%" }}>
          {/* Decline */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            <button onClick={rejectCall}
              style={{
                width: 64, height: 64, borderRadius: "50%", border: "none",
                background: "linear-gradient(135deg,#ef4444,#b91c1c)",
                boxShadow: "0 4px 24px rgba(239,68,68,0.5), 0 0 40px rgba(239,68,68,0.2)",
                cursor: "pointer", fontSize: 26,
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "transform .15s",
              }}
              onMouseEnter={e => e.currentTarget.style.transform = "scale(1.1)"}
              onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>
              📵
            </button>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 600 }}>Decline</span>
          </div>

          {/* Accept */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            <button onClick={acceptCall}
              style={{
                width: 64, height: 64, borderRadius: "50%", border: "none",
                background: "linear-gradient(135deg,#22c55e,#15803d)",
                boxShadow: "0 4px 24px rgba(34,197,94,0.5), 0 0 40px rgba(34,197,94,0.2)",
                cursor: "pointer", fontSize: 26,
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "transform .15s",
                animation: "pulse-glow 2s ease-in-out infinite",
              }}
              onMouseEnter={e => e.currentTarget.style.transform = "scale(1.1)"}
              onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>
              {isVideo ? "📹" : "📞"}
            </button>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 600 }}>Accept</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default IncomingCall;