import express from "express";
import cors from "cors";

const app = express();

// CORS - permitir todos los orígenes por ahora
app.use(cors());
app.use(express.json());

// In-memory storage para códigos de verificación
const verificationCodes = new Map<string, { code: string; expiresAt: number }>();

// Ruta de prueba
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

    const code = generateCode();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutos

    // Guardar código
    verificationCodes.set(email, { code, expiresAt });

    console.log(`📧 Código generado para ${email}: ${code}`);

    // TODO: Aquí iría el envío de email con Brevo
    // Por ahora solo retornamos éxito
    
    res.json({ 
      success: true, 
      message: "Código de verificación enviado",
      // Solo para testing, remover en producción:
      debug: { code }
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
