console.log("Welcome to VX 2.0");

import { getModule } from "./webpack/searching";
import { listeners, webpackRequire } from "./webpack/webpack";
import { plainTextPatches } from "./webpack/patches";
import { byKeys, byStrings, byProtoKeys, getByKeys, getByProtoKeys, getByStrings } from "./webpack/filters";
import * as util from "./util";
import * as components from "./components";
import { React } from "./webpack/common";

import * as mp from "./api/minipopover";
import * as notifications from "./api/notifications";
import * as modals from "./api/modals";
import * as menus from "./api/menu";
import * as storage from "./api/storage";

import * as webpack from "./webpack";
import * as common from "./webpack/common";

import { plugins } from "./plugins";

import "./dashboard";
import "./index.css";
import { waitForNode } from "common/dom";

import masks from "./masks.html";
import { _addNavigatorButton } from "./dashboard";

// @ts-expect-error
window.VX = {
  plugins,
  webpack: {
    getModule,
    get require(){ return webpackRequire },
    _onWebpackModule(module: Webpack.Module) {
      for (const listener of listeners) listener(module);
    },
    getByKeys, 
    getByProtoKeys, 
    getByStrings,
    filters: {
      byKeys,
      byProtoKeys,
      byStrings
    },
    patches: plainTextPatches,
    common: common,

    __raw: webpack
  },
  menus,
  notifications,
  minipopover: mp,
  React: React,
  util,
  components,
  storage,
  modals,
  _self: { 
    _addNavigatorButton
  }
};

waitForNode("body").then((body) => {
  const svg = masks.querySelector("svg")!.cloneNode(true);
  body.append(svg);
});