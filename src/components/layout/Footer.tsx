import Link from "next/link";
import { Mail, Phone } from "lucide-react";
import {
  SITE_NAME,
  WHATSAPP_NUMBER,
  SOCIAL_LINKS,
} from "@/lib/constants";

export function Footer() {
  return (
    <footer className="bg-warm-800 text-warm-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <h3 className="font-heading text-2xl text-white mb-3">
              {SITE_NAME}
            </h3>
            <p className="text-sm text-warm-300 leading-relaxed">
              Más de 10 años vistiendo tus sueños. Pijamas con estilo y
              comodidad para toda Colombia.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-warm-300 mb-4">
              Navegación
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/"
                  className="text-sm text-warm-300 hover:text-white transition-colors"
                >
                  Inicio
                </Link>
              </li>
              <li>
                <Link
                  href="/colecciones"
                  className="text-sm text-warm-300 hover:text-white transition-colors"
                >
                  Colecciones
                </Link>
              </li>
              <li>
                <Link
                  href="/nosotros"
                  className="text-sm text-warm-300 hover:text-white transition-colors"
                >
                  Nosotros
                </Link>
              </li>
              <li>
                <Link
                  href="/como-comprar"
                  className="text-sm text-warm-300 hover:text-white transition-colors"
                >
                  Cómo Comprar
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-warm-300 mb-4">
              Contacto
            </h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-warm-300">
                <Phone className="h-4 w-4 flex-shrink-0" />
                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  +57 315 608 2381
                </a>
              </li>
              <li className="flex items-center gap-2 text-sm text-warm-300">
                <Mail className="h-4 w-4 flex-shrink-0" />
                <span>Ibagué, Tolima, Colombia</span>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-warm-300 mb-4">
              Síguenos
            </h4>
            <div className="flex gap-4">
              <a
                href={SOCIAL_LINKS.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="text-warm-300 hover:text-white transition-colors text-sm font-medium"
                aria-label="Facebook"
              >
                Facebook
              </a>
              <a
                href={SOCIAL_LINKS.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-warm-300 hover:text-white transition-colors text-sm font-medium"
                aria-label="Instagram"
              >
                Instagram
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-warm-700 pt-6 text-center">
          <p className="text-xs text-warm-400">
            &copy; {new Date().getFullYear()} {SITE_NAME}. Todos los derechos
            reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
