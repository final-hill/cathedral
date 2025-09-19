ARG NODE_VERSION=24.8.0

# Use the parameterized Node.js version
FROM node:${NODE_VERSION}-bookworm

# Set working directory
WORKDIR /app

# Copy package files first for better Docker layer caching
COPY package*.json ./

# Install all dependencies (some dev dependencies needed for Nuxt runtime)
RUN npm ci

# Copy pre-built application (built in CI/CD)
COPY .output ./.output

# Set production environment
ENV NODE_ENV=production

# Expose the port that Nuxt/Nitro will run on
EXPOSE 3000

# Start the application directly (no migrations)
CMD ["node", ".output/server/index.mjs"]
