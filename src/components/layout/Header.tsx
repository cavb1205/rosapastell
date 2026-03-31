"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingBag, Search, Menu, X, User, Crown, LogOut, Package } from "lucide-react";
import { NAV_LINKS, SITE_NAME } from "@/lib/constants";
import { useCartStore } from "@/store/cart";
import { useAuthStore } from "@/store/auth";
import { useHydration } from "@/hooks/useHydration";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const itemCount = useCartStore((s) => s.getItemCount());
  const { user, clearAuth } = useAuthStore();
  const hydrated = useHydration();
  const router = useRouter();

  // Cerrar menú de usuario al hacer click fuera
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    clearAuth();
    setUserMenuOpen(false);
    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-warm-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between md:h-20">
          {/* Mobile menu button */}
          <button
            type="button"
            className="md:hidden -ml-2 p-2 text-warm-600 hover:text-warm-800"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Abrir menú"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>

          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="font-heading text-2xl md:text-3xl text-burgundy-500 tracking-tight">
              {SITE_NAME}
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-warm-600 hover:text-burgundy-500 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <Link
              href="/buscar"
              className="p-2 text-warm-600 hover:text-warm-800 transition-colors"
              aria-label="Buscar"
            >
              <Search className="h-5 w-5" />
            </Link>

            {/* User menu */}
            {hydrated && (
              <div className="relative" ref={userMenuRef}>
                {user ? (
                  <>
                    <button
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="relative p-2 text-warm-600 hover:text-warm-800 transition-colors"
                      aria-label="Mi cuenta"
                    >
                      <User className="h-5 w-5" />
                      {user.isWholesale && (
                        <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-burgundy-500">
                          <Crown className="h-2 w-2 text-white" />
                        </span>
                      )}
                    </button>

                    {userMenuOpen && (
                      <div className="absolute right-0 top-full mt-2 w-52 rounded-xl bg-white shadow-lg border border-warm-100 py-2 z-50">
                        <div className="px-4 py-2 border-b border-warm-50">
                          <p className="text-sm font-semibold text-warm-800 truncate">
                            {user.name}
                          </p>
                          <p className="text-xs text-warm-400 truncate">{user.email}</p>
                          {user.isWholesale && (
                            <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-semibold text-burgundy-600 bg-burgundy-50 rounded-full px-2 py-0.5">
                              <Crown className="h-2.5 w-2.5" /> Mayorista
                            </span>
                          )}
                        </div>
                        <Link
                          href="/cuenta"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-warm-700 hover:bg-warm-50 transition-colors"
                        >
                          <User className="h-4 w-4 text-warm-400" />
                          Mi cuenta
                        </Link>
                        <Link
                          href="/cuenta"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-warm-700 hover:bg-warm-50 transition-colors"
                        >
                          <Package className="h-4 w-4 text-warm-400" />
                          Mis pedidos
                        </Link>
                        <hr className="my-1 border-warm-100" />
                        <button
                          onClick={handleLogout}
                          className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <LogOut className="h-4 w-4" />
                          Cerrar sesión
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href="/cuenta/ingresar"
                    className="p-2 text-warm-600 hover:text-warm-800 transition-colors"
                    aria-label="Ingresar"
                  >
                    <User className="h-5 w-5" />
                  </Link>
                )}
              </div>
            )}

            <Link
              href="/carrito"
              className="relative p-2 text-warm-600 hover:text-warm-800 transition-colors"
              aria-label="Carrito de compras"
            >
              <ShoppingBag className="h-5 w-5" />
              {hydrated && itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-burgundy-500 text-[11px] font-bold text-white">
                  {itemCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-warm-100 bg-white">
          <nav className="px-4 py-4 space-y-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block text-base font-medium text-warm-700 hover:text-burgundy-500 transition-colors py-2.5 border-b border-warm-50 last:border-0"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-2 border-t border-warm-100 mt-2">
              {user ? (
                <>
                  <div className="py-2">
                    <p className="text-sm font-semibold text-warm-800">{user.name}</p>
                    {user.isWholesale && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-burgundy-600 bg-burgundy-50 rounded-full px-2 py-0.5 mt-1">
                        <Crown className="h-2.5 w-2.5" /> Mayorista
                      </span>
                    )}
                  </div>
                  <Link
                    href="/cuenta"
                    className="block text-sm text-warm-600 hover:text-burgundy-500 py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Mi cuenta y pedidos
                  </Link>
                  <button
                    onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                    className="block text-sm text-red-500 py-2"
                  >
                    Cerrar sesión
                  </button>
                </>
              ) : (
                <Link
                  href="/cuenta/ingresar"
                  className="block text-sm font-medium text-burgundy-500 py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Ingresar / Registrarse
                </Link>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
