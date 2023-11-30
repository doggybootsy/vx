import { IS_DESKTOP, git } from "self";

export const extensions = {
  open() {
    if (!window.VXNative) return;
    window.VXNative.extensions.open();
  }
};

export const app = {
  quit() {
    if (!window.VXNative) return;
    window.VXNative.app.quit();
  },
  restart() {
    if (!window.VXNative) return location.reload();
    window.VXNative.app.restart();
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
    };

    window.VXNative!.updater.update(release);
  }
};