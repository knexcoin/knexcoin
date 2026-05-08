FROM nginx:1.27-alpine

# Copy nginx config template — entrypoint substitutes ${PORT} from Cloud Run.
COPY nginx.conf.template /etc/nginx/templates/default.conf.template

# Copy the static site
COPY . /usr/share/nginx/html

# Cloud Run injects PORT; default to 8080 for local runs
ENV PORT=8080
EXPOSE 8080
