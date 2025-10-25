ARG NODE_VERSION=24.8.0
ARG NODE_ENV=development

# Use the parameterized Node.js version
FROM node:${NODE_VERSION}-bookworm

# Set working directory
WORKDIR /app

# Install dotenvx
RUN curl -sfS https://dotenvx.sh/install.sh | sh

# Copy package files first for better Docker layer caching
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application
COPY . .

# Set NODE_ENV from build argument (make it available for RUN commands)
ENV NODE_ENV=${NODE_ENV}

# Install Playwright system dependencies and browsers
# This is done after npm ci to ensure playwright is available
RUN npx playwright install --with-deps chromium

# Expose the port that Nuxt/Nitro will run on
EXPOSE 3000
