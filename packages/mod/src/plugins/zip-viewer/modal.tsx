import { ModalComponents, ModalProps, openCodeModal, openImageModal, openVideoModal } from "../../api/modals";
import JSZip from "jszip";
import { useAbortEffect } from "../../hooks";
import { Fragment, useRef, useState } from "react";
import { Button, Flex, Icons, Spinner, Tooltip } from "../../components";
import { getProxyByKeys } from "../../webpack";
import { className, download, getParents } from "../../util";

interface ZipModalProps extends ModalProps {
  src: string
};

type FileTypeDir = { children: { [key in string]: FileType }, name: string, dir: true, path: string };
type FileTypeFile = { name: string, dir: false, file: JSZip.JSZipObject, path: string, is: { image: boolean, video: boolean, code: boolean } };
type FileType = FileTypeDir | FileTypeFile;

const mediaFileUtils = getProxyByKeys<{ isImageFile(name: string): boolean, isVideoFile(name: string): boolean }>([ "isImageFile", "isVideoFile" ]);
const textFileUtils = getProxyByKeys<{ isPlaintextPreviewableFile(name: string): boolean }>([ "isPlaintextPreviewableFile" ]);
const scrollerClasses = getProxyByKeys([ "thin", "customTheme" ]);

const Components = getProxyByKeys([ "FormSwitch", "Button" ]);

function ZipFile({ file, onClick, disabled, selected, onSelect, onDownload }: { file: FileType, onClick(): void, disabled?: boolean, selected?: boolean, onSelect?(state: boolean): void, onDownload?(): void }) {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div className={className([ "vx-zip-file", disabled && "vx-zip-disabled" ])} onClick={(event) => {
      if (disabled) return;
      if (!(event.target instanceof Element)) return;
      if (getParents(event.target).includes(ref.current!)) return;

      onClick();
    }}>
      <div className="vx-zip-type">
        {file.dir ? (
          <Icons.Folder />
        ) : file.is.image ? (
          <Icons.Image />
        ) : file.is.video ? (
          <Icons.Movie />
        ) : (
          <Icons.File />
        )}
      </div>
      <div className="vx-zip-name">{file.name}</div>
      <div
        className="vx-zip-actions"
        ref={ref}
      >
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
            <Components.Checkbox 
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
};

function sort(a: FileType, b: FileType) {
  if (a.dir && b.dir) return a.name.localeCompare(b.name);
  if (a.dir) return -1;
  if (b.dir) return 1;

  return a.name.localeCompare(b.name);
};

export function ZipModal(props: ZipModalProps) {
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
  };

  useAbortEffect(async (signal) => {
    const res = await fetch(props.src, { cache: "force-cache" });
    if (signal.aborted) return;
    const blob = await res.blob();
    if (signal.aborted) return;
    const zip = await new JSZip().loadAsync(blob);
    if (signal.aborted) return;
    
    const files: Record<string, FileType> = {};

    for (const filename in zip.files) {
      if (Object.prototype.hasOwnProperty.call(zip.files, filename)) {
        const file = zip.files[filename];
        
        const split = filename.split("/").filter(Boolean);
        let level = files;

        for (const index in split) {
          if (Object.prototype.hasOwnProperty.call(split, index)) {
            const key = split[index];
            const last = (Number(index) + 1) === split.length;

            const path = split.slice(0, Number(index)).join("/");            
            
            if (last && !file.dir) {
              level[key] = {
                dir: false,
                name: key,
                file: file,
                path,
                is: {
                  image: mediaFileUtils.isImageFile(key),
                  video: mediaFileUtils.isVideoFile(key),
                  code: textFileUtils.isPlaintextPreviewableFile(key)
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
    }

    setFiles(files);
    setViewingFiles(files);
  });
  
  return (
    <ModalComponents.ModalRoot
      transitionState={props.transitionState}
      size={ModalComponents.ModalSize.MEDIUM}
    >
      <ModalComponents.ModalHeader separator={false} justify={Flex.Justify.BETWEEN}>
        <div className="vx-modal-title">
          Zip Viewer
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
              >{props.src.split("/").at(-1)!.split("?").at(0)}</span>
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
                    <div className="vx-zip-message">Folder Is Empty</div>
                  </div>
                ) : Object.values(viewingFiles).sort(sort).map((file: FileType) => (
                  <ZipFile
                    file={file}
                    onClick={async () => {
                      if (!file.dir) {
                        if (file.is.code) {
                          openCodeModal({
                            filename: file.name,
                            code: await file.file.async("text"),
                            language: file.name.split(".").at(-1)!
                          });
                        }
                        if (file.is.image || file.is.video) {
                          const data = await file.file.async("uint8array");
                          const url = URL.createObjectURL(new Blob([ data ]));

                          if (file.is.image) openImageModal(url);
                          else openVideoModal(url);

                          // 1 minute and then revoke the url. If its not loaded by now idk
                          setTimeout(() => {
                            URL.revokeObjectURL(url);
                          }, 1000 * 60);
                        }

                        return;
                      };

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
                              };

                              zip.file(name, element.file.async("uint8array"));
                            }
                          }
                        };
                        deep(file.children, "");

                        const data = await zip.generateAsync({ type: "uint8array" });
                        if (data) download(`${file.name}.zip`, data);

                        return;
                      };

                      const data = await file.file.async("uint8array");
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
                  };

                  zip.file(name, element.file.async("uint8array"));
                }
              }
            };
            
            deep(files, "");

            const data = await zip.generateAsync({ type: "uint8array" });
            if (data) download(`zip-viewer-${Date.now().toString(36)}.zip`, data);
          }}
        >Download All</Button>
      </ModalComponents.ModalFooter>
    </ModalComponents.ModalRoot>
  )
};