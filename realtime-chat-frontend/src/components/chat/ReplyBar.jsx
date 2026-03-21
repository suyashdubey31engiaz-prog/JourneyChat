import React from "react";
import { FaTimes, FaReply } from "react-icons/fa";

/**
 * ReplyBar — shown above the input bar when replying to a message.
 * Props:
 *   replyTo   { content, senderName, type }
 *   onCancel  () => void
 */
const ReplyBar = ({ replyTo, onCancel }) => {
  if (!replyTo) return null;

  const preview =
    replyTo.type === "image" ? "📷 Photo" :
    replyTo.type === "voice" ? "🎙️ Voice message" :
    replyTo.type === "file"  ? "📎 File" :
    (replyTo.content || "").slice(0, 80);

  return (
    <div className="flex items-center gap-3 px-4 py-2.5 animate-fade-in"
      style={{
        background: "rgba(0,245,255,0.04)",
        borderTop: "1px solid rgba(0,245,255,0.15)",
        borderBottom: "1px solid rgba(255,255,255,0.04)",
      }}>
      {/* Left accent bar */}
      <div className="w-1 self-stretch rounded-full shrink-0"
        style={{ background: "var(--primary)" }} />

      {/* Reply icon */}
      <FaReply size={12} style={{ color: "var(--primary)", flexShrink: 0 }} />

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold mb-0.5 truncate" style={{ color: "var(--primary)" }}>
          {replyTo.senderName || "You"}
        </p>
        <p className="text-xs truncate" style={{ color: "var(--muted2)" }}>
          {preview}
        </p>
      </div>

      {/* Cancel */}
      <button onClick={onCancel}
        className="p-1.5 rounded-lg transition-all hover:bg-white/10 shrink-0"
        style={{ color: "var(--muted)" }}>
        <FaTimes size={12} />
      </button>
    </div>
  );
};

export default ReplyBar;