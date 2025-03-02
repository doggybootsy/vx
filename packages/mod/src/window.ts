import React from "react";
import ReactDOM from "react-dom";

import * as util from "./util";
import * as components from "./components";

import * as mp from "./api/minipopover";
import * as notifications from "./api/notifications";
import * as modals from "./api/modals";
import * as menus from "./api/menu";
import * as storage from "./api/storage";

import * as webpack from "@webpack";
import * as popoutWindows from "./api/window";

import { waitForNode } from "common/dom";

import { Editor } from "./editor";
import { Injector } from "./patcher";
import { api } from "@webpack/api";

import * as self from "vx:self";

import { Styler } from "vx:styler";
import { Logger } from "vx:logger";
import * as I18n from "vx:i18n";
import { themeStore } from "./addons/themes";
import { pluginStore } from "./addons/plugins";

import * as hooks from "./hooks";
import * as intl from "./intl";

import * as commands from "./api/commands";

class AddonApi {
  #store: typeof themeStore | typeof pluginStore;
  constructor(store: typeof themeStore | typeof pluginStore) {    
    this.getAll = this.getAll.bind(this);
    this.isEnabled = this.isEnabled.bind(this);
    this.has = this.has.bind(this);
    this.toggle = this.toggle.bind(this);
    this.enable = this.enable.bind(this);
    this.disable = this.disable.bind(this);
    this.getName = this.getName.bind(this);

    this.#store = store;
  }

  getAll() {
    return this.#store.keys();
  }
  isEnabled(id: string) {
    if (!this.has(id)) return false;

    return this.#store.isEnabled(id);
  }
  has(id: string) {
    return this.#store.keys().includes(id);
  }
  toggle(id: string) {
    if (!this.has(id)) return false;

    this.#store.toggle(id);
    return this.#store.isEnabled(id);
  }
  enable(id: string) {
    if (!this.has(id)) return false;

    if (this.#store.isEnabled(id)) return false;
    this.#store.enable(id);
    return true;
  }
  disable(id: string) {
    if (!this.has(id)) return false;

    if (!this.#store.isEnabled(id)) return false;
    this.#store.disable(id);
    return true;
  }
  getName(id: string) {
    if (!this.has(id)) return null;

    return this.#store.getAddonName(id);
  }
}

const encryption = {
  encrypt(string: string) {
    if (encryption.isSecure()) return window.VXNative!.safestorage.encrypt(string);
    return util.base64.encode(string);
  },
  decrypt(string: string) {
    if (encryption.isSecure()) return window.VXNative!.safestorage.decrypt(string);
    return util.base64.decode(string);
  },
  isSecure() {
    return self.IS_DESKTOP && window.VXNative!.safestorage.isAvailable();
  }
}

export function vxRequire(path: string) {
  if (webpack.webpackRequire && path in webpack.webpackRequire.m) return webpack.webpackRequire(path);
  
  switch (path) {
    case "vx:i18n": return require("vx:i18n");
    case "vx:logger": return require("vx:logger");
    case "vx:styler": return require("vx:styler");
    case "vx:self": return require("vx:self");
    
    case "vx:webpack": return require("@webpack");
    case "vx:webpack/api": return require("@webpack/api");
    case "vx:webpack/common": return require("@webpack/common");
    case "vx:webpack/filters": return require("@webpack/filters");
    case "vx:webpack/lazy": return require("@webpack/lazy");
    case "vx:webpack/patches": return require("@webpack/patches");
    case "vx:webpack/searching": return require("@webpack/searching");
    case "vx:webpack/shared": return require("@webpack/shared");
    case "vx:webpack/stores": return require("@webpack/stores");
    case "vx:webpack/util": return require("@webpack/util");
    case "vx:webpack/webpack": return require("@webpack/webpack");

    case "console":
    case "node:console": return console;

    case "vx:uncompress":
    case "uncompress.js": return require("vx:uncompress");

    case "jszip": return require("jszip");

    case "react": return React;

    case "react-dom": 
    case "react-dom/client": return ReactDOM;

    case "moment": return api.common.moment;
    case "highlight.js": return require("highlight.js");

    case "vx:common": return { dom: require("common/dom"), util: require("common/util") };
    case "vx:common/dom": return require("common/dom");
    case "vx:common/util": return require("common/util");

    case "commonmark": return require("commonmark");
    case "@intrnl/xxhash64": return require("@intrnl/xxhash64");

    case "vx": return window.VX;
  
    // vxi === vx internal
    case "vxi:native": return require("./native");
    case "vxi:plugins": return require("vx:plugins");
    case "vxi:plugins/require": return require("vx:plugins/require");
    case "vxi:plugins/settings": return require("vx:plugins/settings");

    default: {
      // if (webpack.webpackRequire) {
      //   if (path in webpack.webpackRequire.m) return webpack.webpackRequire(path);
      // }
      
      return require(path);
    }
  }
}

const internal = Symbol("vx.internal.self");

__self__.getSrc =function(this: any, getSrc: (...args: any[]) => string) {
  return (...args: any[]) => {
    const url = getSrc.apply(this, args);        
    if (url.startsWith("blob:")) return url.split("?").at(0);
    if (url.startsWith("data:")) return url.split("?").at(0);
    return url;
  }
};

export const VX = () => {
  const vx = {
    webpack: api,
    menus,
    notifications,
    minipopover: mp,
    React,
    util,
    components,
    intl,
    commands: {
      add: commands.addCommand,
      remove: commands.removeCommand,
      has: commands.hasCommand
    },
    storage: {
      DataStore: storage.DataStore,
      create<T extends Record<string, any> = Record<string, any>>(name: string, opts: storage.DataStoreOptions<T> = {}): storage.DataStore<T> {
        return new storage.DataStore<T>(name, opts);
      }
    },
    modals,
    windows: popoutWindows,
    Editor,
    Injector,
    Styler,
    Logger,
    themes: { ...new AddonApi(themeStore) },
    plugins: { ...new AddonApi(pluginStore) },
    hooks,
    require: vxRequire,
    encryption,
    self,
    i18n: {
      Messages: I18n.Messages,
      onLocaleChange: I18n.onLocaleChange,
      getLocale: I18n.getLocale,
      getLoadPromise: I18n.getLoadPromise,
      FormattedMessage: I18n.FormattedMessage
    },
    request,
    jsx: __jsx__
  };

  Object.defineProperty(vx, internal, { value: __self__ });
  Object.defineProperty(vx, "internal", { value: internal });

  return vx;
};
