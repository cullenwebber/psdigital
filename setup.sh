#!/bin/bash

site_name=$(basename "$(pwd)")

# WordPress CLI Commands
echo "Setting up WordPress configuration..."
wp config create --dbname=$site_name --dbuser=root --dbpass='' --dbhost='localhost' --skip-check

echo "Creating our database..."
wp db create

# Download WordPress
echo "Downloading WordPress..."
curl -O https://wordpress.org/latest.tar.gz

# Extract WordPress files
echo "Extracting WordPress files..."
tar -xzf latest.tar.gz
rm latest.tar.gz
mv wordpress/* ./
rm -r wordpress/

# Backup the current themes and plugins directories
echo "Backing up themes and plugins directories..."
mv wp-content/themes wp-content/themes_bk
mv wp-content/plugins wp-content/plugins_bk

# Remove wp-content from fresh install (we'll restore our backup later)
rm -rf wp-content

# Restore themes and plugins directories
echo "Restoring themes and plugins directories..."
mv wp-content/themes_bk wp-content/themes
mv wp-content/plugins_bk/* wp-content/plugins/
rmdir wp-content/plugins_bk

# Remove all default plugins (excluding plugins.zip)
echo "Removing default plugins..."
find wp-content/plugins/ ! -name 'plugins.zip' -type f -exec rm -f {} +

# Navigate to the startdigital theme directory and run composer install & npm install
echo "Navigating to the startdigital theme directory..."
cd wp-content/themes/startdigital

echo "Running composer install in startdigital theme directory..."
composer install

echo "Running npm install in startdigital theme directory..."
npm install

# Navigate back to the root directory
cd ../../../

# Copy .env.sample to .env
echo "Copying .env.sample to .env..."
cp .env.sample .env

# Fetch and populate WordPress salts in the .env file
echo "Fetching and populating WordPress salts in .env file..."

SALTS=$(curl -s https://api.wordpress.org/secret-key/1.1/salt/)
echo "$SALTS" | while IFS= read -r line; do
    KEY=$(echo $line | grep -o "'.*'" | head -1 | sed "s/'//g")
    VALUE=$(echo $line | grep -o "'.*'" | tail -1 | sed "s/'//g")
    sed -i "s/put_your_$KEY/$VALUE/g" .env
done

echo "Setup completed successfully!"
