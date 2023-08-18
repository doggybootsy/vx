import { cache } from "renderer/util";
import webpack, { filters } from "renderer/webpack";
import { openModal } from "renderer/modal/actions";
import Components from "renderer/modal/components";

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

const Anchor = cache(() => webpack.common.components!.Anchor);
const ImageModal = cache(() => webpack.getModule<any>(filters.byStrings("MEDIA_MODAL_CLOSE", "Messages.OPEN_IN_BROWSER"), { searchExports: true })!);

export async function openImageModal(src: string | URL) {
  if (src instanceof URL) src = src.href;
  
  if (typeof src !== "string") throw new TypeError(`Argument 'src' must be type 'string' not type '${typeof src}' or be a instance of URL!`);

  const { width, height } = await getImageSize(src);

  return openModal((props) => {
    const React = webpack.common.React!;

    return (
      <Components.ModalRoot
        {...props}
        size={Components.ModalSize.DYNAMIC}
        className="vx-image-modal"
      >
        <ImageModal.getter
          animated={true}
          height={height}
          width={width}
          original={src}
          placeholder={src}
          shouldAnimate={true}
          shouldHideMediaOptions={false}
          src={src}
          renderLinkComponent={Anchor.getter}
        />
      </Components.ModalRoot>
    )
  });
};
