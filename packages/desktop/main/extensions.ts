import electron from "electron";
import path from "node:path";
import { existsSync, mkdirSync, readdirSync, statSync } from "node:fs";

export function loadExtensions() {
  const appData = electron.app.getPath("appData");
  const vxDir = path.join(appData, ".vx");
  const extensionsDir = path.join(vxDir, "extensions");

  if (!existsSync(vxDir)) mkdirSync(vxDir);
  if (!existsSync(extensionsDir)) mkdirSync(extensionsDir);

  const ids = readdirSync(extensionsDir);

  for (const id of ids) {
    const extensionPath = path.join(extensionsDir, id);

    const stats = statSync(extensionPath);

    if (!stats.isDirectory()) continue;

    electron.session.defaultSession.loadExtension(
      extensionPath,
      { allowFileAccess: true }
    ).then((extension) => {
      console.log(`Loaded extension ${extension.name} v${extension.version} (${id})`);
    });
  };
};