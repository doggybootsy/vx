console.log("Welcome to VX 2.0");

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
import * as popoutWindows from "./api/window";

import { plugins } from "./plugins";

import "./dashboard";
import "./index.css";
import { waitForNode } from "common/dom";

import masks from "./masks.html";
import { _addHomeButton, _settingButtonOnClickWrapper } from "./dashboard/patches";

import { Editor } from "./editor";
import { Injector } from "./patcher";
import { api } from "./webpack/api";

// @ts-expect-error
window.VX = {
  plugins,
  webpack: api,
  menus,
  notifications,
  minipopover: mp,
  React,
  util,
  components,
  storage,
  modals,
  windows: popoutWindows,
  Editor,
  Injector,
  _self: {
    _onWebpackModule: webpack._onWebpackModule,
    waitForNode,
    _addHomeButton,
    _settingButtonOnClickWrapper
  }
};

waitForNode("body").then((body) => {
  const svg = masks.querySelector("svg")!.cloneNode(true);
  body.append(svg);
});

document.addEventListener("keydown", (event) => {
  if (event.key.toLowerCase() === "f8") debugger;
});