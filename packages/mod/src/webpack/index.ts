import { FluxDispatcher } from "discord-types/other";
import { getLazyByKeys } from "./filters";
import { destructuredPromise } from "../util";

export * from "./filters";
export * from "./webpack";
export * from "./searching";
export * from "./util";
export * from "./stores";
export * from "./lazy";
export * from "./patches";

const webpackReadyP = destructuredPromise();
export function whenWebpackReady() {
  return webpackReadyP.promise;
}
export let webpackReady = false;

getLazyByKeys<FluxDispatcher>([ "subscribe", "dispatch" ]).then((FluxDispatcher) => {
  function listener() {
    webpackReady = true;
    
    webpackReadyP.resolve();
    FluxDispatcher.unsubscribe("CONNECTION_OPEN", listener);
  }

  FluxDispatcher.subscribe("CONNECTION_OPEN", listener);
});
