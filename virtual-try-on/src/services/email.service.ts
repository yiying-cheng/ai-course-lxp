import { Resend } from 'resend';

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  return new Resend(apiKey);
}

function getFromAddress() {
  return process.env.RESEND_FROM_EMAIL ?? 'FitPreview <onboarding@resend.dev>';
}

function welcomeEmailHtml(name: string | null) {
  const greeting = name ? `Hi ${name},` : 'Hi there,';

  return `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
  </head>
  <body style="margin:0;padding:0;background:#fbfbfd;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1d1d1f;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#fbfbfd;padding:48px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:520px;background:#ffffff;border-radius:24px;padding:40px 32px;box-shadow:0 2px 16px rgba(0,0,0,0.06);">
            <tr>
              <td>
                <p style="margin:0 0 8px;font-size:14px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#86868b;">FitPreview</p>
                <h1 style="margin:0 0 16px;font-size:28px;font-weight:600;line-height:1.2;color:#1d1d1f;">Welcome aboard</h1>
                <p style="margin:0 0 16px;font-size:17px;line-height:1.6;color:#1d1d1f;">${greeting}</p>
                <p style="margin:0 0 16px;font-size:17px;line-height:1.6;color:#86868b;">
                  Your account is ready. You now get <strong style="color:#1d1d1f;">5 free try-ons every month</strong> — upload your photo, add any garment, and preview before you buy.
                </p>
                <p style="margin:0 0 28px;font-size:17px;line-height:1.6;color:#86868b;">
                  Your try-on history is saved to your account so you can come back anytime.
                </p>
                <a href="${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}" style="display:inline-block;background:#0071e3;color:#ffffff;text-decoration:none;font-size:16px;font-weight:500;padding:12px 24px;border-radius:999px;">
                  Start trying on
                </a>
                <p style="margin:32px 0 0;font-size:13px;line-height:1.5;color:#86868b;">
                  If you did not create this account, you can ignore this email.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
  `.trim();
}

export async function sendWelcomeEmail(input: {
  email: string;
  name: string | null;
}) {
  const resend = getResendClient();
  if (!resend) {
    console.warn('[email] RESEND_API_KEY not set — skipping welcome email');
    return { sent: false as const, reason: 'missing_api_key' };
  }

  const { error } = await resend.emails.send({
    from: getFromAddress(),
    to: input.email,
    subject: 'Welcome to FitPreview',
    html: welcomeEmailHtml(input.name),
  });

  if (error) {
    console.error('[email] Failed to send welcome email:', error);
    return { sent: false as const, reason: error.message };
  }

  return { sent: true as const };
}
