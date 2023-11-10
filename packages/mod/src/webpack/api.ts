import { getProxyStore, getStore, webpackReady, whenWebpackReady } from ".";
import { byKeys, byProtoKeys, byRegex, bySource, byStrings, combine, getByKeys, getByProtoKeys, getByRegex, getByStrings, getLazyByKeys, getLazyByProtoKeys, getLazyByRegex, getLazyByStrings, getProxyByKeys, getProxyByProtoKeys, getProxyByRegex, getProxyByStrings, not } from "./filters";
import { getLazy } from "./lazy";
import { getBulk, getModule, getAllModules } from "./searching";
import { getProxy } from "./util";
import { webpackAppChunk, webpackRequire } from "./webpack";

import * as webpack from "./";
import * as common from "./common";

export const api = {
  getModule,
  getByStrings,
  getByRegex,
  getByKeys,
  getByProtoKeys,
  
  getProxy,
  getProxyByStrings,
  getProxyByRegex,
  getProxyByKeys,
  getProxyByProtoKeys,

  getLazy,
  getLazyByStrings,
  getLazyByRegex,
  getLazyByKeys,
  getLazyByProtoKeys,

  getStore,
  getProxyStore,
  getBulk,
  getAllModules,

  whenReady: whenWebpackReady,
  get require() { return webpackRequire },
  get ready() { return webpackReady },
  get appChunk() { return webpackAppChunk },

  filters: {
    bySource,
    byStrings,
    byRegex,
    byKeys,
    byProtoKeys,
    combine,
    not
  },

  common,

  __raw: webpack
};