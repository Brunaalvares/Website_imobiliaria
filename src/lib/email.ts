import nodemailer from "nodemailer";
import { prisma } from "./prisma";

export async function sendAdminNotification(subject: string, html: string) {
  const settings = await prisma.siteSettings.findUnique({ where: { id: "default" } });
  if (!settings?.email) return { sent: false, reason: "no-admin-email" };

  const host = settings.smtpHost || process.env.SMTP_HOST;
  const user = settings.smtpUser || process.env.SMTP_USER;
  const pass = settings.smtpPass || process.env.SMTP_PASS;
  const from = settings.smtpFrom || process.env.SMTP_FROM || user;
  const port = settings.smtpPort || Number(process.env.SMTP_PORT || 587);

  if (!host || !user || !pass) {
    return { sent: false, reason: "smtp-not-configured" };
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  await transporter.sendMail({
    from,
    to: settings.email,
    subject,
    html,
  });

  return { sent: true };
}
