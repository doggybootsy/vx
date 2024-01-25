[![License: MIT](https://img.shields.io/badge/License-MIT-red.svg)](https://opensource.org/licenses/MIT)
![GitHub Tag](https://img.shields.io/github/v/tag/doggybootsy/vx?sort=semver&logo=github&label=VX)
![GitHub issues](https://img.shields.io/github/issues/doggybootsy/vx)
![Discord](https://img.shields.io/discord/864267123694370836?logo=discord&label=Discord&link=https%3A%2F%2Fdiscord.gg%2FyYJA3qQE5F)
![GitHub language count](https://img.shields.io/github/languages/count/doggybootsy/vx)
<!-- [![CodeFactor](https://www.codefactor.io/repository/github/doggybootsy/vx/badge)](https://www.codefactor.io/repository/github/doggybootsy/vx) -->

## ${\textsf{\color{red}Notice}}$
VX is currently not fully out, there's no official way to install it that works currently

## VX
VX is a client mod for [@discord](https://discord.com/)

## Features
VX has 26 plugins built in, each doing a seperate tasks. Also has the ability to load custom plugins.

Built in theming support.

And the ability to enable electrons content protection mode (OSX and Windows only)

## Why?
VX is a light weight client mod that works both on the desktop app and in the browser

## Installation
Currently there's no good way to install VX on the desktop app. 

But there is a Microsoft Edge extension but it's currently broken

## Suggesting
To suggest plugins create a [new issue](https://github.com/doggybootsy/vx/issues/new?assignees=&labels=enhancement&projects=&template=plugin-request--%23name-.md&title=Plugin%20Request%20%5B%23name%5D) with the plugin, but check if the plugin already exists

## Contributing
To add plugins / features this is what you would do
1. To contribute to VX you first need [Git](https://git.com) and [NodeJS](https://nodejs.com). 
2. Then you clone the repo `git clone https://github.com/doggybootsy/vx`
3. After that you install the dependencies `npm install`
4. To compile VX you do `npm run ./index.js` but you need flags todo anything
  * Flags (you can also do `--` instead of `-`)
    * Usage Example `npm run ./index.js -p -d -a -w`
    * Flag `-w` or `-web` compiles the files for web
    * Flag `-d` or `-desktop` compiles the files for desktop
    * Flag `-a` or `-asar` compiles the desktop files into a `.asar`
    * Flag `-p` or `-production` compiles in the production mode
5. Using the compiled build
  * On Desktop you need to require the `./app` folder VX makes in your `discord-desktop-core` (`%localappdata%\discord\app-#.#.####\modules\discord_desktop_core-#\discord_desktop_core`) or in the `app.asar` in the resource folder (`%localappdata%\discord\app-#.#.####\resources`)
  * On Web Make sure you add the files to your extension then reload the extension (VX will at somepoint have a extension sub module that will make it) can't give a full guide currently

## License
The license is the MIT license