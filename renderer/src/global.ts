import webpack, { filters } from "renderer/webpack";
import native from "renderer/native";
import * as patcher from "renderer/patcher";
import pluginManager from "renderer/addons/plugins";
import themeManager from "renderer/addons/themes";
import * as styles from "renderer/styles";
import * as storage from "renderer/storage";
import * as windowOpener from "renderer/window";
import { closeNotification, openNotification, Notification } from "renderer/notifications";
import * as contextMenus from "renderer/menus";
import VXError from "renderer/error";
import * as modals from "renderer/modal";
import * as commands from "renderer/commands";
import * as util from "renderer/util";
import MarkDownParser from "./ui/markdown";
import { useStateFromStores } from "renderer/hooks";
import * as components from "renderer/components";
import { Logger } from "renderer/logger";
import { fetch } from "renderer/request";
import { CHANGE_SYMBOL } from "renderer/store";

const VX = {
  client: {
    platform: native.platform,
    quit(restart: boolean = false): void {
      native.quit(restart);
    },
    version: VXEnvironment.VERSION,
    fetch
  },
  webpack: {
    getModule: webpack.getModule,
    getAllModules: webpack.getAllModules,
    getLazy: webpack.getLazy,
    whenReady: webpack.whenReady,
    getStore: webpack.getStore,
    getModuleAndKey: webpack.getModuleAndKey,
    getLazyAndKey: webpack.getLazyAndKey,
    common: webpack.common,
    get require() { return webpack.require; },
    get isReady() { return webpack.isReady; },
    filters: filters
  },
  patcher: {
    after: patcher.after,
    instead: patcher.instead,
    before: patcher.before,
    unpatchAll: patcher.unpatchAll,
    create: patcher.create
  },
  storage: {
    use: storage.useItem,
    get: storage.getItem,
    set: storage.setItem,
    delete: storage.deleteItem,
    create: storage.create,
    getAll: storage.getData
  },
  styles: {
    add: styles.addStyle,
    remove: styles.removeStyle,
    create: styles.create
  },
  plugins: {
    [CHANGE_SYMBOL]: pluginManager[CHANGE_SYMBOL],

    get: pluginManager.get.bind(pluginManager),
    getAll: pluginManager.getAll.bind(pluginManager),
    enable: pluginManager.enable.bind(pluginManager),
    disable: pluginManager.disable.bind(pluginManager),
    toggle: pluginManager.toggle.bind(pluginManager),
    reload: pluginManager.reload.bind(pluginManager),
    isEnabled: pluginManager.isEnabled.bind(pluginManager)
  },
  themes: {
    [CHANGE_SYMBOL]: themeManager[CHANGE_SYMBOL],

    get: themeManager.get.bind(themeManager),
    getAll: themeManager.getAll.bind(themeManager),
    enable: themeManager.enable.bind(themeManager),
    disable: themeManager.disable.bind(themeManager),
    toggle: themeManager.toggle.bind(themeManager),
    reload: themeManager.reload.bind(themeManager),
    isEnabled: themeManager.isEnabled.bind(themeManager)
  },
  modals: { 
    open: modals.openModal, 
    close: modals.closeModal,
    closeAll: modals.closeAll,
    openConfirmModal: modals.openConfirmModal,
    openPromptModal: modals.openPromptModal,
    openImageModal: modals.openImageModal,
    openAlertModal: modals.openAlertModal,
    hasModalOpen: modals.hasModalOpen,
    components: modals.components
  },
  notification: { 
    open(opts: Notification) {
      return openNotification(opts);
    }, 
    close(id: string) {
      closeNotification(id);
    } 
  },
  contextMenu: {
    open: contextMenus.openMenu,
    close: contextMenus.closeMenu,
    patch: contextMenus.patch,
    unpatchAll: contextMenus.unpatchAll,
    components: contextMenus.components
  },
  commands: {
    add: commands.addCommand, 
    remove: commands.removeCommand
  },
  window: {
    open(id: string, title: string, component: ({ window }: { window: Omit<Window, "VX" | "VXNative"> }) => React.ReactNode) {
      return windowOpener.openWindow({ id, title, render: component });
    }, 
    close(id: string) {
      windowOpener.closeWindow(id);
    }
  },
  VXError: VXError,
  util: util,
  components: {
    MarkDownParser,
    useStateFromStores,
    ...components
  },
  Logger,

  get React() { return webpack.common.React; }
};

export default VX;
