# 🔧 Solución: Email ya Registrado

## 📋 Problema

Cuando intentas registrar un usuario y ves el error:
```
Firebase: Error (auth/email-already-in-use)
```

## 🤔 ¿Por qué pasa esto?

Firebase Authentication es **global** - un email solo puede existir **una vez** en todo Firebase Auth, sin importar la microfinanciera.

Sin embargo, con la estructura multitenant, un usuario **puede estar en múltiples microfinancieras**.

## ✅ Solución Implementada

El sistema ahora maneja automáticamente este caso:

### Escenario 1: Email Nuevo
- ✅ Se crea el usuario en Firebase Auth
- ✅ Se crea el perfil en la microfinanciera seleccionada
- ✅ Todo funciona normal

### Escenario 2: Email Existe con la Misma Contraseña
- ✅ El sistema detecta que el email ya existe
- ✅ Inicia sesión automáticamente con esa contraseña
- ✅ Verifica si el usuario ya está en esta microfinanciera
- ✅ Si NO está, lo agrega a esta microfinanciera
- ✅ Si YA está, muestra error: "Ya estás registrado en esta microfinanciera"

### Escenario 3: Email Existe con Diferente Contraseña
- ❌ Muestra error: "Este email ya está registrado con otra contraseña"
- 💡 Sugiere: "Por favor inicia sesión o recupera tu contraseña"

## 🎯 Casos de Uso

### Caso 1: Usuario Nuevo
```
Email: nuevo@ejemplo.com
Contraseña: password123
Microfinanciera: MF-001

✅ Resultado: Usuario creado exitosamente
```

### Caso 2: Usuario Existente en Otra Microfinanciera
```
Email: existente@ejemplo.com (ya registrado en MF-001)
Contraseña: password123 (la misma)
Microfinanciera: MF-002 (diferente)

✅ Resultado: Usuario agregado a MF-002 también
```

### Caso 3: Usuario Ya Registrado en Esta Microfinanciera
```
Email: existente@ejemplo.com (ya registrado en MF-001)
Contraseña: password123
Microfinanciera: MF-001 (la misma)

❌ Resultado: "Este email ya está registrado en esta microfinanciera. Por favor inicia sesión."
```

### Caso 4: Email Existe pero Contraseña Diferente
```
Email: existente@ejemplo.com (ya registrado)
Contraseña: otrapassword (diferente)
Microfinanciera: MF-002

❌ Resultado: "Este email ya está registrado con otra contraseña. Por favor inicia sesión o recupera tu contraseña."
```

## 🔍 Verificación en Firestore

Para verificar si un usuario está en múltiples microfinancieras:

```
Firestore
├── microfinancieras/
│   ├── mf-001/
│   │   └── users/
│   │       └── user123/  ← Usuario en MF-001
│   │           ├── email: "usuario@ejemplo.com"
│   │           └── roles: ["customer"]
│   │
│   └── mf-002/
│       └── users/
│           └── user123/  ← Mismo usuario en MF-002
│               ├── email: "usuario@ejemplo.com"
│               └── roles: ["customer"]
```

## 💡 Recomendaciones

### Para Usuarios
1. **Si ves "email ya registrado"**: Usa el botón "Iniciar Sesión" en lugar de registrarte
2. **Si olvidaste tu contraseña**: Usa "¿Olvidaste tu contraseña?" en el login
3. **Si quieres estar en otra microfinanciera**: Inicia sesión con tu email y contraseña existentes

### Para Desarrolladores
1. **No elimines usuarios de Firebase Auth** - pueden estar en múltiples microfinancieras
2. **Para "eliminar" un usuario**: Cambia su `status` a `inactive` en la microfinanciera específica
3. **Para verificar membresías**: Consulta `microfinancieras/{mfId}/users/{userId}`

## 🛠️ Código Relevante

### authService.ts
```typescript
// Maneja automáticamente el caso de email existente
async registerWithEmail(data) {
  try {
    // Intenta crear usuario nuevo
    const userCredential = await createUserWithEmailAndPassword(...);
  } catch (authError) {
    if (authError.code === 'auth/email-already-in-use') {
      // Intenta iniciar sesión con la contraseña proporcionada
      const userCredential = await signInWithEmailAndPassword(...);
      
      // Verifica si ya está en esta microfinanciera
      // Si no está, lo agrega
      // Si está, muestra error
    }
  }
}
```

### RegisterModal.tsx
```typescript
// Muestra mensajes de error claros al usuario
if (error.code === 'auth/email-already-in-use') {
  form.setError('email', { 
    message: 'Este email ya está registrado. Usa "Iniciar Sesión" si ya tienes cuenta.' 
  });
}
```

## 🔐 Seguridad

- ✅ La contraseña se verifica antes de agregar a otra microfinanciera
- ✅ No se puede agregar un usuario a una microfinanciera sin la contraseña correcta
- ✅ Cada microfinanciera mantiene sus propios datos de usuario
- ✅ Los datos están aislados por microfinanciera

## 📝 Notas Adicionales

### ¿Por qué no usar emails únicos por microfinanciera?
- Firebase Auth no lo permite
- Un email = una cuenta en Firebase Auth
- Pero un usuario puede tener múltiples "membresías" (una por microfinanciera)

### ¿Cómo funciona el login?
1. Usuario ingresa email y contraseña
2. Firebase Auth valida las credenciales
3. Sistema verifica en qué microfinanciera está el usuario
4. Si está en la microfinanciera seleccionada, permite el acceso
5. Si no está, muestra error

### ¿Qué pasa si cambio de microfinanciera?
- Puedes estar en múltiples microfinancieras con el mismo email
- Cada microfinanciera ve solo sus propios datos
- Tus roles pueden ser diferentes en cada microfinanciera

## 🆘 Troubleshooting

### "Este email ya está registrado"
**Solución**: Usa "Iniciar Sesión" en lugar de "Registrarse"

### "Email ya registrado con otra contraseña"
**Solución**: 
1. Usa "¿Olvidaste tu contraseña?" para recuperarla
2. O inicia sesión con la contraseña correcta

### "Ya estás registrado en esta microfinanciera"
**Solución**: Usa "Iniciar Sesión" - ya tienes una cuenta aquí

### Quiero eliminar mi cuenta
**Contacta al administrador** - ellos pueden desactivar tu cuenta en la microfinanciera específica

---

**Última actualización**: Octubre 2025  
**Versión**: 2.0 - Multitenant con soporte multi-microfinanciera
