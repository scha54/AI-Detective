FROM node:20-alpine
WORKDIR /app

# Copy package info and install deps
COPY package*.json ./
RUN npm install --omit=dev

# Copy source code
COPY . .

# Expose port and start
EXPOSE 8080
ENV PORT=8080
CMD ["node", "server.js"]
