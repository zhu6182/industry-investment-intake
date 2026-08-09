FROM node:20-alpine AS deps
WORKDIR /app
ENV PUPPETEER_SKIP_DOWNLOAD=true \
    PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    NPM_CONFIG_AUDIT=false \
    NPM_CONFIG_FUND=false
COPY backend/package*.json ./
RUN npm ci --omit=dev --legacy-peer-deps --no-audit --no-fund 2>&1 | tail -5

FROM node:20-alpine AS builder
WORKDIR /app
ENV PUPPETEER_SKIP_DOWNLOAD=true \
    NPM_CONFIG_AUDIT=false \
    NPM_CONFIG_FUND=false
COPY backend/package*.json ./
RUN npm ci --legacy-peer-deps --no-audit --no-fund 2>&1 | tail -5
COPY backend/ ./
RUN npx nest build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=10000
ENV NODE_OPTIONS="--max-old-space-size=400"

COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json

EXPOSE 10000
CMD ["node", "dist/main.js"]
