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
  async fetch(input: RequestInfo | URL, init?: RequestInit) {
    // Im gonna make the VX extension replace window.fetch or something idk
    if (!window.VXNative) return window.fetch(input, init);

    if (typeof input === "string") input = new URL(input, window.location.href);
    if (input instanceof URL) input = new Request(input, init);

    const controller = window.VXNative.util.AbortController();

    try {
      const [ data, headers, code, message ] = await window.VXNative.net.fetch({
        headers: Object.fromEntries(input.headers),
        method: input.method,
        body: input.body,
        url: input.url,
        controller
      });
  
      if (input.signal.aborted) controller.abort(input.signal.reason);
      else input.signal.addEventListener("abort", () => controller.abort((input as Request).signal.reason));
  
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