##################################################
# Stage 1: Builder
##################################################
FROM node:18.20.2-slim AS builder

# Install OpenSSL (needed by Prisma)
RUN apt-get update \
 && apt-get install -y openssl \
 && rm -rf /var/lib/apt/lists/*

# Declare build-time args and expose them as ENV vars
ARG DATABASE_URL
ARG NEXT_PUBLIC_API_URL
ENV DATABASE_URL=${DATABASE_URL} \
    NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

# Set up the app directory
WORKDIR /app

# 1) Copy only package files and install deps as root
COPY package*.json ./
RUN npm ci

# 2) Bring in your .env.local so Next.js sees your Supabase keys
COPY .env.local .env.local

# 3) Copy the rest of your source
COPY . .

# 4) Generate Prisma client
RUN npm run prisma:generate

# 6) Run your combined build script (prisma + next)
RUN npm run build

# 7) Create a non-root user, fix permissions, and switch
RUN useradd -m appuser \
 && chown -R appuser:appuser /app
USER appuser

##################################################
# Stage 2: Runner
##################################################
FROM node:18.20.2-slim AS runner

WORKDIR /app

# Copy only what you need at runtime
COPY --from=builder /app/.next     ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/public    ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma    ./prisma

EXPOSE 3000
CMD ["npm", "start"]
