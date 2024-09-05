import { ContextMenu } from "./context-menu";
import { Patcher } from "./patcher";

const contextMenuApi = new ContextMenu();

const bounded = new Map<string, BdApi>();

export class BdApi {
  #name!: string;
  constructor(name: string) {
    // @ts-expect-error
    if (!name) return BdApi;
    if (bounded.has(name)) return bounded.get(name)!;
    
    this.#name = name;
    bounded.set(name, this);

    this.Patcher = new Patcher(name);
  }
  
  static readonly ContextMenu = contextMenuApi;
  readonly ContextMenu = contextMenuApi;
  static readonly Patcher = Patcher;
  readonly Patcher!: Patcher;

}
