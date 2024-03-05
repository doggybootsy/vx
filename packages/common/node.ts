export function replaceNodeModuleExports(id: string, newExports: any) {
  const resolved = require.resolve(id);
  const cache = require.cache[resolved];

  if (!cache) throw new Error("Module does not exist or has not been cached!");
  
  delete cache.exports;
  cache.exports = newExports;
}
