type PrimitiveTypes = "string" | "number" | "bigint" | "boolean" | "symbol" | "undefined" | "object" | "function";

function assertType(item: any, type: PrimitiveTypes) {
  if (typeof item === type) return;
  throw new TypeError(`Typeof value is supposed to be type '${type}' not type '${typeof item}'`);
};

enum Flags {
  STICKY = "y",
  GLOBAL = "g",
  IGNORE_CASE = "i",
  MULTILINE = "m",
  UNICODE = "u",
  SINGLE_LINE = "s"
};

class ERegExp {
  static extend(regex: RegExp | ERegExp) { return new ERegExp(regex.source, regex.flags); };
  static isSame(expression1: ERegExp, expression2: ERegExp) {
    return expression1.source === expression2.source && expression1.flags === expression2.flags;
  };
  static Flags = Object.freeze(Flags);

  #regex: RegExp;
  constructor(source: string, flags: string = "") {
    this.#regex = new RegExp(source, flags);
  };

  get source() { return this.#regex.source; };
  set source(newSource) {
    assertType(newSource, "string");

    this.#regex = new RegExp(newSource, this.flags);
  };
  get flags() { return this.#regex.source; };
  set flags(newFlags) {
    assertType(newFlags, "string");

    this.#regex = new RegExp(this.source, newFlags.toLowerCase());
  };

  public exec(string: string) { return this.#regex.exec(string); };
  public test(string: string) { return this.#regex.test(string); };
  get lastIndex() { return this.#regex.lastIndex; };

  hasFlag(flag: Flags) { return this.flags.includes(flag); };

  get sticky() { return this.flags.includes(Flags.STICKY); };
  set sticky(isSticky: boolean) {
    assertType(isSticky, "boolean");

    let flags = this.flags.replace(Flags.STICKY, "");
    if (isSticky) flags += Flags.STICKY;

    this.flags = flags;
  };
  get global() { return this.flags.includes(Flags.GLOBAL); };
  set global(isGlobal: boolean) {
    assertType(isGlobal, "boolean");

    let flags = this.flags.replace(Flags.GLOBAL, "");
    if (isGlobal) flags += Flags.GLOBAL;

    this.flags = flags;
  };
  get ignoreCase() { return this.flags.includes(Flags.IGNORE_CASE); };
  set ignoreCase(shouldIgnoreCase: boolean) {
    assertType(shouldIgnoreCase, "boolean");

    let flags = this.flags.replace(Flags.IGNORE_CASE, "");
    if (shouldIgnoreCase) flags += Flags.IGNORE_CASE;

    this.flags = flags;
  };
  get unicode() { return this.flags.includes(Flags.UNICODE); };
  set unicode(isUnicode: boolean) {
    assertType(isUnicode, "boolean");

    let flags = this.flags.replace(Flags.UNICODE, "");
    if (isUnicode) flags += Flags.UNICODE;

    this.flags = flags;
  };
  get dotAll() { return this.flags.includes(Flags.SINGLE_LINE); };
  set dotAll(shouldDotAll: boolean) {
    assertType(shouldDotAll, "boolean");

    let flags = this.flags.replace(Flags.SINGLE_LINE, "");
    if (shouldDotAll) flags += Flags.SINGLE_LINE;

    this.flags = flags;
  };

  [Symbol.match](string: string) { return this.#regex[Symbol.match](string); };
  [Symbol.matchAll](string: string) { return this.#regex[Symbol.matchAll](string); };
  [Symbol.replace](string: string, replaceValue: string) { return this.#regex[Symbol.replace](string, replaceValue); };
  [Symbol.search](string: string) { return this.#regex[Symbol.search](string); };
  [Symbol.split](string: string, limit?: number) { return this.#regex[Symbol.split](string, limit); };

  toString() { return String(this.#regex); }
  toRegExp() { return this.#regex; }
  compare(expression: ERegExp) { return ERegExp.isSame(this, expression); };
  clone() { return ERegExp.extend(this); };
  compile(source: string, flags?: string) {
    this.#regex = new RegExp(source, flags);
    return this;
  };
};
