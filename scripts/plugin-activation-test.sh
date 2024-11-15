#!/bin/bash

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

installed=$(wp plugin install ../packages/tableberg/tableberg.zip 2>/dev/null | grep "Success: Installed 1 of 1 plugins." | wc -l)
if [[ $installed != "1" ]]; then
    echo free plugin installation failed
    exit 1
fi
echo free plugin installed without errors

activated=$(wp plugin activate tableberg 2>/dev/null | grep "Success: Activated 1 of 1 plugins." | wc -l)
if [[ $activated != "1" ]]; then
    echo free plugin activation failed
    exit 1
fi
echo free plugin activated without errors

installed=$(wp plugin install ../packages/pro/tableberg-pro.zip 2>/dev/null | grep "Success: Installed 1 of 1 plugins." | wc -l)
if [[ $installed != "1" ]]; then
    echo pro plugin installation failed
    exit 1
fi
echo pro plugin installed without errors

activated=$(wp plugin activate tableberg-pro 2>/dev/null | grep "Success: Activated 1 of 1 plugins." | wc -l)
if [[ $activated != "1" ]]; then
    echo pro plugin activation failed
    exit 1
fi
echo pro plugin activated without errors
