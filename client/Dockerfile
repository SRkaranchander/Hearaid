# Stage 1: Build React application
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
ENV NODE_ENV=production
RUN npm run build

# Stage 2: Serve build with Nginx
FROM nginx:alpine

COPY --from=builder /app/build /usr/share/nginx/html

# Custom nginx config to support React SPA routing if needed
RUN echo 'server { listen 80; location / { root /usr/share/nginx/html; index index.html index.htm; try_files $uri $uri/ /index.html; } }' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
