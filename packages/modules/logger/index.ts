import { IS_DESKTOP, env } from "vx:self";

const cache = new Map<string, Logger>();

interface LoggerOptions {
  showIcon?: boolean,
  debug?: boolean,
  nameStyling?: string,
  joiner?: string,
  forceNode?: boolean
}

function createLogArguments(logger: Logger, type: string, color: [ number, number, number ], icon: string) {
  if (!logger.useWebLogger()) return [
    `\x1b[48;2${color.map((color) => `;${color}`)}m\x1b[30m${type}\x1b[0m \x1b[34m[${logger.name}]:`
  ];

  if (!logger.options.showIcon) return [
    `%c[${type[0]}]%c %c[${logger.name}]:`,
    `${IS_DESKTOP ? "margin-left: -21px;" : ""}color: rgb(${color.join(", ")}); font-weight: bold;`,
    IS_DESKTOP ? "margin-left: -5px;" : "",
    logger.options.nameStyling
  ];

  return [
    `%c${type[0]}%c %c[${logger.name}]:`, 
    `${IS_DESKTOP ? "margin-left: -19px;" : ""}background-image: url(${JSON.stringify(icon)});background-repeat:no-repeat;padding:1px 5px;color:transparent`,
    IS_DESKTOP ? "margin-left: -4px;" : "",
    logger.options.nameStyling
  ];
}

export class Logger {
  constructor(public readonly name: string, options: LoggerOptions = {}) {
    if (typeof name !== "string") throw new TypeError(`Argument 'name' must be type 'string' not type '${typeof name}'!`);

    if (cache.has(name)) return cache.get(name)!;

    options.debug ??= false;
    options.showIcon ??= true;
    options.nameStyling ??= "color: #2774f0; font-weight: bold;";
    options.joiner ??= "~";
    options.forceNode ??= false;

    cache.set(name, this);

    this.options = options as Required<LoggerOptions>;
  }

  public readonly options!: Required<LoggerOptions>;

  public useWebLogger() {
    if (this.options.forceNode) return false;
    if ("ServiceWorkerGlobalScope" in globalThis) return true;
    return typeof document === "object" && typeof document.createElement === "function" && typeof HTMLElement === "function" && document.createElement("div") instanceof HTMLElement;
  }

  public log(...data: any[]) {
    console.log(
      ...createLogArguments(
        this, 
        "log",
        [ 0, 168, 252 ],
        "data:image/svg+xml;base64,PHN2ZyBhcmlhLWhpZGRlbj0ndHJ1ZScgcm9sZT0naW1nJyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPScxNicgaGVpZ2h0PScxNicgZmlsbD0nbm9uZScgdmlld0JveD0nMCAwIDI0IDI0Jz48Y2lyY2xlIGN4PScxMicgY3k9JzEyJyByPScxMCcgZmlsbD0ndHJhbnNwYXJlbnQnIGNsYXNzPScnPjwvY2lyY2xlPjxwYXRoIGZpbGw9J3JnYigwLCAxNjgsIDI1MiknIGZpbGwtcnVsZT0nZXZlbm9kZCcgZD0nTTIzIDEyYTExIDExIDAgMSAxLTIyIDAgMTEgMTEgMCAwIDEgMjIgMFptLTkuNS00Ljc1YTEuMjUgMS4yNSAwIDEgMS0yLjUgMCAxLjI1IDEuMjUgMCAwIDEgMi41IDBabS0uNzcgMy45NmExIDEgMCAxIDAtMS45Ni0uNDJsLTEuMDQgNC44NmEyLjc3IDIuNzcgMCAwIDAgNC4zMSAyLjgzbC4yNC0uMTdhMSAxIDAgMSAwLTEuMTYtMS42MmwtLjI0LjE3YS43Ny43NyAwIDAgMS0xLjItLjc5bDEuMDUtNC44NlonIGNsaXAtcnVsZT0nZXZlbm9kZCcgY2xhc3M9Jyc+PC9wYXRoPjwvc3ZnPg=="
      ),
      ...data
    );
  }
  public error(...data: any[]) {
    console.log(
      ...createLogArguments(
        this, 
        "error",
        [ 242, 63, 66 ],
        "data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPScxNicgaGVpZ2h0PScxNicgZmlsbD0ncmdiKDI0MiwgNjMsIDY2KScgY2xhc3M9J2JpIGJpLWV4Y2xhbWF0aW9uLW9jdGFnb24tZmlsbCcgdmlld0JveD0nMCAwIDE2IDE2Jz48cGF0aCBkPSdNMTEuNDYuMTQ2QS41LjUgMCAwIDAgMTEuMTA3IDBINC44OTNhLjUuNSAwIDAgMC0uMzUzLjE0NkwuMTQ2IDQuNTRBLjUuNSAwIDAgMCAwIDQuODkzdjYuMjE0YS41LjUgMCAwIDAgLjE0Ni4zNTNsNC4zOTQgNC4zOTRhLjUuNSAwIDAgMCAuMzUzLjE0Nmg2LjIxNGEuNS41IDAgMCAwIC4zNTMtLjE0Nmw0LjM5NC00LjM5NGEuNS41IDAgMCAwIC4xNDYtLjM1M1Y0Ljg5M2EuNS41IDAgMCAwLS4xNDYtLjM1M3pNOCA0Yy41MzUgMCAuOTU0LjQ2Mi45Ljk5NWwtLjM1IDMuNTA3YS41NTIuNTUyIDAgMCAxLTEuMSAwTDcuMSA0Ljk5NUEuOTA1LjkwNSAwIDAgMSA4IDRtLjAwMiA2YTEgMSAwIDEgMSAwIDIgMSAxIDAgMCAxIDAtMicvPjwvc3ZnPg=="
      ),
      ...data
    );
  }
  public warn(...data: any[]) {
    console.log(
      ...createLogArguments(
        this,
        "warn", 
        [ 240, 177, 50 ],
        "data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPScxNicgaGVpZ2h0PScxNicgZmlsbD0ncmdiKDI0MCwgMTc3LCA1MCknIGNsYXNzPSdiaSBiaS1leGNsYW1hdGlvbi10cmlhbmdsZS1maWxsJyB2aWV3Qm94PScwIDAgMTYgMTYnPjxwYXRoIGQ9J004Ljk4MiAxLjU2NmExLjEzIDEuMTMgMCAwIDAtMS45NiAwTC4xNjUgMTMuMjMzYy0uNDU3Ljc3OC4wOTEgMS43NjcuOTggMS43NjdoMTMuNzEzYy44ODkgMCAxLjQzOC0uOTkuOTgtMS43Njd6TTggNWMuNTM1IDAgLjk1NC40NjIuOS45OTVsLS4zNSAzLjUwN2EuNTUyLjU1MiAwIDAgMS0xLjEgMEw3LjEgNS45OTVBLjkwNS45MDUgMCAwIDEgOCA1bS4wMDIgNmExIDEgMCAxIDEgMCAyIDEgMSAwIDAgMSAwLTInLz48L3N2Zz4="
      ),
      ...data
    );
  }
  public debug(...data: any[]) {
    if (!this.options.debug) return;

    console.log(
      ...createLogArguments(
        this, 
        "debug", 
        [ 88, 101, 242 ],
        "data:image/svg+xml;base64,PHN2ZyBhcmlhLWhpZGRlbj0ndHJ1ZScgcm9sZT0naW1nJyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPScxNicgaGVpZ2h0PScxNicgZmlsbD0nbm9uZScgdmlld0JveD0nMCAwIDI0IDI0Jz48cGF0aCBmaWxsPSdyZ2IoODgsIDEwMSwgMjQyKScgZD0nTTkuNTQgMy4yOGEzIDMgMCAwIDAtLjM3Ljc0Yy0uMTkuNTIuMjguOTguODMuOThoNGMuNTUgMCAxLjAyLS40Ni44My0uOThhMi45NiAyLjk2IDAgMCAwLS4zNy0uNzRjLjIzLS4xNi41Ni0uMjguOTktLjI4YTEgMSAwIDEgMCAwLTJjLTEgMC0yLjAxLjQtMi42OCAxLjFhMyAzIDAgMCAwLTEuNTQgMEEzLjc2IDMuNzYgMCAwIDAgOC41NSAxYTEgMSAwIDAgMCAwIDJjLjQzIDAgLjc2LjEyIDEgLjI4Wk0xOC4wMSAxOC44NWMtLjA0LjEtLjAzLjIyLjA1LjNsMS41MSAxLjVhMSAxIDAgMCAxLTEuNDEgMS40MmwtMS4xOC0xLjE4YS4yNi4yNiAwIDAgMC0uMzcgMCA2LjcgNi43IDAgMCAxLTIuOCAxLjgyYy0uNDIuMTQtLjgzLS4yLS44Ni0uNjRsLS40Mi04LjU3YS41My41MyAwIDAgMC0xLjA1IDBsLS40MyA4LjU3Yy0uMDMuNDUtLjQ0Ljc4LS44Ny42NEE2LjcgNi43IDAgMCAxIDcuNCAyMC45YS4yNi4yNiAwIDAgMC0uMzctLjAxbC0xLjE4IDEuMThhMSAxIDAgMCAxLTEuNDEtMS40MWwxLjUxLTEuNTFjLjA4LS4wOC4xLS4yLjA1LS4zLS40Ny0uOTQtLjc4LTItLjkyLTMuMTJhLjI1LjI1IDAgMCAwLS4yNS0uMjNIM2ExIDEgMCAxIDEgMC0yaDEuODJjLjEzIDAgLjI0LS4xLjI1LS4yMy4xNC0xLjEzLjQ1LTIuMTguOTItMy4xMmEuMjUuMjUgMCAwIDAtLjA1LS4zbC0xLjUxLTEuNWExIDEgMCAxIDEgMS40MS0xLjQyTDcuMDIgOC4xYy4xLjEuMjcuMS4zNyAwYTYuNjYgNi42NiAwIDAgMSAyLjk1LTEuODdjLjM4LS4xMS43NS4xNC44NS41MmwuNTcgMi4yN2MuMDYuMjUuNDIuMjUuNDggMGwuNTctMi4yN2MuMS0uMzguNDctLjYzLjg1LS41MiAxLjEuMzMgMi4xMS45OCAyLjk1IDEuODYuMS4xLjI2LjExLjM3LjAxbDEuMTgtMS4xOGExIDEgMCAxIDEgMS40MSAxLjQxbC0xLjUxIDEuNTFjLS4wOC4wOC0uMS4yLS4wNS4zLjQ3Ljk0Ljc4IDIgLjkyIDMuMTIuMDEuMTMuMTIuMjMuMjUuMjNIMjFhMSAxIDAgMSAxIDAgMmgtMS44MmMtLjEzIDAtLjI0LjEtLjI1LjIzYTkuNjggOS42OCAwIDAgMS0uOTIgMy4xMlonIGNsYXNzPScnPjwvcGF0aD48L3N2Zz4="
      ),
      ...data
    );
  }

  public createChild(...names: string[]) {
    return new Logger([ this.name, ...names ].join(this.options.joiner), this.options);
  }
}

export const logger = new Logger("VX", { debug: env.IS_DEV });
