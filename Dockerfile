# Stage 1: Build — installe les dépendances et compile l'app React/Vite
FROM node:20-alpine AS build
WORKDIR /app

# Copier les manifestes en premier pour bénéficier du cache Docker layer
COPY package*.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --prefer-offline --no-audit --no-fund

# Copier le reste des sources et builder
ENV NODE_ENV=production
COPY . .
RUN --mount=type=cache,target=/root/.npm \
    npm run build

# Stage 2: Production — image nginx minimale (ne contient que le résultat buildé)
FROM nginx:1.27-alpine

LABEL maintainer="Wakkany Platform"
LABEL description="Wakkany - Plateforme de gamification intergénérationnelle"

# curl pour le health-check Fly.io
RUN apk add --no-cache curl

# Désactiver les logs d'accès (meilleure perf, moins d'I/O)
RUN ln -sf /dev/stdout /var/log/nginx/access.log && \
    ln -sf /dev/stderr /var/log/nginx/error.log

# Configuration nginx personnalisée (SPA fallback + headers sécurité)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Fichiers statiques compilés
COPY --from=build --chown=nginx:nginx /app/dist /usr/share/nginx/html

# Port 80 exposé (Fly.io redirige automatiquement 443 → 80 interne)
EXPOSE 80

# Health check compatible Fly.io
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
