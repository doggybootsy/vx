import webpack from "webpack";
import url, { URL } from "node:url";

/** @type {webpack.Configuration} */
const config = {
  mode: "production",
  entry: {
    main: url.fileURLToPath(new URL("./src/index.ts", import.meta.url))
  },
  target: [ "electron-main" ],
  extends: url.fileURLToPath(new URL("../webpack.config.js", import.meta.url)),
  plugins: [
    new webpack.DefinePlugin({
      VXEnvironment: JSON.stringify({
        VERSION: "1.0.0",
        PRODUCTION: true,
        ENVIROMENT: "main"
      })
    })
  ]
};

export default config;