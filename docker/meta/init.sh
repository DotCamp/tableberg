#!/bin/bash

if ! wp core is-installed; then
    echo "Installing core..."
    wp config create \
        --dbhost=db:3306 \
        --dbuser=root \
        --dbpass=1234 \
        --dbname=dotcamp \
        --allow-root
    wp core install --path=/var/www/html \
        --url="http://localhost:8000" \
        --title="Tableberg Test - Docker" \
        --admin_user="admin" \
        --admin_email="admin@dotcamp.com" \
        --admin_password="admin"  \
        --allow-root
fi

if ! wp plugin is-active tableberg; then
    echo "Activating plugin...";
    wp plugin activate tableberg --allow-root
    wp plugin activate tableberg-pro --allow-root
fi

apache2-foreground
