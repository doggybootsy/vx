# Transparency
VX has a option to enable transparency in the BrowserWindow. 

This allows themes to make it so you can see you own desktop wallpaper / any app behind discord

## Detecting
Themes have the option to detect transparency in 2 ways. 

### Selector
You can use the `body.transparency` selector to tell if transparency is enabled.
This also exists in splash theming

### @media rule
[WARNING]: This is only possible in the main theme file (so it will not work in `@import`) and not possible in splash theming

The `@media` works like this
```css
@media (transparency: state) {
  [CSS Text]
}
```
If state isn't provided it will default to `true`. 
State can only have these values for false, `false` / `off` / `0` / `no`. 
For true it can be `true` / `on` / `1` / `yes`. 
Any unknown value inside state will result as `false` and state values are case sensitive

#### Usage
This shows a notice if the user has transparency disabled, it also tells them to enable it
```css
@media (transparent: false) {
  [class*=guilds_] ~ [class*=base_]::before {
    content: "Enable Transparency in VX settings";
    display: block;
    background-color: var(--status-warning-background);
    box-shadow: 0 1px 5px 0 .3;
    color: var(--status-warning-foreground);
    flex-grow: 0;
    flex-shrink: 0;
    font-size: 14px;
    font-weight: 500;
    height: 36px;
    line-height: 36px;
    opacity: 1;
    position: relative;
    text-align: center;
    visibility: unset;
    z-index: 101;
  }

  .platform-win [class*=guilds_] ~ [class*=base_]::before {
    border-radius: 8px 0 0;
  }
  .platform-win [class*=sidebar_] {
    border-radius: 0;
  }
}
```

### Bluring
VX doesn't provide a easy to way to enable bluring. But you can enable it by doing going to one of these path's. Bluring is only supported for Windows and MacOS

* Windows: `%appdata%\.vx`
* OSX: `~/Library/Application Support/.vx`

Then open the `window.json` and a custom property named either `backgroundMaterial` for windows or `vibrancy` for MacOS

#### Values
* `backgroundMaterial`: [Electron Background Material Docs](https://www.electronjs.org/docs/latest/api/browser-window#winsetbackgroundmaterialmaterial-windows)
  * `none` 
  * `auto`
  * `mica` 
  * `acrylic` 
  * `tabbed` 

* `vibrancy`: [Electron Vibrancy Docs](https://www.electronjs.org/docs/latest/api/browser-window#winsetvibrancytype-macos)
  * `fullscreen-ui` (Recommended)
  * `titlebar` 
  * `selection`
  * `menu` 
  * `acrylic` 
  * `popover` 
  * `sidebar` 
  * `header` 
  * `sheet` 
  * `window` 
  * `hud` 
  * `under-window` 
  * `under-page` 

So the output of your `window.json` should look something like this 
```json
{
    "transparent": true,
    "backgroundMaterial": "mica"
}
```
or
```json
{
	  "transparent": true,
    "vibrancy": "fullscreen-ui"
}
```

### Custom Background Color
You can do the same above for [backgroundColor](https://www.electronjs.org/docs/latest/api/browser-window#setting-the-backgroundcolor-property)

If this isn't defined and if transparency is enabled it will be defaulted to `#00000000` (100% transparent)

This does not require transparency to be used. 

But if you do have it enabled you must add a alpha to make it semi-transparent / fully transparent. 
In a hexadecimal it is the last 2 characters (If the hex like similar `#38A1F58F`) or the last character (If the hex like similar `#F4A7`) that determines the alpha

### Other Related Stuff
Other stuff related to transparency

#### Window snapping is broken
This is a issue with chromium itself [crbug/41395671](https://issues.chromium.org/issues/41395671) [electron/electron/2170](https://github.com/electron/electron/issues/2170)

#### Option not found in the dashboard
This is because transparency is only available for the Discord Desktop app and not for browsers