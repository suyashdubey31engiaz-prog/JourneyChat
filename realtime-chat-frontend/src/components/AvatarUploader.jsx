import React, { useState, useRef } from "react";
import { FaCamera, FaSpinner, FaCheck } from "react-icons/fa";
import { uploadAvatar } from "../utils/api";

/**
 * AvatarUploader
 * Uploads to backend → Cloudinary via multer-storage-cloudinary.
 * Props:
 *   currentAvatar  string|null  — current avatar URL
 *   userName       string       — used for initials fallback
 *   onSuccess      (url) => void — called with new Cloudinary URL after upload
 */
export default function AvatarUploader({ currentAvatar, userName = "", onSuccess }) {
  const [preview,   setPreview]  = useState(currentAvatar || null);
  const [loading,   setLoading]  = useState(false);
  const [done,      setDone]     = useState(false);
  const [err,       setErr]      = useState("");
  const inputRef = useRef(null);

  const letter = (userName || "?").charAt(0).toUpperCase();

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setErr(""); setDone(false);

    // Local preview instantly
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result);
    reader.readAsDataURL(file);

    // Upload to backend → Cloudinary
    setLoading(true);
    try {
      const form = new FormData();
      form.append("avatar", file);
      const res = await uploadAvatar(form);
      setPreview(res.data.avatar);
      setDone(true);
      onSuccess?.(res.data.avatar);
      setTimeout(() => setDone(false), 2500);
    } catch (err) {
      setErr("Upload failed. Try again.");
      console.error("Avatar upload:", err);
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center gap-4">
      {/* Avatar preview */}
      <div className="relative group cursor-pointer" onClick={() => inputRef.current?.click()}>
        {preview
          ? <img src={preview} alt="avatar"
              className="w-16 h-16 rounded-full object-cover transition-all group-hover:brightness-75"
              style={{ boxShadow: "0 0 0 2px var(--dark), 0 0 0 4px var(--primary), 0 0 12px var(--primary)" }} />
          : <div className="w-16 h-16 rounded-full flex items-center justify-center font-black text-2xl text-white transition-all group-hover:brightness-75"
              style={{ background: "linear-gradient(135deg,#0e7490,#1d4ed8)", boxShadow: "0 0 0 2px var(--dark), 0 0 0 4px var(--primary)" }}>
              {letter}
            </div>
        }
        {/* Overlay icon */}
        <div className="absolute inset-0 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ background: "rgba(0,0,0,0.55)" }}>
          {loading
            ? <FaSpinner size={18} className="text-white animate-spin" />
            : done
              ? <FaCheck size={18} style={{ color: "var(--neon-green)" }} />
              : <FaCamera size={16} className="text-white" />
          }
        </div>
      </div>

      {/* Label */}
      <div>
        <button type="button" onClick={() => inputRef.current?.click()}
          className="text-sm font-semibold flex items-center gap-2 transition-colors"
          style={{ color: "var(--primary)" }}
          disabled={loading}>
          <FaCamera size={12} />
          {loading ? "Uploading…" : done ? "✓ Saved!" : "Change photo"}
        </button>
        <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>JPG, PNG, WebP · max 5 MB</p>
        {err && <p className="text-xs mt-1 text-red-400">{err}</p>}
        <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
      </div>
    </div>
  );
}