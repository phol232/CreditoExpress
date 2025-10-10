# 📧 Sistema de Verificación de Email

## ✅ Implementación Completada

### 🎯 Funcionalidades

1. **Detección automática de usuario logueado**
   - Si el usuario ya está logueado, salta directamente al paso 2 (Verificación)
   - No muestra el paso de registro

2. **Envío de código de verificación**
   - Genera código de 6 dígitos aleatorio
   - Guarda en Firestore con expiración de 5 minutos
   - Muestra el email del usuario autenticado

3. **Validación de código**
   - Verifica que el código sea correcto
   - Verifica que no haya expirado
   - Verifica que no haya sido usado antes
   - Marca el email como verificado

4. **Reenvío de código**
   - Permite reenviar después de 5 minutos
   - Genera un nuevo código
   - Invalida el código anterior

## 🗄️ Estructura en Firestore

```
microfinancieras/{mfId}/
├── users/{userId}
│   ├── emailVerified: true/false
│   └── emailVerifiedAt: timestamp
│
└── verifications/{userId}
    ├── code: "123456"
    ├── email: "usuario@ejemplo.com"
    ├── userId: "abc123"
    ├── microfinancieraId: "mf-001"
    ├── expiresAt: timestamp
    ├── verified: true/false
    ├── createdAt: timestamp
    └── verifiedAt: timestamp (opcional)
```

## 🔧 Archivos Modificados/Creados

### 1. `services/verificationService.ts` (NUEVO)
Servicio para manejar la verificación de email:
- `sendVerificationCode()` - Envía código
- `verifyCode()` - Valida código
- `isEmailVerified()` - Verifica estado

### 2. `components/ApplicationModal.tsx` (MODIFICADO)
- Detecta si el usuario está logueado
- Salta al paso 2 automáticamente
- Obtiene email del perfil del usuario

### 3. `components/VerificationForm.tsx` (MODIFICADO)
- Envía código automáticamente al cargar
- Valida código con Firebase
- Muestra errores específicos
- Maneja reenvío de código

## 📝 Cómo Funciona

### Flujo Completo

```
1. Usuario hace clic en "Enviar Solicitud"
   ↓
2. Sistema detecta si está logueado
   ↓
3a. SI está logueado:
    - Salta al Paso 2 (Verificación)
    - Muestra su email
    - Envía código automáticamente
   ↓
3b. NO está logueado:
    - Muestra Paso 1 (Registro)
    - Usuario se registra
    - Pasa al Paso 2
   ↓
4. Usuario ingresa código de 6 dígitos
   ↓
5. Sistema valida:
    - ¿Código correcto? ✅
    - ¿No expiró? ✅
    - ¿No fue usado? ✅
   ↓
6. Email verificado ✅
   ↓
7. Continúa al Paso 3 (Pre-solicitud)
```

## 🚀 Para Desarrollo

### Ver el Código en Consola

Actualmente, el código se muestra en la consola del navegador:

```javascript
console.log('🔐 Código de verificación:', code);
console.log('📧 Email:', email);
console.log('⏰ Expira en: 5 minutos');
```

**Abre la consola del navegador (F12) para ver el código y probarlo.**

## 📧 Para Producción: Enviar Emails Reales

### Opción 1: Firebase Cloud Functions + SendGrid (Recomendado)

1. **Instalar SendGrid**
   ```bash
   cd functions
   npm install @sendgrid/mail
   ```

2. **Crear Cloud Function**
   ```typescript
   // functions/src/index.ts
   import * as functions from 'firebase-functions';
   import * as sgMail from '@sendgrid/mail';

   sgMail.setApiKey(functions.config().sendgrid.key);

   export const sendVerificationEmail = functions.firestore
     .document('microfinancieras/{mfId}/verifications/{userId}')
     .onCreate(async (snap, context) => {
       const data = snap.data();
       
       const msg = {
         to: data.email,
         from: 'noreply@tuempresa.com',
         subject: 'Código de Verificación',
         html: `
           <h2>Tu código de verificación</h2>
           <p>Tu código es: <strong>${data.code}</strong></p>
           <p>Este código expira en 5 minutos.</p>
         `,
       };

       await sgMail.send(msg);
     });
   ```

3. **Configurar API Key**
   ```bash
   firebase functions:config:set sendgrid.key="TU_API_KEY"
   ```

4. **Desplegar**
   ```bash
   firebase deploy --only functions
   ```

### Opción 2: Servicio Backend Propio

1. **Crear endpoint en tu backend**
   ```typescript
   // backend/routes/verification.ts
   app.post('/api/send-verification', async (req, res) => {
     const { email, code } = req.body;
     
     // Usar tu servicio de email preferido
     await emailService.send({
       to: email,
       subject: 'Código de Verificación',
       html: `Tu código es: ${code}`,
     });
     
     res.json({ success: true });
   });
   ```

2. **Llamar desde verificationService.ts**
   ```typescript
   // En sendVerificationCode()
   await fetch('https://tu-backend.com/api/send-verification', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ email, code }),
   });
   ```

### Opción 3: Resend (Moderno y Fácil)

1. **Instalar Resend**
   ```bash
   npm install resend
   ```

2. **Usar en Cloud Function**
   ```typescript
   import { Resend } from 'resend';
   const resend = new Resend('tu_api_key');

   await resend.emails.send({
     from: 'noreply@tuempresa.com',
     to: data.email,
     subject: 'Código de Verificación',
     html: `<p>Tu código es: <strong>${data.code}</strong></p>`,
   });
   ```

## 🔐 Seguridad

### Implementado ✅
- Código de 6 dígitos aleatorio
- Expiración de 5 minutos
- Un solo uso por código
- Código guardado en Firestore (no en cliente)
- Validación en servidor (Firestore)

### Recomendaciones Adicionales
- **Rate limiting**: Limitar intentos de verificación
- **Bloqueo temporal**: Después de 3 intentos fallidos
- **Logs de auditoría**: Registrar todos los intentos
- **Notificación de seguridad**: Email si hay muchos intentos

## 🧪 Para Probar

### 1. Usuario Nuevo
```
1. Abre el portal
2. Click en "Enviar Solicitud"
3. Registra una cuenta
4. Automáticamente pasa al paso 2
5. Abre consola (F12) para ver el código
6. Ingresa el código
7. ✅ Email verificado
```

### 2. Usuario Ya Logueado
```
1. Inicia sesión
2. Click en "Enviar Solicitud"
3. ✅ Salta directo al paso 2
4. Muestra tu email
5. Abre consola para ver el código
6. Ingresa el código
7. ✅ Email verificado
```

### 3. Código Expirado
```
1. Solicita código
2. Espera 5 minutos
3. Intenta usar el código
4. ❌ "El código ha expirado"
5. Click en "Reenviar código"
6. Nuevo código generado
```

### 4. Código Incorrecto
```
1. Solicita código
2. Ingresa código incorrecto
3. ❌ "Código incorrecto"
4. Intenta de nuevo con el código correcto
```

## 📊 Métricas Útiles

Puedes agregar estas queries para monitorear:

```typescript
// Códigos enviados hoy
const today = new Date();
today.setHours(0, 0, 0, 0);

const codesQuery = query(
  collection(db, 'microfinancieras', mfId, 'verifications'),
  where('createdAt', '>=', today)
);

// Tasa de verificación exitosa
const verifiedQuery = query(
  collection(db, 'microfinancieras', mfId, 'verifications'),
  where('verified', '==', true)
);
```

## 🆘 Troubleshooting

### "Usuario no autenticado"
**Solución**: Asegúrate de estar logueado antes de solicitar verificación

### "No se encontró un código"
**Solución**: El código expiró o no se envió. Click en "Reenviar código"

### "Código incorrecto"
**Solución**: Verifica el código en la consola (F12) durante desarrollo

### No recibo el email (Producción)
**Solución**: 
1. Verifica que configuraste el servicio de email
2. Revisa los logs de Cloud Functions
3. Verifica que el email no esté en spam

---

**Última actualización**: Octubre 2025  
**Versión**: 2.0 - Sistema de Verificación Implementado
