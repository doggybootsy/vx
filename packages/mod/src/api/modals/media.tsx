import { addPlainTextPatch, getProxyByStrings } from "@webpack";
import { ModalProps, openModal } from "./actions";

type ArrayOr<T> = T[] | T;

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

addPlainTextPatch({
  identifier: "VX(image-blob-support)",
  match: "this.unobserveVisibility",
  find: /this\.getSrc/g,
  replace: "$vxi.getSrc.call(this,$&)"
});

interface ItemOptions {
  scale?: number
}

interface BaseItem {
  url: string;
  width: number;
  height: number;
}

interface VideoItem extends BaseItem {
  contentScanMetaData?: undefined;
  contentType: string;
  type: "VIDEO";
}

interface ImageItem extends BaseItem {
  animated: boolean,
  type: "IMAGE"
}

type Item = ImageItem | VideoItem;

const CarouselModal = getProxyByStrings<React.ComponentType<ModalProps & {
  className: string,
  items: Item[],
  shouldHideMediaOptions?: boolean,
  startingIndex?: number,
  onIndexChange?(index: number): void,
}>>([ ".Messages.MEDIA_VIEWER_MODAL_ALT_TEXT" ]);

interface MediaModalOptions {
  shouldHideMediaOptions?: boolean,
  startingIndex?: number,
  onIndexChange?(index: number): void
}

async function makeItem(src: string | URL, options?: ItemOptions): Promise<Item> {
  if (src instanceof URL) src = src.href;

  src = new URL(src, location.href);
  const { scale = 1 } = Object.assign({}, options);

  const isImage = /\.(png|jpe?g|webp|gif|heic|heif|dng)$/i.test(src.pathname);
  const videoFileType = /\.(mp4|webm|mov)$/i.exec(src.pathname)?.[1];
  const isAnimated =  !!videoFileType || /\.(webp|gif)$/i.test(src.pathname);

  if (isImage) {
    const { height, width } = await getImageSize(src.href);

    return {
      width: width * scale,
      height: height * scale,
      url: src.href,
      animated: isAnimated,
      type: "IMAGE"
    };
  }

  const { height, width } = await getVideoDetails(src.href);
  
  let contentType: string;

  if (videoFileType === "mp4") contentType = "video/mp4";
  if (videoFileType === "webm") contentType = "video/webm";
  if (videoFileType === "mov") contentType = "video/quicktime";

  return {
    type: "VIDEO",
    url: src.href,
    width: width * scale,
    height: height * scale,
    contentType: contentType!
  }
}

function openMediaModal(items: ArrayOr<Item>, options?: MediaModalOptions) {
  if (!Array.isArray(items)) items = [ items ];

  items = items.map((item) => ({
    ...item,
    original: item.url,
    proxyUrl: item.url.replace("https://cdn.discordapp.com/attachments/", "https://media.discordapp.net/attachments/"),
    srcIsAnimated: false,
    contentScanMetadata: undefined
  }));  
  

  return openModal((props) => (
    <CarouselModal 
      {...props}
      className="vx-carousel-modal"
      items={items}
      shouldHideMediaOptions={options?.shouldHideMediaOptions}
      onIndexChange={options?.onIndexChange}
      startingIndex={options?.startingIndex}
    />
  ))
}

function isItem(item: any): item is Item {
  if (item?.type === "IMAGE" || item?.type === "VIDEO") return true; 
  return false;
}

openMediaModal.makeItem = makeItem;
openMediaModal.auto = async (media: ArrayOr<string | URL | Item>, options?: ItemOptions) => {
  if (!Array.isArray(media)) media = [ media ];

  const items = await Promise.all(
    media.map((media) => isItem(media) ? media : makeItem(media, options))
  );

  openMediaModal(items, { shouldHideMediaOptions: true });
}

// Wrappers for openMediaModal
async function openImageModal(images: ArrayOr<string | URL>, options?: ItemOptions) {
  if (!Array.isArray(images)) images = [ images ];

  const items = await Promise.all(
    images.map((image) => makeItem(image, options))
  );

  for (const item of items) {
    if (item.type === "IMAGE") continue;
    throw new Error("src is not a image!");
  }

  return openMediaModal(items, { shouldHideMediaOptions: true });
}
async function openVideoModal(videos: ArrayOr<string | URL>, options?: ItemOptions) {
  if (!Array.isArray(videos)) videos = [ videos ];

  const items = await Promise.all(
    videos.map((video) => makeItem(video, options))
  );

  for (const item of items) {
    if (item.type === "VIDEO") continue;
    throw new Error("src is not a video!");
  }


  return openMediaModal(items, { shouldHideMediaOptions: true });
}


export { openMediaModal, openImageModal, openVideoModal };
