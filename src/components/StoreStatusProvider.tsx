"use client";

import { createContext, useContext } from "react";
import type { StoreStatus } from "@/lib/woocommerce";

const StoreStatusContext = createContext<StoreStatus>({ paused: false, message: "" });

/**
 * Comparte el estado de pausa de la tienda (leído en el servidor desde el
 * layout raíz) con todos los componentes cliente — botones de compra, carrito
 * y checkout — sin que cada uno tenga que pedirlo por su cuenta.
 */
export function StoreStatusProvider({
  value,
  children,
}: {
  value: StoreStatus;
  children: React.ReactNode;
}) {
  return (
    <StoreStatusContext.Provider value={value}>
      {children}
    </StoreStatusContext.Provider>
  );
}

export function useStoreStatus(): StoreStatus {
  return useContext(StoreStatusContext);
}
