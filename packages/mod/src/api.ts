import React from "react";

import * as util from "./util";
import * as components from "./components";

import * as mp from "./api/minipopover";
import * as notifications from "./api/notifications";
import * as modals from "./api/modals";
import * as menus from "./api/menu";
import * as storage from "./api/storage";

import * as webpack from "./webpack";
import * as popoutWindows from "./api/window";

import { getPlugin, plugins } from "./plugins";

import { waitForNode } from "common/dom";

import { _addHomeButton, _settingButtonOnClickWrapper } from "./dashboard/patches";

import { Editor } from "./editor";
import { Injector } from "./patcher";
import { api } from "./webpack/api";

import * as self from "self";

import { Styler } from "@styler";

export const VX = {
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
  Styler,
  _self: {
    plugins,
    getPlugin,
    _onWebpackModule: webpack._onWebpackModule,
    waitForNode,
    _addHomeButton,
    _settingButtonOnClickWrapper,
    getSrc(getSrc: (...args: any[]) => string) {
      return (...args: any[]) => {
        const url = getSrc.call(this, args);
        if (url.startsWith("blob:")) return url.split("?").at(0);
        if (url.startsWith("data:")) return url.split("?").at(0);
        return url;
      }
    }
  },
  self
};