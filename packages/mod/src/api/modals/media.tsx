import { ModalComponents } from ".";
import { addPlainTextPatch, byStrings, getMangledProxy, getProxyByKeys, not } from "@webpack";
import { openModal } from "./actions";
import { SystemDesign } from "../../components";

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

const mediaModals = getMangledProxy<{
  VideoModal: React.FunctionComponent<any>,
  ImageModal: React.FunctionComponent<any>
}>(/.zo9.LOADING/, {
  VideoModal: byStrings("mediaLayoutType"),
  ImageModal: byStrings("mediaLayoutType")
});

addPlainTextPatch({
  identifier: "VX(image-blob-support)",
  match: "this.unobserveVisibility",
  find: /this\.getSrc/g,
  replace: "$vxi.getSrc.call(this,$&)"
});

interface ImageModalOptions {
  scale?: number
}

export async function openImageModal(src: string | URL, options?: ImageModalOptions) {
  const { scale = 1 } = Object.assign({}, options);

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
        <mediaModals.ImageModal
          animated={true}
          height={height * scale}
          width={width * scale}
          original={src}
          placeholder={src}
          shouldAnimate={true}
          shouldHideMediaOptions={false}
          src={src}
          renderLinkComponent={SystemDesign.Anchor}
          renderForwardComponent={() => null}
        />
      </ModalComponents.ModalRoot>
    )
  });
}

interface VideoModalOptions {
  scale?: number,
  poster?: string
}

export async function openVideoModal(src: string | URL, options?: VideoModalOptions) {
  const { scale = 1, poster: posterOption } = Object.assign({}, options);

  if (src instanceof URL) src = src.href;
  
  if (typeof src !== "string") throw new TypeError(`Argument 'src' must be type 'string' not type '${typeof src}' or be a instance of URL!`);

  const { width, height, poster: videoPoster } = await getVideoDetails(src);

  const poster = posterOption || videoPoster;

  return openModal((props) => {
    return (
      <ModalComponents.ModalRoot
        {...props}
        size={ModalComponents.ModalSize.DYNAMIC}
        className="vx-video-modal"
      >
        <mediaModals.VideoModal
          animated={true}
          height={height * scale}
          width={width * scale}
          naturalHeight={height * scale}
          naturalWidth={width * scale}
          fileSize={0}
          fileName={"No File Name"}
          src={src}
          poster={poster}
          renderLinkComponent={SystemDesign.Anchor}
          renderForwardComponent={() => null}
        />
      </ModalComponents.ModalRoot>
    )
  });
};