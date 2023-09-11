import { moduleFilter } from "renderer/webpack/types";

const filters = {
  byStrings(...strings: string[]): (exportedItem: any) => boolean {
    return (exports) => {
      if (typeof exports !== "function") return false;
      const stringed = exports.toString?.() as string | undefined;
      if (!stringed) return false;
      return strings.every((string) => stringed.includes(string));
    };
  },
  byRegexes(...regexes: RegExp[]): (exportedItem: any) => boolean {
    return (exports) => {
      if (typeof exports !== "function") return false;
      const stringed = exports.toString?.() as string | undefined;
      if (!stringed) return false;
      return regexes.every((regex) => regex.test(stringed));
    };
  },
  byKeys(...keys: string[]): (exportedItem: any) => boolean {
    return (exports) => {
      if (!(exports instanceof Object)) return false;
      
      return keys.every((key) => key in exports);
    };
  },
  byPrototypeKeys(...prototypeKeys: string[]): (exportedItem: any) => boolean {
    const filter = filters.byKeys(...prototypeKeys);

    return (exports) => {
      if (!exports.prototype) return false;
      return filter(exports.prototype);
    };
  },
  every(...filters: moduleFilter[]): moduleFilter {
    return (exports, module, id) => {
      for (const filter of filters) {
        if (!filter(exports, module, id)) return false;
      };
      return true;
    }
  },
  not(filter: moduleFilter): moduleFilter {
    return (exports, module, id) => !filter(exports, module, id);
  }
};

export default filters;
