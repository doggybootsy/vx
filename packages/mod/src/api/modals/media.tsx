import { ModalComponents } from ".";
import { addPlainTextPatch, getProxyByKeys } from "../../webpack";
import { openModal } from "./actions";

function getImageSize(src: string) {  
  return new Promise<{ height: number, width: number }>((resolve, reject) => {
    const img = new Image();
  
    img.src = src;
    
    img.addEventListener("load", () => {
      resolve({
        height: img.naturalHeight,
        width: img.naturalWidth
      })
    });
    img.addEventListener("error", (event) => {
      reject(event.error);
    });
  });
};
function getVideoDetails(src: string){
  return new Promise<{ height: number, width: number, poster: string }>((resolve, reject) => {
    const video = document.createElement('video');

    video.addEventListener("loadedmetadata", () => {
      const height = video.videoHeight;
      const width = video.videoWidth;

      const canvas = document.createElement("canvas");

      canvas.height = height;
      canvas.width = width;

      const ctx = canvas.getContext("2d")!;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      resolve({ height, width, poster: canvas.toDataURL("image/png") });
    });
    video.addEventListener("error", (event) => {
      reject(event.error);
    });

    video.src = src;
  });
}

const Components = getProxyByKeys<any>([ "Anchor", "ModalRoot" ]);
const mediaModal = getProxyByKeys([ "ImageModal", "VideoModal" ]);

addPlainTextPatch({
  identifier: "VX(image-blob-support)",
  match: "this.unobserveVisibility",
  find: /this\.getSrc/g,
  replace: "window.VX._self.getSrc.call(this,$&)"
});

export async function openImageModal(src: string | URL) {
  if (src instanceof URL) src = src.href;
  
  if (typeof src !== "string") throw new TypeError(`Argument 'src' must be type 'string' not type '${typeof src}' or be a instance of URL!`);

  const { width, height } = await getImageSize(src);

  return openModal((props) => {
    return (
      <ModalComponents.ModalRoot
        {...props}
        size={ModalComponents.ModalSize.DYNAMIC}
        className="vx-image-modal"
      >
        <mediaModal.ImageModal
          animated={true}
          height={height}
          width={width}
          original={src}
          placeholder={src}
          shouldAnimate={true}
          shouldHideMediaOptions={false}
          src={src}
          renderLinkComponent={Components.Anchor}
        />
      </ModalComponents.ModalRoot>
    )
  });
};

export async function openVideoModal(src: string | URL) {
  if (src instanceof URL) src = src.href;
  
  if (typeof src !== "string") throw new TypeError(`Argument 'src' must be type 'string' not type '${typeof src}' or be a instance of URL!`);

  const { width, height, poster } = await getVideoDetails(src);

  return openModal((props) => {
    return (
      <ModalComponents.ModalRoot
        {...props}
        size={ModalComponents.ModalSize.DYNAMIC}
        className="vx-video-modal"
      >
        <mediaModal.VideoModal
          animated={true}
          height={height}
          width={width}
          naturalHeight={height}
          naturalWidth={width}
          fileSize={0}
          fileName={"No File Name"}
          src={src}
          poster={poster}
          renderLinkComponent={Components.Anchor}
        />
      </ModalComponents.ModalRoot>
    )
  });
};