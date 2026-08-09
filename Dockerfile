FROM node:20-alpine AS base
WORKDIR /app

ARG SERVICE_TYPE=backend
COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY backend/ ./

RUN if [ "$SERVICE_TYPE" = "backend" ]; then \
      npm run build && npm prune --production; \
    else \
      mkdir -p frontend-tmp && cp -r ../frontend/* frontend-tmp/ 2>/dev/null || true; \
      cd frontend && npm install --legacy-peer-deps && npx vite build; \
    fi

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=10000

COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/dist ./dist
COPY --from=base /app/package.json ./package.json

EXPOSE 10000
CMD ["node", "dist/main.js"]
