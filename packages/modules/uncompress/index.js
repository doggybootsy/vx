import JSZip from "jszip";

const uncompressJS = {};

/**
 * All rights to https://github.com/Dakedres/asar-peeker
 */
const Asar = (function () {
  const headerSizeIndex = 12,
        headerOffset = 16,
        uInt32Size = 4,
        textDecoder = new TextDecoder('utf-8');

  // Essentially just ripped from the chromium-pickle-js source, thanks for
  // doing my math homework.
  const alignInt = (i, alignment) =>
    i + (alignment - (i % alignment)) % alignment;

  /**
   * 
   * @param {ArrayBuffer} archive Asar archive to open
   * @returns {ArchiveData}
   */
  const openAsar = archive => {
    if(archive.length > Number.MAX_SAFE_INTEGER)
        throw new Error('Asar archive too large.')

      const headerSize = new DataView(archive).getUint32(headerSizeIndex, true),
            // Pickle wants to align the headers so that the payload length is
            // always a multiple of 4. This means you'll get "padding" bytes
            // after the header if you don't round up the stored value.
            //
            // IMO why not just store the aligned int and have us trim the json,
            // but it's whatever.
            headerEnd = headerOffset + headerSize,
            filesOffset = alignInt(headerEnd, uInt32Size),
            rawHeader = archive.slice(headerOffset, headerEnd),
            buffer = archive.slice(filesOffset);

      /**
       * @typedef {Object} ArchiveData
       * @property {Object} header - The asar file's manifest, containing the pointers to each index's files in the buffer
       * @property {ArrayBuffer} buffer - The contents of the archive, concatenated together.
       */
      return {
        header: JSON.parse( textDecoder.decode(rawHeader) ),
        buffer
      }
  };

  const crawlHeader = function self(files, dirname) {
    const prefix = itemName =>(dirname ? dirname + '/' : '') + itemName;

    let children = [];

    for (const filename in files) {
      const extraFiles = files[filename].files;
      
      if(extraFiles) {
        const extra = self(extraFiles, filename);

        children = children.concat(extra);
      }
    
      children.push(filename);
    }

    return children.map(prefix)
  };

  /**
   * These paths must be absolute and posix-style, without a leading forward slash.
   * @typedef {String} ArchivePath
   */

  /**
   * An Asar archive
   * @class
   * @param {ArrayBuffer} archive The archive to open
   */
  class Asar {
    constructor(archive) {
      const { header, buffer } = openAsar(archive);

      this.header = header;
      this.buffer = buffer;
      this.contents = crawlHeader(header);
    }

    /**
     * Retrieves information on a directory or file from the archive's header
     * @param {ArchivePath} path The path to the dirent
     * @returns {Object}
     */
    find(path) {
      const navigate = (currentItem, navigateTo) => {
        if(currentItem.files) {
          const nextItem = currentItem.files[navigateTo];

          if(!nextItem) {
            if(path == '/') // This breaks it lol
              return this.header
            
            throw new PathError(path, `${navigateTo} could not be found.`)
          }

          return nextItem
        } else {        
          throw new PathError(path, `${navigateTo} is not a directory.`)
        }
      };

      return path
        .split('/')
        .reduce(navigate, this.header)
    }

    /**
     * Open a file in the archive
     * @param {ArchivePath} path The path to the file
     * @returns {ArrayBuffer} The file's contents
     */
    get(path) {
      const { offset, size } = this.find(path),
            offsetInt = parseInt(offset);

      return this.buffer.slice(offsetInt, offsetInt + size)
    }
  }

  class PathError extends Error {
    constructor(path, message) {
      super(`Invalid path "${path}": ${message}`);

      this.name = "PathError";
    }
  }

  return Asar;
})();

/**
 * All rights to https://github.com/workhorsy/uncompress.js
 * This is a altered version of that library. For this use case
 */

(() => {
  // Copyright (c) 2017 Matthew Brennan Jones <matthew.brennan.jones@gmail.com>
  // This software is licensed under a MIT License
  // https://github.com/workhorsy/uncompress.js

  "use strict";

  async function loadScript(url, cb) {
    const res = await fetch(url);
    const text = `(() => {\n${await res.text()}\nif(typeof readRARFileNames!=="undefined"){window.readRARFileNames=readRARFileNames;window.readRARContent=readRARContent;}\n})();`;

    const blob = new Blob([ text ], { type: "application/javascript" });
    const link = URL.createObjectURL(blob);
    
    const script = document.createElement('script');
    script.type = "application/javascript";
    script.src = link;
    script.onload = function() {
      if (cb) cb();
      URL.revokeObjectURL(link);
    };
    document.head.appendChild(script);
  }

  window.unrarMemoryFileLocation = null;
  window.g_on_loaded_cb = null;

  (function() {
    let _loaded_archive_formats = [];

    // FIXME: This function is super inefficient
    function saneJoin(array, separator) {
      let retval = '';
      for (let i=0; i<array.length; ++i) {
        if (i === 0) {
          retval += array[i];
        } else {
          retval += separator + array[i];
        }
      }
      return retval;
    }

    function saneMap(array, cb) {
      let retval = new Array(array.length);
      for (let i=0; i<retval.length; ++i) {
        retval[i] = cb(array[i]);
      }
      return retval;
    }

    function loadArchiveFormats(formats, cb) {
      // Get the path of the current script
      let path = "https://workhorsy.github.io/uncompress.js/js/";
      let load_counter = 0;

      let checkForLoadDone = function() {
        load_counter++;

        // Get the total number of loads before we are done loading
        // If loading RAR in a Window, have 1 extra load.
        let load_total = formats.length;
        if (formats.indexOf('rar') !== -1 && typeof window === 'object') {
          load_total++;
        }

        // run the callback if the last script has loaded
        if (load_counter === load_total) {
          cb();
        }
      };

      g_on_loaded_cb = checkForLoadDone;

      // Load the formats
      formats.forEach(function(archive_format) {
        // Skip this format if it is already loaded
        if (_loaded_archive_formats.indexOf(archive_format) !== -1) {
          return;
        }

        // Load the archive format
        switch (archive_format) {
          case 'rar':
            unrarMemoryFileLocation = path + 'libunrar.js.mem';
            loadScript(path + 'libunrar.js', checkForLoadDone);
            _loaded_archive_formats.push(archive_format);
            break;
          case 'zip':
            checkForLoadDone();
            _loaded_archive_formats.push(archive_format);
            break;
          case 'tar':
            loadScript(path + 'libuntar.js', checkForLoadDone);
            _loaded_archive_formats.push(archive_format);
            break;
          case 'asar':
            checkForLoadDone();
            _loaded_archive_formats.push(archive_format);
            break;
          default:
            throw new Error("Unknown archive format '" + archive_format + "'.");
        }
      });
    }

    function archiveOpenFile(file, password, cb) {
      // Get the file's info
      let blob = file.slice();
      let file_name = file.name;
      password = password || null;

      // Convert the blob into an array buffer
      let reader = new FileReader();
      reader.onload = async function(evt) {
        let array_buffer = reader.result;

        // Open the file as an archive
        try {
          let archive = await archiveOpenArrayBuffer(file_name, password, array_buffer);
          cb(archive, null);
        } catch(e) {
          cb(null, e);
        }
      };
      reader.readAsArrayBuffer(blob);
    }

    async function archiveOpenArrayBuffer(file_name, password, array_buffer) {
      // Get the archive type
      let archive_type = null;
      if (isRarFile(array_buffer)) {
        archive_type = 'rar';
      } else if(isZipFile(array_buffer)) {
        archive_type = 'zip';
      } else if(isTarFile(array_buffer)) {
        archive_type = 'tar';
      } else if(isAsarFile(array_buffer)) {
        archive_type = 'asar';
      } else {
        throw new Error("The archive type is unknown");
      }

      // Make sure the archive format is loaded
      if (_loaded_archive_formats.indexOf(archive_type) === -1) {
        throw new Error("The archive format '" + archive_type + "' is not loaded.");
      }

      // Get the entries
      let handle = null;
      let entries = [];
      try {
        switch (archive_type) {
          case 'rar':
            handle = _rarOpen(file_name, password, array_buffer);
            entries = _rarGetEntries(handle);
            break;
          case 'zip':
            handle = await _zipOpen(file_name, password, array_buffer);
            entries = _zipGetEntries(handle);
            break;
          case 'tar':
            handle = _tarOpen(file_name, password, array_buffer);
            entries = _tarGetEntries(handle);
            break;
          case 'asar':
            handle = _asarOpen(file_name, password, array_buffer);
            entries = _asarGetEntries(handle);
            break;
        }
      } catch(e) {
        console.log(e);
        throw new Error("Failed to open '" + archive_type + "' archive.");
      }

      // Sort the entries by name
      entries.sort(function(a, b) {
        if(a.name < b.name) return -1;
        if(a.name > b.name) return 1;
        return 0;
      });

      // Return the archive object
      return {
        file_name: file_name,
        archive_type: archive_type,
        array_buffer: array_buffer,
        entries: entries,
        handle: handle
      };
    }

    function archiveClose(archive) {
      archive.file_name = null;
      archive.archive_type = null;
      archive.array_buffer = null;
      archive.entries = null;
      archive.handle = null;
    }

    function _rarOpen(file_name, password, array_buffer) {
      // Create an array of rar files
      let rar_files = [{
        name: file_name,
        size: array_buffer.byteLength,
        type: '',
        content: new Uint8Array(array_buffer)
      }];

      // Return rar handle
      return {
        file_name: file_name,
        array_buffer: array_buffer,
        password: password,
        rar_files: rar_files
      };
    }

    function _asarOpen(file_name, password, array_buffer) {
      return {
        file_name,
        array_buffer,
        password,
        asar: new Asar(array_buffer)
      }
    }
    function _asarGetEntries(handle) {    
      const entries = [];
      
      function goDeeper(path, files) {
        for (const filename in files) {
          if (Object.prototype.hasOwnProperty.call(files, filename)) {
            const file = files[filename];
            const is_dir = typeof file.files === "object";

            const name = path === null ? filename : `${path}/${filename}`;
            
            entries.push({
              name,
              is_file: !is_dir,
              size_compressed: file.size || 0,
              size_uncompressed: file.size || 0,
              readData: function(cb) {
                setTimeout(async function() {
                  if (!is_dir) {
                    cb(handle.asar.get(name), null);
                  } else {
                    cb(null, null);
                  }
                }, 0);
              }
            });
    
            if (is_dir) goDeeper(name, file.files);
          }
        }
      }

      goDeeper(null, handle.asar.header.files);

      return entries;
    }

    async function _zipOpen(file_name, password, array_buffer) {
      let zip = new JSZip();

      await zip.loadAsync(array_buffer);
          
      // Return zip handle
      return {
        file_name: file_name,
        array_buffer: array_buffer,
        password: password,
        zip: zip
      };
    }

    function _tarOpen(file_name, password, array_buffer) {
      // Return tar handle
      return {
        file_name: file_name,
        array_buffer: array_buffer,
        password: password
      };
    }

    function _rarGetEntries(rar_handle) {
      // Get the entries
      let info = readRARFileNames(rar_handle.rar_files, rar_handle.password);
      let entries = [];
      Object.keys(info).forEach(function(i) {
        let name = info[i].name;
        let is_file = info[i].is_file;

        entries.push({
          name: name,
          is_file: info[i].is_file,
          size_compressed: info[i].size_compressed,
          size_uncompressed: info[i].size_uncompressed,
          readData: function(cb) {
            setTimeout(function() {
              if (is_file) {
                try {
                  readRARContent(rar_handle.rar_files, rar_handle.password, name, cb);
                } catch (e) {
                  cb(null, e);
                }
              } else {
                cb(null, null);
              }
            }, 0);
          }
        });
      });
      return entries;
    }

    function _zipGetEntries(zip_handle) {
      let zip = zip_handle.zip;

      // Get all the entries
      let entries = [];
      Object.keys(zip.files).forEach(function(i) {
        let zip_entry = zip.files[i];
        let name = zip_entry.name;
        let is_file = ! zip_entry.dir;
        let size_compressed = zip_entry._data ? zip_entry._data.compressedSize : 0;
        let size_uncompressed = zip_entry._data ? zip_entry._data.uncompressedSize : 0;

        entries.push({
          name: name,
          is_file: is_file,
          size_compressed: size_compressed,
          size_uncompressed: size_uncompressed,
          readData: function(cb) {
            setTimeout(async function() {
              if (is_file) {
                let data = await zip_entry.async("arraybuffer")
                cb(data, null);
              } else {
                cb(null, null);
              }
            }, 0);
          }
        });
      });

      return entries;
    }

    function _tarGetEntries(tar_handle) {
      let tar_entries = tarGetEntries(tar_handle.file_name, tar_handle.array_buffer);

      // Get all the entries
      let entries = [];
      tar_entries.forEach(function(entry) {
        let name = entry.name;
        let is_file = entry.is_file;
        let size = entry.size;

        entries.push({
          name: name,
          is_file: is_file,
          size_compressed: size,
          size_uncompressed: size,
          readData: function(cb) {
            setTimeout(function() {
              if (is_file) {
                let data = tarGetEntryData(entry, tar_handle.array_buffer);
                cb(data.buffer, null);
              } else {
                cb(null, null);
              }
            }, 0);
          }
        });
      });

      return entries;
    }

    function isRarFile(array_buffer) {
      // The three styles of RAR headers
      let rar_header1 = saneJoin([0x52, 0x45, 0x7E, 0x5E], ', '); // old
      let rar_header2 = saneJoin([0x52, 0x61, 0x72, 0x21, 0x1A, 0x07, 0x00], ', '); // 1.5 to 4.0
      let rar_header3 = saneJoin([0x52, 0x61, 0x72, 0x21, 0x1A, 0x07, 0x01, 0x00], ', '); // 5.0

      // Just return false if the file is smaller than the header
      if (array_buffer.byteLength < 8) {
        return false;
      }

      // Return true if the header matches one of the RAR headers
      let header1 = saneJoin(new Uint8Array(array_buffer).slice(0, 4), ', ');
      let header2 = saneJoin(new Uint8Array(array_buffer).slice(0, 7), ', ');
      let header3 = saneJoin(new Uint8Array(array_buffer).slice(0, 8), ', ');
      return (header1 === rar_header1 || header2 === rar_header2 || header3 === rar_header3);
    }

    function isZipFile(array_buffer) {
      // The ZIP header
      let zip_header = saneJoin([0x50, 0x4b, 0x03, 0x04], ', ');

      // Just return false if the file is smaller than the header
      if (array_buffer.byteLength < 4) {
        return false;
      }

      // Return true if the header matches the ZIP header
      let header = saneJoin(new Uint8Array(array_buffer).slice(0, 4), ', ');
      return (header === zip_header);
    }

    function isTarFile(array_buffer) {
      // The TAR header
      let tar_header = saneJoin(['u', 's', 't', 'a', 'r'], ', ');

      // Just return false if the file is smaller than the header size
      if (array_buffer.byteLength < 512) {
        return false;
      }

      // Return true if the header matches the TAR header
      let header = saneJoin(saneMap(new Uint8Array(array_buffer).slice(257, 257 + 5), String.fromCharCode), ', ');
      return (header === tar_header);
    }

    function isAsarFile(array_buffer) {
      try {
        new Asar(array_buffer);
        return true;
      } catch (error) {
        return false;
      }
    }

    // Set exports
    uncompressJS.loadArchiveFormats = loadArchiveFormats;
    uncompressJS.archiveOpenFile = archiveOpenFile;
    uncompressJS.archiveOpenArrayBuffer = archiveOpenArrayBuffer;
    uncompressJS.archiveClose = archiveClose;
    uncompressJS.isRarFile = isRarFile;
    uncompressJS.isZipFile = isZipFile;
    uncompressJS.isTarFile = isTarFile;
    uncompressJS.isAsarFile = isAsarFile;
    uncompressJS.saneJoin = saneJoin;
    uncompressJS.saneMap = saneMap;

    Object.assign(window, uncompressJS);
  })();
})();

let loaded = false;
export function archiveOpenFile(file, password, callback) {
  if (loaded) return void uncompressJS.archiveOpenFile(file, password, callback);
  
  uncompressJS.loadArchiveFormats([ "rar", "zip", "tar", "asar" ], () => {
    loaded = true;
    uncompressJS.archiveOpenFile(file, password, callback);
  });
}
export function archiveOpenFileAsync(file, password) {
  return new Promise((resolve, reject) => {
    archiveOpenFile(file, password, (archive, err) => {
      if (err) return reject(err);
      resolve(archive);
    });
  });
}