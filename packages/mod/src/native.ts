export const updater = {
  update() {
    if (!window.VXNative) return;
    window.VXNative.updater.update();
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