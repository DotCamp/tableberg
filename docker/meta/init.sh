#!/bin/bash

if ! wp core is-installed; then
    echo "Installing core..."
    wp config create \
        --dbhost=db:3306 \
        --dbuser=root \
        --dbpass=1234 \
        --dbname=dotcamp \
        --url="http://localhost:$TABLEBERG_PORT" \
        --allow-root

    wp core install --path=/var/www/html \
        --title="Tableberg - php-$PHP_VERSION wp-$WP_VERSION" \
        --admin_user="admin" \
        --admin_email="admin@dotcamp.com" \
        --admin_password="admin"  \
        --allow-root
fi

echo "Updating url..."
echo "Port: $TABLEBERG_PORT"
wp option update home "http://localhost:$TABLEBERG_PORT" --allow-root
wp option update siteurl "http://localhost:$TABLEBERG_PORT" --allow-root


if ! wp plugin is-active tableberg; then
    echo "Activating plugin...";
    wp plugin activate tableberg --allow-root
    wp plugin activate tableberg-pro --allow-root
fi

apache2-foreground
