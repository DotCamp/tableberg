#!/bin/bash

plugin_zip="$1"
sitename="test_site"

# Create directory
mkdir -p "$sitename"
cd "$sitename" || exit 1

# Download WordPress core
wp core download

# Create wp-config.php
wp config create --dbname="$sitename" --dbuser=root --dbpass=root

# Create the database
wp db create

# Install WordPress
wp core install --url="test.com" --title="$sitename" --admin_user=admin --admin_password=admin --admin_email=admin@test.com

installed=$(wp plugin install "$plugin_zip" 2>/dev/null | grep "Success: Installed 1 of 1 plugins." | wc -l)
if [[ $installed != "1" ]]; then
    echo plugin installation failed
    exit 1
fi
echo plugin installed without errors

activated=$(wp plugin activate tableberg 2>/dev/null | grep "Success: Activated 1 of 1 plugins." | wc -l)
if [[ $activated != "1" ]]; then
    echo plugin activation failed
    exit 1
fi
echo plugin activated without errors
