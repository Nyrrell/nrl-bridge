import { createTransport } from 'nodemailer';

import type { SmtpConfig } from './mail.config';
import type { MailMessage } from './mail.types';

export async function sendMail(
  smtp: SmtpConfig,
  to: string,
  message: MailMessage,
): Promise<void> {
  const transporter = createTransport({
    host: smtp.MAIL_SMTP_HOST,
    port: smtp.MAIL_SMTP_PORT,
    secure: smtp.MAIL_SMTP_SECURE,
    auth: smtp.MAIL_SMTP_USER
      ? { user: smtp.MAIL_SMTP_USER, pass: smtp.MAIL_SMTP_PASS }
      : undefined,
  });

  await transporter.sendMail({
    from: smtp.MAIL_FROM,
    to,
    subject: message.subject,
    html: message.html,
    text: message.text,
  });
}