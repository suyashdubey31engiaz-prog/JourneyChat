import React, { useEffect, useRef } from "react";
import {
  FaReply, FaEdit, FaTrash, FaCopy, FaForward,
  FaStar, FaShare, FaDownload
} from "react-icons/fa";
import { MdOutlineEmojiEmotions } from "react-icons/md";

const QUICK_REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "🙏"];

const ContextMenu = ({
  x, y, isMe, msg,
  onReply, onEdit, onDelete,
  onCopy, onForward, onStar,
  onReact, onClose
}) => {
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, [onClose]);

  // Adjust position so menu never goes off-screen
  const menuW = 200;
  const menuH = 320;
  const left  = Math.min(x, window.innerWidth  - menuW - 8);
  const top   = Math.min(y, window.innerHeight - menuH - 8);

  const items = [
    { icon: <FaReply   />, label: "Reply",        action: onReply,   always: true },
    { icon: <FaEdit    />, label: "Edit",          action: onEdit,    always: false, show: isMe && msg?.type === "text" },
    { icon: <FaCopy    />, label: "Copy",          action: onCopy,    always: msg?.type === "text" },
    { icon: <FaForward />, label: "Forward",       action: onForward, always: true },
    { icon: <FaStar    />, label: "Star",          action: onStar,    always: true },
    { icon: <FaTrash   />, label: isMe ? "Delete for everyone" : "Delete for me", action: onDelete, always: true, danger: true },
  ].filter(i => i.always || i.show);

  return (
    <div ref={ref}
      className="fixed z-[999] animate-scale-in select-none"
      style={{ left, top }}>

      {/* Quick reaction row */}
      <div className="flex items-center gap-1 px-3 py-2.5 mb-1 rounded-2xl"
        style={{
          background: "rgba(13,21,38,0.97)",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
          backdropFilter: "blur(20px)",
        }}>
        {QUICK_REACTIONS.map(emoji => (
          <button key={emoji}
            onClick={() => { onReact(emoji); onClose(); }}
            className="text-xl w-9 h-9 flex items-center justify-center rounded-xl transition-all hover:scale-125 hover:bg-white/10">
            {emoji}
          </button>
        ))}
        <button
          onClick={() => { /* full picker */ onClose(); }}
          className="text-xl w-9 h-9 flex items-center justify-center rounded-xl transition-all hover:scale-110 hover:bg-white/10"
          style={{ color: "var(--muted)" }}>
          <MdOutlineEmojiEmotions />
        </button>
      </div>

      {/* Action items */}
      <div className="rounded-2xl overflow-hidden"
        style={{
          background: "rgba(13,21,38,0.97)",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
          backdropFilter: "blur(20px)",
          minWidth: menuW,
        }}>
        {items.map((item, i) => (
          <button key={i}
            onClick={() => { item.action(); onClose(); }}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all text-left hover:bg-white/5 ${
              i < items.length - 1 ? "border-b" : ""
            }`}
            style={{
              color: item.danger ? "#ff4757" : "var(--light-text)",
              borderColor: "rgba(255,255,255,0.05)",
            }}>
            <span style={{ color: item.danger ? "#ff4757" : "var(--primary)", fontSize: 14 }}>
              {item.icon}
            </span>
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ContextMenu;