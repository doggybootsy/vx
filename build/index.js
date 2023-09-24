import fs from "node:fs/promises";
import sass from "node-sass";
import asar from "asar";
import Module from "node:module";
import esbuild from "esbuild";
import { appendFile } from "node:fs/promises";
import path from "node:path";
import url, { URL } from "node:url";

const isProd = process.argv.includes("--production");

const pkg = Module.createRequire(import.meta.url)("../package.json");

/**
 * 
 * @param {string} inFile 
 * @param {string} outFile 
 * @param {string} section
 * @param {Omit<esbuild.BuildOptions, "tsconfig" | "entryPoints" | "outFile" | "bundle" | "minify" | "minifyIdentifiers" | "minifySyntax" | "minifyWhitespace">} otherOptions 
 */
async function build(section, otherOptions) {
  const outFile = url.fileURLToPath(new URL(path.join("..", "dist", `${section}.js`), import.meta.url));

  console.log("Compiling", section);

  await esbuild.build({
    entryPoints: [ url.fileURLToPath(new URL(path.join("..", section, "src", "index.ts"), import.meta.url)) ],
    outfile: outFile,
    bundle: true,
    tsconfig: url.fileURLToPath(new URL(path.join("..", "tsconfig.json"), import.meta.url)),
    define: Object.assign(otherOptions.define ?? {}, {
      VXEnvironment: JSON.stringify({
        PRODUCTION: isProd,
        VERSION: pkg.version,
        ENVIROMENT: section,
        GITHUB: "https://github.com/doggybootsy/vx"
      })
    }),
    plugins: [
      ...(otherOptions.plugins ?? []),
      {
        name: "console-module",
        setup(build) {
          build.onResolve({
            filter: /^window:console$/
          }, () => ({
            path: "window:console",
            namespace: "console-module"
          }));

          build.onLoad({ filter: /.*/, namespace: "console-module" }, () => ({
            contents: "module.exports = Object.freeze(Object.assign({ [Symbol.toStringTag]: \"Console\" }, console));"
          }))
        }
      }
    ],
    minify: false,
    minifyIdentifiers: false,
    minifySyntax: false,
    minifyWhitespace: false,
    ...otherOptions
  });

  console.log("Compiled", section);

  await appendFile(outFile, `\n//# sourceURL=vx://VX/self/${section}`);
};

if (!process.argv.includes("--no-build")) {  
  console.log("Building with esbuild");

  await build(
    "main",
    {
      external: [ "electron" ],
      platform: "node"
    }
  );
  
  await build(
    "preload",
    {
      external: [ "electron", "original-fs" ],
      platform: "node"
    }
  );

  await build(
    "renderer",
    {
      platform: "browser"
    }
  );
  
  const pkg = Module.createRequire(import.meta.url)("../package.json");
  
  const result = sass.renderSync({
    file: "styles/index.scss",
    outputStyle: isProd ? "compressed" : "nested"
  });
  
  await fs.writeFile("dist/styles.css", result.css);
  
  await fs.writeFile("dist/package.json", JSON.stringify({
    main: "./main.js",
    type: "commonjs",
    version: pkg.version
  }));
  
  console.log("Compiled");
};

if (process.argv.includes("--asar")) {
  console.log("Bundling asar");
  asar.createPackage("./dist", "./vx.asar");
};