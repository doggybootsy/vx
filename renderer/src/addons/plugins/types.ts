export interface PluginExports {
  Settings?: () => React.ReactNode;
  start?: () => void;
  stop?: () => void;
};

export interface DefaultPluginExports {
  __esModule: true,
  default: PluginExports
}

export interface PluginModule {
  exports: DefaultPluginExports | PluginExports;
  meta: import("common").AddonMeta;
  id: string;
  loaded: boolean;
  enabled: boolean;
};
