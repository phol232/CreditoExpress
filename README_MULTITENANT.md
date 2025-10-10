# 🎯 Portal CreditoExpress - Estructura Multitenant

## 📢 Cambio Importante

El portal ha sido actualizado para usar la **misma estructura de base de datos multitenant** que la aplicación móvil.

### ¿Qué significa esto?

✅ **Antes:** Cada aplicación (portal y mobile) usaba su propia estructura de datos  
✅ **Ahora:** Ambas aplicaciones comparten la misma estructura multitenant en Firestore

---

## 🚀 Inicio Rápido

### Para Implementar (15-30 min)

👉 **Lee:** `IMPLEMENTACION_RAPIDA.md` - Guía paso a paso

### Para Entender los Cambios

👉 **Lee:** `RESUMEN_CAMBIOS.md` - Resumen ejecutivo de todos los cambios

### Para Migrar Datos Existentes

👉 **Lee:** `MIGRATION_MULTITENANT.md` - Guía técnica de migración

### Para Ver Ejemplos de Código

👉 **Revisa:** `client/src/examples/LoginWithMicrofinanciera.example.tsx`

---

## 📁 Estructura del Proyecto

```
apps/portal/CreditoExpress/
│
├── 📖 README_MULTITENANT.md          ← Estás aquí
├── 📖 IMPLEMENTACION_RAPIDA.md       ← Guía de 5 pasos
├── 📖 RESUMEN_CAMBIOS.md             ← Resumen ejecutivo
├── 📖 CAMBIOS_MULTITENANT.md         ← Guía de uso
├── 📖 MIGRATION_MULTITENANT.md       ← Guía técnica
│
├── client/src/
│   ├── services/
│   │   └── authService.ts            ← ✅ Actualizado
│   │
│   ├── contexts/
│   │   └── AuthContext.tsx           ← ✅ Actualizado
│   │
│   ├── components/
│   │   └── MicrofinancieraSelector.tsx  ← ✨ Nuevo
│   │
│   └── examples/
│       └── LoginWithMicrofinanciera.example.tsx  ← ✨ Nuevo
│
└── scripts/
    └── createMicrofinanciera.ts      ← ✨ Nuevo
```

---

## 🗄️ Nueva Estructura de Datos

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

---

## ✨ Nuevas Funcionalidades

### 1. Selector de Microfinanciera

```tsx
import { MicrofinancieraSelector } from './components/MicrofinancieraSelector';

<MicrofinancieraSelector onSelect={(mfId) => console.log(mfId)} />
```

### 2. Soporte Multitenant en AuthService

```typescript
// Obtener microfinancieras activas
const microfinancieras = await authService.getActiveMicrofinancieras();

// Establecer microfinanciera actual
authService.setMicrofinanciera('mi-empresa-001');

// Registrar usuario en microfinanciera específica
await authService.registerWithEmail({
  email: 'user@example.com',
  password: 'password',
  firstName: 'Juan',
  lastName: 'Pérez',
  dni: '12345678',
  phone: '+51999999999',
  microfinancieraId: 'mi-empresa-001',
  roles: ['analyst'],
});
```

### 3. Context con Microfinanciera

```tsx
import { useAuth } from './contexts/AuthContext';

function MyComponent() {
  const { microfinancieraId, setMicrofinanciera } = useAuth();
  
  return (
    <div>
      <p>Microfinanciera actual: {microfinancieraId}</p>
      <button onClick={() => setMicrofinanciera('otra-mf')}>
        Cambiar
      </button>
    </div>
  );
}
```

---

## 🎯 Beneficios

### Para Desarrollo
- ✅ Código consistente entre portal y mobile
- ✅ Fácil compartir lógica entre plataformas
- ✅ Menos bugs por inconsistencias
- ✅ Más fácil de mantener

### Para el Negocio
- ✅ Soporta múltiples microfinancieras
- ✅ Datos completamente aislados
- ✅ Fácil agregar nuevas microfinancieras
- ✅ Escalable

### Para Seguridad
- ✅ Reglas de Firestore más granulares
- ✅ Aislamiento de datos por microfinanciera
- ✅ Control de acceso basado en roles

---

## 📚 Documentación

| Archivo | Descripción | Para Quién |
|---------|-------------|------------|
| `IMPLEMENTACION_RAPIDA.md` | Guía de 5 pasos (15-30 min) | Desarrolladores que implementan |
| `RESUMEN_CAMBIOS.md` | Resumen ejecutivo completo | Todos |
| `CAMBIOS_MULTITENANT.md` | Guía de uso detallada | Desarrolladores |
| `MIGRATION_MULTITENANT.md` | Guía técnica de migración | Desarrolladores avanzados |
| `client/src/examples/` | Ejemplos de código | Desarrolladores |

---

## 🆘 ¿Necesitas Ayuda?

### Problemas Comunes

**"No se ha seleccionado una microfinanciera"**
- Verifica que existe en Firestore con `isActive: true`
- Limpia localStorage y recarga

**"Usuario no autorizado"**
- El usuario está en otra microfinanciera
- Verifica en Firestore dónde está el usuario

**"Permission denied"**
- Actualiza las reglas de Firestore
- Verifica que el usuario está autenticado

### Más Ayuda

1. Revisa la sección de Troubleshooting en `IMPLEMENTACION_RAPIDA.md`
2. Revisa los ejemplos en `client/src/examples/`
3. Revisa la documentación técnica en `MIGRATION_MULTITENANT.md`

---

## ✅ Checklist de Implementación

- [ ] Leer `IMPLEMENTACION_RAPIDA.md`
- [ ] Crear microfinanciera en Firestore
- [ ] Actualizar reglas de Firestore
- [ ] Agregar selector en UI
- [ ] Probar registro
- [ ] Probar login
- [ ] Verificar datos en Firestore
- [ ] Migrar datos existentes (si aplica)

---

## 🚀 Empezar Ahora

1. **Lee:** `IMPLEMENTACION_RAPIDA.md`
2. **Sigue:** Los 5 pasos
3. **Prueba:** El flujo completo
4. **Verifica:** En Firestore

**Tiempo estimado:** 15-30 minutos

---

## 📞 Contacto

Para preguntas sobre la implementación, revisa primero la documentación en este directorio.

---

**Última actualización:** Octubre 2025  
**Versión:** 2.0 - Multitenant
