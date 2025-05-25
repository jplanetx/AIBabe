#!/usr/bin/env bash
set -e

# 1) Build the image with your real build-args
docker build \
  --build-arg DATABASE_URL='postgresql://postgres.eihsdiqjrmvubmbkebyf:Z-3@k@Y57UZbb!r@aws-0-us-west-1.pooler.supabase.com:5432/postgres' \
  --build-arg NEXT_PUBLIC_API_URL='http://localhost:3000/api' \
  -t ai-gf:latest \
  .

# 2) Run the build step inside the container
docker run --rm \
  -v "$(pwd):/app" \
  -w /app \
  ai-gf:latest \
  npm run build
