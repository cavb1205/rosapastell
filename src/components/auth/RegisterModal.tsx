"use client";

import { useEffect, Suspense } from "react";
import { X } from "lucide-react";
import Link from "next/link";
import { useUIStore } from "@/store/ui";
import { RegisterForm } from "./RegisterForm";

export function RegisterModal() {
  const { registerModalOpen, registerPrefill, closeRegisterModal } = useUIStore();

  useEffect(() => {
    if (!registerModalOpen) return;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeRegisterModal();
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [registerModalOpen, closeRegisterModal]);

  if (!registerModalOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Crear cuenta"
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={closeRegisterModal}
      />

      {/* Panel */}
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-y-auto max-h-[90vh]">

        {/* Header */}
        <div className="sticky top-0 bg-white z-10 flex items-center justify-between px-6 pt-6 pb-4 border-b border-warm-100">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-burgundy-500 mb-1">
              Cuenta
            </p>
            <h2 className="font-heading text-2xl text-warm-900">Crear una cuenta</h2>
          </div>
          <button
            onClick={closeRegisterModal}
            className="p-2 text-warm-400 hover:text-warm-700 transition-colors rounded-lg hover:bg-warm-50"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <div className="px-6 py-6">
          <Suspense>
            <RegisterForm
              initialValues={registerPrefill}
              onSuccess={closeRegisterModal}
            />
          </Suspense>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 text-center">
          <p className="text-xs text-warm-300">
            Al registrarte aceptas nuestra{" "}
            <Link
              href="/politica-de-privacidad"
              onClick={closeRegisterModal}
              className="underline hover:text-warm-500 transition-colors"
            >
              política de privacidad
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}
