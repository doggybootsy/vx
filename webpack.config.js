import webpack from "webpack";
import url, { URL } from "node:url";

/** @type {webpack.Configuration} */
const config = {
  mode: "production",
  module: {
    rules: [
      {
        test: /\.ts(x|)$/,
        use: "ts-loader",
        exclude: /node_modules/
      },
      // {
      //   test: /\.ts(x|)$/,
      //   use: {
      //     loader: "babel-loader",
      //     options: {
      //       presets: [
      //         "@babel/preset-typescript"
      //       ]
      //     }
      //   }
      // }
    ]
  },
  resolve: {
    extensions: [ ".ts", ".tsx" ],
    alias: {
      "common": url.fileURLToPath(new URL("common", import.meta.url)),
      "common/*": url.fileURLToPath(new URL("common/*", import.meta.url))
    }
  },
  output: {
    filename: "[name].js",
    path: url.fileURLToPath(new URL("dist", import.meta.url))
  }
};

export default config;