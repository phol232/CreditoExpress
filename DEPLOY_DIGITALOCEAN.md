# 🚀 Despliegue en DigitalOcean App Platform

## Opción 1: Desde la Interfaz Web (MÁS FÁCIL) ⭐

### Paso 1: Preparar el Repositorio
1. Sube tu código a GitHub
2. Asegúrate de que el `.env` NO esté en el repositorio (ya está en `.gitignore`)

### Paso 2: Crear App en DigitalOcean
1. Ve a [DigitalOcean App Platform](https://cloud.digitalocean.com/apps)
2. Click en **"Create App"**
3. Selecciona **"GitHub"** como fuente
4. Autoriza DigitalOcean a acceder a tu repositorio
5. Selecciona tu repositorio y la rama `main`

### Paso 3: Configurar el Backend (Node.js)
1. DigitalOcean detectará automáticamente Node.js
2. Configura:
   - **Name**: `creditoexpress-backend`
   - **Source Directory**: `apps/portal/CreditoExpress/server`
   - **Build Command**: `npm install`
   - **Run Command**: `node index.js`
   - **HTTP Port**: `3000`
   - **HTTP Routes**: `/api`

### Paso 4: Configurar el Frontend (Static Site)
1. Click en **"Add Component"** → **"Static Site"**
2. Configura:
   - **Name**: `creditoexpress-frontend`
   - **Source Directory**: `apps/portal/CreditoExpress/client`
   - **Build Command**: `npm install && npm run build`
   - **Output Directory**: `dist`
   - **HTTP Routes**: `/`

### Paso 5: Agregar Variables de Entorno

#### Para el Backend:
```
NODE_ENV=production
BREVO_API_KEY=tu_brevo_api_key
PORT=3000
```

#### Para el Frontend (Build Time):
```
VITE_FIREBASE_API_KEY=tu_api_key
VITE_FIREBASE_AUTH_DOMAIN=tu_auth_domain
VITE_FIREBASE_PROJECT_ID=tu_project_id
VITE_FIREBASE_STORAGE_BUCKET=tu_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
VITE_FIREBASE_APP_ID=tu_app_id
```

### Paso 6: Desplegar
1. Click en **"Create Resources"**
2. Espera 5-10 minutos mientras se despliega
3. ¡Listo! Tu app estará en: `https://tu-app.ondigitalocean.app`

---

## Opción 2: Usando doctl CLI

### Instalar doctl
```bash
# macOS
brew install doctl

# Linux
cd ~
wget https://github.com/digitalocean/doctl/releases/download/v1.98.1/doctl-1.98.1-linux-amd64.tar.gz
tar xf ~/doctl-1.98.1-linux-amd64.tar.gz
sudo mv ~/doctl /usr/local/bin
```

### Autenticar
```bash
doctl auth init
```

### Desplegar
```bash
cd apps/portal/CreditoExpress
doctl apps create --spec .do/app.yaml
```

---

## 📝 Configuración Post-Despliegue

### 1. Configurar Dominio Personalizado (Opcional)
1. Ve a tu app en DigitalOcean
2. Settings → Domains
3. Agrega tu dominio

### 2. Configurar CORS en Firebase
Agrega tu dominio de DigitalOcean a la whitelist:
```
https://tu-app.ondigitalocean.app
```

### 3. Actualizar URLs del Frontend
Si el backend tiene una URL diferente, actualiza las llamadas API en el frontend.

---

## 💰 Costos Estimados

- **Starter Plan**: $5/mes
  - 1 vCPU
  - 512 MB RAM
  - Perfecto para desarrollo/pruebas

- **Basic Plan**: $12/mes
  - 1 vCPU
  - 1 GB RAM
  - Recomendado para producción

---

## 🔧 Comandos Útiles

```bash
# Ver apps
doctl apps list

# Ver logs
doctl apps logs <app-id> --type=run

# Actualizar app
doctl apps update <app-id> --spec .do/app.yaml

# Ver deployments
doctl apps list-deployments <app-id>
```

---

## 🐛 Troubleshooting

### Error: "Build failed"
- Verifica que `package.json` tenga los scripts correctos
- Revisa los logs en el dashboard

### Error: "Cannot connect to backend"
- Verifica que las rutas estén configuradas correctamente
- Backend debe estar en `/api`
- Frontend debe estar en `/`

### Error: "Firebase not initialized"
- Verifica que todas las variables `VITE_FIREBASE_*` estén en Build Time
- Reconstruye la app después de agregar variables

---

## 📚 Recursos

- [DigitalOcean App Platform Docs](https://docs.digitalocean.com/products/app-platform/)
- [App Platform Pricing](https://www.digitalocean.com/pricing/app-platform)
- [doctl CLI Reference](https://docs.digitalocean.com/reference/doctl/)
