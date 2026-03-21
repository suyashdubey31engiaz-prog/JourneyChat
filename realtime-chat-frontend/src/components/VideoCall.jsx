import React, { useEffect, useRef, useState, useContext } from "react";
import AgoraRTC from "agora-rtc-sdk-ng";
import Draggable from "react-draggable";
import { AuthContext } from "../context/AuthContext";
import { ChatContext } from "../context/ChatContext";
import axios from "axios";

const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
const API  = axios.create({ baseURL: `${BASE}/api` });
API.interceptors.request.use(req => {
  const t = localStorage.getItem("token");
  if (t) req.headers.Authorization = `Bearer ${t}`;
  return req;
});
const APP_ID = import.meta.env.VITE_AGORA_APP_ID;

// ── Duration timer ─────────────────────────────────────────────────────────
const useDuration = (running) => {
  const [secs, setSecs] = useState(0);
  useEffect(() => {
    if (!running) { setSecs(0); return; }
    const id = setInterval(() => setSecs(s => s + 1), 1000);
    return () => clearInterval(id);
  }, [running]);
  return `${String(Math.floor(secs/60)).padStart(2,"0")}:${String(secs%60).padStart(2,"0")}`;
};

// ── Control button ─────────────────────────────────────────────────────────
const CtrlBtn = ({ onClick, active=true, danger=false, children, label, size="md" }) => {
  const [hov, setHov] = useState(false);
  const sz = size==="lg" ? 64 : size==="sm" ? 44 : 54;
  const bg = danger
    ? (hov ? "#cc0000" : "#ef4444")
    : active
      ? (hov ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.18)")
      : (hov ? "rgba(60,60,80,0.9)" : "rgba(40,40,60,0.9)");

  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:5 }}>
      <button onClick={onClick}
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{
          width:sz, height:sz, borderRadius:"50%",
          background:bg,
          border: danger ? "none" : `1px solid rgba(255,255,255,${active?0.25:0.1})`,
          cursor:"pointer",
          display:"flex", alignItems:"center", justifyContent:"center",
          color: danger ? "white" : active ? "white" : "rgba(255,255,255,0.5)",
          boxShadow: danger
            ? "0 4px 20px rgba(239,68,68,0.55), 0 0 40px rgba(239,68,68,0.2)"
            : "none",
          transition:"all .2s", outline:"none",
          backdropFilter:"blur(10px)",
        }}>
        {children}
      </button>
      {label && (
        <span style={{ fontSize:11, color:"rgba(255,255,255,0.5)", fontWeight:500, whiteSpace:"nowrap" }}>
          {label}
        </span>
      )}
    </div>
  );
};

// ── SVG Icons ─────────────────────────────────────────────────────────────
const MicOnIcon  = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>;
const MicOffIcon = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="1" y1="1" x2="23" y2="23"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"/><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>;
const CamOnIcon  = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>;
const CamOffIcon = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="1" y1="1" x2="23" y2="23"/><path d="M21 21H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3m3-3h6l2 3h4a2 2 0 0 1 2 2v9.34m-7.72-2.06a4 4 0 1 1-5.56-5.56"/></svg>;
const EndIcon    = () => <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>;
const SpeakerIcon= () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>;

// ══════════════════════════════════════════════════════════════════════════════
const VideoCall = () => {
  const { user }                     = useContext(AuthContext);
  const { callContact, endCall, incomingCall } = useContext(ChatContext);

  const clientRef   = useRef(null);
  const localTracks = useRef({ audio: null, video: null });

  const [remoteUser,  setRemoteUser]  = useState(null);
  const [callState,   setCallState]   = useState("CONNECTING");
  const [audioMuted,  setAudioMuted]  = useState(false);
  const [videoMuted,  setVideoMuted]  = useState(false);
  const [speakerOn,   setSpeakerOn]   = useState(true);
  const [error,       setError]       = useState("");

  // Determine call type — video by default
  // callContact may be set by caller; incomingCall by callee
  const callType = callContact?.callType
    || incomingCall?.callType
    || "video";
  const isAudioOnly = callType === "audio";

  const channelName = [user?._id, callContact?._id].sort().join("-");
  const duration    = useDuration(callState === "CONNECTED");

  const name   = callContact?.name || "Unknown";
  const letter = name.charAt(0).toUpperCase();

  // ── Remote video ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (remoteUser?.videoTrack && !isAudioOnly) {
      remoteUser.videoTrack.play("remote-video");
    }
    return () => remoteUser?.videoTrack?.stop();
  }, [remoteUser, isAudioOnly]);

  // ── Agora join ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!callContact || !user) return;
    const client = AgoraRTC.createClient({ mode:"rtc", codec:"vp8" });
    clientRef.current = client;

    client.on("connection-state-change", st => {
      if (st === "CONNECTED")    setCallState("CONNECTED");
      if (st === "DISCONNECTED") setCallState("DISCONNECTED");
    });
    client.on("user-published", async (remote, mediaType) => {
      await client.subscribe(remote, mediaType);
      if (mediaType === "video") setRemoteUser(remote);
      if (mediaType === "audio") remote.audioTrack?.play();
    });
    client.on("user-left", remote => {
      setRemoteUser(prev => prev?.uid === remote.uid ? null : prev);
    });

    const join = async () => {
      try {
        const { data } = await API.get(`/agora/token?channel=${encodeURIComponent(channelName)}&uid=0`);
        await client.join(APP_ID, channelName, data.token, null);

        let tracks;
        if (isAudioOnly) {
          // Audio-only call — only create microphone track
          const audio = await AgoraRTC.createMicrophoneAudioTrack();
          localTracks.current = { audio, video: null };
          tracks = [audio];
        } else {
          // Video call — create both
          const [audio, video] = await AgoraRTC.createMicrophoneAndCameraTracks();
          localTracks.current = { audio, video };
          video.play("local-video");
          tracks = [audio, video];
        }

        await client.publish(tracks);
      } catch (err) {
        console.error("Agora error:", err);
        const msg =
          err.code === "UID_CONFLICT"      ? "Conflict: use different accounts in each browser." :
          err.code === "PERMISSION_DENIED" ? "Allow microphone (and camera for video) in your browser." :
          err.code === "DEVICE_NOT_FOUND"  ? "No microphone detected. Check your hardware." :
          err.code === "NOT_READABLE"      ? "Microphone/camera is in use by another app." :
          `Call failed. (${err.code || err.message})`;
        setError(msg);
        setCallState("FAILED");
      }
    };
    join();

    return () => {
      localTracks.current.audio?.close();
      localTracks.current.video?.close();
      client.removeAllListeners();
      if (client.connectionState === "CONNECTED") client.leave();
    };
  }, [callContact, user, isAudioOnly]);

  const toggleAudio = async () => {
    await localTracks.current.audio?.setEnabled(audioMuted);
    setAudioMuted(m => !m);
  };
  const toggleVideo = async () => {
    if (isAudioOnly) return;
    await localTracks.current.video?.setEnabled(videoMuted);
    setVideoMuted(m => !m);
  };

  // ── Status pill ───────────────────────────────────────────────────────────
  const StatusPill = () => (
    <span style={{
      display:"inline-flex", alignItems:"center", gap:5,
      padding:"3px 10px", borderRadius:99, fontSize:11, fontWeight:600,
      background:"rgba(0,0,0,0.3)",
    }}>
      {callState==="FAILED"
        ? <><span style={{color:"#ff4757"}}>●</span><span style={{color:"#ff4757"}}>Failed</span></>
        : callState==="CONNECTED"
          ? <><span style={{color:"#39FF14"}}>●</span><span style={{color:"#39FF14"}}>{duration}</span></>
          : <><span style={{color:"#FFE600"}}>●</span><span style={{color:"#FFE600"}}>Connecting…</span></>}
    </span>
  );

  // ── Audio-only UI (no video panels) ───────────────────────────────────────
  if (isAudioOnly) {
    return (
      <div style={{
        width:"100%", height:"100%", borderRadius:14, overflow:"hidden",
        position:"relative", fontFamily:"Poppins,sans-serif",
        background:"linear-gradient(145deg,#050a14,#0a1224)",
        display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
      }}>
        {/* Background ambient */}
        <div style={{
          position:"absolute", inset:0, zIndex:0, pointerEvents:"none",
          backgroundImage:"radial-gradient(circle at 30% 40%,rgba(57,255,20,0.05) 0%,transparent 50%),radial-gradient(circle at 70% 60%,rgba(0,245,255,0.04) 0%,transparent 50%)",
        }}/>

        <div style={{ position:"relative", zIndex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:20 }}>
          {/* Phone icon pulse */}
          <div style={{ position:"relative", marginBottom:8 }}>
            {callState === "CONNECTING" && [1,2,3].map(i=>(
              <div key={i} style={{
                position:"absolute", inset:-(i*20), borderRadius:"50%",
                border:`1.5px solid rgba(57,255,20,${0.2-i*0.04})`,
                animation:`ring 2s ease-out ${i*0.4}s infinite`,
              }}/>
            ))}
            <div style={{
              width:100, height:100, borderRadius:"50%",
              background:"linear-gradient(135deg,#14532d,#166534)",
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:40, position:"relative", zIndex:5,
              boxShadow:"0 0 40px rgba(57,255,20,0.2)",
            }}>📞</div>
          </div>

          <div style={{ textAlign:"center" }}>
            <p style={{ fontSize:26, fontWeight:800, color:"#E8EAF0", margin:"0 0 6px" }}>{name}</p>
            <StatusPill />
          </div>

          {/* Audio waveform (decorative) */}
          {callState === "CONNECTED" && (
            <div style={{ display:"flex", alignItems:"center", gap:3, height:40, marginTop:8 }}>
              {Array.from({length:18}).map((_,i)=>(
                <div key={i} style={{
                  width:3, borderRadius:99,
                  background:"rgba(57,255,20,0.6)",
                  height: `${12 + Math.abs(Math.sin(i*0.7))*22}px`,
                  animation:`typing ${0.8+(i%4)*0.2}s ease-in-out infinite`,
                  animationDelay:`${i*0.06}s`,
                }}/>
              ))}
            </div>
          )}

          {error && (
            <div style={{
              background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.3)",
              borderRadius:12, padding:"12px 20px", textAlign:"center", maxWidth:280,
            }}>
              <p style={{ color:"#f87171", fontSize:13, margin:0, lineHeight:1.5 }}>{error}</p>
            </div>
          )}
        </div>

        {/* Controls */}
        <div style={{
          position:"absolute", bottom:32, left:0, right:0, zIndex:10,
          display:"flex", flexDirection:"column", alignItems:"center", gap:14,
        }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:20 }}>
            <CtrlBtn onClick={toggleAudio} active={!audioMuted} label={audioMuted?"Unmute":"Mute"}>
              {audioMuted ? <MicOffIcon/> : <MicOnIcon/>}
            </CtrlBtn>
            <CtrlBtn onClick={endCall} danger size="lg" label="End">
              <EndIcon/>
            </CtrlBtn>
            <CtrlBtn onClick={()=>setSpeakerOn(s=>!s)} active={speakerOn} label="Speaker">
              <SpeakerIcon/>
            </CtrlBtn>
          </div>
        </div>
      </div>
    );
  }

  // ── Video call UI ─────────────────────────────────────────────────────────
  return (
    <div style={{
      width:"100%", height:"100%", borderRadius:14, overflow:"hidden",
      position:"relative", fontFamily:"Poppins,sans-serif",
      background:"linear-gradient(145deg,#050a14,#0a1224)",
    }}>

      {/* Remote video / waiting state */}
      <div id="remote-video" style={{
        position:"absolute", inset:0, background:"#060c1a",
        display:"flex", alignItems:"center", justifyContent:"center",
      }}>
        {(!remoteUser || callState !== "CONNECTED") && (
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:18 }}>
            <div style={{ position:"relative" }}>
              {[1,2,3].map(i=>(
                <div key={i} style={{
                  position:"absolute", inset:-(i*18), borderRadius:"50%",
                  border:`1.5px solid rgba(0,245,255,${0.18-i*0.04})`,
                  animation:`ring 2s ease-out ${i*0.4}s infinite`,
                }}/>
              ))}
              <div style={{
                width:96, height:96, borderRadius:"50%",
                background:"linear-gradient(135deg,#0e7490,#1d4ed8)",
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:38, fontWeight:900, color:"white",
                boxShadow:"0 0 40px rgba(0,245,255,0.25)",
                position:"relative", zIndex:5,
              }}>{letter}</div>
            </div>
            <div style={{ textAlign:"center" }}>
              <p style={{ fontSize:22, fontWeight:800, color:"#E8EAF0", margin:"0 0 6px" }}>{name}</p>
              <p style={{ fontSize:13, color:"rgba(255,255,255,0.45)", margin:0 }}>
                {callState==="FAILED" ? error : callState==="CONNECTED" ? "Waiting for camera…" : "Connecting…"}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Gradient overlays */}
      <div style={{ position:"absolute",top:0,left:0,right:0,height:100,zIndex:10,background:"linear-gradient(to bottom,rgba(0,0,0,0.7),transparent)",pointerEvents:"none"}}/>
      <div style={{ position:"absolute",bottom:0,left:0,right:0,height:160,zIndex:10,background:"linear-gradient(to top,rgba(0,0,0,0.8),transparent)",pointerEvents:"none"}}/>

      {/* Top bar */}
      <div style={{
        position:"absolute", top:0, left:0, right:0, zIndex:20,
        padding:"16px 20px",
        display:"flex", alignItems:"center", justifyContent:"space-between",
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:36,height:36,borderRadius:"50%",background:"linear-gradient(135deg,#0e7490,#1d4ed8)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:700,color:"white" }}>
            {letter}
          </div>
          <div>
            <p style={{ margin:0, fontSize:15, fontWeight:700, color:"white" }}>{name}</p>
            <StatusPill />
          </div>
        </div>
        {callState === "CONNECTED" && (
          <div style={{ display:"flex", alignItems:"flex-end", gap:2 }}>
            {[4,7,10,13].map((h,i)=>(
              <div key={i} style={{ width:3, height:h, borderRadius:99, background: i<3?"#39FF14":"rgba(255,255,255,0.2)" }}/>
            ))}
          </div>
        )}
      </div>

      {/* Local PiP */}
      <Draggable bounds="parent">
        <div style={{
          position:"absolute", top:80, right:16, zIndex:30,
          width:120, height:160, borderRadius:16, overflow:"hidden",
          border:"2px solid rgba(0,245,255,0.4)",
          boxShadow:"0 4px 24px rgba(0,0,0,0.6), 0 0 16px rgba(0,245,255,0.15)",
          cursor:"grab", background:"#0a1020",
        }}>
          <div id="local-video" style={{ width:"100%", height:"100%" }}>
            {videoMuted && (
              <div style={{ width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",background:"#0a1020" }}>
                <div style={{ width:44,height:44,borderRadius:"50%",background:"linear-gradient(135deg,#0e7490,#1d4ed8)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,fontWeight:700,color:"white" }}>
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
              </div>
            )}
          </div>
          <div style={{ position:"absolute",bottom:0,left:0,right:0,padding:"4px 6px",background:"linear-gradient(to top,rgba(0,0,0,0.6),transparent)",fontSize:9,color:"rgba(255,255,255,0.7)",textAlign:"center" }}>
            You {videoMuted?"(off)":""}
          </div>
        </div>
      </Draggable>

      {/* Bottom controls */}
      <div style={{
        position:"absolute", bottom:0, left:0, right:0, zIndex:20,
        padding:"16px 20px 24px",
        display:"flex", flexDirection:"column", alignItems:"center", gap:16,
      }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:18 }}>
          <CtrlBtn onClick={toggleAudio} active={!audioMuted} label={audioMuted?"Unmute":"Mute"}>
            {audioMuted ? <MicOffIcon/> : <MicOnIcon/>}
          </CtrlBtn>
          <CtrlBtn onClick={endCall} danger size="lg" label="End">
            <EndIcon/>
          </CtrlBtn>
          <CtrlBtn onClick={toggleVideo} active={!videoMuted} label={videoMuted?"Start cam":"Stop cam"}>
            {videoMuted ? <CamOffIcon/> : <CamOnIcon/>}
          </CtrlBtn>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:20 }}>
          <CtrlBtn onClick={()=>setSpeakerOn(s=>!s)} active={speakerOn} size="sm" label="Speaker">
            <SpeakerIcon/>
          </CtrlBtn>
        </div>
      </div>

      {/* Error state */}
      {callState === "FAILED" && (
        <div style={{
          position:"absolute", top:"50%", left:"50%",
          transform:"translate(-50%,-50%)", zIndex:40,
          background:"rgba(10,14,26,0.95)", borderRadius:16,
          border:"1px solid rgba(239,68,68,0.3)",
          padding:"24px 28px", textAlign:"center", maxWidth:320,
          boxShadow:"0 8px 40px rgba(0,0,0,0.7)",
        }}>
          <div style={{ fontSize:36, marginBottom:10 }}>📵</div>
          <p style={{ color:"#ff4757", fontSize:14, fontWeight:700, margin:"0 0 6px" }}>Call Failed</p>
          <p style={{ color:"rgba(255,255,255,0.55)", fontSize:12, margin:"0 0 16px", lineHeight:1.5 }}>{error}</p>
          <button onClick={endCall} style={{ padding:"10px 24px", borderRadius:10, border:"none", background:"rgba(239,68,68,0.2)", color:"#ff4757", fontWeight:700, fontSize:13, cursor:"pointer", fontFamily:"Poppins,sans-serif" }}>
            Close
          </button>
        </div>
      )}
    </div>
  );
};

export default VideoCall;