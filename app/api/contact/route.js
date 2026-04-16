import nodemailer from "nodemailer";

const DEFAULT_TO = "sales.colombopvc@gmail.com";

const MAX = { name: 200, email: 254, phone: 40, subject: 200, message: 8000 };

function validatePayload(body) {
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";
  const subject = typeof body.subject === "string" ? body.subject.trim() : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";

  if (!name || name.length > MAX.name) return { error: "Name is required." };
  if (/\d/.test(name)) return { error: "Numbers are not allowed in your full name." };
  if (/[^\p{L}\s]/u.test(name))
    return { error: "Special characters are not allowed in your full name." };

  if (!email || email.length > MAX.email) return { error: "Email is required." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return { error: "Enter a valid email address." };

  if (phone.length > MAX.phone) return { error: "Phone is too long." };
  if (subject.length > MAX.subject) return { error: "Subject is too long." };

  if (!message || message.length > MAX.message) return { error: "Message is required." };

  return { name, email, phone, subject, message };
}

function escapeHtml(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = validatePayload(body);
  if (parsed.error) {
    return Response.json({ error: parsed.error }, { status: 400 });
  }

  const { name, email, phone, subject, message } = parsed;

  const to = process.env.CONTACT_MAIL_TO?.trim() || DEFAULT_TO;
  const smtpUser = process.env.CONTACT_SMTP_USER?.trim();
  const smtpPass = process.env.CONTACT_SMTP_PASS?.trim();

  if (!smtpUser || !smtpPass) {
    console.error("Contact form: set CONTACT_SMTP_USER and CONTACT_SMTP_PASS (Gmail app password).");
    return Response.json(
      {
        error:
          "Message could not be sent right now. If you are the site owner, configure email in the server environment.",
      },
      { status: 503 }
    );
  }

  const transporter = nodemailer.createTransport({
    host: process.env.CONTACT_SMTP_HOST?.trim() || "smtp.gmail.com",
    port: Number(process.env.CONTACT_SMTP_PORT) || 465,
    secure: (Number(process.env.CONTACT_SMTP_PORT) || 465) === 465,
    auth: { user: smtpUser, pass: smtpPass },
  });

  const safe = {
    name: escapeHtml(name),
    email: escapeHtml(email),
    phone: escapeHtml(phone || "—"),
    subject: escapeHtml(subject || "—"),
    message: escapeHtml(message).replace(/\n/g, "<br/>"),
  };

  const mailSubject = subject
    ? `[Colombo PVC Contact] ${subject}`
    : `[Colombo PVC Contact] Message from ${name}`;

  const text = [
    `Name: ${name}`,
    `Email: ${email}`,
    `Phone: ${phone || "—"}`,
    `Subject: ${subject || "—"}`,
    "",
    message,
  ].join("\n");

  const html = `
    <h2 style="font-family:sans-serif;color:#0f172a;">New contact form message</h2>
    <table style="font-family:sans-serif;font-size:14px;color:#334155;border-collapse:collapse;">
      <tr><td style="padding:6px 12px 6px 0;font-weight:600;">Name</td><td>${safe.name}</td></tr>
      <tr><td style="padding:6px 12px 6px 0;font-weight:600;">Email</td><td><a href="mailto:${safe.email}">${safe.email}</a></td></tr>
      <tr><td style="padding:6px 12px 6px 0;font-weight:600;">Phone</td><td>${safe.phone}</td></tr>
      <tr><td style="padding:6px 12px 6px 0;font-weight:600;">Subject</td><td>${safe.subject}</td></tr>
    </table>
    <p style="font-family:sans-serif;font-size:14px;color:#334155;margin-top:20px;font-weight:600;">Message</p>
    <div style="font-family:sans-serif;font-size:14px;color:#1e293b;line-height:1.6;border-left:3px solid #fbbf24;padding-left:12px;">${safe.message}</div>
  `;

  try {
    await transporter.sendMail({
      from: `"Colombo PVC Website" <${smtpUser}>`,
      to,
      replyTo: email,
      subject: mailSubject,
      text,
      html,
    });
  } catch (err) {
    console.error("Contact mail error:", err);
    return Response.json({ error: "Failed to send your message. Please try again or call us." }, { status: 500 });
  }

  return Response.json({ ok: true });
}
