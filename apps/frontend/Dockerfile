# Use a lightweight Nginx image
FROM nginx:alpine

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy the static website files to the Nginx html directory
COPY *.html *.css *.js /usr/share/nginx/html/

# Fix file permissions (Nginx needs read access)
RUN chmod -R 644 /usr/share/nginx/html/* && \
    chmod 755 /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]
