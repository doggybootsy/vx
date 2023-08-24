import globalObject from "renderer/global";
import pluginManager from "renderer/addons/plugins";
import themeManager from "renderer/addons/themes";

import "renderer/styles";
import "renderer/dashboard";
import "renderer/notifications";
import "renderer/commands";
import "renderer/link";
import webpack from "renderer/webpack";
import { logger } from "renderer/logger";
import { whenDocumentReady } from "renderer/util";

whenDocumentReady(() => {
  document.body.classList.add("vx");
});

window.VX = globalObject;

pluginManager.initialize();
themeManager.initialize();

webpack.whenReady(() => {
  const vxURL = new URL(location.href).searchParams.get("vx-url");  
  if (vxURL) webpack.common.navigation!.transitionTo(vxURL);
});

logger.log(VXEnvironment.VERSION, "Loading...");
