import React from "react";

import * as util from "./util";
import * as components from "./components";

import * as mp from "./api/minipopover";
import * as notifications from "./api/notifications";
import * as modals from "./api/modals";
import * as menus from "./api/menu";
import * as storage from "./api/storage";

import * as webpack from "@webpack";
import * as popoutWindows from "./api/window";

import { getPlugin, plugins } from "./plugins";

import { waitForNode } from "common/dom";

import { _addHomeButton, _settingButtonOnClickWrapper } from "./dashboard/patches";

import { Editor } from "./editor";
import { Injector } from "./patcher";
import { api } from "@webpack/api";

import * as self from "vx:self";

import { Styler } from "vx:styler";
import * as I18n from "vx:i18n";
import { themeStore } from "./addons/themes";
import { pluginStore } from "./addons/plugins";

import * as hooks from "./hooks";

class AddonApi {
  constructor(store: typeof themeStore | typeof pluginStore) {
    this.#store = store;
    this.getAll = this.getAll.bind(this);
    this.isEnabled = this.isEnabled.bind(this);
    this.has = this.has.bind(this);
    this.toggle = this.toggle.bind(this);
    this.enable = this.enable.bind(this);
    this.disable = this.disable.bind(this);
    this.getName = this.getName.bind(this);
  }
  #store: typeof themeStore | typeof pluginStore;
  getAll() {
    return this.#store.keys();
  };
  isEnabled(id: string) {
    if (!this.has(id)) return false;

    return this.#store.isEnabled(id);
  };
  has(id: string) {
    return this.#store.keys().includes(id);
  };
  toggle(id: string) {
    if (!this.has(id)) return false;

    this.#store.toggle(id);
    return this.#store.isEnabled(id);
  };
  enable(id: string) {
    if (!this.has(id)) return false;

    if (this.#store.isEnabled(id)) return false;
    this.#store.enable(id);
    return true;
  };
  disable(id: string) {
    if (!this.has(id)) return false;

    if (!this.#store.isEnabled(id)) return false;
    this.#store.disable(id);
    return true;
  };
  getName(id: string) {
    if (!this.has(id)) return null;

    return this.#store.getName(id);
  }
};

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
  themes: { ...new AddonApi(themeStore) },
  plugins: { ...new AddonApi(pluginStore) },
  hooks,
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
  self,
  I18n: {
    Messages: I18n.Messages,
    onLocaleChange: I18n.onLocaleChange,
    getLocale: I18n.getLocale,
    getLoadPromise: I18n.getLoadPromise
  }
};