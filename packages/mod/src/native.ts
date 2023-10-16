export const didNativeExist = typeof window.VXNative === "object";

export const updater = {
  update() {
    if (!window.VXNative) return;
    window.VXNative.updater.update();
  }
};

export const extensions = {
  open() {
    if (!window.VXNative) return;
    window.VXNative.extensions.open();
  }
};

export const themes = {
  open() {
    if (!window.VXNative) return;
    window.VXNative.themes.open();
  },
  getAll(): Promise<Record<string, string>> {
    if (!window.VXNative) return Promise.resolve({});
    return window.VXNative.themes.getAll();
  },
  delete(filename: string) {
    if (!window.VXNative) return Promise.resolve();
    return window.VXNative.themes.delete(filename);
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