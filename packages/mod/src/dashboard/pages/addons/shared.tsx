import { internalDataStore } from "../../../api/storage";
import { InternalStore } from "../../../util";

export const NO_ADDONS = "/assets/b5eb2f7d6b3f8cc9b60be4a5dcf28015.svg";
export const NO_RESULTS = "/assets/45cd76fed34c8e398cc8.svg";
export const NO_RESULTS_ALT = "/assets/99d35a435f00582ddf41.svg";

export function NoAddons(props: { message: string, img: string }) {
  return (
    <div className="vx-addon-empty-wrapper">
      <div className="vx-addon-empty">
        <img draggable={false} src={props.img} />
        <div className="vx-addon-empty-text">
          {props.message}
        </div>
      </div>
    </div>
  )
}

type Pages = "plugins" | "themes" | "community-themes";

class QueryStore extends InternalStore {
  isPreserving() {
    return internalDataStore.get("preserve-query") ?? true;
  }

  #cache = new Map<Pages, string>();
  get(page: Pages) {
    if (!this.isPreserving()) return "";
    return this.#cache.get(page) ?? "";
  }
  set(page: Pages, query: string) {
    this.#cache.set(page, query);
  }
  clear(page: Pages) {
    this.#cache.set(page, "");
  }
}

export const queryStore = new QueryStore();