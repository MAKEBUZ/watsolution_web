# ── Stage 1: build ───────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts --no-audit --no-fund

COPY . .
RUN STANDALONE=true npm run vite-build

# ── Stage 2: serve with nginx ────────────────────────────────
FROM nginx:1.27-alpine

# gettext provides envsubst for runtime template substitution
RUN apk add --no-cache gettext ca-certificates

COPY --from=builder /app/dist /usr/share/nginx/html

# nginx.conf is a template: ${BACKEND_URL} and ${PORT} are substituted at startup
COPY nginx.conf /etc/nginx/conf.d/default.conf.template

COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 80

# Set BACKEND_URL to the HTTPS API origin when using the bundled proxy.
# The AWS Compose deployment supplies its own internal reverse proxy.
CMD ["/docker-entrypoint.sh"]
