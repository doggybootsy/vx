## Themes JS execution
This will have a plugin like runtime for themes, tho setting `.start` / `.stop` will not override vx internal `.start` / `.stop`

### Usage
Inline Comment Style
```css
/*@vx-js
exports.start = () => {
  console.log("Started");
};
exports.stop = () => {
  console.log("Stopped");
};
*/
```
or 
Multi Comment Style
```css
/*@vx-js*/
exports.start = () => {
  console.log("Started");
};
exports.stop = () => {
  console.log("Stopped");
};
/*@end*/
```
Will most likely be the `Inline Comment Style`

## Display Info
This will easily allow localized names, descriptions and authors

This will only get added if `Themes JS execution` is added

You can see all of the locals with `VX.webpack.common.i18n.getAvailableLocales().map(m => m.value)`

When theres no display info it will resort to meta tag

### type
```ts
interface DisplayInfo {
  name?: string,
  description?: string,
  author?: string
};
type getDisplayInfo = (locale: string) => DisplayInfo | void;
```
### Usage 
```js
exports.getDisplayInfo = (locale) => {
  switch (locale) {
    case "en-us":
    case "en-gb":
      return { name: "English Name" };
    case "de":
      return { name: "German Name" };
    case "ja":
      return { name: "Japanese Name" };
    default:
      return { name: "Every Other Local Name" };
  };
};
```