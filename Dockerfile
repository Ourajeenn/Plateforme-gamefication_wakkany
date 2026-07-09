# Stage 1: Build
FROM node:20-alpine AS build
LABEL stage=builder
WORKDIR /app

# Copier uniquement les manifestes d'abord pour profiter du cache Docker
COPY package*.json ./

# IMPORTANT: ne PAS utiliser --only=production ici.
# vite, @vitejs/plugin-react, tailwindcss, etc. sont dans devDependencies
# et sont nécessaires à `npm run build`. Avec --only=production, ces
# paquets sont absents et le build échoue. On installe tout, on build,
# puis on ne garde que le résultat statique dans le Stage 2 — les
# devDependencies ne finissent jamais dans l'image finale.
RUN npm ci --prefer-offline --no-audit

ENV NODE_ENV=production
COPY . .
RUN npm run build

# Stage 2: Production — image finale minimale, ne contient que nginx + dist/
FROM nginx:1.27-alpine
LABEL maintainer="Wakkany Platform"
LABEL description="Wakkany platform - React PWA"

# Copier la conf nginx avant les fichiers statiques
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Tini et curl pour health checks
RUN apk add --no-cache tini curl && \
    # Créer un user nginx dédié pour les processus (optionnel, nginx le fait déjà)
    apk add --no-cache libcap && \
    setcap cap_net_bind_service=+ep /usr/sbin/nginx || true

# Copier les fichiers build depuis le stage précédent
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s CMD curl -f http://localhost/ || exit 1

# Utiliser tini comme init pour éviter les processus orphelins
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["nginx", "-g", "daemon off;"]
