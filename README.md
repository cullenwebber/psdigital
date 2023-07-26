# The StartDigital Starter Theme

This theme makes use of Advanced Custom Fields Pro to create a block-based page-builder experience.
All styling is done using TailwindCSS.

## Getting started

1. Go the directory you keep you sites and run `mkdir yourprojectname`.
2. Enter `cd yourprojectname` and run `wget http://wordpress.org/latest.tar.gz` and then `tar -xf latest.tar.gz`. You can optionally just visit `http://wordpress.org/latest.tar.gz` in the browser to download it and extract it manually.
3. Run `mv wordpress/* .` to move the files into the root of the folder, followed by `rm -rf wordpress latest.tar.gz` to delete the no longer requires files.
4. Enter `rm -rf themes` to delete the directory, as we will replace this with our own.
5. Create a database for your local WordPress setup. [TablePlus is a great, free tool for this.](https://tableplus.com/) Create a new database and name it whatever you named your project. Eg. `yourprojectname`
6. Change `wp-config-sample.php` to `wp-config.php` and update the following fields:
   - `define('DB_NAME', 'yourprojectname');`
   - `define('DB_USER', 'root');`
   - `define('DB_PASSWORD', '');`
7. Clone this repository and name it `themes` by running `git clone git@github.com:StartDigitalAU/wp-boilerplate.git themes`
8. In your terminal, navigate to `wp-content/themes/startdigital` and run `composer install` followed by `npm install`.
9. In the `package.json` file, update all references to `wp-boilerplate.test` with whatever local WordPress install is. Most likely `yourprojectname.test`.
10. Load up your WordPress local install in the browser and run through the install process
11. Make sure the StartDigital theme is activated from within `Appearance->Themes`.
12. Update your permalinks to use the post name in `Settings->Permalinks`.
13. Activate any plugins in `Plugins`.
14. Back in your terminal, make sure you're in the `themes/startdigital` directory and run `npm run dev` for everything to fire up.

## What's here?

`static/` is where you can keep your static front-end scripts, styles, or images. In other words, this is where our generated files go (CSS/JS) and where we can put any static images/assets we need.

`templates/` contains all of your Twig templates. These pretty much correspond 1 to 1 with the PHP files that respond to the WordPress template hierarchy. At the end of each PHP template, you'll notice a `Timber::render()` function whose first parameter is the Twig file where that data (or `$context`) will be used. Just an FYI.

## Other Resources

- [ACF Cookbook](https://timber.github.io/docs/guides/acf-cookbook/#nav)
- [Twig for Timber Cheatsheet](http://notlaura.com/the-twig-for-timber-cheatsheet/)
- [Timber and Twig Reignited My Love for WordPress](https://css-tricks.com/timber-and-twig-reignited-my-love-for-wordpress/) on CSS-Tricks
- [A real live Timber theme](https://github.com/laras126/yuling-theme).
- [Timber Video Tutorials](http://timber.github.io/timber/#video-tutorials) and [an incomplete set of screencasts](https://www.youtube.com/playlist?list=PLuIlodXmVQ6pkqWyR6mtQ5gQZ6BrnuFx-) for building a Timber theme from scratch.
