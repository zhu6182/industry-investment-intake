FROM node:20.15.0-alpine
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=10000

# Prebuilt dist already in git (Render free tier 30s build limit)
COPY backend/dist ./dist
COPY backend/package.json ./package.json
COPY backend/package-lock.json ./package-lock.json

# --ignore-scripts to avoid better-sqlite3 native build (no prebuilt alpine binary)
RUN npm install --omit=dev --legacy-peer-deps --no-audit --no-fund --ignore-scripts

EXPOSE 10000
CMD ["node", "dist/main.js"]
