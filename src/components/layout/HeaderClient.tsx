"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  ShoppingBag,
  Search,
  Menu,
  X,
  User,
  Crown,
  LogOut,
  Package,
  Heart,
} from "lucide-react";
import { NAV_LINKS } from "@/lib/constants";
import { useCartStore } from "@/store/cart";
import { useAuthStore } from "@/store/auth";
import { useUIStore } from "@/store/ui";
import { useHydration } from "@/hooks/useHydration";

/* ------------------------------------------------------------------ */
/*  Shared: action icons (search, user, cart)                         */
/* ------------------------------------------------------------------ */

function UserIcon({
  user,
  hydrated,
  isWholesale,
}: {
  user: { name: string; email: string; isWholesale: boolean } | null;
  hydrated: boolean;
  isWholesale: boolean;
}) {
  if (!hydrated) return null;
  return (
    <Link
      href={user ? "/cuenta" : "/cuenta/ingresar"}
      className="relative p-2 text-warm-600 hover:text-burgundy-500 transition-colors inline-flex"
      aria-label="Mi cuenta"
    >
      <User className="h-5 w-5" />
      {isWholesale && (
        <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-burgundy-500">
          <Crown className="h-2 w-2 text-white" />
        </span>
      )}
    </Link>
  );
}

function CartButton({
  openDrawer,
  hydrated,
  itemCount,
}: {
  openDrawer: () => void;
  hydrated: boolean;
  itemCount: number;
}) {
  return (
    <button
      onClick={openDrawer}
      className="relative p-2 text-warm-600 hover:text-burgundy-500 transition-colors"
      aria-label="Carrito de compras"
    >
      <ShoppingBag className="h-5 w-5" />
      {hydrated && itemCount > 0 && (
        <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-burgundy-500 text-[11px] font-bold text-white">
          {itemCount}
        </span>
      )}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Desktop action icons (search, user dropdown, cart)                */
/* ------------------------------------------------------------------ */

export function DesktopActions() {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const itemCount = useCartStore((s) => s.getItemCount());
  const openDrawer = useCartStore((s) => s.openDrawer);
  const { user, clearAuth } = useAuthStore();
  const hydrated = useHydration();
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(e.target as Node)
      ) {
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
    <div className="flex items-center gap-0.5">
      <Link
        href="/buscar"
        className="p-2 text-warm-600 hover:text-burgundy-500 transition-colors"
        aria-label="Buscar"
      >
        <Search className="h-5 w-5" />
      </Link>

      {/* User dropdown */}
      <div className="relative" ref={userMenuRef}>
        {hydrated && (
          <>
            {user ? (
              <>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="relative p-2 text-warm-600 hover:text-burgundy-500 transition-colors"
                  aria-label="Mi cuenta"
                  aria-haspopup="menu"
                  aria-expanded={userMenuOpen}
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
                      <p className="text-xs text-warm-400 truncate">
                        {user.email}
                      </p>
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
                      <User className="h-4 w-4 text-warm-400" /> Mi cuenta
                    </Link>
                    <Link
                      href="/cuenta"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-warm-700 hover:bg-warm-50 transition-colors"
                    >
                      <Package className="h-4 w-4 text-warm-400" /> Mis pedidos
                    </Link>
                    <Link
                      href="/cuenta/favoritos"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-warm-700 hover:bg-warm-50 transition-colors"
                    >
                      <Heart className="h-4 w-4 text-warm-400" /> Favoritos
                    </Link>
                    <hr className="my-1 border-warm-100" />
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="h-4 w-4" /> Cerrar sesión
                    </button>
                  </div>
                )}
              </>
            ) : (
              <Link
                href="/cuenta/ingresar"
                className="p-2 text-warm-600 hover:text-burgundy-500 transition-colors"
                aria-label="Ingresar"
              >
                <User className="h-5 w-5" />
              </Link>
            )}
          </>
        )}
      </div>

      <CartButton openDrawer={openDrawer} hydrated={hydrated} itemCount={itemCount} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Mobile header: top bar (hamburger + icons) + drawer               */
/* ------------------------------------------------------------------ */

export function MobileHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const itemCount = useCartStore((s) => s.getItemCount());
  const openDrawer = useCartStore((s) => s.openDrawer);
  const { user, clearAuth } = useAuthStore();
  const openRegisterModal = useUIStore((s) => s.openRegisterModal);
  const hydrated = useHydration();
  const router = useRouter();

  // Cerrar el menú al navegar (incluye botón atrás/adelante del navegador).
  // Patrón de ajuste de estado en render — evita un efecto con setState síncrono.
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setMobileMenuOpen(false);
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    clearAuth();
    router.push("/");
    router.refresh();
  }

  return (
    <>
      {/* Top bar: hamburger + action icons */}
      <div className="flex md:hidden items-center justify-between pt-4 pb-2">
        <button
          type="button"
          className="-ml-2 p-2 text-warm-600 hover:text-warm-800"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-menu"
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
        <div className="flex items-center gap-0.5">
          <Link
            href="/buscar"
            className="p-2 text-warm-600 hover:text-burgundy-500 transition-colors"
            aria-label="Buscar"
          >
            <Search className="h-5 w-5" />
          </Link>
          <UserIcon
            user={user}
            hydrated={hydrated}
            isWholesale={user?.isWholesale ?? false}
          />
          <CartButton openDrawer={openDrawer} hydrated={hydrated} itemCount={itemCount} />
        </div>
      </div>

      {/* Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-warm-100 bg-white">
          <nav id="mobile-menu" className="px-4 py-4 space-y-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block text-base font-medium text-warm-700 hover:text-burgundy-600 py-2.5 border-b border-warm-50 last:border-0 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-3 border-t border-warm-100">
              {user ? (
                <>
                  <p className="text-sm font-semibold text-warm-800 py-1">
                    {user.name}
                  </p>
                  {user.isWholesale && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-burgundy-600 bg-burgundy-50 rounded-full px-2 py-0.5 mb-2">
                      <Crown className="h-2.5 w-2.5" /> Mayorista
                    </span>
                  )}
                  <Link
                    href="/cuenta"
                    className="flex items-center gap-2 text-sm text-warm-600 hover:text-burgundy-600 py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Package className="h-4 w-4 text-warm-400" /> Mi cuenta y
                    pedidos
                  </Link>
                  <Link
                    href="/cuenta/favoritos"
                    className="flex items-center gap-2 text-sm text-warm-600 hover:text-burgundy-600 py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Heart className="h-4 w-4 text-warm-400" /> Favoritos
                  </Link>
                  <Link
                    href="/cuenta/perfil"
                    className="flex items-center gap-2 text-sm text-warm-600 hover:text-burgundy-600 py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <User className="h-4 w-4 text-warm-400" /> Mi perfil
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-2 text-sm text-red-500 py-2"
                  >
                    <LogOut className="h-4 w-4" /> Cerrar sesión
                  </button>
                </>
              ) : (
                <div className="flex gap-4">
                  <Link
                    href="/cuenta/ingresar"
                    className="text-sm font-medium text-warm-600 py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Ingresar
                  </Link>
                  <button
                    type="button"
                    className="text-sm font-medium text-burgundy-500 py-2"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      openRegisterModal();
                    }}
                  >
                    Registrarse
                  </button>
                </div>
              )}
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
