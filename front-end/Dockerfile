FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
EXPOSE 3001
# WATCHPACK_POLLING forces Next.js to use polling for file-change detection,
# which is required for bind mounts on macOS and Windows hosts.
ENV WATCHPACK_POLLING=true
CMD ["npm", "run", "dev"]
