FROM node:18-slim

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

# Create data directory for persistent storage
RUN mkdir -p data/backups

EXPOSE 8080
ENV PORT=8080

CMD ["node", "api/index.js"]
