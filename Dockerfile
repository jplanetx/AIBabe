FROM node:20-slim AS builder
WORKDIR /app

# Add a non-root user and set permissions
RUN useradd -m appuser
RUN chown -R appuser:appuser /app
USER appuser

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:20-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production

# Add a non-root user and set permissions for runtime stage
RUN useradd -m appuser
RUN chown -R appuser:appuser /app
USER appuser

COPY --from=builder /app/.next .next
COPY --from=builder /app/public public
COPY --from=builder /app/package*.json ./
RUN npm ci --production
EXPOSE 3000
CMD ["npm","start"]
