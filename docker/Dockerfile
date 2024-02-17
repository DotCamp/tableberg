FROM wordpress:latest

# Install packages required for WP-CLI
RUN apt-get update && apt-get install -y --no-install-recommends \
    less \
    default-mysql-client \
    unzip \
    && rm -rf /var/lib/apt/lists/*


# To hide a warning none will see and in case you want to view on another device
RUN echo "ServerName 0.0.0.0" >> /etc/apache2/apache2.conf


# Install WP-CLI
RUN curl -o /usr/local/bin/wp https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar && chmod +x /usr/local/bin/wp


COPY tableberg.zip /tmp/
COPY docker/init.sh /tmp/


RUN mkdir -p /var/www/html/wp-content/plugins/tableberg \
    && unzip /tmp/tableberg.zip -d /var/www/html/wp-content/plugins/tableberg/


RUN sed '$d' /usr/local/bin/docker-entrypoint.sh > /tmp/docker-entrypoint.sh \
    && cat /tmp/init.sh >> /tmp/docker-entrypoint.sh \
    && mv /tmp/docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh \
    && chmod +x /usr/local/bin/docker-entrypoint.sh