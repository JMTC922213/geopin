# Use Node.js LTS version
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy application source
COPY . .

# Expose the port
EXPOSE 53840

# Set environment to production
ENV NODE_ENV=production

# Start the application
CMD ["npm", "start"]
