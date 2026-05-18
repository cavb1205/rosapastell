const RESEND_API_KEY = process.env.RESEND_API_KEY!;
const FROM_EMAIL = process.env.EMAIL_FROM || "Rosa Pastell <no-reply@rosapastell.com>";

interface EmailRecipient {
  email: string;
  name?: string;
}

interface SendEmailParams {
  to: EmailRecipient[];
  subject: string;
  htmlContent: string;
}

export async function sendEmail({ to, subject, htmlContent }: SendEmailParams) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: to.map((r) => (r.name ? `${r.name} <${r.email}>` : r.email)),
      subject,
      html: htmlContent,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Resend error: ${err.message || res.statusText}`);
  }

  return res.json();
}
