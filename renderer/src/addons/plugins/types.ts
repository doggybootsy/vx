export interface DisplayInfo {
  name?: string,
  description?: string,
  author?: string
};

export interface PluginExports {
  // IDK if this is staying I want themes to have it too
  getDisplayInfo?(locale: string): DisplayInfo,
  Settings?(): React.ReactNode;
  start?(): void;
  stop?(): void;
};

export interface DefaultPluginExports extends PluginExports {
  __esModule: true,
  default?: PluginExports
}

export interface PluginModule {
  exports: DefaultPluginExports | PluginExports;
  meta: import("common").AddonMeta;
  id: string;
  loaded: boolean;
  enabled: boolean;
};
