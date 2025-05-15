FROM node:18-slim AS builder
WORKDIR /app

# ← THESE lines go in the Dockerfile, not in your shell
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:18-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next .next
COPY --from=builder /app/public public
COPY --from=builder /app/package*.json ./
RUN npm ci --production
EXPOSE 3000
CMD ["npm","start"]
