"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { SizeGuideHeader, SizeGuideBody } from "./SizeGuideContent";

interface SizeGuideModalProps {
  onClose: () => void;
}

export function SizeGuideModal({ onClose }: SizeGuideModalProps) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      aria-modal="true"
      role="dialog"
      aria-labelledby="size-guide-title"
    >
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-2xl shadow-xl overflow-hidden max-h-[92dvh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-warm-100">
          <SizeGuideHeader />
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-warm-400 hover:text-warm-700 hover:bg-warm-100 transition-colors"
            aria-label="Cerrar guía de tallas"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <SizeGuideBody />
      </div>
    </div>
  );
}
