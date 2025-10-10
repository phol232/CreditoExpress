# 🚀 Guía de Despliegue en Vercel

## Requisitos Previos
- Cuenta en [Vercel](https://vercel.com)
- Cuenta en [Firebase](https://firebase.google.com)
- API Key de [Brevo](https://www.brevo.com) para envío de emails

## Paso 1: Instalar Vercel CLI

```bash
npm install -g vercel
```

## Paso 2: Login en Vercel

```bash
vercel login
```

## Paso 3: Configurar Variables de Entorno

En el dashboard de Vercel, agrega estas variables de entorno:

### Firebase (desde tu archivo .env)
```
VITE_FIREBASE_API_KEY=tu_api_key
VITE_FIREBASE_AUTH_DOMAIN=tu_auth_domain
VITE_FIREBASE_PROJECT_ID=tu_project_id
VITE_FIREBASE_STORAGE_BUCKET=tu_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
VITE_FIREBASE_APP_ID=tu_app_id
```

### Brevo (para envío de emails)
```
BREVO_API_KEY=tu_brevo_api_key
```

### Otras configuraciones
```
NODE_ENV=production
```

## Paso 4: Desplegar

Desde la carpeta `apps/portal/CreditoExpress`:

```bash
vercel
```

Para producción:
```bash
vercel --prod
```

## Paso 5: Configurar Dominio (Opcional)

1. Ve a tu proyecto en Vercel Dashboard
2. Settings → Domains
3. Agrega tu dominio personalizado

## 🔧 Comandos Útiles

```bash
# Ver logs en tiempo real
vercel logs

# Ver deployments
vercel ls

# Eliminar deployment
vercel rm [deployment-url]

# Ver variables de entorno
vercel env ls
```

## 📝 Notas Importantes

1. **Firebase**: Asegúrate de que tu proyecto Firebase tenga configurado:
   - Authentication (Email/Password, Google)
   - Firestore Database
   - Reglas de seguridad apropiadas

2. **Brevo**: Configura tu cuenta y obtén tu API Key desde:
   - Dashboard → SMTP & API → API Keys

3. **CORS**: Si tienes problemas de CORS, verifica que tu dominio de Vercel esté en la whitelist de Firebase

4. **Variables de Entorno**: NUNCA subas el archivo `.env` a Git. Usa el dashboard de Vercel para configurarlas.

## 🐛 Troubleshooting

### Error: "Module not found"
```bash
cd client && npm install
cd ../server && npm install
```

### Error: "Firebase not initialized"
Verifica que todas las variables `VITE_FIREBASE_*` estén configuradas en Vercel.

### Error: "Cannot send email"
Verifica que `BREVO_API_KEY` esté configurada correctamente.

## 📚 Recursos

- [Vercel Docs](https://vercel.com/docs)
- [Firebase Docs](https://firebase.google.com/docs)
- [Brevo API Docs](https://developers.brevo.com/)
