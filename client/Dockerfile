# ── Stage 1: build ───────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json ./
RUN npm install --prefer-offline

COPY . .
RUN STANDALONE=true npm run vite-build

# ── Stage 2: serve with nginx ────────────────────────────────
FROM nginx:1.27-alpine

# gettext provides envsubst for runtime template substitution
RUN apk add --no-cache gettext

COPY --from=builder /app/dist /usr/share/nginx/html

# nginx.conf is a template: ${BACKEND_URL} and ${PORT} are substituted at startup
COPY nginx.conf /etc/nginx/conf.d/default.conf.template

COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 80

# BACKEND_URL must be set in Railway → client service → Variables tab
# Example: BACKEND_URL = https://your-backend.up.railway.app
CMD ["/docker-entrypoint.sh"]
