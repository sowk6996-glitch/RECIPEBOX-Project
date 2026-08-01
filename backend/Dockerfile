# Backend Dockerfile for RecipeBox
# Uses a lightweight Node image and runs the Express API.
FROM node:24-alpine

# Set working directory
WORKDIR /usr/src/app

# Install dependencies first for better caching
COPY package.json package-lock.json ./
RUN npm install --production

# Copy source files
COPY src ./src

# Expose the port the app listens on
EXPOSE 5001

# Use environment variables for runtime configuration
CMD ["node", "src/server.js"]
