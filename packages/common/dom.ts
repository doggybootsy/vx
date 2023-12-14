interface waitForNodeOptions {
  target?: Element | Document,
  signal?: AbortSignal
};

export function waitForNode<T extends Element>(query: string, options: waitForNodeOptions = {}): Promise<T> {
  const { target = document, signal } = options;

  const exists = target.querySelector<T>(query);
  if (exists) return Promise.resolve(exists);

  return new Promise<T>((resolve, reject) => {
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const addedNode of mutation.addedNodes) {
          if (!(addedNode instanceof Element)) continue;

          if (addedNode.matches(query)) {
            resolve(addedNode as T);
  
            observer.disconnect();
            return;
          };
  
          const element = addedNode.querySelector<T>(query);
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

interface waitForElementRemovedOptions {
  target?: Node,
  signal?: AbortSignal
};

export function waitForElementRemoved(element: Node, options: waitForElementRemovedOptions = {}) {
  const { target = element.ownerDocument ?? document, signal } = options;

  return new Promise<void>((resolve, reject) => {
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const removedNode of mutation.removedNodes) {
          if (!removedNode.contains(element)) continue;
  
          observer.disconnect();
          resolve();
        };
      };
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
    };
  });
};
