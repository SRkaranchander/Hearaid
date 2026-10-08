FROM node:18-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy application source code
COPY . .

# Expose port
EXPOSE 5000

# Set environment variables default
ENV PORT=5000
ENV NODE_ENV=production

# Start application
CMD ["npm", "start"]
