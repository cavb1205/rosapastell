"use client";

import { Heart } from "lucide-react";
import { useWishlistStore } from "@/store/wishlist";
import { useHydration } from "@/hooks/useHydration";

interface WishlistButtonProps {
  productId: number;
  name: string;
  slug: string;
  price: string;
  image: string;
  className?: string;
}

export function WishlistButton({ productId, name, slug, price, image, className = "" }: WishlistButtonProps) {
  const { toggle, has } = useWishlistStore();
  const hydrated = useHydration();
  const saved = hydrated && has(productId);

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    toggle({ productId, name, slug, price, image, addedAt: Date.now() });
  }

  return (
    <button
      onClick={handleClick}
      aria-label={saved ? "Quitar de favoritos" : "Guardar en favoritos"}
      className={`flex items-center justify-center rounded-full transition-all duration-200 ${
        saved
          ? "bg-burgundy-500 text-white"
          : "bg-white/80 backdrop-blur-sm text-warm-400 hover:text-burgundy-500 hover:bg-white"
      } ${className}`}
    >
      <Heart className={`h-4 w-4 transition-all ${saved ? "fill-white" : ""}`} />
    </button>
  );
}
