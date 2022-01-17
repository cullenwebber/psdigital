# The StartDigital Starter Theme

This theme makes use of Advanced Custom Fields Pro to create a block-based page-builder experience.
All styling is done using TailwindCSS.

## Getting started

1. Setup a local WordPress install locally. [See here for the command to get the latest WordPress version locally](https://code.tutsplus.com/articles/download-and-install-wordpress-via-the-shell-over-ssh--wp-24403#:~:text=wget%20http%3A//wordpress.org/latest.tar.gz%0A%24tar%20xfz%20latest.tar.gz)
2. Create a database for your local WordPress setup. [TablePlus is a great, free tool for this.](https://tableplus.com/)
3. Change `wp-config-sample.php` to `wp-config.php` and update the following fields:
   - `define('DB_NAME', 'YOUR_DB_NAME');`
   - `define('DB_USER', 'YOUR_DB_USERNAME (usually root)');`
   - `define('DB_PASSWORD', 'YOUR_DB_PASSWORD (usually an empty string');`
4. Download this repository and replace your `wp-content` folder with the contents of this repository.
5. In your terminal, navigate to `wp-content/themes/startdigital` and run `composer install` followed by `npm install`.
6. Load up your WordPress local install in the browser and run through the install process
7. Make sure the StartDigital theme is activated from within `Appearance->Themes`.
8. Activate your plugins and start having fun!

## What's here?

`static/` is where you can keep your static front-end scripts, styles, or images. In other words, this is where our generated files go (CSS/JS) and where we can put any static images/assets we need.

`templates/` contains all of your Twig templates. These pretty much correspond 1 to 1 with the PHP files that respond to the WordPress template hierarchy. At the end of each PHP template, you'll notice a `Timber::render()` function whose first parameter is the Twig file where that data (or `$context`) will be used. Just an FYI.

## Other Resources

- [ACF Cookbook](https://timber.github.io/docs/guides/acf-cookbook/#nav)
- [Twig for Timber Cheatsheet](http://notlaura.com/the-twig-for-timber-cheatsheet/)
- [Timber and Twig Reignited My Love for WordPress](https://css-tricks.com/timber-and-twig-reignited-my-love-for-wordpress/) on CSS-Tricks
- [A real live Timber theme](https://github.com/laras126/yuling-theme).
- [Timber Video Tutorials](http://timber.github.io/timber/#video-tutorials) and [an incomplete set of screencasts](https://www.youtube.com/playlist?list=PLuIlodXmVQ6pkqWyR6mtQ5gQZ6BrnuFx-) for building a Timber theme from scratch.
