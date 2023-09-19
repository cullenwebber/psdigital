#!/bin/bash

site_name=$(basename "$(pwd)")

# Download WordPress
WP_CLI::line("Downloading WordPress...")
wp core download > /dev/null 2>&1
WP_CLI::success("Finished downloading WordPress...")

# Backup the current themes and plugins directories
WP_CLI::line("Backing up themes and plugins directories...")
[ -d wp-content/themes ] && mv wp-content/themes wp-content/themes_bk
[ -d wp-content/plugins ] && mv wp-content/plugins wp-content/plugins_bk

# Check if wp-config.php exists
if [ ! -f wp-config.php ]; then
    WP_CLI::line("Setting up WordPress configuration...")
    wp config create --dbname=$site_name --dbuser=root --dbpass='' --dbhost='localhost' --skip-check > /dev/null 2>&1
    WP_CLI::success("WordPress configured")
else
    WP_CLI::line("wp-config.php already exists. Skipping configuration...")
fi

# Check if database exists
if ! wp db check --quiet; then
    WP_CLI::line("Creating our database...")
    wp db create > /dev/null 2>&1
    WP_CLI::success("Database created")
else
    WP_CLI::warning("Database '$site_name' already exists. Skipping creation...")
fi

# Remove default themes and plugins
WP_CLI::line("Removing default themes and plugins...")
rm -rf wp-content/themes
rm -rf wp-content/plugins

# Restore themes and plugins directories
WP_CLI::line("Restoring themes and plugins directories...")
[ -d wp-content/themes_bk ] && mv wp-content/themes_bk wp-content/themes
[ -d wp-content/plugins_bk ] && mv wp-content/plugins_bk/* wp-content/plugins/ && rmdir wp-content/plugins_bk
WP_CLI::success("Themes and plugins restored")

# Remove all default plugins (excluding plugins.zip)
WP_CLI::line("Cleaning up default plugins...")
find wp-content/plugins/ ! -name 'plugins.zip' -type f -exec rm -f {} +

# Check if startdigital theme directory exists
if [ -d wp-content/themes/startdigital ]; then
    WP_CLI::line("Navigating to the startdigital theme directory...")
    cd wp-content/themes/startdigital

    WP_CLI::line("Running composer install in startdigital theme directory...")
    composer install > /dev/null 2>&1
    WP_CLI::success("Composer installed")

    WP_CLI::line("Running npm install in startdigital theme directory...")
    npm install > /dev/null 2>&1
    WP_CLI::success("Npm installed")

    # Navigate back to the root directory
    cd ../../../
else
    WP_CLI::warning("startdigital theme directory not found. Skipping...")
fi

# Copy .env.sample to .env
WP_CLI::line("Copying .env.sample to .env...")
cp .env.sample .env

# Fetch and populate WordPress salts in the .env file
WP_CLI::line("Fetching and populating WordPress salts in .env file...")

SALTS=$(curl -s https://api.wordpress.org/secret-key/1.1/salt/)
echo "$SALTS" | while IFS= read -r line; do
    KEY=$(echo $line | grep -o "'.*'" | head -1 | sed "s/'//g")
    VALUE=$(echo $line | grep -o "'.*'" | tail -1 | sed "s/'//g" | sed -e 's|[&]|\\&|g' -e 's|/|\\/|g')
    sed -i '' "s|put_your_$KEY|$VALUE|g" .env
done

WP_CLI::success("Setup completed successfully!")
