const esbuild = require("esbuild");
const { existsSync, rmSync, mkdirSync, writeFileSync, copyFileSync, statSync } = require("fs");
const { readFile, readdir } = require("fs/promises");
const path = require("path");
const asar = require("asar")
const cp = require("child_process");

function argvIncludesMatch(regex) {
  for (const arg of process.argv) {
    if (regex.test(arg)) return true;
  }
  return false;
};
function argvIncludesArg(expression) {
  return argvIncludesMatch(new RegExp(`^-?-${expression}$`));
};

function hashCode(str) {
  let hash = 0;
  for (let i = 0, len = str.length; i < len; i++) {
    let chr = str.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
}

const DIST = path.join(__dirname, "dist");

/** @type {esbuild.Plugin} */
const HTMLPlugin = {
  name: "html-plugin",
  setup(build) {
    build.onResolve({
      filter: /\.html$/
    }, (args) => ({
      path: path.resolve(args.resolveDir, args.path).replace(__dirname, ".").replaceAll(path.sep, "/"),
      namespace: "html-plugin"
    }));

    build.onLoad({
      filter: /.*/, namespace: "html-plugin"
    }, async (args) => {
      const html = await readFile(args.path, { encoding: "binary" });

      return {
        contents: `export default new DOMParser().parseFromString(${JSON.stringify(html)}, "text/html");`
      }
    });
  }
};
/** @type {esbuild.Plugin} */
const ManagedCSSPlugin = {
  name: "managed-css-plugin",
  setup(build) {
    build.onResolve({
      filter: /\.css\?managed$/
    }, (args) => ({
      path: path.resolve(args.resolveDir, args.path).replace(__dirname, ".").replaceAll(path.sep, "/").replace(/\?managed$/, ""),
      namespace: "managed-css-plugin"
    }));

    build.onLoad({
      filter: /.*/, namespace: "managed-css-plugin"
    }, async (args) => {
      const css = await readFile(args.path, { encoding: "binary" });

      // How can require 'common/dom' in this? so i dont have to use 'queueMicrotask'
      return {
        contents: `
        export const id = ${JSON.stringify(args.path)};
        export const css = ${JSON.stringify(css)};
        export function addStyle() {
          const style = document.createElement("style");
          style.setAttribute("vx-style-path", id);
          style.appendChild(document.createTextNode(css));

          queueMicrotask(() => {
            removeStyle();
            VX._self.waitForNode("vx-plugins").then((head) => head.appendChild(style));
          });
        };
        export function removeStyle() {
          const style = document.querySelector(\`[vx-style-path=\${JSON.stringify(id)}\`);
          if (style) style.remove();
        };
        `
      }
    });
  }
};

function cache(factory) {
  const cache = { ref: null, hasValue: false };

  return () => {
    if (cache.hasValue) return cache.ref;
    
    cache.ref = factory();
    cache.hasValue = true;

    return cache.ref;
  }
};

function exec(cmd) {
  return cp.execSync(cmd, { cwd: process.cwd() }).toString("binary").trim();
};

const git = cache(() => {
  try {
    exec("git --version");
  } 
  catch (error) {
    console.log("Git is not installed! Aborting getting git details");

    return { exists: false };
  }

  const branch = exec("git rev-parse --abbrev-ref HEAD");
  const hash = exec(`git rev-parse HEAD`);
  const hashShort = exec(`git rev-parse --short HEAD`);
  
  let url = exec("git config --get remote.origin.url");
  if (url.endsWith(".git")) url = url.slice(0, url.length - 4);

  return { branch, hash, hashShort, url, exists: true };
});

/** @type {esbuild.Plugin} */
const SelfPlugin = (desktop) => ({
  name: "self-plugin",
  setup(build) {
    const env = {
      IS_DEV: true,
      VERSION: "1.0.0"
    };

    env.VERSION_HASH = hashCode(env.VERSION).toString(36).toUpperCase();

    build.onResolve({
      filter: /^self$/
    }, () => ({
      path: "self",
      namespace: "self-plugin"
    }));

    build.onLoad({
      filter: /.*/, namespace: "self-plugin"
    }, () => ({
      contents: `export const env = Object.freeze(${JSON.stringify(env)});
      export const git = Object.freeze(${JSON.stringify(git())});
      export const browser = typeof chrome === "object" ? chrome : browser;
      export const IS_DESKTOP = ${desktop};`
    }));
  }
});
/** @type {(desktop: boolean) => esbuild.Plugin} */
const RequireAllPluginsPlugin = (desktop) => ({
  name: "require-all-plugins-plugin",
  setup(build) {
    build.onResolve({
      filter: /^@plugins$/
    }, () => ({
      path: "@plugins",
      namespace: "require-all-plugins-plugin"
    }));

    build.onLoad({
      filter: /.*/, namespace: "require-all-plugins-plugin"
    }, async (args) => {
      const pluginDirs = (await readdir("./packages/mod/src/plugins", {
        encoding: "binary"
      }))
        .filter(dir => statSync(path.join("./packages/mod/src/plugins", dir)).isDirectory())
        .filter(dir => !dir.endsWith(".ignore"))
        .filter(dir => !dir.endsWith(desktop ? ".web" : ".desktop"));

      return {
        resolveDir: "./packages/mod/src",
        contents: pluginDirs.map(dir => `require("./plugins/${dir}")`).join(";\n")
      }
    });
  }
});

(async function() {
  if (argvIncludesArg("d(esktop)?")) {
    console.log("Building Desktop Files!");
    
    const app = path.join(__dirname, "app");
    if (existsSync(app)) rmSync(app, { recursive: true, force: true });
    mkdirSync(app);

    await esbuild.build({
      entryPoints: [ "packages/mod/src/index.ts" ],
      outfile: "app/build.js",
      bundle: true,
      platform: "browser",
      tsconfig: path.join(__dirname, "tsconfig.json"),
      jsx: "transform",
      plugins: [
        HTMLPlugin,
        RequireAllPluginsPlugin(true),
        SelfPlugin(true),
        ManagedCSSPlugin
      ],
      footer: {
        css: "/*# sourceURL=vx://VX/app/build.css */",
        js: "//# sourceURL=vx://VX/app/build.js"
      }
    });
    
    await esbuild.build({
      entryPoints: [ "packages/desktop/main/index.ts" ],
      outfile: "app/index.js",
      bundle: true,
      platform: "node",
      external: [ "electron" ],
      tsconfig: path.join(__dirname, "tsconfig.json"),
      plugins: [
        SelfPlugin(true)
      ],
      footer: {
        js: "//# sourceURL=vx://VX/desktop/main.js"
      }
    });
    
    await esbuild.build({
      entryPoints: [ "packages/desktop/preload/index.ts" ],
      outfile: "app/main.js",
      bundle: true,
      platform: "node",
      external: [ "electron" ],
      tsconfig: path.join(__dirname, "tsconfig.json"),
      plugins: [
        SelfPlugin(true)
      ],
      footer: {
        js: "//# sourceURL=vx://VX/desktop/preload.js"
      }
    });
    await esbuild.build({
      entryPoints: [ "packages/desktop/splash/index.ts" ],
      outfile: "app/splash.js",
      bundle: true,
      platform: "node",
      external: [ "electron" ],
      tsconfig: path.join(__dirname, "tsconfig.json"),
      plugins: [
        SelfPlugin(true),
        HTMLPlugin
      ],
      footer: {
        js: "//# sourceURL=vx://VX/desktop/splash-preload.js"
      }
    });
  
    writeFileSync(path.join(app, "package.json"), JSON.stringify({
      version: "1.0.0",
      name: "vx-desktop",
      type: "commonjs",
      main: "index.js",
      author: "doggybootsy"
    }));
  };
  if (argvIncludesArg("a(sar)?")) {
    await asar.createPackage("./app", "app.asar");
    console.log("Made asar");
  };
  if (argvIncludesArg("w(eb)?")) {
    console.log("Building Web Files!");
    
    const web = path.join(__dirname, "web");
    if (existsSync(web)) rmSync(web, { recursive: true, force: true });
    mkdirSync(web);

    await esbuild.build({
      entryPoints: [ "packages/mod/src/index.ts" ],
      outfile: "web/build.js",
      bundle: true,
      platform: "browser",
      tsconfig: path.join(__dirname, "tsconfig.json"),
      jsx: "transform",
      plugins: [
        HTMLPlugin,
        RequireAllPluginsPlugin(false),
        SelfPlugin(false),
        ManagedCSSPlugin
      ],
      footer: {
        css: "/*# sourceURL=vx://VX/app/build.css */",
        js: "//# sourceURL=vx://VX/app/build.js"
      }
    });
  };
})();
