type TypedEventListenerOrEventListenerObject<E extends Event> = { handleEvent(event: E): void } | ((event: E) => void);

class TypedEventTarget<T extends Record<string, Event>> extends EventTarget {
  addEventListener<K extends keyof T>(type: K, callback: TypedEventListenerOrEventListenerObject<T[K]> | null, options?: boolean | AddEventListenerOptions | undefined): void {
    super.addEventListener(type as string, callback as EventListenerOrEventListenerObject, options);
  }
  removeEventListener<K extends keyof T>(type: K, callback: TypedEventListenerOrEventListenerObject<T[K]> | null, options?: boolean | EventListenerOptions | undefined): void {
    super.removeEventListener(type as string, callback as EventListenerOrEventListenerObject, options);
  }
}

export class VXMessageEvent<T> extends Event {
  constructor(type: string, data: T, eventInitDict?: EventInit | undefined) {
    super(type, eventInitDict);
    this.data = data;
  }
  data: T;
}

export const ipc = new TypedEventTarget<{
  "code-ready": VXMessageEvent<{ js: string, css: string }>
}>();