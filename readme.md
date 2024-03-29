[![License: MIT](https://img.shields.io/badge/License-MIT-red.svg)](https://opensource.org/licenses/MIT)
![GitHub Tag](https://img.shields.io/github/v/tag/doggybootsy/vx?sort=semver&logo=github&label=VX)
![GitHub issues](https://img.shields.io/github/issues/doggybootsy/vx)
![Discord](https://img.shields.io/discord/864267123694370836?logo=discord&label=Discord&link=https%3A%2F%2Fdiscord.gg%2FyYJA3qQE5F)
![GitHub language count](https://img.shields.io/github/languages/count/doggybootsy/vx)
<!-- [![CodeFactor](https://www.codefactor.io/repository/github/doggybootsy/vx/badge)](https://www.codefactor.io/repository/github/doggybootsy/vx) -->

## ${\textsf{\color{red}Notice}}$
VX is currently not fully out, there's no official way to install it that works currently. All except for the [MS Edge Store](https://microsoftedge.microsoft.com/addons/detail/vx/cdjpfngmglnndcjclhdnmbhfkakbelig)

## VX
VX is a client mod for [@discord](https://discord.com/)

## Installation
### Desktop
Currently there's no good way to install VX on the desktop app. 

### Browsers
[<img src="https://edgestatic.azureedge.net/shared/cms/lrs1c69a1j/section-images/29bfeef37eef4ca3bcf962274c1c7766.png" width="40" alt="Microsft Edge Logo" title="Install On Microsft Edge">](https://microsoftedge.microsoft.com/addons/detail/vx/cdjpfngmglnndcjclhdnmbhfkakbelig)

${\textsf{\color{red}Notice}}$: Weird Memory / CPU usage happens and can cause discord to crash / reload (Most likely a issue with edge itself, as just opening devtools can cause edge to use a lot a cpu / memory)

## Features
VX has 31 plugins built in, each doing a seperate tasks. Also has the ability to load custom plugins.

Built in theming support.

And the ability to enable electrons content protection mode (OSX and Windows only)

## Why?
VX is a light weight client mod that works both on the desktop app and in the browser

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