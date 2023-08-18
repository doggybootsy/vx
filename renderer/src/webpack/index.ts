import { getModule, webpackRequire, getAllModules } from "renderer/webpack/searching";
import commonModules, { whenReady } from "renderer/webpack/commonModules";
import { getLazy } from "renderer/webpack/lazy";
import { Store } from "renderer/webpack/types";
import { getModuleAndKey, getLazyAndKey } from "renderer/webpack/key";

export { default as filters } from "renderer/webpack/filters";
export * from "renderer/webpack/types";

let Store: { getAll(): Store[] } | void;
function getStore(name: string) {
  if (!Store) Store = getModule<any>(m => m.getAll && m.initialized);
  if (!Store) return;

  const stores = Store.getAll();
  return stores.find((store) => store.getName() === name);
};

const webpack = {
  getLazy,
  getModule,
  get require() { return webpackRequire; },
  isReady: false,
  getAllModules,
  getStore,
  whenReady,
  getModuleAndKey, 
  getLazyAndKey,
  common: commonModules
};

whenReady(() => webpack.isReady = true);

export default webpack;