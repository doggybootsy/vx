const esbuild = require("esbuild");
const { existsSync, rmSync, mkdirSync, writeFileSync, copyFileSync, statSync } = require("fs");
const { readFile, readdir } = require("fs/promises");
const path = require("path");
const asar = require("asar")

function argvIncludesMatch(regex) {
  for (const arg of process.argv) {
    if (regex.test(arg)) return true;
  }
  return false;
};
function argvIncludesArg(expression) {
  return argvIncludesMatch(new RegExp(`^-?-${expression}$`));
};

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
const SelfPlugin = {
  name: "self-plugin",
  setup(build) {
    const env = {
      IS_DEV: true,
      VERSION: "1.0.0"
    };

    build.onResolve({
      filter: /^self$/
    }, () => ({
      path: "self",
      namespace: "self-plugin"
    }));

    build.onLoad({
      filter: /.*/, namespace: "self-plugin"
    }, () => ({
      contents: `export const env = ${JSON.stringify(env)};\nexport const browser = typeof chrome === "object" ? chrome : browser;`
    }));
  }
};
/** @type {esbuild.Plugin} */
const RequireAllPluginsPlugin = {
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
      })).filter(dir => statSync(path.join("./packages/mod/src/plugins", dir)).isDirectory());

      return {
        resolveDir: "./packages/mod/src",
        contents: pluginDirs.map(dir => `require("./plugins/${dir}")`).join(";\n")
      }
    });
  }
};

(async function() {
  if (argvIncludesArg("b(uild)?")) {
    console.log("Building");
  
    if (existsSync(DIST)) rmSync(DIST, { recursive: true, force: true });

    await esbuild.build({
      entryPoints: [ "packages/mod/src/index.ts" ],
      outfile: "dist/build.js",
      bundle: true,
      platform: "browser",
      tsconfig: path.join(__dirname, "tsconfig.json"),
      jsx: "transform",
      jsxFactory: "window.VX.React.createElement",
      jsxFragment: "window.VX.React.Fragment",
      plugins: [
        HTMLPlugin,
        RequireAllPluginsPlugin,
        SelfPlugin
      ]
    });
    
    await esbuild.build({
      entryPoints: [ "packages/desktop/main/index.ts" ],
      outfile: "dist/main.js",
      bundle: true,
      platform: "node",
      external: [ "electron" ],
      tsconfig: path.join(__dirname, "tsconfig.json"),
      plugins: [
        SelfPlugin
      ]
    });
    
    await esbuild.build({
      entryPoints: [ "packages/desktop/preload/index.ts" ],
      outfile: "dist/preload.js",
      bundle: true,
      platform: "node",
      external: [ "electron" ],
      tsconfig: path.join(__dirname, "tsconfig.json"),
      plugins: [
        SelfPlugin
      ]
    });
    
    await esbuild.build({
      entryPoints: [ "packages/extension/src/index.ts" ],
      outfile: "dist/extension.js",
      bundle: true,
      platform: "browser",
      tsconfig: path.join(__dirname, "tsconfig.json"),
      plugins: [
        SelfPlugin
      ]
    });
  };
  if (argvIncludesArg("d(esktop)?")) {
    if (!existsSync(DIST)) {
      // todo: escape / error handle
      throw "compile first";
    }
    
    const app = path.join(__dirname, "app");
    if (existsSync(app)) rmSync(app, { recursive: true, force: true });
  
    mkdirSync(app);
  
    writeFileSync(path.join(app, "package.json"), JSON.stringify({
      version: "1.0.0",
      name: "vx-desktop",
      type: "commonjs",
      main: "index.js",
      author: "doggybootsy"
    }));
  
    copyFileSync(path.join(DIST, "main.js"), path.join(app, "index.js"));
    copyFileSync(path.join(DIST, "preload.js"), path.join(app, "preload.js"));
    copyFileSync(path.join(DIST, "build.js"), path.join(app, "build.js"));
    copyFileSync(path.join(DIST, "build.css"), path.join(app, "build.css"));
  };
  if (argvIncludesArg("e(xtension)?")) {
    if (!existsSync(DIST)) {
      // todo: escape / error handle
      throw "compile first";
    }
    
    const extension = path.join(__dirname, "extension");
    if (existsSync(extension)) rmSync(extension, { recursive: true, force: true });
  
    mkdirSync(extension);

    throw "not added!";
  
    // writeFileSync(path.join(extension, "manifest.json"), JSON.stringify({
    //   version: "1.0.0",
    //   name: "vx-desktop",
    //   type: "commonjs",
    //   main: "index.js",
    //   author: "doggybootsy"
    // }));
  
    // copyFileSync(path.join(DIST, "main.js"), path.join(extension, "index.js"));
    // copyFileSync(path.join(DIST, "preload.js"), path.join(extension, "preload.js"));
    // copyFileSync(path.join(DIST, "build.js"), path.join(extension, "build.js"));
  };
  if (argvIncludesArg("a(sar)?")) {
    await asar.createPackage("./app", "app.asar");
    console.log("Made asar");
  };
})();
