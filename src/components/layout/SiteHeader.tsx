"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { ShoppingBag, Search, Menu, X, User, Crown, LogOut, Package, Heart } from "lucide-react";
import { NAV_LINKS } from "@/lib/constants";
import { useCartStore } from "@/store/cart";
import { useAuthStore } from "@/store/auth";
import { useUIStore } from "@/store/ui";
import { useHydration } from "@/hooks/useHydration";

export function SiteHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const itemCount = useCartStore((s) => s.getItemCount());
  const openDrawer = useCartStore((s) => s.openDrawer);
  const { user, clearAuth } = useAuthStore();
  const openRegisterModal = useUIStore((s) => s.openRegisterModal);
  const hydrated = useHydration();
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Cerrar menú móvil al navegar
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    clearAuth();
    setUserMenuOpen(false);
    router.push("/");
    router.refresh();
  }

  // Dropdown desktop (solo visible en md+)
  const UserDropdown = () => (
    <div className="hidden md:block relative" ref={userMenuRef}>
      {hydrated && (
        <>
          {user ? (
            <>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="relative p-2 text-warm-600 hover:text-burgundy-500 transition-colors"
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
                    <p className="text-sm font-semibold text-warm-800 truncate">{user.name}</p>
                    <p className="text-xs text-warm-400 truncate">{user.email}</p>
                    {user.isWholesale && (
                      <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-semibold text-burgundy-600 bg-burgundy-50 rounded-full px-2 py-0.5">
                        <Crown className="h-2.5 w-2.5" /> Mayorista
                      </span>
                    )}
                  </div>
                  <Link href="/cuenta" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-warm-700 hover:bg-warm-50 transition-colors">
                    <User className="h-4 w-4 text-warm-400" /> Mi cuenta
                  </Link>
                  <Link href="/cuenta" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-warm-700 hover:bg-warm-50 transition-colors">
                    <Package className="h-4 w-4 text-warm-400" /> Mis pedidos
                  </Link>
                  <Link href="/cuenta/favoritos" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-warm-700 hover:bg-warm-50 transition-colors">
                    <Heart className="h-4 w-4 text-warm-400" /> Favoritos
                  </Link>
                  <hr className="my-1 border-warm-100" />
                  <button onClick={handleLogout} className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors">
                    <LogOut className="h-4 w-4" /> Cerrar sesión
                  </button>
                </div>
              )}
            </>
          ) : (
            <Link href="/cuenta/ingresar" className="p-2 text-warm-600 hover:text-burgundy-500 transition-colors" aria-label="Ingresar">
              <User className="h-5 w-5" />
            </Link>
          )}
        </>
      )}
    </div>
  );

  // Icono usuario móvil — link directo a /cuenta o /ingresar
  const MobileUserIcon = () => (
    <div className="md:hidden">
      {hydrated && (
        <Link
          href={user ? "/cuenta" : "/cuenta/ingresar"}
          className="relative p-2 text-warm-600 hover:text-burgundy-500 transition-colors inline-flex"
          aria-label="Mi cuenta"
        >
          <User className="h-5 w-5" />
          {user?.isWholesale && (
            <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-burgundy-500">
              <Crown className="h-2 w-2 text-white" />
            </span>
          )}
        </Link>
      )}
    </div>
  );

  const ActionIcons = () => (
    <div className="flex items-center gap-0.5">
      <Link href="/buscar" className="p-2 text-warm-600 hover:text-burgundy-500 transition-colors" aria-label="Buscar">
        <Search className="h-5 w-5" />
      </Link>
      <MobileUserIcon />
      <UserDropdown />
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
    </div>
  );

  return (
    <header className="w-full bg-white border-b border-warm-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          {/* Fila top mobile: hamburger + iconos */}
          <div className="flex md:hidden items-center justify-between pt-4 pb-2">
            <button
              type="button"
              className="-ml-2 p-2 text-warm-600 hover:text-warm-800"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Abrir menú"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
            <ActionIcons />
          </div>

          {/* Logo — full width mobile, grande en desktop */}
          <div className="flex justify-center pt-2 md:pt-8 pb-3">
            <div className="w-full md:max-w-xl lg:max-w-3xl">
              <Link href="/">
                <Image
                  src="/logo-rosapastell.png"
                  alt="Rosa Pastell — Pijamas"
                  width={760}
                  height={215}
                  className="w-full h-auto object-contain"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 576px, 768px"
                  priority
                />
              </Link>
            </div>
          </div>

          {/* Tagline */}
          <div className="flex items-center justify-center gap-3 pb-4">
            <span className="block h-px w-10 bg-burgundy-300" />
            <span className="text-burgundy-400">♥</span>
            <span className="text-xs tracking-widest uppercase text-warm-500">
              Más de 10 años vistiendo tus sueños
            </span>
            <span className="text-burgundy-400">♥</span>
            <span className="block h-px w-10 bg-burgundy-300" />
          </div>

          {/* Nav row desktop: links centrados + iconos a la derecha */}
          <div className="hidden md:flex items-center border-t border-warm-100">
            <div className="flex-1 flex items-center justify-center">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="relative px-6 py-4 text-sm font-medium tracking-wide text-warm-600 hover:text-burgundy-500 transition-colors group"
                >
                  {link.label}
                  <span className="absolute bottom-0 left-6 right-6 h-0.5 bg-burgundy-400 scale-x-0 group-hover:scale-x-100 transition-transform origin-center duration-200" />
                </Link>
              ))}
            </div>
            <ActionIcons />
          </div>
        </div>

        {/* Mobile menu drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-warm-100 bg-white">
            <nav className="px-4 py-4 space-y-1">
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
                    <p className="text-sm font-semibold text-warm-800 py-1">{user.name}</p>
                    {user.isWholesale && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-burgundy-600 bg-burgundy-50 rounded-full px-2 py-0.5 mb-2">
                        <Crown className="h-2.5 w-2.5" /> Mayorista
                      </span>
                    )}
                    <Link href="/cuenta" className="flex items-center gap-2 text-sm text-warm-600 hover:text-burgundy-600 py-2" onClick={() => setMobileMenuOpen(false)}>
                      <Package className="h-4 w-4 text-warm-400" /> Mi cuenta y pedidos
                    </Link>
                    <Link href="/cuenta/favoritos" className="flex items-center gap-2 text-sm text-warm-600 hover:text-burgundy-600 py-2" onClick={() => setMobileMenuOpen(false)}>
                      <Heart className="h-4 w-4 text-warm-400" /> Favoritos
                    </Link>
                    <Link href="/cuenta/perfil" className="flex items-center gap-2 text-sm text-warm-600 hover:text-burgundy-600 py-2" onClick={() => setMobileMenuOpen(false)}>
                      <User className="h-4 w-4 text-warm-400" /> Mi perfil
                    </Link>
                    <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="flex items-center gap-2 text-sm text-red-500 py-2">
                      <LogOut className="h-4 w-4" /> Cerrar sesión
                    </button>
                  </>
                ) : (
                  <div className="flex gap-4">
                    <Link href="/cuenta/ingresar" className="text-sm font-medium text-warm-600 py-2" onClick={() => setMobileMenuOpen(false)}>
                      Ingresar
                    </Link>
                    <button type="button" className="text-sm font-medium text-burgundy-500 py-2" onClick={() => { setMobileMenuOpen(false); openRegisterModal(); }}>
                      Registrarse
                    </button>
                  </div>
                )}
              </div>
            </nav>
          </div>
        )}
    </header>
  );
}
