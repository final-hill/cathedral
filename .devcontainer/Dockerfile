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

# Make startup script executable
RUN chmod +x /app/scripts/startup.sh

# Set NODE_ENV from build argument (make it available for RUN commands)
ENV NODE_ENV=${NODE_ENV}

# Conditional build step - only run in production
RUN if [ "$NODE_ENV" = "production" ]; then \
        npm run build && \
        npm run generate-pwa-assets; \
    fi

# Expose the port that Nuxt/Nitro will run on
EXPOSE 3000

# Use startup script as entrypoint with the application command as argument
ENTRYPOINT ["/app/scripts/startup.sh"]
CMD ["node", ".output/server/index.mjs"]
