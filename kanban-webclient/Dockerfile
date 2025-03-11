# Use Node.js Alpine for a small image
FROM node:18-alpine

# Set working directory inside the container
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy all project files
COPY . .

# Expose the Vite development server port
EXPOSE 5173

# Use CMD to start Vite correctly
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
