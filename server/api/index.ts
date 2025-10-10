import express from "express";
import cors from "cors";
import * as brevo from '@getbrevo/brevo';

const app = express();

// Configurar Brevo
const apiInstance = new brevo.TransactionalEmailsApi();
const apiKey = process.env.BREVO_API_KEY;

if (apiKey) {
  apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, apiKey);
  console.log('✅ Brevo API configurada');
} else {
  console.warn('⚠️ BREVO_API_KEY no configurada');
}

// Función para enviar email
async function sendBrevoEmail(email: string, code: string) {
  if (!apiKey) {
    throw new Error('BREVO_API_KEY no configurada');
  }

  const sendSmtpEmail = new brevo.SendSmtpEmail();
  sendSmtpEmail.subject = 'Código de Verificación - CreditoExpress';
  sendSmtpEmail.sender = {
    name: process.env.BREVO_FROM_NAME || 'CreditoExpress',
    email: process.env.BREVO_FROM_EMAIL || 'noreply@creditoexpress.com'
  };
  sendSmtpEmail.to = [{ email }];
  sendSmtpEmail.htmlContent = `
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
        </div>
      </div>
    </body>
    </html>
  `;

  await apiInstance.sendTransacEmail(sendSmtpEmail);
}

app.use(cors());
app.use(express.json());

const verificationCodes = new Map<string, { code: string; expiresAt: number; lastSent?: number }>();

app.get("/", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head><title>CreditoExpress API</title></head>
      <body>
        <h1>✅ CreditoExpress Backend API</h1>
        <p>El servidor está funcionando correctamente.</p>
        <p>Endpoints disponibles:</p>
        <ul>
          <li>POST /api/auth/send-verification-code</li>
          <li>POST /api/auth/verify-code</li>
        </ul>
      </body>
    </html>
  `);
});

// Generar código de 6 dígitos
function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Enviar código de verificación
app.post("/api/auth/send-verification-code", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email es requerido"
      });
    }

    // Verificar si ya se envió un código recientemente (últimos 60 segundos)
    const existing = verificationCodes.get(email);
    if (existing && existing.lastSent && (Date.now() - existing.lastSent) < 60000) {
      console.log(`⏱️ Código ya enviado recientemente para ${email}`);
      return res.json({
        success: true,
        message: "Código de verificación ya enviado. Por favor espera un minuto antes de solicitar otro."
      });
    }

    const code = generateCode();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutos
    const lastSent = Date.now();

    // Guardar código
    verificationCodes.set(email, { code, expiresAt, lastSent });

    console.log(`📧 Código generado para ${email}: ${code}`);

    // Enviar email con Brevo
    try {
      await sendBrevoEmail(email, code);
      console.log(`✅ Email enviado a ${email}`);
    } catch (emailError) {
      console.error('Error enviando email:', emailError);
      // Continuar aunque falle el email (para testing)
    }

    res.json({
      success: true,
      message: "Código de verificación enviado"
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      success: false,
      message: "Error al enviar el código"
    });
  }
});

// Verificar código
app.post("/api/auth/verify-code", (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({
        success: false,
        message: "Email y código son requeridos"
      });
    }

    const stored = verificationCodes.get(email);

    if (!stored) {
      return res.status(400).json({
        success: false,
        message: "Código no encontrado o expirado"
      });
    }

    if (Date.now() > stored.expiresAt) {
      verificationCodes.delete(email);
      return res.status(400).json({
        success: false,
        message: "El código ha expirado"
      });
    }

    if (stored.code !== code) {
      return res.status(400).json({
        success: false,
        message: "Código incorrecto"
      });
    }

    // Código correcto
    verificationCodes.delete(email);
    res.json({
      success: true,
      message: "Código verificado correctamente"
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      success: false,
      message: "Error al verificar el código"
    });
  }
});

export default app;
