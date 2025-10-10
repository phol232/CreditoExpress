# 🔒 Guía de Seguridad

## ⚠️ IMPORTANTE: .env eliminado de Git

El archivo `.env` ha sido eliminado del repositorio por seguridad. Contenía información sensible como:
- API Keys de Firebase
- API Key de Brevo
- Otras credenciales

## 🔐 Qué hacer ahora:

### 1. Cambiar TODAS las credenciales expuestas

#### Firebase:
1. Ve a [Firebase Console](https://console.firebase.google.com)
2. Selecciona tu proyecto
3. Settings → General → Your apps
4. **Regenera las API Keys**
5. Actualiza las reglas de seguridad de Firestore

#### Brevo:
1. Ve a [Brevo Dashboard](https://app.brevo.com)
2. Settings → SMTP & API → API Keys
3. **Revoca la API Key antigua**
4. **Crea una nueva API Key**

### 2. Crear tu archivo .env local

```bash
# Copia el ejemplo
cp .env.example .env

# Edita con tus nuevas credenciales
nano .env
```

### 3. Configurar variables en DigitalOcean

Cuando despliegues, agrega las variables de entorno en:
- DigitalOcean Dashboard → Tu App → Settings → Environment Variables

**NUNCA** vuelvas a subir el `.env` a Git.

## ✅ Verificación

Antes de hacer commit, verifica:

```bash
# Verificar que .env NO esté en staging
git status

# Verificar que .env esté en .gitignore
cat .gitignore | grep .env
```

## 📚 Buenas Prácticas

1. ✅ Usa `.env.example` para documentar variables necesarias
2. ✅ Mantén `.env` en `.gitignore`
3. ✅ Usa diferentes credenciales para desarrollo y producción
4. ✅ Rota las API Keys regularmente
5. ✅ Nunca compartas credenciales por email/chat
6. ✅ Usa servicios de gestión de secretos en producción

## 🆘 Si expusiste credenciales

1. **Inmediatamente** revoca/cambia todas las credenciales
2. Revisa los logs de acceso en Firebase/Brevo
3. Considera usar [git-filter-repo](https://github.com/newren/git-filter-repo) para limpiar el historial
4. Notifica a tu equipo

## 📞 Contacto

Si detectas algún problema de seguridad, repórtalo inmediatamente.
