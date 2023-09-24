import fs from "node:fs";
import path from "node:path";

const STORAGE_DIRECTORY = path.join(__dirname, "..", "storage");

const cache = new Map<string, Record<string, any>>();
export function getAll(id: string): Record<string, any> {
  id = path.basename(id);

  const filePath = path.join(STORAGE_DIRECTORY, id);

  if (cache.has(id)) return cache.get(id)!;

  if (!fs.existsSync(STORAGE_DIRECTORY)) fs.mkdirSync(STORAGE_DIRECTORY);

  let data: Record<string, any> = { };
  
  if (fs.existsSync(filePath)) {
    try { data = JSON.parse(fs.readFileSync(filePath, "binary")); } 
    catch (error) { };
  };

  cache.set(id, data);

  return data;
};

function saveData(id: string) {
  if (!fs.existsSync(STORAGE_DIRECTORY)) fs.mkdirSync(STORAGE_DIRECTORY);

  const filePath = path.join(STORAGE_DIRECTORY, id);
  const data = getAll(id);

  const stringedData = JSON.stringify(data, null, "\t");

  fs.writeFile(filePath, stringedData, (err) => {
    if (!err) return;

    console.error(`[VX~Storage]: Error when saving storage for '${id}'\n`, err);
  });
};

export function setItem(id: string, key: string, value: string) {
  const data = getAll(id);

  data[key] = JSON.parse(value);

  saveData(id);
};
export function deleteItem(id: string, key: string) {
  const data = getAll(id);

  delete data[key];

  saveData(id);
};
export function getItem(id: string, key: string) {
  const data = getAll(id);

  return data[key];
};
export function hasItem(id: string, key: string) {
  const data = getAll(id);

  return key in data;
};
export function clearCache(id?: string) {
  if (typeof id === "string") {
    cache.delete(id);
    return;
  };

  cache.clear();
};