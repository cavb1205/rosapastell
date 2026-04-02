"use client";

import { useState } from "react";
import { Link2, Check } from "lucide-react";
import { SITE_URL } from "@/lib/constants";

interface ShareButtonsProps {
  slug: string;
  name: string;
}

export function ShareButtons({ slug, name }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const url = `${SITE_URL}/producto/${slug}`;
  const text = `Mira esta pijama: ${name}`;

  function copyLink() {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const shares = [
    {
      label: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      icon: (
        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
          <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.267h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
        </svg>
      ),
      color: "hover:bg-[#1877F2] hover:text-white hover:border-[#1877F2]",
    },
    {
      label: "WhatsApp",
      href: `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`,
      icon: (
        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      ),
      color: "hover:bg-[#25D366] hover:text-white hover:border-[#25D366]",
    },
    {
      label: "X / Twitter",
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      icon: (
        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
      color: "hover:bg-black hover:text-white hover:border-black",
    },
  ];

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs font-semibold uppercase tracking-widest text-warm-400">
        Compartir
      </span>
      <div className="flex items-center gap-2">
        {shares.map((s) => (
          <a
            key={s.label}
            href={s.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Compartir en ${s.label}`}
            className={`flex items-center justify-center w-8 h-8 rounded-full border border-warm-200 text-warm-400 transition-all ${s.color}`}
          >
            {s.icon}
          </a>
        ))}
        <button
          onClick={copyLink}
          aria-label="Copiar enlace"
          className={`flex items-center justify-center w-8 h-8 rounded-full border transition-all ${
            copied
              ? "border-green-400 text-green-500 bg-green-50"
              : "border-warm-200 text-warm-400 hover:bg-warm-100 hover:border-warm-300"
          }`}
        >
          {copied ? <Check className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}
