interface VerificationCode {
  email: string;
  code: string;
  expiresAt: Date;
  attempts: number;
}

// In-memory store for verification codes (en producción, usar Redis o base de datos)
const verificationCodes = new Map<string, VerificationCode>();

// Limpiar códigos expirados cada 5 minutos
setInterval(() => {
  const now = new Date();
  const entries = Array.from(verificationCodes.entries());
  for (const [email, data] of entries) {
    if (data.expiresAt < now) {
      verificationCodes.delete(email);
    }
  }
}, 5 * 60 * 1000);

export function generateVerificationCode(): string {
  // Generar código de 6 dígitos
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function storeVerificationCode(email: string, code: string): void {
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutos
  verificationCodes.set(email, {
    email,
    code,
    expiresAt,
    attempts: 0
  });
}

export function verifyCode(email: string, code: string): { success: boolean; message: string } {
  const stored = verificationCodes.get(email);

  if (!stored) {
    return { success: false, message: 'Código no encontrado o expirado' };
  }

  // Verificar si el código ha expirado
  if (stored.expiresAt < new Date()) {
    verificationCodes.delete(email);
    return { success: false, message: 'El código ha expirado' };
  }

  // Verificar intentos
  if (stored.attempts >= 3) {
    verificationCodes.delete(email);
    return { success: false, message: 'Demasiados intentos fallidos' };
  }

  // Verificar el código
  if (stored.code !== code) {
    stored.attempts++;
    return { success: false, message: 'Código incorrecto' };
  }

  // Código correcto
  verificationCodes.delete(email);
  return { success: true, message: 'Código verificado correctamente' };
}

export function hasValidCode(email: string): boolean {
  const stored = verificationCodes.get(email);
  if (!stored) return false;
  return stored.expiresAt > new Date();
}

export function deleteVerificationCode(email: string): void {
  verificationCodes.delete(email);
}
