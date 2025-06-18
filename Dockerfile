ARG NODE_VERSION=22.15.0

# Use the parameterized Node.js version
FROM node:${NODE_VERSION}-bookworm

# Set working directory
WORKDIR /app

# Copy package files first for better Docker layer caching
COPY package*.json ./

# Install all dependencies (needed for migration scripts)
RUN npm ci

# Copy the startup script
COPY scripts/startup.sh ./scripts/startup.sh
RUN chmod +x ./scripts/startup.sh

# Copy pre-built application (built in CI/CD)
COPY .output ./.output

# Set production environment
ENV NODE_ENV=production

# Expose the port that Nuxt/Nitro will run on
EXPOSE 3000

# Use startup script as entrypoint with the application command as argument
ENTRYPOINT ["./scripts/startup.sh"]
CMD ["node", ".output/server/index.mjs"]
