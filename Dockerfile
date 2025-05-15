FROM node:18-slim

WORKDIR /app

# Copy package files from subfolder
COPY improved_ai_gf_app/package*.json ./

RUN npm install

# Copy rest of the app
COPY improved_ai_gf_app .

RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start"]
