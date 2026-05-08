# ── Stage 1: build ───────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json ./
RUN npm install --prefer-offline

COPY . .
RUN STANDALONE=true npm run vite-build

# ── Stage 2: serve with nginx ────────────────────────────────
FROM nginx:1.27-alpine

COPY --from=builder /app/dist /usr/share/nginx/html

# nginx.conf is used as a template: ${BACKEND_URL} and ${PORT} are replaced at startup
COPY nginx.conf /etc/nginx/conf.d/default.conf.template

EXPOSE 80

# envsubst replaces only BACKEND_URL and PORT, leaving $uri $host etc. intact
CMD ["/bin/sh", "-c", \
  "envsubst '${BACKEND_URL} ${PORT}' \
    < /etc/nginx/conf.d/default.conf.template \
    > /etc/nginx/conf.d/default.conf \
  && nginx -g 'daemon off;'"]
