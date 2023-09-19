#!/bin/bash

GREEN="\033[1;32m"
NORMAL="\033[0m"
CYAN="\033[1;36m"
YELLOW="\033[1;33m"

site_name=$(basename "$(pwd)")

# Download WordPress
echo -e "${CYAN}Downloading WordPress...${NORMAL}"
wp core download > /dev/null 2>&1
echo -e "${GREEN}Finished downloading WordPress...${NORMAL}"

# Backup the current themes and plugins directories
echo -e "${CYAN}Backing up themes and plugins directories...${NORMAL}"
[ -d wp-content/themes ] && mv wp-content/themes wp-content/themes_bk
[ -d wp-content/plugins ] && mv wp-content/plugins wp-content/plugins_bk

# Check if wp-config.php exists
if [ ! -f wp-config.php ]; then
    echo -e "${CYAN}Setting up WordPress configuration...${NORMAL}"
    wp config create --dbname=$site_name --dbuser=root --dbpass='' --dbhost='localhost' --skip-check > /dev/null 2>&1
    echo -e "${GREEN}WordPress configured${NORMAL}"
else
    echo -e "${YELLOW}wp-config.php already exists. Skipping configuration...${NORMAL}"
fi

# Check if database exists
if ! wp db check --quiet; then
    echo -e "${CYAN}Creating our database...${NORMAL}"
    wp db create > /dev/null 2>&1
    echo -e "${GREEN}Database created${NORMAL}"
else
    echo -e "${YELLOW}Database '$site_name' already exists. Skipping creation...${NORMAL}"
fi

# Remove default themes and plugins
echo -e "${CYAN}Removing default themes and plugins...${NORMAL}"
rm -rf wp-content/themes
rm -rf wp-content/plugins

# Restore themes and plugins directories
echo -e "${CYAN}Restoring themes and plugins directories...${NORMAL}"
[ -d wp-content/themes_bk ] && mv wp-content/themes_bk wp-content/themes
[ -d wp-content/plugins_bk ] && mv wp-content/plugins_bk/* wp-content/plugins/ && rmdir wp-content/plugins_bk
echo -e "${GREEN}Themes and plugins restored${NORMAL}"

# Remove all default plugins (excluding plugins.zip)
echo -e "${CYAN}Cleaning up default plugins...${NORMAL}"
find wp-content/plugins/ ! -name 'plugins.zip' -type f -exec rm -f {} +

# Check if startdigital theme directory exists
if [ -d wp-content/themes/startdigital ]; then
    echo -e "${CYAN}Navigating to the startdigital theme directory...${NORMAL}"
    cd wp-content/themes/startdigital

    echo -e "${CYAN}Running composer install in startdigital theme directory...${NORMAL}"
    composer install > /dev/null 2>&1
    echo -e "${GREEN}Composer installed${NORMAL}"

    echo -e "${CYAN}Running npm install in startdigital theme directory...${NORMAL}"
    npm install > /dev/null 2>&1
    echo -e "${GREEN}Npm installed${NORMAL}"

    # Navigate back to the root directory
    cd ../../../
else
    echo -e "${YELLOW}startdigital theme directory not found. Skipping...${NORMAL}"
fi

# Copy .env.sample to .env
echo -e "${CYAN}Copying .env.sample to .env...${NORMAL}"
cp .env.sample .env

echo -e "To generate WordPress salts, please visit the following link:\n"
echo -e "\033[4;34mhttps://roots.io/salts.html\033[0m\n"
echo -e "Copy and paste the generated salts into your .env file."

echo -e "${GREEN}Setup completed successfully!${NORMAL}"
