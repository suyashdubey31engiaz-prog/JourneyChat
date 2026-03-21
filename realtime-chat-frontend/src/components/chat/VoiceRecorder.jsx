import React, { useState, useRef, useEffect } from "react";
import { FaMicrophone, FaTimes, FaPaperPlane } from "react-icons/fa";

/**
 * VoiceRecorder
 * Props:
 *   onSend   (audioBlob, duration) => void
 *   onCancel () => void
 */
const VoiceRecorder = ({ onSend, onCancel }) => {
  const [duration,  setDuration]  = useState(0);
  const [recording, setRecording] = useState(false);
  const [error,     setError]     = useState("");

  const mediaRef  = useRef(null);
  const chunksRef = useRef([]);
  const timerRef  = useRef(null);

  useEffect(() => {
    start();
    return () => stop(false); // cleanup — cancel if component unmounts
  }, []);

  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      chunksRef.current = [];
      const mr = new MediaRecorder(stream, { mimeType: "audio/webm" });
      mediaRef.current = mr;
      mr.ondataavailable = e => chunksRef.current.push(e.data);
      mr.start();
      setRecording(true);
      timerRef.current = setInterval(() => setDuration(d => d + 1), 1000);
    } catch {
      setError("Microphone access denied");
    }
  };

  const stop = (send = true) => {
    clearInterval(timerRef.current);
    const mr = mediaRef.current;
    if (!mr || mr.state === "inactive") return;
    mr.onstop = () => {
      const stream = mr.stream;
      stream?.getTracks().forEach(t => t.stop());
      if (send && chunksRef.current.length > 0) {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        onSend(blob, duration);
      }
    };
    mr.stop();
    setRecording(false);
  };

  const fmt = (s) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  if (error) return (
    <div className="flex items-center gap-2 px-4 py-3 text-sm text-red-400">
      <span>{error}</span>
      <button onClick={onCancel}><FaTimes /></button>
    </div>
  );

  return (
    <div className="flex items-center gap-3 px-4 py-3 animate-fade-in"
      style={{
        background: "rgba(239,68,68,0.06)",
        borderTop: "1px solid rgba(239,68,68,0.2)",
      }}>
      {/* Pulsing mic icon */}
      <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
        style={{ background: "#ef4444", boxShadow: "0 0 14px rgba(239,68,68,0.5)" }}>
        <FaMicrophone size={14} className="text-white animate-pulse" />
      </div>

      {/* Waveform bars (animated CSS) */}
      <div className="flex items-center gap-0.5 flex-1">
        {Array.from({ length: 24 }).map((_, i) => (
          <div key={i}
            className="rounded-full"
            style={{
              width: 3,
              height: `${8 + Math.abs(Math.sin(i * 0.8)) * 16}px`,
              background: "#ef4444",
              opacity: recording ? 0.7 + Math.random() * 0.3 : 0.3,
              animation: recording ? `typing-bounce ${0.8 + (i % 3) * 0.2}s ease-in-out infinite` : "none",
              animationDelay: `${i * 0.05}s`,
            }} />
        ))}
      </div>

      {/* Timer */}
      <span className="font-mono text-sm font-bold shrink-0" style={{ color: "#ef4444" }}>
        {fmt(duration)}
      </span>

      {/* Cancel */}
      <button onClick={() => { stop(false); onCancel(); }}
        className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:bg-white/10 shrink-0"
        style={{ color: "var(--muted)" }}>
        <FaTimes size={14} />
      </button>

      {/* Send */}
      <button onClick={() => stop(true)}
        className="w-10 h-10 rounded-full flex items-center justify-center text-white transition-all hover:scale-110 shrink-0"
        style={{ background: "var(--primary)", boxShadow: "0 0 12px rgba(0,245,255,0.4)" }}>
        <FaPaperPlane size={14} style={{ color: "#041017" }} />
      </button>
    </div>
  );
};

export default VoiceRecorder;