import webpack from "webpack";
import url, { URL } from "node:url";

/** @type {webpack.Configuration} */
const config = {
  mode: "production",
  entry: {
    renderer: url.fileURLToPath(new URL("./src/index.ts", import.meta.url))
  },
  target: [ "web" ],
  extends: url.fileURLToPath(new URL("../webpack.config.js", import.meta.url)),
  plugins: [
    new webpack.DefinePlugin({
      VXEnvironment: JSON.stringify({
        VERSION: "1.0.0",
        PRODUCTION: true,
        ENVIROMENT: "renderer"
      })
    })
  ]
};

export default config;