FROM nginx:alpine

# Copy your static frontend files to nginx html folder
COPY public /usr/share/nginx/html

# Copy your nginx config into the container
COPY default.conf /etc/nginx/conf.d/default.conf

# Expose port 80 internally (nginx default)
EXPOSE 80

# Start nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]


