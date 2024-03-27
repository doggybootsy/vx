# Splash Theming
Splash theming allows you to alter the UI of the splash screen that shows up when launching Discord

Splash theming isn't the default install process, so you will have to install it manually

## Theming
In your `appdata like/.vx` folder there will be a `splash.css` file. 

You can edit that file and it will update automatically (after a .1s debounce)

## Important Keybinds
* Devtools
    * `f12`
    * `control` + `shift` + `i`
    * `command` + `option` + `i`
* Keep Splash Screen Open (Makes it so the splash screen can't close)
    * `control` + `shift` + `s`
    * `command` + `option` + `s`
* Open Splash File
    * `control` + `shift` + `o`
    * `command` + `option` + `o`

## Installation for splash theming
[NOTICE]: This doesnt show a complete VX install, this only works if you have the `appdata like/.vx` folder fully setup

1. Remove the injection from the `discord_desktop_core`
    * This isn't always needed incases like discord updates and now vx is gone.
    * Or you did this already before
    * Or if you came from step #10 from the install process

    1. Go inside the `index.js`
    2. If there is a line like `require("appdata like/.vx/app");` delete it
    3. You should be left with this `require('./core.asar');` (this could be different, like incase you have a another client mod installed too)

2. Go to the resource folder
    * Windows
        1. Go to your Discord directory in `%localappdata%`
        2. Find the `app-` latest version folder, and open it
        3. open the `resources` folder
    * OSX: unknown
    * linux: unknown

3. Rename the `app.asar` to `old.app.asar` (with discord fully closed)

4. Create a folder called `app` and make a `index.js` file and `package.json` file

5. In the `index.js` 
    1. Add a line that's similar to `require("appdata like/.vx/app");`. To find your appdata like folder look below
        * Windows: `%appdata%` (You must get the result of and replace all `\` with `/`)
        * OSX: `~/Library/Application Support/` (You must get the full result of this)
        * Linux: `~/.config/` (You must get the full result)

        * If you don't get the result it will error saying something to the extent of path not found
    2. Then add a this line `require("../old.app.asar");`
  
6. In the `package.json` make its contents be `{"main":"./index.js"}`

7. (optional but recommended) Make a copy of the `app` folder somewhere same like Documents
    * When Discord updates theres a chance it will reset your asar so you would need to redo all the steps up to here
    * Theres only one step you need todo if you did this. It is just step #2 and #3, then just add your `app` folder back to that folder

8. Start Discord
    * You would know if this works by a little VX logo in the bottom left of the splash window