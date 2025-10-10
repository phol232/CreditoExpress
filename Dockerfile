# Dockerfile para DigitalOcean App Platform
FROM node:20-alpine

# Instalar dependencias del sistema
RUN apk add --no-cache python3 make g++

# Crear directorio de trabajo
WORKDIR /app

# Copiar package files
COPY package*.json ./
COPY server/package*.json ./server/
COPY client/package*.json ./client/

# Instalar dependencias
RUN npm install
RUN cd server && npm install
RUN cd client && npm install

# Copiar código fuente
COPY . .

# Build del frontend
RUN cd client && npm run build

# Exponer puerto
EXPOSE 3000

# Variables de entorno por defecto
ENV NODE_ENV=production
ENV PORT=3000

# Comando de inicio
CMD ["node", "server/index.js"]
