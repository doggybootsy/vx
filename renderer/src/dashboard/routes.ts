import { Plugin } from "renderer/addons/plugins";

export const routes = [
  "/vx",
  "/vx/plugins",
  "/vx/plugins/:id",
  "/vx/themes",
  "/vx/settings",
  "/vx/store"
];

export function createPluginRoute(plugin: Plugin): string
export function createPluginRoute(pluginId: string): string
export function createPluginRoute(pluginOrPluginId: Plugin | string) {
  if (pluginOrPluginId instanceof Plugin) pluginOrPluginId = pluginOrPluginId.id;

  return `/vx/plugins/${pluginOrPluginId}`;
};

export function getPluginId() {
  const match = location.pathname.match(/\/vx\/plugins\/(.+)/);
  if (!match) return null;
  return match.at(1)!;
};