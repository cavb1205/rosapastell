"use client";

import { Suspense } from "react";
import { useParams } from "next/navigation";
import ProductLoading from "./loading";

export default function ProductTemplate({ children }: { children: React.ReactNode }) {
  const { slug } = useParams();

  return (
    <Suspense key={slug as string} fallback={<ProductLoading />}>
      {children}
    </Suspense>
  );
}
