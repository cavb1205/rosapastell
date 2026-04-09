import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/constants";
import { WishlistPage } from "@/components/cuenta/WishlistPage";

export const metadata: Metadata = {
  title: `Mis Favoritos | ${SITE_NAME}`,
  robots: { index: false },
};

export default function FavoritosPage() {
  return <WishlistPage />;
}
