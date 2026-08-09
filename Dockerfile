FROM node:20-alpine
WORKDIR /app
COPY backend/package.json ./package.json
RUN cat package.json
CMD ["node", "-e", "console.log('hello')"]
