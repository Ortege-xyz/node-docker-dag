FROM node:14

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy application code
COPY . .

# Define default environment variables if needed
ENV NODE_ENV=production

# Start the application
CMD ["node", "run pox"]
