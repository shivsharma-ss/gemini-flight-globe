FROM node:22-alpine

# Create a dedicated non-root user for running the app
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Install dependencies based on the lockfile for reproducibility
COPY package.json package-lock.json ./
RUN npm ci

# Copy the application source
COPY . .

# Ensure generated files are owned by the app user
RUN chown -R appuser:appgroup /app

USER appuser

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
