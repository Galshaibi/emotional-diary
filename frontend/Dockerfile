# Build stage
FROM node:16-alpine as build

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:16-alpine

# Copy built assets from build stage
COPY --from=build /app/build /app/build

# Install serve
RUN npm install -g serve

# Expose port 10000
EXPOSE 10000

# Start serve
CMD ["serve", "-s", "build", "-l", "10000"]
