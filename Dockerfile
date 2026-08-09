FROM node:20-alpine AS builder
WORKDIR /app

ENV PUPPETEER_SKIP_DOWNLOAD=true
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV NPM_CONFIG_AUDIT=false
ENV NPM_CONFIG_FUND=false
ENV NODE_OPTIONS="--max-old-space-size=2048"

COPY backend/package.json ./package.json

RUN npm install --legacy-peer-deps --omit=dev --no-audit --no-fund --prefer-offline

COPY backend/ ./
RUN npm install --legacy-peer-deps --no-audit --no-fund --prefer-offline

RUN npx nest build && rm -rf src tsconfig.json tsconfig.build.json tsconfig.build.tsbuildinfo test

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=10000
ENV NODE_OPTIONS="--max-old-space-size=512"

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json

EXPOSE 10000
CMD ["node", "dist/main.js"]
