# ── Stage 1: build ───────────────────────────────────────────
FROM node:22-alpine AS builder

# Needed to compile native modules (sqlite3, bcrypt) on Alpine
RUN apk add --no-cache python3 make g++

WORKDIR /app

COPY package.json package-lock.json ./
# Install all deps (devDeps required for tsc + ts-node)
RUN npm ci --no-audit --no-fund

COPY . .
# Compile TypeScript, copy YAML config, create dist/static placeholder
RUN npm run build:prod

# Remove devDependencies so the copied node_modules is production-only
RUN npm prune --omit=dev --ignore-scripts --no-audit --no-fund

# ── Stage 2: production image ────────────────────────────────
FROM node:22-alpine

# Package installation belongs to the builder. Remove npm's independent,
# vulnerable tool dependency tree from the runtime image.
RUN rm -rf /usr/local/lib/node_modules/npm && rm -f /usr/local/bin/npm /usr/local/bin/npx

WORKDIR /app

ENV NODE_ENV=production
ENV BACKEND_ENV=prod

# Reuse the already-compiled (and pruned) node_modules from builder.
# Avoids recompiling native modules in the final image.
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY package*.json ./

# The deployment supplies PORT; the app reads process.env.PORT first.
EXPOSE 3000

USER node

CMD ["node", "dist/main.js"]
