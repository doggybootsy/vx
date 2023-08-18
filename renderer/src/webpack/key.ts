import { getLazy } from "renderer/webpack/lazy";
import { getModule } from "renderer/webpack/searching";
import { moduleFilter, module } from "renderer/webpack/types";

export function getModuleAndKey(filter: moduleFilter): [ any, string ] | void {
  let $module: module | undefined;
  const item = getModule((exported, module, id) => {
    // You can't patch 'module.exports' since whatever using it all ready has that value cached
    if (exported === module.exports) return;
    if (!filter(exported, module, id)) return;

    $module = module;
    return true;
  }, { searchExports: true });
  if (!item || !$module) return;

  return [
    $module.exports,
    // @ts-expect-error ts weirdness
    Object.keys($module.exports).find(k => $module.exports[k] === item)
  ];
};

export async function getLazyAndKey(filter: moduleFilter, signal?: AbortSignal): Promise<[ any, string ]> {
  let $module: module;

  const item = await getLazy((exported, module, id) => {
    // You can patch 'module.exports' but if its not first run you can't
    if (exported === module.exports) return;
    if (!filter(exported, module, id)) return;

    $module = module;
    return true;
  }, { signal, searchExports: true });

  return [ 
    //@ts-expect-error
    $module.exports, 
    //@ts-expect-error
    Object.keys($module.exports).find(k => $module.exports[k] === item)
  ];
};