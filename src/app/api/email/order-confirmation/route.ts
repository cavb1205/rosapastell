import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/brevo";
import { orderConfirmationHtml } from "@/lib/email-templates";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      orderNumber,
      email,
      firstName,
      items,
      subtotal,
      discount,
      couponCode,
      total,
      city,
      address,
    } = body;

    if (!email || !orderNumber || !items?.length) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
    }

    const htmlContent = orderConfirmationHtml({
      orderNumber,
      firstName: firstName || "Cliente",
      items,
      subtotal,
      discount,
      couponCode,
      total,
      city,
      address,
    });

    await sendEmail({
      to: [{ email, name: firstName }],
      subject: `Tu pedido #${orderNumber} en Rosa Pastell`,
      htmlContent,
    });

    return NextResponse.json({ sent: true });
  } catch (error) {
    // No falla el flujo de compra si el email falla
    console.error("[Email] Error enviando confirmación:", error);
    return NextResponse.json({ sent: false, error: "Error interno" }, { status: 500 });
  }
}
