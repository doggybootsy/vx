try {
  if (typeof require("electron") === "object") {
    try {
      require("./app");
    }
    catch (e) {
      const electron = require("electron");
      const Notification = electron.Notification;
  
      electron.app.whenReady().then(() => {
        const notification = new Notification({
          title: "Compile VX",
          body: String(e),
          urgency: "critical"
        });
    
        notification.show();
      });
    }
    
    return;
  }
}
catch (e) {

}

const esbuild = require("esbuild");
const { existsSync, rmSync, mkdirSync, writeFileSync, copyFileSync, statSync, readFileSync } = require("fs");
const { readFile, readdir } = require("fs/promises");
const path = require("path");
const asar = require("asar")
const cp = require("child_process");

const { version } = require("./package.json");
const JSZip = require("jszip");

function argvIncludesMatch(regex) {
  for (const arg of process.argv) {
    if (regex.test(arg)) return true;
  }
  return false;
}
function argvIncludesArg(expression) {
  return argvIncludesMatch(new RegExp(`^-?-${expression}$`));
}

function $(cmd) {
  return cp.execSync(String.raw.apply(null, arguments), { cwd: process.cwd() }).toString("binary").trim();
}

const git = cache(() => {
  try {
    $`git --version`;
  } 
  catch (error) {
    return { exists: false };
  }

  const branch = $`git rev-parse --abbrev-ref HEAD`;
  const hash = $`git rev-parse HEAD`;
  const hashShort = $`git rev-parse --short HEAD`;
  
  let url = $`git config --get remote.origin.url`;
  if (url.endsWith(".git")) url = url.slice(0, url.length - 4);

  return { branch, hash, hashShort, url, exists: true };
});

const IS_PROD = argvIncludesArg("p(roduction)?");
console.log("is production:", IS_PROD);
console.log("version:", version);
console.log("git:", git().exists);

console.log(Array(20).fill("-").join("-"));

function hashCode(str) {
  let hash = 0;
  for (let i = 0, len = str.length; i < len; i++) {
    let chr = str.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
}

/** @type {esbuild.Plugin} */
const FakeNodeModules = {
  name: "fake-node-modules-plugin",
  setup(build) {
    const modules = [
      "moment",
      "react",
      "react-dom",
      "react-dom/client"
    ];

    build.onResolve({
      filter: new RegExp(`^(${modules.join("|")})$`)
    }, (args) => ({
      namespace: "fake-node-modules-plugin",
      path: args.path
    }));

    build.onLoad({
      filter: /.*/, namespace: "fake-node-modules-plugin"
    }, (args) => {
      return {
        resolveDir: "./packages/mod/src/fake_node_modules",
        contents: `export * from "./${args.path}";export { default } from "./${args.path}";`
      }
    });
  }
}

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
      filter: /\.css\?(managed|m)$/
    }, (args) => ({
      path: path.resolve(args.resolveDir, args.path).replace(__dirname, ".").replaceAll(path.sep, "/").replace(/\?(managed|m)$/, ""),
      namespace: "managed-css-plugin"
    }));

    build.onLoad({
      filter: /.*/, namespace: "managed-css-plugin"
    }, async (args) => {
      const css = await readFile(args.path, { encoding: "binary" });

      return {
        contents: `
        import { Styler } from "vx:styler";
        
        export const id = ${JSON.stringify(args.path.replace("./packages/mod/src/plugins", "@plugins"))};
        export const css = ${JSON.stringify(css)};
        
        const styler = new Styler(css, id);

        export function addStyle() { styler.add(); }
        export function removeStyle() { styler.remove(); }
        export function hasStyle() { return styler.enabled(); }
        `,
        resolveDir: "./packages/mod/src"
      }
    });
  }
};
/** @type {<T>(factory: () => T) () => T} */
function cache(factory) {
  const cache = { ref: null, hasValue: false };

  return () => {
    if (cache.hasValue) return cache.ref;
    
    cache.ref = factory();
    cache.hasValue = true;

    return cache.ref;
  }
}

/** @type {esbuild.Plugin} */
const SelfPlugin = (desktop) => ({
  name: "self-plugin",
  setup(build) {
    const env = {
      IS_DEV: !IS_PROD,
      VERSION: version,
      RDT: {
        DOWNLOAD_URL: "https://web.archive.org/web/20221207185248/https://polypane.app/fmkadmapgofadopljbjfkapdkoienihi.zip",
        ID: "fmkadmapgofadopljbjfkapdkoienihi"
      }
    };

    build.onResolve({
      filter: /^vx:self$/
    }, () => ({
      path: "vx:self",
      namespace: "self-plugin"
    }));

    build.onLoad({
      filter: /.*/, namespace: "self-plugin"
    }, () => ({
      contents: `
      export const env = ${JSON.stringify(env)};
      export const git = ${JSON.stringify(git())};
      export const browser = global.chrome ?? global.browser ?? {};
      export const IS_DESKTOP = ${desktop};
      `
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
        .filter(dir => !dir.endsWith(desktop ? ".web" : ".app"))
        .filter(dir => dir !== "shared");
      const userPluginDirs = [];
      // const userPluginDirs = (await readdir("./packages/mod/src/user-plugins", {
      //   encoding: "binary"
      // }))
      //   .filter(dir => statSync(path.join("./packages/mod/src/user-plugins", dir)).isDirectory())
      //   .filter(dir => !dir.endsWith(".ignore"))
      //   .filter(dir => !dir.endsWith(desktop ? ".web" : ".app"))
      //   .filter(dir => dir !== "shared");
        
      return {
        resolveDir: "./packages/mod/src",
        contents: `
function esModuleInteropDefault(exports) {
  if (typeof exports === "object" && exports !== null && exports.__esModule && exports.default) return exports.default;
  return exports;
}
${pluginDirs.map(dir => `module.exports[${JSON.stringify(dir)}] = esModuleInteropDefault(require("./plugins/${dir}"));`).join("\n")}
${userPluginDirs.map(dir => `module.exports[${JSON.stringify(dir)}] = esModuleInteropDefault(require("./user-plugins/${dir}"));`).join("\n")}`
      }
    });
  }
});

/** @type {(desktop: boolean) => esbuild.Plugin[]} */
const plugins = (desktop) => [
  HTMLPlugin,
  RequireAllPluginsPlugin(desktop),
  SelfPlugin(desktop),
  ManagedCSSPlugin,
  FakeNodeModules
];

const injections = [
  "./injections/global.js",
  "./injections/jsx.js",
  "./injections/vars.ts"
];

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
      plugins: plugins(true),
      inject: injections,
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
      external: [ "original-fs", "electron" ],
      tsconfig: path.join(__dirname, "tsconfig.json"),
      inject: injections,
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
      external: [ "original-fs", "electron" ],
      tsconfig: path.join(__dirname, "tsconfig.json"),
      inject: injections,
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
      external: [ "original-fs", "electron" ],
      tsconfig: path.join(__dirname, "tsconfig.json"),
      inject: injections,
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
  }
  if (argvIncludesArg("a(sar)?")) {
    await asar.createPackage("./app", "app.asar");
    console.log("Made asar");
  }
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
      plugins: plugins(false),
      inject: injections,
      footer: {
        css: "/*# sourceURL=vx://VX/app/build.css */",
        js: "//# sourceURL=vx://VX/app/build.js"
      }
    });
  }
  if (argvIncludesArg("e(xtension)?")) {
    console.log("Building Extension!");

    const dir = path.join(__dirname, "extension");
    if (existsSync(dir)) rmSync(dir, { recursive: true, force: true });
    mkdirSync(dir);

    mkdirSync(path.join(dir, "mv3"));
    
    const manifest = require(path.join(__dirname, "packages", "web", "mv3", "manifest.json"));
    
    manifest.version_name = `${manifest.version} (${new Date().toLocaleDateString()})`;

    writeFileSync(path.join(dir, "mv3", "manifest.json"), JSON.stringify(manifest, null, "\t"));
    copyFileSync(path.join(__dirname, "packages", "web", "mv3", "modifyResponseHeaders.json"), path.join(dir, "mv3", "modifyResponseHeaders.json"));

    mkdirSync(path.join(dir, "mv3", "icons"));
    for (const size of [ 256, 128, 48, 16 ]) {
      copyFileSync(path.join(__dirname, "assets", `${size}.png`), path.join(dir, "mv3", "icons", `${size}.png`));
    }

    await esbuild.build({
      entryPoints: [ "packages/web/mv3/src/service-worker/index.ts" ],
      outfile: "extension/mv3/scripts/service-worker.js",
      bundle: true,
      platform: "browser",
      tsconfig: path.join(__dirname, "tsconfig.json"),
      jsx: "transform",
      plugins: plugins(false),
      inject: injections,
      footer: {
        css: "/*# sourceURL=vx://VX/app/build.css */",
        js: "//# sourceURL=vx://VX/app/build.js"
      }
    });
    await esbuild.build({
      entryPoints: [ "packages/web/mv3/src/content.ts" ],
      outfile: "extension/mv3/scripts/content.js",
      bundle: true,
      platform: "browser",
      tsconfig: path.join(__dirname, "tsconfig.json"),
      jsx: "transform",
      plugins: plugins(false),
      inject: injections,
      footer: {
        css: "/*# sourceURL=vx://VX/app/build.css */",
        js: "//# sourceURL=vx://VX/app/build.js"
      }
    });

    console.log("Zipping Extension!");
    const zip = new JSZip();

    zip.file("manifest.json", JSON.stringify(manifest, null, "\t"));
    zip.file("modifyResponseHeaders.json", readFileSync(path.join(dir, "mv3", "modifyResponseHeaders.json"), "binary"));

    const scripts = zip.folder("scripts");
    scripts.file("content.js", readFileSync(path.join(dir, "mv3", "scripts", "content.js"), "binary"));
    scripts.file("service-worker.js", readFileSync(path.join(dir, "mv3", "scripts", "service-worker.js"), "binary"));

    const icons = zip.folder("icons");
    icons.file("16.png", readFileSync(path.join(dir, "mv3", "icons", "16.png"), "binary"));
    icons.file("48.png", readFileSync(path.join(dir, "mv3", "icons", "48.png"), "binary"));
    icons.file("128.png", readFileSync(path.join(dir, "mv3", "icons", "128.png"), "binary"));
    icons.file("256.png", readFileSync(path.join(dir, "mv3", "icons", "256.png"), "binary"));

    const buffer = await zip.generateAsync({ type: "nodebuffer" });
    writeFileSync(path.join(dir, "mw3.zip"), buffer);
  }
})();
