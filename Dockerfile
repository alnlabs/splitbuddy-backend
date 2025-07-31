# Use official Node.js LTS image
FROM node:20

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies with legacy peer deps
RUN npm install --legacy-peer-deps

# Copy the rest of the application code
COPY . .

# Build the NestJS app
RUN npm run build

# Expose the backend port
EXPOSE 5900

# Start the app in production mode
CMD ["npm", "run", "start:prod"]