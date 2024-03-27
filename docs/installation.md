# Installation
How to install VX

### My VX is gone after Discord updated?
Go to [Manual Reinject VX](#reinject-vx)

## Automatically
There's currently no way to this

## Manually

### Full install process
First time installing? Do this

1. Download the latest releast
    1. Go to https://github.com/doggybootsy/vx/releases/latest
    2. Click the `app.asar` file

2. Go to your appdata like folder
    * Windows: `%appdata%`
    * OSX: `~/Library/Application Support/`
    * Linux: `~/.config/`

3. Create a folder named `.vx`

4. Open the `.vx` folder

5. Make a folder called `app`

6. Place the `app.asar` file you downloaded

7. Rename the `app.asar` to the release version that you downloaded
    * Example `4.47.35.asar` (do not actually name it this, unless thats the actual version)
    * You can see the release version by looking at the end of your URL when you are on the download page. It will look like `https://github.com/doggybootsy/vx/releases/tag/4.47.35`
    * If the version starts with a `v` skip the `v` so like `v4.47.35` would become `4.47.35`

8. Create a file called `index.js`

9. Set its contents to 
```js
const fs = require("node:fs");
const path = require("node:path");

const asars = fs.readdirSync(__dirname)
    .filter((file) => file.endsWith(".asar"))
    .map((file) => file.replace(".asar", ""))
    .filter((file) => /^(\d+)\.(\d+)\.(\d+)/.test(file));

const [ latest, ...old ] = asars.sort((a, b) => -a.localeCompare(b));

for (const version of old) {
    try { 
        fs.unlinkSync(path.join(__dirname, `${version}.asar`)); 
    }
    catch (error) {
        console.log("[vx]:", "Unable to delete version", version);
    }
}

require(`./${latest}.asar`);
```

10. If you want to do the splash installation you can now go and follow [splash install](./themes/splash.md#installation-for-splash-theming) guide now
    * The splash installation allows you to have themes on your splash screen

11. Go to your local appdata like folder
    * Windows: `%localappdata%`
    * OSX: `~/Library/Application Support/`
    * Linux: `~/.config/`

12. Find your Discord installation modules folder
    1. (Windows only) Go into the highest version `app-` folder
    2. Then go into `modules`

13. Find the `discord_desktop_core` folders contents
    1. There will be a folder called `discord_desktop_core-1` or something similar (The number can be different)
    2. Then go into `discord_desktop_core`

14. Open the `index.js` folder

15. create a new line before the require thats in there

16. Require the `app` folder you made back in step #5
    * You code should look like 
    ```js
    require("appdata like/.vx/app");
    require("./core.asar");
    ```
    * appdata like being your full appdata folder path

17. Restart Discord fully
    * You will know if it worked if you see a VX logo in the bottom left of the discord loading screen (not the splash)

### Reinject VX
After a Discord update VX can no longer be injected, so you have to reinject it

1. If you did the splash installation before go to [splash installation](./themes/splash.md#installation-for-splash-theming)
    * If you created a backup asar follow step #9 in the splash install process
    * Start from step #1 again in the splash install process

2. Go to step #11 in the full install process section and just follow the steps afterwards
