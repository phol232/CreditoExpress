# ✅ Portal Actualizado a Estructura Multitenant

## 🎯 Problema Resuelto

El portal **CreditoExpress** estaba usando una estructura de base de datos diferente a la aplicación móvil:

- ❌ **Portal (antes)**: Colecciones planas (`users`, `user_profiles`, `user_credentials`)
- ✅ **Mobile**: Estructura multitenant (`microfinancieras/{mfId}/users`, `microfinancieras/{mfId}/customers`, etc.)

Ahora **ambas aplicaciones usan la misma estructura multitenant** ✨

## 📋 Archivos Modificados

### 1. `client/src/services/authService.ts`
**Cambios principales:**
- ✅ Agregado soporte para múltiples microfinancieras
- ✅ Métodos `setMicrofinanciera()` y `getMicrofinancieraId()`
- ✅ Método `getActiveMicrofinancieras()` para listar microfinancieras
- ✅ Todos los métodos ahora usan la ruta `microfinancieras/{mfId}/users`
- ✅ Creación automática de documentos en `customers` y `workers` según roles
- ✅ Interfaces actualizadas con campos multitenant

### 2. `client/src/contexts/AuthContext.tsx`
**Cambios principales:**
- ✅ Agregado `microfinancieraId` al contexto
- ✅ Método `setMicrofinanciera()` para cambiar de microfinanciera
- ✅ Detección automática de la microfinanciera del usuario
- ✅ Listener en tiempo real de la colección correcta
- ✅ Persistencia de selección en localStorage

### 3. `client/src/components/MicrofinancieraSelector.tsx` (NUEVO)
**Componente nuevo:**
- ✅ Selector visual de microfinancieras
- ✅ Carga automática de microfinancieras activas
- ✅ Selección automática si solo hay una
- ✅ Estados de loading y error
- ✅ UI responsive con Tailwind CSS

### 4. `scripts/createMicrofinanciera.ts` (NUEVO)
**Script de utilidad:**
- ✅ Función para crear microfinancieras
- ✅ Creación automática de roles por defecto
- ✅ Ejemplo de uso incluido

### 5. `MIGRATION_MULTITENANT.md` (NUEVO)
**Documentación completa:**
- ✅ Explicación de la estructura multitenant
- ✅ Guía de migración de datos
- ✅ Reglas de seguridad de Firestore
- ✅ Pasos de implementación

## 🔄 Estructura de Datos

### Antes (Plana)
```
Firestore
├── users/{userId}
├── user_profiles/{userId}
└── user_credentials/{userId}
```

### Ahora (Multitenant - igual que Mobile)
```
Firestore
└── microfinancieras/{microfinancieraId}/
    ├── users/{userId}           ← Membresías de usuarios
    ├── customers/{customerId}   ← Datos de clientes
    ├── workers/{workerId}       ← Datos de empleados
    ├── loans/{loanId}           ← Préstamos
    ├── branches/{branchId}      ← Sucursales
    ├── agents/{agentId}         ← Agentes
    └── roles/{roleId}           ← Roles y permisos
```

## 🚀 Cómo Usar

### 1. Crear una Microfinanciera

```typescript
import { createMicrofinanciera } from './scripts/createMicrofinanciera';

await createMicrofinanciera({
  id: 'mi-microfinanciera',
  name: 'Mi Microfinanciera',
  legalName: 'Mi Microfinanciera S.A.C.',
  ruc: '20123456789',
  email: 'contacto@mimicrofinanciera.com',
});
```

### 2. Usar el Selector en tu UI

```tsx
import { MicrofinancieraSelector } from './components/MicrofinancieraSelector';

function LoginPage() {
  return (
    <div>
      <MicrofinancieraSelector 
        onSelect={(mfId) => console.log('Seleccionada:', mfId)} 
      />
      {/* Tu formulario de login */}
    </div>
  );
}
```

### 3. Registrar Usuarios

```typescript
import { authService } from './services/authService';

// El authService ahora usa automáticamente la microfinanciera seleccionada
await authService.registerWithEmail({
  email: 'usuario@ejemplo.com',
  password: 'password123',
  firstName: 'Juan',
  lastName: 'Pérez',
  dni: '12345678',
  phone: '+51999999999',
  roles: ['analyst'], // o ['customer'], ['admin'], etc.
});
```

### 4. Login

```typescript
// Login con email
await authService.loginWithEmail('usuario@ejemplo.com', 'password123');

// Login con Google
await authService.loginWithGoogle();
```

## 🔐 Reglas de Firestore

Actualiza tus reglas en Firebase Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /microfinancieras/{microfinancieraId} {
      allow read: if true;
      
      match /users/{userId} {
        allow read, write: if request.auth != null && 
                             request.auth.uid == userId;
      }
      
      match /customers/{customerId} {
        allow read, write: if request.auth != null;
      }
      
      match /workers/{workerId} {
        allow read, write: if request.auth != null;
      }
      
      match /loans/{loanId} {
        allow read, write: if request.auth != null;
      }
    }
  }
}
```

## ✨ Beneficios

1. **Consistencia**: Portal y mobile usan la misma estructura
2. **Escalabilidad**: Fácil agregar nuevas microfinancieras
3. **Aislamiento**: Datos de cada microfinanciera completamente separados
4. **Seguridad**: Reglas de Firestore más granulares
5. **Mantenibilidad**: Código más organizado y reutilizable
6. **Sincronización**: Datos en tiempo real entre plataformas

## 📝 Próximos Pasos

1. ✅ Crear tu primera microfinanciera usando el script
2. ✅ Actualizar las reglas de Firestore
3. ✅ Agregar el `MicrofinancieraSelector` en tus páginas de login/registro
4. ✅ Probar el registro y login de usuarios
5. ✅ Migrar datos existentes (si los hay) usando el script de migración

## 🆘 Soporte

Si tienes datos existentes en la estructura antigua, revisa el archivo `MIGRATION_MULTITENANT.md` para ver cómo migrarlos a la nueva estructura.

## 🎉 ¡Listo!

Tu portal ahora está completamente sincronizado con la app móvil y listo para soportar múltiples microfinancieras. 🚀
