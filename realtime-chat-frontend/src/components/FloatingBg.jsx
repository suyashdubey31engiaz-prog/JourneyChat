import React from "react";

/**
 * FloatingBg — pure CSS animated blobs for auth pages.
 * 6 blobs with staggered delays and mix-blend-mode:screen.
 */
export default function FloatingBg() {
  return (
    <div aria-hidden className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
      <div className="floating-area w-full h-full relative">
        <span className="float-p article-1" />
        <span className="float-p article-2" />
        <span className="float-p article-3" />
        <span className="float-p article-4" />
        <span className="float-p article-5" />
        <span className="float-p article-6" />
      </div>
    </div>
  );
}