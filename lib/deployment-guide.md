# Deployment Guide for AI Girlfriend Application on Digital Ocean

This guide provides step-by-step instructions for deploying the AI Girlfriend application on Digital Ocean using Docker and Docker Compose.

## Prerequisites

1. A Digital Ocean account
2. Docker and Docker Compose installed on your local machine
3. Git installed on your local machine

## Step 1: Create a Digital Ocean Droplet

1. Log in to your Digital Ocean account
2. Click on "Create" and select "Droplets"
3. Choose an image: Select the "Marketplace" tab and choose "Docker"
4. Choose a plan: Select the "Basic" plan
   - For this application, a droplet with 2GB RAM / 1 CPU should be sufficient to start
5. Choose a datacenter region close to your target audience
6. Add your SSH keys for secure access
7. Choose a hostname (e.g., `ai-girlfriend-app`)
8. Click "Create Droplet"

## Step 2: Set Up Your Project for Deployment

### Create a Dockerfile

Create a `Dockerfile` in the root of your project:

```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js collects anonymous telemetry data about general usage
ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### Create a Docker Compose File

Create a `docker-compose.yml` file in the root of your project:

```yaml
version: '3'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    restart: always
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}
    depends_on:
      - postgres
    networks:
      - app-network

  postgres:
    image: postgres:14
    restart: always
    environment:
      - POSTGRES_USER=${POSTGRES_USER}
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
      - POSTGRES_DB=${POSTGRES_DB}
    volumes:
      - postgres-data:/var/lib/postgresql/data
    networks:
      - app-network

networks:
  app-network:
    driver: bridge

volumes:
  postgres-data:
```

### Create an Environment File

Create a `.env` file for your environment variables:

```
# Database
DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secure_password
POSTGRES_DB=ai_girlfriend

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# App
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

**Note:** Do not commit this file to your repository. Add it to your `.gitignore` file.

### Update next.config.js

Update your `next.config.js` file to enable standalone output:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
};

module.exports = nextConfig;
```

## Step 3: Deploy to Digital Ocean

1. SSH into your Digital Ocean droplet:
   ```
   ssh root@your_droplet_ip
   ```

2. Create a directory for your application:
   ```
   mkdir -p /var/www/ai-girlfriend
   cd /var/www/ai-girlfriend
   ```

3. Clone your repository:
   ```
   git clone https://github.com/yourusername/ai-girlfriend.git .
   ```

4. Create the `.env` file with your environment variables:
   ```
   nano .env
   ```
   Paste your environment variables and save the file.

5. Build and start the application:
   ```
   docker-compose up -d
   ```

6. Run database migrations:
   ```
   docker-compose exec app npx prisma migrate deploy
   ```

## Step 4: Set Up Nginx as a Reverse Proxy

1. Install Nginx:
   ```
   apt update
   apt install nginx
   ```

2. Create an Nginx configuration file:
   ```
   nano /etc/nginx/sites-available/ai-girlfriend
   ```

3. Add the following configuration:
   ```
   server {
       listen 80;
       server_name your-domain.com www.your-domain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

4. Create a symbolic link to enable the site:
   ```
   ln -s /etc/nginx/sites-available/ai-girlfriend /etc/nginx/sites-enabled/
   ```

5. Test the Nginx configuration:
   ```
   nginx -t
   ```

6. Restart Nginx:
   ```
   systemctl restart nginx
   ```

## Step 5: Set Up SSL with Let's Encrypt

1. Install Certbot:
   ```
   apt install certbot python3-certbot-nginx
   ```

2. Obtain an SSL certificate:
   ```
   certbot --nginx -d your-domain.com -d www.your-domain.com
   ```

3. Follow the prompts to complete the SSL setup.

## Step 6: Set Up Automatic Updates

1. Create a deployment script:
   ```
   nano /var/www/ai-girlfriend/deploy.sh
   ```

2. Add the following content:
   ```bash
   #!/bin/bash
   cd /var/www/ai-girlfriend
   git pull
   docker-compose down
   docker-compose build
   docker-compose up -d
   docker-compose exec -T app npx prisma migrate deploy
   ```

3. Make the script executable:
   ```
   chmod +x /var/www/ai-girlfriend/deploy.sh
   ```

4. Set up a cron job to check for updates (optional):
   ```
   crontab -e
   ```
   Add the following line to check for updates daily at 2 AM:
   ```
   0 2 * * * /var/www/ai-girlfriend/deploy.sh >> /var/log/ai-girlfriend-deploy.log 2>&1
   ```

## Monitoring and Maintenance

### Set Up Monitoring

1. Install and configure monitoring tools:
   ```
   docker-compose exec app npm install -g pm2
   docker-compose exec app pm2 start server.js
   docker-compose exec app pm2 install pm2-logrotate
   ```

### Backup Strategy

1. Set up automatic database backups:
   ```
   nano /var/www/ai-girlfriend/backup.sh
   ```

2. Add the following content:
   ```bash
   #!/bin/bash
   TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
   BACKUP_DIR="/var/backups/ai-girlfriend"
   mkdir -p $BACKUP_DIR
   docker-compose exec -T postgres pg_dump -U postgres ai_girlfriend > $BACKUP_DIR/ai_girlfriend_$TIMESTAMP.sql
   ```

3. Make the script executable:
   ```
   chmod +x /var/www/ai-girlfriend/backup.sh
   ```

4. Set up a cron job for daily backups:
   ```
   crontab -e
   ```
   Add the following line:
   ```
   0 1 * * * /var/www/ai-girlfriend/backup.sh
   ```

## Troubleshooting

### Common Issues and Solutions

1. **Application not starting:**
   - Check Docker logs: `docker-compose logs app`
   - Verify environment variables: `docker-compose exec app printenv`

2. **Database connection issues:**
   - Check if Postgres is running: `docker-compose ps`
   - Verify database credentials: `docker-compose exec postgres psql -U postgres -c "\l"`

3. **Nginx configuration issues:**
   - Check Nginx error logs: `tail -f /var/log/nginx/error.log`
   - Verify Nginx configuration: `nginx -t`

## Conclusion

Your AI Girlfriend application should now be successfully deployed on Digital Ocean. The setup includes:

- Docker containerization for consistent deployment
- PostgreSQL database for data storage
- Nginx as a reverse proxy
- SSL encryption with Let's Encrypt
- Automatic updates and backups

For any issues or questions, please refer to the troubleshooting section or contact the development team.