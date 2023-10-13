import { FluxDispatcher } from "discord-types/other";
import { getLazyByKeys } from "./filters";

export * from "./filters";
export * from "./webpack";
export * from "./searching";
export * from "./util";
export * from "./stores";
export * from "./lazy";

let resolve = () => {};
const webpackReadyPromise = new Promise<void>((r) => resolve = r);
export function whenWebpackReady() {
  return webpackReadyPromise;
};
export let webpackReady = false;

getLazyByKeys<FluxDispatcher>([ "subscribe", "dispatch" ]).then((FluxDispatcher) => {
  function listener() {
    webpackReady = true;
    
    resolve();
    FluxDispatcher.unsubscribe("CONNECTION_OPEN", listener);
  };

  FluxDispatcher.subscribe("CONNECTION_OPEN", listener);
});