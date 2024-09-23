/**
 * outputs some js to file so you can load the current vx build on the ext
 */

console.log("Making script to add the latest version to web!");

const path = require("path");
const fs = require("fs");

const webdir = path.join(__dirname, "..", "web");

const js = fs.readFileSync(path.join(webdir, "build.js"), "binary");
const css = fs.readFileSync(path.join(webdir, "build.css"), "binary");

const out = async ({ js, css }) => {
  VX.assets.js = js;
  VX.assets.css = css;

  await VX.browser.storage.local.set({ js, css });

  await VX.assets.updatePersistence();

  VX.Connection.reloadAll();
}

console.log(path.join(webdir, "devtools.js"));


fs.writeFileSync(
  path.join(webdir, "devtools.js"),
  `(${out})(${JSON.stringify({ js, css })})`
);