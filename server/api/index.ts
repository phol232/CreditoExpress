import 'dotenv/config';
import express from "express";
import cors from "cors";
import { sendVerificationCode } from "../services/emailService";
import { 
  generateVerificationCode, 
  storeVerificationCode, 
  verifyCode,
  hasValidCode 
} from "../services/verificationService";

const app = express();

// CORS configuration - permite requests desde el frontend
const allowedOrigins = [
  process.env.VITE_APP_URL,
  'http://localhost:5173',
  'http://localhost:5000',
  'https://credito-express.vercel.app',
  'https://credito-express-phi.vercel.app',
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Permitir requests sin origin (como mobile apps o curl)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin) || origin?.includes('vercel.app')) {
      callback(null, true);
    } else {
      callback(null, true); // Permitir todos por ahora para debugging
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.options('*', cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

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

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false, 
        message: "Email inválido" 
      });
    }

    // Generar código
    const code = generateVerificationCode();
    
    console.log(`📧 Enviando código ${code} a: ${email}`);
    
    // Guardar código
    storeVerificationCode(email, code);

    // Enviar email
    await sendVerificationCode(email, code);
    
    console.log(`✅ Código enviado exitosamente a: ${email}`);

    res.json({ 
      success: true, 
      message: "Código de verificación enviado" 
    });
  } catch (error) {
    console.error("Error sending verification code:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error al enviar el código de verificación" 
    });
  }
});

// Verificar código
app.post("/api/auth/verify-code", async (req, res) => {
  try {
    const { email, code } = req.body;

    console.log(`🔍 Verificando código para: ${email}, código recibido: ${code}`);

    if (!email || !code) {
      return res.status(400).json({ 
        success: false, 
        message: "Email y código son requeridos" 
      });
    }

    const result = verifyCode(email, code);
    
    console.log(`📝 Resultado de verificación:`, result);
    
    if (result.success) {
      console.log(`✅ Código verificado correctamente para: ${email}`);
      res.json(result);
    } else {
      console.log(`❌ Código incorrecto para: ${email} - ${result.message}`);
      res.status(400).json(result);
    }
  } catch (error) {
    console.error("Error verifying code:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error al verificar el código" 
    });
  }
});

// Verificar si hay un código válido
app.get("/api/auth/has-valid-code/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const hasCode = hasValidCode(email);
    
    res.json({ hasValidCode: hasCode });
  } catch (error) {
    console.error("Error checking valid code:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error al verificar el código" 
    });
  }
});

// Error handler
app.use((err: any, _req: any, res: any, _next: any) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  console.error('Error:', err);
  res.status(status).json({ message });
});

export default app;
