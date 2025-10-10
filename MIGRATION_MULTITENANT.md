# Migración a Estructura Multitenant

## Resumen de Cambios

El portal CreditoExpress ha sido actualizado para usar la misma estructura de base de datos multitenant que la aplicación móvil. Esto permite que múltiples microfinancieras compartan la misma infraestructura de Firebase mientras mantienen sus datos completamente aislados.

## Estructura Anterior (Plana)

```
Firestore
├── users/{userId}
├── user_profiles/{userId}
└── user_credentials/{userId}
```

## Nueva Estructura (Multitenant)

```
Firestore
└── microfinancieras/{microfinancieraId}/
    ├── users/{userId}
    ├── customers/{customerId}
    ├── workers/{workerId}
    ├── loans/{loanId}
    ├── branches/{branchId}
    └── agents/{agentId}
```

## Cambios en el Código

### 1. AuthService (`authService.ts`)

**Nuevos métodos:**
- `setMicrofinanciera(microfinancieraId)`: Establece la microfinanciera actual
- `getMicrofinancieraId()`: Obtiene la microfinanciera actual
- `getActiveMicrofinancieras()`: Lista todas las microfinancieras activas

**Métodos actualizados:**
- `registerWithEmail()`: Ahora requiere `microfinancieraId` y crea usuarios en la estructura multitenant
- `loginWithEmail()`: Verifica que el usuario pertenezca a la microfinanciera seleccionada
- `loginWithGoogle()`: Crea/actualiza usuarios en la estructura multitenant
- `checkEmailExists()`: Verifica emails dentro de una microfinanciera específica
- `checkDniExists()`: Verifica DNIs dentro de una microfinanciera específica
- `updateUserProfile()`: Actualiza perfiles en la estructura multitenant

**Nuevas interfaces:**
```typescript
interface Microfinanciera {
  id: string;
  name: string;
  legalName: string;
  ruc?: string;
  isActive: boolean;
  // ... más campos
}

interface AuthUser {
  userId: string;
  mfId: string;
  email: string;
  roles: string[];
  status: 'active' | 'inactive' | 'pending';
  // ... más campos
}
```

### 2. AuthContext (`AuthContext.tsx`)

**Nuevas propiedades:**
- `microfinancieraId`: ID de la microfinanciera actual
- `setMicrofinanciera(mfId)`: Función para cambiar de microfinanciera

**Comportamiento actualizado:**
- Detecta automáticamente la microfinanciera del usuario al iniciar sesión
- Guarda la selección en localStorage
- Escucha cambios en tiempo real de la colección correcta

### 3. Nuevo Componente: MicrofinancieraSelector

Componente React para seleccionar la microfinanciera antes del login/registro:

```tsx
import { MicrofinancieraSelector } from '../components/MicrofinancieraSelector';

function LoginPage() {
  return (
    <div>
      <MicrofinancieraSelector onSelect={(mfId) => {
        console.log('Selected:', mfId);
      }} />
      {/* ... resto del formulario de login */}
    </div>
  );
}
```

## Migración de Datos Existentes

Si ya tienes datos en la estructura antigua, necesitarás migrarlos:

### Script de Migración (ejemplo)

```typescript
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { db } from './lib/firebase';

async function migrateToMultitenant(defaultMicrofinancieraId: string) {
  // 1. Migrar users
  const usersSnapshot = await getDocs(collection(db, 'users'));
  
  for (const userDoc of usersSnapshot.docs) {
    const userData = userDoc.data();
    const newUserData = {
      userId: userDoc.id,
      mfId: defaultMicrofinancieraId,
      email: userData.email,
      displayName: userData.displayName,
      linkedProviders: ['password'],
      roles: ['analyst'], // Ajustar según corresponda
      primaryRoleId: 'analyst',
      status: 'active',
      createdAt: userData.createdAt,
      lastLoginAt: userData.lastLoginAt,
    };
    
    const newRef = doc(
      db,
      'microfinancieras',
      defaultMicrofinancieraId,
      'users',
      userDoc.id
    );
    
    await setDoc(newRef, newUserData);
  }
  
  // 2. Migrar user_profiles a customers (si aplica)
  const profilesSnapshot = await getDocs(collection(db, 'user_profiles'));
  
  for (const profileDoc of profilesSnapshot.docs) {
    const profileData = profileDoc.data();
    const customerData = {
      mfId: defaultMicrofinancieraId,
      userId: profileDoc.id,
      personType: 'natural',
      docType: 'dni',
      docNumber: profileData.dni,
      firstName: profileData.firstName,
      lastName: profileData.lastName,
      fullName: profileData.fullName,
      email: profileData.email,
      phone: profileData.phone,
      isActive: true,
      createdAt: profileData.createdAt,
    };
    
    const newRef = doc(
      db,
      'microfinancieras',
      defaultMicrofinancieraId,
      'customers',
      profileDoc.id
    );
    
    await setDoc(newRef, customerData);
  }
  
  console.log('Migration completed!');
}
```

## Reglas de Seguridad de Firestore

Actualiza tus reglas de Firestore para la estructura multitenant:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Microfinancieras - lectura pública, escritura solo admin
    match /microfinancieras/{microfinancieraId} {
      allow read: if true;
      allow write: if false; // Solo Cloud Functions
      
      // Usuarios de la microfinanciera
      match /users/{userId} {
        allow read: if request.auth != null && 
                      request.auth.uid == userId;
        allow write: if request.auth != null && 
                       request.auth.uid == userId;
      }
      
      // Customers
      match /customers/{customerId} {
        allow read: if request.auth != null;
        allow write: if request.auth != null;
      }
      
      // Workers
      match /workers/{workerId} {
        allow read: if request.auth != null;
        allow write: if request.auth != null;
      }
      
      // Loans
      match /loans/{loanId} {
        allow read: if request.auth != null;
        allow write: if request.auth != null;
      }
    }
  }
}
```

## Pasos para Implementar

1. **Actualizar el código** (ya hecho ✅)
   - authService.ts
   - AuthContext.tsx
   - MicrofinancieraSelector.tsx

2. **Crear microfinanciera(s) en Firestore**
   ```typescript
   await setDoc(doc(db, 'microfinancieras', 'mf-001'), {
     name: 'Mi Microfinanciera',
     legalName: 'Microfinanciera S.A.C.',
     ruc: '20123456789',
     isActive: true,
     createdAt: serverTimestamp(),
   });
   ```

3. **Migrar datos existentes** (si aplica)
   - Ejecutar script de migración
   - Verificar que todos los datos se migraron correctamente

4. **Actualizar reglas de Firestore**
   - Aplicar las nuevas reglas de seguridad

5. **Actualizar componentes de UI**
   - Agregar MicrofinancieraSelector en páginas de login/registro
   - Actualizar formularios para incluir microfinancieraId

6. **Probar**
   - Registro de nuevos usuarios
   - Login con usuarios existentes
   - Cambio entre microfinancieras
   - Verificar aislamiento de datos

## Beneficios

✅ **Aislamiento de datos**: Cada microfinanciera tiene sus propios datos  
✅ **Escalabilidad**: Fácil agregar nuevas microfinancieras  
✅ **Consistencia**: Misma estructura que la app móvil  
✅ **Seguridad**: Reglas de Firestore más granulares  
✅ **Mantenibilidad**: Código más organizado y reutilizable  

## Compatibilidad con Mobile

Ahora el portal y la app móvil comparten:
- ✅ Misma estructura de base de datos
- ✅ Mismos modelos de datos
- ✅ Mismas reglas de seguridad
- ✅ Misma lógica de autenticación multitenant

Esto facilita:
- Compartir código entre plataformas
- Sincronización de datos en tiempo real
- Desarrollo de nuevas funcionalidades
- Mantenimiento y debugging
