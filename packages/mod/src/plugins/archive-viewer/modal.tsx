import { ModalComponents, ModalProps, openCodeModal, openImageModal, openModal, openVideoModal } from "../../api/modals";
import JSZip from "jszip";
import { useAbortEffect } from "../../hooks";
import { Fragment, useMemo, useState } from "react";
import { Button, Flex, Icons, SystemDesign, Spinner, Tooltip } from "../../components";
import { getMangledProxy, getProxyByKeys } from "@webpack";
import { className, download, getParents } from "../../util";
import { archiveOpenFileAsync } from "vx:uncompress";
import { isArchive } from ".";
import { Messages } from "vx:i18n";

interface ZipModalProps extends ModalProps {
  src: string | File
};

interface GetContent extends Function {
  (type: "text"): Promise<string>,
  (type: "uint8array"): Promise<Uint8Array>,
  (type: "blob"): Promise<Blob>
}

type FileTypeDir = { children: { [key in string]: FileType }, name: string, dir: true, path: string };
type FileTypeFile = { name: string, dir: false, getContent: GetContent, path: string, is: { image: boolean, video: boolean, code: boolean, zip: boolean } };
type FileType = FileTypeDir | FileTypeFile;

const textFileUtils = getMangledProxy<{ isPlaintextPreviewableFile: (name: string) => boolean, plaintextPreviewableFiles: Set<string> }>('"powershell","ps","ps1"', {
  plaintextPreviewableFiles: (m) => m instanceof Set,
  isPlaintextPreviewableFile: (m) => m instanceof Function
});

const isVideoFile = (file: string) => /\.(mp4|mov)$/i.test(file.split("?")[0]);
const isImageFile = (file: string) => /\.(png|jpe?g|webp|gif|heic|heif|dng)$/i.test(file.split("?")[0]);

const scrollerClasses = getProxyByKeys([ "thin", "customTheme" ]);

function ZipFile({ file, onClick, disabled, selected, onSelect, onDownload }: { file: FileType, onClick(): void, disabled?: boolean, selected?: boolean, onSelect?(state: boolean): void, onDownload?(): void }) {
  return (
    <div 
      className={className([ "vx-zip-file", disabled && "vx-zip-disabled" ])} 
      onClick={(event) => {
        if (disabled) return;
        if (!(event.target instanceof Element)) return;
        if (event.target.matches(".vx-zip-actions") || getParents(event.target).querySelector(".vx-zip-actions")) return;

        onClick();
      }}
    >
      <div className="vx-zip-type">
        {file.dir ? (
          <Icons.Folder />
        ) : file.is.image ? (
          <Icons.Image />
        ) : file.is.video ? (
          <Icons.Movie />
        ) : file.is.zip ? (
          <Icons.ZIP />
        ) : (
          <Icons.File />
        )}
      </div>
      <div className="vx-zip-name">{file.name}</div>
      <div className="vx-zip-actions">
        {file.name !== ".." && (
          <>
            <Tooltip text="Download">
              {(props) => (
                <div
                  {...props}
                  className="vx-zip-action"
                  onClick={async () => {
                    if (disabled) return;

                    onDownload!();
                    props.onClick();
                  }}
                >
                  <Icons.Download size={20} />  
                </div>
              )}
            </Tooltip>
            <SystemDesign.Checkbox 
              value={selected}
              type="inverted"
              onChange={(event: React.ChangeEvent, newState: boolean) => {
                onSelect!(newState);
              }}
            />
          </>
        )}
      </div>
    </div>
  )
}

function sort(a: FileType, b: FileType) {
  if (a.dir && b.dir) return a.name.localeCompare(b.name);
  if (a.dir) return -1;
  if (b.dir) return 1;

  return a.name.localeCompare(b.name);
}

export function openZipModal(src: string | File | Blob) {
  if (src instanceof Blob && !(src instanceof File)) {
    src = new File([ src ], "archive.zip");
  };

  openModal((modalProps) => <ZipModal {...modalProps} src={src as File | string} />);
}

function ZipModal(props: ZipModalProps) {
  const [ error, setError ] = useState<Error | null>(null);
  const [ files, setFiles ] = useState<null | Record<string, FileType>>(null);
  const [ viewingFiles, setViewingFiles ] = useState<null | Record<string, FileType>>(null);
  const [ path, setPath ] = useState("");
  const [ selected, setSelected ] = useState<string[]>([]);

  function showFiles(view: FileTypeDir | null) {
    setViewingFiles(view ? view.children : files);
    
    if (!view) setPath("");
    else if (view.path.length) setPath(`${view.path}/${view.name}`);
    else setPath(view.name);

    setSelected([ ]);
  }

  useAbortEffect(async (signal) => {
    let file: File;
    if (typeof props.src === "string") {
      try {
        const filename = props.src.split("/").at(-1)!.split("?").at(0)!;

        if (window.VXExtension?.fetchArrayBuffer) {
          const buffer = await window.VXExtension.fetchArrayBuffer(props.src);
          if (signal.aborted) return;
          file = new File([ buffer ], filename);
        }
        else {
          const blob = await request.blob(props.src, { cache: "force-cache" });
          if (signal.aborted) return;
          file = new File([ blob.blob ], filename);
        }
      } catch (error) {
        setError(error as Error);
        return;
      }
    }
    else file = props.src;

    try {
      const archive = await archiveOpenFileAsync(file, "");
      if (signal.aborted) return;
  
      const files: Record<string, FileType> = {};
  
      for (const file of archive.entries) {      
        const split = file.name.split("/").filter(Boolean);
        let level = files;
  
        for (const index in split) {
          if (Object.prototype.hasOwnProperty.call(split, index)) {
            const key = split[index];
            const last = (Number(index) + 1) === split.length;
  
            const path = split.slice(0, Number(index)).join("/");            
            
            if (last && file.is_file) {
              level[key] = {
                dir: false,
                name: key,
                getContent(type) {
                  return new Promise<any>((resolve) => {
                    file.readData((archive) => {
                      if (type === "uint8array") return resolve(new Uint8Array(archive));
                      if (type === "text") {
                        const decoder = new TextDecoder();
                        return resolve(decoder.decode(archive));
                      }
                      if (type === "blob") return resolve(new Blob([ new Uint8Array(archive) ]));
                    });
                  });
                },
                path,
                is: {
                  image: isImageFile(key),
                  video: isVideoFile(key),
                  code: textFileUtils.isPlaintextPreviewableFile(key),
                  zip: isArchive(key)
                }
              };
            }
            else if (key in level && level[key].dir) {
              const dir = level[key];
              if (dir.dir) level = dir.children;
            }
            else {
              const dir: FileType = {
                dir: true,
                children: Object.create(null),
                name: key,
                path
              };
  
              level[key] = dir;
              level = dir.children;
            }
          }
        }
      }
  
      setFiles(files);
      setViewingFiles(files);
    } 
    catch (error) {
      setError(error as Error);
    }
  }, [ ]);

  const name = useMemo(() => {
    if (typeof props.src === "string") return props.src.split("/").at(-1)!.split("?").at(0)!;
    return props.src.name;
  }, [ ]);
  
  return (
    <ModalComponents.ModalRoot
      transitionState={props.transitionState}
      size={ModalComponents.ModalSize.MEDIUM}
    >
      <ModalComponents.ModalHeader separator={false} justify={Flex.Justify.BETWEEN}>
        <div className="vx-modal-title">
          {Messages.ZIP_VIEWER}
        </div>
        <ModalComponents.ModalCloseButton onClick={props.onClose} />
      </ModalComponents.ModalHeader>
      <ModalComponents.ModalContent className="vx-zip-content">
        {viewingFiles ? (
          <>
            <div className={className([ "vx-zip-path", scrollerClasses.thin, scrollerClasses.fade ])}>
              <span 
                className="vx-zip-selector"
                onClick={() => {
                  setViewingFiles(files);
                  
                  setPath("");
                }}
              >{name}</span>
              {path.split("/").map(($path, i) => (
                <Fragment key={`path-${$path}-${i}`}>
                  <span className="vx-zip-sep">/</span>
                  <span 
                    className="vx-zip-selector"
                    onClick={() => {
                      const paths = path.split("/").slice(0, i + 1);

                      let view: FileTypeDir | null = null;
                      for (const key of paths) {
                        if (view) view = view.children[key] as FileTypeDir;
                        else view = files![key] as FileTypeDir;
                      }

                      showFiles(view);
                    }}
                  >{$path}</span>
                </Fragment>
              ))}
            </div>
            <div className="vx-zip-back">
              <ZipFile 
                file={{ name: "..", dir: true } as FileType}
                disabled={path.length === 0}
                onClick={() => {
                  let view: FileTypeDir | null = null;
                  for (const key of path.split("/").slice(0, -1)) {
                    if (view) view = view.children[key] as FileTypeDir;
                    else view = files![key] as FileTypeDir;
                  }
    
                  showFiles(view);
                }}
              />
            </div>
            <div className="vx-zip-body">
              {
                !Object.keys(viewingFiles).length ? (
                  <div className="vx-zip-wrapper">
                    <img className="vx-zip-empty" src="/assets/b5eb2f7d6b3f8cc9b60be4a5dcf28015.svg" draggable={false} />
                    <div className="vx-zip-message">{Messages.FOLDER_IS_EMPTY}</div>
                  </div>
                ) : Object.values(viewingFiles).sort(sort).map((file: FileType) => (
                  <ZipFile
                    file={file}
                    onClick={async () => {
                      if (!file.dir) {
                        if (file.is.code) {
                          openCodeModal({
                            filename: file.name,
                            code: await file.getContent("text"),
                            language: file.name.split(".").at(-1)!
                          });
                        }
                        if (file.is.image || file.is.video) {
                          const data = await file.getContent("uint8array");
                          const url = URL.createObjectURL(new Blob([ data ]));                          

                          if (file.is.image) openImageModal(url);
                          else openVideoModal(url);

                          // 1 minute and then revoke the url. If its not loaded by now idk
                          setTimeout(() => {
                            URL.revokeObjectURL(url);
                          }, 1000 * 60);
                        }
                        if (file.is.zip) {
                          const blob = await file.getContent("blob");
                          
                          openZipModal(new File([ blob ], file.name));
                        }

                        return;
                      }

                      showFiles(file);
                    }}
                    onDownload={async () => {
                      if (file.dir) {
                        const zip = new JSZip();
                        
                        function deep(files: Record<string, FileType>, path?: string) {
                          for (const key in files) {
                            if (Object.prototype.hasOwnProperty.call(files, key)) {
                              const element = files[key];
                              const name = path ? `${path}/${element.name}` : element.name;
                              
                              if (element.dir) {
                                deep(element.children, name);
                                continue;
                              }

                              zip.file(name, element.getContent("uint8array"));
                            }
                          }
                        }

                        deep(file.children, "");

                        const data = await zip.generateAsync({ type: "uint8array" });
                        if (data) download(`${file.name}.zip`, data);

                        return;
                      }

                      const data = await file.getContent("uint8array");
                      download(file.name, data);
                    }}
                    onSelect={(state) => {
                      const filtered = selected.filter((name) => name !== file.name);

                      if (state) filtered.push(file.name);

                      setSelected(filtered);
                    }}
                    selected={selected.includes(file.name)}
                    key={`zipfile-${file.path}/${file.name}`} 
                  />
                ))
              }
            </div>
            <div style={{ margin: 4 }} />
          </>
        ) : error ? (
          <div>
            {String(error)}
          </div>
        ) : (
          <div className="vx-zip-spinner">
            <Spinner />
          </div>
        )}
      </ModalComponents.ModalContent>
      <ModalComponents.ModalFooter>
        <Button
          disabled={selected.length === 0}
          onClick={async () => {
            const files: Record<string, FileType> = {};
            for (const key of selected) {
              files[key] = viewingFiles![key];
            }

            const zip = new JSZip();

            function deep(files: Record<string, FileType>, path?: string) {
              for (const key in files) {
                if (Object.prototype.hasOwnProperty.call(files, key)) {
                  const element = files[key];
                  const name = path ? `${path}/${element.name}` : element.name;
                  
                  if (element.dir) {
                    deep(element.children, name);
                    continue;
                  }

                  zip.file(name, element.getContent("uint8array"));
                }
              }
            }
            
            deep(files, "");

            const data = await zip.generateAsync({ type: "uint8array" });
            if (data) download(`zip-viewer-${Date.now().toString(36)}.zip`, data);
          }}
        >{Messages.DOWNLOAD_SELECTED}</Button>
      </ModalComponents.ModalFooter>
    </ModalComponents.ModalRoot>
  )
}