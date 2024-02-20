import { IS_DESKTOP, git } from "vx:self";

export const extensions = {
  open() {
    if (!IS_DESKTOP) return;
    window.VXNative!.extensions.open();
  },
  getAll() {
    if (!IS_DESKTOP) return [];
    return window.VXNative!.extensions.getAll();
  },
  downloadRDT() {
    if (!IS_DESKTOP) return;
    window.VXNative!.extensions.downloadRDT();
  }
};

export const app = {
  quit() {
    if (!IS_DESKTOP) return;
    window.VXNative!.app.quit();
  },
  restart() {
    if (!IS_DESKTOP) return location.reload();
    window.VXNative!.app.restart();
  }
};

export const updater = {
  async getLatestRelease(): Promise<Git.Release> {
    if (!git.exists) throw new Error("No Git Details Exist");

    const endpoint = `https://api.github.com/repos/${git.url.split("/").slice(-2).join("/")}/releases/latest`;

    const response = await window.fetch(endpoint, { cache: "no-cache" });

    return await response.json();
  },
  update(release: Git.Release) {
    if (!IS_DESKTOP) {
      window.VXExtension!.update(release);
      return;
    }

    window.VXNative!.updater.update(release);
  }
};

export const transparency = {
  set(state: boolean) {
    if (!IS_DESKTOP) return;
    return window.VXNative!.transparency.set(state);
  },
  get() {
    if (!IS_DESKTOP) return false;
    return window.VXNative!.transparency.get();
  }
}