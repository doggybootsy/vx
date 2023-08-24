import { AddonMeta } from "common";
import native from "renderer/native";
import { getItem, setItem } from "renderer/storage";
import Store from "renderer/store";
import { readMeta } from "renderer/addons/common";

// Allow cross compat with bd themes
const FILE_REGEX = /\.(vx|theme)\.css$/;
const THEMES_DIRECTORY = native.path.join(native.dirname, "..", "themes");

export const themesElement = document.createElement("vx-themes");

function saveEnabledState(addonId: string, enabled: boolean) {
  let enabledPlugins = new Set<string>(getItem("vx", "enabled-themes", [ ] as string[]));

  if (enabled) enabledPlugins.add(addonId);
  else enabledPlugins.delete(addonId);

  setItem("vx", "enabled-themes", Array.from(enabledPlugins));
};

export class Theme extends Store {
  #meta: AddonMeta;

  #enabled: boolean;
  #css: string;
  #id: string;
  #initializedTimeStamp = Date.now().toString(32);

  get type() { return "theme" as const; };

  get meta() {
    if (!Object.isFrozen(this.#meta)) Object.freeze(this.#meta); 
    return this.#meta;
  };
  get id() { return this.#id; };
  get enabled() { return this.#enabled; };
  get filepath() { return native.path.join(THEMES_DIRECTORY, this.id); };
  get contents() { return this.#css; };
  get initializedTimeStamp() { return this.#initializedTimeStamp; };

  constructor(file: string) {
    super();

    this.#id = file;

    const enabledThemes = getItem("vx", "enabled-themes", [ ] as string[]);

    const enabled = enabledThemes.includes(file);
    this.#enabled = false;

    const data = native.readFile(native.path.join(THEMES_DIRECTORY, file));
    this.#css = data;

    const meta = readMeta(data);
    this.#meta = meta;

    if (enabled) this.enable();
  };

  is(addonId: string) {
    if (this.#meta.name === addonId) return true;
    if (this.#id === addonId) return true;
    return false;
  };
  enable() {
    if (this.#enabled) return;
    this.#enabled = true;
    saveEnabledState(this.#id, true);

    const style = document.createElement("style");
    style.innerHTML = `${this.#css}\n/*# sourceURL=vx://VX/themes/${this.id} */`;
    style.setAttribute("data-vx-theme-id", this.#id);

    themesElement.append(style);

    this.emit();
  };
  disable() {
    if (!this.#enabled) return;
    this.#enabled = false;
    saveEnabledState(this.#id, false);

    const node = themesElement.querySelector(`[data-vx-theme-id="${this.#id}"]`);
    if (node) node.remove();
    
    this.emit();
  };
  toggle() {
    if (this.#enabled) this.disable();
    else this.enable();
  };
};

class ThemeManager extends Store {
  #themes = new Map<string, Theme>();

  initialize() {
    if (!native.exists(THEMES_DIRECTORY)) native.mkdir(THEMES_DIRECTORY);

    const files = native.readDir(THEMES_DIRECTORY);

    for (const filename of files.filter((file) => FILE_REGEX.test(file))) 
      this.#themes.set(filename, new Theme(filename));
    
    native.watch(THEMES_DIRECTORY, (filename, action) => {
      if (!FILE_REGEX.test(filename)) return;

      if (action === "deleted") {
        const theme = this.#themes.get(filename);
        if (theme) theme.disable();

        this.#themes.delete(filename);
        this.emit();
      };
      if (action === "change") {
        this.reload(filename);
      };
    });

    this.emit();
  };
  reload(addonId: string) {
    const theme = this.get(addonId);

    let id: string;

    let enabled = false;
    if (theme) {
      enabled = theme.enabled;
      theme.disable();
      id = theme.id;
    }
    else {
      if (!FILE_REGEX.test(addonId)) throw new TypeError(`Addon id '${addonId}' doesn't match expression '${FILE_REGEX.source}'!`);
      id = addonId;
    }

    this.#themes.delete(id);

    const exists = native.exists(native.path.join(THEMES_DIRECTORY, id));

    if (!exists) return this.emit();;

    const newTheme = new Theme(id);
    if (enabled) newTheme.enable();
    this.#themes.set(id, newTheme);

    this.emit();
  };

  get(addonId: string) {
    for (const theme of this.#themes.values())
      if (theme.is(addonId)) return theme;
  };
  getAll() {
    return Array.from(this.#themes.values());
  };
  enable(addonId: string) {
    const theme = this.get(addonId);
    if (!theme) return;
    theme.enable();
  };
  disable(addonId: string) {
    const theme = this.get(addonId);
    if (!theme) return;
    theme.disable();
  };
  toggle(addonId: string) {
    const theme = this.get(addonId);
    if (!theme) return;
    theme.toggle();
  };
  isEnabled(addonId: string) {
    const theme = this.get(addonId);
    if (!theme) return;
    return theme.enabled;
  };
};

const themeManager = new ThemeManager();

export default themeManager;