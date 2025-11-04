# ===================================================
# 1. ETAPA DE BUILD (Compilación de la aplicación)
# ===================================================
FROM node:20-alpine AS builder

WORKDIR /app

# 1.1. Copia solo los archivos de dependencias e instala
COPY package.json yarn.lock package-lock.json ./
RUN npm install

# 1.2. Copia todo lo demás (incluyendo la carpeta 'prisma')
COPY . .

# 1.3. *CLAVE:* Ejecuta prisma generate antes del build
# Esto crea el cliente de Prisma que necesita el build.
RUN npx prisma generate

# 1.4. Compila la aplicación Next.js
RUN npm run build

# ===================================================
# 2. ETAPA DE PRODUCCIÓN (Contenedor final, más pequeño)
# ===================================================
FROM node:20-alpine AS runner

WORKDIR /app

# Copia solo los archivos necesarios para la ejecución
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Se expone el puerto por defecto de Next.js
EXPOSE 3000

# Comando de inicio del servidor de producción de Next.js
CMD ["npm", "start"# ===================================================
# 1. ETAPA DE BUILD (Compilación de la aplicación)
# ===================================================
FROM node:20-alpine AS builder

WORKDIR /app

# 1.1. Copia solo los archivos de dependencias e instala
COPY package.json package-lock.json ./
RUN npm install

# 1.2. Copia todo lo demás (incluyendo la carpeta 'prisma')
COPY . .

# 1.3. *CLAVE:* Ejecuta prisma generate antes del build
# Esto crea el cliente de Prisma que necesita el build.
RUN npx prisma generate

# 1.4. Compila la aplicación Next.js
RUN npm run build

# ===================================================
# 2. ETAPA DE PRODUCCIÓN (Contenedor final, más pequeño)
# ===================================================
FROM node:20-alpine AS runner

WORKDIR /app

# Copia solo los archivos necesarios para la ejecución
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Se expone el puerto por defecto de Next.js
EXPOSE 3000

# Comando de inicio del servidor de producción de Next.js
CMD ["npm", "start"]
