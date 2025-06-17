ARG NODE_VERSION
ARG NODE_ENV

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

# Conditional build step - only run in production
RUN if [ "$NODE_ENV" = "production" ]; then \
        npm run build && \
        npm run generate-pwa-assets; \
    fi

# Expose the port that Nuxt/Nitro will run on
EXPOSE 3000

# Set NODE_ENV from build argument (can be overridden by environment)
ENV NODE_ENV=${NODE_ENV}

# Default command for production (can be overridden in compose)
CMD ["node", ".output/server/index.mjs"]
