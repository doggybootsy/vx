import { getModuleIdBySource, webpackRequire, getByKeys, getByProtoKeys } from "../webpack";

import { makeLazy, proxyCache } from "../util";
import ErrorBoundary from "./boundary";

const moduleIdRegex = /\(0,.{1,3}\.makeLazy\)\({createPromise:\(\)=>.{1,3}\..{1,3}\("(\d+?)"\).then\(.{1,3}.bind\(.{1,3},"\1"\)\),webpackId:"\1",name:"UserSettings"}\)/;

interface SettingsViewProps {
  sections: { section: string, [key: string]: any }[],
  section: string,
  onClose(): void,
  onSetSection(section: string): void
};

function getSettingsView() {
  const moduleId = getModuleIdBySource("CollectiblesShop", "GuildSettings", "UserSettings")!;

  const module = String(webpackRequire!.m[moduleId]!);

  const [, matchedId ] = module.match(moduleIdRegex)!;

  return makeLazy({
    name: "SettingsView",
    factory: async () => {
      await webpackRequire!.el(matchedId).then(webpackRequire!.bind(webpackRequire, matchedId));

      return getByProtoKeys<React.ComponentType<SettingsViewProps>>([ "renderSidebar" ])!;
    }
  });
};

const WrappedSettingsView = proxyCache(getSettingsView);

export function SettingsView(props: SettingsViewProps) {
  return (
    <ErrorBoundary>
      <WrappedSettingsView {...props} />
    </ErrorBoundary>
  )
};