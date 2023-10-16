import electron from "electron";

const native = {
  updater: {
    update() {
      electron.ipcRenderer.emit("@vx/update");
    },
    on(event: "update-ready", listener: () => {}) {
      electron.ipcRenderer.on(`@vx/${event}`, listener);
    },
    off(event: "update-ready", listener: () => {}) {
      electron.ipcRenderer.off(`@vx/${event}`, listener);
    }
  },
  app: {
    quit() {
      electron.ipcRenderer.send("@vx/quit");
    },
    restart() {
      electron.ipcRenderer.send("@vx/restart");
    }
  },
  clipboard: {
    copy(text: string) {
      electron.clipboard.writeText(text);
    }
  }
};

electron.contextBridge.exposeInMainWorld("VXNative", native);
window.VXNative = native;

export type NativeObject = typeof native;