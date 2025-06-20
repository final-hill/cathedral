ARG NODE_VERSION=22.15.0
ARG NODE_ENV=development

# Use the parameterized Node.js version
FROM node:${NODE_VERSION}-bookworm

# Set working directory
WORKDIR /app

# Copy package files first for better Docker layer caching
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application
COPY . .

# Set NODE_ENV from build argument (make it available for RUN commands)
ENV NODE_ENV=${NODE_ENV}

# Expose the port that Nuxt/Nitro will run on
EXPOSE 3000
