import React, {
  useRef, useState, useEffect, useContext, useCallback, useReducer
} from "react";
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

const debounce = (fn, ms=600) => {
  let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
};

// ── Color palettes ─────────────────────────────────────────────────────────────
const PALETTE = [
  "#ffffff","#E8EAF0","#94a3b8","#475569","#1e293b","#0f172a",
  "#00F5FF","#0ea5e9","#3b82f6","#6366f1","#8b5cf6","#a855f7",
  "#ec4899","#ef4444","#f97316","#f59e0b","#FFE600","#84cc16",
  "#22c55e","#10b981","#14b8a6","#06b6d4",
];

// ── Tools list ─────────────────────────────────────────────────────────────────
const TOOLS = [
  { id:"pen",      icon:"✏️", label:"Pen",        cursor:"crosshair" },
  { id:"marker",   icon:"🖊️", label:"Marker",     cursor:"crosshair" },
  { id:"line",     icon:"╱",  label:"Line",       cursor:"crosshair" },
  { id:"arrow",    icon:"→",  label:"Arrow",      cursor:"crosshair" },
  { id:"rect",     icon:"▭",  label:"Rectangle",  cursor:"crosshair" },
  { id:"circle",   icon:"○",  label:"Circle",     cursor:"crosshair" },
  { id:"triangle", icon:"△",  label:"Triangle",   cursor:"crosshair" },
  { id:"text",     icon:"T",  label:"Text",       cursor:"text"      },
  { id:"eraser",   icon:"⌫",  label:"Eraser",     cursor:"cell"      },
  { id:"fill",     icon:"🪣", label:"Fill",       cursor:"cell"      },
  { id:"select",   icon:"⬡",  label:"Select",     cursor:"default"   },
];

// ── Tic-tac-toe game component ─────────────────────────────────────────────────
const TicTacToe = ({ onClose, socket, boardId }) => {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);
  const [scores, setScores]   = useState({ X:0, O:0 });

  const WIN = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  const calcWinner = b => {
    for (const [a,c,d] of WIN) if (b[a] && b[a]===b[c] && b[a]===b[d]) return b[a];
    return b.every(Boolean) ? "Draw" : null;
  };
  const winner = calcWinner(board);

  useEffect(() => {
    if (!socket || !boardId) return;
    const h = (data) => { if (data.boardId === boardId) { setBoard(data.board); setXIsNext(data.xIsNext); } };
    socket.on("ttt-move", h);
    return () => socket.off("ttt-move", h);
  }, [socket, boardId]);

  const click = (i) => {
    if (board[i] || winner) return;
    const nb = [...board]; nb[i] = xIsNext ? "X" : "O";
    const nxt = !xIsNext;
    setBoard(nb); setXIsNext(nxt);
    socket?.emit("ttt-move", { boardId, board:nb, xIsNext:nxt });
    const w = calcWinner(nb);
    if (w && w !== "Draw") setScores(p => ({ ...p, [w]: p[w]+1 }));
  };

  const reset = () => {
    const nb = Array(9).fill(null);
    setBoard(nb); setXIsNext(true);
    socket?.emit("ttt-move", { boardId, board:nb, xIsNext:true });
  };

  const C = ["#00F5FF","#FFE600","#ff4757"];

  return (
    <div style={{
      position:"absolute", top:"50%", left:"50%",
      transform:"translate(-50%,-50%)", zIndex:200,
      background:"rgba(8,12,22,0.98)", border:"1px solid rgba(0,245,255,0.25)",
      borderRadius:20, padding:28, textAlign:"center",
      boxShadow:"0 0 60px rgba(0,245,255,0.15), 0 20px 60px rgba(0,0,0,0.8)",
      backdropFilter:"blur(20px)", minWidth:300,
    }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
        <h3 style={{ margin:0, fontSize:18, fontWeight:800, color:"#00F5FF" }}>❎⭕ Tic-Tac-Toe</h3>
        <button onClick={onClose} style={{ background:"none", border:"none", color:"rgba(255,255,255,0.5)", fontSize:18, cursor:"pointer" }}>✕</button>
      </div>

      {/* Scores */}
      <div style={{ display:"flex", gap:12, justifyContent:"center", marginBottom:16 }}>
        {["X","O"].map(p => (
          <div key={p} style={{
            padding:"6px 18px", borderRadius:10, fontSize:13, fontWeight:700,
            background: `rgba(${p==="X"?"0,245,255":"255,230,0"},0.08)`,
            border: `1px solid rgba(${p==="X"?"0,245,255":"255,230,0"},0.2)`,
            color: p==="X" ? "#00F5FF" : "#FFE600",
          }}>
            {p}: {scores[p]}
          </div>
        ))}
      </div>

      {/* Status */}
      <p style={{ fontSize:13, color:"rgba(255,255,255,0.6)", marginBottom:14 }}>
        {winner
          ? winner==="Draw" ? "🤝 It's a draw!" : `🎉 Player ${winner} wins!`
          : `Player ${xIsNext?"X":"O"}'s turn`}
      </p>

      {/* Grid */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:6, marginBottom:16 }}>
        {board.map((val, i) => (
          <button key={i} onClick={() => click(i)} style={{
            width:80, height:80, borderRadius:12, fontSize:32, fontWeight:900,
            background: val ? `rgba(${val==="X"?"0,245,255":"255,230,0"},0.08)` : "rgba(255,255,255,0.04)",
            border: `1px solid rgba(${val==="X"?"0,245,255":val==="O"?"255,230,0":"255,255,255"},${val?0.3:0.08})`,
            color: val==="X" ? "#00F5FF" : "#FFE600",
            cursor: val || winner ? "not-allowed" : "pointer",
            transition:"all .15s",
          }}
          onMouseEnter={e=>{ if(!val&&!winner) e.currentTarget.style.background="rgba(255,255,255,0.08)"; }}
          onMouseLeave={e=>{ if(!val) e.currentTarget.style.background="rgba(255,255,255,0.04)"; }}>
            {val}
          </button>
        ))}
      </div>

      <button onClick={reset} style={{
        padding:"9px 24px", borderRadius:10, fontWeight:700, fontSize:13,
        background:"linear-gradient(135deg,#00F5FF,#0077cc)", color:"#020d14",
        border:"none", cursor:"pointer",
        boxShadow:"0 0 14px rgba(0,245,255,0.3)",
      }}>
        New Game
      </button>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// MAIN WHITEBOARD
// ══════════════════════════════════════════════════════════════════════════════
export default function Whiteboard({ contact, setActiveTab }) {
  const canvasRef   = useRef(null);
  const overlayRef  = useRef(null); // for shape preview
  const pathRef     = useRef([]);
  const drawingRef  = useRef(false);
  const startPt     = useRef(null);
  const historyRef  = useRef([]);   // undo stack (imageData)
  const redoRef     = useRef([]);   // redo stack

  const { user }   = useContext(AuthContext);
  const { socket } = useContext(ChatContext);

  const boardId = (user && contact)
    ? [String(user._id), String(contact._id)].sort().join("-")
    : null;

  // ── Tool state ─────────────────────────────────────────────────────────────
  const [tool,        setTool]       = useState("pen");
  const [color,       setColor]      = useState("#00F5FF");
  const [fillColor,   setFillColor]  = useState("transparent");
  const [size,        setSize]       = useState(3);
  const [opacity,     setOpacity]    = useState(1);
  const [bg,          setBg]         = useState("dark"); // dark|white|grid|dots
  const [loaded,      setLoaded]     = useState(false);
  const [showGame,    setShowGame]   = useState(false);
  const [showText,    setShowText]   = useState(null);  // { x, y }
  const [textVal,     setTextVal]    = useState("");
  const [textSize,    setTextSize]   = useState(20);
  const [showPalette, setShowPalette]= useState(false);
  const [canUndo,     setCanUndo]    = useState(false);
  const [canRedo,     setCanRedo]    = useState(false);
  const [zoom,        setZoom]       = useState(1);
  const [cursor,      setCursor]     = useState("crosshair");
  const [showExport,  setShowExport] = useState(false);

  // ── Save snapshot for undo ─────────────────────────────────────────────────
  const snapshot = useCallback(() => {
    const c = canvasRef.current; if (!c) return;
    historyRef.current.push(c.toDataURL());
    redoRef.current = [];
    setCanUndo(true); setCanRedo(false);
    if (historyRef.current.length > 40) historyRef.current.shift();
  }, []);

  // ── Restore an imageData string to canvas ──────────────────────────────────
  const restoreSnapshot = useCallback((dataUrl) => {
    const c = canvasRef.current; if (!c) return;
    const ctx = c.getContext("2d");
    const img = new Image();
    img.onload = () => {
      ctx.save();
      ctx.setTransform(1,0,0,1,0,0);
      ctx.clearRect(0,0,c.width,c.height);
      ctx.drawImage(img,0,0,c.width,c.height);
      ctx.restore();
    };
    img.src = dataUrl;
  }, []);

  const undo = () => {
    if (!historyRef.current.length) return;
    redoRef.current.push(canvasRef.current.toDataURL());
    const prev = historyRef.current.pop();
    restoreSnapshot(prev);
    setCanUndo(historyRef.current.length > 0);
    setCanRedo(true);
  };

  const redo = () => {
    if (!redoRef.current.length) return;
    historyRef.current.push(canvasRef.current.toDataURL());
    const next = redoRef.current.pop();
    restoreSnapshot(next);
    setCanUndo(true);
    setCanRedo(redoRef.current.length > 0);
  };

  // ── Debounced server save ──────────────────────────────────────────────────
  const saveToServer = useCallback(debounce(async () => {
    if (!boardId || !canvasRef.current) return;
    try {
      const imageData = canvasRef.current.toDataURL("image/png");
      await API.post(`/whiteboard/${boardId}`, { imageData });
    } catch {}
  }, 800), [boardId]);

  // ── Load from server ───────────────────────────────────────────────────────
  const loadFromServer = useCallback(() => new Promise(resolve => {
    if (!boardId) return resolve();
    API.get(`/whiteboard/${boardId}`).then(res => {
      if (!res.data?.imageData) return resolve();
      const img = new Image();
      img.onload = () => {
        const c = canvasRef.current; if (!c) return resolve();
        const ctx = c.getContext("2d");
        ctx.save(); ctx.setTransform(1,0,0,1,0,0);
        ctx.clearRect(0,0,c.width,c.height);
        ctx.drawImage(img,0,0,c.width,c.height);
        ctx.restore(); resolve();
      };
      img.src = res.data.imageData;
    }).catch(resolve);
  }), [boardId]);

  // ── Canvas setup ───────────────────────────────────────────────────────────
  useEffect(() => {
    const c = canvasRef.current; if (!c) return;
    let mounted = true;
    const setup = async () => {
      const r    = Math.max(window.devicePixelRatio||1,1);
      const rect = c.getBoundingClientRect();
      c.width    = Math.floor(rect.width  * r);
      c.height   = Math.floor(rect.height * r);
      const ctx  = c.getContext("2d");
      ctx.setTransform(r,0,0,r,0,0);
      ctx.lineCap = "round"; ctx.lineJoin = "round";
      // Same for overlay
      const o = overlayRef.current;
      if (o) { o.width=c.width; o.height=c.height; o.getContext("2d").setTransform(r,0,0,r,0,0); }
      await loadFromServer();
      if (mounted) setLoaded(true);
    };
    setup();
    const ro = new ResizeObserver(setup);
    if (c.parentElement) ro.observe(c.parentElement);
    return () => { mounted=false; ro.disconnect(); };
  }, [loadFromServer]);

  // ── Socket listeners ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!socket || !boardId || !loaded) return;
    socket.emit("join-whiteboard", boardId);

    const onDraw = (payload) => {
      if (payload.boardId !== boardId) return;
      const c = canvasRef.current; if (!c) return;
      const ctx = c.getContext("2d");
      ctx.save();
      ctx.globalAlpha = payload.opacity ?? 1;
      ctx.globalCompositeOperation = payload.mode==="eraser" ? "destination-out" : "source-over";
      ctx.strokeStyle = payload.color;
      ctx.fillStyle   = payload.fillColor || "transparent";
      ctx.lineWidth   = payload.size;
      ctx.lineCap = "round"; ctx.lineJoin = "round";
      drawShape(ctx, payload);
      ctx.restore();
    };

    const onClear = (id) => {
      if (id !== boardId) return;
      const c = canvasRef.current; if (!c) return;
      c.getContext("2d").clearRect(0,0,c.width,c.height);
    };

    socket.on("drawing", onDraw);
    socket.on("clear-whiteboard", onClear);
    return () => {
      socket.emit("leave-whiteboard", boardId);
      socket.off("drawing", onDraw);
      socket.off("clear-whiteboard", onClear);
    };
  }, [socket, boardId, loaded]);

  // ── Draw shape helper ──────────────────────────────────────────────────────
  const drawShape = (ctx, payload) => {
    const { type, path, p1, p2, text, fontSize } = payload;

    if (type === "pen" || type === "marker") {
      if (!path?.length) return;
      ctx.beginPath(); ctx.moveTo(path[0].x, path[0].y);
      path.forEach(pt => ctx.lineTo(pt.x, pt.y));
      ctx.stroke();
    } else if (type === "line") {
      if (!p1||!p2) return;
      ctx.beginPath(); ctx.moveTo(p1.x,p1.y); ctx.lineTo(p2.x,p2.y); ctx.stroke();
    } else if (type === "arrow") {
      if (!p1||!p2) return;
      const angle = Math.atan2(p2.y-p1.y, p2.x-p1.x);
      const hl = 18;
      ctx.beginPath(); ctx.moveTo(p1.x,p1.y); ctx.lineTo(p2.x,p2.y); ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(p2.x, p2.y);
      ctx.lineTo(p2.x - hl*Math.cos(angle-0.45), p2.y - hl*Math.sin(angle-0.45));
      ctx.lineTo(p2.x - hl*Math.cos(angle+0.45), p2.y - hl*Math.sin(angle+0.45));
      ctx.closePath(); ctx.fill();
    } else if (type === "rect") {
      if (!p1||!p2) return;
      const w=p2.x-p1.x, h=p2.y-p1.y;
      if (payload.fillColor && payload.fillColor !== "transparent") { ctx.fillStyle=payload.fillColor; ctx.fillRect(p1.x,p1.y,w,h); }
      ctx.strokeRect(p1.x,p1.y,w,h);
    } else if (type === "circle") {
      if (!p1||!p2) return;
      const rx=Math.abs(p2.x-p1.x)/2, ry=Math.abs(p2.y-p1.y)/2;
      const cx=(p1.x+p2.x)/2, cy=(p1.y+p2.y)/2;
      ctx.beginPath(); ctx.ellipse(cx,cy,rx,ry,0,0,Math.PI*2);
      if (payload.fillColor && payload.fillColor !== "transparent") { ctx.fillStyle=payload.fillColor; ctx.fill(); }
      ctx.stroke();
    } else if (type === "triangle") {
      if (!p1||!p2) return;
      const mx=(p1.x+p2.x)/2;
      ctx.beginPath(); ctx.moveTo(mx,p1.y); ctx.lineTo(p2.x,p2.y); ctx.lineTo(p1.x,p2.y); ctx.closePath();
      if (payload.fillColor && payload.fillColor !== "transparent") { ctx.fillStyle=payload.fillColor; ctx.fill(); }
      ctx.stroke();
    } else if (type === "text") {
      if (!p1||!text) return;
      ctx.font = `${fontSize||20}px Poppins, sans-serif`;
      ctx.fillStyle = payload.color;
      ctx.fillText(text, p1.x, p1.y);
    } else if (type === "eraser") {
      if (!path?.length) return;
      ctx.globalCompositeOperation = "destination-out";
      ctx.beginPath(); ctx.moveTo(path[0].x,path[0].y);
      path.forEach(pt => ctx.lineTo(pt.x,pt.y));
      ctx.stroke();
    }
  };

  // ── Pointer helpers ────────────────────────────────────────────────────────
  const getPoint = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const cx = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
    const cy = e.clientY ?? e.touches?.[0]?.clientY ?? 0;
    return { x:(cx-rect.left)/zoom, y:(cy-rect.top)/zoom };
  };

  const emit = (payload) => socket?.emit("drawing", { boardId, ...payload });

  // ── Pointer events ─────────────────────────────────────────────────────────
  const onPointerDown = (e) => {
    const pt = getPoint(e);

    if (tool === "text") {
      setShowText(pt); setTextVal(""); return;
    }

    snapshot();
    drawingRef.current = true;
    startPt.current    = pt;
    pathRef.current    = [pt];

    if (tool === "pen" || tool === "marker" || tool === "eraser") {
      const ctx = canvasRef.current.getContext("2d");
      ctx.save();
      ctx.globalAlpha = tool==="marker" ? 0.45 : opacity;
      ctx.globalCompositeOperation = tool==="eraser" ? "destination-out" : "source-over";
      ctx.strokeStyle = color;
      ctx.lineWidth   = tool==="marker" ? size*3 : size;
      ctx.lineCap = "round"; ctx.lineJoin = "round";
      ctx.beginPath(); ctx.moveTo(pt.x,pt.y);
    }
  };

  const onPointerMove = (e) => {
    if (!drawingRef.current) return;
    e.preventDefault();
    const pt = getPoint(e);
    const c  = canvasRef.current;
    const ctx = c.getContext("2d");

    if (tool === "pen" || tool === "marker" || tool === "eraser") {
      ctx.lineTo(pt.x, pt.y); ctx.stroke();
      pathRef.current.push(pt);
      if (pathRef.current.length >= 4) {
        emit({ type:tool, path:pathRef.current.slice(), color, size: tool==="marker"?size*3:size, opacity:tool==="marker"?0.45:opacity, mode:tool==="eraser"?"eraser":"pen" });
        pathRef.current = [pt];
      }
    } else {
      // Shape preview on overlay
      const o = overlayRef.current; if (!o) return;
      const oct = o.getContext("2d");
      const r = Math.max(window.devicePixelRatio||1,1);
      oct.save(); oct.setTransform(1,0,0,1,0,0);
      oct.clearRect(0,0,o.width,o.height);
      oct.restore();
      oct.save();
      oct.globalAlpha = opacity;
      oct.strokeStyle = color;
      oct.fillStyle   = fillColor;
      oct.lineWidth   = size;
      oct.lineCap = "round"; oct.lineJoin = "round";
      drawShape(oct, { type:tool, p1:startPt.current, p2:pt, fillColor, color, size });
      oct.restore();
    }
  };

  const onPointerUp = (e) => {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    const pt = getPoint(e);
    const c  = canvasRef.current;
    const ctx = c.getContext("2d");

    if (tool === "pen" || tool === "marker" || tool === "eraser") {
      ctx.restore?.();
      if (pathRef.current.length) {
        emit({ type:tool, path:pathRef.current, color, size:tool==="marker"?size*3:size, opacity:tool==="marker"?0.45:opacity, mode:tool==="eraser"?"eraser":"pen" });
      }
    } else {
      // Commit shape from overlay to main canvas
      const o = overlayRef.current;
      if (o) { const oct=o.getContext("2d"); oct.save(); oct.setTransform(1,0,0,1,0,0); oct.clearRect(0,0,o.width,o.height); oct.restore(); }
      ctx.save();
      ctx.globalAlpha = opacity;
      ctx.strokeStyle = color;
      ctx.fillStyle   = fillColor;
      ctx.lineWidth   = size;
      ctx.lineCap = "round"; ctx.lineJoin = "round";
      drawShape(ctx, { type:tool, p1:startPt.current, p2:pt, fillColor, color, size });
      ctx.restore();
      emit({ type:tool, p1:startPt.current, p2:pt, fillColor, color, size, opacity });
    }

    pathRef.current = [];
    saveToServer();
  };

  // ── Text commit ────────────────────────────────────────────────────────────
  const commitText = () => {
    if (!textVal.trim() || !showText) { setShowText(null); return; }
    const c   = canvasRef.current;
    const ctx = c.getContext("2d");
    snapshot();
    ctx.save();
    ctx.font = `${textSize}px Poppins, sans-serif`;
    ctx.fillStyle = color;
    ctx.fillText(textVal, showText.x, showText.y);
    ctx.restore();
    emit({ type:"text", p1:showText, text:textVal, fontSize:textSize, color, size });
    setShowText(null); setTextVal("");
    saveToServer();
  };

  // ── Clear ──────────────────────────────────────────────────────────────────
  const clearBoard = async () => {
    if (!window.confirm("Clear the entire board?")) return;
    snapshot();
    const c = canvasRef.current; if (!c) return;
    c.getContext("2d").clearRect(0,0,c.width,c.height);
    socket?.emit("clear-whiteboard", { boardId });
    try { await API.delete(`/whiteboard/${boardId}`); } catch {}
    saveToServer();
  };

  // ── Export ─────────────────────────────────────────────────────────────────
  const exportPng = () => {
    const a = document.createElement("a");
    a.href = canvasRef.current.toDataURL("image/png");
    a.download = `whiteboard-${Date.now()}.png`;
    a.click();
  };
  const exportJpg = () => {
    const a = document.createElement("a");
    a.href = canvasRef.current.toDataURL("image/jpeg", 0.92);
    a.download = `whiteboard-${Date.now()}.jpg`;
    a.click();
  };

  // ── Image paste / drag-drop ────────────────────────────────────────────────
  const pasteImage = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    const r = new FileReader();
    r.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const c = canvasRef.current; if (!c) return;
        const ctx = c.getContext("2d");
        snapshot();
        const rect = c.getBoundingClientRect();
        const scale = Math.min(rect.width/img.width, rect.height/img.height, 1) * 0.6;
        const w = img.width*scale, h = img.height*scale;
        const x = (rect.width-w)/2, y = (rect.height-h)/2;
        ctx.drawImage(img, x, y, w, h);
        saveToServer();
      };
      img.src = ev.target.result;
    };
    r.readAsDataURL(file);
  };

  useEffect(() => {
    const h = (e) => {
      for (const item of e.clipboardData.items) {
        if (item.type.startsWith("image/")) { pasteImage(item.getAsFile()); break; }
      }
    };
    document.addEventListener("paste", h);
    return () => document.removeEventListener("paste", h);
  }, []);

  // ── Background style ───────────────────────────────────────────────────────
  const bgStyle = {
    dark:  { background:"#0D1526" },
    white: { background:"#f8fafc" },
    grid:  { background:"#0D1526", backgroundImage:"linear-gradient(rgba(0,245,255,0.06) 1px,transparent 1px),linear-gradient(90deg,rgba(0,245,255,0.06) 1px,transparent 1px)", backgroundSize:"32px 32px" },
    dots:  { background:"#0D1526", backgroundImage:"radial-gradient(rgba(0,245,255,0.15) 1px,transparent 1px)", backgroundSize:"24px 24px" },
  }[bg] || {};

  // Tool cursor
  const toolCursor = TOOLS.find(t=>t.id===tool)?.cursor || "crosshair";

  // ── Keyboard shortcuts ─────────────────────────────────────────────────────
  useEffect(() => {
    const h = (e) => {
      if (e.ctrlKey && e.key==="z") undo();
      if (e.ctrlKey && e.key==="y") redo();
      if (e.ctrlKey && e.key==="s") { e.preventDefault(); saveToServer(); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  // ── Styles ─────────────────────────────────────────────────────────────────
  const btn = (active, color="#00F5FF") => ({
    background: active ? `rgba(${color==="#00F5FF"?"0,245,255":"255,230,0"},0.12)` : "none",
    border: `1px solid ${active ? `rgba(${color==="#00F5FF"?"0,245,255":"255,230,0"},0.35)` : "rgba(255,255,255,0.07)"}`,
    color: active ? color : "rgba(255,255,255,0.55)",
    borderRadius:10, padding:"7px 9px", cursor:"pointer",
    display:"flex", alignItems:"center", justifyContent:"center",
    fontSize:13, fontFamily:"Poppins,sans-serif",
    transition:"all .15s", minWidth:36, minHeight:36,
  });

  return (
    <div style={{
      display:"flex", flexDirection:"column", height:"100%", width:"100%",
      background:"rgba(7,11,20,0.98)", borderRadius:14, overflow:"hidden",
      position:"relative", fontFamily:"Poppins,sans-serif",
    }}>

      {/* ── Top bar ── */}
      <div style={{
        display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"8px 12px", flexShrink:0, flexWrap:"wrap", gap:6,
        background:"rgba(10,14,26,0.99)", borderBottom:"1px solid rgba(255,255,255,0.06)",
      }}>
        {/* Left: back + title */}
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <button onClick={() => setActiveTab("chat")} style={{
            display:"flex", alignItems:"center", gap:6,
            padding:"7px 12px", borderRadius:10,
            background:"rgba(0,245,255,0.06)", border:"1px solid rgba(0,245,255,0.2)",
            color:"#00F5FF", fontSize:12, fontWeight:600, cursor:"pointer",
          }}>
            ← Chat
          </button>
          <div>
            <p style={{ margin:0, fontSize:13, fontWeight:800, color:"#00F5FF" }}>
              🎨 Whiteboard
            </p>
            <p style={{ margin:0, fontSize:10, color:"rgba(255,255,255,0.3)" }}>
              with {contact?.name} · Real-time
            </p>
          </div>
        </div>

        {/* Center: tool actions */}
        <div style={{ display:"flex", alignItems:"center", gap:4 }}>
          {/* Undo/Redo */}
          <button onClick={undo} disabled={!canUndo} title="Undo (Ctrl+Z)"
            style={{ ...btn(false), opacity:canUndo?1:0.35, cursor:canUndo?"pointer":"not-allowed" }}>↩</button>
          <button onClick={redo} disabled={!canRedo} title="Redo (Ctrl+Y)"
            style={{ ...btn(false), opacity:canRedo?1:0.35, cursor:canRedo?"pointer":"not-allowed" }}>↪</button>

          <div style={{ width:1, height:24, background:"rgba(255,255,255,0.08)", margin:"0 4px" }}/>

          {/* Background */}
          {["dark","white","grid","dots"].map(b => (
            <button key={b} onClick={() => setBg(b)} title={`${b} background`}
              style={{ ...btn(bg===b), fontSize:11, padding:"5px 8px" }}>
              {b==="dark"?"■":b==="white"?"□":b==="grid"?"⊞":"⬛"}
            </button>
          ))}

          <div style={{ width:1, height:24, background:"rgba(255,255,255,0.08)", margin:"0 4px" }}/>

          {/* Zoom */}
          <button onClick={()=>setZoom(z=>Math.max(0.25,z-0.25))} style={btn(false)}>−</button>
          <span style={{ fontSize:11, color:"rgba(255,255,255,0.5)", minWidth:34, textAlign:"center" }}>
            {Math.round(zoom*100)}%
          </span>
          <button onClick={()=>setZoom(z=>Math.min(4,z+0.25))} style={btn(false)}>+</button>

          <div style={{ width:1, height:24, background:"rgba(255,255,255,0.08)", margin:"0 4px" }}/>

          {/* Games */}
          <button onClick={() => setShowGame(g=>!g)} style={btn(showGame,"#FFE600")}>
            🎮
          </button>

          {/* Export */}
          <button onClick={() => setShowExport(s=>!s)} style={btn(showExport)}>
            ⬇️
          </button>

          {/* Clear */}
          <button onClick={clearBoard} style={{
            ...btn(false), color:"#ff4757", borderColor:"rgba(255,71,87,0.2)",
          }}>
            🗑️
          </button>
        </div>
      </div>

      {/* ── Export dropdown ── */}
      {showExport && (
        <div style={{
          position:"absolute", top:56, right:12, zIndex:100,
          background:"rgba(13,21,38,0.98)", border:"1px solid rgba(255,255,255,0.1)",
          borderRadius:12, overflow:"hidden", minWidth:160,
          boxShadow:"0 8px 32px rgba(0,0,0,0.5)",
        }}>
          {[
            { label:"Export PNG",  action:exportPng },
            { label:"Export JPG",  action:exportJpg },
            { label:"Paste Image (Ctrl+V)", action:()=>setShowExport(false) },
          ].map((item,i) => (
            <button key={i} onClick={() => { item.action(); setShowExport(false); }}
              style={{
                display:"block", width:"100%", padding:"10px 14px",
                background:"none", border:"none", color:"#E8EAF0",
                fontSize:12, textAlign:"left", cursor:"pointer",
                fontFamily:"Poppins,sans-serif",
                borderBottom: i<2 ? "1px solid rgba(255,255,255,0.06)" : "none",
              }}
              onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.06)"}
              onMouseLeave={e=>e.currentTarget.style.background="none"}>
              {item.label}
            </button>
          ))}
        </div>
      )}

      {/* ── Main area ── */}
      <div style={{ display:"flex", flex:1, minHeight:0, overflow:"hidden" }}>

        {/* ── Left toolbar ── */}
        <div style={{
          width:54, flexShrink:0, display:"flex", flexDirection:"column",
          alignItems:"center", gap:4, padding:"8px 6px", overflowY:"auto",
          background:"rgba(10,14,26,0.99)", borderRight:"1px solid rgba(255,255,255,0.06)",
        }}>
          {TOOLS.map(t => (
            <button key={t.id} onClick={() => { setTool(t.id); setCursor(t.cursor); }}
              title={`${t.label} ${t.id==="pen"?"(P)":t.id==="eraser"?"(E)":""}`}
              style={{
                ...btn(tool===t.id),
                width:40, height:40, fontSize:t.id==="text"?17:18,
                flexDirection:"column", gap:2,
              }}>
              <span>{t.icon}</span>
            </button>
          ))}

          <div style={{ width:32, height:1, background:"rgba(255,255,255,0.07)", margin:"4px 0" }}/>

          {/* Stroke color */}
          <div style={{ position:"relative" }}>
            <button onClick={() => setShowPalette(s=>!s)}
              title="Stroke color"
              style={{
                width:36, height:36, borderRadius:10, border:"2px solid rgba(255,255,255,0.2)",
                cursor:"pointer", background:color,
                boxShadow:`0 0 10px ${color}66`,
              }}/>
            {showPalette && (
              <div style={{
                position:"absolute", left:"calc(100% + 8px)", top:0, zIndex:200,
                background:"rgba(13,21,38,0.98)", border:"1px solid rgba(255,255,255,0.1)",
                borderRadius:14, padding:10,
                boxShadow:"0 8px 32px rgba(0,0,0,0.6)",
                display:"grid", gridTemplateColumns:"repeat(6,1fr)", gap:5,
                width:180,
              }}>
                <p style={{ gridColumn:"1/-1", margin:"0 0 6px", fontSize:10, color:"rgba(255,255,255,0.4)", fontWeight:700, textTransform:"uppercase", letterSpacing:".08em" }}>Stroke</p>
                {PALETTE.map(c => (
                  <button key={c} onClick={() => { setColor(c); }}
                    style={{
                      width:22, height:22, borderRadius:6, background:c, border:"none", cursor:"pointer",
                      outline: color===c ? `2px solid white` : "none",
                      outlineOffset:2,
                    }}/>
                ))}
                <input type="color" value={color} onChange={e=>setColor(e.target.value)}
                  style={{ gridColumn:"1/-1", width:"100%", height:28, borderRadius:6, border:"none", cursor:"pointer", marginTop:4 }}/>
                <p style={{ gridColumn:"1/-1", margin:"8px 0 4px", fontSize:10, color:"rgba(255,255,255,0.4)", fontWeight:700, textTransform:"uppercase", letterSpacing:".08em" }}>Fill</p>
                <button onClick={()=>setFillColor("transparent")}
                  style={{ gridColumn:"1/-1", width:"100%", padding:"4px", background:"none",
                    border:"1px solid rgba(255,255,255,0.1)", borderRadius:6, color:"rgba(255,255,255,0.5)",
                    fontSize:11, cursor:"pointer" }}>
                  No fill
                </button>
                {PALETTE.map(c => (
                  <button key={`f${c}`} onClick={() => setFillColor(c)}
                    style={{
                      width:22, height:22, borderRadius:6, background:c, border:"none", cursor:"pointer",
                      outline: fillColor===c ? "2px solid white" : "none",
                      outlineOffset:2,
                    }}/>
                ))}
                <input type="color" value={fillColor==="transparent"?"#ffffff":fillColor}
                  onChange={e=>setFillColor(e.target.value)}
                  style={{ gridColumn:"1/-1", width:"100%", height:28, borderRadius:6, border:"none", cursor:"pointer", marginTop:4 }}/>
              </div>
            )}
          </div>
        </div>

        {/* ── Right panel: stroke controls ── */}
        <div style={{
          flex:1, position:"relative", overflow:"hidden",
          display:"flex", flexDirection:"column",
        }}>
          {/* Size + opacity strip */}
          <div style={{
            display:"flex", alignItems:"center", gap:14, padding:"6px 14px",
            background:"rgba(10,14,26,0.9)", borderBottom:"1px solid rgba(255,255,255,0.05)",
            flexWrap:"wrap",
          }}>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <span style={{ fontSize:10, color:"rgba(255,255,255,0.4)", fontWeight:600, textTransform:"uppercase", letterSpacing:".08em" }}>Size</span>
              <input type="range" min={1} max={80} value={size} onChange={e=>setSize(+e.target.value)}
                style={{ width:80, accentColor:"#00F5FF" }}/>
              <span style={{ fontSize:11, color:"rgba(255,255,255,0.5)", minWidth:20 }}>{size}</span>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <span style={{ fontSize:10, color:"rgba(255,255,255,0.4)", fontWeight:600, textTransform:"uppercase", letterSpacing:".08em" }}>Opacity</span>
              <input type="range" min={0.05} max={1} step={0.05} value={opacity} onChange={e=>setOpacity(+e.target.value)}
                style={{ width:80, accentColor:"#00F5FF" }}/>
              <span style={{ fontSize:11, color:"rgba(255,255,255,0.5)", minWidth:28 }}>{Math.round(opacity*100)}%</span>
            </div>
            {tool === "text" && (
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <span style={{ fontSize:10, color:"rgba(255,255,255,0.4)", fontWeight:600, textTransform:"uppercase", letterSpacing:".08em" }}>Font</span>
                <input type="range" min={10} max={80} value={textSize} onChange={e=>setTextSize(+e.target.value)}
                  style={{ width:80, accentColor:"#FFE600" }}/>
                <span style={{ fontSize:11, color:"rgba(255,255,255,0.5)", minWidth:24 }}>{textSize}px</span>
              </div>
            )}
            <span style={{ marginLeft:"auto", fontSize:10, color:"rgba(255,255,255,0.25)" }}>
              Ctrl+Z undo · Ctrl+V paste image · Ctrl+S save
            </span>
          </div>

          {/* ── Canvas area ── */}
          <div style={{ flex:1, position:"relative", overflow:"hidden" }}
            onDragOver={e=>e.preventDefault()}
            onDrop={e=>{ e.preventDefault(); pasteImage(e.dataTransfer.files[0]); }}>

            {/* Background */}
            <div style={{
              position:"absolute", inset:0,
              ...bgStyle,
              transform:`scale(${zoom})`, transformOrigin:"top left",
            }}/>

            {/* Main canvas */}
            <canvas
              ref={canvasRef}
              style={{
                position:"absolute", inset:0, width:"100%", height:"100%",
                touchAction:"none", cursor:toolCursor,
                transform:`scale(${zoom})`, transformOrigin:"top left",
              }}
              onMouseDown={onPointerDown}
              onMouseMove={onPointerMove}
              onMouseUp={onPointerUp}
              onMouseLeave={onPointerUp}
              onTouchStart={onPointerDown}
              onTouchMove={onPointerMove}
              onTouchEnd={onPointerUp}
            />

            {/* Overlay canvas for shape preview */}
            <canvas
              ref={overlayRef}
              style={{
                position:"absolute", inset:0, width:"100%", height:"100%",
                pointerEvents:"none",
                transform:`scale(${zoom})`, transformOrigin:"top left",
              }}
            />

            {/* Inline text editor */}
            {showText && (
              <div style={{
                position:"absolute",
                left: showText.x * zoom,
                top:  showText.y * zoom - textSize,
                zIndex:50,
              }}>
                <input
                  autoFocus
                  value={textVal}
                  onChange={e=>setTextVal(e.target.value)}
                  onKeyDown={e=>{ if(e.key==="Enter") commitText(); if(e.key==="Escape"){setShowText(null);setTextVal("");} }}
                  onBlur={commitText}
                  placeholder="Type here…"
                  style={{
                    background:"rgba(0,0,0,0.4)", border:"1px solid rgba(0,245,255,0.5)",
                    borderRadius:6, padding:"4px 8px",
                    color, fontSize:textSize, fontFamily:"Poppins,sans-serif",
                    outline:"none", minWidth:120,
                  }}
                />
              </div>
            )}

            {/* Tic-Tac-Toe overlay */}
            {showGame && (
              <TicTacToe
                onClose={() => setShowGame(false)}
                socket={socket}
                boardId={boardId}
              />
            )}

            {/* Empty state hint */}
            {!loaded && (
              <div style={{
                position:"absolute", inset:0, display:"flex",
                alignItems:"center", justifyContent:"center",
                color:"rgba(255,255,255,0.15)", fontSize:14, pointerEvents:"none",
              }}>
                Loading…
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Bottom tool hint ── */}
      <div style={{
        padding:"5px 14px", flexShrink:0,
        background:"rgba(10,14,26,0.99)", borderTop:"1px solid rgba(255,255,255,0.05)",
        display:"flex", alignItems:"center", justifyContent:"space-between",
      }}>
        <span style={{ fontSize:10, color:"rgba(255,255,255,0.25)" }}>
          Tool: <span style={{ color:"#00F5FF" }}>{TOOLS.find(t=>t.id===tool)?.label}</span>
          {tool==="text" && " · Click on board to add text"}
          {(tool==="rect"||tool==="circle"||tool==="triangle") && " · Click and drag to draw shape"}
          {tool==="eraser" && " · Drag to erase"}
          {" · Drag & drop images to paste"}
        </span>
        <span style={{ fontSize:10, color:"rgba(255,255,255,0.2)" }}>
          Real-time sync with {contact?.name}
        </span>
      </div>
    </div>
  );
}