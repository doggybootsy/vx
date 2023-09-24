import console from "window:console";

export class Logger {
  static console = console;

  #name: string;

  constructor(name: string) {
    this.#name = name;
  }

  log(title: string, ...data: any[]) {
    console.log(`%c${this.#name}%c${title}`, "background-color: #39185A;padding:6px;border-radius:6px;font-size:large;margin-right:6px;", "background-color: #39185A;padding:4px 6px;border-radius:6px;", ...data);
  }
  warn(title: string, ...data: any[]) {
    console.warn(`%c${this.#name}%c${title}`, "background-color: #39185A;padding:6px;border-radius:6px;font-size:large;margin-right:6px;", "background-color: #39185A;padding:4px 6px;border-radius:6px;", ...data);
  }
  error(title: string, ...data: any[]) {
    console.error(`%c${this.#name}%c${title}`, "background-color: #39185A;padding:6px;border-radius:6px;font-size:large;margin-right:6px;", "background-color: #39185A;padding:4px 6px;border-radius:6px;", ...data);
  }
};

export const logger = new Logger("VX");