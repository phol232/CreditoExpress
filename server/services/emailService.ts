import * as brevo from '@getbrevo/brevo';

// Configurar la API key correctamente
const apiInstance = new brevo.TransactionalEmailsApi();
const apiKey = process.env.BREVO_API_KEY || process.env.VITE_BREVO_API_KEY;

if (!apiKey) {
  console.error('⚠️ BREVO_API_KEY no está configurada en el .env');
  console.error('Por favor, obtén tu API key de: https://app.brevo.com/settings/keys/api');
} else {
  console.log('✅ Brevo API Key configurada:', apiKey.substring(0, 10) + '...');
}

apiInstance.setApiKey(
  brevo.TransactionalEmailsApiApiKeys.apiKey,
  apiKey || ''
);

interface SendEmailParams {
  to: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
}

export async function sendEmail({ to, subject, htmlContent, textContent }: SendEmailParams) {
  const sendSmtpEmail = new brevo.SendSmtpEmail();

  sendSmtpEmail.subject = subject;
  sendSmtpEmail.htmlContent = htmlContent;
  sendSmtpEmail.sender = {
    name: process.env.BREVO_FROM_NAME || process.env.VITE_BREVO_FROM_NAME || 'CreditoExpress',
    email: process.env.BREVO_FROM_EMAIL || process.env.VITE_BREVO_FROM_EMAIL || 'noreply@creditoexpress.com'
  };
  sendSmtpEmail.to = [{ email: to }];

  if (textContent) {
    sendSmtpEmail.textContent = textContent;
  }

  try {
    const response = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log('Email sent successfully:', response);
    return { success: true, messageId: (response.body as any)?.messageId || 'sent' };
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email');
  }
}

export async function sendVerificationCode(email: string, code: string) {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .code-box { background: white; border: 2px dashed #667eea; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
        .code { font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #667eea; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Verificación de Email</h1>
        </div>
        <div class="content">
          <p>Hola,</p>
          <p>Has solicitado registrarte en CreditoExpress. Para continuar con tu registro, por favor usa el siguiente código de verificación:</p>
          
          <div class="code-box">
            <div class="code">${code}</div>
          </div>
          
          <p>Este código expirará en 10 minutos.</p>
          <p>Si no solicitaste este código, puedes ignorar este mensaje.</p>
          
          <div class="footer">
            <p>Este es un mensaje automático, por favor no respondas a este email.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  const textContent = `
    Verificación de Email
    
    Hola,
    
    Has solicitado registrarte en CreditoExpress. Para continuar con tu registro, por favor usa el siguiente código de verificación:
    
    ${code}
    
    Este código expirará en 10 minutos.
    
    Si no solicitaste este código, puedes ignorar este mensaje.
  `;

  return sendEmail({
    to: email,
    subject: 'Código de Verificación - CreditoExpress',
    htmlContent,
    textContent
  });
}
