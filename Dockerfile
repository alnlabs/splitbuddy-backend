# Use official Node.js LTS image
FROM node:20

# Set working directory
WORKDIR /app

# Install Doppler CLI
RUN (curl -Ls --tlsv1.2 --proto "=https" --retry 3 https://cli.doppler.com/install.sh || wget -t 3 -qO- https://cli.doppler.com/install.sh) | sh

# Accept build argument for skipping install
ARG SKIP_INSTALL=false

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies with legacy peer deps (unless SKIP_INSTALL is true)
RUN if [ "$SKIP_INSTALL" != "true" ]; then npm install --legacy-peer-deps; fi

# Copy the rest of the application code
COPY . .

# Install dependencies if they were skipped (needed for build)
RUN if [ "$SKIP_INSTALL" = "true" ]; then npm install --legacy-peer-deps; fi

# Build the NestJS app
RUN npm run build

# Expose the backend port
EXPOSE 5900

# Start the app with Doppler (if DOPPLER_TOKEN is provided) or fallback to direct start
CMD if [ -n "$DOPPLER_TOKEN" ]; then \
        doppler run -- npm run start:prod; \
    else \
        npm run start:prod; \
    fi