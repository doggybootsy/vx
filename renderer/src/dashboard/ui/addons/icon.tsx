import webpack from "renderer/webpack";
import { Theme } from "renderer/addons/themes";
import { openImageModal } from "renderer/modal";
import { cache } from "renderer/util";
import { Plugin } from "renderer/addons/plugins";

const getDefaultAvatarURL = cache(() => {
  const module = webpack.getModule<{ getDefaultAvatarURL: () => string }>(m => m.getDefaultAvatarURL)!;
  return () => module.getDefaultAvatarURL();
});
const UserStore = cache(() => webpack.getStore("UserStore")!);

function useIconURL(authorId?: string) {
  const React = webpack.common.React!;

  const icon = React.useMemo(() => {
    if (!authorId) return getDefaultAvatarURL.getter();

    const user = UserStore.getter.getUser(authorId);
    if (!user) return getDefaultAvatarURL.getter();

    return user.getAvatarURL() as string;
  }, [ authorId ]); 

  return icon;
};

const Spinner = cache(() => webpack.common.components!.Spinner as React.FunctionComponent<any>);
export function AddonIcon({ addon, wrapperClassName, spinnerClassName, className }: { addon: Theme | Plugin, wrapperClassName: string, spinnerClassName: string, className: string }) {
  const React = webpack.common.React!;
  const iconURL = useIconURL(addon.meta.authorid);
  const [ loading, setLoading ] = React.useState(true);

  const ref = React.useRef<HTMLDivElement>(null);

  React.useLayoutEffect(() => {
    if (!ref.current) return;
    
    function createImage(src: string) {
      const img = new Image();
      img.src = src;
      
      img.classList.add(className);
      img.addEventListener("click", () => openImageModal(img.src));

      ref.current!.appendChild(img);
      img.addEventListener("load", () => {
        setLoading(false);
        
        ref.current!.appendChild(img);
      });

      return img;
    };

    function doAvatar() {
      createImage(iconURL);
    };

    if (!addon.meta.icon) return doAvatar();

    const img = createImage(addon.meta.icon);
    img.addEventListener("error", () => doAvatar());
  }, [ ]);


  return (
    <div ref={ref} className={wrapperClassName}>
      {loading && (
        <Spinner.getter
          type={(Spinner.getter as any).Type.WANDERING_CUBES}
          className={spinnerClassName}
        />
      )}
    </div>
  )
};