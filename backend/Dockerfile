FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN PUPPETEER_SKIP_DOWNLOAD=true npm install --legacy-peer-deps
COPY . .
RUN npm run build && PUPPETEER_SKIP_DOWNLOAD=true npm prune --production

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=10000
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json

RUN apk add --no-cache chromium

EXPOSE 10000
CMD ["node", "dist/main.js"]
