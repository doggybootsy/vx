import fs from "node:fs/promises";
import sass from "node-sass";
import asar from "asar";
import Module from "node:module";
import * as production from "./production.js";
import * as development from "./development.js";

const isProd = process.argv.includes("--production");

if (!process.argv.includes("--no-build")) {
  if (isProd) throw new Error("DO NOT USE PRODUCTION MODE");
  
  if (isProd) await production.compile();
  else await development.compile();
  
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