declare namespace UncrompressJS {
  export interface Entry {
    is_file: boolean,
    name: string,
    readData(cb: Callback<ArrayBuffer>): void,
    size_compressed: number,
    size_uncompressed: number
  }
  
  export interface Archive {
    archive_type: string,
    entries: Entry[]
  }
  
  export interface Callback<T> extends Function {
    (archive: T, err: Error | null): void
  }
}

export type Entry = UncrompressJS.Entry;
export type Archive = UncrompressJS.Archive;
export type Callback<T> = UncrompressJS.Callback<T>;

export function archiveOpenFile(file: File, password: string, callback: Callback<Archive>): void;
export function archiveOpenFileAsync(file: File, password: string): Promise<Archive>;