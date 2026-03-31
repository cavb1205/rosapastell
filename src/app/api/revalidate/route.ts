import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const slug = body?.slug as string | undefined;

    if (slug) {
      revalidatePath(`/producto/${slug}`);
    }

    revalidatePath("/");
    revalidatePath("/categorias/[slug]", "page");

    return NextResponse.json({ revalidated: true });
  } catch (error) {
    console.error("Revalidation error:", error);
    return NextResponse.json(
      { error: "Error al revalidar" },
      { status: 500 }
    );
  }
}
