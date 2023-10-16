interface waitForNodeOptions {
  target?: Element | Document,
  signal?: AbortSignal
};

export function waitForNode(query: string, options: waitForNodeOptions = {}): Promise<Element> {
  const { target = document, signal } = options;

  const exists = target.querySelector(query);
  if (exists) return Promise.resolve(exists);

  return new Promise<Element>((resolve, reject) => {
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const addedNode of mutation.addedNodes) {
          if (!(addedNode instanceof Element)) continue;

          if (addedNode.matches(query)) {
            resolve(addedNode);
  
            observer.disconnect();
            return;
          };
  
          const element = addedNode.querySelector(query);
          if (element) {
            resolve(element);

            observer.disconnect();
          };
        }
      }
    });
  
    observer.observe(target, {
      subtree: true,
      childList: true
    });

    if (signal) {
      signal.addEventListener("abort", () => {
        reject(new DOMException("The user aborted a request"));

        observer.disconnect();
      });
    }
  });
};
