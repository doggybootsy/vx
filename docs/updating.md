# Updating
Updating VX is pretty easy

## Automatically
In the dashboard there's a little update UI. 

To update you just need to
1. (may not be needed) Click the check for updates button
2. Then click download
    * This will restart Discord when it's done

## Manually
It may not be possible to update VX from the dashboard (If its crashing or something)

To update manually you would do
1. Download the latest releast
    1. Go to https://github.com/doggybootsy/vx/releases/latest
    2. Click the `app.asar` file
2. Rename the `app.asar` to the release version that you downloaded
    * Example `4.47.35.asar` (do not actually name it this, unless thats the actual version)
    * You can see the release version by looking at the end of your URL when you are on the download page. It will look like `https://github.com/doggybootsy/vx/releases/tag/4.47.35`
3. Go to `appdata like/.vx/app`
4. Add the asar that downloaded to that folder
5. Fully restart discord
    * In devtools you can run `VXNative.app.restart();` to restart Discord