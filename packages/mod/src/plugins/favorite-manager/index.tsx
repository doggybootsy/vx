import { bySource, getLazy, getLazyByKeys, getLazyByProtoKeys, getProxyByStrings } from "@webpack";
import { definePlugin } from "..";
import { Developers } from "../../constants";
import { createAbort } from "../../util";
import { Injector } from "../../patcher";
import { isValidElement } from "react";
import { MenuComponents, closeMenu, openMenu } from "../../api/menu";
import { createSettings, SettingType } from "../settings";
import { Styler } from "vx:styler";
import { Icons } from "../../components";

const styler = new Styler("", "favorite-manager");

// For older browsers
const isHasSupported = cache(() => {
  try { document.querySelector(":has(*)"); return true; }
  catch (e) { return false; }
});

const settings = createSettings("favorite-manager", {
  favoriteAnyImage: {
    type: SettingType.SWITCH,
    default: true,
    title: "Favorite Any Image Type",
    description: "Allows favoriting of other image formats like png's and jpeg's"
  },
  gifPickerMenu: {
    type: SettingType.SWITCH,
    default: true,
    title: "Gif Picker Menu",
    description: "Adds a context menu to GIF's to allow copy and opening the link"
  },
  consistentStarLocation: {
    type: SettingType.SWITCH,
    default: true,
    title: "Consistent Star Location",
    description: "Moves the star to a consistent location everwhere",
    onChange(state) {
      updateCSS();

      if (!plugin.getActiveState()) return;
      if (state) return styler.add();
      styler.remove();
    }
  },
  location: {
    type: SettingType.SELECT,
    choices: [ "left", "right" ] as const,
    default: "left",
    title: "Location",
    disabled: (settings) => isHasSupported() && !settings.consistentStarLocation.get(),
    onChange() {
      updateCSS();
    }
  }
});

let favButton: string;
function updateCSS() {
  styler.replaceCSS(() => {
    if (!settings.consistentStarLocation.get()) return "";
    if (settings.location.get() === "left") return `.${favButton} { right: unset; left: 4px; }`;
    return ".vx-fm-image-accessory { left: unset; right: 6px; } div:has(> .vx-fm-image-accessory) + [class*='hoverButtonGroup_'] { right: unset; left: 4px; }";
  });
}

getLazyByKeys<Webpack.ClassModule<[ "favButton" ]>>([ "favButton", "results" ]).then((classes) => {
  favButton = classes.favButton;
  updateCSS();
});

let IMAGE_GIF_RE: RegExp;

const IMAGE_GIF_RE_NEW = /\.(gif|png|jpe?g|webp)($|\?|#)/i;
const ImageModuleSearch = getLazy<{
  default: { 
    prototype: React.Component<
      { animated: boolean, renderAccessory?: () => React.ReactNode }, 
      { hasMouseOver: boolean, hasFocus: boolean }
    > 
  }
}>(bySource("/\\.gif($|\\?|#)/i"), { searchDefault: false });

const GIFPicker = getLazyByProtoKeys([ "renderGIF" ], { searchExports: true });
const useImageActions = getProxyByStrings<(src: string) => any>([ ".CONTEXT_MENU_LINK_OPENED", ".Messages.OPEN_LINK" ]);

const [ abort, getSignal ] = createAbort();

const injector = new Injector();

function PickerMenu({ src }: { src: string }) {
  const items = useImageActions(src);

  return (
    <MenuComponents.Menu navId="vx-image-actions-gif-item" onClose={closeMenu}>
      {items}
    </MenuComponents.Menu>
  )
}

const plugin = definePlugin({
  authors: [ Developers.doggybootsy ],
  requiresRestart: false,
  settings,
  patches: [
    {
      find: "/\\.gif($|\\?|#)/i",
      replace: "$self.IMAGE_GIF_RE=$&"
    },
    {
      match: ".imageAccessory,",
      find: /(null!=(.{1,3})\?\(0,.{1,3}\.jsx\)\("div",{className):(.{1,3}\.imageAccessory,)(children:\2}\):null)/,
      replace: "$1:$self.makeImageAccessoryClassName($2,$3),$4"
    }
  ],
  icon: Icons.DiscordIcon.from("StarIcon"),

  get IMAGE_GIF_RE() { return IMAGE_GIF_RE; },
  set IMAGE_GIF_RE(value: RegExp) {
    IMAGE_GIF_RE = value;
    
    IMAGE_GIF_RE.test = function() {
      const shouldFavoriteAny = settings.favoriteAnyImage.get() && plugin.getActiveState();
      
      return RegExp.prototype.test.apply(shouldFavoriteAny ? IMAGE_GIF_RE_NEW : this, arguments as unknown as Parameters<RegExp["test"]>);
    }
  },

  makeImageAccessoryClassName(imageAccessory: React.ReactNode, imageAccessoryClassName: string): string {
    if (
      isValidElement(imageAccessory) && settings.consistentStarLocation.get() && 
      typeof imageAccessory.props.className === "string" && imageAccessory.props.className.startsWith("gifFavoriteButton_")
    ) {
      return `${imageAccessoryClassName} vx-fm-image-accessory`;
    }

    return imageAccessoryClassName;
  },

  // remove the 'GIF' from non gif images
  async patchImageModule(signal: AbortSignal) {
    const ImageModule = await ImageModuleSearch;
    
    if (signal.aborted) return;

    injector.after(ImageModule.default.prototype, "render", (that, args, res) => {      
      if (!that.props.animated && isValidElement(res)) {
        res.props.renderAccessory = that.props.renderAccessory;
      }
    });
  },
  // Add context menu to gif picker
  async patchGIFPickerSearchItem(signal: AbortSignal) {
    const GIFPickerSearchItem = await GIFPicker;    

    if (signal.aborted) return;

    injector.after(GIFPickerSearchItem.prototype, "render", (that, args, res) => {
      const url = (that as any).props.item.url;
      (res as React.ReactElement<GetComponentProps<"div">, "div">).props.onContextMenu = (event) => {
        if (!url) return;
        if (!settings.gifPickerMenu.get()) return;

        openMenu(event, () => (
          <PickerMenu src={url} />
        ));
      };
    });
  },

  start() {
    const signal = getSignal();

    this.patchImageModule(signal);
    this.patchGIFPickerSearchItem(signal);

    if (settings.consistentStarLocation.get()) styler.add();
  },
  stop() {
    abort();
    injector.unpatchAll();

    styler.remove();
  }
});