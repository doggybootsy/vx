import { useCallback, useMemo, useState } from "react";
import { internalDataStore } from "../../../api/storage";
import { createPersistence, InternalStore, Persistence } from "../../../util";

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

type Pages = "plugins" | "themes" | "extensions" | "community-themes";

type DataType = Partial<Record<Pages, string>>;

class QueryStore extends InternalStore {
  constructor() {
    super();

    this.persistence = createPersistence(this.getName());
    if (this.persistence.has()) this.#data = this.persistence.get()!;
  }

  private persistence: Persistence<DataType>;

  public isPreserving() {
    return internalDataStore.get("preserve-query") ?? true;
  }

  #data: DataType = {};

  private updateData(cb: (data: DataType) => void) {
    const data = structuredClone(this.#data!);
    cb(data);

    this.#data = data;
    this.persistence.set(data);
    this.emit();
  }

  public get(page: Pages) {
    if (!this.isPreserving()) return "";
    return this.#data![page] || "";
  }
  public set(page: Pages, query: string) {
    this.updateData((data) => data[page] = query);
  }
  public clear(page: Pages) {
    this.updateData((data) => delete data[page]);
  }

  public use(page: Pages) {
    const [ query, setQuery ] = useState(() => this.get(page));

    const newSetQuery = useCallback((value: string) => {
      setQuery(value);
      this.set(page, value);
    }, [ ]);
    const clear = useCallback(() => {
      setQuery("");
      this.clear(page);
    }, [ ]);

    return [ query, newSetQuery, clear ] as const;
  }
}

export const queryStore = new QueryStore();