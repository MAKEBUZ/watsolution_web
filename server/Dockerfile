# ── Stage 1: build ───────────────────────────────────────────
FROM node:20-alpine AS builder

# Needed to compile native modules (sqlite3, bcrypt) on Alpine
RUN apk add --no-cache python3 make g++

WORKDIR /app

COPY package*.json ./
# Install all deps (devDeps required for tsc + ts-node)
RUN npm install --prefer-offline

COPY . .
# Compile TypeScript, copy YAML config, create dist/static placeholder
RUN npm run build:prod

# Remove devDependencies so the copied node_modules is production-only
RUN npm prune --production

# ── Stage 2: production image ────────────────────────────────
FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production
ENV BACKEND_ENV=prod

# Reuse the already-compiled (and pruned) node_modules from builder.
# Avoids recompiling native modules in the final image.
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY package*.json ./

# Railway injects PORT dynamically; the app reads process.env.PORT first.
EXPOSE 3000

CMD ["node", "dist/main.js"]
