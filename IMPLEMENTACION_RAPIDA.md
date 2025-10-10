# 🚀 Guía de Implementación Rápida - 5 Pasos

## ⏱️ Tiempo estimado: 15-30 minutos

---

## 📋 Paso 1: Crear tu Primera Microfinanciera (5 min)

### Opción A: Desde la Consola de Firebase

1. Ve a Firebase Console → Firestore Database
2. Crea una colección llamada `microfinancieras`
3. Agrega un documento con ID `mi-empresa-001`:

```json
{
  "name": "Mi Empresa",
  "legalName": "Mi Empresa S.A.C.",
  "ruc": "20123456789",
  "email": "contacto@miempresa.com",
  "phone": "+51 1 234 5678",
  "isActive": true,
  "createdAt": [timestamp actual],
  "settings": {
    "maxLoanAmount": 50000,
    "minLoanAmount": 1000,
    "maxTermMonths": 36,
    "minTermMonths": 6
  }
}
```

4. Dentro de ese documento, crea una subcolección `roles` con estos 4 documentos:

**Documento `admin`:**
```json
{
  "name": "Administrador",
  "description": "Acceso completo",
  "permissions": ["*"],
  "isActive": true,
  "createdAt": [timestamp]
}
```

**Documento `analyst`:**
```json
{
  "name": "Analista",
  "description": "Revisar solicitudes",
  "permissions": ["loans.read", "loans.update", "customers.read"],
  "isActive": true,
  "createdAt": [timestamp]
}
```

**Documento `agent`:**
```json
{
  "name": "Agente",
  "description": "Crear solicitudes",
  "permissions": ["loans.create", "loans.read", "customers.create"],
  "isActive": true,
  "createdAt": [timestamp]
}
```

**Documento `customer`:**
```json
{
  "name": "Cliente",
  "description": "Usuario cliente",
  "permissions": ["loans.create", "loans.read.own"],
  "isActive": true,
  "createdAt": [timestamp]
}
```

### Opción B: Usando el Script (Recomendado)

1. Abre la consola del navegador en tu app
2. Ejecuta:

```javascript
// Copiar y pegar en la consola del navegador
import { createMicrofinanciera } from './scripts/createMicrofinanciera';

await createMicrofinanciera({
  id: 'mi-empresa-001',
  name: 'Mi Empresa',
  legalName: 'Mi Empresa S.A.C.',
  ruc: '20123456789',
  email: 'contacto@miempresa.com',
});
```

✅ **Verificación:** Ve a Firestore y confirma que existe `microfinancieras/mi-empresa-001`

---

## 🔐 Paso 2: Actualizar Reglas de Firestore (2 min)

1. Ve a Firebase Console → Firestore Database → Rules
2. Reemplaza todo el contenido con:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Microfinancieras - lectura pública
    match /microfinancieras/{microfinancieraId} {
      allow read: if true;
      allow write: if false;
      
      // Usuarios
      match /users/{userId} {
        allow read, write: if request.auth != null && 
                             request.auth.uid == userId;
      }
      
      // Customers
      match /customers/{customerId} {
        allow read, write: if request.auth != null;
      }
      
      // Workers
      match /workers/{workerId} {
        allow read, write: if request.auth != null;
      }
      
      // Loans
      match /loans/{loanId} {
        allow read, write: if request.auth != null;
      }
      
      // Branches
      match /branches/{branchId} {
        allow read, write: if request.auth != null;
      }
      
      // Roles
      match /roles/{roleId} {
        allow read: if request.auth != null;
      }
    }
  }
}
```

3. Click en "Publicar"

✅ **Verificación:** Las reglas se publican sin errores

---

## 🎨 Paso 3: Agregar el Selector a tu UI (5 min)

### En tu página de Login

Abre tu archivo de login (ej: `client/src/pages/LoginPage.tsx`) y modifica:

```tsx
import { MicrofinancieraSelector } from '../components/MicrofinancieraSelector';
import { useAuth } from '../contexts/AuthContext';

function LoginPage() {
  const { microfinancieraId } = useAuth();
  
  return (
    <div className="login-container">
      {/* 1. AGREGAR ESTO AL INICIO */}
      <div className="mb-6">
        <MicrofinancieraSelector />
      </div>
      
      {/* 2. ENVOLVER TU FORMULARIO EXISTENTE */}
      {microfinancieraId ? (
        <form onSubmit={handleLogin}>
          {/* Tu formulario de login existente */}
        </form>
      ) : (
        <div className="text-center text-gray-600 p-4">
          👆 Selecciona una microfinanciera para continuar
        </div>
      )}
    </div>
  );
}
```

### En tu página de Registro

Similar al login:

```tsx
import { MicrofinancieraSelector } from '../components/MicrofinancieraSelector';
import { useAuth } from '../contexts/AuthContext';

function RegisterPage() {
  const { microfinancieraId } = useAuth();
  
  return (
    <div className="register-container">
      <div className="mb-6">
        <MicrofinancieraSelector />
      </div>
      
      {microfinancieraId && (
        <form onSubmit={handleRegister}>
          {/* Tu formulario de registro */}
        </form>
      )}
    </div>
  );
}
```

✅ **Verificación:** Recarga la app y verás el selector de microfinancieras

---

## 🧪 Paso 4: Probar el Flujo Completo (10 min)

### Test 1: Registro de Usuario

1. Abre tu app en el navegador
2. Ve a la página de registro
3. Selecciona la microfinanciera
4. Completa el formulario:
   - Email: `test@ejemplo.com`
   - Password: `Test123456`
   - Nombre: `Juan`
   - Apellido: `Pérez`
   - DNI: `12345678`
   - Teléfono: `999999999`
5. Click en "Registrar"

✅ **Verificación en Firestore:**
```
microfinancieras/mi-empresa-001/users/[userId]
microfinancieras/mi-empresa-001/customers/[userId]  (si rol es customer)
microfinancieras/mi-empresa-001/workers/[userId]    (si rol es analyst/agent)
```

### Test 2: Login con Email

1. Cierra sesión
2. Ve a login
3. Selecciona la microfinanciera
4. Ingresa:
   - Email: `test@ejemplo.com`
   - Password: `Test123456`
5. Click en "Iniciar Sesión"

✅ **Verificación:** Deberías estar autenticado y ver el dashboard

### Test 3: Login con Google

1. Cierra sesión
2. Ve a login
3. Selecciona la microfinanciera
4. Click en "Continuar con Google"
5. Selecciona tu cuenta de Google

✅ **Verificación:** Usuario creado en Firestore en la ruta correcta

---

## 🔍 Paso 5: Verificar en Firestore (3 min)

Abre Firebase Console → Firestore Database y verifica esta estructura:

```
✅ microfinancieras/
   └── mi-empresa-001/
       ├── users/
       │   └── [userId]/
       │       ├── userId: "abc123"
       │       ├── mfId: "mi-empresa-001"
       │       ├── email: "test@ejemplo.com"
       │       ├── roles: ["analyst"]
       │       └── status: "active"
       │
       ├── customers/  (si el usuario es customer)
       │   └── [userId]/
       │       ├── firstName: "Juan"
       │       ├── lastName: "Pérez"
       │       └── dni: "12345678"
       │
       ├── workers/  (si el usuario es analyst/agent)
       │   └── [userId]/
       │       ├── displayName: "Juan Pérez"
       │       └── roleIds: ["analyst"]
       │
       └── roles/
           ├── admin/
           ├── analyst/
           ├── agent/
           └── customer/
```

---

## ✅ Checklist Final

Marca cada item cuando lo completes:

- [ ] ✅ Microfinanciera creada en Firestore
- [ ] ✅ Roles creados (admin, analyst, agent, customer)
- [ ] ✅ Reglas de Firestore actualizadas
- [ ] ✅ Selector agregado en página de login
- [ ] ✅ Selector agregado en página de registro
- [ ] ✅ Test de registro exitoso
- [ ] ✅ Test de login con email exitoso
- [ ] ✅ Test de login con Google exitoso
- [ ] ✅ Datos verificados en Firestore
- [ ] ✅ Estructura multitenant confirmada

---

## 🎉 ¡Felicitaciones!

Tu portal ahora está usando la estructura multitenant y es compatible con la app móvil.

---

## 🆘 Troubleshooting

### Problema: "No se ha seleccionado una microfinanciera"

**Solución:**
1. Verifica que la microfinanciera existe en Firestore
2. Verifica que `isActive: true`
3. Limpia localStorage: `localStorage.clear()`
4. Recarga la página

### Problema: "Usuario no autorizado para esta microfinanciera"

**Solución:**
1. El usuario fue creado en otra microfinanciera
2. Verifica en Firestore en qué microfinanciera está el usuario
3. Selecciona esa microfinanciera en el selector

### Problema: "Permission denied" en Firestore

**Solución:**
1. Verifica que las reglas de Firestore están actualizadas
2. Verifica que el usuario está autenticado
3. Verifica que la ruta es correcta: `microfinancieras/{mfId}/users/{userId}`

### Problema: El selector no muestra microfinancieras

**Solución:**
1. Abre la consola del navegador (F12)
2. Busca errores en la consola
3. Verifica que la microfinanciera tiene `isActive: true`
4. Verifica las reglas de Firestore permiten lectura pública de microfinancieras

---

## 📚 Próximos Pasos

1. **Migrar datos existentes** (si los hay)
   - Ver `MIGRATION_MULTITENANT.md`

2. **Actualizar otros componentes**
   - Buscar referencias a colecciones antiguas
   - Actualizar queries de Firestore

3. **Agregar más microfinancieras**
   - Usar el script de creación
   - Probar el cambio entre microfinancieras

4. **Personalizar roles**
   - Agregar más roles según tu negocio
   - Configurar permisos específicos

---

## 📖 Documentación Completa

- `RESUMEN_CAMBIOS.md` - Resumen ejecutivo
- `CAMBIOS_MULTITENANT.md` - Guía de uso detallada
- `MIGRATION_MULTITENANT.md` - Guía técnica completa
- `client/src/examples/` - Ejemplos de código

---

**¿Listo?** ¡Comienza con el Paso 1! 🚀
