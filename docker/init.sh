if ! wp core is-installed; then
    echo "Installing core..."
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
fi
exec "$@"\
