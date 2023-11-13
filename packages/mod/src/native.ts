import { IS_DESKTOP, git } from "self";

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

export const net = {
  async fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    if (!IS_DESKTOP) return window.VXExtension!.fetch(input, init);

    if (typeof input === "string") input = new URL(input, window.location.href);
    if (input instanceof URL) input = new Request(input, init);

    const controller = window.VXNative!.util.AbortController();

    if (input.signal.aborted) controller.abort(input.signal.reason);
    else input.signal.addEventListener("abort", () => controller.abort((input as Request).signal.reason));

    try {
      const [ data, headers, code, message ] = await window.VXNative!.net.fetch({
        headers: Object.fromEntries(input.headers),
        method: input.method,
        body: input.body,
        url: input.url,
        controller
      });

      const codeIndicatesRedirect = 300 <= code && 400 > code;      

      if (codeIndicatesRedirect) {
        const redirectHeader = headers.find(([ header ]) => /location/i.test(header));

        if (codeIndicatesRedirect && input.redirect === "follow" && redirectHeader) {            
          const [, location ] = redirectHeader;

          const clonedInput = new Request(input, init);
          Object.defineProperty(clonedInput, "url", { value: location });
  
          const response = await net.fetch(clonedInput, init);

          Object.defineProperty(response, "redirected", {
            value: true,
            enumerable: true
          });
          Object.defineProperty(Object.getPrototypeOf(response), "redirected", { get: () => true });

          return response;
        };
        if (input.redirect === "error") {
          throw new DOMException("Response redirected");
        };
      };
  
      const response = new Response(data, {
        headers,
        status: code,
        statusText: message
      });

      const url = input.url;

      Object.defineProperty(Object.getPrototypeOf(response), "url", {
        get() { return url }
      });
      Object.defineProperty(response, "url", {
        value: url,
        enumerable: true
      });

      return response;
    } 
    catch (error) {
      throw new DOMException(error as string);
    }
  }
};

export const updater = {
  async getLatestRelease() {
    if (!git.exists) throw new Error("No Git Details Exist");

    const endpoint = `https://api.github.com/repos/${git.url.split("/").slice(-2).join("/")}/releases/latest`;

    const response = await net.fetch(endpoint, { cache: "no-cache" });
    const release = await response.json() as Git.Release;

    return release;
  },
  update(release: Git.Release) {
    if (!IS_DESKTOP) {
      window.VXExtension!.update(release);
      return;
    };

    window.VXNative!.updater.update(release);
  }
};