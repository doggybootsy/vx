import esbuild from "esbuild";
import { appendFile } from "node:fs/promises";
import Module from "node:module";
import path from "node:path";
import url, { URL } from "node:url";

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
        PRODUCTION: false,
        VERSION: pkg.version,
        ENVIROMENT: section
      })
    }),
    plugins: [
      ...(otherOptions.plugins ?? []),
      {
        name: "node-console",
        setup(build) {
          build.onResolve({
            filter: /^console$/
          }, () => ({
            path: "console",
            namespace: "node-console"
          }));

          build.onLoad({ filter: /.*/, namespace: "node-console" }, () => ({
            contents: "module.exports = Object.assign({ [Symbol.toStringTag]: \"Console\" }, console);"
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

export async function compile() {
  console.log("Building in Development mode (esbuild)");

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
};