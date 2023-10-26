export const IS_DESKTOP = typeof window.VXNative === "object";

export const extensions = {
  open() {
    if (!window.VXNative) return;
    window.VXNative.extensions.open();
  }
};

export const app = {
  quit() {
    if (!window.VXNative) return window.close();
    window.VXNative.app.quit();
  },
  restart() {
    if (!window.VXNative) return location.reload();
    window.VXNative.app.restart();
  }
};