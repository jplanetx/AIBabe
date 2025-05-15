# Use official Node.js image
FROM node:18-slim

# Set working directory
WORKDIR /app

# Copy package files and install deps
COPY package.json package-lock.json* ./
RUN npm install

# Copy the rest of the app
COPY . .

# Build the app
RUN npm run build

# Expose port and start app
EXPOSE 3000
CMD ["npm", "start"]
