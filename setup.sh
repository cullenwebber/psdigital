#!/bin/bash

site_name=$(basename "$(pwd)")

# Check if wp-config.php exists
if [ ! -f wp-config.php ]; then
    wp cli info "Setting up WordPress configuration..."
    wp config create --dbname=$site_name --dbuser=root --dbpass='' --dbhost='localhost' --skip-check
else
    wp cli warning "wp-config.php already exists. Skipping configuration..."
fi

# Check if database exists
if ! wp db check --quiet; then
    wp cli info "Creating our database..."
    wp db create
else
    wp cli warning "Database '$site_name' already exists. Skipping creation..."
fi

wp cli info "Downloading WordPress..."
curl -O https://wordpress.org/latest.tar.gz

wp cli info "Extracting WordPress files..."
tar -xzf latest.tar.gz
rm latest.tar.gz
mv wordpress/* ./
rm -r wordpress/

wp cli info "Backing up themes and plugins directories..."
mv wp-content/themes wp-content/themes_bk
mv wp-content/plugins wp-content/plugins_bk

rm -rf wp-content

wp cli info "Restoring themes and plugins directories..."
mv wp-content/themes_bk wp-content/themes
mv wp-content/plugins_bk/* wp-content/plugins/
rmdir wp-content/plugins_bk

wp cli info "Removing default plugins..."
find wp-content/plugins/ ! -name 'plugins.zip' -type f -exec rm -f {} +

if [ -d wp-content/themes/startdigital ]; then
    wp cli info "Navigating to the startdigital theme directory..."
    cd wp-content/themes/startdigital

    wp cli info "Running composer install in startdigital theme directory..."
    composer install

    wp cli info "Running npm install in startdigital theme directory..."
    npm install

    cd ../../../
else
    wp cli warning "startdigital theme directory not found. Skipping..."
fi

wp cli info "Copying .env.sample to .env..."
cp .env.sample .env

wp cli info "Fetching and populating WordPress salts in .env file..."
SALTS=$(curl -s https://api.wordpress.org/secret-key/1.1/salt/)
echo "$SALTS" | while IFS= read -r line; do
    KEY=$(echo $line | grep -o "'.*'" | head -1 | sed "s/'//g")
    VALUE=$(echo $line | grep -o "'.*'" | tail -1 | sed "s/'//g" | sed 's/[&/\]/\\&/g')
    sed -i '' "s|put_your_$KEY|$VALUE|g" .env
done

wp cli success "Setup completed successfully!"
